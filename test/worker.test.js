import test from "node:test";
import assert from "node:assert/strict";
import worker from "../src/worker.js";

const ORIGIN = "https://example.workers.dev";
const encoder = new TextEncoder();

function toBase64Url(bytes) {
  let binary = "";
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/u, "");
}

async function makeTestPasswordHash(password) {
  const salt = new Uint8Array(16).fill(23);
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const derived = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 100_000, hash: "SHA-256" }, key, 256);
  return `pbkdf2-sha256$100000$${toBase64Url(salt)}$${toBase64Url(derived)}`;
}

class MemoryD1 {
  stories = new Map();
  sessions = new Map();
  attempts = new Map();
  socialActions = new Map();
  responses = new Map();

  prepare(sql) {
    const database = this;
    let values = [];
    const normalized = sql.replace(/\s+/gu, " ").trim();
    return {
      bind(...bound) { values = bound; return this; },
      async first() { return database.first(normalized, values); },
      async all() { return database.all(normalized, values); },
      async run() { return database.run(normalized, values); },
    };
  }

  async first(sql, values) {
    if (sql.startsWith("SELECT csrf_hash, expires_at FROM editor_sessions")) {
      const row = this.sessions.get(values[0]);
      return row ? { ...row } : null;
    }
    if (sql.startsWith("SELECT failures, window_started_at FROM editor_login_attempts")) {
      const row = this.attempts.get(values[0]);
      return row ? { ...row } : null;
    }
    if (sql.startsWith("SELECT 1 FROM story_social_actions")) {
      const [storyId, readerHash, kind] = values;
      const key = [storyId, readerHash, kind].join("|");
      return this.socialActions.has(key) ? { ok: 1 } : null;
    }
    if (sql.startsWith("SELECT (SELECT COUNT(*) FROM story_social_actions")) {
      const [storyA, storyB, storyC] = values;
      const applause = [...this.socialActions.values()].filter(row => row.story_id === storyA && row.kind === "applause").length;
      const reposts = [...this.socialActions.values()].filter(row => row.story_id === storyB && row.kind === "repost").length;
      const responses = [...this.responses.values()].filter(row => row.story_id === storyC).length;
      return { applause, reposts, responses };
    }
    if (sql.startsWith("SELECT COUNT(*) AS count FROM story_responses")) {
      const [readerHash, cutoff] = values;
      const count = [...this.responses.values()].filter(row => row.reader_hash === readerHash && row.created_at >= cutoff).length;
      return { count };
    }
    if (sql.startsWith("SELECT id, body, created_at FROM story_responses")) {
      throw new Error("Response list must use all()");
    }
    if (sql.startsWith("SELECT id, published_at FROM editor_stories")) {
      const [id, managedBy] = values;
      const row = this.stories.get(id);
      return row?.managed_by === managedBy ? { id: row.id, published_at: row.published_at } : null;
    }
    if (sql.startsWith("INSERT INTO editor_stories")) {
      const [id, title, summary, body, author, publication, topic, photo, photo_alt, published, published_at, managed_by, created_at, updated_at] = values;
      const row = { id, title, summary, body, author, publication, topic, photo, photo_alt, published, published_at, managed_by, created_at, updated_at };
      this.stories.set(id, row);
      return { ...row };
    }
    if (sql.startsWith("UPDATE editor_stories SET")) {
      const [title, summary, body, author, publication, topic, photo, photo_alt, published, published_at, updated_at, id, managedBy] = values;
      const previous = this.stories.get(id);
      if (!previous || previous.managed_by !== managedBy) return null;
      const row = { ...previous, title, summary, body, author, publication, topic, photo, photo_alt, published, published_at, updated_at };
      this.stories.set(id, row);
      return { ...row };
    }
    throw new Error(`Unexpected first query: ${sql}`);
  }

  async all(sql, values) {
    if (sql.startsWith("SELECT id, body, created_at FROM story_responses")) {
      return { results: [...this.responses.values()].filter(row => row.story_id === values[0]).sort((a, b) => b.created_at.localeCompare(a.created_at)).map(row => ({ ...row })) };
    }
    if (sql.startsWith("SELECT id, title, summary, body, author, publication, topic, photo, photo_alt, published_at FROM editor_stories")) {
      return { results: [...this.stories.values()].filter((row) => row.managed_by === values[0] && row.published === 1).map((row) => ({ ...row })) };
    }
    if (sql.startsWith("SELECT id, title, summary, body, author, publication, topic, photo, photo_alt, published, published_at, updated_at FROM editor_stories")) {
      return { results: [...this.stories.values()].filter((row) => row.managed_by === values[0]).map((row) => ({ ...row })) };
    }
    throw new Error(`Unexpected all query: ${sql}`);
  }

