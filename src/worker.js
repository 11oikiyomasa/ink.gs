import { INDEX_HTML, STYLES_CSS, APP_JS } from "./static-content.js";

const MAX_BODY_BYTES = 160 * 1024;
const MAX_PASSWORD_BYTES = 1024;
const SESSION_TTL_SECONDS = 8 * 60 * 60;
const LOGIN_WINDOW_SECONDS = 15 * 60;
const MAX_LOGIN_FAILURES = 5;
const MIN_PASSWORD_HASH_ITERATIONS = 100_000;
const MAX_PASSWORD_HASH_ITERATIONS = 600_000;
const SESSION_COOKIE = "__Host-site-editor-session";
const CSRF_COOKIE = "__Host-site-editor-csrf";
const EDITOR_OWNER = "site-editor";
const MAX_TITLE_LENGTH = 120;
const MAX_SUMMARY_LENGTH = 280;
const MAX_BODY_LENGTH = 120_000;
const MAX_AUTHOR_LENGTH = 80;
const MAX_PUBLICATION_LENGTH = 80;
const MAX_PHOTO_ALT_LENGTH = 180;
const ALLOWED_TOPICS = new Set([
  "Creativity", "Technology", "Travel", "Life", "Health", "Culture", "Writing", "Mindfulness", "Other",
]);
const ALLOWED_PHOTOS = new Set([
  "/assets/city-scenes.jpg",
  "/assets/forest-wellness.jpg",
  "/assets/notebook.jpg",
  "/assets/river-sunset.jpg",
  "/assets/train-journal.jpeg",
  "/assets/writing-garden.jpg",
]);
const encoder = new TextEncoder();

class HttpError extends Error {
  constructor(status, message, headers = {}) {
    super(message);
    this.status = status;
    this.headers = headers;
  }
}

function isRecord(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function jsonResponse(body, status = 200, extraHeaders = {}) {
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store, private",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "X-Frame-Options": "DENY",
    "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
  });
  for (const [name, value] of Object.entries(extraHeaders)) {
    for (const headerValue of Array.isArray(value) ? value : [value]) headers.append(name, headerValue);
  }
  return new Response(JSON.stringify(body), { status, headers });
}

function bundledAssetResponse(request) {
  const pathname = new URL(request.url).pathname;
  let body = null;
  let contentType = "";
  if (pathname === "/index.html" || pathname === "/") {
    body = INDEX_HTML;
    contentType = "text/html; charset=utf-8";
  } else if (pathname === "/styles.css") {
    body = STYLES_CSS;
    contentType = "text/css; charset=utf-8";
  } else if (pathname === "/app.js") {
    body = APP_JS;
    contentType = "application/javascript; charset=utf-8";
  } else {
    return null;
  }
  const headers = new Headers({
    "Content-Type": contentType,
    "Cache-Control": "no-store",
  });
  return secureAssetResponse(new Response(request.method === "HEAD" ? null : body, { status: 200, headers }));
}

function secureAssetResponse(response) {
  const headers = new Headers(response.headers);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "no-referrer");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if ((headers.get("content-type") || "").includes("text/html")) {
    headers.set(
      "Content-Security-Policy",
      "default-src 'self'; img-src 'self' data:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
    );
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  }
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function bytesToHex(bytes) {
  return [...new Uint8Array(bytes)].map((value) => value.toString(16).padStart(2, "0")).join("");
}

function bytesToBase64Url(bytes) {
  let binary = "";
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/u, "");
}

function base64UrlToBytes(value) {
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]+$/u.test(value)) return null;
  try {
    const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
    const binary = atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4));
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
  } catch {
    return null;
  }
}

