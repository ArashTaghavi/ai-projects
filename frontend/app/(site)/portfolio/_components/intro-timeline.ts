export type IntroFrame = {
    at: number;
    greeting: string;
    story: string;
    phase: "greeting" | "zoom" | "story" | "done";
    key?: "type" | "erase" | "space";
};

export function buildIntroTimeline(
    name: string,
    segments: readonly { text: string; correction?: string }[],
) {
    const greeting = `Hello, I'm ${name}.`;
    const frames: IntroFrame[] = [{ at: 0, greeting: "", story: "", phase: "greeting" }];
    let at = 500;
    let typedGreeting = "";
    let story = "";
    for (const [index, character] of Array.from(greeting).entries()) {
        at += 100 + ((index * 17) % 70) + (character === "," ? 220 : 0);
        typedGreeting += character;
        frames.push({
            at,
            greeting: typedGreeting,
            story,
            phase: "greeting",
            key: character.trim() ? "type" : "space",
        });
    }
    at += 350;
    frames.push({ at, greeting, story, phase: "zoom" });
    at += 1550;
    frames.push({ at, greeting, story, phase: "story" });
    function type(text: string) {
        for (const character of text) {
            at += 80 + ((story.length * 13) % 85) + (/[,.]/.test(character) ? 280 : 0);
            story += character;
            frames.push({
                at,
                greeting,
                story,
                phase: "story",
                key: character.trim() ? "type" : "space",
            });
        }
    }
    for (const segment of segments) {
        type(segment.text);
        if (segment.correction === undefined) continue;
        at += 650;
        let common = 0;
        while (
            common < segment.text.length &&
            common < segment.correction.length &&
            segment.text[common] === segment.correction[common]
        )
            common++;
        for (let index = segment.text.length; index > common; index--) {
            at += 80;
            story = story.slice(0, -1);
            frames.push({ at, greeting, story, phase: "story", key: "erase" });
        }
        at += 200;
        type(segment.correction.slice(common));
    }
    frames.push({ at: at + 400, greeting, story, phase: "done" });
    return frames;
}
