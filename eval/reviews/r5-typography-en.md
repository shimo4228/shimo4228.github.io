# r5 English typography review (built site after round 4, Chrome 156 on macOS)

Fresh reviewer, without eval/. /, /about/, /writing/, /404.html; 320–1440. Fonts: Newsreader16pt (static) for display,
Charter for the rest; Hiragino only for the 日本語 nav label.

1. **fix** — /about/ "research hub": the build's `&nbsp;` tie draws 10.56px in Charter against a 5.28px space. Fix: a
   `.tie` span with an ordinary space (label 111.9 → 106.6px).
2. **fix** — single-line label underlines (`--u-y: calc(0.5lh + 0.5em)`) cut Charter's descenders; two underline depths.
3. **fix** — #attention-not-self work line ends on "phenomenology." at 320/375 (no tie possible). Fix
   `.work-line:not(:has(.tie)){text-wrap:balance}`.
4. **note** — Newsreader is the static 16pt cut, used up to 52px; an opsz variable or display instance would suit.
5. **note** — the About lead runs 26–28 characters per line; a layout decision.
6. **note** — the sentence at 320/375 breaks inside the keep group, still between phrases.

No finding: quotes and apostrophes, hanging quotes, body size and measure, other display text, dark mode.