async function sha256Hex(value) {
  return bytesToHex(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
}

async function hmacHex(secret, value) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return bytesToHex(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
}

function constantTimeTextEqual(left, right) {
  const a = encoder.encode(typeof left === "string" ? left : "");
  const b = encoder.encode(typeof right === "string" ? right : "");
  let mismatch = a.length ^ b.length;
  const length = Math.max(a.length, b.length);
  for (let index = 0; index < length; index++) mismatch |= (a[index] || 0) ^ (b[index] || 0);
  return mismatch === 0;
}

async function verifyPassword(password, encodedHash) {
  if (typeof password !== "string" || encoder.encode(password).byteLength > MAX_PASSWORD_BYTES) return false;
  const parts = typeof encodedHash === "string" ? encodedHash.split("$") : [];
  if (parts.length !== 4 || parts[0] !== "pbkdf2-sha256") return false;
  const iterations = Number(parts[1]);
  const salt = base64UrlToBytes(parts[2]);
  const expected = base64UrlToBytes(parts[3]);
  if (!Number.isSafeInteger(iterations) || iterations < MIN_PASSWORD_HASH_ITERATIONS || iterations > MAX_PASSWORD_HASH_ITERATIONS) return false;
  if (!salt || salt.byteLength < 16 || !expected || expected.byteLength !== 32) return false;
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const actual = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations, hash: "SHA-256" }, key, 256);
  return constantTimeTextEqual(bytesToBase64Url(actual), parts[3]);
}

