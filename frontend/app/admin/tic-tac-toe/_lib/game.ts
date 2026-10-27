export type Mark = "X" | "O";
export type Board = (Mark | null)[];
export type Mode = "computer" | "local";

const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];

export function outcome(board: Board): { winner: Mark | "draw" | null; line: number[] | null } {
    for (const line of lines) {
        const [a, b, c] = line;
        if (board[a] && board[a] === board[b] && board[a] === board[c])
            return { winner: board[a], line };
    }
    return { winner: board.every(Boolean) ? "draw" : null, line: null };
}

export const other = (mark: Mark): Mark => (mark === "X" ? "O" : "X");

export function bestMove(board: Board, player: Mark): number | null {
    if (outcome(board).winner) return null;
    const order = [4, 0, 2, 6, 8, 1, 3, 5, 7];
    function score(cells: Board, turn: Mark, depth: number): number {
        const { winner } = outcome(cells);
        if (winner === "draw") return 0;
        if (winner) return winner === player ? 10 - depth : depth - 10;
        const scores = order
            .filter((index) => !cells[index])
            .map((index) => {
                const next = [...cells];
                next[index] = turn;
                return score(next, other(turn), depth + 1);
            });
        return turn === player ? Math.max(...scores) : Math.min(...scores);
    }
    let move: number | null = null;
    let highest = -Infinity;
    for (const index of order) {
        if (board[index]) continue;
        const next = [...board];
        next[index] = player;
        const value = score(next, other(player), 0);
        if (value > highest) {
            highest = value;
            move = index;
        }
    }
    return move;
}

export interface GameState {
    board: Board;
    turn: Mark;
    starter: Mark;
    mode: Mode;
    round: number;
    scores: Record<Mark | "draw", number>;
    history: { round: number; winner: Mark | "draw" }[];
}

export function initialGame(mode: Mode = "computer"): GameState {
    return {
        board: Array(9).fill(null),
        turn: "X",
        starter: "X",
        mode,
        round: 1,
        scores: { X: 0, O: 0, draw: 0 },
        history: [],
    };
}

export type GameAction =
    | { type: "move"; index: number; player: Mark }
    | { type: "next" }
    | { type: "reset" }
    | { type: "mode"; mode: Mode };

export function gameReducer(state: GameState, action: GameAction): GameState {
    if (action.type === "reset") return initialGame(state.mode);
    if (action.type === "mode")
        return action.mode === state.mode ? state : initialGame(action.mode);
    if (action.type === "next") {
        const finished = Boolean(outcome(state.board).winner);
        const starter = finished ? other(state.starter) : state.starter;
        return {
            ...state,
            board: Array(9).fill(null),
            turn: starter,
            starter,
            round: state.round + (finished ? 1 : 0),
        };
    }
    if (
        !Number.isInteger(action.index) ||
        action.index < 0 ||
        action.index > 8 ||
        action.player !== state.turn ||
        state.board[action.index] ||
        outcome(state.board).winner
    )
        return state;
    const board = [...state.board];
    board[action.index] = state.turn;
    const { winner } = outcome(board);
    return {
        ...state,
        board,
        turn: other(state.turn),
        scores: winner ? { ...state.scores, [winner]: state.scores[winner] + 1 } : state.scores,
        history: winner
            ? [{ round: state.round, winner }, ...state.history].slice(0, 6)
            : state.history,
    };
}
