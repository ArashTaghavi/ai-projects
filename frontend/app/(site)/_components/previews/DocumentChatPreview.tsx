"use client";

import PreviewComposer from "./PreviewComposer";
import { previewText, sendPause } from "./preview-timeline";

import { useEffect, useRef, useState } from "react";
import { FileText, Sparkles, UserRound } from "lucide-react";

const typingSpeed = 80;
const readingPause = 2200;
const documentName = "the-last-lighthouse.pdf";
const conversation = [
    {
        role: "user",
        text: "In The Last Lighthouse PDF, why does Nora return to the island?",
        citation: "",
    },
    {
        role: "assistant",
        text: "Nora receives a letter in her missing father's handwriting. It asks her to light the old lighthouse before the next storm.",
        citation: "p. 2 · The letter",
    },
    {
        role: "user",
        text: "What does she find inside the lighthouse? Is there a clue about her father?",
        citation: "",
    },
    {
        role: "assistant",
        text: "She finds his logbook beneath a loose floorboard. Its final entry describes a hidden cove and a boat arriving after midnight.",
        citation: "pp. 3–4 · The hidden logbook",
    },
    {
        role: "user",
        text: "Does the ending reveal whether her father is still alive?",
        citation: "",
    },
    {
        role: "assistant",
        text: "The ending leaves that open. Nora sees a familiar silhouette aboard the boat, but the story ends before she can identify him.",
        citation: "p. 6 · A light in the storm",
    },
] as const;

let nextStart = 800;
const timeline = conversation.map((message) => {
    const user = message.role === "user";
    const draftStart = nextStart;
    const start = user ? draftStart + message.text.length * typingSpeed + sendPause : draftStart;
    const end = start + (user ? 0 : message.text.length * typingSpeed);
    nextStart = end + readingPause;
    return { ...message, user, draftStart, start, end };
});
const completedAt = timeline[timeline.length - 1].end;
const cycleLength = completedAt + 7000;

export default function DocumentChatPreview() {
    const [elapsed, setElapsed] = useState(0);
    const transcript = useRef<HTMLDivElement>(null);
    const followLatest = useRef(true);

    useEffect(() => {
        const motion = window.matchMedia("(prefers-reduced-motion: no-preference)");
        let timer: ReturnType<typeof setInterval> | undefined;
        let reset: ReturnType<typeof setTimeout> | undefined;
        function updateMotion() {
            clearInterval(timer);
            clearTimeout(reset);
            reset = setTimeout(() => setElapsed(motion.matches ? 0 : completedAt), 0);
            if (motion.matches) {
                let startedAt = performance.now();
                timer = setInterval(() => {
                    const now = performance.now();
                    if (now - startedAt >= cycleLength) startedAt = now;
                    setElapsed(now - startedAt);
                }, 80);
            }
        }
        updateMotion();
        motion.addEventListener("change", updateMotion);
        return () => {
            clearInterval(timer);
            clearTimeout(reset);
            motion.removeEventListener("change", updateMotion);
        };
    }, []);

    useEffect(() => {
        const container = transcript.current;
        if (!container) return;
        if (elapsed < timeline[0].start) {
            container.scrollTop = 0;
            followLatest.current = true;
        } else if (followLatest.current) {
            container.scrollTop = container.scrollHeight;
        }
    }, [elapsed]);

    return (
        <figure
            aria-label="Illustrative multi-turn chat about a mystery story PDF, with page citations"
            className="relative mt-3 overflow-hidden rounded-xl border border-violet-300/10 bg-[#0c0b12]/45 text-left shadow-[0_0_2px_1px_#ffffff26,0_0_26px_3px_#ffffff14,0_0_36px_5px_#00000059,inset_0_0_10px_1px_#ffffff1a]!"
        >
            <figcaption className="flex items-center justify-between border-b border-white/5 px-3 py-2">
                <span className="flex items-center gap-2 font-mono text-[9px] tracking-[0.12em] text-zinc-500">
                    <span
                        aria-hidden="true"
                        className="size-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_#a78bfa70]"
                    />
                    document.chat
                </span>
                <span className="text-[9px] tracking-widest text-zinc-600 uppercase">Preview</span>
            </figcaption>
            <div
                aria-hidden="true"
                className="flex items-center gap-2 border-b border-white/5 px-3 py-2 text-[10px] text-zinc-500"
            >
                <FileText size={13} className="text-violet-300/70" />
                <span>{documentName}</span>
                <span className="ml-auto text-emerald-400/70">6 pages · Indexed</span>
            </div>
            <div
                ref={transcript}
                onScroll={(event) => {
                    const container = event.currentTarget;
                    followLatest.current =
                        container.scrollHeight - container.scrollTop - container.clientHeight < 32;
                }}
                aria-hidden="true"
                className="h-72 [scrollbar-width:thin] [scrollbar-color:#3a304a_transparent] space-y-3 overflow-y-auto overscroll-contain p-3"
            >
                {elapsed < timeline[0].start && (
                    <p className="text-[10px] text-zinc-600">Document ready. Ask a question...</p>
                )}
                {timeline
                    .filter((message) => elapsed >= message.start)
                    .map((message, index) => {
                        const user = message.role === "user";
                        const typing = elapsed < message.end;
                        const text = previewText(message, elapsed, typingSpeed);
                        return (
                            <div
                                key={index}
                                className={`flex items-start gap-2 ${user ? "ml-6 flex-row-reverse" : "mr-3"}`}
                            >
                                <span
                                    className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg border ${user ? "border-white/8 bg-white/4 text-zinc-400" : "border-violet-300/15 bg-violet-300/5 text-violet-300"}`}
                                >
                                    {user ? <UserRound size={12} /> : <Sparkles size={12} />}
                                </span>
                                <div
                                    className={`min-w-0 flex-1 rounded-lg border px-2.5 py-2 ${user ? "rounded-tr-sm border-white/6 bg-white/3" : "rounded-tl-sm border-violet-300/10 bg-violet-300/3"}`}
                                >
                                    <p
                                        className={`mb-1 text-[9px] font-medium tracking-wide ${user ? "text-zinc-500" : "text-violet-300/80"}`}
                                    >
                                        {user ? "YOU" : "DOCUMENT ASSISTANT"}
                                    </p>
                                    <p className="text-[11px] leading-5 text-zinc-300">
                                        {text}
                                        {typing && (
                                            <span className="ml-0.5 inline-block h-3 w-px animate-pulse bg-violet-200 align-middle motion-reduce:animate-none" />
                                        )}
                                    </p>
                                    {!user && !typing && (
                                        <span className="mt-2 inline-flex max-w-full items-start gap-1.5 rounded border border-cyan-300/10 bg-cyan-300/5 px-2 py-1 text-[9px] leading-4 text-cyan-200/70">
                                            <FileText size={10} className="mt-0.5 shrink-0" />
                                            <span>
                                                {documentName} · {message.citation}
                                            </span>
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
            </div>
            <PreviewComposer timeline={timeline} elapsed={elapsed} speed={typingSpeed} />
            <p className="sr-only">
                Illustrative conversation about a fictional mystery story PDF, The Last Lighthouse.{" "}
                {conversation
                    .map(
                        (message) =>
                            `${message.role}: ${message.text}${message.citation ? ` Source: ${documentName}, ${message.citation}.` : ""}`,
                    )
                    .join(" ")}
            </p>
        </figure>
    );
}
