import { LoginCard } from "./_components";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AuthPage() {
    return (
        <main
            dir="ltr"
            lang="en"
            className="relative isolate flex min-h-svh items-center justify-center overflow-hidden px-5 py-12 font-sans text-zinc-100 selection:bg-violet-500/30"
        >
            <div className="w-full max-w-[420px]">
                <LoginCard />
                <Link
                    href="/"
                    className="mx-auto mt-7 flex w-fit items-center gap-2 rounded-md px-2 py-1.5 text-xs text-zinc-400 transition-colors hover:text-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-300"
                >
                    <ArrowLeft size={14} aria-hidden="true" />
                    Back to home
                </Link>
            </div>
        </main>
    );
}
