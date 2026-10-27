"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { authService } from "@/services/auth.service";

export default function QueryProvider({ children }: { children: ReactNode }) {
    const router = useRouter();

    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000,
                        retry: 1,
                        refetchOnWindowFocus: false,
                    },
                },
            }),
    );

    useEffect(() => {
        let isHandlingUnauthorized = false;

        const handleUnauthorized = async () => {
            if (isHandlingUnauthorized) {
                return;
            }

            isHandlingUnauthorized = true;

            await queryClient.cancelQueries();
            queryClient.clear();

            try {
                await authService.logout();
            } catch {
                // The session may already be invalid or the API unavailable.
            }

            if (window.location.pathname !== "/auth") {
                router.replace("/auth");
                router.refresh();
            }

            isHandlingUnauthorized = false;
        };

        window.addEventListener("auth:unauthorized", handleUnauthorized);

        return () => {
            window.removeEventListener("auth:unauthorized", handleUnauthorized);
        };
    }, [queryClient, router]);

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
