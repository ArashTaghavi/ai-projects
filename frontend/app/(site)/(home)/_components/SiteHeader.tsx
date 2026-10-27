"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { useEffect, useRef, useSyncExternalStore } from "react";

function subscribeToScroll(onChange: () => void) {
    window.addEventListener("scroll", onChange, { passive: true });
    return () => window.removeEventListener("scroll", onChange);
}

function getScrolled() {
    return window.scrollY > 24;
}

function getServerScrolled() {
    return false;
}

export default function SiteHeader() {
    const pathname = usePathname();
    const headerRef = useRef<HTMLElement>(null);
    const scrolled = useSyncExternalStore(subscribeToScroll, getScrolled, getServerScrolled);
    useEffect(() => {
        const header = headerRef.current;
        const page = header?.parentElement;
        if (!header || !page) return;
        const updateHeight = () => {
            page.style.setProperty(
                "--site-header-height",
                `${header.getBoundingClientRect().height}px`,
            );
        };
        updateHeight();
        const observer = new ResizeObserver(updateHeight);
        observer.observe(header);
        return () => observer.disconnect();
    }, []);

    return (
        <header
            ref={headerRef}
            className={`sticky top-0 z-50 border-b transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 motion-reduce:transition-none ${
                scrolled
                    ? "border-violet-300/15 bg-[#09090e]/85 shadow-[0_8px_32px_-12px_#000000b3] backdrop-blur-xl"
                    : "border-white/5 bg-transparent"
            }`}
        >
            <div className="flex w-full flex-wrap items-center justify-between gap-5 px-5 py-5 sm:px-10 lg:px-16 xl:px-24">
                <Link
                    href="/"
                    aria-label="OpenLearnLab home"
                    className="flex items-center gap-2.5 font-semibold tracking-tight"
                >
                    <span className="flex size-9 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-400/10 text-violet-300">
                        <Sparkles size={19} aria-hidden="true" />
                    </span>
                    OpenLearnLab
                </Link>

                <nav
                    aria-label="Main navigation"
                    className="order-3 flex w-full items-center justify-center gap-7 text-sm text-zinc-400 sm:order-none sm:w-auto"
                >
                    <Link
                        href="/"
                        aria-current={pathname === "/" ? "page" : undefined}
                        className={
                            pathname === "/"
                                ? "text-violet-300 hover:text-violet-200"
                                : "transition-colors hover:text-white"
                        }
                    >
                        Home
                    </Link>
                    <Link
                        href="/portfolio"
                        aria-current={pathname === "/portfolio" ? "page" : undefined}
                        className={
                            pathname === "/portfolio"
                                ? "text-violet-300 hover:text-violet-200"
                                : "transition-colors hover:text-white"
                        }
                    >
                        Portfolio
                    </Link>
                    <Link href="/#projects" className="transition-colors hover:text-white">
                        Projects
                    </Link>
                    <Link href="/#about" className="transition-colors hover:text-white">
                        About
                    </Link>
                </nav>

                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-400"
                >
                    Get started
                    <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
            </div>
        </header>
    );
}
