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
Live check 2 (竜也, 2026-10-18): JA running paragraphs break anywhere kinsoku allows (keep-all only on headings, the sentence, names, labels), and only Latin–Japanese spaces are tied, so About lines fill the measure instead of going ragged.

- 2026-10-18 JA third sentence: break after 「著者性、」 so lines follow the section split (判断・責任・著者性 | 人の注意). Sentence parts take optional `open: keep|tail` / `close` groups: `keep` is inline-block (moves whole to the next line on phones), `tail` is a block. Measured: 320/375 → 「AI の時代の／判断、責任、著者性、／人の注意を探る。」; 768/1000/1280 → 「AI の時代の判断、責任、著者性、／人の注意を探る。」. No overflow; eval 0 failing.

- 2026-10-18 phone/PC detail loop (竜也: Japanese looked much smaller than English on PC).
  - Measured first: the Japanese line 「AI の時代の判断、責任、著者性、」 already fills the 46rem column at 45px, so the
    Japanese cannot grow on PC without losing the break after 著者性. Balanced from the English side instead:
    English sentence 60→52px on PC, 35.7→30px on a 375 phone (clamp(1.625rem, 0.75rem + 4.8vw, 3.25rem)); ratio to
    the Japanese is about 1.15 on PC and 1.13 on phones. Japanese phone cap 6.9vw→7.1vw (25.9→26.6px at 375).
  - English phrasing: `phrasing` in site.en.json, "|" = allowed break, "[ ]" = keep group. Lines now, 768–1280:
    Building AI agents, / and watching the mind / through meditation. / Exploring judgment, / accountability,
    authorship, / and human attention / in the age of AI. Phones (320, 375) split accountability, / authorship,.
    Before: "Building AI agents, and / watching the mind through / meditation." and "human attention in / the age of AI."
  - Japanese display face: Shippori Mincho 400 after Hiragino Mincho in the stack, subset at build to the display
    roles' characters (83 chars, 17.7 KB, unicode-range so EN pages never fetch it). Fixes Android, where there is no
    system Mincho and the sentence fell back to a Gothic face; Apple devices keep Hiragino and download nothing.
  - eval 0 failing / 7 raw-px warnings; no overflow at 320–1280.
  - Share images now render the sentence from the built page markup (same lines and groups). JA OG no longer leaves 「探る。」 alone on the last line; EN OG 60→50px, 6 lines by phrase.

- 2026-10-18 Hiragino check from Claude's side (竜也: スクリーンショットは Claude で確認できるように).
  `npm run preview -- <dir>` writes a file:// copy of dist/ (light/, dark/ with the dark scheme forced) and
  `view.html?p=ja/&t=light&w=375,1000&y=0&h=720&z=1`, which lays the widths side by side in one window. The copy goes
  to the author's Mac (`MyAI_Lab/personal-site-preview/`), Chrome opens it, and Claude reads a screenshot of the window
  (read-only access, no clicks). Japanese is then judged in Hiragino, as the author sees it.
- 2026-10-18 detail pass in Hiragino (Chrome, macOS), 320/375/1000, light and dark, all pages.
  - JA titles with a 、 turned over at the last phrase that fit: 「AI に頼みたいことが尽きた／あと、ひとつだけ残った欲望」
    at 375 and 1000. Each 、 clause is now an inline-block, so the line turns after 、: 「…尽きたあと、／ひとつだけ残った欲望」;
    at 320 「AI の文章は、／なぜ宙に浮いて感じるのか」. The 、 sits outside the underline, as in the root sentence, so a
    line ending on it shows no underlined blank half.
  - 「Zenodo（DOI）」 link labels: the underline ran on under the closing bracket's empty half. `halt` on JA work links
    sets the brackets half-width; the underline now ends at the bracket.
  - Seen and left as decided: JA running paragraphs break inside words (live check 2); "Tatsuya Shimomoto" may split
    in JA running text (the tie rule ties only Latin–Japanese spaces).
  - eval 0 failing / 7 raw-px warnings.
- 2026-10-18 Google Search Console (竜也): URL-prefix property `https://shimo4228.github.io/` (covers the hub under
  `/shimo4228/` too). Verified by the HTML file `googleb056734478b4d8a5.html` at the root, written by build.mjs; byte-identical
  to the file Google issued. Do not remove it.
- 2026-10-18 Writing page and wide screens (竜也: 「他のプラットフォームへのリンクは別のページに逃がした方が良くない？」
  「PC画面の時真ん中の方しか使ってない」; research report best-practices-2026-10).
  - `/writing/` and `/ja/writing/` list zenn-content's publications (date, title, platform), by year. The platform
    entrances moved there; code, records and X moved to the footer. The home page is the sentence and the works.
  - Full width was not used for text: the column keeps its measure. From 80rem the links of each work hang in the
    right margin and the page shifts left by half the note.
  - Scroll-in fade, CSS only, off with reduced motion and in Firefox.
  - Body face stays the system stack (Hiragino on Apple) after a side-by-side with Noto Sans JP (竜也: 「まあふぉんとはこれでいいか」).
  - Deploy: `.github/workflows/deploy.yml` (push / repository_dispatch / daily 09:17 JST / manual) replaces copying
    dist to `main` once Pages' source is GitHub Actions and `source` is the default branch.
