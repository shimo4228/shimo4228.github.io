# r3 art-direction review: the real pages

Lens: does the one idea hold all the way through the finished site, in both languages and both themes, at
375 and 1280: the bio as root text, sections that open by quoting it, dotted links for "stays", solid for
"leaves"? The direction is fixed. Every change below stays inside it and leaves the bio and the project
one-liners alone.

Material: `eval/shots/site/*`, `dist/` (all five pages, og, icons), `site/site.css`. I also took arrival
shots myself: I clicked each sentence link and captured the result at +0.9s and +3.4s, 375/1280, EN/JA.

Tags: **fix** = the idea weakens here, or this part looks unfinished; **note** = worth doing, not required.

---

## What already works

The home page carries the idea with conviction. The sentence is the only large thing. The rail quotes in
moss read as lemmata, and the opening mark hangs correctly in both scripts (“ at −0.41em, 「 at −0.9em). The
serif appears only where DESIGN.md allows it. Dark mode is as finished as light: the green-tinted neutral
makes moss belong to the page. The EN share image breaks the bio into two clauses per line, which is
better than the page itself does. The JA share image shows three lines, which is what the JA page promises.
That makes the JA home the place where the page falls behind its own artwork (see 2).

---

## 1. The moment of arrival

- **fix: when you arrive at a work, its lemma is off screen.** Click “judgment” at 1280 and the page lands
  on AAP. The rail quote “judgment, authorship, and human attention” is above the viewport (shot at
  scrollY 2833). The reader sees a grey box and no quotation. The device is missing at the one moment
  it was meant to answer. Change: at `min-width: 48rem`, make the rail title sticky.
  `.gloss > .section-title { position: sticky; inset-block-start: var(--space-l); align-self: start; }`
  If `align-self: start` breaks the baseline alignment with the intro, add `margin-block-start` equal to
  the step-1/step-0 cap-height difference. The lemma then stays beside every work in its section, the way
  a commentary repeats the lemma in the running head. On phones, the scroll-margin is enough.
- **fix: the flash reads as a hovered card, not as commentary.** The `arrive` animation fills a rounded
  block in `accent-wash` and adds a `--space-xs` box-shadow spread. At its peak it is a grey-green card
  14px wider than the column (en-aap-1280, ja-attention-not-self-1280). Nothing else on the site is a box.
  Change: drop the background and box-shadow, and flash a moss rule in the margin instead.
  `.work:target { box-shadow: calc(-1 * var(--space-s)) 0 0 0 var(--color-accent-line) }` → transparent,
  or a `::before` 2px bar at `inset-inline-start: calc(-1 * var(--space-s))` that fades over 1.8s. Moss
  stays a mark (DESIGN rule 2), and the arrival points to the line, not a tile.
- **fix: two of the five phrases arrive in silence.** “Building AI agents” and “watching the mind through
  meditation” jump to `#tools` / `#mind`, and nothing marks the landing. The three theme words flash. The
  sentence's links should behave as one system. Change: `.gloss:target > .section-title q` gets the same
  one-shot `arrive` treatment as the margin mark above, or a moss `text-decoration` under the quoted words
  that fades out. The phrase you clicked then lights up as its own quotation. This is the single most
  "commentary" moment the site can have.
- **note: no way back to the root text.** A commentary's lemma points back to the line. Consider making
  each rail `<q>` a dotted link (it stays on the page) to `#name`. The dotted style already tells the
  reader it stays, so it needs no icon or "back to top".
- **note: what "human attention" lands on.** In both languages the bio word “human attention / 人の注意”
  jumps up into the meditation section, and the quotation that names it sits directly below the landing
  (ja-attention-not-self-1280). The page itself now makes the mismatch visible. R-a1 was declined for good
  content reasons. This is for the author's read-through, not a design change.

## 2. Japanese

