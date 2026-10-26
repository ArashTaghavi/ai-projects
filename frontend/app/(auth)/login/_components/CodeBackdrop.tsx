'use client'

import { useEffect, useState } from 'react'
import { codeLines, codeLength, previewPrompt, previewResponse, responseStart, previewCycleLength } from './code-data'

export default function CodeBackdrop() {
  const [position, setPosition] = useState(0)

  useEffect(() => {
    const motion = window.matchMedia('(min-width: 1024px) and (prefers-reduced-motion: no-preference)')
    let timer: ReturnType<typeof setInterval> | undefined
    function updateMotion() {
      clearInterval(timer)
      if (!motion.matches) {
        setPosition(previewCycleLength - 1)
        return
      }
      setPosition(0)
      timer = setInterval(() => setPosition((current) => (current + 1) % previewCycleLength), 55)
    }
    updateMotion()
    motion.addEventListener('change', updateMotion)
    return () => {
      clearInterval(timer)
      motion.removeEventListener('change', updateMotion)
    }
  }, [])

  return (
    <>
    <div aria-hidden="true" dir="ltr" className="pointer-events-none absolute top-1/2 left-6 -z-10 hidden w-[calc((100vw-420px)/2-48px)] max-w-80 -translate-y-1/2 overflow-hidden font-mono text-xs leading-8 select-none [mask-image:linear-gradient(to_bottom,transparent,black_5%,black_90%,transparent)] lg:block xl:left-[6vw]">
      <div className="mb-5 flex items-center gap-2 text-[9px] tracking-[0.18em] text-zinc-400"><span className="size-1 rounded-full bg-violet-400/70" /> playground.py <span className="ml-auto text-zinc-500">PYTHON</span></div>
      <div className="border-l border-violet-400/10 py-3 pl-4">
        {codeLines.map((line, index) => {
          const start = codeLines.slice(0, index).reduce((sum, previous) => sum + previous.reduce((total, token) => total + token.text.length, 0) + 1, 0)
          const length = line.reduce((sum, token) => sum + token.text.length, 0)
          return (
            <div key={index} className="flex h-8 whitespace-pre">
              <span className="mr-4 w-4 shrink-0 text-right text-zinc-500">{String(index + 1).padStart(2, '0')}</span>
              <span>{line.map((token, tokenIndex) => {
                const tokenOffset = start + line.slice(0, tokenIndex).reduce((sum, previous) => sum + previous.text.length, 0)
                const visible = token.text.slice(0, Math.max(0, position - tokenOffset))
                return <span key={tokenIndex} className={token.color}>{visible}</span>
              })}{position >= start && position < start + length + 1 && <span className="inline-block h-3 w-px animate-pulse bg-violet-300/80 align-middle motion-reduce:animate-none" />}</span>
            </div>
          )
        })}
        <div className="mt-6 h-24 border-t border-white/5 pt-3 text-[10px] leading-7">
          <p className={position >= codeLength + 5 ? 'text-zinc-300' : 'invisible'}><span className="mr-2 text-violet-400/60">›</span>Understanding context…</p>
          <p className={position >= codeLength + 30 ? 'text-cyan-200' : 'invisible'}><span className="mr-2">✓</span>Response ready<span className="ml-2 text-zinc-500">/ 01</span></p>
        </div>
      </div>
    </div>
    <div aria-hidden="true" dir="ltr" className="pointer-events-none absolute top-1/2 right-6 -z-10 hidden w-[calc((100vw-420px)/2-48px)] max-w-80 -translate-y-1/2 font-mono text-xs leading-8 select-none [mask-image:linear-gradient(to_bottom,transparent,black_5%,black_90%,transparent)] lg:block xl:right-[6vw]">
      <div className="mb-5 flex items-center gap-2 text-[9px] tracking-[0.18em] text-zinc-400"><span className="size-1 rounded-full bg-cyan-300/80" /> output.preview <span className="ml-auto text-zinc-500">AI</span></div>
      <div className="min-h-[390px] border-l border-cyan-300/15 py-3 pl-5">
        <p className="text-[9px] tracking-[0.2em] text-zinc-500">PROMPT / 01</p>
        <p className="mt-3 min-h-16 text-sm leading-7 text-zinc-200">{previewPrompt.slice(0, Math.max(0, position - 100))}</p>
        <div className="my-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px]">
          {['Understand', 'Explore', 'Create'].map((stage, index) => (
            <span key={stage} className="flex items-center gap-2">
              {index > 0 && <span className="text-zinc-700">→</span>}
              <span className={`transition-colors duration-700 ${position >= codeLength + 5 + index * 10 ? 'text-cyan-200' : 'text-zinc-700'}`}>{stage}</span>
            </span>
          ))}
        </div>
        <div className="border-t border-white/5 pt-5">
          <div className="mb-3 flex items-center gap-2 text-[9px] tracking-[0.2em] text-violet-300/80"><span className={`size-1 rounded-full ${position >= responseStart ? 'bg-cyan-300 shadow-[0_0_8px_#67e8f9]' : 'bg-zinc-700'}`} />RESPONSE</div>
          <p className="min-h-28 leading-7 text-zinc-300">
            {previewResponse.slice(0, Math.max(0, position - responseStart))}
            {position >= responseStart && position < responseStart + previewResponse.length && <span className="ml-1 inline-block h-3 w-px animate-pulse bg-cyan-200 align-middle motion-reduce:animate-none" />}
          </p>
          <p className={`mt-4 text-[9px] tracking-widest text-cyan-300/70 ${position >= responseStart + previewResponse.length ? '' : 'invisible'}`}>✓ GENERATION COMPLETE</p>
        </div>
      </div>
    </div>
    </>
  )
}