function originMatches(request, { required = false } = {}) {
  const origin = request.headers.get("Origin");
  if (!origin) return !required;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

function cookieValue(request, name) {
  const cookieHeader = request.headers.get("Cookie") || "";
  for (const segment of cookieHeader.split(";")) {
    const separator = segment.indexOf("=");
    if (separator < 0) continue;
    if (segment.slice(0, separator).trim() === name) return segment.slice(separator + 1).trim();
  }
  return null;
}

function sessionCookie(value, maxAge) {
  return `${SESSION_COOKIE}=${value}; Path=/; Max-Age=${maxAge}; Secure; HttpOnly; SameSite=Strict`;
}

function csrfCookie(value, maxAge) {
  return `${CSRF_COOKIE}=${value}; Path=/; Max-Age=${maxAge}; Secure; HttpOnly; SameSite=Strict`;
}

function clearedCookies() {
  return [sessionCookie("", 0), csrfCookie("", 0)];
}

async function readJsonBody(request, maximumBytes = MAX_BODY_BYTES) {
  const declaredSize = Number(request.headers.get("content-length") || 0);
  if (declaredSize > maximumBytes) throw new HttpError(413, "Request body is too large");
  const text = await request.text();
  if (encoder.encode(text).byteLength > maximumBytes) throw new HttpError(413, "Request body is too large");
  try {
    return JSON.parse(text);
  } catch {
    throw new HttpError(400, "Request body must be valid JSON");
  }
}

function requireDatabase(env) {
  if (!env.DB) throw new HttpError(503, "Story storage is not configured");
  return env.DB;
}

function requireEditorPasswordHash(env) {
  const hash = typeof env.EDITOR_PASSWORD_HASH === "string" ? env.EDITOR_PASSWORD_HASH.trim() : "";
  if (!hash) throw new HttpError(503, "Editor sign-in is not configured");
  const parts = hash.split("$");
  const iterations = Number(parts[1]);
  const salt = parts.length === 4 ? base64UrlToBytes(parts[2]) : null;
  const digest = parts.length === 4 ? base64UrlToBytes(parts[3]) : null;
  if (parts[0] !== "pbkdf2-sha256" || !Number.isSafeInteger(iterations) || iterations < MIN_PASSWORD_HASH_ITERATIONS || iterations > MAX_PASSWORD_HASH_ITERATIONS || !salt || salt.byteLength < 16 || !digest || digest.byteLength !== 32) {
    throw new HttpError(503, "Editor sign-in is not configured");
  }
  return hash;
}

async function sessionInfo(request, env) {
  const db = requireDatabase(env);
  const rawToken = cookieValue(request, SESSION_COOKIE);
  const csrfToken = cookieValue(request, CSRF_COOKIE);
  if (!rawToken || !csrfToken || rawToken.length > 100 || csrfToken.length > 100) return null;
  const tokenHash = await sha256Hex(rawToken);
  const row = await db.prepare(
    "SELECT csrf_hash, expires_at FROM editor_sessions WHERE token_hash = ?",
  ).bind(tokenHash).first();
  const now = Math.floor(Date.now() / 1000);
  if (!row || Number(row.expires_at) <= now) return null;
  const csrfHash = await sha256Hex(csrfToken);
  if (!constantTimeTextEqual(csrfHash, row.csrf_hash)) return null;
  return { tokenHash, csrfToken, csrfHash, expiresAt: Number(row.expires_at) };
}

async function requireEditor(request, env, { csrf = false } = {}) {
  const isMutation = !["GET", "HEAD"].includes(request.method);
  if (!originMatches(request, { required: isMutation })) throw new HttpError(403, "Same-origin request required");
  const session = await sessionInfo(request, env);
  if (!session) throw new HttpError(401, "Editor sign-in required", { "Set-Cookie": clearedCookies() });
  if (csrf) {
    const headerToken = request.headers.get("X-CSRF-Token") || "";
    if (!constantTimeTextEqual(headerToken, session.csrfToken)) throw new HttpError(403, "CSRF token is invalid");
  }
  return session;
}

async function handleLogin(request, env) {
  if (request.method !== "POST") return jsonResponse({ error: "method_not_allowed" }, 405, { Allow: "POST" });
  if (!originMatches(request, { required: true })) throw new HttpError(403, "Same-origin request required");
  const encodedHash = requireEditorPasswordHash(env);
  const db = requireDatabase(env);
  const input = await readJsonBody(request, 4 * 1024);
  if (!isRecord(input) || Object.keys(input).some((key) => key !== "password") || typeof input.password !== "string") {
    throw new HttpError(400, "Invalid sign-in request");
  }
  if (encoder.encode(input.password).byteLength > MAX_PASSWORD_BYTES) throw new HttpError(400, "Invalid sign-in request");

  const ip = request.headers.get("CF-Connecting-IP") || "unknown-client";
  const ipHash = await hmacHex(encodedHash, ip);
  const now = Math.floor(Date.now() / 1000);
  const attempt = await db.prepare(
    "SELECT failures, window_started_at FROM editor_login_attempts WHERE ip_hash = ?",
  ).bind(ipHash).first();
  const withinWindow = attempt && now - Number(attempt.window_started_at) < LOGIN_WINDOW_SECONDS;
  const failures = withinWindow ? Number(attempt.failures) : 0;
  if (failures >= MAX_LOGIN_FAILURES) {
    throw new HttpError(429, "Too many sign-in attempts. Try again in 15 minutes.", { "Retry-After": String(LOGIN_WINDOW_SECONDS) });
  }

  let matched = false;
  try {
    matched = await verifyPassword(input.password, encodedHash);
  } catch {
    throw new HttpError(503, "Editor sign-in is not configured");
  }
  if (!matched) {
    await db.prepare(
      `INSERT INTO editor_login_attempts (ip_hash, failures, window_started_at)
       VALUES (?, 1, ?)
       ON CONFLICT(ip_hash) DO UPDATE SET
         failures = CASE WHEN editor_login_attempts.window_started_at <= ? THEN 1 ELSE editor_login_attempts.failures + 1 END,
         window_started_at = CASE WHEN editor_login_attempts.window_started_at <= ? THEN excluded.window_started_at ELSE editor_login_attempts.window_started_at END`,
    ).bind(ipHash, now, now - LOGIN_WINDOW_SECONDS, now - LOGIN_WINDOW_SECONDS).run();
    return jsonResponse({ error: "Sign-in failed" }, 401);
  }

  await db.prepare("DELETE FROM editor_login_attempts WHERE ip_hash = ?").bind(ipHash).run();
  await db.prepare("DELETE FROM editor_sessions WHERE expires_at <= ?").bind(now).run();
  const token = bytesToBase64Url(crypto.getRandomValues(new Uint8Array(32)));
  const csrfToken = bytesToBase64Url(crypto.getRandomValues(new Uint8Array(32)));
  const expiresAt = now + SESSION_TTL_SECONDS;
  await db.prepare(
    "INSERT INTO editor_sessions (token_hash, csrf_hash, expires_at, created_at) VALUES (?, ?, ?, ?)",
  ).bind(await sha256Hex(token), await sha256Hex(csrfToken), expiresAt, now).run();
  return jsonResponse({ authenticated: true, csrfToken, expiresAt }, 200, {
    "Set-Cookie": [sessionCookie(token, SESSION_TTL_SECONDS), csrfCookie(csrfToken, SESSION_TTL_SECONDS)],
  });
}

async function handleSession(request, env) {
  if (request.method !== "GET") return jsonResponse({ error: "method_not_allowed" }, 405, { Allow: "GET" });
  const session = await sessionInfo(request, env);
  if (!session) return jsonResponse({ authenticated: false }, 200, { "Set-Cookie": clearedCookies() });
  return jsonResponse({ authenticated: true, csrfToken: session.csrfToken, expiresAt: session.expiresAt });
}

async function handleLogout(request, env) {
  if (request.method !== "POST") return jsonResponse({ error: "method_not_allowed" }, 405, { Allow: "POST" });
  const session = await requireEditor(request, env, { csrf: true });
  await requireDatabase(env).prepare("DELETE FROM editor_sessions WHERE token_hash = ?").bind(session.tokenHash).run();
  return jsonResponse({ ok: true }, 200, { "Set-Cookie": clearedCookies() });
}

function normalizeStory(value) {
  if (!isRecord(value)) throw new HttpError(400, "Story must be an object");
  const allowedKeys = new Set(["title", "summary", "body", "author", "publication", "topic", "photo", "photoAlt", "published"]);
  if (Object.keys(value).some((key) => !allowedKeys.has(key))) throw new HttpError(400, "Story contains unsupported fields");
  const fields = [
    ["title", MAX_TITLE_LENGTH, true],
    ["summary", MAX_SUMMARY_LENGTH, false],
    ["body", MAX_BODY_LENGTH, true],
    ["author", MAX_AUTHOR_LENGTH, true],
    ["publication", MAX_PUBLICATION_LENGTH, true],
    ["photoAlt", MAX_PHOTO_ALT_LENGTH, false],
  ];
  const output = {};
  for (const [key, maximum, required] of fields) {
    const raw = value[key] ?? (required ? null : "");
    if (typeof raw !== "string" || raw.length > maximum) throw new HttpError(400, `Invalid ${key}`);
    const cleaned = raw.trim();
    if (required && !cleaned) throw new HttpError(400, `Invalid ${key}`);
    output[key] = cleaned;
  }
  if (typeof value.topic !== "string" || !ALLOWED_TOPICS.has(value.topic)) throw new HttpError(400, "Invalid topic");
  if (typeof value.photo !== "string" || !ALLOWED_PHOTOS.has(value.photo)) throw new HttpError(400, "Invalid photo");
  if (typeof value.published !== "boolean") throw new HttpError(400, "Invalid publication status");
  output.topic = value.topic;
  output.photo = value.photo;
  output.published = value.published;
  return output;
}

function publicStory(row) {
  const wordCount = String(row.body || "").trim().split(/\s+/u).filter(Boolean).length;
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    body: row.body,
    author: row.author,
    publication: row.publication,
    topic: row.topic,
    photo: row.photo,
    photoAlt: row.photo_alt,
    published: true,
    publishedAt: row.published_at,
    readMinutes: Math.max(1, Math.ceil(wordCount / 220)),
    applauseCount: Number(row.applause_count || 0),
    repostCount: Number(row.repost_count || 0),
    responseCount: Number(row.response_count || 0),
  };
}

