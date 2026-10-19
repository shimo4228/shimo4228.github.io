# r6 English typography review (built site after round 5, Chrome 156 on macOS)

Fresh reviewer, without eval/. /, /about/, /writing/, /404.html; 320–1440.

1. **fix** — label underlines (`--u-y: calc(0.5lh + 0.5em)`) sit 0.146–0.171em below the baseline and cut Charter's
   0.218em descenders; the name's line sits at 0.41em. Fix `--u-y: calc(0.5lh + 0.66em)` → 0.305–0.33em.
2. **fix** — writing titles: a spaced dash starts a line (7 at 320), a number or "a"/"I" ends one (9 at 320),
   "Claude / Code" splits, "Built- / in". Fix: tie the dash to the word before, the number to the word after,
   Claude Code whole (the reviewer used U+00A0).
3. **fix** — "“Is There Any Point to This?”…" does not hang in Chrome (first letter 6.8–7.6px inside). Fix: `.hang` and
   `text-indent: -0.42em` where `hanging-punctuation` is unsupported.
4. **fix (fragile)** — the sentence's keep group misses 375 by 3px; tracking −0.02em fits it.
5. **note** — Newsreader's 16pt optical size at display sizes.

No finding: measure and leading, section-title hang, running-text last lines, quotes, figures, overflow, dark mode.
