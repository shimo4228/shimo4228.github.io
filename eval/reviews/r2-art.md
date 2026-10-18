# r2 art-direction review

Lens: does each direction have one clear, memorable idea that belongs to this person (not a template, not
the "AI-generated site" look), and is it carried through with conviction and restraint? Does it look
finished in light and dark, at 375 and 1280?

Material: `eval/shots/r2/*`, `proto/{a,b,c}/style.css`, `proto/build.mjs`, `proto/tokens.mjs`. Bio and
project one-liners are treated as fixed; every change below leaves their wording alone.

Tags: **fix** = the idea is weakened or something looks unfinished; **note** = worth considering, not
required.

---

## a: "the sentence"

**The one idea.** The bio is the root text. It is set large in a serif, and the sections below are
commentary that quote it. This is the only direction where the idea is visible in the first second at
both widths, and it fits someone who writes about authorship: the page treats his own sentence as the
thing worth glossing.

**Strong.** It holds back. The serif appears only in the root sentence and the quoted phrases; moss shows
up only in the dotted links and the rail quotes; there are no boxes, cards or icons. The left-rail
quote with the gloss beside it reads like a commentary at 1280. Dark mode is as finished as light: the
neutral carries a green tint, so moss belongs to the page and doesn't look pasted on. On a phone the
sentence holds at 7 lines and the quoted headings still read as quotations.

**Where it loses conviction.**

