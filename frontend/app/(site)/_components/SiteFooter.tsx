import Link from "next/link";

export default function SiteFooter() {
    return (
        <footer
            id="about"
            className="scroll-mt-40 border-t border-white/10 bg-[#111117]/90 sm:scroll-mt-28"
        >
            <div className="w-full px-5 py-10 sm:px-10 lg:px-16 xl:px-24">
                <div className="flex flex-col justify-between gap-8 sm:flex-row">
                    <div className="max-w-sm">
                        <Link
                            href="/"
                            className="text-lg font-semibold tracking-tight text-zinc-100"
                        >
                            OpenLearnLab
                        </Link>
                        <p className="mt-3 text-sm leading-7 text-zinc-400">
                            Learn by building. Explore practical AI projects and discover what you
                            can create with intelligent tools.
                        </p>
                    </div>
                    <nav
                        aria-label="Footer navigation"
                        className="flex flex-wrap items-start gap-6 text-sm text-zinc-400"
                    >
                        <Link href="/" className="hover:text-white">
                            Home
                        </Link>
                        <Link href="/#projects" className="hover:text-white">
                            Projects
                        </Link>
                        <Link href="/login" className="hover:text-white">
                            Sign in
                        </Link>
                    </nav>
                </div>
                <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-zinc-500">
                    <p>© {new Date().getFullYear()} OpenLearnLab. All rights reserved.</p>
                    <a href="#top" className="hover:text-zinc-200">
                        Back to top ↑
                    </a>
                </div>
            </div>
        </footer>
    );
}