function editorStory(row) {
  return {
    ...publicStory({ ...row, published_at: row.published_at || row.updated_at }),
    published: Boolean(row.published),
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
  };
}


function socialSecret(env) {
  const secret = typeof env.SOCIAL_SECRET === "string" ? env.SOCIAL_SECRET.trim() : "";
  const fallback = typeof env.EDITOR_PASSWORD_HASH === "string" ? env.EDITOR_PASSWORD_HASH.trim() : "";
  if (!secret && !fallback) throw new HttpError(503, "Social interactions are not configured");
  return secret || fallback;
}

async function readerHash(request, env, { required = false } = {}) {
  const readerId = request.headers.get("X-Reader-ID") || "";
  if (!readerId) {
    if (required) throw new HttpError(400, "Reader identity is required");
    return null;
  }
  if (readerId.length < 16 || readerId.length > 128 || !/^[A-Za-z0-9._~-]+$/u.test(readerId)) {
    throw new HttpError(400, "Invalid reader identity");
  }
  return hmacHex(socialSecret(env), readerId);
}

async function requirePublishedStory(db, storyId) {
  const story = await db.prepare(
    "SELECT 1 FROM editor_stories WHERE id = ? AND published = 1 AND managed_by = ?",
  ).bind(storyId, EDITOR_OWNER).first();
  if (!story) throw new HttpError(404, "Story not found");
}

