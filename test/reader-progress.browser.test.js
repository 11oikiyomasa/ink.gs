import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn, spawnSync } from "node:child_process";
import { access, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const chromiumPath = process.env.CHROMIUM_PATH || spawnSync("which", ["chromium"], { encoding: "utf8" }).stdout.trim();

function delay(milliseconds) {
  return new Promise(resolveDelay => setTimeout(resolveDelay, milliseconds));
}

function createCdpClient(url) {
  const socket = new WebSocket(url);
  const pending = new Map();
  const eventWaiters = new Map();
  let nextId = 0;

  socket.addEventListener("message", event => {
    const message = JSON.parse(String(event.data));
    if (message.id) {
      const request = pending.get(message.id);
      if (!request) return;
      clearTimeout(request.timer);
      pending.delete(message.id);
      if (message.error) request.reject(new Error(message.error.message));
      else request.resolve(message.result || {});
      return;
    }
    const waiters = eventWaiters.get(message.method) || [];
    if (waiters.length) {
      eventWaiters.delete(message.method);
      waiters.forEach(resolveEvent => resolveEvent(message.params));
    }
  });

  const ready = new Promise((resolveReady, rejectReady) => {
    socket.addEventListener("open", resolveReady, { once: true });
    socket.addEventListener("error", rejectReady, { once: true });
  });

  return {
    ready,
    command(method, params = {}) {
      const id = ++nextId;
      return new Promise((resolveCommand, rejectCommand) => {
        const timer = setTimeout(() => {
          pending.delete(id);
          rejectCommand(new Error(`Timed out waiting for CDP command ${method}`));
        }, 10000);
        pending.set(id, { resolve: resolveCommand, reject: rejectCommand, timer });
        socket.send(JSON.stringify({ id, method, params }));
      });
    },
    waitForEvent(method) {
      return new Promise(resolveEvent => {
        const waiters = eventWaiters.get(method) || [];
        waiters.push(resolveEvent);
        eventWaiters.set(method, waiters);
      });
    },
    close() {
      socket.close();
      for (const request of pending.values()) {
        clearTimeout(request.timer);
        request.reject(new Error("CDP client closed"));
      }
      pending.clear();
    }
  };
}

async function evaluate(cdp, expression) {
  const response = await cdp.command("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
    userGesture: true
  });
  if (response.exceptionDetails) {
    throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text);
  }
  return response.result?.value;
}

async function waitFor(cdp, expression, description, timeout = 8000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await evaluate(cdp, expression)) return;
    await delay(40);
  }
  throw new Error(`Timed out waiting for ${description}`);
}

async function findFreeTcpPort() {
  const probe = createServer();
  await new Promise((resolveListen, rejectListen) => {
    probe.once("error", rejectListen);
    probe.listen(0, "127.0.0.1", resolveListen);
  });
  const port = probe.address().port;
  await new Promise(resolveClose => probe.close(resolveClose));
  return port;
}

async function waitForDebugPort(port, browser) {
  const deadline = Date.now() + 12000;
  while (Date.now() < deadline) {
    if (browser.exitCode !== null) throw new Error(`Chromium exited with code ${browser.exitCode}`);
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (response.ok) return port;
    } catch {
      // Chromium has not opened its local DevTools endpoint yet.
    }
    await delay(50);
  }
  throw new Error(`Chromium did not open its DevTools endpoint on port ${port}`);
}

function serveProject() {
  const mimeTypes = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml"
  };
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname);
      const relativePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
      const filePath = resolve(projectRoot, relativePath);
      if (filePath !== projectRoot && !filePath.startsWith(projectRoot + sep)) {
        response.writeHead(403).end();
        return;
      }
      const content = await readFile(filePath);
      response.writeHead(200, {
        "Cache-Control": "no-store",
        "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream"
      });
      response.end(content);
    } catch {
      response.writeHead(404).end();
    }
  });
  return server;
}

