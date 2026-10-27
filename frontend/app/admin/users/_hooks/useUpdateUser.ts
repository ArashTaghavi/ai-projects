"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { userService, type UpdateUserPayload } from "@/services/admin/user.service";

export function useUpdateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: UpdateUserPayload }) =>
            userService.update(id, payload),
        onSuccess: async (_, { id }) => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["users"], exact: true }),
                queryClient.invalidateQueries({ queryKey: ["users", id], exact: true }),
            ]);
        },
    });
}
