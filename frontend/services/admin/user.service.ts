import { httpClient } from "@/lib/http-client";

export interface UserResponse {
    id: number;
    username: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    avatar: string | null;
    created_at: string;
}

export interface UsersResponse {
    data: UserResponse[];
}

export interface CreateUserPayload {
    username: string;
    password: string;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    avatar?: string | null;
}

export interface UpdateUserPayload {
    password?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    avatar?: string | null;
}

export interface ShowUserResponse {
    data: UserResponse;
}

export interface SaveUserResponse extends ShowUserResponse {
    message: string;
}

export interface DeleteUserResponse {
    message: string;
}

export const userService = {
    index: () =>
        httpClient<UsersResponse>("/users/", {
            method: "GET",
        }),

    show: (id: number) =>
        httpClient<ShowUserResponse>(`/users/${id}`, {
            method: "GET",
        }),

    store: (payload: CreateUserPayload) =>
        httpClient<SaveUserResponse>("/users/", {
            method: "POST",
            body: JSON.stringify(payload),
        }),

    update: (id: number, payload: UpdateUserPayload) =>
        httpClient<SaveUserResponse>(`/users/${id}`, {
            method: "PUT",
            body: JSON.stringify(payload),
        }),

    destroy: (id: number) =>
        httpClient<DeleteUserResponse>(`/users/${id}`, {
            method: "DELETE",
        }),
};
