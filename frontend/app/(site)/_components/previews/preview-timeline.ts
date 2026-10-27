export const sendPause = 450;

export type PreviewMessage = {
    text: string;
    user: boolean;
    draftStart: number;
    start: number;
    end: number;
};

export function previewText(message: PreviewMessage, elapsed: number, speed: number) {
    if (elapsed < message.start) return "";
    return message.user
        ? message.text
        : message.text.slice(0, Math.max(0, Math.floor((elapsed - message.start) / speed)));
}

export function previewDraft(timeline: readonly PreviewMessage[], elapsed: number, speed: number) {
    const message = timeline.find(
        (item) => item.user && elapsed >= item.draftStart && elapsed < item.start,
    );
    if (!message) return { text: "", sending: false };
    const length = Math.max(0, Math.floor((elapsed - message.draftStart) / speed));
    return { text: message.text.slice(0, length), sending: length >= message.text.length };
}
