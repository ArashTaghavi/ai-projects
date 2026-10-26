import { httpClient } from "@/lib/http-client";

export interface AuthUser {
    id: number;
    username: string;
}

export interface LoginPayload {
    username: string;
    password: string;
}

export interface LoginResponse {
    message: string;
    data: AuthUser;
}

export interface MeResponse {
    message: string;
    data: AuthUser;
}

export interface LogoutResponse {
    message: string;
}

export const authService = {
    login: (payload: LoginPayload) =>
        httpClient<LoginResponse>("/auth/login", {
            method: "POST",
            body: JSON.stringify(payload),
        }),

    me: () =>
        httpClient<MeResponse>("/auth/me", {
            method: "GET",
        }),

    logout: () =>
        httpClient<LogoutResponse>("/auth/logout", {
            method: "POST",
        }),
};
