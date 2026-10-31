These variable fonts are served locally through `next/font/local` in the root layout.

- Geist: https://github.com/google/fonts/tree/main/ofl/geist
- Geist Mono: https://github.com/google/fonts/tree/main/ofl/geistmono
- Vazirmatn: https://github.com/google/fonts/tree/main/ofl/vazirmatn

The corresponding SIL Open Font License is included beside each font.

The global sans and mono font stacks use Geist first, then Vazirmatn for Persian
and Arabic characters. Automatic Arial fallbacks are disabled so they cannot
capture Persian characters before Vazirmatn. The Vazirmatn face is restricted to
Arabic-script Unicode ranges and related bidirectional and joining characters.
No Google Fonts download is required during builds or page loads.
