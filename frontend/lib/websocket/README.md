# Shared WebSocket client

Run the isolated connection lifecycle tests from `frontend` with
`node tests/websocket.test.mjs` (no running server required).

Use these hooks in Client Components. No Provider or package installation is needed.
Every active consumer of the same URL shares one connection. It closes after the
last consumer unmounts or sets `enabled: false`. Nothing connects globally by default.

The URL comes from `NEXT_PUBLIC_WS_URL`, or from `NEXT_PUBLIC_API_URL` with `/ws`
appended. HTTP/HTTPS is converted to WS/WSS. Pass a URL to override it. Without either
environment variable the current browser origin is used. Configure `NEXT_PUBLIC_WS_URL`
when the backend runs on another host or port. Restart Next.js after changing env values.

```tsx
"use client";

import { useWebSocket } from "@/hooks/useWebSocket";

export default function SocketExample() {
    const { isConnected, status, lastMessage, sendMessage, reconnect, error } = useWebSocket();
    // JSON is parsed automatically. Text stays text. The generic is a TypeScript
    // contract; validate untrusted payloads before using them as application data.
    return (
        <div>
            <p>{status}</p>
            <pre>{JSON.stringify(lastMessage)}</pre>
            <button disabled={!isConnected} onClick={() => sendMessage("hello")}>
                Send
            </button>
            {error && <button onClick={reconnect}>Reconnect</button>}
        </div>
    );
}
```

Subscribe to a named event (matches the existing backend's `{ type, data } format):

```tsx
import { useQueryClient } from "@tanstack/react-query";
import { useWebSocketEvent } from "@/hooks/useWebSocketEvent";

const queryClient = useQueryClient();
useWebSocketEvent<{ id: number; username: string }>("user.created", () => {
    void queryClient.invalidateQueries({ queryKey: ["users"], exact: true });
});
```

- `messages` retains at most 100 raw messages. `lastMessage` contains the parsed payload.
- `onMessage` / event handlers receive every incoming text message, even if React batches renders.
- `sendMessage` sends strings as-is and serializes objects to JSON. It returns `false`
  if disconnected, serialization fails or the browser send buffer is full. There is no offline queue.
- Abnormal disconnects retry up to 8 times with exponential backoff and jitter.
  Normal closure and policy/auth rejection do not retry. `reconnect()` resets the retry count.
- `reconnect()` affects all consumers of that URL. Use `enabled` for local subscription control.
- Binary frames, application heartbeats and server-side topic subscriptions are not implemented.
- The existing `/ws` endpoint broadcasts to all connections. Hook filtering is client-side,
  not authorization. Do not use it to distribute private per-user data without server-side access control.
- The existing backend echoes received text inside a `message` event. Sending an object
  does not create a server command handler; add server handlers when that behavior is needed.
