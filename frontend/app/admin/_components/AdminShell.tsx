"use client";

import { type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Header from "./layout/Header";
import Aside from "./layout/Aside";
import Main from "./layout/Main";

export default function AdminShell({ children }: { children: ReactNode }) {
    const pathname = usePathname().replace(/\/$/, "");
    const isDocumentChat =
        pathname === "/admin/projects/chat_with_document" ||
        pathname.startsWith("/admin/projects/chat_with_document/");
    return (
        <div
            className={`${isDocumentChat ? "fixed inset-0 h-dvh overflow-hidden" : "min-h-dvh"} bg-[#0c0c11] font-sans text-zinc-100 selection:bg-violet-500/30`}
        >
            <a
                href="#dashboard-content"
                className="sr-only z-50 rounded-lg bg-violet-500 px-4 py-3 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
            >
                Skip to content
            </a>
            <Aside />

            <div
                className={`flex min-w-0 flex-col lg:pl-64 [&>header]:shrink-0 ${isDocumentChat ? "h-full overflow-hidden" : "min-h-dvh"}`}
            >
                <Header />
                <Main viewport={isDocumentChat}>{children}</Main>
                {!isDocumentChat && (
                    <footer className="mx-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/6 py-5 text-[11px] text-zinc-500 sm:mx-8 lg:mx-10">
                        <span>OpenLearnLab</span>
                        <span>Built for better learning</span>
                    </footer>
                )}
            </div>
        </div>
    );
}
