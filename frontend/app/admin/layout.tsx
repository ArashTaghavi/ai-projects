import { Suspense, type ReactNode } from "react";
import AdminShell from "./_components/AdminShell";

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <Suspense
            fallback={
                <div
                    role="status"
                    className="flex h-dvh items-center justify-center bg-[#0c0c11] text-sm text-zinc-400"
                >
                    Loading workspace…
                </div>
            }
        >
            <AdminShell>{children}</AdminShell>
        </Suspense>
    );
}