- **fix: the third section breaks the device.** The first two sections quote their phrase ("Building AI
  agents", "Watching the mind through meditation"). The third is titled "Where the two meet", which is
  a Claude-written label, not a quotation, yet the bio links "judgment, authorship, and human attention"
  to it (`#meet`). The one place the commentary is supposed to answer the sentence's second half is the
  one place it stops quoting. Change: title the section `<q>judgment, authorship, and human
  attention</q>` (the bio phrase, verbatim) through `sectionTitle(c.meeting.id, c.bioParts.questions,
  true)` in `pageA`. "Where the two meet" can survive as the muted intro line if the author wants it.
  (Which projects belong under that phrase is a content question, see the note below.)
- **fix: the entrance grid leaves an orphan at desktop.** At 1280 the four entrance groups wrap 3 + 1,
  so "Notes as they happen / X" sits alone on a second row under a lot of white space. In a page built
  on one composed sentence, this is the one place that looks unfinished. Change: in `a/style.css`, at
  `min-width: 48rem`, give `.entrance-groups` `grid-template-columns: repeat(4, auto)` with
  `justify-content: space-between` (46rem is wide enough for "Hugging Face datasets"). Alternative:
  let the X group take the free fourth slot beside "Code and records".
- **fix: the name floats as a sans label.** "Tatsuya Shimomoto" is 600-weight system sans at body size,
  sitting above a 50px serif sentence. It reads like a form label, not like the author of the root
  text, and it's the one element in the intro that doesn't belong to either register. Change: either
  set the name in the serif (`font-family: var(--serif)`, `--step-1`, weight 400, the only weight
  loaded) so it belongs with the sentence, or keep it sans but drop it to `--color-muted` at `--step-n1`
  with letter-spacing `0.02em`, so it clearly reads as attribution. Don't leave it between the two.
- **note: the dotted underline can look like a spell-check mark.** Dotted underlines on 50px serif text
  can read as editor squiggles or `<abbr>`. The 0.07em thickness is right. At display size, try
  `text-decoration-style: dotted` with `text-underline-offset: 0.24em` and `--color-accent` (not
  `accent-line`) at ~60% opacity, so the dots read as deliberate in-page links. Look at it on the
  375-light shot, where the dots get very close to the descenders.
- **note: the commentary could look more like commentary.** Hang the opening quotation mark in the
  rail quotes (`hanging-punctuation: first` with a `text-indent: -0.4em` fallback) so the quote's text
  aligns with the root sentence's left edge, the way a printed commentary sets lemmata. This is small
  and in keeping with the idea.
- **note: what a section quotes should match what it holds.** The bio sends "judgment, authorship, and
  human attention" to the meeting section, but AAP (judgment) and Attention, Not Self (human attention)
  are in the other two sections. Once the third section quotes the phrase (fix above), a reader will
  expect its content to answer it. This is for the author (PRODUCT.md already flags the mapping as a
  draft); just note that this direction makes the mismatch visible.

---

## b: "two paths"

**The one idea.** Each practice is a coloured line, cobalt for agents and ochre for meditation. The
right line turns and joins the left where the two meet. It is a picture of a life with two practices
that converge, which is specific to this person. The note "colour lives only in the lines" is the right
restraint.

**Where it goes generic.** Everything except the lines. A large grotesk name, a system-sans bio, and
grotesk headings on every work name make up the standard SaaS/docs landing-page kit, so the
lines end up decorating a template rather than carrying the page. The idea only exists from y≈620 on
desktop, and on a phone it disappears completely.

- **fix: the join reads as a card corner, not a path turning.** At 1280 the ochre line comes down,
  turns at one radius, runs left, and stops in a hard T against cobalt (crop: left edge at y≈1283).
  With the cobalt line on its left, the agents column now looks like a rounded box. A path that joins
  another path bends twice. Change: give the horizontal run a second quarter-turn into the vertical at
  the left end, so ochre bends down and continues beside cobalt as the second stripe of `.meeting`.
  Concretely, split `.merge-right` into the existing right elbow plus a left elbow element with
  `border-start-start-radius: var(--space-xl)` and a top + start border in `--color-mind-line`. Offset
  that element by `--line-path` so it lands exactly on the second stripe of `.meeting`'s background.
  The two-tone stripe then reads as the ochre line continuing, which is the story.
- **fix: the idea vanishes on a phone.** Below 52rem `.merge` is `display: none`, and the three
  sections become three separate left-bordered blocks with gaps between them. That is a stock callout
  pattern, and the meeting's two-tone stripe looks like a rendering glitch with no visible origin.
  Change: on narrow screens, run both lines as parallel rails down the left edge through all three
  sections. Cobalt is the outer rail and ochre the inner. Each rail is full-strength in its own section
  and drops to `--color-line` (or 35% opacity) in the other, and both are full-strength in the meeting.
  No gaps between sections (`row-gap: 0`, keep spacing as padding inside). One CSS
  background-gradient stack on `.paths`/`.meeting` does it. This way the phone still says "two lines,
  then together".
- **fix: the two colours aren't equal partners in either theme.** In light, cobalt-line (ratio 3) is a
  pale periwinkle next to a saturated ochre, so the meditation line dominates. In dark it flips: cobalt
  is vivid, ochre is a muddy brown. A two-path idea needs the two lines to carry equal weight. Change:
  in `tokens.mjs`, keep both line tokens at the same contrast ratio but bring their chroma closer
  together. Either darken the cobalt light key toward `#2546a8` and raise `agents-line` to ~3.4, or
  check both `*-line` pairs in OKLCH and match their L and C to within ~0.03. Then re-check the dark
  shot so ochre reads as ochre (try `keyDark: '#e8a640'` and a `mind-line` ratio of ~3.6 on dark).
- **fix: the lines start nowhere.** Nothing above the paths says which colour is which. A reader meets
  a blue rule and an orange rule with no key. The bio already names both practices, so use it as the
  key. Change: wrap the two bio clauses (text unchanged, as `a` does through `c.bioParts`) in spans
  with a 2px underline in `--color-agents-line` and `--color-mind-line`, linked to `#agents`/`#mind`.
  The lines then start in the sentence. This also gives the hero something of its own.
- **fix: too much display type.** Schibsted Grotesk 600 is on the name, the three section titles and
  all seven work names at `--step-1`. With that many bold headings, the lines stop being the loudest
  thing. Change: reserve the display face for the name and the three section titles. Set `.work-name`
  in system sans 600 at `--step-0` (as in `a`/`c`). Keep `.entrance` in system sans as well.
- **note: dead air under the left heading.** `min-block-size: 2lh` aligns the first works but leaves a
  visible gap under "Building AI agents" at 1280. Consider bottom-aligning both titles
  (`display: flex; align-items: end`) so the gap sits above the shorter title, where it reads as
  margin rather than a hole.
- **note: the empty ochre stretch.** At 1280 the right column ends at y≈1050 but its line runs on
  about 230px to the turn, because the turn is set by the longer left column. That is honest
  (the paths run for different lengths), but if it reads as empty, start the turn right after the
  shorter column ends and let the horizontal run cross under the cobalt column's end.

---

## c: "the question map"

**The one idea.** A small diagram leads from the two practices to three questions, and each question
links to the project that carries it. It is the most informative of the three: it says what he actually
asks, not just what he does. Keeping mono inside the map only is the right restraint.

**Where it goes generic.** The hero (sans name, sans bio, entrance grid) is the same as b's without the
display face, so the first screen has nothing of its own. The map itself (rounded pills, outlined boxes,
mono labels, bezier connectors) is the look of a mermaid/flowchart render, which is close to the
"AI-generated site" look. The questions are the idea, but they get the dimmer styling.

- **fix: the phone map is tangled.** In the 375 shot the agents edges loop out of the top pill into
  S-curves to the left of Q1 and Q2. The mind edges rise from the bottom pill, cross the right side of
  Q3, and hook into Q2. It looks like a layout bug. Change `diagramNarrow`: draw two straight vertical
  rails, agents at x≈24 and mind at x≈336. Each rail leaves its pill with one rounded elbow
  (`r≈12`) and gets short horizontal stubs (with matching elbows) into the questions it reaches: Q1 and
  Q2 from agents, Q2 and Q3 from mind. Nothing crosses a box. Q2 then visibly takes a line from both
  sides, which is the point of the map.
- **fix: the hierarchy is inverted, especially in dark.** The practice pills have a full-text stroke;
  the question boxes have `accent-line` (ratio 2.6). In dark the questions sit in thin brown outlines
  under bright white pills. The questions are what the map exists to show. Change: give
  `.node--question rect` `fill: var(--color-accent-wash)` and stroke `--color-accent`. Drop the
  practice pills to `stroke: var(--color-line-strong)` with no fill change. Optionally set the question
  text in `--color-text` and the practice text in `--color-muted`.
- **fix: make it look less like a flowchart tool.** Reduce the chrome: remove the outlines from the
  practice nodes and set them as plain mono text with the edges leaving from beneath them. Keep a
  single treatment (the wash from the fix above) only on the questions. Use one stroke weight for
  everything (currently 2 for edges, 1.5 for rects). This keeps the map drawn and deliberate, and makes
  the questions the only "objects" on it.
- **fix: the questions are lost after the map.** The hollow amber squares before AAP, Attention, Not
  Self and Authorship Strategy are supposed to echo the question boxes, but nothing says so, and below
  the map the reader can't tell which question a project carries. Change: under each marked work's
  name, add its question as a one-line eyebrow in `--color-accent`, system sans, `--step-n1` (not mono:
  mono stays in the map). Then drop the square, or keep it only as the eyebrow's leading mark. The
  index then repeats the map's edges in words.
- **fix: the idea is below the fold.** At 1280×800 the map starts at about y≈690, so only the tops of
  the pills show. At 375 it is a full screen down, behind the entrance list. Change: on desktop, place
  the map directly under the bio and move the entrance groups below it, or into a single compact row
  under the map. On a phone, keep the entrances first, which is the job, but tighten them into two
  columns (`grid-template-columns: 1fr 1fr` below 44rem) so the map reaches the second screen.
- **note: the section headings repeat the map.** The map's top nodes say "Building AI agents" and
  "Watching the mind through meditation", and the headings directly below say the same. Since the nodes
  already link to those sections, consider dropping the visible `h2` text to a smaller muted label (keep
  the heading for structure) so the page doesn't read as two renderings of one outline.
- **note: the questions are Claude-written.** "Who answers when an agent fails?", "Does the origin
  travel with the idea?" and "What is attending, if not a self?" are the most visible words in this
  direction, and they are drafts (`mapData` comment). This direction depends on them more than a or b
  depend on their section titles, so get the author's read on them before judging the direction.

---

## Across all three (notes)

- **note:** The entrance block is the same component in all three directions and carries none of
  their ideas. That's fine for a fair comparison, but each direction could give it a small amount of its
  own treatment (a: the serif for the platform names; b: no colour, by its own rule; c: nothing), so
  that it doesn't read as a shared template strip.
- **note:** All three are finished in dark at the token level (Leonardo pairs, explicit
  `color-scheme`, matching `theme-color`). The one place dark mode falls short is accent balance in b and c, covered
  above.
