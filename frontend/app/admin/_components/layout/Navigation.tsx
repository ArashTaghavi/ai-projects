"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    BookOpen,
    ChevronRight,
    FolderKanban,
    Gamepad2,
    LayoutDashboard,
    Settings,
    Users,
} from "lucide-react";

const upcoming = [
    { label: "Courses", icon: BookOpen },
    { label: "Settings", icon: Settings },
];

export default function Navigation({ onNavigate }: { onNavigate?: () => void }) {
    const pathname = usePathname();
    return (
        <nav aria-label="Dashboard navigation" className="space-y-2">
            <p className="mb-4 px-3 text-[10px] font-semibold tracking-[0.18em] text-zinc-500 uppercase">
                Workspace
            </p>
            <Link
                href="/admin"
                onClick={onNavigate}
                aria-current={pathname === "/admin" ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-violet-400 ${pathname === "/admin" ? "bg-violet-400/10 text-violet-300 ring-1 ring-violet-400/15" : "text-zinc-400 hover:bg-white/5 hover:text-white"}`}
            >
                <LayoutDashboard size={18} aria-hidden="true" /> Overview
                <ChevronRight size={14} className="ml-auto" aria-hidden="true" />
            </Link>
            <Link
                href="/admin/users"
                onClick={onNavigate}
                aria-current={pathname === "/admin/users" ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-violet-400 ${pathname === "/admin/users" ? "bg-violet-400/10 text-violet-300 ring-1 ring-violet-400/15" : "text-zinc-400 hover:bg-white/5 hover:text-white"}`}
            >
                <Users size={18} aria-hidden="true" /> Users
                <ChevronRight size={14} className="ml-auto" aria-hidden="true" />
            </Link>
            <Link
                href="/admin/tic-tac-toe"
                onClick={onNavigate}
                aria-current={pathname === "/admin/tic-tac-toe" ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-violet-400 ${pathname === "/admin/tic-tac-toe" ? "bg-violet-400/10 text-violet-300 ring-1 ring-violet-400/15" : "text-zinc-400 hover:bg-white/5 hover:text-white"}`}
            >
                <Gamepad2 size={18} aria-hidden="true" /> Tic-tac-toe
                <ChevronRight size={14} className="ml-auto" aria-hidden="true" />
            </Link>
            <Link
                href="/admin/projects"
                onClick={onNavigate}
                aria-current={pathname.startsWith("/admin/projects") ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-violet-400 ${pathname.startsWith("/admin/projects") ? "bg-violet-400/10 text-violet-300 ring-1 ring-violet-400/15" : "text-zinc-400 hover:bg-white/5 hover:text-white"}`}
            >
                <FolderKanban size={18} aria-hidden="true" /> Projects
                <ChevronRight size={14} className="ml-auto" aria-hidden="true" />
            </Link>
            {upcoming.map(({ label, icon: Icon }) => (
                <button
                    key={label}
                    type="button"
                    disabled
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-zinc-600 disabled:cursor-not-allowed"
                >
                    <Icon size={18} aria-hidden="true" /> {label}
                    <span className="ml-auto rounded border border-white/5 px-1.5 py-0.5 text-[9px]">
                        Soon
                    </span>
                </button>
            ))}
        </nav>
    );
}
