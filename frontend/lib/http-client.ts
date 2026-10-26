const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ApiErrorResponse {
    errors?: Record<string, string[]>;
    message?: string;
}

export class ApiError extends Error {
    constructor(
        public readonly status: number,
        message: string,
        public readonly errors: Record<string, string[]> = {},
    ) {
        super(message);
        this.name = "ApiError";
    }
}

export async function httpClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        credentials: "include",
        headers: {
            ...(!(options.body instanceof FormData) && {
                "Content-Type": "application/json",
            }),
            ...options.headers,
        },
    });

    if (!response.ok) {
        if (
            response.status === 401 &&
            endpoint !== "/auth/login" &&
            endpoint !== "/auth/logout" &&
            typeof window !== "undefined"
        ) {
            window.dispatchEvent(new Event("auth:unauthorized"));
        }

        const body: ApiErrorResponse = await response.json();

        throw new ApiError(
            response.status,
            body.message ?? `Request failed with status ${response.status}`,
            body.errors ?? {},
        );
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return (await response.json()) as T;
}
