# r2 typography and layout review

Reviewer: senior typographer, no prior history with the project. Scope: directions a, b, c as built in `proto/out/`.
I looked at the r2 screenshots, then measured rendered layout in Chromium at 320, 375, 600, 703/704, 767/768, 831/832,
895/896, 900, 1024, 1280 and 1600, and rendered the main fixes as injected CSS to check them. Line breaks quoted below
are what the browser produced. No winner is picked. The bio and project lines are untouched; the only text-level
suggestion is a non-breaking space, which leaves every word as it is.

Tags: **fix** = should change before shipping. **note** = a judgment call or a minor point.

---

## Shared (all directions)

### 1. Bio / sentence ends on a three-word line, "age of AI." — **fix** (a, b, c)
- **a `.sentence`**: at 1024, 1280 and 1600 the last two lines are `human attention in the / age of AI.` The line break falls
  between an article and its noun, and the last line is about a third of the measure.
- **b, c `.bio`**: at every width from 600 to 1600 the paragraph sets as `…meditation. / Exploring judgment, authorship, and
  human attention in the / age of AI.` Only "age of AI." is left over, so a near-perfect two-line setting (one sentence per
  line) is missed by about ten characters.
- Fix, b and c: `.bio { max-inline-size: 33em; }` (now 30em in b, 32em in c). I checked this at 832, 1024 and 1280: it
  gives exactly two lines, `Building AI agents, and watching the mind through meditation. / Exploring judgment, authorship,
  and human attention in the age of AI.` Below about 800px nothing changes.
- Fix, a, plus b and c below 800px: in the markup, bind `the&nbsp;age` (the build already uses `of&nbsp;AI`). With this,
  a at 1280 sets `…and human attention in / the age of AI.`, and b and c at 320–375 set `and human attention in / the age of
  AI.` I checked both. `text-wrap: balance` is not the right tool for a. It splits the link "human attention" at 1280, and
  Chromium only balances up to 6 lines, while the sentence runs to 7 lines at 375 and 10 at 320.

### 2. Entrances orphan their fourth group onto a new row — **fix** (a at all widths ≥ ~480px; b and c at 600–830 / 600–703)
- `.entrance-groups` uses `repeat(auto-fit, minmax(min(100%, 10rem), 1fr))`. In a's 46rem column only 3 tracks fit
  (measured: 3 × 220px at 1280), so "Notes as they happen / X" drops alone into row 2, under "In English". It reads as a
  fifth category rather than the fourth of four. The same 3 + 1 split happens in b at 600 and in c at 600 and 703.
- Fix: replace auto-fit with explicit counts so the result is 1, then 2×2, then 4, and never 3 + 1:
  `.entrance-groups { grid-template-columns: 1fr; }`
  `@media (min-width: 30rem) { .entrance-groups { grid-template-columns: repeat(2, minmax(0, 1fr)); } }`
  and only for b and c: `@media (min-width: 52rem) { .entrance-groups { grid-template-columns: repeat(4, minmax(0, 1fr)); } }`.
  For a, keep 2×2 at every width (its 736px column cannot hold four groups without "every repository" wrapping).

### 3. Token: `--step-n2` has min > max — **note** (all)
- `clamp(0.7378rem, …, 0.6683rem)`: the ratio switch (1.2 → 1.333) makes step −2 shrink as the viewport grows, so `clamp`
  holds it at the min. The page doesn't use it yet. Fix it in `typeScale()` before anyone does (for example, clamp to
  `min(a, b)` / `max(a, b)`).

### 4. Footer cluster at 320–375 — **note** (a, b, c)
- `About · Machine-readable profile / Source of this site` wraps to two lines with `row-gap: 0`. The links' 2xs padding
  keeps it legible, but the second line sits tight. Use `.site-foot ul { --cluster-space: var(--space-3xs) var(--space-m); }`.

---

## a — "the sentence"