async function storySocialData(request, env, storyId) {
  const db = requireDatabase(env);
  await requirePublishedStory(db, storyId);
  const reader = await readerHash(request, env);
  const counts = await db.prepare(
    `SELECT
      (SELECT COUNT(*) FROM story_social_actions WHERE story_id = ? AND kind = 'applause') AS applause,
      (SELECT COUNT(*) FROM story_social_actions WHERE story_id = ? AND kind = 'repost') AS reposts,
      (SELECT COUNT(*) FROM story_responses WHERE story_id = ?) AS responses`,
  ).bind(storyId, storyId, storyId).first();
  const me = reader ? await db.prepare(
    `SELECT
      EXISTS(SELECT 1 FROM story_social_actions WHERE story_id = ? AND reader_hash = ? AND kind = 'applause') AS applauded,
      EXISTS(SELECT 1 FROM story_social_actions WHERE story_id = ? AND reader_hash = ? AND kind = 'repost') AS reposted`,
  ).bind(storyId, reader, storyId, reader).first() : null;
  const responseRows = await db.prepare(
    "SELECT id, body, created_at FROM story_responses WHERE story_id = ? ORDER BY created_at DESC LIMIT 20",
  ).bind(storyId).all();
  return {
    counts: {
      applause: Number(counts?.applause || 0),
      reposts: Number(counts?.reposts || 0),
      responses: Number(counts?.responses || 0),
    },
    me: {
      applauded: Boolean(Number(me?.applauded || 0)),
      reposted: Boolean(Number(me?.reposted || 0)),
    },
    responses: (responseRows.results || []).map(row => ({
      id: row.id,
      body: row.body,
      createdAt: row.created_at,
    })),
  };
}

async function handleSocialStory(request, env, storyId) {
  if (!/^[A-Za-z0-9._~-]{1,160}$/u.test(storyId)) return jsonResponse({ error: "not_found" }, 404);
  if (request.method !== "GET") return jsonResponse({ error: "method_not_allowed" }, 405, { Allow: "GET" });
  return jsonResponse(await storySocialData(request, env, storyId));
}

async function handleSocialReaction(request, env) {
  if (!originMatches(request, { required: true })) throw new HttpError(403, "Same-origin request required");
  if (request.method !== "POST") return jsonResponse({ error: "method_not_allowed" }, 405, { Allow: "POST" });
  const reader = await readerHash(request, env, { required: true });
  const input = await readJsonBody(request, 4 * 1024);
  if (!isRecord(input) || Object.keys(input).some(key => !["storyId", "kind"].includes(key))) throw new HttpError(400, "Invalid reaction request");
  const storyId = typeof input.storyId === "string" ? input.storyId.trim() : "";
  const kind = typeof input.kind === "string" ? input.kind.trim() : "";
  if (!/^[A-Za-z0-9._~-]{1,160}$/u.test(storyId) || !["applause", "repost"].includes(kind)) throw new HttpError(400, "Invalid reaction request");
  const db = requireDatabase(env);
  await requirePublishedStory(db, storyId);
  const existing = await db.prepare(
    "SELECT 1 FROM story_social_actions WHERE story_id = ? AND reader_hash = ? AND kind = ?",
  ).bind(storyId, reader, kind).first();
  if (existing) {
    await db.prepare(
      "DELETE FROM story_social_actions WHERE story_id = ? AND reader_hash = ? AND kind = ?",
    ).bind(storyId, reader, kind).run();
  } else {
    await db.prepare(
      "INSERT INTO story_social_actions (story_id, reader_hash, kind, created_at) VALUES (?, ?, ?, ?)",
    ).bind(storyId, reader, kind, new Date().toISOString()).run();
  }
  return jsonResponse(await storySocialData(request, env, storyId));
}

