import { type ReactNode } from "react";

export default function Main({
    children,
    viewport = false,
}: {
    children: ReactNode;
    viewport?: boolean;
}) {
    return (
        <main
            id="dashboard-content"
            tabIndex={-1}
            className={`mx-auto flex w-full min-w-0 flex-1 flex-col outline-none ${viewport ? "min-h-0 overflow-hidden" : "gap-6 px-5 py-8 sm:px-8 sm:py-10 lg:px-10"}`}
        >
            {children}
        </main>
    );
}
