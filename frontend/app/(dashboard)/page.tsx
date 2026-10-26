"use client";

import { useAuth } from "@/hooks/auth/useAuth";
import { useLogout } from "@/hooks/auth/useLogout";

export default function Dashboard() {
    const { data, isPending, isError } = useAuth();
    const { mutate: logout, isPending: isLoggingOut } = useLogout();

    if (isPending) {
        return <p>Loading...</p>;
    }

    if (isError) {
        return <p>Failed to load user information.</p>;
    }

    const { id, username } = data.data;

    return (
        <div>
            <h1>Dashboard</h1>

            <p>Username: {username}</p>
            <p>User ID: {id}</p>

            <button
                type="button"
                onClick={() => logout()}
                disabled={isLoggingOut}
                className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white disabled:opacity-50"
            >
                {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
        </div>
    );
}
