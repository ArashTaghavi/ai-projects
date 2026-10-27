import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));

function setup(env = {}) {
    const timers = new Map();
    let sequence = 0;
    const sockets = [];
    class FakeWebSocket {
        static OPEN = 1;
        readyState = 0;
        bufferedAmount = 0;
        sent = [];
        constructor(url) {
            this.url = url;
            sockets.push(this);
        }
        open() {
            this.readyState = 1;
            this.onopen?.();
        }
        receive(data) {
            this.onmessage?.({ data });
        }
        close(code = 1000) {
            this.readyState = 3;
            this.onclose?.({ code });
        }
        send(data) {
            this.sent.push(data);
        }
    }
    const source = fs.readFileSync(path.join(testDirectory, "../lib/websocket/client.ts"), "utf8");
    const code = ts.transpileModule(source, {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    const exports = {};
    vm.runInNewContext(code, {
        exports,
        WebSocket: FakeWebSocket,
        URL,
        console,
        process: { env },
        window: { location: { origin: "https://frontend.example" } },
        setTimeout: (callback, delay) => {
            const id = ++sequence;
            timers.set(id, { callback, delay });
            return id;
        },
        clearTimeout: (id) => timers.delete(id),
    });
    function tick() {
        const next = [...timers.entries()].sort((a, b) => a[1].delay - b[1].delay)[0];
        assert(next, "a timer should be scheduled");
        timers.delete(next[0]);
        next[1].callback();
    }
    return { ...exports, sockets, timers, tick };
}

test("URL resolution uses backend settings and secure protocols", () => {
    const configured = setup({ NEXT_PUBLIC_API_URL: "https://api.example/api/" });
    assert.equal(configured.resolveSocketUrl(), "wss://api.example/api/ws");
    assert.equal(configured.resolveSocketUrl("/ws"), "wss://frontend.example/ws");
    assert.equal(
        setup({ NEXT_PUBLIC_WS_URL: "ws://localhost:8000/ws" }).resolveSocketUrl(),
        "ws://localhost:8000/ws",
    );
    assert.throws(() => configured.resolveSocketUrl("ftp://example.com/ws"));
});

test("consumers share a connection and final unmount closes it", () => {
    const env = setup();
    const client = env.getSocketClient("ws://example.com/ws");
    assert.equal(client, env.getSocketClient("ws://example.com/ws"));
    const first = client.subscribe(() => {});
    const second = client.subscribe(() => {});
    assert.equal(env.sockets.length, 1);
    first();
    assert.equal(env.timers.size, 0);
    second();
    env.tick();
    assert.equal(env.sockets[0].readyState, 3);
    assert.equal(client.getSnapshot().status, "idle");
});

test("Strict Mode cleanup and resubscribe do not duplicate connections", () => {
    const env = setup();
    const client = env.getSocketClient();
    client.subscribe(() => {})();
    const unsubscribe = client.subscribe(() => {});
    assert.equal(env.timers.size, 0);
    assert.equal(env.sockets.length, 1);
    unsubscribe();
    env.tick();
});

test("all events arrive, JSON and text work, history stays bounded", () => {
    const env = setup();
    const client = env.getSocketClient();
    client.subscribe(() => {});
    const seen = [];
    const remove = client.subscribeMessages((data) => seen.push(data));
    env.sockets[0].open();
    env.sockets[0].receive('{"type":"user.created","data":{"id":1}}');
    assert.equal(seen[0].data.id, 1);
    for (let i = 0; i < 110; i++) env.sockets[0].receive(`text ${i}`);
    assert.equal(seen.length, 111);
    assert.equal(client.getSnapshot().messages.length, 100);
    assert.equal(client.getSnapshot().lastMessage, "text 109");
    remove();
    env.sockets[0].receive("unsubscribed");
    assert.equal(seen.length, 111);
});

test("sending respects connection state, serialization and backpressure", () => {
    const env = setup();
    const client = env.getSocketClient();
    client.subscribe(() => {});
    assert.equal(client.sendMessage("offline"), false);
    env.sockets[0].open();
    assert.equal(client.sendMessage({ type: "ping" }), true);
    assert.equal(env.sockets[0].sent[0], '{"type":"ping"}');
    assert.equal(client.sendMessage("hello"), true);
    assert.equal(client.sendMessage(undefined), false);
    const circular = {};
    circular.self = circular;
    assert.equal(client.sendMessage(circular), false);
    env.sockets[0].bufferedAmount = 2 * 1024 * 1024;
    assert.equal(client.sendMessage("too much"), false);
});

test("abnormal disconnect retries, recovers, and normal close stops", () => {
    const env = setup();
    const client = env.getSocketClient();
    client.subscribe(() => {});
    env.sockets[0].close(1006);
    assert.equal(client.getSnapshot().status, "reconnecting");
    env.tick();
    assert.equal(env.sockets.length, 2);
    env.sockets[1].open();
    assert.equal(client.getSnapshot().reconnectAttempts, 0);
    env.sockets[1].close(1000);
    assert.equal(client.getSnapshot().status, "closed");
    assert.equal(env.timers.size, 0);
    client.reconnect();
    assert.equal(env.sockets.length, 3);
});

test("retry exhaustion and policy rejection do not loop forever", () => {
    const env = setup();
    const client = env.getSocketClient();
    client.subscribe(() => {});
    for (let i = 0; i < 8; i++) {
        env.sockets.at(-1).close(1006);
        env.tick();
    }
    env.sockets.at(-1).close(1006);
    assert.equal(client.getSnapshot().status, "error");
    assert.equal(env.timers.size, 0);
    client.reconnect();
    env.sockets.at(-1).close(1008);
    assert.equal(client.getSnapshot().status, "closed");
    assert.equal(env.timers.size, 0);
});

test("unmount cancels retries and stale sockets cannot publish", () => {
    const env = setup();
    const client = env.getSocketClient();
    const unsubscribe = client.subscribe(() => {});
    const staleCallback = env.sockets[0].onmessage;
    env.sockets[0].close(1006);
    unsubscribe();
    env.tick();
    assert.equal(env.timers.size, 0);
    staleCallback({ data: "late message" });
    assert.equal(client.getSnapshot().lastMessage, null);
});
