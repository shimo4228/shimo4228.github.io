# r4 English typography review (built site, Chrome 156 on macOS)

Reviewer: senior English typographer, fresh, without eval/. Pages /, /about/, /writing/, /404.html; 320–1440, light
and dark, reduced motion. Fonts: Newsreader (web) for display, Charter for the rest; no fallbacks.

1. **fix** — one word on the last line of 15–21 of 83 multi-line article titles at every width (/writing/
   `.piece-title`). `text-wrap: pretty` is computed but dropped by Chrome when the `.u` span uses
   `box-decoration-break: clone`. Fix `.piece-title{text-wrap:balance}` → 0 at 375, 1024, 1280.
2. **fix** — single-line label underlines (`--u-y: calc(0.5lh + 0.5em)`) sit 0.144–0.169em below the baseline and cut
   Charter's 0.218em descenders, and sit apart from the name underline (0.263em) in the same row. Fix
   `--u-y: calc(0.5lh + 0.61em)` → 0.255–0.280em.
3. **fix or note** — the root sentence takes 8 lines at 360–380 ("accountability, / authorship,"); the keep group
   overflows by up to 2.8px. Fix: cap the size by width as the Japanese is (moves "30px at 375" by 0.55px).
4. **fix** — /about/ "For machines" breaks "…on the research / hub." at 390–414; the tie does not reach inside a link.
   Fix `.fact a{white-space:nowrap}`.
5. **fix** — straight quotes and apostrophes in 25 article titles; convert in the renderer, not in the feed.
6. **note** — "…computational / phenomenology." at 320/375; a 14-letter word is not a short widow.

No finding: hanging quotes, measure, size and leading, dashes, display rag at 768+.
