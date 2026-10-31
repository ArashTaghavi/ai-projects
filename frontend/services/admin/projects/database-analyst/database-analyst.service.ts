import { z } from "zod";
import { resolveSocketUrl } from "@/lib/websocket/client";

const answerSchema = z.object({
    initial_sql: z.string(),
    sql: z.string(),
    text: z.string(),
    result: z.string(),
    success: z.boolean(),
    refined: z.boolean(),
    feedback: z.string(),
});

const progressSchema = z.object({ stage: z.string(), message: z.string() });
const eventSchema = z.discriminatedUnion("type", [
    z.object({ type: z.literal("progress"), data: progressSchema }),
    z.object({ type: z.literal("result"), data: answerSchema }),
    z.object({ type: z.literal("error"), data: z.object({ message: z.string() }) }),
]);

export type DatabaseAnswer = z.infer<typeof answerSchema>;
export type DatabaseProgress = z.infer<typeof progressSchema>;

export const databaseAnalystService = {
    ask: ({
        query,
        onProgress,
        signal,
    }: {
        query: string;
        onProgress?: (progress: DatabaseProgress) => void;
        signal?: AbortSignal;
    }) =>
        new Promise<DatabaseAnswer>((resolve, reject) => {
            if (signal?.aborted) {
                reject(new Error("Request cancelled."));
                return;
            }
            const url = new URL(resolveSocketUrl());
            url.pathname = `${url.pathname.replace(/\/ws\/?$/, "")}/database-analyst/ws`;
            const socket = new WebSocket(url.toString());
            let settled = false;
            const finish = (answer?: DatabaseAnswer, error?: Error) => {
                if (settled) return;
                settled = true;
                clearTimeout(timeout);
                signal?.removeEventListener("abort", abort);
                socket.onopen = socket.onmessage = socket.onerror = socket.onclose = null;
                socket.close();
                if (answer) resolve(answer);
                else
                    reject(
                        error ??
                            new Error(
                                "Connection closed before receiving a response. Please try again.",
                            ),
                    );
            };
            const abort = () => finish(undefined, new Error("Request cancelled."));
            const timeout = setTimeout(
                () => finish(undefined, new Error("The request timed out. Please try again.")),
                180_000,
            );
            signal?.addEventListener("abort", abort, { once: true });
            socket.onopen = () => socket.send(JSON.stringify({ query }));
            socket.onmessage = (event) => {
                try {
                    const message = eventSchema.parse(JSON.parse(event.data));
                    if (message.type === "progress") onProgress?.(message.data);
                    else if (message.type === "result") finish(message.data);
                    else finish(undefined, new Error(message.data.message));
                } catch {
                    finish(undefined, new Error("Invalid response received from the server."));
                }
            };
            socket.onerror = () =>
                finish(
                    undefined,
                    new Error(
                        "Could not connect to the server. Check your connection and sign-in, then try again.",
                    ),
                );
            socket.onclose = () => finish();
        }),
};