- **fix: the sentence isn't three lines.** DESIGN.md and the JA share image both set three short lines.
  The page sets 4 lines at 1280 (“AI の時代の判断、著者性、／人の注意を探る。”) and 5 at 375 (“…判断、／著者性、／人の注意を探る。”).
  The CSS comment ("each sentence is one line on a phone too") holds only for the first two sentences.
  Change, in two parts. (a) Desktop: raise `.sentence:lang(ja)` `max-inline-size` from 16em to 21em. Line 3
  is about 20 em, so it then holds at 1280 (the OG already fits it at a similar size). (b) Phone: where a
  line must turn over, make the turn read as a continuation, not a new line. Emit each of the three lines
  as `<span class="line">` (`display: block; padding-inline-start: 1em; text-indent: -1em`) in place of the
  `<br>`s. The turnover then indents under the first character, as verse turnovers do. You can still count
  three lines.
- **fix: the first rail quote breaks off two characters.** At 1280, “「AI エージェントを／作る」” leaves “作る」”
  alone on line 2. In a 15rem rail at step-1 that is the longest JA lemma, and it is the first one a
  reader meets. Change: give JA its own rail, `:lang(ja) { --rail: 17rem }`. That is a layout value, so
  rule 7 still holds. Or confirm BudouX gives no break inside “AIエージェントを作る” and accept
  “「AI エージェントを作る」” on one line by letting the title overflow into the gap (`white-space: nowrap`
  for lemmata under 13 characters).
- **fix: body Japanese breaks inside words.** The gloss column breaks “空疎／で”, “アビ／ダルマ”, “エッ／セイ” and
  “ハ／ーネス” (ja-1280). Every other line on the site is set with care, so this is where JA looks unfinished.
  Change: run BudouX on `.section-intro`, `.work-line` and `.work-name` in JA (this adds `<wbr>` only, so
  the strings stay verbatim). Extend the `:lang(ja)` `word-break: keep-all; overflow-wrap: anywhere` rule
  to those three classes. That also fixes rule 8's "headings" for h3.
- **fix: an English value on the JA About page.** “Unaffiliated by design” sits under 所属 on /ja/about/. It is
  the only untranslated string on the JA side. Change: add a JA value in `site.ja.json`, marked `draft` for
  the author (for example 「意図して無所属」).
- **note: the Latin and kana spacing is hand-set.** `AI&nbsp;エージェント`, `AI&nbsp;の時代` use a full-width
  NBSP-sized gap that is wider than the quarter-em Japanese typesetting expects. Consider removing the
  spaces and adding `text-autospace: normal` (Safari 18.4+ and Chrome 140+, and harmless elsewhere), or
  narrowing them with `<span class="as">` set to `margin-inline: 0.125em`.
- **note: the name in Japanese.** The JA pages and the JA share image give the name only in Latin. If the
  author uses a kanji form, the name line is where it belongs. Ask him; don't guess.

## 3. About

- **fix: the About page drops the device.** On home every block opens with a quotation. On About there is
  none. The page is the name, then two serif paragraphs that repeat the name (“Tatsuya Shimomoto” / “I’m
  Tatsuya Shimomoto (shimo4228).”), then sans labels. It reads as a generic bio page with a nice font.
  Change: treat About as the gloss on the attribution line. Set the name in the rail as a lemma,
  `<q>Tatsuya Shimomoto</q>` / 「Tatsuya Shimomoto」, in moss, hanging, in the same `.gloss` grid as home.
  Put the two `.lead` paragraphs in the gloss column and the facts below them in the same rail/column
  grid. The page then uses the home page's grammar, the double name stops reading as a stutter, and the
  facts' rail lines up with a rail that already holds something.
- **fix: three links to one URL.** “Cite each project by its concept DOI, listed on the hub.”, “The hub
  carries graph.jsonld and llms.txt.” and the footer's “Machine-readable profile” all go to
  `shimo4228.github.io/shimo4228/`. Each fact link also underlines a whole sentence, so the facts list
  turns into a run of solid underlines (worst at 375: four underlined lines in a row). Change: underline
  only the noun that leaves, “the hub” / 「hub」, and leave the rest of each sentence as plain text. Merge
  “Citing” and “For machines” into one fact, or drop “Machine-readable profile” from the footer on About.
