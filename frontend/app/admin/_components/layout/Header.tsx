"use client";

import { useAuth } from "@/hooks/auth/useAuth";
import { useLogout } from "@/hooks/auth/useLogout";
import { useRef } from "react";
import { usePathname } from "next/navigation";
import { ChevronRight, LogOut, Menu, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Navigation from "./Navigation";

export default function Header() {
    const pathname = usePathname();
    const pageLabel =
        pathname === "/admin"
            ? "Overview"
            : pathname.startsWith("/admin/users")
              ? "Users"
              : pathname.split("/").filter(Boolean).pop()?.replaceAll("-", " ") || "Overview";
    const mobileMenu = useRef<HTMLDialogElement>(null);
    const { data, isPending, isError } = useAuth();
    const { mutate: logout, isPending: isLoggingOut, isError: logoutFailed } = useLogout();
    const username = data?.data.username;
    return (
        <>
            <dialog
                ref={mobileMenu}
                aria-labelledby="mobile-menu-title"
                className="fixed inset-y-0 right-auto left-0 m-0 h-dvh max-h-none w-72 max-w-[85vw] border-r border-ui-border bg-[#101016] p-6 text-zinc-100 backdrop:bg-black/70 lg:hidden"
            >
                <div className="mb-10 flex items-center justify-between gap-2">
                    <h2 id="mobile-menu-title" className="text-sm font-semibold">
                        Admin workspace
                    </h2>
                    <button
                        type="button"
                        onClick={() => mobileMenu.current?.close()}
                        aria-label="Close menu"
                        className="rounded-lg p-2 text-ui-secondary hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-violet-400"
                    >
                        <X size={20} />
                    </button>
                </div>
                <Navigation onNavigate={() => mobileMenu.current?.close()} />
            </dialog>
            <header className="sticky top-0 z-20 flex min-h-20 items-center justify-between gap-4 border-b border-ui-border-subtle bg-[#0c0c11]/90 px-5 backdrop-blur-xl sm:px-8 lg:px-10">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => mobileMenu.current?.showModal()}
                        aria-label="Open navigation menu"
                        aria-haspopup="dialog"
                        className="rounded-lg p-2 text-ui-secondary hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-violet-400 lg:hidden"
                    >
                        <Menu size={20} />
                    </button>
                    <span className="hidden text-xs text-ui-muted sm:inline">Workspace</span>
                    <ChevronRight
                        size={13}
                        className="hidden text-ui-dim sm:block"
                        aria-hidden="true"
                    />
                    <span className="text-xs font-medium text-zinc-200">{pageLabel}</span>
                </div>
                <div className="flex min-w-0 items-center gap-3 sm:gap-5">
                    <span
                        className="flex size-9 shrink-0 items-center justify-center rounded-full border border-violet-400/20 bg-violet-400/10 text-sm font-semibold text-violet-300"
                        aria-hidden="true"
                    >
                        {username?.slice(0, 1).toUpperCase() || "U"}
                    </span>
                    <div className="hidden min-w-0 sm:block">
                        <p className="max-w-40 truncate text-xs font-medium">
                            {username || (isPending ? "Loading…" : "Account")}
                        </p>
                        <p className="mt-1 text-[10px] text-ui-muted">
                            {isError ? "Account unavailable" : "Signed-in account"}
                        </p>
                    </div>
                    <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => logout()}
                        loading={isLoggingOut}
                        startIcon={<LogOut size={15} aria-hidden="true" />}
                        className="[&>svg]:size-[15px]"
                    >
                        <span className="hidden sm:inline">
                            {isLoggingOut ? "Signing out…" : "Sign out"}
                        </span>
                        <span className="sr-only sm:hidden">Sign out</span>
                    </Button>
                </div>
            </header>
            {logoutFailed && (
                <p
                    role="alert"
                    className="border-b border-red-400/15 bg-red-400/5 px-5 py-3 text-sm text-red-300 sm:px-8"
                >
                    Could not sign out. Please try again.
                </p>
            )}
        </>
    );
}
