import type { SocketSnapshot } from "./types";

export const idleSnapshot: SocketSnapshot = {
    status: "idle",
    messages: [],
    lastMessage: null,
    error: null,
    reconnectAttempts: 0,
};

export function resolveSocketUrl(url?: string): string {
    const origin = typeof window === "undefined" ? "http://localhost:8000" : window.location.origin;
    const configured = url ?? process.env.NEXT_PUBLIC_WS_URL;
    const api = new URL(process.env.NEXT_PUBLIC_API_URL || origin, origin);
    const resolved = configured
        ? new URL(configured, origin)
        : new URL(`${api.pathname.replace(/\/$/, "")}/ws`, api.origin);
    if (resolved.protocol === "https:") resolved.protocol = "wss:";
    if (resolved.protocol === "http:") resolved.protocol = "ws:";
    if (!["ws:", "wss:"].includes(resolved.protocol))
        throw new Error("WebSocket URL must use ws:// or wss://");
    return resolved.toString();
}

/** One connection per URL, shared by all mounted hook consumers. */
export class SocketClient {
    private socket: WebSocket | null = null;
    private listeners = new Set<() => void>();
    private messageListeners = new Set<(data: unknown, raw: string) => void>();
    private retryTimer: ReturnType<typeof setTimeout> | undefined;
    private releaseTimer: ReturnType<typeof setTimeout> | undefined;
    private snapshot = idleSnapshot;

    constructor(readonly url: string) {}

    getSnapshot = () => this.snapshot;

    private update(patch: Partial<SocketSnapshot>) {
        this.snapshot = { ...this.snapshot, ...patch };
        this.listeners.forEach((listener) => listener());
    }

    subscribe = (listener: () => void) => {
        clearTimeout(this.releaseTimer);
        this.listeners.add(listener);
        if (this.listeners.size === 1 && !this.socket && !this.retryTimer) this.connect();
        return () => {
            this.listeners.delete(listener);
            if (this.listeners.size) return;
            // Avoid opening a second socket during React Strict Mode's effect replay.
            this.releaseTimer = setTimeout(() => {
                if (this.listeners.size) return;
                this.stop();
                this.snapshot = idleSnapshot;
            }, 0);
        };
    };

    subscribeMessages = (listener: (data: unknown, raw: string) => void) => {
        this.messageListeners.add(listener);
        return () => {
            this.messageListeners.delete(listener);
        };
    };

    private connect() {
        if (!this.listeners.size || this.socket) return;
        this.update({
            status: this.snapshot.reconnectAttempts ? "reconnecting" : "connecting",
            error: null,
        });
        let socket: WebSocket;
        try {
            socket = new WebSocket(this.url);
        } catch {
            this.update({ status: "error", error: "Could not create WebSocket connection" });
            return;
        }
        this.socket = socket;
        socket.onopen = () => {
            if (this.socket === socket)
                this.update({ status: "connected", error: null, reconnectAttempts: 0 });
        };
        socket.onmessage = (event: MessageEvent) => {
            if (this.socket !== socket || typeof event.data !== "string") return;
            let data: unknown = event.data;
            try {
                data = JSON.parse(event.data);
            } catch {
                /* Plain text messages are supported too. */
            }
            this.update({
                lastMessage: data,
                messages: [...this.snapshot.messages.slice(-99), event.data],
            });
            this.messageListeners.forEach((listener) => {
                try {
                    listener(data, event.data);
                } catch (error) {
                    console.error("WebSocket message handler failed", error);
                }
            });
        };
        socket.onerror = () => {
            if (this.socket === socket) this.update({ error: "WebSocket connection failed" });
        };
        socket.onclose = (event) => {
            if (this.socket !== socket) return;
            this.socket = null;
            if (!this.listeners.size) return;
            if ([1000, 1003, 1008, 4401, 4403].includes(event.code)) {
                this.update({
                    status: "closed",
                    error: event.code === 1000 ? null : "WebSocket connection rejected by server",
                });
                return;
            }
            const attempts = this.snapshot.reconnectAttempts + 1;
            if (attempts > 8) {
                this.update({
                    status: "error",
                    error: "Reconnect limit reached. Use reconnect() to try again.",
                });
                return;
            }
            this.update({ status: "reconnecting", reconnectAttempts: attempts });
            const delay = Math.min(1000 * 2 ** (attempts - 1), 30000) + Math.random() * 300;
            this.retryTimer = setTimeout(() => {
                this.retryTimer = undefined;
                this.connect();
            }, delay);
        };
    }

    private stop() {
        clearTimeout(this.retryTimer);
        this.retryTimer = undefined;
        const socket = this.socket;
        this.socket = null;
        if (socket) {
            socket.onopen = socket.onclose = socket.onerror = socket.onmessage = null;
            socket.close(1000, "No active consumers");
        }
    }

    reconnect = () => {
        this.stop();
        this.update({ reconnectAttempts: 0, error: null });
        this.connect();
    };

    /** Returns false when disconnected, payload cannot serialize, or the send buffer is full. */
    sendMessage = (message: unknown): boolean => {
        if (this.socket?.readyState !== WebSocket.OPEN || this.socket.bufferedAmount > 1024 * 1024)
            return false;
        try {
            const payload = typeof message === "string" ? message : JSON.stringify(message);
            if (payload === undefined) return false;
            this.socket.send(payload);
            return true;
        } catch {
            return false;
        }
    };
}

const clients = new Map<string, SocketClient>();

export function getSocketClient(url?: string): SocketClient {
    const resolved = resolveSocketUrl(url);
    let client = clients.get(resolved);
    if (!client) {
        client = new SocketClient(resolved);
        clients.set(resolved, client);
    }
    return client;
}