- **note:** “Unaffiliated by design” repeats “no lab and no affiliation” two lines above. One of them can
  go. That is the author's call.

## 4. Header, footer, 404

- **fix: the nav changes between pages.** Home shows `日本語 · About`. About and 404 show
  `Home · 日本語 · About`, so the items move along the right edge between pages, and “Home” sits beside a name
  that already links home. Change: drop “Home” everywhere and make the serif name the home link on every
  non-home page, 404 included (add the `.name` line there). The nav then holds the same two items on every
  page.
- **fix: the footer breaks rule 3 and ends nothing.** The footer links leave the site but have no
  underline. Rule 3 says leaving links are solid, and nav and footer are the only links that are neither.
  The home page also stops on the AAP/Authorship gloss and then shows two grey words in empty space
  (foot crop). Change: give `.site-foot` a top hairline matching `.entrances`
  (`border-block-start: var(--line-thin) solid var(--color-line); padding-block-start: var(--space-m)`).
  The commentary is then bracketed by the same rule that opens it. Give its links the same solid
  `line-strong` underline as `.work-links a`. Nav links can stay plain, since they are site chrome that
  does not leave.
- **fix: the 404 is generic.** It shows “Nothing here”, a sans sentence, “Go to the home page”, a rule,
  and the same again in Japanese. It could be any static site. Within the idea, the way back is the
  sentence itself. Change: under a short serif line (“Nothing here.” / 「ここには何もありません。」, draft),
  set the root sentence at step-3 with its dotted links pointing to `/#tools`, `/#mind`, `/#aap` and so
  on, then the JA sentence (three lines) linking to `/ja/#…`. Drop “The home page lists everything” and
  the two “Go to the home page” links. The bio is the index. The phrases now leave the page, so they
  take a solid underline here. That is honest to rule 3, and it is the one place the reader sees the two
  link kinds as a deliberate system.

## 5. Share images and icons

- **fix: the touch icon uses moss as a field.** `apple-touch-icon.png` and `favicon.svg` are a solid moss
  rounded tile with a white “. On the site moss is never a fill, only a mark (rule 2). The tile is the
  stock "quote app" look. Change: use the page paper (`#f5f5f5` light) as the field and a moss “ as the
  mark, the hanging mark of the rail. Keep it full-bleed in the PNG, since iOS rounds it, and set `rx` 0.
  For the SVG favicon, add an inline `<style>@media (prefers-color-scheme: dark){…}</style>` that switches
  to the dark paper `#1a1e1c` and `keyDark` moss, so the tab icon follows the theme the page follows.
- **note: dots in a picture.** In the OG images the dotted underlines can't be clicked. At timeline size
  (about 500px wide) they turn into grey stipple under the type. Consider dropping them and putting the
  one moss mark in the image as a hanging “ in the left margin before “Building” (and 「 before the JA
  first line). The share card and the icon then carry the same sign.
- **note: per-page share images.** About uses the home OG. That is fine, since the sentence is the
  identity. If one is wanted, an About card with the name set as a quoted lemma (as in 3) would fit,
  but it is not needed for launch.

## 6. Small details at display size

- **note: the dotted underline in light mode is grey.** `accent-line` `#7c9484` at 0.07em reads as grey
  stipple on `#f5f5f5` at 1280 (hero crop), and not clearly as moss. Hover goes solid and moss, which is
  right. Consider `color-mix(in oklch, var(--color-accent) 70%, transparent)` for the resting dots on the
  sentence only, so they read as the commentary colour and not as a spell-check mark.
- **note: the 375 rag.** The EN sentence at 375 runs “mind through” (short), then “meditation. Exploring”
  (full width). `.sentence` gets `text-wrap: pretty` through `p`. Check whether `balance` reads better at
  ≤7 lines. Test both. Don't add manual breaks.
