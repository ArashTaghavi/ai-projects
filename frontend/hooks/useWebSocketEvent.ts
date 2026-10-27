"use client";

import { useWebSocket, type SocketEvent } from "./useWebSocket";

/** Filters the server's { type, data } envelopes without creating another connection. */
export function useWebSocketEvent<T>(
    type: string,
    handler: (data: T) => void,
    options: { url?: string; enabled?: boolean } = {},
) {
    return useWebSocket<SocketEvent<T>>(options.url, {
        enabled: options.enabled,
        onMessage: (message) => {
            if (
                message &&
                typeof message === "object" &&
                message.type === type &&
                "data" in message
            )
                handler(message.data);
        },
    });
}
