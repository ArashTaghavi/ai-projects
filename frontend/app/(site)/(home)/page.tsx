import type { Metadata } from "next";
import SiteHeader from "./_components/SiteHeader";
import SiteFooter from "./_components/SiteFooter";
import ProjectSlider from "./_components/ProjectSlider";

export const metadata: Metadata = {
    title: "AI Projects | OpenLearnLab",
    description: "Explore eight AI experiences, from document chat to multi-agent workflows.",
};

export default function Home() {
    return (
        <div
            id="top"
            className="relative isolate flex min-h-screen w-full flex-col font-sans text-zinc-100 selection:bg-violet-500/30"
        >
            <SiteHeader />
            <main className="h-[calc(100dvh-var(--site-header-height,126px))] min-h-0 min-w-0 shrink-0 sm:h-[calc(100dvh-var(--site-header-height,80px))]">
                <ProjectSlider />
            </main>
            <SiteFooter />
        </div>
    );
}
