"use client";

import { type ReactNode } from "react";
import { Header, Aside, Main } from "./layout";

export default function AdminShell({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-dvh bg-[#0c0c11] font-sans text-zinc-100 selection:bg-violet-500/30">
            <a
                href="#dashboard-content"
                className="sr-only z-50 rounded-lg bg-violet-500 px-4 py-3 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
            >
                Skip to coskipntent
            </a>
            <Aside />

            <Header />
            <Main>{children}</Main>
        </div>
    );
}
