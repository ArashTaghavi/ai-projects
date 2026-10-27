"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { userService } from "@/services/admin/user.service";

export function useDeleteUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userService.destroy,
        onSuccess: async (_, id) => {
            await queryClient.cancelQueries({ queryKey: ["users", id], exact: true });
            queryClient.removeQueries({ queryKey: ["users", id], exact: true });
            await queryClient.invalidateQueries({ queryKey: ["users"], exact: true });
        },
    });
}
