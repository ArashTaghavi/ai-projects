import { ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import Navigation from "./Navigation";

export default function Aside() {
    return (
        <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-white/6 bg-[#101016] p-6 lg:flex">
            <Link
                href="/"
                className="flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-violet-400"
            >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/25 bg-violet-400/10 text-violet-300">
                    <Sparkles size={22} aria-hidden="true" />
                </span>
                <span>
                    <span className="block text-sm font-semibold tracking-tight">OpenLearnLab</span>
                    <span className="mt-1 block text-[10px] tracking-[0.16em] text-zinc-500 uppercase">
                        Admin workspace
                    </span>
                </span>
            </Link>
            <div className="mt-12">
                <Navigation />
            </div>
            <div className="mt-auto rounded-2xl border border-violet-400/10 bg-linear-to-br from-violet-500/8 to-transparent p-4">
                <ShieldCheck size={20} className="mb-3 text-violet-300" aria-hidden="true" />
                <p className="text-xs font-medium text-zinc-200">Your learning space, managed.</p>
                <p className="mt-2 text-xs leading-5 text-zinc-500">
                    A home for your people, courses, and ideas.
                </p>
            </div>
            <p className="mt-5 text-[10px] text-zinc-600">OpenLearnLab · Admin panel</p>
        </aside>
    );
}
