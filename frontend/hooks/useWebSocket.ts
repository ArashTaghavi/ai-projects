"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { getSocketClient, idleSnapshot } from "@/lib/websocket/client";
import type { SocketEvent } from "@/lib/websocket/types";

export type { SocketEvent, SocketStatus } from "@/lib/websocket/types";

export interface UseWebSocketOptions<T> {
    enabled?: boolean;
    onMessage?: (message: T, raw: string) => void;
}

const subscribeIdle = () => () => {};
const getIdleSnapshot = () => idleSnapshot;

export function useWebSocket<T = SocketEvent>(
    url?: string,
    { enabled = true, onMessage }: UseWebSocketOptions<T> = {},
) {
    const client = useMemo(() => getSocketClient(url), [url]);
    const snapshot = useSyncExternalStore(
        enabled ? client.subscribe : subscribeIdle,
        enabled ? client.getSnapshot : getIdleSnapshot,
        getIdleSnapshot,
    );

    useEffect(() => {
        if (!enabled || !onMessage) return;
        return client.subscribeMessages((message, raw) => onMessage(message as T, raw));
    }, [client, enabled, onMessage]);

    return {
        ...snapshot,
        lastMessage: snapshot.lastMessage as T | null,
        isConnected: snapshot.status === "connected",
        sendMessage: client.sendMessage,
        reconnect: client.reconnect,
    };
}
