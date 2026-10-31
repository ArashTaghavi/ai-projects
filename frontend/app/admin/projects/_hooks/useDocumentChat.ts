"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatWithDocumentService } from "@/services/admin/projects/chat-with-document/chat-with-document.service";

export function useUploadDocument() {
    const client = useQueryClient();
    return useMutation({
        mutationFn: chatWithDocumentService.uploads,
        onSuccess: () => client.invalidateQueries({ queryKey: ["document-chats"] }),
    });
}

export function useAskDocument() {
    const client = useQueryClient();
    return useMutation({
        mutationFn: chatWithDocumentService.ask,
        onSuccess: (_, payload) => Promise.all([
            client.invalidateQueries({ queryKey: ["document-chat-history", String(payload.document_id)] }),
            client.invalidateQueries({ queryKey: ["document-chats"] }),
        ]),
    });
}

export function useDocuments() {
    return useQuery({ queryKey: ["document-chats"], queryFn: chatWithDocumentService.documents });
}

export function useDocument(documentId: string | null) {
    return useQuery({
        queryKey: ["document-chat", documentId],
        queryFn: () => chatWithDocumentService.document(documentId!),
        enabled: !!documentId,
    });
}

export function useDocumentHistory(documentId: string | null) {
    return useQuery({
        queryKey: ["document-chat-history", documentId],
        queryFn: () => chatWithDocumentService.history({ document_id: documentId! }),
        enabled: !!documentId,
    });
}
