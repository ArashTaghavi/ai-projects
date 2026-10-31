import { httpClient } from "@/lib/http-client";

export interface UploadedDocument {
    name: string;
    document_id: number;
    original_filename: string;
    chunks_count: number;
    message: string;
}

export interface DocumentResponse {
    name: string;
    id: number;
    original_file_name: string;
    created_at: string;
    last_message_preview: string | null;
    last_message_at: string | null;
}

export interface AskPayload {
    document_id: number;
    query: string;
}

export interface UploadPayload {
    name: string;
    file: File;
}

export interface AskResponse {
    answer: string | null;
}

export interface HistoryPayload {
    document_id: string;
}

export interface ChatTurnResponse {
    id: number;
    question: string;
    answer: string;
    created_at: string;
}

export const chatWithDocumentService = {
    documents: () => httpClient<DocumentResponse[]>("/chat-with-document/documents"),
    document: (id: string) =>
        httpClient<DocumentResponse>(`/chat-with-document/documents/${encodeURIComponent(id)}`),
    uploads: ({ file, name }: UploadPayload) => {
        const body = new FormData();
        body.append("file", file);
        body.append("name", name.trim());
        return httpClient<UploadedDocument>("/chat-with-document/upload", {
            method: "POST",
            body,
        });
    },
    ask: (payload: AskPayload) =>
        httpClient<AskResponse>("/chat-with-document/ask", {
            method: "POST",
            body: JSON.stringify(payload),
        }),
    history: ({ document_id }: HistoryPayload) => {
        const params = new URLSearchParams({ document_id });
        return httpClient<ChatTurnResponse[]>(`/chat-with-document/history?${params}`, {
            method: "GET",
        });
    },
};
