"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authService, type MeResponse } from "@/services/auth.service";

export function useLogin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: authService.login,
        onSuccess: async (response) => {
            await queryClient.cancelQueries();

            queryClient.clear();

            queryClient.setQueryData<MeResponse>(["auth", "me"], {
                message: "Authenticated",
                data: response.data,
            });
        },
    });
}