async function handleSocialResponse(request, env) {
  if (!originMatches(request, { required: true })) throw new HttpError(403, "Same-origin request required");
  if (request.method !== "POST") return jsonResponse({ error: "method_not_allowed" }, 405, { Allow: "POST" });
  const reader = await readerHash(request, env, { required: true });
  const input = await readJsonBody(request, 16 * 1024);
  if (!isRecord(input) || Object.keys(input).some(key => !["storyId", "body"].includes(key))) throw new HttpError(400, "Invalid response request");
  const storyId = typeof input.storyId === "string" ? input.storyId.trim() : "";
  const body = typeof input.body === "string" ? input.body.trim() : "";
  if (!/^[A-Za-z0-9._~-]{1,160}$/u.test(storyId) || !body || body.length > 1200) throw new HttpError(400, "Invalid response");
  const db = requireDatabase(env);
  await requirePublishedStory(db, storyId);
  const recent = await db.prepare(
    "SELECT COUNT(*) AS count FROM story_responses WHERE reader_hash = ? AND created_at >= ?",
  ).bind(reader, new Date(Date.now() - 60 * 60 * 1000).toISOString()).first();
  if (Number(recent?.count || 0) >= 10) throw new HttpError(429, "Too many responses. Try again later.");
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await db.prepare(
    "INSERT INTO story_responses (id, story_id, reader_hash, body, created_at) VALUES (?, ?, ?, ?, ?)",
  ).bind(id, storyId, reader, body, now).run();
  return jsonResponse(await storySocialData(request, env, storyId), 201);
}

async function handleHealth(env) {
  let database = false;
  let editorAuth = false;
  let social = false;
  try {
    await requireDatabase(env).prepare("SELECT 1").first();
    database = true;
  } catch {}
  try {
    requireEditorPasswordHash(env);
    editorAuth = true;
  } catch {}
  try {
    socialSecret(env);
    social = true;
  } catch {}
  const ok = database && editorAuth && social;
  return jsonResponse({
    ok,
    services: {
      database,
      editorAuth,
      social,
    },
  }, ok ? 200 : 503);
}

async function handlePublicStories(request, env) {
  if (request.method !== "GET") return jsonResponse({ error: "method_not_allowed" }, 405, { Allow: "GET" });
  const db = requireDatabase(env);
  const result = await db.prepare(
    `SELECT id, title, summary, body, author, publication, topic, photo, photo_alt, published_at,
        (SELECT COUNT(*) FROM story_social_actions a WHERE a.story_id = editor_stories.id AND a.kind = 'applause') AS applause_count,
        (SELECT COUNT(*) FROM story_social_actions a WHERE a.story_id = editor_stories.id AND a.kind = 'repost') AS repost_count,
        (SELECT COUNT(*) FROM story_responses r WHERE r.story_id = editor_stories.id) AS response_count
     FROM editor_stories WHERE published = 1 AND managed_by = ? ORDER BY published_at DESC, updated_at DESC LIMIT 500`,
  ).bind(EDITOR_OWNER).all();
  return jsonResponse({ stories: (result.results || []).map(publicStory) });
}

