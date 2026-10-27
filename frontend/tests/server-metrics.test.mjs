import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import * as zod from "zod";

function evaluate(relativePath, requireModule) {
    const source = fs.readFileSync(new URL(relativePath, import.meta.url), "utf8");
    const code = ts.transpileModule(source, {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    const exports = {};
    vm.runInNewContext(code, { exports, require: requireModule });
    return exports;
}

const schema = evaluate("../app/admin/_schemas/server-metrics.ts", () => zod);
const example = JSON.parse(
    fs.readFileSync(
        new URL("../app/admin/_data/server-metrics.example.json", import.meta.url),
        "utf8",
    ),
);

test("documented server event validates, including zero utilization", () => {
    assert.equal(example.type, "server.metrics");
    assert(schema.serverMetricsSchema.safeParse(example.data).success);
    assert(
        schema.serverMetricsSchema.safeParse({ ...example.data, cpu_usage: 0, uptime_seconds: 0 })
            .success,
    );
});

test("invalid, missing, out-of-range and malformed values are rejected", () => {
    for (const payload of [
        null,
        {},
        { ...example.data, cpu_usage: 101 },
        { ...example.data, memory_usage: -1 },
        { ...example.data, disk_usage: "78" },
        { ...example.data, uptime_seconds: -1 },
        { ...example.data, timestamp: "bad date" },
        { ...example.data, hostname: "" },
    ]) {
        assert.equal(schema.serverMetricsSchema.safeParse(payload).success, false);
    }
});

test("uptime is formatted consistently", () => {
    assert.equal(schema.formatUptime(0), "0d 0h 0m");
    assert.equal(schema.formatUptime(90061), "1d 1h 1m");
});

test("overview hook waits, receives updates and preserves last valid metrics", () => {
    const slots = [];
    let cursor = 0;
    let receive;
    const hook = evaluate("../app/admin/_hooks/useServerMetrics.ts", (name) => {
        if (name === "react")
            return {
                useState(initial) {
                    const index = cursor++;
                    if (!(index in slots)) slots[index] = initial;
                    return [
                        slots[index],
                        (value) => {
                            slots[index] =
                                typeof value === "function" ? value(slots[index]) : value;
                        },
                    ];
                },
            };
        if (name === "@/hooks/useWebSocketEvent")
            return {
                useWebSocketEvent(type, handler) {
                    assert.equal(type, "server.metrics");
                    receive = handler;
                    return { status: "connected", isConnected: true };
                },
            };
        return schema;
    });
    function render() {
        cursor = 0;
        return hook.useServerMetrics();
    }
    assert.equal(render().metrics, null);
    receive({ cpu_usage: 47 });
    assert.equal(render().metrics.cpu_usage, 47);
    assert.equal(render().metrics.memory_usage, undefined);
    assert(render().receivedAt);
    receive(example.data);
    assert.equal(render().metrics.hostname, "production-01");
    receive({ ...example.data, cpu_usage: 0 });
    assert.equal(render().metrics.cpu_usage, 0);
    receive({ broken: true });
    assert.equal(render().invalidPayload, true);
    assert.equal(render().metrics.cpu_usage, 0);
    receive(example.data);
    assert.equal(render().invalidPayload, false);
    receive({ cpu_usage: 12 });
    assert.equal(render().metrics.cpu_usage, 12);
    assert.equal(render().metrics.memory_usage, example.data.memory_usage);
    receive({ cpu_usage: 101 });
    assert.equal(render().metrics.cpu_usage, 12);
});
