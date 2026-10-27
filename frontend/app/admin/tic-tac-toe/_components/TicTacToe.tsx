"use client";

import { useEffect, useReducer } from "react";
import { ArrowRight, Bot, Gamepad2, RotateCcw, Sparkles, Trophy, UsersRound } from "lucide-react";
import { Button, Panel, StatusBadge } from "@/components/ui";
import AdminPage from "../../_components/layout/AdminPage";
import { bestMove, gameReducer, initialGame, outcome, type Mark, type Mode } from "../_lib/game";
import styles from "./TicTacToe.module.css";

function MarkIcon({ mark }: { mark: Mark }) {
    return (
        <svg
            viewBox="0 0 64 64"
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            className={styles.mark}
            aria-hidden="true"
        >
            {mark === "X" ? (
                <path d="M16 16 48 48 M48 16 16 48" />
            ) : (
                <circle cx="32" cy="32" r="21" />
            )}
        </svg>
    );
}

export default function TicTacToe() {
    const [game, dispatch] = useReducer(gameReducer, undefined, () => initialGame());
    const result = outcome(game.board);
    const thinking = game.mode === "computer" && game.turn === "O" && !result.winner;
    const opponent = game.mode === "computer" ? "Computer" : "Player O";
    const player = game.mode === "computer" ? "You" : "Player X";
    const status =
        result.winner === "draw"
            ? "A perfect standoff."
            : result.winner
              ? `${result.winner === "X" ? player : opponent} won this round!`
              : thinking
                ? "Computer is thinking..."
                : `${game.turn === "X" ? player : opponent}, your move.`;

    useEffect(() => {
        if (!thinking) return;
        const timer = setTimeout(() => {
            const index = bestMove(game.board, "O");
            if (index !== null) dispatch({ type: "move", index, player: "O" });
        }, 520);
        return () => clearTimeout(timer);
    }, [thinking, game.board]);

    const center = (index: number) => ({
        x: (index % 3) * 34 + 16,
        y: Math.floor(index / 3) * 34 + 16,
    });
    const start = result.line ? center(result.line[0]) : null;
    const end = result.line ? center(result.line[2]) : null;

    return (
        <AdminPage
            title="Tic-tac-toe"
            description="A little break. Three in a row. One more round."
            icon={<Gamepad2 className="size-5" />}
            actions={
                <Button
                    size="sm"
                    variant="secondary"
                    startIcon={<RotateCcw size={14} />}
                    onClick={() => dispatch({ type: "reset" })}
                >
                    Reset scores
                </Button>
            }
        >
            <div className="relative overflow-hidden p-4 sm:p-7 lg:p-9">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-32 left-1/3 size-96 rounded-full bg-violet-500/[0.06] blur-3xl"
                />
                <div className="relative mx-auto grid max-w-5xl items-start gap-7 lg:grid-cols-[minmax(0,1.35fr)_minmax(260px,1fr)] lg:gap-12">
                    <div>
                        <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
                            <span className="flex items-center gap-2 text-[10px] font-medium tracking-[.2em] text-violet-300 uppercase">
                                <Sparkles size={13} aria-hidden="true" />
                                The little arcade
                            </span>
                            <StatusBadge>Round {String(game.round).padStart(2, "0")}</StatusBadge>
                        </div>
                        <div className="mb-6 text-center">
                            <h2
                                className="text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl"
                                role="status"
                                aria-live="polite"
                            >
                                {status}
                            </h2>
                            <p className="mt-2 text-xs text-zinc-500">
                                {result.winner
                                    ? "Ready for a rematch?"
                                    : "Place your mark. Make your move."}
                            </p>
                        </div>
                        <div className={`${styles.board} mx-auto w-full max-w-[430px]`}>
                            <div
                                role="group"
                                aria-label="Tic-tac-toe board"
                                aria-busy={thinking}
                                className="grid grid-cols-3 gap-2.5 sm:gap-3"
                            >
                                {game.board.map((mark, index) => {
                                    const winning = result.line?.includes(index);
                                    return (
                                        <button
                                            key={index}
                                            type="button"
                                            aria-label={`Row ${Math.floor(index / 3) + 1}, column ${(index % 3) + 1}: ${mark ?? "empty"}`}
                                            disabled={Boolean(mark || result.winner || thinking)}
                                            onClick={() =>
                                                dispatch({ type: "move", index, player: game.turn })
                                            }
                                            className={`${styles.cell} flex w-full items-center justify-center rounded-2xl border focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400 disabled:cursor-default ${mark === "X" ? "text-violet-300" : "text-cyan-300"} ${winning ? "border-emerald-300/40 bg-emerald-400/[0.07]" : mark ? "border-white/10 bg-white/[0.035]" : "cursor-pointer border-white/[0.08] bg-white/[0.015] hover:border-violet-400/30 hover:bg-violet-400/[0.04]"}`}
                                        >
                                            {mark && <MarkIcon mark={mark} />}
                                        </button>
                                    );
                                })}
                            </div>
                            {start && end && (
                                <svg
                                    viewBox="0 0 100 100"
                                    className="pointer-events-none absolute inset-0 size-full text-emerald-300/70"
                                    aria-hidden="true"
                                >
                                    <line
                                        x1={start.x}
                                        y1={start.y}
                                        x2={end.x}
                                        y2={end.y}
                                        stroke="currentColor"
                                        strokeWidth="1"
                                        strokeLinecap="round"
                                        className={styles.winningLine}
                                    />
                                </svg>
                            )}
                        </div>
                        <div className="mx-auto mt-6 flex max-w-[430px] items-center justify-between gap-3">
                            <p className="text-[11px] text-zinc-500">
                                {game.starter === "X" ? player : opponent} starts this round
                            </p>
                            <Button
                                size="sm"
                                variant={result.winner ? "primary" : "secondary"}
                                endIcon={<ArrowRight size={14} />}
                                onClick={() => dispatch({ type: "next" })}
                            >
                                {result.winner ? "Next round" : "Restart round"}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-5">
                        <Panel title="Choose your opponent" contentClassName="p-3">
                            <div className="grid grid-cols-2 gap-2">
                                {(
                                    [
                                        { mode: "computer", label: "Computer", icon: Bot },
                                        { mode: "local", label: "Two players", icon: UsersRound },
                                    ] as const
                                ).map(({ mode, label, icon: Icon }) => (
                                    <button
                                        key={mode}
                                        type="button"
                                        aria-pressed={game.mode === mode}
                                        onClick={() =>
                                            dispatch({ type: "mode", mode: mode as Mode })
                                        }
                                        className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border px-2 py-4 text-xs transition focus-visible:outline-2 focus-visible:outline-violet-400 ${game.mode === mode ? "border-violet-400/30 bg-violet-400/10 text-violet-200" : "border-white/[0.06] text-zinc-500 hover:bg-white/5 hover:text-zinc-300"}`}
                                    >
                                        <Icon size={19} aria-hidden="true" />
                                        {label}
                                    </button>
                                ))}
                            </div>
                            <p className="mt-3 text-center text-[10px] leading-5 text-zinc-500">
                                {game.mode === "computer"
                                    ? "A worthy opponent. Can you force a draw?"
                                    : "Same screen. Take turns. Challenge a friend."}
                                <br />
                                Changing mode starts a fresh match.
                            </p>
                        </Panel>
                        <Panel
                            title="Match score"
                            action={
                                <Trophy size={14} className="text-amber-300" aria-hidden="true" />
                            }
                            contentClassName="p-4"
                        >
                            <div className="grid grid-cols-3 divide-x divide-white/[0.06] text-center">
                                {[
                                    {
                                        label: player,
                                        value: game.scores.X,
                                        mark: "X",
                                        color: "text-violet-300",
                                    },
                                    {
                                        label: "Draws",
                                        value: game.scores.draw,
                                        mark: "=",
                                        color: "text-zinc-500",
                                    },
                                    {
                                        label: opponent,
                                        value: game.scores.O,
                                        mark: "O",
                                        color: "text-cyan-300",
                                    },
                                ].map((item) => (
                                    <div key={item.mark}>
                                        <p className={`text-xs font-medium ${item.color}`}>
                                            {item.mark}
                                        </p>
                                        <p className="my-2 text-3xl font-semibold tabular-nums">
                                            {item.value}
                                        </p>
                                        <p className="text-[10px] text-zinc-500">{item.label}</p>
                                    </div>
                                ))}
                            </div>
                        </Panel>
                        <Panel title="Recent rounds" contentClassName="p-4">
                            {game.history.length ? (
                                <ol className="space-y-3">
                                    {game.history.map((round) => (
                                        <li
                                            key={round.round}
                                            className="flex justify-between gap-3 text-[11px]"
                                        >
                                            <span className="text-zinc-500">
                                                Round {round.round}
                                            </span>
                                            <span
                                                className={
                                                    round.winner === "X"
                                                        ? "text-violet-300"
                                                        : round.winner === "O"
                                                          ? "text-cyan-300"
                                                          : "text-zinc-400"
                                                }
                                            >
                                                {round.winner === "draw"
                                                    ? "Draw"
                                                    : `${round.winner === "X" ? player : opponent} won`}
                                            </span>
                                        </li>
                                    ))}
                                </ol>
                            ) : (
                                <p className="text-xs leading-6 text-zinc-500">
                                    Your story starts with the first move. Completed rounds will
                                    appear here.
                                </p>
                            )}
                        </Panel>
                        <p className="px-1 text-[10px] leading-5 text-zinc-600">
                            Three matching marks in a row, column or diagonal wins. The starting
                            player alternates between rounds. Scores last for this visit.
                        </p>
                    </div>
                </div>
            </div>
        </AdminPage>
    );
}
