import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-black font-sans text-zinc-100 selection:bg-violet-500/30">
            {children}
        </div>
    );
}