  async run(sql, values) {
    if (sql.startsWith("INSERT INTO editor_sessions")) {
      const [token_hash, csrf_hash, expires_at, created_at] = values;
      this.sessions.set(token_hash, { csrf_hash, expires_at, created_at });
      return { meta: { changes: 1 } };
    }
    if (sql.startsWith("DELETE FROM editor_sessions WHERE expires_at")) {
      const [now] = values;
      let changes = 0;
      for (const [key, row] of this.sessions) {
        if (row.expires_at <= now) { this.sessions.delete(key); changes++; }
      }
      return { meta: { changes } };
    }
    if (sql.startsWith("DELETE FROM editor_sessions WHERE token_hash")) {
      return { meta: { changes: Number(this.sessions.delete(values[0])) } };
    }
    if (sql.startsWith("DELETE FROM story_social_actions WHERE story_id")) {
      const [storyId, readerHash, kind] = values;
      const key = [storyId, readerHash, kind].join("|");
      return { meta: { changes: Number(this.socialActions.delete(key)) } };
    }
    if (sql.startsWith("INSERT INTO story_social_actions")) {
      const [storyId, readerHash, kind, createdAt] = values;
      this.socialActions.set([storyId, readerHash, kind].join("|"), { story_id: storyId, reader_hash: readerHash, kind, created_at: createdAt });
      return { meta: { changes: 1 } };
    }
    if (sql.startsWith("INSERT INTO story_responses")) {
      const [id, storyId, readerHash, body, createdAt] = values;
      this.responses.set(id, { id, story_id: storyId, reader_hash: readerHash, body, created_at: createdAt });
      return { meta: { changes: 1 } };
    }
    if (sql.startsWith("DELETE FROM editor_login_attempts WHERE ip_hash")) {
      return { meta: { changes: Number(this.attempts.delete(values[0])) } };
    }
    if (sql.startsWith("INSERT INTO editor_login_attempts")) {
      const [ipHash, now, cutoff] = values;
      const previous = this.attempts.get(ipHash);
      if (!previous || previous.window_started_at <= cutoff) this.attempts.set(ipHash, { failures: 1, window_started_at: now });
      else this.attempts.set(ipHash, { failures: previous.failures + 1, window_started_at: previous.window_started_at });
      return { meta: { changes: 1 } };
    }
    if (sql.startsWith("DELETE FROM editor_stories")) {
      const [id, managedBy] = values;
      const row = this.stories.get(id);
      if (!row || row.managed_by !== managedBy) return { meta: { changes: 0 } };
      this.stories.delete(id);
      return { meta: { changes: 1 } };
    }
    throw new Error(`Unexpected run query: ${sql}`);
  }
}

const correctPassword = "test-only-example-editor-password";
const passwordHash = await makeTestPasswordHash(correctPassword);

function createEnv({ db = new MemoryD1(), passwordHashValue = passwordHash, assetResponse } = {}) {
  return {
    DB: db,
    EDITOR_PASSWORD_HASH: passwordHashValue,
    ASSETS: { fetch: async () => assetResponse || new Response("public homepage", { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }) },
  };
}

