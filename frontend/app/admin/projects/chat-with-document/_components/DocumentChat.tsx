"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, FileText, MessageSquare, Plus, Send, Upload } from "lucide-react";
import { FileInput, Form, Input } from "@/components/form";
import { Button } from "@/components/ui";
import MessageHistory from "./MessageHistory";
import { messageDate } from "../_lib/message-dates";
import { newChatSchema, type NewChatFormValues } from "../_schemas/new-chat.schema";
import {
    useAskDocument,
    useUploadDocument,
    useDocuments,
    useDocumentHistory,
    useDocument,
} from "../../_hooks/useDocumentChat";

type QuestionValues = { query: string };

export default function DocumentChat({ documentId = null }: { documentId?: string | null }) {
    const router = useRouter();
    const documents = useDocuments();
    const activeId = documentId;
    const selectedDocument = useDocument(activeId);
    const [showList, setShowList] = useState(false);
    const [uploadFormKey, setUploadFormKey] = useState(0);
    const history = useDocumentHistory(activeId);
    const conversations = (documents.data ?? []).map((document) => ({
        id: String(document.id),
        title: document.name,
        preview: document.last_message_preview,
        timestamp: document.last_message_at,
    }));
    const active = selectedDocument.data
        ? { id: selectedDocument.data.id, title: selectedDocument.data.name }
        : undefined;
    const document = active
        ? { document_id: active.id, original_filename: selectedDocument.data!.original_file_name }
        : null;
    const turns = history.data;
    const [error, setError] = useState<string | null>(null);
    const upload = useUploadDocument();
    const ask = useAskDocument();
    const uploadForm = useForm<NewChatFormValues>({
        resolver: zodResolver(newChatSchema),
        defaultValues: { file: null, name: "" },
    });
    const questionForm = useForm<QuestionValues>({ defaultValues: { query: "" } });
    const requestLock = useRef(false);
    const messagesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const messages = messagesRef.current;
        if (messages) messages.scrollTop = messages.scrollHeight;
    }, [activeId, turns, ask.isPending]);

    function selectChat(id: string | null) {
        if (requestLock.current) return;
        router.push(
            id
                ? `/admin/projects/chat-with-document/${encodeURIComponent(id)}`
                : "/admin/projects/chat-with-document",
            { scroll: false },
        );
        setShowList(false);
        setError(null);
        uploadForm.reset();
        setUploadFormKey((value) => value + 1);
        upload.reset();
        ask.reset();
        questionForm.reset();
    }

    function newChat() {
        selectChat(null);
    }

    async function uploadDocument({ file, name }: NewChatFormValues) {
        if (document || requestLock.current || !file) return;
        requestLock.current = true;
        setError(null);
        try {
            const result = await upload.mutateAsync({ file, name });
            router.push(
                `/admin/projects/chat-with-document/${encodeURIComponent(result.document_id)}`,
                { scroll: false },
            );
        } catch (cause) {
            setError(
                cause instanceof Error
                    ? cause.message
                    : "Document upload failed. Please try again.",
            );
        } finally {
            requestLock.current = false;
        }
    }

    async function sendQuestion({ query }: QuestionValues) {
        if (!document || history.isPending || history.isError || requestLock.current) return;
        const question = query.trim();
        if (!question) {
            questionForm.setError("query", { message: "Enter a question." });
            return;
        }
        requestLock.current = true;
        setError(null);
        try {
            const result = await ask.mutateAsync({
                document_id: Number(document.document_id),
                query: question,
            });
            if (!result.answer?.trim())
                throw new Error("No answer was returned. Please try again.");
            questionForm.reset();
        } catch (cause) {
            setError(
                cause instanceof Error
                    ? cause.message
                    : "Could not send your question. Please try again.",
            );
        } finally {
            requestLock.current = false;
        }
    }

    return (
        <div className="flex h-full min-h-0 w-full flex-1 overflow-hidden">
            <aside
                aria-label="Conversations"
                className={`${showList ? "flex" : "hidden md:flex"} border-ui-border h-full min-h-0 w-full shrink-0 flex-col border-r bg-[#101016] md:w-64 xl:w-80`}
            >
                <div className="border-ui-border shrink-0 space-y-4 border-b p-5">
                    <h1 className="flex items-center gap-2 font-semibold">
                        <MessageSquare size={20} className="text-violet-300" /> Document chats
                    </h1>
                    <Button
                        fullWidth
                        size="sm"
                        onClick={newChat}
                        disabled={upload.isPending || ask.isPending}
                        startIcon={<Plus size={16} />}
                    >
                        New chat
                    </Button>
                </div>
                <nav
                    aria-label="Chat history"
                    className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain p-3"
                >
                    {documents.isPending && (
                        <p role="status" className="text-ui-secondary p-3 text-xs">
                            Loading conversations…
                        </p>
                    )}
                    {documents.isError && (
                        <div role="alert" className="space-y-2 p-3 text-xs text-red-300">
                            <p>Could not load conversations.</p>
                            <Button size="sm" onClick={() => documents.refetch()}>
                                Retry
                            </Button>
                        </div>
                    )}
                    {documents.isSuccess && conversations.length === 0 && (
                        <p className="text-ui-muted p-3 text-xs">
                            No conversations yet. Upload a document to start.
                        </p>
                    )}
                    {conversations.map((chat) => (
                        <Link
                            key={chat.id}
                            href={`/admin/projects/chat-with-document/${encodeURIComponent(chat.id)}`}
                            scroll={false}
                            aria-disabled={upload.isPending || ask.isPending}
                            onClick={(event) => {
                                if (requestLock.current) {
                                    event.preventDefault();
                                    return;
                                }
                                setShowList(false);
                            }}
                            aria-current={activeId === chat.id ? "page" : undefined}
                            className={`flex w-full gap-3 rounded-xl p-3 text-left transition focus-visible:outline-2 focus-visible:outline-violet-400 disabled:opacity-60 ${activeId === chat.id ? "bg-violet-500/15 ring-1 ring-violet-400/20" : "hover:bg-white/5"}`}
                        >
                            <FileText
                                size={18}
                                className="mt-1 shrink-0 text-violet-300"
                                aria-hidden="true"
                            />
                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm text-zinc-200">
                                    {chat.title}
                                </span>
                                {chat.preview && (
                                    <span dir="auto" className="text-ui-secondary mt-1 block truncate text-xs">
                                        {chat.preview}
                                    </span>
                                )}
                                {chat.timestamp && (
                                    <time dateTime={chat.timestamp} title={messageDate(chat.timestamp).full} className="text-ui-muted mt-1 block text-xs">
                                        {messageDate(chat.timestamp).time}
                                    </time>
                                )}
                            </span>
                        </Link>
                    ))}
                </nav>
            </aside>
            <div
                className={`${showList ? "hidden md:flex" : "flex"} h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden`}
            >
                <header className="border-ui-border flex shrink-0 items-center gap-3 border-b bg-[#101016] px-4 py-3 sm:px-6">
                    <Button
                        size="icon"
                        variant="secondary"
                        className="md:hidden"
                        aria-label="Show conversations"
                        onClick={() => setShowList(true)}
                        startIcon={<ArrowLeft size={18} />}
                    />
                    <FileText size={24} className="shrink-0 text-violet-300" />
                    <div className="min-w-0 flex-1">
                        <h2 className="truncate text-sm font-medium" title={active?.title}>
                            {active?.title ?? "New conversation"}
                        </h2>
                        <p className="text-ui-muted mt-1 text-xs">
                            {document
                                ? "Document ready · One document per chat"
                                : "Upload a Word document to begin"}
                        </p>
                    </div>
                </header>
                {activeId && selectedDocument.isPending ? (
                    <p role="status" className="text-ui-secondary p-6 text-sm">
                        Loading document…
                    </p>
                ) : activeId && selectedDocument.isError ? (
                    <div role="alert" className="space-y-3 p-6 text-sm text-red-300">
                        <p>
                            Could not open this document. It may be unavailable or you may not have
                            access.
                        </p>
                        <Button size="sm" onClick={() => selectedDocument.refetch()}>
                            Retry
                        </Button>
                    </div>
                ) : !document ? (
                    <div className="flex min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 sm:p-8">
                        <Form
                            methods={uploadForm}
                            onSubmit={uploadDocument}
                            isPending={upload.isPending}
                            className="m-auto w-full max-w-lg space-y-5 py-6"
                        >
                            <div className="space-y-2 text-center">
                                <FileText size={40} className="mx-auto text-violet-300" />
                                <h2 className="text-xl font-semibold">Chat with your document</h2>
                                <p className="text-ui-secondary text-sm">
                                    Upload once, then ask questions about its contents.
                                </p>
                            </div>
                            <Input<NewChatFormValues>
                                name="name"
                                label="Document name (required)"
                                placeholder="Give this conversation a name"
                                disabled={upload.isPending}
                                dir="auto"
                            />
                            <FileInput<NewChatFormValues>
                                key={uploadFormKey}
                                name="file"
                                label="Word document"
                                accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                disabled={upload.isPending}
                                hint="One .docx file per conversation. The document cannot be replaced after upload."
                            />
                            <Button
                                type="submit"
                                loading={upload.isPending}
                                startIcon={<Upload size={16} />}
                            >
                                Upload document
                            </Button>
                            {upload.isPending && (
                                <p role="status" className="text-ui-secondary text-sm">
                                    Uploading and preparing your document…
                                </p>
                            )}
                        </Form>
                    </div>
                ) : (
                    <>
                        {document && (
                            <div className="flex shrink-0 items-center gap-3 border-b border-emerald-400/20 bg-emerald-400/5 px-4 py-2 text-sm">
                                <FileText
                                    size={20}
                                    className="shrink-0 text-emerald-300"
                                    aria-hidden="true"
                                />
                                <div className="min-w-0">
                                    <p
                                        className="truncate text-zinc-100"
                                        title={document.original_filename}
                                    >
                                        {document.original_filename}
                                    </p>
                                    <p className="mt-1 text-xs text-emerald-300">
                                        Document ready · Locked to this conversation
                                    </p>
                                </div>
                            </div>
                        )}
                        <div
                            ref={messagesRef}
                            role="log"
                            aria-label="Document conversation"
                            aria-live="polite"
                            aria-relevant="additions text"
                            className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain bg-[radial-gradient(ellipse_at_top,_rgba(139,92,246,0.06),_transparent)] p-4 sm:p-6"
                        >
                            {history.isPending && (
                                <p role="status" className="text-ui-secondary text-sm">
                                    Loading messages…
                                </p>
                            )}
                            {history.isError && (
                                <div role="alert" className="space-y-2 text-sm text-red-300">
                                    <p>Could not load messages.</p>
                                    <Button size="sm" onClick={() => history.refetch()}>
                                        Retry
                                    </Button>
                                </div>
                            )}
                            {history.isSuccess && turns?.length === 0 && (
                                <p className="text-ui-muted py-12 text-center text-sm">
                                    Your document is ready. Ask your first question below.
                                </p>
                            )}
                            <MessageHistory turns={turns ?? []} />
                            {ask.isPending && (
                                <p role="status" className="text-sm text-violet-300">
                                    Reading your document and preparing an answer…
                                </p>
                            )}
                        </div>
                        <Form
                            methods={questionForm}
                            onSubmit={sendQuestion}
                            isPending={ask.isPending}
                            className="border-ui-border flex shrink-0 items-end gap-3 border-t bg-[#101016] px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 [&>div]:min-w-0 [&>div]:flex-1"
                        >
                            <Input<QuestionValues>
                                name="query"
                                label="Your question"
                                placeholder="Ask something about your document…"
                                disabled={ask.isPending || history.isPending || history.isError}
                                autoComplete="off"
                                dir="auto"
                            />
                            <Button
                                type="submit"
                                size="icon"
                                className="mb-1.5"
                                aria-label="Send question"
                                loading={ask.isPending}
                                disabled={history.isPending || history.isError}
                                startIcon={<Send size={16} />}
                            ></Button>
                        </Form>
                    </>
                )}
                {error && (
                    <p
                        role="alert"
                        className="max-h-24 shrink-0 overflow-y-auto rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-sm text-red-300"
                    >
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
}
