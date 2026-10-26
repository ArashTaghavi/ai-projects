"use client";

import { useAuth } from "@/hooks/auth/useAuth";
import { Fingerprint, Sparkles } from "lucide-react";

export default function Dashboard() {
    const { data, isPending, isError, refetch, isFetching } = useAuth();

    return (
        <div className="space-y-8">
            <div>
                <p className="mb-3 text-[10px] font-medium tracking-[0.2em] text-violet-400 uppercase">
                    Your workspace at a glance
                </p>
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Overview</h1>
                <p className="mt-3 text-sm leading-6 text-zinc-500">
                    Welcome back{data ? `, ${data.data.username}` : ""}. Make room for what comes
                    next.
                </p>
            </div>
            <section
                aria-labelledby="welcome-title"
                className="relative overflow-hidden rounded-2xl border border-violet-400/15 bg-linear-to-br from-[#1b152d] via-[#15121f] to-[#111117] p-6 sm:p-9"
            >
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-20 -right-16 size-64 rounded-full bg-violet-500/10 blur-3xl"
                />
                <Sparkles size={26} className="mb-6 text-violet-300" aria-hidden="true" />
                <h2
                    id="welcome-title"
                    className="relative text-xl font-medium tracking-tight sm:text-2xl"
                >
                    Great learning starts here.
                </h2>
                <p className="relative mt-3 max-w-lg text-sm leading-7 text-zinc-400">
                    Your admin workspace is taking shape. This is where you’ll manage your learning
                    community and everything you build for it.
                </p>
                <span className="mt-7 inline-flex items-center gap-2 rounded-full border border-violet-300/15 bg-violet-300/5 px-3 py-1.5 text-[11px] text-violet-300">
                    <span className="size-1.5 rounded-full bg-violet-400" aria-hidden="true" />
                    Workspace foundation
                </span>
            </section>
            <section
                aria-labelledby="account-title"
                className="rounded-2xl border border-white/6 bg-[#111117] p-6"
            >
                <div className="mb-5 flex items-center gap-2.5">
                    <Fingerprint size={18} className="text-violet-300" aria-hidden="true" />
                    <h2 id="account-title" className="text-sm font-medium">
                        Your account
                    </h2>
                </div>
                {isPending ? (
                    <p role="status" className="animate-pulse text-sm text-zinc-500">
                        Loading account information…
                    </p>
                ) : isError ? (
                    <div role="alert" className="flex flex-wrap items-center gap-4">
                        <p className="text-sm text-red-300">Could not load your account.</p>
                        <button
                            type="button"
                            onClick={() => refetch()}
                            disabled={isFetching}
                            className="rounded-lg px-3 py-2 text-xs text-violet-300 hover:bg-violet-400/10 focus-visible:outline-2 focus-visible:outline-violet-400 disabled:opacity-50"
                        >
                            {isFetching ? "Retrying…" : "Try again"}
                        </button>
                    </div>
                ) : (
                    <dl className="grid gap-5 sm:grid-cols-2">
                        <div>
                            <dt className="text-xs text-zinc-500">Username</dt>
                            <dd className="mt-2 text-sm break-all text-zinc-200">
                                {data.data.username}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs text-zinc-500">User ID</dt>
                            <dd className="mt-2 font-mono text-sm text-zinc-200">{data.data.id}</dd>
                        </div>
                    </dl>
                )}
            </section>
        </div>
    );
}
