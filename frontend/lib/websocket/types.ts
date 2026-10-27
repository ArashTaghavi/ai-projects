export interface SocketEvent<T = unknown> {
    type: string;
    data: T;
}

export type SocketStatus =
    "idle" | "connecting" | "connected" | "reconnecting" | "closed" | "error";

export interface SocketSnapshot {
    status: SocketStatus;
    messages: readonly string[];
    lastMessage: unknown;
    error: string | null;
    reconnectAttempts: number;
}
