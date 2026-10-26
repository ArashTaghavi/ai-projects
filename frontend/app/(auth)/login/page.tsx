import {
  CodeBackdrop,
  LoginBackground,
  LoginCard,
} from "./_components";

export default function LoginPage() {
  return (
    <main dir="ltr" lang="en" className="relative isolate flex min-h-svh items-center justify-center overflow-hidden bg-[#09090e] px-5 py-12 font-sans text-zinc-100 selection:bg-violet-500/30">
      <LoginBackground />
      <CodeBackdrop />

      <div className="w-full max-w-[420px]">
        <div className="mb-8 flex items-center justify-center gap-2.5 text-[11px] tracking-[0.2em] text-zinc-500" dir="ltr">
          <span className="size-1.5 rounded-full bg-violet-400 shadow-[0_0_12px_#a78bfa]" />
          ARTIFICIAL INTELLIGENCE
        </div>

        <LoginCard />
        <p dir="ltr" className="mt-7 text-center font-mono text-[10px] tracking-[0.2em] text-zinc-700">LESS FRICTION. MORE POSSIBILITY.</p>
      </div>
    </main>
  )
}
