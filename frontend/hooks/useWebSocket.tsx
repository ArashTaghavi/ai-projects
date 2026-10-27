"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export function useWebSocket(url: string) {
    const socketRef = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<string[]>([]);

    useEffect(() => {
        const socket = new WebSocket(url);

        socketRef.current = socket;

        socket.onopen = () => {
            setIsConnected(true);
        };

        socket.onmessage = (event: MessageEvent<string>) => {
            setMessages((previous) => [...previous, event.data]);
        };

        socket.onclose = () => {
            setIsConnected(false);
        };

        return () => {
            socket.close();
            socketRef.current = null;
        };
    }, [url]);

    const sendMessage = useCallback((message: string) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(message);
        }
    }, []);

    return {
        isConnected,
        messages,
        sendMessage,
    };
}
