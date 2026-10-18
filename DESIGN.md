---
name: Tatsuya Shimomoto — the sentence
description: Personal site at shimo4228.github.io. The GitHub bio is the root text; every section quotes a phrase of it and glosses it.
# Inputs. site/tokens.mjs turns these into site.css custom properties (Leonardo for colour, Utopia for size).
viewport: { min: 360, max: 1280 }
colors:
  neutral: "#5d6a63"
  accent: { key: "#3b5e46", keyDark: "#4f9a68" }
  lightness: { light: 97, dark: 11 }
  # Contrast ratios against the page background. Text roles stay at or above WCAG AA; lines are decorative except accent-line.
  ratios:
    surface-2: 1.07
    line: 1.45
    line-strong: 2.2
    accent-wash: 1.12
    accent-line: 3
    # Raised from 5.6 / 6.2 in review (2026-10-18): small Mincho W3 read faint, and the moss quote read lighter than
    # the Charter / Mincho text beside it.
    muted: 6.5
    accent: 8
    text: 14
typography:
  scale: { baseMin: 17, baseMax: 19, ratioMin: 1.2, ratioMax: 1.333 }
  display:
    family: Newsreader
    file: newsreader-latin-400-normal.woff2
    weight: 400
    stack: '"Newsreader", "Iowan Old Style", "Palatino Linotype", Georgia, serif'
    stackJa: '"Newsreader", "Hiragino Mincho ProN", "Shippori Mincho Display", "Yu Mincho", "YuMincho", "Noto Serif JP", serif'
  displayJa:
    # Kanji and kana for the display roles where the system has no Hiragino Mincho (Windows, Android, Linux).
    # Subset at build time to the characters those roles use; Apple devices never download it.
    family: Shippori Mincho Display
    source: site/fonts/ShipporiMincho-Regular.ttf
    weight: 400
  body:
    # English body in a system serif, matching the all-Mincho Japanese pages (竜也, 2026-10-18). Charter ships on
    # Apple devices; Windows falls back to Sitka / Cambria, Android to its serif. Nothing is downloaded.
    stack: 'Charter, "Bitstream Charter", "Sitka Text", Cambria, Georgia, serif'
    # Japanese pages read in Mincho throughout, project names in its bold (竜也, 2026-10-18).
    stackJa: '"Hiragino Mincho ProN", "Yu Mincho", "YuMincho", "Noto Serif JP", "Noto Serif CJK JP", serif'
spacing: { baseMin: 17, baseMax: 19 }
rounded: { s: 0.25rem }
layout:
  measure: 34em
  column: 46rem
  rail: 15rem
  note: 11rem
  breakpoint: 48rem
  wide: 80rem
---

# DESIGN.md

The site is one sentence and its commentary. The bio, set large in Newsreader, is the root text. Below it, each
section opens with one of its phrases in quotation marks, the way a commentary quotes the line it explains, and
the works under it are the gloss. Phrases in the sentence link to the part of the page that answers them.

## Rules

1. **One web font, one weight, one job.** Newsreader 400 appears only in the root sentence, the quoted section
   titles, the name, and the About page's opening paragraphs. Everything else is the system face. In Japanese the
   serif takes Hiragino Mincho where the system has it (Apple devices download nothing); elsewhere it takes
   Shippori Mincho, subset at build time to the few dozen characters those roles use.
2. **Colour is a contrast ratio, not a hex value.** Colours come from the ratios above. The accent (moss) marks
   only what belongs to the commentary: quoted titles, the dotted underlines of in-page links, the landing mark.
3. **Two kinds of link, two underlines.** Links that stay on the page are dotted; links that leave are solid.
4. **Quotation marks hang.** The opening mark of a quoted title sits in the margin so the words, not the mark,
   share the column edge.
5. **No numbers that go stale.** No counts, stars, versions, dates of last update or "latest" boxes.
6. **Every string has a source.** The bio is verbatim from GitHub; project lines are verbatim from the hub README
   (EN / JA). Anything Claude wrote is marked `draft` in `content/` until the author has read it.
