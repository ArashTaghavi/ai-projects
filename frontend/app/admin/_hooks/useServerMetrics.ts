"use client";

import { useState } from "react";
import { useWebSocketEvent } from "@/hooks/useWebSocketEvent";
import { serverMetricsSchema, type ServerMetrics } from "../_schemas/server-metrics";

export function useServerMetrics() {
    const [metrics, setMetrics] = useState<ServerMetrics | null>(null);
    const [invalidPayload, setInvalidPayload] = useState(false);
    const [receivedAt, setReceivedAt] = useState<string | null>(null);
    const connection = useWebSocketEvent<unknown>("server.metrics", (payload) => {
        const parsed = serverMetricsSchema.safeParse(payload);
        setInvalidPayload(!parsed.success);
        if (parsed.success) {
            setMetrics((previous) => ({ ...previous, ...parsed.data }));
            setReceivedAt(new Date().toISOString());
        }
    });

    return { ...connection, metrics, receivedAt, invalidPayload };
}