### 5. Opening quote mark doesn't hang in the rail — **fix** (all widths)
- `.section-title q`: the `“` (0.41em of Newsreader, measured) sits on the content edge, so "Building" and "Watching" start
  10px right of the name, the sentence, the entrances and "Where the two meet". In a commentary layout the left edge of
  the text is the whole idea.
- Fix: `.section-title:has(> q:first-child) { text-indent: -0.41em; }`. Use text-indent rather than a margin so the second
  line of "Watching the mind / through meditation" stays on the edge. `hanging-punctuation: first` works only in Safari.
  I checked it at 1280; at 375 the 25px gutter has room for the 10px hang.

### 6. Rail title and first work name don't share a baseline — **fix** (≥ 48rem)
- Measured baselines at 1280: "Building AI agents" 1125.1 vs harness-scope 1122.1 (3px). The mind section is also 3px off.
  At 768 and 1024 they are 1–2px off. Serif step-1 at 1.25 next to sans step-0 at 1.3 puts the text in different spots
  inside line boxes that start level.
- Fix: inside `@media (min-width: 48rem)`, `.practice, .meeting { align-items: baseline; }`. Checked: 0px off in all three
  sections at 768, 1024 and 1280, including the row-spanning meeting title.

### 7. Section-title size drops at the breakpoint — **fix** (767 → 768)
- Below 48rem `.section-title` is step-2 and grows to 28.6px at 767. At 768 it switches to step-1, 22.6px. The heading
  shrinks by 6px as the viewport gets wider.
- Fix: use one size on both sides of the breakpoint: `.section-title { font-size: var(--step-1); }` and delete the
  48rem override. In the stacked layout the serif face and the accent colour already set it apart from the 600-weight sans
  work names. If more size is wanted when stacked, cap it so it can't pass the rail size:
  `font-size: min(var(--step-2), 1.4rem)`.

### 8. Dotted link underline collides with descenders — **fix** (all widths, most visible ≥ 1024)
- `.sentence a` uses `text-underline-offset: 0.18em`. At 60px the dots run through g, p and j, and skip-ink cuts gaps into
  the dotted line under "Building", "agents", "judgment" and "authorship". The dotted rhythm turns irregular in exactly
  the words the eye reads first.
