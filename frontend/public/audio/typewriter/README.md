# Recorded typewriter sounds

Real recordings of a **Hermes Precisa 305** by **Joseph SARDIN**, from BigSoundBank.

| Local file  | Original recording                                                                      | License |
| ----------- | --------------------------------------------------------------------------------------- | ------- |
| `key.mp3`   | [Typewriter, Key (2842)](https://bigsoundbank.com/typewriter-key-s2842.html)            | CC0     |
| `space.mp3` | [Typewriter, space (2843)](https://bigsoundbank.com/machine-a-ecrire-espace-s2843.html) | CC0     |

Downloaded on 2026-10-27 from the publisher's `/UPLOAD/mp3/2842.mp3`
and `/UPLOAD/mp3/2843.mp3` preview files.

[Publisher's license information](https://bigsoundbank.com/licenses.html).

The original MP3 files are stored unchanged. Playback removes leading/trailing
silence, fades the last 5 ms, and adjusts volume. Playback speed and pitch stay
unchanged. The spacebar recording is also used for the backspace animation.
No synthesized sound is mixed into these recordings.

## Additional mechanical keyboard recordings

These are optional alternatives for listening and comparison; the website still
uses the existing Hermes typewriter recordings above. Downloaded on 2026-10-27.

All five files are unchanged high-quality MP3 previews provided by Freesound,
with CC0-1.0 licenses verified on their original sound pages.

| File                                                               | What it contains                                                               | Author / original source                                                                      |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| [cherry-mx-brown-press.mp3](cherry-mx-brown-press.mp3)             | Single key press, Cherry MX Brown (about 0.36 s)                               | [Foxfire- / 570754](https://freesound.org/people/Foxfire-/sounds/570754/)                     |
| [cherry-mx-brown-release.mp3](cherry-mx-brown-release.mp3)         | Single key release, Cherry MX Brown (about 0.35 s)                             | [Foxfire- / 570755](https://freesound.org/people/Foxfire-/sounds/570755/)                     |
| [cherry-mx-brown-typing.mp3](cherry-mx-brown-typing.mp3)           | Continuous typing, Cherry MX Brown (about 64 s)                                | [majod / 400167](https://freesound.org/people/majod/sounds/400167/)                           |
| [cherry-mx-blue-typing.mp3](cherry-mx-blue-typing.mp3)             | Continuous typing, Cherry Blue switches (about 141 s)                          | [EricsSoundschmiede / 382057](https://freesound.org/people/EricsSoundschmiede/sounds/382057/) |
| [whitefox-hako-violet-typing.mp3](whitefox-hako-violet-typing.mp3) | WhiteFox with Hako Violet switches; typing, then individual keys (about 170 s) | [grcekh / 546167](https://freesound.org/people/grcekh/sounds/546167/)                         |

Long typing recordings are for comparison. For per-character playback, use the
short key recordings or extract individual strikes from a longer recording.

Direct preview URLs, sizes, licenses and SHA-256 checksums are recorded in
[mechanical-keyboards.json](mechanical-keyboards.json).

## Keyboard selector samples

The portfolio sound selector offers Hermes, Cherry MX Brown, Cherry MX Blue,
and WhiteFox Hako Violet. Sound stays off until the enable button is clicked.

`cherry-mx-blue-key-1.mp3` through `cherry-mx-blue-key-4.mp3` and
`whitefox-hako-violet-key-1.mp3` through `whitefox-hako-violet-key-4.mp3`
are 180 ms strikes extracted from the corresponding recordings above.
They keep the original pitch, are converted to mono, peak-normalized, faded at
the edges, and encoded as 128 kbps MP3. See
[keyboard-key-samples.json](keyboard-key-samples.json) for exact source offsets.
The original full-length recordings remain unchanged.

The Brown preset uses its recorded key press and release. Blue and WhiteFox
alternate between four short strikes. Space and backspace use quieter strikes
from the chosen keyboard rather than mixing in the Hermes recording.
