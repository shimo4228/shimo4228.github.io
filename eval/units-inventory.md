# Units inventory

The adopted findings in `ledger.md` (rounds 1–3 and the later author passes, real site only; the b/c prototype
findings are left out) folded into units. One row = one unit; the findings it folds are in "from".
judge: M machine, H hybrid, A author. frozen = has a check in `eval/units.mjs`; existing = covered by `run.mjs` or
the build already.

| # | unit | judge | state | from |
|---|---|---|---|---|
| 1 | ja-kinsoku-start (line start and end, brackets held to their word) | M | frozen | R3 T1, live check 1 |
| 2 | quote hang (JA 「, EN “) | M | frozen (JA) | R2 T5, R3 T2, T6 |
| 3 | display-text lines (JA/EN sentence, JA titles turn after 、, JA rail title on one line, share images) | M | frozen (sentences) | R2 T1, R3 T3, T7, R3 R3, keep/tail, Hiragino pass, OG |
| 4 | ja-no-space-at-line-start | M | frozen | R3 T8 |
| 5 | keep-all scope (short lines keep phrases whole, running text fills the measure) | M | open | R3 T4, live check 2 |
| 6 | underline extent (、 outside, bracket half-width, offset and skip-ink) | H | open | R2 T8, Hiragino pass |
| 7 | sentence-size-balance | H | frozen | phone/PC detail loop |
| 8 | Japanese display face falls back to Mincho without Hiragino (Android) | M | open | phone/PC detail loop |
| 9 | lang marks on mixed-language text | M | open | R3 A2, V4 |
| 10 | typographic punctuation and generated-page tells | M | existing | R1, run.mjs L2 |
| 11 | type-scale roles (one title size, JA rail cap, display face only for name and titles) | M | open | R2 T7, T14, R3 T3 |
| 12 | edge and baseline alignment | M | existing (near-miss) | R2 T6 |
| 13 | entrance grid columns per width | M | open | R2 T2 |
| 14 | sticky rail quotes at ≥48rem | M | open | R3 R1 |
| 15 | overflow, long tokens | M | existing | R3 A4 |
| 16 | text zoom not blocked by vw-only sizes | M | open | R3 A1 |
| 17 | target size | M | existing | R2 V6, entrances |
| 18 | focus visible | M | existing | R2 X-C6 |
| 19 | forced colours | M | open | R2 X-B1 |
| 20 | print (dark tokens screen-only, URLs printed, JA size) | M | open | R2 X1, X2, R3 A3 |
| 21 | icons (favicon.ico present, dark-aware mark) | H | open | R3 A5, R7 |
| 22 | head metadata (theme-color, JSON-LD, ownership file, analytics token) | M | existing (JSON-LD) | R1, Search Console, analytics |
| 23 | no dead-end pages | M | open | R3 V2 |
| 24 | the author's words verbatim | M | existing (build bio check) | R1, R3 V4 |
| 25 | spacing rhythm (footer rows, entrance name to description) | H | author-eye | R2 T4, entrances |
| 26 | section intros say what the section holds | A | author-eye | R2 V1, R3 V1, V3 |
| 27 | page family (About and 404 share the gloss layout) | A | author-eye | R3 R4, R6 |
| 28 | state marks (landing bar on :target, link kinds) | A | author-eye | R3 R2, R5 |
| 29 | the whole page in the author's fonts | A | author-eye | Hiragino pass |

29 units from about 60 adopted findings: machine 21, hybrid 4, author 4.
