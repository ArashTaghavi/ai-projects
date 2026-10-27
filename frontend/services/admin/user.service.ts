import { httpClient } from "@/lib/http-client";

export interface UserResponse {
    id: number;
    username: string;
}

export const userService = {
    index: () =>
        httpClient<UserResponse>("/users", {
            method: "GET",
        }),
};