- 2026-10-18 Japanese text in Mincho (竜也: 「プロジェクト名だけゴシックで他は明朝でいいんじゃないの？」). JA body stack is
  Hiragino Mincho / Yu Mincho / Noto Serif JP (system fonts, nothing downloaded); work names keep the Gothic `ui` stack;
  JA leading 1.85 → 1.9. Writing rows above 48rem put the platform under the title so titles get the full width.
  Writing rows above 48rem: the date sits in the rail under the year, the title takes the gloss column (竜也: 「左側妙に空いているのバランス悪くない？」).
  Project names too in Mincho bold (竜也: 「プロジェクト名も明朝の太字にしたら？」); the Gothic ui stack is gone.
  JA work names one half-step larger (between step-0 and step-1) so they stand out by size in an all-Mincho page (竜也: 「メリハリがないのかな？」).
- 2026-10-18 Review round 1 (designer persona) and the author's catches:
  - Overlap (竜也: 「なんか線が被ってるよ」): a JA title clause that itself wraps sat on its last line's baseline and rose
    into the row above. Clauses now `vertical-align: top`.
  - JA display lines (sentence, quoted titles, work names, 404) get `palt` + 0.04em; the sentence's Latin–Japanese gap
    is a quarter em; `text-autospace: normal` on JA. Quote hang −1em → −0.5em (palt halves the 「).
  - JA work names capped at 1.2rem (below the 1.3rem quote) with 0.2em under them.
  - Rail name on About / Writing at step-1 on one line; the Writing title in the display face at step-1.
  - Writing page platform groups on the rail / gloss axes from 48rem.
  - About ends in two links (projects, writing) since the platforms moved.
  - Nav: tighter gaps below 24rem so four items fit at 320px.
  - Sentence bottom margin only from 48rem (phones had a doubled gap).
  - Section intros in text colour; muted stays for metadata.
  - `halt` on JA footer links, platform names and entrance notes.
  - Footer links get a 24px minimum target (X was 10px wide). Eval: axe runs with animations off; nav items are
    exempt from the left-edge check (flush right).
- 2026-10-18 Review round 1 (engineer persona):
  - Margin notes are a grid column running into the margin (no absolute positioning), so they take space; the page
    shifts left only on pages that have notes (`:has`).
  - sync.mjs: 15 s timeout, schema check, refuses a list that shrinks by over 20%; in CI a failed fetch fails the
    run so the last good deploy stays. The dispatch carries the zenn-content sha (FEED_REF) past the raw CDN cache.
  - Workflow: Pages permissions on the deploy job only, 10-minute timeouts, Playwright browser cache.
  - Cloudflare beacon as a classic `defer` script (its own snippet), not a module.
  - Shippori subset includes 「」『』 (they come from `<q>`, not page text).
  - JA bold names may be synthesised where the serif has no bold (Android); forced-colors target bar uses Highlight;
    a section with no intro no longer spans an empty row; shoot.mjs disables animations.
- 2026-10-18 English body in Charter (竜也: 「じゃあそろえて」), leading 1.55, names at 700. Last-word ties are a nowrap
  span: Charter has no no-break space, so `&nbsp;` showed as a double space.
- 2026-10-18 Review round 2 (designer):
  - JA sentence word-spacing −0.15em → −0.05em (the Latin–kana gap read pinched).
  - Title clauses also split at 。 and before dashes; spaces inside Latin runs are tied.
  - Ratios: accent 6.2 → 8, muted 5.6 → 6.5; JA step-n1 raised (Mincho W3 at 14px read faint).
  - About name is a muted byline on phones, the rail from 48rem (nowrap only there: text zoom at 320px).
  - Margin-note links sit on the work name's baseline.
  - Not done: one Latin–kana gap width everywhere (`&nbsp;` from source spaces vs autospace's 1/8em). Left as is.
- 2026-10-18 Review round 2 (engineer):
  - Blocker fixed: sync.mjs rejected the real feed (pieces in one language only). Each side present needs url and
    title; FEED_REF must be a sha or `main`.
  - Every `.center` shifts at 80rem again, so the nav no longer jumps between pages (the round-1 `:has` caused it).
  - `writing-title` added to DISPLAY_ROLES, so 書 and た are in the Shippori subset.
  - Writing page at 80rem: the platform is a third grid column on the title's baseline; hairlines stay under the column.
  - JA work names: no tracking (most are Latin).
- 2026-10-18 Opening motion (竜也: パララックスとフェードインで「クオリティ感を少しだけ」): name and sentence lines rise in
  on load, staggered; a scroll-timeline parallax drifts and dims the opening as the page scrolls. Reduced motion: none.
