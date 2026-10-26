import LoginForm from './LoginForm'

export default function LoginCard() {
  return (
    <>
        <section aria-labelledby="login-title" className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#111117]/90 px-6 py-9 shadow-[0_24px_100px_-24px_#000000] sm:px-10 sm:py-10">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-violet-300 to-transparent shadow-[0_0_18px_2px_#8b5cf670]" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-10 -top-16 h-32 rounded-full bg-violet-500/20 blur-3xl" />
          <div aria-hidden="true" className="mb-7 flex size-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/10 text-violet-300 shadow-[0_0_30px_-12px_#8b5cf6]">
            <svg width="29" height="29" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" /><path d="m20 2 .6 1.4L22 4l-1.4.6L20 6l-.6-1.4L18 4l1.4-.6L20 2Z" />
            </svg>
          </div>
          <h1 id="login-title" className="text-2xl leading-relaxed font-semibold tracking-tight sm:text-[28px]">Welcome to your AI space</h1>
          <p className="mt-3 text-[13px] leading-7 text-zinc-500">Enter your username and password to continue.</p>

          <LoginForm />
          <div className="mt-8 flex items-center justify-center gap-2 border-t border-white/5 pt-6 text-[11px] text-zinc-600">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z" /><path d="m8 12 3 3 5-6" /></svg>
            Your personal workspace for AI
          </div>
        </section>
    </>
  )
}
