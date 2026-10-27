import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const source = fs.readFileSync(
    new URL("../app/admin/tic-tac-toe/_lib/game.ts", import.meta.url),
    "utf8",
);
const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const exports = {};
vm.runInNewContext(code, { exports });
const { outcome, bestMove, initialGame, gameReducer } = exports;

test("rows, columns and diagonals win; a full board can draw", () => {
    for (const line of [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ]) {
        const board = Array(9).fill(null);
        line.forEach((index) => (board[index] = "X"));
        assert.equal(outcome(board).winner, "X");
    }
    assert.equal(outcome(["X", "O", "X", "X", "O", "O", "O", "X", "X"]).winner, "draw");
    assert.equal(outcome(Array(9).fill(null)).winner, null);
});

test("invalid moves are ignored, results count once and rounds alternate", () => {
    let state = initialGame("local");
    assert.equal(gameReducer(state, { type: "move", index: 0, player: "O" }), state);
    assert.equal(gameReducer(state, { type: "move", index: 12, player: "X" }), state);
    for (const index of [0, 3, 1, 4, 2])
        state = gameReducer(state, { type: "move", index, player: state.turn });
    assert.equal(state.scores.X, 1);
    assert.equal(state.history.length, 1);
    assert.equal(gameReducer(state, { type: "move", index: 8, player: state.turn }), state);
    const next = gameReducer(state, { type: "next" });
    assert.equal(next.starter, "O");
    assert.equal(next.turn, "O");
    assert.equal(next.round, 2);
    assert.equal(next.scores.X, 1);
    assert(next.board.every((cell) => cell === null));
    const reset = gameReducer(next, { type: "mode", mode: "computer" });
    assert.equal(reset.scores.X, 0);
    assert.equal(reset.history.length, 0);
});

test("restarting an unfinished round preserves scores and starting player", () => {
    let state = initialGame();
    state = gameReducer(state, { type: "move", index: 4, player: "X" });
    assert.equal(gameReducer(state, { type: "move", index: 4, player: "O" }), state);
    state = gameReducer(state, { type: "next" });
    assert.equal(state.round, 1);
    assert.equal(state.starter, "X");
    assert(state.board.every((cell) => cell === null));
});

test("computer takes a win and blocks an immediate loss", () => {
    assert.equal(bestMove(["O", "O", null, "X", "X", null, null, null, null], "O"), 2);
    assert.equal(bestMove(["X", "X", null, null, "O", null, null, null, null], "O"), 2);
    assert.equal(bestMove(["X", "X", "X", null, "O", null, null, null, null], "O"), null);
});

test("computer cannot lose against any sequence of human moves, starting first or second", () => {
    let endings = 0;
    function play(board, turn) {
        const { winner } = outcome(board);
        if (winner) {
            assert.notEqual(winner, "X");
            endings++;
            return;
        }
        if (turn === "O") {
            const index = bestMove(board, "O");
            assert.equal(board[index], null);
            const next = [...board];
            next[index] = "O";
            play(next, "X");
        } else {
            board.forEach((cell, index) => {
                if (cell) return;
                const next = [...board];
                next[index] = "X";
                play(next, "O");
            });
        }
    }
    play(Array(9).fill(null), "X");
    play(Array(9).fill(null), "O");
    assert(endings > 100);
});
