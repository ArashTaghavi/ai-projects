"use client";

import { useQuery } from "@tanstack/react-query";

import { userService } from "@/services/admin/user.service";

export function useUser(id: number) {
    return useQuery({
        queryKey: ["users", id],
        queryFn: () => userService.show(id),
        enabled: Number.isInteger(id) && id > 0,
    });
}
