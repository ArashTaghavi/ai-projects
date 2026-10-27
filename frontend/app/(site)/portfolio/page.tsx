import type { Metadata } from "next";
import SiteHeader from "../(home)/_components/SiteHeader";
import ProfileIntro from "./_components/ProfileIntro";
import ContactLinks from "./_components/ContactLinks";
import SkillsSection from "./_components/SkillsSection";
import { profile } from "./_data/portfolio";

export const metadata: Metadata = {
    title: `${profile.name} | Software Developer`,
    description:
        "Self-taught software developer exploring artificial intelligence, intelligent applications, and 3D graphics. Get in touch with Arash Taghavi.",
};

export default function PortfolioPage() {
    return (
        <div
            id="top"
            className="relative isolate flex min-h-screen flex-col bg-black font-sans text-zinc-100 selection:bg-sky-300/25"
        >
            <SiteHeader />
            <main className="mx-auto w-full max-w-[1440px] flex-1 px-5 sm:px-8">
                <h1 className="sr-only">{profile.name} — Self-taught software developer</h1>
                <div className="mx-auto w-full max-w-3xl">
                    <ProfileIntro />
                </div>
                <SkillsSection />
                <ContactLinks />
            </main>
        </div>
    );
}
