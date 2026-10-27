"use client";

import { type ReactNode } from "react";
import Header from "./layout/Header";
import Aside from "./layout/Aside";
import Main from "./layout/Main";

export default function AdminShell({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-dvh bg-[#0c0c11] font-sans text-zinc-100 selection:bg-violet-500/30">
            <a
                href="#dashboard-content"
                className="sr-only z-50 rounded-lg bg-violet-500 px-4 py-3 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
            >
                Skip to content
            </a>
            <Aside />

            <div className="flex min-h-dvh min-w-0 flex-col lg:pl-64">
                <Header />
                <Main>{children}</Main>
                <footer className="mx-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/6 py-5 text-[11px] text-zinc-500 sm:mx-8 lg:mx-10">
                    <span>OpenLearnLab</span>
                    <span>Built for better learning</span>
                </footer>
            </div>
        </div>
    );
}
