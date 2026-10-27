const root = "/audio/typewriter";

export const keyboardSounds = [
    {
        id: "typewriter",
        label: "Hermes · Typewriter",
        type: [`${root}/key.mp3`],
        space: [`${root}/space.mp3`],
        erase: [`${root}/space.mp3`],
    },
    {
        id: "brown",
        label: "Cherry MX Brown",
        type: [`${root}/cherry-mx-brown-press.mp3`],
        space: [`${root}/cherry-mx-brown-press.mp3`],
        erase: [`${root}/cherry-mx-brown-release.mp3`],
    },
    {
        id: "blue",
        label: "Cherry MX Blue",
        type: [1, 2, 3, 4].map((index) => `${root}/cherry-mx-blue-key-${index}.mp3`),
        space: [`${root}/cherry-mx-blue-key-2.mp3`],
        erase: [`${root}/cherry-mx-blue-key-4.mp3`],
    },
    {
        id: "whitefox",
        label: "WhiteFox · Hako Violet",
        type: [1, 2, 3, 4].map((index) => `${root}/whitefox-hako-violet-key-${index}.mp3`),
        space: [`${root}/whitefox-hako-violet-key-2.mp3`],
        erase: [`${root}/whitefox-hako-violet-key-4.mp3`],
    },
] as const;

export type KeyboardSoundId = (typeof keyboardSounds)[number]["id"];
