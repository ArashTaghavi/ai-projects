"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { userService } from "@/services/admin/user.service";

export function useCreateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userService.store,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["users"], exact: true });
        },
    });
}
