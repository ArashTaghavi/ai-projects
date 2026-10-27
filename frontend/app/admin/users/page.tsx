"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useWebSocket } from "@/hooks/useWebSocket";
import { type UserResponse } from "@/services/admin/user.service";
import { useUsers } from "./_hooks/useUsers";

type UserCreatedEvent = {
    type: "user.created";
    data: UserResponse;
};

export default function Users() {
    const [message, setMessage] = useState("");

    const queryClient = useQueryClient();

    const { isConnected, messages, sendMessage } = useWebSocket("ws://localhost:8000/ws");

    const { data: users, isPending, isError, refetch } = useUsers();

    useEffect(() => {
        const lastMessage = messages[messages.length - 1];

        if (!lastMessage) return;

        let event: UserCreatedEvent;

        try {
            event = JSON.parse(lastMessage);
        } catch {
            return;
        }

        if (event.type !== "user.created") return;

        queryClient.setQueryData<UserResponse[]>(["users"], (oldUsers) => {
            if (!oldUsers) return oldUsers;

            if (oldUsers.some((user) => user.id === event.data.id)) {
                return oldUsers;
            }

            return [...oldUsers, event.data];
        });
    }, [messages, queryClient]);

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <h1 className="text-2xl font-semibold text-white">Users</h1>

                {isPending ? (
                    <p className="text-sm text-zinc-400">Loading users...</p>
                ) : isError ? (
                    <div className="space-y-3">
                        <p className="text-sm text-red-400">Failed to load users.</p>

                        <button
                            type="button"
                            onClick={() => refetch()}
                            className="text-sm text-violet-400"
                        >
                            Try again
                        </button>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-white/10">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/5 text-zinc-400">
                                <tr>
                                    <th className="px-5 py-4 font-medium">ID</th>
                                    <th className="px-5 py-4 font-medium">Username</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-white/10">
                                {users?.map((user) => (
                                    <tr key={user.id} className="text-zinc-200">
                                        <td className="px-5 py-4">{user.id}</td>
                                        <td className="px-5 py-4">{user.username}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {users?.length === 0 && (
                            <p className="p-6 text-center text-sm text-zinc-500">No users found.</p>
                        )}
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white">WebSocket</h2>

                <p>{isConnected ? "Connected" : "Disconnected"}</p>

                <input
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Enter message"
                />

                <button
                    disabled={!isConnected}
                    onClick={() => {
                        sendMessage(message);
                        setMessage("");
                    }}
                >
                    Send
                </button>

                <div>
                    {messages.map((item, index) => (
                        <p key={index}>{item}</p>
                    ))}
                </div>
            </div>
        </div>
    );
}
