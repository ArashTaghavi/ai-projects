"use client";

import { useQuery } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";

export function useAuth() {
    return useQuery({
        queryKey: ["auth", "me"],
        queryFn: authService.me,
        retry: false,
        staleTime: 5 * 60 * 1000,
    });
}