test("reader reopening preserves the explicit resume choice and start-over resets local progress", {
  skip: !chromiumPath && "Chromium is not installed; browser regression test skipped"
}, async t => {
  await access(chromiumPath);
  const server = serveProject();
  await new Promise((resolveListen, rejectListen) => {
    server.once("error", rejectListen);
    server.listen(0, "127.0.0.1", resolveListen);
  });
  const baseUrl = `http://127.0.0.1:${server.address().port}/`;
  const profileDirectory = await mkdtemp(resolve(tmpdir(), "ink-reader-progress-"));
  const debugPort = await findFreeTcpPort();
  const browser = spawn(chromiumPath, [
    "--headless",
    "--no-sandbox",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--disable-background-networking",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${debugPort}`,
    "--remote-debugging-address=127.0.0.1",
    "--remote-allow-origins=*",
    `--user-data-dir=${profileDirectory}`,
    "about:blank"
  ], { stdio: "ignore" });
  let cdp;

  t.after(async () => {
    cdp?.close();
    browser.kill("SIGKILL");
    await new Promise(resolveExit => {
      if (browser.exitCode !== null) resolveExit();
      else browser.once("exit", resolveExit);
    });
    server.closeAllConnections?.();
    await new Promise(resolveClose => server.close(resolveClose));
    await rm(profileDirectory, { recursive: true, force: true });
  });

  await waitForDebugPort(debugPort, browser);
  const targetDeadline = Date.now() + 5000;
  let targets = [];
  while (Date.now() < targetDeadline) {
    try {
      targets = await (await fetch(`http://127.0.0.1:${debugPort}/json`)).json();
      if (targets.some(target => target.type === "page" && target.webSocketDebuggerUrl)) break;
    } catch {
      // DevTools HTTP endpoint can lag the published port briefly.
    }
    await delay(40);
  }
  const page = targets.find(target => target.type === "page" && target.webSocketDebuggerUrl);
  assert.ok(page, "Chromium exposes a page target for browser automation");
  cdp = createCdpClient(page.webSocketDebuggerUrl);
  await cdp.ready;
  await cdp.command("Page.enable");
  await cdp.command("Runtime.enable");
  await cdp.command("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 560,
    deviceScaleFactor: 1,
    mobile: true
  });
  const savedPreferences = JSON.stringify({ readerSettings: { textSize: "large", readingWidth: "narrow" } });
  await cdp.command("Page.addScriptToEvaluateOnNewDocument", {
    source: `if (!localStorage.getItem("reading-room-demo-v1")) localStorage.setItem("reading-room-demo-v1", ${JSON.stringify(savedPreferences)});`
  });
  const loadEvent = cdp.waitForEvent("Page.loadEventFired");
  await cdp.command("Page.navigate", { url: baseUrl });
  await loadEvent;
  await waitFor(cdp, `Boolean(document.querySelector('[data-story-id="india-month"] .story-title-button'))`, "local preview story card");

  await evaluate(cdp, `document.querySelector('[data-story-id="india-month"] .story-title-button').click()`);
  await waitFor(cdp, `document.querySelector('#reader')?.open === true && document.querySelector('#reader').hidden === false && document.querySelector('#reader-scroll').clientHeight > 0`, "reader to open visibly");
  await waitFor(cdp, `document.querySelector('#reader').dataset.readerSize === 'large' && document.querySelector('#reader').dataset.readerWidth === 'narrow'`, "saved reader preferences to apply");
  await evaluate(cdp, `new Promise(resolve => setTimeout(resolve, 200))`);
  const savedRatio = await evaluate(cdp, `(() => {
    const scroll = document.querySelector('#reader-scroll');
    const maximum = scroll.scrollHeight - scroll.clientHeight;
    if (maximum <= 1) return null;
    scroll.scrollTop = maximum * 0.244;
    scroll.dispatchEvent(new Event('scroll'));
    return scroll.scrollTop / maximum;
  })()`);
  assert.ok(savedRatio !== null, "the article has a scrollable reading area at a phone viewport");
  await evaluate(cdp, `new Promise(resolve => setTimeout(resolve, 320))`);
  const initialSavedProgress = await evaluate(cdp, `JSON.parse(localStorage.getItem('reading-room-demo-v1')).progress['india-month']`);
  assert.ok(Math.abs(initialSavedProgress.ratio - savedRatio) < 0.015, "scrolling stores the normalized article position on this device");

  await evaluate(cdp, `document.querySelector('#reader-close').click()`);
  await waitFor(cdp, `document.querySelector('#reader').open === false`, "reader to close after saving progress");
  await evaluate(cdp, `document.querySelector('[data-story-id="india-month"] .story-title-button').click()`);
  await waitFor(cdp, `document.querySelector('#reader')?.open === true && document.querySelector('#reader').hidden === false && document.querySelector('#reader-scroll').clientHeight > 0 && document.querySelector('#reader-resume').hidden === false`, "the resume choices to be shown on reopening");
  await evaluate(cdp, `new Promise(resolve => setTimeout(resolve, 80))`);
  const reopenedState = await evaluate(cdp, `(() => {
    const scroll = document.querySelector('#reader-scroll');
    const prompt = document.querySelector('#reader-resume');
    const area = scroll.getBoundingClientRect();
    const choice = prompt.getBoundingClientRect();
    return {
      scrollTop: scroll.scrollTop,
      promptVisible: !prompt.hidden && [...prompt.querySelectorAll('button')].length === 2 && [...prompt.querySelectorAll('button')].every(button => {
        const bounds = button.getBoundingClientRect();
        return bounds.height > 0 && bounds.bottom > area.top && bounds.top < area.bottom && bounds.bottom > 0 && bounds.top < window.innerHeight;
      }),
      promptBounds: { top: choice.top, bottom: choice.bottom },
      scrollBounds: { top: area.top, bottom: area.bottom },
      ratio: JSON.parse(localStorage.getItem('reading-room-demo-v1')).progress['india-month'].ratio
    };
  })()`);
  assert.equal(reopenedState.scrollTop, 0, "ordinary reopening starts at the top rather than the browser-restored offset");
  assert.equal(reopenedState.promptVisible, true, `both explicit resume choices remain visible in the reader viewport: ${JSON.stringify(reopenedState)}`);
  assert.ok(Math.abs(reopenedState.ratio - initialSavedProgress.ratio) < 0.015, "opening at the top does not overwrite saved progress before a choice");

  await evaluate(cdp, `document.querySelector('#reader-continue').click()`);
  await waitFor(cdp, `(() => {
    const scroll = document.querySelector('#reader-scroll');
    const maximum = scroll.scrollHeight - scroll.clientHeight;
    const stored = JSON.parse(localStorage.getItem('reading-room-demo-v1')).progress['india-month'].ratio;
    return document.querySelector('#reader-resume').hidden && maximum > 1 && Math.abs(scroll.scrollTop / maximum - stored) < 0.015;
  })()`, "Continue reading to restore the saved normalized position after layout", 10000);
  const continuedRatio = await evaluate(cdp, `(() => {
    const scroll = document.querySelector('#reader-scroll');
    return scroll.scrollTop / (scroll.scrollHeight - scroll.clientHeight);
  })()`);
  assert.ok(Math.abs(continuedRatio - initialSavedProgress.ratio) < 0.015, "Continue reading restores the saved normalized ratio using the current laid-out content");
  await evaluate(cdp, `new Promise(resolve => setTimeout(resolve, 320))`);

  await evaluate(cdp, `document.querySelector('#reader-close').click()`);
  await waitFor(cdp, `document.querySelector('#reader').open === false`, "reader to close after continuing");
  await evaluate(cdp, `document.querySelector('[data-story-id="india-month"] .story-title-button').click()`);
  await waitFor(cdp, `document.querySelector('#reader')?.open === true && document.querySelector('#reader').hidden === false && document.querySelector('#reader-scroll').clientHeight > 0 && document.querySelector('#reader-resume').hidden === false`, "the saved resume choices to return after continued reading");
  await evaluate(cdp, `new Promise(resolve => setTimeout(resolve, 80))`);
  assert.equal(await evaluate(cdp, `document.querySelector('#reader-scroll').scrollTop`), 0, "reopening after continued reading still starts at the top");

  await evaluate(cdp, `document.querySelector('#reader-start-over').click()`);
  const resetState = await evaluate(cdp, `(() => {
    const saved = JSON.parse(localStorage.getItem('reading-room-demo-v1')).progress['india-month'];
    return {
      ratio: saved.ratio,
      finished: saved.finished,
      scrollTop: document.querySelector('#reader-scroll').scrollTop,
      promptHidden: document.querySelector('#reader-resume').hidden,
      progressPercent: document.querySelector('.reader-progress').getAttribute('aria-valuenow')
    };
  })()`);
  assert.deepEqual(resetState, {
    ratio: 0,
    finished: false,
    scrollTop: 0,
    promptHidden: true,
    progressPercent: "0"
  }, "Start from beginning resets the current position and its device-local progress state");

  await evaluate(cdp, `document.querySelector('#reader-close').click()`);
  await waitFor(cdp, `document.querySelector('#reader').open === false`, "reader to close after starting over");
  await evaluate(cdp, `document.querySelector('[data-story-id="india-month"] .story-title-button').click()`);
  await waitFor(cdp, `document.querySelector('#reader')?.open === true && document.querySelector('#reader').hidden === false && document.querySelector('#reader-scroll').clientHeight > 0`, "reader to reopen visibly after starting over");
  await evaluate(cdp, `new Promise(resolve => setTimeout(resolve, 80))`);
  const afterStartOverReopen = await evaluate(cdp, `(() => ({
    scrollTop: document.querySelector('#reader-scroll').scrollTop,
    promptHidden: document.querySelector('#reader-resume').hidden,
    progress: JSON.parse(localStorage.getItem('reading-room-demo-v1')).progress['india-month']
  }))()`);
  assert.equal(afterStartOverReopen.scrollTop, 0, "the story remains at the top after a later open");
  assert.equal(afterStartOverReopen.promptHidden, true, "a reset story no longer shows a stale resume prompt");
  assert.deepEqual(afterStartOverReopen.progress, { ratio: 0, finished: false }, "the previous saved position does not silently reappear");
});
