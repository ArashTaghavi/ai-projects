import { type ReactNode } from "react";

export default function Main({ children }: { children: ReactNode }) {
    return (
        <main
            id="dashboard-content"
            tabIndex={-1}
            className="mx-auto flex w-full min-w-0 flex-1 flex-col gap-6 px-5 py-8 outline-none sm:px-8 sm:py-10 lg:px-10"
        >
            {children}
        </main>
    );
}