function request(path, { method = "GET", body, headers = {} } = {}) {
  const requestHeaders = new Headers(headers);
  if (method !== "GET" && method !== "HEAD" && !requestHeaders.has("Origin")) requestHeaders.set("Origin", ORIGIN);
  if (body !== undefined) requestHeaders.set("Content-Type", "application/json");
  return new Request(`${ORIGIN}${path}`, {
    method,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

const storyInput = {
  title: "A small beginning",
  summary: "A practical note about taking one small step.",
  body: "Start with one quiet step.\n\nThen notice what changed.",
  author: "Editor",
  publication: "The Open Notebook",
  topic: "Writing",
  photo: "/assets/notebook.jpg",
  photoAlt: "An open notebook outdoors",
  published: true,
};

async function signIn(env, { password = correctPassword, ip = "203.0.113.10" } = {}) {
  const response = await worker.fetch(request("/api/editor/login", {
    method: "POST",
    headers: { "CF-Connecting-IP": ip },
    body: { password },
  }), env, {});
  const cookies = response.headers.getSetCookie();
  const sessionCookie = cookies.find((cookie) => cookie.startsWith("__Host-site-editor-session="));
  const csrfCookie = cookies.find((cookie) => cookie.startsWith("__Host-site-editor-csrf="));
  return {
    response,
    sessionCookie: sessionCookie?.split(";", 1)[0] || "",
    csrfCookie: csrfCookie?.split(";", 1)[0] || "",
    csrfToken: csrfCookie?.split("=", 2)[1]?.split(";", 1)[0] || "",
  };
}

function withEditor({ sessionCookie, csrfCookie, csrfToken }, extra = {}) {
  const headers = new Headers(extra);
  headers.set("Cookie", `${sessionCookie}; ${csrfCookie}`.trim());
  if (csrfToken) headers.set("X-CSRF-Token", csrfToken);
  return headers;
}

test("public homepage and story reads need no editor session and receive security headers", async () => {
  const env = createEnv();
  const homepage = await worker.fetch(request("/"), env, {});
  assert.equal(homepage.status, 200);
  assert.equal(homepage.headers.get("x-content-type-options"), "nosniff");
  assert.match(homepage.headers.get("content-security-policy"), /frame-ancestors 'none'/u);
  const response = await worker.fetch(request("/api/stories"), env, {});
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { stories: [] });
});

test("all unauthenticated story mutations and private editor listing are denied", async () => {
  const env = createEnv();
  const post = await worker.fetch(request("/api/editor/stories", { method: "POST", body: storyInput }), env, {});
  const put = await worker.fetch(request(`/api/editor/stories/${"a".repeat(36)}`, { method: "PUT", body: storyInput }), env, {});
  const remove = await worker.fetch(request(`/api/editor/stories/${"a".repeat(36)}`, { method: "DELETE" }), env, {});
  const list = await worker.fetch(request("/api/editor/stories"), env, {});
  assert.deepEqual([post.status, put.status, remove.status, list.status], [401, 401, 401, 401]);
  assert.equal(env.DB.stories.size, 0);
});

test("a bad password is rejected without revealing the password and the session is not created", async () => {
  const env = createEnv();
  const result = await signIn(env, { password: "wrong password" });
  assert.equal(result.response.status, 401);
  assert.deepEqual(await result.response.json(), { error: "Sign-in failed" });
  assert.equal(result.sessionCookie, "");
  assert.equal(env.DB.sessions.size, 0);
});

test("missing or malformed password configuration fails closed", async () => {
  const missing = createEnv({ passwordHashValue: "" });
  const noConfig = await worker.fetch(request("/api/editor/login", { method: "POST", body: { password: correctPassword } }), missing, {});
  assert.equal(noConfig.status, 503);
  const malformed = createEnv({ passwordHashValue: "plain-text-password" });
  const badConfig = await worker.fetch(request("/api/editor/login", { method: "POST", body: { password: correctPassword } }), malformed, {});
  assert.equal(badConfig.status, 503);
  assert.equal(malformed.DB.sessions.size, 0);
});

test("login creates secure HttpOnly SameSite session cookies and a CSRF token retrievable after reload", async () => {
  const env = createEnv();
  const login = await signIn(env);
  assert.equal(login.response.status, 200);
  assert.equal((await login.response.json()).authenticated, true);
  const cookies = login.response.headers.getSetCookie();
  assert.equal(cookies.length, 2);
  for (const cookie of cookies) {
    assert.match(cookie, /; Secure;/u);
    assert.match(cookie, /; HttpOnly;/u);
    assert.match(cookie, /; SameSite=Strict$/u);
    assert.match(cookie, /; Path=\//u);
  }
  assert.equal(env.DB.sessions.size, 1);
  const session = await worker.fetch(request("/api/editor/session", {
    headers: { Cookie: `${login.sessionCookie}; ${login.csrfCookie}` },
  }), env, {});
  const state = await session.json();
  assert.equal(state.authenticated, true);
  assert.equal(state.csrfToken, login.csrfToken);
  assert.equal(session.headers.get("cache-control"), "no-store, private");
});

test("editor can create a public story, read its private list, update and unpublish it", async () => {
  const env = createEnv();
  const editor = await signIn(env);
  const authHeaders = withEditor(editor);
  const create = await worker.fetch(request("/api/editor/stories", { method: "POST", headers: authHeaders, body: storyInput }), env, {});
  assert.equal(create.status, 201);
  const created = (await create.json()).story;
  assert.match(created.id, /^[0-9a-f-]{36}$/u);
  assert.equal(created.title, storyInput.title);
  assert.equal(created.readMinutes, 1);
  assert.equal(Object.hasOwn(created, "managed_by"), false);

  const publicRead = await worker.fetch(request("/api/stories"), env, {});
  const publicStories = await publicRead.json();
  assert.equal(publicStories.stories.length, 1);
  assert.equal(publicStories.stories[0].body, storyInput.body);
  assert.equal(Object.hasOwn(publicStories.stories[0], "managed_by"), false);

  const editorList = await worker.fetch(request("/api/editor/stories", { headers: withEditor(editor, { Origin: ORIGIN }) }), env, {});
  assert.equal((await editorList.json()).stories.length, 1);

  const unpublished = { ...storyInput, title: "Saved privately", published: false };
  const update = await worker.fetch(request(`/api/editor/stories/${created.id}`, { method: "PUT", headers: authHeaders, body: unpublished }), env, {});
  assert.equal(update.status, 200);
  assert.equal((await update.json()).story.published, false);
  assert.deepEqual((await (await worker.fetch(request("/api/stories"), env, {})).json()).stories, []);

  const republished = await worker.fetch(request(`/api/editor/stories/${created.id}`, { method: "PUT", headers: authHeaders, body: { ...storyInput, title: "Published again" } }), env, {});
  assert.equal(republished.status, 200);
  assert.equal((await republished.json()).story.published, true);
  assert.equal((await (await worker.fetch(request("/api/stories"), env, {})).json()).stories[0].title, "Published again");
});

test("unpublished stories stay private and public responses expose only published records", async () => {
  const env = createEnv();
  const editor = await signIn(env);
  const create = await worker.fetch(request("/api/editor/stories", {
    method: "POST", headers: withEditor(editor), body: { ...storyInput, published: false },
  }), env, {});
  assert.equal(create.status, 201);
  assert.equal((await (await worker.fetch(request("/api/stories"), env, {})).json()).stories.length, 0);
  const privateList = await worker.fetch(request("/api/editor/stories", { headers: withEditor(editor) }), env, {});
  const data = await privateList.json();
  assert.equal(data.stories.length, 1);
  assert.equal(data.stories[0].published, false);
  assert.equal(data.stories[0].body, storyInput.body);
});

test("story validation rejects client-supplied ownership and unsafe photo paths", async () => {
  const env = createEnv();
  const editor = await signIn(env);
  const extraField = await worker.fetch(request("/api/editor/stories", {
    method: "POST", headers: withEditor(editor), body: { ...storyInput, ownerId: "attacker" },
  }), env, {});
  const unsafePhoto = await worker.fetch(request("/api/editor/stories", {
    method: "POST", headers: withEditor(editor), body: { ...storyInput, photo: "javascript:alert(1)" },
  }), env, {});
  assert.equal(extraField.status, 400);
  assert.equal(unsafePhoto.status, 400);
  assert.equal(env.DB.stories.size, 0);
});

test("CSRF, cross-origin, and missing-Origin editor writes are rejected", async () => {
  const env = createEnv();
  const editor = await signIn(env);
  const noCsrf = await worker.fetch(request("/api/editor/stories", {
    method: "POST", headers: withEditor({ ...editor, csrfToken: "" }), body: storyInput,
  }), env, {});
  const badCsrf = await worker.fetch(request("/api/editor/stories", {
    method: "POST", headers: withEditor({ ...editor, csrfToken: "wrong" }), body: storyInput,
  }), env, {});
  const crossOrigin = await worker.fetch(request("/api/editor/stories", {
    method: "POST", headers: withEditor(editor, { Origin: "https://attacker.example" }), body: storyInput,
  }), env, {});
  const missingOrigin = await worker.fetch(request("/api/editor/stories", {
    method: "POST", headers: withEditor(editor, { Origin: "" }), body: storyInput,
  }), env, {});
  assert.deepEqual([noCsrf.status, badCsrf.status, crossOrigin.status, missingOrigin.status], [403, 403, 403, 403]);
  assert.equal(env.DB.stories.size, 0);
});

test("delete removes only an editor-managed story and unknown IDs are not affected", async () => {
  const env = createEnv();
  const editor = await signIn(env);
  const create = await worker.fetch(request("/api/editor/stories", { method: "POST", headers: withEditor(editor), body: storyInput }), env, {});
  const id = (await create.json()).story.id;
  const unknown = await worker.fetch(request(`/api/editor/stories/${"f".repeat(36)}`, { method: "DELETE", headers: withEditor(editor) }), env, {});
  assert.equal(unknown.status, 404);
  const removed = await worker.fetch(request(`/api/editor/stories/${id}`, { method: "DELETE", headers: withEditor(editor) }), env, {});
  assert.equal(removed.status, 200);
  assert.equal(env.DB.stories.has(id), false);
  assert.equal((await (await worker.fetch(request("/api/stories"), env, {})).json()).stories.length, 0);
});

test("logout revokes the session; the old cookies cannot mutate content", async () => {
  const env = createEnv();
  const editor = await signIn(env);
  const logout = await worker.fetch(request("/api/editor/logout", { method: "POST", headers: withEditor(editor) }), env, {});
  assert.equal(logout.status, 200);
  assert.equal(env.DB.sessions.size, 0);
  assert.ok(logout.headers.getSetCookie().every((cookie) => /Max-Age=0/u.test(cookie)));
  const denied = await worker.fetch(request("/api/editor/stories", { method: "POST", headers: withEditor(editor), body: storyInput }), env, {});
  assert.equal(denied.status, 401);
  assert.equal(env.DB.stories.size, 0);
});

test("password attempts are rate-limited per keyed IP fingerprint", async () => {
  const env = createEnv();
  const statuses = [];
  for (let index = 0; index < 6; index++) {
    const result = await signIn(env, { password: "not-the-password", ip: "198.51.100.44" });
    statuses.push(result.response.status);
  }
  assert.deepEqual(statuses, [401, 401, 401, 401, 401, 429]);
  assert.equal(env.DB.attempts.size, 1);
  const fingerprint = [...env.DB.attempts.keys()][0];
  assert.doesNotMatch(fingerprint, /198\.51\.100/u);
});

test("oversized and malformed API inputs fail before storage", async () => {
  const env = createEnv();
  const tooLarge = new Request(`${ORIGIN}/api/editor/login`, {
    method: "POST",
    headers: { Origin: ORIGIN, "Content-Type": "application/json", "Content-Length": "5000" },
    body: "{}",
  });
  assert.equal((await worker.fetch(tooLarge, env, {})).status, 413);
  const invalidJson = new Request(`${ORIGIN}/api/editor/login`, {
    method: "POST",
    headers: { Origin: ORIGIN, "Content-Type": "application/json" },
    body: "not-json",
  });
  assert.equal((await worker.fetch(invalidJson, env, {})).status, 400);
  assert.equal(env.DB.sessions.size, 0);
});

function withReader(extra = {}, readerId = "reader-test-0000000000000001") {
  const headers = new Headers(extra);
  headers.set("X-Reader-ID", readerId);
  return headers;
}

test("public social state starts empty and reactions persist per reader", async () => {
  const env = createEnv();
  const initial = await worker.fetch(request("/api/social/stories/test-story", { headers: withReader() }), env, {});
  assert.equal(initial.status, 200);
  assert.deepEqual((await initial.json()).counts, { applause: 0, reposts: 0, responses: 0 });

  const applaud = await worker.fetch(request("/api/social/reactions", {
    method: "POST", headers: withReader(), body: { storyId: "test-story", kind: "applause" },
  }), env, {});
  assert.equal(applaud.status, 200);
  assert.equal((await applaud.json()).me.applauded, true);

  const sameReader = await worker.fetch(request("/api/social/stories/test-story", { headers: withReader() }), env, {});
  const sameData = await sameReader.json();
  assert.equal(sameData.counts.applause, 1);
  assert.equal(sameData.me.applauded, true);

  const otherReader = await worker.fetch(request("/api/social/stories/test-story", { headers: withReader({}, "reader-test-0000000000000002") }), env, {});
  assert.equal((await otherReader.json()).me.applauded, false);

  const unreact = await worker.fetch(request("/api/social/reactions", {
    method: "POST", headers: withReader(), body: { storyId: "test-story", kind: "applause" },
  }), env, {});
  assert.equal((await unreact.json()).counts.applause, 0);
});

test("responses are stored and returned as plain text", async () => {
  const env = createEnv();
  const result = await worker.fetch(request("/api/social/responses", {
    method: "POST", headers: withReader(), body: { storyId: "test-story", body: "A useful thought." },
  }), env, {});
  assert.equal(result.status, 201);
  const data = await result.json();
  assert.equal(data.counts.responses, 1);
  assert.equal(data.responses[0].body, "A useful thought.");
});

test("social mutations reject malformed reader identity and payloads", async () => {
  const env = createEnv();
  const shortReader = await worker.fetch(request("/api/social/reactions", {
    method: "POST", headers: withReader({}, "short"), body: { storyId: "test-story", kind: "applause" },
  }), env, {});
  assert.equal(shortReader.status, 400);
  const badKind = await worker.fetch(request("/api/social/reactions", {
    method: "POST", headers: withReader(), body: { storyId: "test-story", kind: "like" },
  }), env, {});
  assert.equal(badKind.status, 400);
});
