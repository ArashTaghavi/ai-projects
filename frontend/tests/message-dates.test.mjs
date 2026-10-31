import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const source = fs.readFileSync(
    new URL("../app/admin/projects/chat_with_document/_lib/message-dates.ts", import.meta.url),
    "utf8",
);
const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const exports = {};
vm.runInNewContext(code, { exports });
const { groupMessagesByDay, messageDate } = exports;

test("messages split at midnight in Tehran, independent of host timezone", () => {
    const timestamps = ["2026-10-31T20:29:00Z", "2026-10-31T20:30:00Z", "2026-11-01T08:00:00Z"];
    const groups = groupMessagesByDay(
        timestamps.map((created_at, id) => ({ id, created_at, question: "Q", answer: "A" })),
    );
    assert.equal(groups.length, 2);
    assert.equal(groups[0].turns.length, 1);
    assert.equal(groups[1].turns.length, 2);
    assert.notEqual(groups[0].label, groups[1].label);
    assert.equal(messageDate(timestamps[0]).time, "۲۳:۵۹");
    assert.equal(messageDate(timestamps[1]).time, "۰۰:۰۰");
});

test("timestamps with equivalent offsets have the same day and display time", () => {
    assert.equal(
        messageDate("2026-10-31T20:30:00Z").full,
        messageDate("2026-11-01T00:00:00+03:30").full,
    );
    assert.match(messageDate("2026-10-31T20:30:00Z").label, /۱۴۰۵/);
});

test("empty history and malformed timestamps remain renderable", () => {
    assert.equal(groupMessagesByDay([]).length, 0);
    assert.equal(messageDate("invalid").iso, undefined);
    assert.equal(groupMessagesByDay([{ id: 1, created_at: "invalid" }])[0].label, "تاریخ نامشخص");
});
