# Findings ledger

One line per finding: adopted or not, and why. Reviewers read fresh each round and never see earlier findings.

## Round 1 (summary)

Adopted: entrances moved to the top; duplicate Attention, Not Self removed; "Where they meet" renamed and introduced;
clearer link labels and hidden "for {project}" suffixes; theme-color; typographic apostrophe; print styles;
A serif limited to the sentence and quoted titles; B colour only in lines, right line joins left; C only true edges,
question text in nodes, mono only in the map. Not adopted: rewording jargon in verbatim hub one-liners (the author's words).

## Round 2

Reviewers: first-time visitor (V), typography (T), accessibility (X), art direction (R). Reports in `reviews/r2-*.md`.

| # | Finding | Decision | Why |
|---|---|---|---|
| V1 | Meeting intro names Attention, Not Self, but the section holds Authorship Strategy | adopted | Intro now names the two projects it holds (draft, for the author's read-through) |
| V2 | c: map makes authorship the meeting point, Contemplative Agent not on map | not adopted | The map shows questions; Contemplative Agent carries none. The section below says where it belongs |
| V3 / X-C1 / R | c: project name only in aria-label; questions only in SVG | adopted | Project name shown in each box; "Asks …" line under each project; figcaption |
| V4 | c: map wording hard-coded, differs from content file | adopted | questionText / questionLines in site.en.json feed both map and list |
| V5 | a: "judgment, authorship, and human attention" all go to #meet | adopted | Each word links to its project; bio text unchanged (build checks it) |
| V6 | Project names are not links | adopted | Name links to the first destination; 24px target kept via padding |
| T1 | Bio ends on short "age of AI." | adopted | `the&nbsp;age of&nbsp;AI`; b/c bio 33em gives one sentence per line on desktop |
| T2 / R-a | Entrances split 3 + 1 | adopted | 1 / 2×2 / 4 columns (a stays 2×2: four don't fit its column) |
| T3 | step-n2 clamp min > max | adopted | clampFor orders min and max |
| T4 | Footer rows tight on phones | adopted | row gap 3xs |
| T5 | a: opening quote not hung | adopted | text-indent −0.41em |
| T6 | a: rail title off baseline | adopted | align-items: baseline |
| T7 | a: title shrinks at 48rem | adopted | one size (step-1) both sides |
| T8 | a: dotted underline hits descenders | adopted | offset 0.27em, skip-ink none |
| T9 | a: long measure 600–767 | note | Left for DESIGN.md after the pick |
| R-a1 | a: third section should quote its bio phrase | not adopted | Its contents are Contemplative Agent and Authorship Strategy, not the three themes; the themes now link to their projects from the sentence |
| R-a2 | a: name has no clear role | adopted | Name set in the sentence's serif as its attribution |
| T11 | b: meeting second column 16px off the right path | adopted | column-gap includes the rail inset |
| T12 / R-b1 | b: join crosses cobalt, reads as a card corner | adopted | Ochre turns twice and runs down the second lane of the meeting rail |
| T13 | b: 2lh reserve leaves a hole | adopted | Subgrid, titles bottom-aligned |
| T14 / R-b5 | b: too much display type | adopted | Work names system sans step-0; display face only for name and section titles |
| R-b2 | b: idea disappears on phones | adopted | Two parallel rails through every section, faint outside their own |
| R-b3 / T16 | b: colours unequal | adopted | Darker cobalt key, brighter dark ochre, both lines at 3.6:1 |
| R-b4 | b: no key for the colours | adopted | Bio clauses underlined in their line colours, linked to the sections |
| X-B1 | b: lines vanish in forced colours | adopted | Borders in forced-colors |
| T17 | c: map 35px inside the column | adopted | viewBox cropped to the drawing |
| T18 | c: edges heavier than nodes | adopted | both 1.5, non-scaling |
| T19 / R-c1 | c: narrow edges tangle | adopted | Straight drops to the near question, one curve per side to the shared one |
| T20 | c: cramped narrow node | adopted | 16px in the narrow map |
| T21 | c: narrow map too tall at 36–56rem | adopted | capped at 21rem |
| T22 | c: index columns misalign | adopted | subgrid |
| T23 | c: ticks read as circles | superseded | Ticks removed; "Asks" lines say it in words |
| T24 / X-C4 | c: accent-line below 3:1 | adopted | 3.2; question outlines use the 5:1 accent |
| R-c2 | c: questions styled weaker than practices | adopted | Questions filled and outlined in accent; practices plain labels |
| R-c3 | c: flowchart chrome on practices | adopted | Pills removed |
| R-c5 | c: map below the fold at 1280×800 | partly | Crop moves it up; entrances stay above it (the site's one job) |
| X-C3 | c: Tab order on narrow map | adopted | Nodes emitted in visual order |
| X-C5 | c: forced-colors focus overridden | adopted | forced-colors block in c's own CSS |
| X-C6 | c: practice focus only a thicker stroke | adopted | 2px outline on every node |
| X1 | Dark palette prints at low contrast | adopted | Dark tokens are screen-only |
| X2 | Index link URL not printed | adopted | Added to the print rule |
| L2 | c: px font sizes in SVG | kept (warn) | SVG user units scale with the viewBox, not CSS px |

Round 2 close: L1–L3 pass (0 failures, 3 warnings, all SVG user units). Round 3 eye-review runs after the author picks a direction, on the real pages.

## Round 3 — the real site (direction A, regrouped by the bio's three phrases)

Author picks (2026-10-17): direction A; works grouped under three quoted phrases ("Building AI agents" → tools,
"watching the mind through meditation" → Attention, Not Self + the floating essay, "judgment, authorship" → the four
lines); "Where the two meet" removed. Four fresh reviewers read the built pages (`eval/reviews/r3-*.md`).

| ID | Finding | Decision | Change |
|---|---|---|---|
| V1 | visitor: lines title "judgment, authorship, and human attention" promises more than the section holds | adopted | Title cut to "judgment, authorship"; intro rewritten from the hub Through-line |
| V2 | visitor: About is a dead end | adopted | "The projects, and where I write" link back to the home page |
| V3 | visitor: "hub" unexplained | adopted | Named "research hub" in footer and facts |
| V4 | visitor: translate "Unaffiliated by design" | not adopted | Verbatim from the hub; marked `lang="en"` in JA instead |
| A1 | a11y: JA sentence `min(…, 7.1vw)` blocks text zoom (1.4.4) | adopted | `max(min(step-3, 6.9vw), 1.375rem)` |
| A2 | a11y: English dd in JA page unmarked | adopted | `<dd lang="en">` |
| A3 | a11y: JA sentence prints at screen size | adopted | 16pt in print |
| A4 | a11y: long tokens can overflow the sentence | adopted | `overflow-wrap: break-word` |
| A5 | a11y: /favicon.ico 404 (also on the hub) | adopted | 32px ICO with PNG payload at the root |
| T1 | typo: kinsoku loose | adopted | `:lang(ja){line-break:strict}` |
| T2 | typo: JA hang −0.9em leaves the 「 short | adopted | −1em |
| T3 | typo: JA rail titles too big at ≥48rem | adopted | capped at 1.3rem |
| T4 | typo: keep-all only on headings | adopted | all JA running text (p, li, dt, dd, h1–h3) |
| T5 | typo: JA tokens on `:root:lang(ja)` miss the JA half of 404 | adopted | `:lang(ja)` |
| T6 | typo: Safari hangs the quote twice | adopted | `hanging-punctuation:none` on titles |
| T7 | typo: EN sentence orphans "AI." | adopted | "the age of AI." tied |
| T8 | (found in shots) `<wbr>` before a space starts JA lines with a space | adopted | wbr moved after the space; linked JA phrases never break |
| R1 | art: rail quotes scroll away from their gloss | adopted | sticky at ≥48rem |
| R2 | art: grey landing card is foreign | adopted | moss 2px bar in the margin, fades; also for section titles (`.gloss:target`) |
| R3 | art: JA sentence `<br>` breaks orphan 。 | adopted | each sentence a hanging `.line` block |
| R4 | art: About doesn't share the gloss layout | adopted | name in the rail, paragraphs in the gloss column |
| R5 | art: footer links read as in-page | adopted | solid underline (they leave) and a hairline above |
| R6 | art: 404 is bare | adopted | the linked sentence, small, as the way back |
| R7 | art: favicon a dark block on tabs | adopted | moss quote on the page ground, dark-mode aware; apple icon uses the ground too |
| R8 | art: add old hub sameAs accounts | author call | listed in the reply |
| L2 | raw px in focus ring, hairlines, landing bar | kept (warn) | 1–3px hairlines are meant to stay hairlines |

Round 3 close: L1–L3 pass (0 failures, 7 warnings, all hairlines). Lighthouse 100 / 100 / 100 / 100 on `/` and `/ja/`
and `/about/`, re-run after the round-3 CSS.

Bio change (竜也, 2026-10-18): "accountability" (「責任」) added to the bio; the author updates GitHub and the other
bios by hand. The sentence now links judgment → Contemplative Agent, accountability → AAP, authorship → Authorship
Strategy, human attention → Attention, Not Self; the lines section quotes "judgment, accountability, authorship".
Also (same day, from the author's read): JA sentence lines that turn over now start flush, not hung.
Regroup (竜也, 2026-10-18): Contemplative Agent is an AI agent itself, so it opens "Building AI agents"; judgment
now links to AKC. The lines section holds AKC, AAP, Authorship Strategy; its intro says "the first two".
Mind section (竜也, 2026-10-18): titled with two quoted phrases, "watching the mind through meditation" and
"human attention", each on its own hanging line. Tools intro drops "local" / 「手元で動く」 (read as odd).
EN sentence (竜也, 2026-10-18): each sentence starts its own line, as in Japanese ("Exploring…" on a new line).
Mind section (竜也, 2026-10-18): adds the essay "After I Ran Out of Things to Ask AI, One Desire Remained" (JA on note, Sakamaki account; EN on Substack); lines are its first sentence.
Entrances (竜也, 2026-10-18): Sakamaki note and X added (also to sameAs, matching the hub). Entrance links widen their target with padding + negative margin instead of min-width, so "X" sits as close to its description as other names.
Analytics (竜也, 2026-10-18): Cloudflare Web Analytics token added as the build default (public value); the preview artifact is built without it.
Live check (竜也, 2026-10-18): JA brackets no longer break from their word (no line ends on （ or starts with it; a word joiner holds it), and the JA sentence may break after 、 before a linked word, so "AI の" no longer stands alone at ~1000px.