- Fix: `text-underline-offset: 0.27em;` (just below Newsreader's descender) plus `text-decoration-skip-ink: none;`, so the
  dots run unbroken. At leading 1.16 that still leaves clear space above the next line's ascenders; confirm at 375.

### 9. Work-line measure in the one-column range — **note** (600–767)
- Below 48rem `.work-line` reaches its 34em cap: 608px of sans at 18px, about 75 characters. That is long next to the
  45–50 characters in the two-column layout. `--measure: 30em` for a, or `max-inline-size: 32em` on `.work-line`, would
  keep the stacked and rail layouts closer.

### 10. "Where the two meet" sits in the quote rail without quotes — **note**
- Typographically it is fine: the rail holds a serif accent phrase. But without the hang from item 5 it is the only
  rail label aligned flush. Once 5 is fixed, all three line up on the same edge, which supports reading it as a different
  kind of label (a heading, not a quotation).

---

## b — "two paths"

### 11. Meeting columns don't line up with the two paths — **fix** (≥ 52rem)
- The left padding on `.meeting` (space-m + 2 × line-path) shrinks the box its 1fr/1fr grid divides, so the second column
  starts half that padding too early. Measured: Authorship Strategy at x = 692 vs Attention, Not Self at 709 (1280), 466 vs
  482 (832), 563 vs 579 (1024). The page's main vertical, the start of the right path, steps left by 16px.
- Fix: `@media (min-width: 52rem) { .meeting .works { column-gap: calc(var(--paths-gap) + var(--space-m) + var(--line-path) * 2); } }`.
  Checked: 709 = 709, 482 = 482, 579 = 579, and both meeting columns end up the same width as the path columns.

### 12. The ochre turn crosses the cobalt line where they meet — **fix** (≥ 52rem)
- `.merge-right` starts at `inset-inline-start: 0`, so its bottom border runs over the cobalt line's 3px. Below it the
  meeting rule puts ochre at 3–6px. At the junction the ochre cuts through the blue for one stroke width and then steps
  3px right.
- Fix: `.merge-right { inset-inline-start: var(--line-path); inline-size: calc(50% + var(--paths-gap) / 2); }`. Checked:
  the ochre now meets the cobalt edge to edge and flows into its own lane of the two-tone rule.

### 13. Reserving 2lh opens a hole under the one-line title — **fix** (≥ 52rem)
- `.practice .section-title { min-block-size: 2lh }` keeps the first works level, but leaves an empty line of about 35px
  between "Building AI agents" and harness-scope. The title then sits closer to the top of the line than to its own
  content.
- Fix: share one subgrid row for the titles and align them to the bottom:
  `.paths { grid-template-rows: auto auto auto; }`
  `.practice { display: grid; grid-row: 1 / span 2; grid-template-rows: subgrid; row-gap: 0; }`
  `.practice .section-title { min-block-size: 0; align-self: end; }` and `.merge { grid-row: 3; }`.
  Checked at 832, 1024 and 1280: the first works stay level (723/723, 698/698, 724/724), and the one-line title drops onto
  the same baseline as the second line of "through meditation". The coloured lines are unchanged.

### 14. Section title and work name are too close in size — **fix**
- Both are Schibsted 600: `.section-title` step-2 (28.1px at 1280) and `.work-name` step-1 (22.5px), a ratio of 1.25.
  With the same face and weight, five project names in each column compete with the two practice titles.
- Fix: `.work-name { font-size: var(--step-0); line-height: 1.3; }` (18px, a ratio of 1.56, which matches c), or raise the
  section titles to `var(--step-3)`. The first keeps the column calmer.

### 15. Narrow path columns just after the breakpoint — **note** (832–900)
- At 832 each column's text is 325px wide (about 38 characters), and AAP's line runs 3 lines while Attention, Not Self runs
  4. Moving the breakpoint to 56rem, or using `--paths-gap: var(--space-xl)` between 52rem and 64rem, gives 360px or more.

### 16. Line contrast in dark mode — **note**
- `--color-agents-line` and `--color-mind-line` are generated at 3:1, which is the floor for meaningful graphics. That's
  fine, but in the dark 375 shot the cobalt line is the weaker of the two. If the lines are the design, give them 3.5.

---

## c — "the question map"

### 17. The map's left edge is 35px inside the text column — **fix** (≥ 56rem)
- The wide SVG's `viewBox="0 0 960 330"` has the first question node at x = 35 and the practice pills starting at y = 24,
  and the bottom row ends 32 units above the box edge. At 1280 the map's visible left edge is 35px right of the name, the
  bio and the section titles, and the map adds roughly 30px of space above and below.
- Fix: crop to the drawing: `viewBox="34 23 892 276"`. Then the outermost strokes sit on the content edges, and the text
  scales from 17 to about 18.3 user px, matching the 18px body.

### 18. Edges are heavier than the nodes they connect — **fix**
- `.edge { stroke-width: 2 }` vs `.node rect { stroke-width: 1.5 }`. The connectors outweigh the boxes, which turns the
  hierarchy upside down. The strokes also scale with the SVG (about 1.3px at 896).
- Fix: `.edge { stroke-width: 1.5; vector-effect: non-scaling-stroke; }` and
  `.node rect { stroke-width: 1.5; vector-effect: non-scaling-stroke; }`.

### 19. Narrow map: the two strands from one node start at the same point and cross — **fix** (< 56rem)
- In `.map--narrow`, both agents edges start at (110,70) and both mind edges at (250,450), off the pill's flat edge and
  inside its rounded corner. They leave as a tangled lens, and the Q1 strand loops out and back to enter Q1 from the side.
- Fix (path data): make the inner edges short straight drops and only the outer ones curve. I rendered and checked these:
  `M122 76 V 128` (agents → Q1), `M92 76 C 30 100, 30 260, 65 260` (agents → Q2),
  `M268 444 C 330 420, 330 260, 295 260` (mind → Q2), `M238 444 V 392` (mind → Q3).

### 20. Narrow map: "travel with the idea?" nearly fills its box — **fix** (< 56rem)
- At 17 units the 21-character line is about 214 of the 230-unit box, leaving 8 units each side, against about 18 in the
  other nodes and in the wide map.
- Fix: `.map--narrow .node text { font-size: 16px; }` (checked). Alternatively widen the question rects to 250, but then
  the edge end points at 65/295 have to move too.

### 21. Narrow map dominates the 44–56rem range — **note** (600–895)
- Between 600 and 895 the narrow map is a 384 × 555px portrait block centred in up to 843px of width. It fills nearly a
  whole screen just as the index below switches to two columns. Cap it at
  `@media (min-width: 36rem) and (max-width: 55.99rem) { .map--narrow { max-inline-size: 20rem; } }` (about 460px tall), or
  start the wide map at 50rem with `.node text { font-size: 19px }` from there.

### 22. Practice titles misalign the two index columns — **fix** (≥ 44rem)
- "Watching the mind / through meditation" wraps to two lines and "Building AI agents" doesn't, so the first works sit
  at different heights: 1082 vs 1116 at 1280, 1057 vs 1089 at 1024, 1340 vs 1370 at 704. b already handles this; c doesn't.
- Fix (same subgrid as item 13): inside `@media (min-width: 44rem)`,
  `.index { grid-template-rows: auto auto auto; }`
  `.index > .practice { display: grid; grid-row: span 2; grid-template-rows: subgrid; row-gap: 0; }`
  `.index > .practice .section-title { align-self: end; }`. Checked: 1116/1116, 1089/1089 and 1370/1370.

### 23. The "square" ticks render as circles, sit low, and push the names in — **fix**
- `.work-name::before` is 0.55em (about 10px) with `border-radius: var(--radius-s)` (4px). That is almost a circle and
  reads as a lowercase "o". It also doesn't match the map's question boxes (4px on 250 × 72, which reads square). It sits on
  the baseline, so it hangs below the cap-height middle, and it indents the three marked names about 17px from every other
  name and from their own description lines.
- Fix: `inline-size: 0.6em; block-size: 0.6em; border: 0.11em solid var(--color-accent); border-radius: 0.08em;
  margin-inline: -1.05em 0.45em; vertical-align: 0.03em;`. This makes it square, hangs it in the gutter so the names stay on
  the column edge, and centres it near cap height. Checked at 1280; the 24px gutter at 375 has room for it. Using
  `--color-accent` (5:1) instead of `--color-accent-line` (2.6:1, below the 3:1 floor for meaningful graphics) also fixes
  how faint it is in dark mode.

### 24. Question node outlines and edges are below 3:1 — **fix** (light and dark)
- `--color-accent-line` is generated at 2.6. The question outlines and edges carry the map's meaning (which practice asks
  which question), so they fall under WCAG 1.4.11's 3:1. In the dark 375 shot the edges are faint.
- Fix: in `tokens.mjs`, direction c: `'accent-line': 3`.

### 25. Map text size against the page — **note**
- The mono map text is 17 user units: 17px at 1280, about 15px at 896, and about 15.3px in the narrow map at 375, beside an
  18–22px bio. As a diagram label that is fine. Once item 17 is fixed it reaches 18px at 1280, which settles it.

---

## Not findings (checked and fine)

- No horizontal overflow at any measured width (320–1600) in any direction.
- b and c work-name, line and link rhythm (3xs inside an item, m between items) is consistent. a's l between items fits
  the larger serif hierarchy.
- The `.entrance` / `.entrance-what` baseline pairing works in all three directions.
- b's left path text, right path text and meeting text all share the same left edge (space-m + 2 × line-path), which the
  comment in the CSS promises.
