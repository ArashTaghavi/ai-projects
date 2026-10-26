import { type ReactNode } from "react";

export default function Main({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-dvh min-w-0 flex-col lg:pl-64">
            <main
                id="dashboard-content"
                tabIndex={-1}
                className="mx-auto w-full flex-1 px-5 py-8 outline-none sm:px-8 sm:py-10 lg:px-10"
            >
                {children}
            </main>
        </div>
    );
}