async function handleEditorStories(request, env) {
  const session = await requireEditor(request, env, { csrf: request.method !== "GET" });
  const db = requireDatabase(env);
  const url = new URL(request.url);
  const match = url.pathname.match(/^\/api\/editor\/stories\/([0-9a-f-]{36})$/iu);

  if (url.pathname === "/api/editor/stories") {
    if (request.method === "GET") {
      const result = await db.prepare(
        `SELECT id, title, summary, body, author, publication, topic, photo, photo_alt, published, published_at, updated_at
         FROM editor_stories WHERE managed_by = ? ORDER BY updated_at DESC LIMIT 500`,
      ).bind(EDITOR_OWNER).all();
      return jsonResponse({ stories: (result.results || []).map(editorStory) });
    }
    if (request.method !== "POST") return jsonResponse({ error: "method_not_allowed" }, 405, { Allow: "GET, POST" });
    const story = normalizeStory(await readJsonBody(request));
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const publishedAt = story.published ? now : null;
    const row = await db.prepare(
      `INSERT INTO editor_stories
       (id, title, summary, body, author, publication, topic, photo, photo_alt, published, published_at, managed_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       RETURNING id, title, summary, body, author, publication, topic, photo, photo_alt, published, published_at, updated_at`,
    ).bind(id, story.title, story.summary, story.body, story.author, story.publication, story.topic, story.photo,
      story.photoAlt, story.published ? 1 : 0, publishedAt, EDITOR_OWNER, now, now).first();
    return jsonResponse({ story: editorStory(row) }, 201);
  }

  if (!match) return jsonResponse({ error: "not_found" }, 404);
  const id = match[1].toLowerCase();
  if (request.method === "PUT") {
    const story = normalizeStory(await readJsonBody(request));
    const existing = await db.prepare(
      "SELECT id, published_at FROM editor_stories WHERE id = ? AND managed_by = ?",
    ).bind(id, EDITOR_OWNER).first();
    if (!existing) return jsonResponse({ error: "not_found" }, 404);
    const now = new Date().toISOString();
    const publishedAt = story.published ? (existing.published_at || now) : null;
    const row = await db.prepare(
      `UPDATE editor_stories SET title = ?, summary = ?, body = ?, author = ?, publication = ?, topic = ?, photo = ?, photo_alt = ?, published = ?, published_at = ?, updated_at = ?
       WHERE id = ? AND managed_by = ?
       RETURNING id, title, summary, body, author, publication, topic, photo, photo_alt, published, published_at, updated_at`,
    ).bind(story.title, story.summary, story.body, story.author, story.publication, story.topic, story.photo,
      story.photoAlt, story.published ? 1 : 0, publishedAt, now, id, EDITOR_OWNER).first();
    if (!row) return jsonResponse({ error: "not_found" }, 404);
    return jsonResponse({ story: editorStory(row) });
  }
  if (request.method === "DELETE") {
    const existing = await db.prepare(
      "SELECT 1 FROM editor_stories WHERE id = ? AND managed_by = ?",
    ).bind(id, EDITOR_OWNER).first();
    if (!existing) return jsonResponse({ error: "not_found" }, 404);
    await db.prepare(
      "DELETE FROM story_social_actions WHERE story_id = ?",
    ).bind(id).run();
    await db.prepare(
      "DELETE FROM story_responses WHERE story_id = ?",
    ).bind(id).run();
    const result = await db.prepare(
      "DELETE FROM editor_stories WHERE id = ? AND managed_by = ?",
    ).bind(id, EDITOR_OWNER).run();
    if (!result.meta?.changes) return jsonResponse({ error: "not_found" }, 404);
    return jsonResponse({ ok: true, id });
  }
  return jsonResponse({ error: "method_not_allowed" }, 405, { Allow: "PUT, DELETE" });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) {
      const bundled = bundledAssetResponse(request);
      if (bundled) return bundled;
      const response = env.ASSETS ? await env.ASSETS.fetch(request) : new Response("Not found", { status: 404 });
      return secureAssetResponse(response);
    }
    if (!originMatches(request)) return jsonResponse({ error: "cross_origin_request_denied" }, 403);

    try {
      if (url.pathname === "/api/health") return await handleHealth(env);
      if (url.pathname === "/api/stories") return await handlePublicStories(request, env);
      const socialStoryMatch = url.pathname.match(/^\/api\/social\/stories\/([A-Za-z0-9._~-]{1,160})$/u);
      if (socialStoryMatch) return await handleSocialStory(request, env, socialStoryMatch[1]);
      if (url.pathname === "/api/social/reactions") return await handleSocialReaction(request, env);
      if (url.pathname === "/api/social/responses") return await handleSocialResponse(request, env);
      if (url.pathname === "/api/editor/login") return await handleLogin(request, env);
      if (url.pathname === "/api/editor/session") return await handleSession(request, env);
      if (url.pathname === "/api/editor/logout") return await handleLogout(request, env);
      if (url.pathname === "/api/editor/stories" || url.pathname.startsWith("/api/editor/stories/")) {
        return await handleEditorStories(request, env);
      }
      return jsonResponse({ error: "not_found" }, 404);
    } catch (error) {
      if (error instanceof HttpError) return jsonResponse({ error: error.message }, error.status, error.headers);
      return jsonResponse({ error: "internal_error" }, 500);
    }
  },
};