7. **Space and type are fluid.** Sizes come from the Utopia scale between 360 and 1280px; no breakpoint changes a
   size, only the layout (one column below 48rem, quote rail and gloss above it). The root sentence is the one
   exception: its own clamp keeps the English at about 1.15 times the Japanese, the optical pair for Latin over
   kanji and kana, and the Japanese is capped by width so its lines fall where they are meant to.
8. **Lines turn over between phrases.** The root sentence breaks only where its meaning divides: English between
   the phrases of `phrasing` (every other space is tied), Japanese after the `keep` and `tail` groups.
8. **Japanese is set, not translated into the English layout.** BudouX phrase breaks, `word-break: keep-all` on all
   running text, `line-break: strict`, looser leading, 「」 hung a full em. Spaces between Latin and kana are
   non-breaking; a break point never starts a line with a space. The sentence is one hanging line per sentence.

## Components

- `nav`: Home, Writing, About, then the language switch (竜也, 2026-10-18). The name above the sentence also leads home.
- `sentence`: the root text, one `.line` per sentence in both languages. English 30px at 375 to 52px from 880px, leading 1.16, measure 19em. Japanese: step-3 capped at 7.1vw with a rem floor
  (zoom still works), leading 1.5, one `.line` per sentence. Phrases link to `#tools`, `#mind`, the lines.
- `entrances`: the writing platforms, grouped by language, in a definition list (2 columns above 30rem), at the head
  of the writing page. Code, records and X are in the footer of every page, marked rel="me" (竜也, 2026-10-18: the home
  page carries too much at once).
- `writing`: every published article and essay from zenn-content's `docs/publications.json`, by year in the rail, one
  row per piece (date, title, platform), newest first; only pieces whose `published_at` has passed. No count, no "latest".
- `margin note`: from 80rem the page shifts left by half a note (11rem) and each work's links, or a piece's platform,
  step into the right margin. Space alone separates note from column.
- `scroll-in`: works, intros, quoted titles, entrance groups, pieces, year labels and facts fade up 1.5rem as they
  enter the screen, finishing as each is fully in view (CSS view timelines; 竜也 chose "控えめに", then asked for it to
  show as on hiraoku.dev, 2026-10-18). The sticky quoted title follows its section's timeline. No effect with reduced
  motion or without view-timeline support.
- `opening`: the name and then each line of the sentence rise 0.5em into place once on load, 0.12s apart, under a second
  in all. Scrolling past, the opening drifts down 14vh and dims to 0.2 over the first 85vh, so the sections slide over
  it (scroll timeline; 竜也, 2026-10-18: 「クオリティ感を少しだけ」). Both off with reduced motion.
- `between pages`: a cross-document view transition; header and footer stay, the page between them cross-fades
  (0.32s). Links ease into their hover colour and underline (0.2s). The sentence's in-page links scroll smoothly, and
  selected text takes the moss wash. All motion is off with reduced motion (竜也, 2026-10-18: 「全部入れて」).
- `section`: three, one per phrase of the bio: tools, mind, lines. Quote rail (15rem, sticky) and gloss column above
  48rem; baseline-aligned.
- `work`: name (link to its main destination), one line, small links. Reached from the sentence, a moss bar shows in
  the margin and fades.
- `about`: the name in the rail, the hub intro in the gloss column, a link back to the projects; then `facts` in the
  same rail. The hub is called "research hub" (「研究の hub」) everywhere.
- `404`: both languages, each ending in the linked sentence as the way back.
- icons: SVG quote mark on the page ground (dark-aware), ICO at the root, apple-touch-icon on the light ground.

## Checks

`npm run eval` runs the four layers in `eval/` (broken things, discipline, measured details, fresh-eye review).
Findings and decisions are kept in `eval/ledger.md`.
