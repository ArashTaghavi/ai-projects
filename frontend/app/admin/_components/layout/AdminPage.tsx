import type { ReactNode } from "react";

export interface AdminPageProps {
    title: string;
    description?: string;
    icon?: ReactNode;
    actions?: ReactNode;
    toolbar?: ReactNode;
    children?: ReactNode;
    fillHeight?: boolean;
}

export default function AdminPage({
    title,
    description,
    icon,
    actions,
    toolbar,
    children,
    fillHeight = false,
}: AdminPageProps) {
    return (
        <>
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    {icon && (
                        <span
                            aria-hidden="true"
                            className="rounded-2xl border border-white/10 bg-white/5 p-3 text-violet-300"
                        >
                            {icon}
                        </span>
                    )}
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-white">
                            {title}
                        </h1>
                        {description && <p className="mt-1 text-sm text-zinc-400">{description}</p>}
                    </div>
                </div>
                {actions}
            </div>
            {(toolbar != null || children != null) && (
                <div
                    className={`min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] ${fillHeight ? "flex min-h-0 flex-1 flex-col" : ""}`}
                >
                    {toolbar && (
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 p-5">
                            {toolbar}
                        </div>
                    )}
                    {children}
                </div>
            )}
        </>
    );
}
