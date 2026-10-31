"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Database, Plus, Send, Sparkles, UserRound } from "lucide-react";
import { Form, Input } from "@/components/form";
import { Button } from "@/components/ui";
import {
    databaseAnalystService,
    type DatabaseAnswer,
} from "@/services/admin/projects/database-analyst/database-analyst.service";
import { questionSchema, type QuestionValues } from "../_schemas/question.schema";
import { messageDate } from "../../chat-with-document/_lib/message-dates";
import styles from "../../chat-with-document/_components/MessageHistory.module.css";

type Turn = {
    id: string;
    question: string;
    answer?: DatabaseAnswer;
    createdAt: string;
    error?: string;
};
type Conversation = { id: string; title: string; turns: Turn[] };

function Time({ timestamp }: { timestamp: string }) {
    const date = messageDate(timestamp);
    return (
        <time
            dateTime={date.iso}
            title={date.full}
            className="mt-2 block text-right text-[10px] text-zinc-400"
        >
            {date.time}
        </time>
    );
}

export default function DatabaseChat() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [showList, setShowList] = useState(false);
    const active = conversations.find((chat) => chat.id === activeId);
    const messagesRef = useRef<HTMLDivElement>(null);
    const requestLock = useRef(false);
    const ask = useMutation({ mutationFn: databaseAnalystService.ask });
    const form = useForm<QuestionValues>({
        resolver: zodResolver(questionSchema),
        defaultValues: { query: "" },
    });

    useEffect(() => {
        const messages = messagesRef.current;
        if (messages) messages.scrollTop = messages.scrollHeight;
    }, [active, ask.isPending]);

    function selectChat(id: string | null) {
        if (requestLock.current) return;
        setActiveId(id);
        setShowList(false);
        form.reset();
        ask.reset();
    }

    async function sendQuestion({ query }: QuestionValues) {
        if (requestLock.current) return;
        requestLock.current = true;
        const chatId = activeId ?? crypto.randomUUID();
        const turn: Turn = {
            id: crypto.randomUUID(),
            question: query,
            createdAt: new Date().toISOString(),
        };
        if (activeId) {
            setConversations((chats) =>
                chats.map((chat) =>
                    chat.id === chatId ? { ...chat, turns: [...chat.turns, turn] } : chat,
                ),
            );
        } else {
            const words = query.split(/\s+/);
            setConversations((chats) => [
                {
                    id: chatId,
                    title: words.slice(0, 6).join(" ") + (words.length > 6 ? "…" : ""),
                    turns: [turn],
                },
                ...chats,
            ]);
            setActiveId(chatId);
        }
        form.reset();
        try {
            const answer = await ask.mutateAsync({ query });
            setConversations((chats) =>
                chats.map((chat) =>
                    chat.id === chatId
                        ? {
                              ...chat,
                              turns: chat.turns.map((item) =>
                                  item.id === turn.id ? { ...item, answer } : item,
                              ),
                          }
                        : chat,
                ),
            );
        } catch (cause) {
            const error =
                cause instanceof Error
                    ? cause.message
                    : "Could not analyze your question. Please try again.";
            setConversations((chats) =>
                chats.map((chat) =>
                    chat.id === chatId
                        ? {
                              ...chat,
                              turns: chat.turns.map((item) =>
                                  item.id === turn.id ? { ...item, error } : item,
                              ),
                          }
                        : chat,
                ),
            );
        } finally {
            requestLock.current = false;
        }
    }

    return (
        <div className="flex h-full min-h-0 w-full flex-1 overflow-hidden">
            <aside
                aria-label="Database conversations"
                className={`${showList ? "flex" : "hidden md:flex"} border-ui-border h-full min-h-0 w-full shrink-0 flex-col border-r bg-[#101016] md:w-64 xl:w-80`}
            >
                <div className="border-ui-border shrink-0 space-y-4 border-b p-5">
                    <h1 className="flex items-center gap-2 font-semibold">
                        <Database size={20} className="text-violet-300" /> Database chats
                    </h1>
                    <Button
                        fullWidth
                        size="sm"
                        onClick={() => selectChat(null)}
                        disabled={ask.isPending}
                        startIcon={<Plus size={16} />}
                    >
                        New chat
                    </Button>
                </div>
                <nav
                    aria-label="Chat history"
                    className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain p-3"
                >
                    {conversations.length === 0 && (
                        <p className="text-ui-muted p-3 text-xs">
                            No conversations yet. Ask a question to start.
                        </p>
                    )}
                    {conversations.map((chat) => {
                        const last = chat.turns.at(-1)!;
                        const preview = (last.answer?.text || last.question).trim().split(/\s+/);
                        return (
                            <button
                                key={chat.id}
                                type="button"
                                disabled={ask.isPending}
                                onClick={() => selectChat(chat.id)}
                                aria-current={activeId === chat.id ? "page" : undefined}
                                className={`flex w-full gap-3 rounded-xl p-3 text-left transition focus-visible:outline-2 focus-visible:outline-violet-400 disabled:opacity-60 ${activeId === chat.id ? "bg-violet-500/15 ring-1 ring-violet-400/20" : "hover:bg-white/5"}`}
                            >
                                <Database
                                    size={18}
                                    className="mt-1 shrink-0 text-violet-300"
                                    aria-hidden="true"
                                />
                                <span className="min-w-0 flex-1">
                                    <span
                                        dir="auto"
                                        className="block truncate text-sm text-zinc-200"
                                    >
                                        {chat.title}
                                    </span>
                                    <span
                                        dir="auto"
                                        className="text-ui-secondary mt-1 block truncate text-xs"
                                    >
                                        {preview.slice(0, 6).join(" ")}
                                        {preview.length > 6 ? "…" : ""}
                                    </span>
                                    <Time timestamp={last.createdAt} />
                                </span>
                            </button>
                        );
                    })}
                </nav>
                <p className="border-ui-border text-ui-muted shrink-0 border-t px-5 py-3 text-[11px]">
                    Chats are kept while this page is open.
                </p>
            </aside>
            <div
                className={`${showList ? "hidden md:flex" : "flex"} h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden`}
            >
                <header className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-[#191923]/95 px-4 py-3 sm:px-6">
                    <Button
                        size="icon"
                        variant="secondary"
                        className="md:hidden"
                        aria-label="Show conversations"
                        onClick={() => setShowList(true)}
                        startIcon={<ArrowLeft size={18} />}
                    />
                    <Database size={24} className="shrink-0 text-violet-300" />
                    <div className="min-w-0 flex-1">
                        <h2 dir="auto" className="truncate text-sm font-medium">
                            {active?.title ?? "Database analyst"}
                        </h2>
                        <p className="text-ui-muted mt-1 text-xs">
                            Ask questions about your database
                        </p>
                    </div>
                </header>
                <div className="flex shrink-0 items-center gap-2 border-b border-emerald-400/20 bg-emerald-400/5 px-4 py-2 text-xs text-emerald-300">
                    <Database size={15} aria-hidden="true" /> Default database · SQLite
                </div>
                <div
                    ref={messagesRef}
                    role="log"
                    aria-label="Database conversation"
                    aria-live="polite"
                    aria-relevant="additions text"
                    className="h-0 min-h-0 flex-1 space-y-4 overflow-x-hidden overflow-y-auto overscroll-contain bg-[#0d0e16] bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.11),transparent_60%)] px-2 py-3 sm:px-3"
                >
                    {!active && (
                        <div className="flex min-h-full flex-col items-center justify-center gap-4 px-4 py-10 text-center">
                            <span className="rounded-2xl border border-violet-300/20 bg-violet-400/10 p-4">
                                <Database size={32} className="text-violet-300" />
                            </span>
                            <h2 className="text-xl font-semibold">Chat with your database</h2>
                            <p className="text-ui-secondary max-w-md text-sm leading-6">
                                Ask in plain language. Get the SQL, an explanation, and the query
                                results.
                            </p>
                        </div>
                    )}
                    {active?.turns.map((turn) => (
                        <div key={turn.id} className="space-y-3">
                            <div
                                className={`${styles.bubble} ${styles.user} ml-auto w-fit max-w-[92%] rounded-3xl rounded-tr-md px-3 py-2.5 sm:max-w-[82%]`}
                            >
                                <p className="mb-2 flex items-center gap-2 text-xs font-medium text-violet-200">
                                    <UserRound size={14} aria-hidden="true" /> You
                                </p>
                                <p
                                    dir="auto"
                                    className="text-sm leading-7 break-words whitespace-pre-wrap"
                                >
                                    {turn.question}
                                </p>
                                <Time timestamp={turn.createdAt} />
                            </div>
                            {turn.answer && (
                                <div
                                    className={`${styles.bubble} ${styles.assistant} mr-auto max-w-[95%] min-w-0 space-y-3 rounded-3xl rounded-tl-md px-3 py-2.5 sm:max-w-[90%]`}
                                >
                                    <p className="flex items-center gap-2 text-xs font-medium text-sky-200">
                                        <Sparkles size={14} aria-hidden="true" /> Assistant
                                    </p>
                                    <p
                                        dir="auto"
                                        className="text-sm leading-7 break-words whitespace-pre-wrap text-zinc-200"
                                    >
                                        {turn.answer.text}
                                    </p>
                                    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0b0d14]/80">
                                        <p className="border-b border-white/10 px-3 py-2 text-[10px] font-semibold tracking-wider text-violet-300">
                                            SQL
                                        </p>
                                        <pre
                                            dir="ltr"
                                            className="overflow-x-auto p-3 text-xs leading-6 text-violet-200"
                                        >
                                            <code>{turn.answer.sql}</code>
                                        </pre>
                                    </div>
                                    <div className="overflow-hidden rounded-xl border border-white/10 bg-black/15">
                                        <p className="border-b border-white/10 px-3 py-2 text-[10px] font-semibold tracking-wider text-sky-200">
                                            RESULT
                                        </p>
                                        <pre
                                            dir="ltr"
                                            className="max-h-80 overflow-auto p-3 text-xs leading-6 text-zinc-200"
                                        >
                                            {turn.answer.result || "No rows returned."}
                                        </pre>
                                    </div>
                                    <Time timestamp={turn.createdAt} />
                                </div>
                            )}
                            {turn.error && (
                                <p
                                    role="alert"
                                    dir="auto"
                                    className="rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-sm text-red-300"
                                >
                                    {turn.error}
                                </p>
                            )}
                        </div>
                    ))}
                    {ask.isPending && (
                        <p role="status" className="px-2 py-3 text-sm text-violet-300">
                            Analyzing your question and querying the database…
                        </p>
                    )}
                </div>
                <Form
                    methods={form}
                    onSubmit={sendQuestion}
                    isPending={ask.isPending}
                    className="flex shrink-0 items-end gap-3 border-t border-white/10 bg-[#191923]/95 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 [&>div]:min-w-0 [&>div]:flex-1"
                >
                    <Input<QuestionValues>
                        name="query"
                        label="Your question"
                        placeholder="Ask something about your database…"
                        disabled={ask.isPending}
                        autoComplete="off"
                        dir="auto"
                    />
                    <Button
                        type="submit"
                        size="icon"
                        className="mb-1.5"
                        aria-label="Send question"
                        loading={ask.isPending}
                        startIcon={<Send size={16} />}
                    />
                </Form>
            </div>
        </div>
    );
}
