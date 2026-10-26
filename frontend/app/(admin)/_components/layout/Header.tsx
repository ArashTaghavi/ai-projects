import { useAuth } from "@/hooks/auth/useAuth";
import { useLogout } from "@/hooks/auth/useLogout";
import { useRef } from "react";
import { ChevronRight, LoaderCircle, LogOut, Menu, X } from "lucide-react";
import { Navigation } from "./";

export default function () {
    const mobileMenu = useRef<HTMLDialogElement>(null);
    const { data, isPending, isError } = useAuth();
    const { mutate: logout, isPending: isLoggingOut, isError: logoutFailed } = useLogout();
    const username = data?.data.username;
    return (
        <>
            <dialog
                ref={mobileMenu}
                aria-labelledby="mobile-menu-title"
                className="fixed inset-y-0 right-auto left-0 m-0 h-dvh max-h-none w-72 max-w-[85vw] border-r border-white/10 bg-[#101016] p-6 text-zinc-100 backdrop:bg-black/70 lg:hidden"
            >
                <div className="mb-10 flex items-center justify-between gap-2">
                    <h2 id="mobile-menu-title" className="text-sm font-semibold">
                        Admin workspace
                    </h2>
                    <button
                        type="button"
                        onClick={() => mobileMenu.current?.close()}
                        aria-label="Close menu"
                        className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-violet-400"
                    >
                        <X size={20} />
                    </button>
                </div>
                <Navigation onNavigate={() => mobileMenu.current?.close()} />
            </dialog>
            <header className="sticky top-0 z-20 flex min-h-20 items-center justify-between gap-4 border-b border-white/6 bg-[#0c0c11]/90 px-5 backdrop-blur-xl sm:px-8 lg:px-10">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => mobileMenu.current?.showModal()}
                        aria-label="Open navigation menu"
                        aria-haspopup="dialog"
                        className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-violet-400 lg:hidden"
                    >
                        <Menu size={20} />
                    </button>
                    <span className="hidden text-xs text-zinc-500 sm:inline">Workspace</span>
                    <ChevronRight
                        size={13}
                        className="hidden text-zinc-700 sm:block"
                        aria-hidden="true"
                    />
                    <span className="text-xs font-medium text-zinc-200">Overview</span>
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
                        <p className="mt-1 text-[10px] text-zinc-500">
                            {isError ? "Account unavailable" : "Signed-in account"}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => logout()}
                        disabled={isLoggingOut}
                        className="flex items-center gap-2 rounded-lg border border-white/8 px-3 py-2 text-xs text-zinc-400 transition hover:border-red-400/20 hover:bg-red-400/5 hover:text-red-300 focus-visible:outline-2 focus-visible:outline-violet-400 disabled:cursor-wait disabled:opacity-50"
                    >
                        {isLoggingOut ? (
                            <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />
                        ) : (
                            <LogOut size={15} aria-hidden="true" />
                        )}
                        <span className="hidden sm:inline">
                            {isLoggingOut ? "Signing out…" : "Sign out"}
                        </span>
                        <span className="sr-only sm:hidden">Sign out</span>
                    </button>
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

            <footer className="mx-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/6 py-5 text-[11px] text-zinc-600 sm:mx-8 lg:mx-10">
                <span>OpenLearnLab</span>
                <span>Built for better learning</span>
            </footer>
        </>
    );
}
