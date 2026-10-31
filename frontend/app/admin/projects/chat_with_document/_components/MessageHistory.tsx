import type { ChatTurnResponse } from "@/services/admin/projects/chat-with-document/chat-with-document.service";
import { groupMessagesByDay, messageDate } from "../_lib/message-dates";

function MessageTime({ timestamp }: { timestamp: string }) {
    const date = messageDate(timestamp);
    if (!date.iso) return null;
    return (
        <time
            dateTime={date.iso}
            title={date.full}
            aria-label={date.full}
            dir="rtl"
            className="mt-2 block text-right text-[10px] text-zinc-400 tabular-nums"
        >
            {date.time}
        </time>
    );
}

export default function MessageHistory({ turns }: { turns: ChatTurnResponse[] }) {
    return groupMessagesByDay(turns).map((group) => (
        <section
            key={group.day}
            aria-label={group.label}
            className="relative mx-auto max-w-4xl space-y-5 pb-2"
        >
            <div className="sticky top-0 z-10 flex justify-center py-2">
                <span
                    dir="rtl"
                    className="rounded-full border border-white/10 bg-[#20202b]/95 px-4 py-1.5 text-xs text-zinc-300 shadow-sm backdrop-blur-md"
                >
                    {group.label}
                </span>
            </div>
            {group.turns.map((turn) => (
                <div key={turn.id} className="space-y-3">
                    <div className="ml-auto max-w-[90%] rounded-2xl rounded-tr-sm bg-violet-500/15 p-4">
                        <p className="mb-2 text-xs text-violet-300">You</p>
                        <p
                            dir="auto"
                            className="text-sm leading-7 break-words whitespace-pre-wrap text-zinc-100"
                        >
                            {turn.question}
                        </p>
                        <MessageTime timestamp={turn.created_at} />
                    </div>
                    <div className="mr-auto max-w-[95%] rounded-2xl rounded-tl-sm bg-white/5 p-4">
                        <p className="mb-2 text-xs text-zinc-400">Assistant</p>
                        <p
                            dir="auto"
                            className="text-sm leading-7 break-words whitespace-pre-wrap text-zinc-200"
                        >
                            {turn.answer}
                        </p>
                        <MessageTime timestamp={turn.created_at} />
                    </div>
                </div>
            ))}
        </section>
    ));
}
