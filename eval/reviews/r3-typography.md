# r3 typography review (built site, `dist/`)

Reviewer: senior typographer, fresh eyes. I read DESIGN.md, `site/site.css`, `site/build.mjs` and the generated pages,
and looked at `eval/shots/site/`. I measured in Chromium 141 (Playwright) at 320, 360, 375, 390, 414, 430, 480–600,
767/768, 900, 1024, 1280 and 1440. Line breaks quoted below are what the browser set: `/` is a line break and `·` is a
no-break space. Each fix was checked by injecting the CSS, or by rewriting the DOM in the same way the build change
would, and measuring again. No bio text or project line is reworded.

**Font caveat.** The sandbox has no Hiragino, Yu or Noto Serif JP fonts. Measured with CDP `getPlatformFontsForNode`:
- Latin body and headings: Inter, because `system-ui` resolves to it here.
- Display: Newsreader.
- Japanese body and display: **WenQuanYi Zen Hei**, a Chinese gothic. The installed `Noto Sans CJK JP` doesn't match the
  stack's `"Noto Sans JP"`, and no Mincho is installed, so the Japanese display text (sentence, titles, About leads)
  renders as gothic here, not Mincho.
- Japanese glyph widths are full-width 1em in both fonts, so the line-break and hang measurements carry over. Judgments
  about colour, weight and the Mincho/Newsreader mix don't.

Tags: **fix** = change before launch. **note** = judgment call or minor.

---

## Japanese (組版)

### 1. 禁則 violations: lines start with ー and small kana — **fix**
- Pages: `/ja/` (`.work-line`, `.section-intro`) and `/ja/about/` (`.lead`). Seen at every width; 22 cases across the
  widths measured. Examples:
  - 375: `直し続ける 6·フ / ェーズのループ。` and `同じ人間レビュ / ーで改訂され…`
  - 1280: `働いているハ / ーネスの公開版です。` and `人間のレビ / ューで通す…`
  - 768/1024: `明示的なフ / ァイルとして…`
  - `/ja/about/` 375: `エージ / ェントに渡す…`; at 414 and 600: `一人で作 / っています。`
- Cause: Chromium's `line-break: auto` treats ー and small kana (UAX #14 class CJ) as allowed at line start. The 1280
  case splits ハーネス, the word the whole site is about.
- Fix (site.css): `:lang(ja) { line-break: strict; }`
- Checked: 0 violations left at all widths on both JA pages. The lines become, for example, `直し続ける / 6·フェーズのループ。`
  and `働いている / ハーネスの…`. No overflow.

### 2. 「」 hang leaves the words 0.1em inside the edge — **fix**
- Page: `/ja/`, `.section-title`, all widths.
- Measured: 「 is 1.00em wide (25.3px at 1280), and `text-indent: -0.9em` puts the first character at edge + 2.5px
  (+2.1px at 375). The wrapped second line (`作る」`, `人の注意」`) sits exactly on the edge, so the two lines of one
  title disagree by 0.1em. The EN `-0.41em` is exact (measured: the "B" is at edge + 0.0).
- Fix: `.section-title:lang(ja):has(> q:first-child) { text-indent: -1em; }`
- Checked: the first character is at edge + 0.0 at 375 and 1280. Chrome's default `text-spacing-trim: normal` keeps
  opening brackets full-width at line start, so 1em is stable.

### 3. JA rail title「AI エージェントを / 作る」leaves a two-character line — **fix**
- Page: `/ja/`, first `.section-title`, at 768 and above (every rail width).
- The title needs about 11.5em and the 15rem rail holds about 9.5em at step-1. Its only phrase break is before 作る, so the
  verb drops alone under a nine-character line. The other two titles are fine.
- Fix: Japanese is denser than Latin at the same size, so cap the JA rail title:
  `@media (min-width: 48rem) { .section-title:lang(ja) { font-size: min(var(--step-1), 1.3rem); } }`
  This is a cap, not a size jump: at 768 step-1 is 22.6px and the cap is 20.8px.
- Checked at 768, 900, 1024, 1280 and 1440: the title sets on one line, and `判断、著者性、 / 人の注意` still breaks on
  the 、, the right place. Rail and gloss baselines stay equal (1079.9 / 1079.9 at 1280).

### 4. JA sentence: the third sentence breaks into three lines on phones — **fix**
- Page: `/ja/`, `.sentence`, 320–390 (414 and wider are fine).
- At 375 it sets `AI·の時代の判断、 / 著者性、 / 人の注意を探る。`, with `著者性、` alone. The CSS comment ("one line on a
  phone") isn't true for this sentence anyway. The real target is two lines, and it misses by about 1px: the 12-character
  `著者性、人の注意を探る。` needs 325px with `letter-spacing: 0.02em`, and the line is 324px.
- Fix: `.sentence:lang(ja) { font-size: min(var(--step-3), 6.9vw); }` (was 7.1vw), and correct the comment.
  `letter-spacing: 0` works too.
- Checked: two lines at 360, 375 and 390: `AI·の時代の判断、 / 著者性、人の注意を探る。`. From 414 up it is unchanged
  (`…判断、著者性、 / 人の注意を探る。`). 320 is still three lines, but that is below the design minimum of 360.

### 5. About leads (display face) break mid-word — **fix**
- Page: `/ja/about/`, `.lead`, all widths. At 1280: `ラボに / も組織に…` and `説明責任を考え / ている人`. The
  leads are display text, the same role as the sentence (DESIGN rule 1), and the build already puts BudouX `<wbr>` in
  them, but `keep-all` isn't applied, so the `<wbr>`s do nothing.
- The same goes for `.fact dd`. At 1280, `引用してくださ / い。` leaves a one-character last line under a solid underline.
- Fix: add them to the existing rule:
  `:lang(ja) :is(.sentence, h1, h2, h3, .entrance-group dt, .lead, .fact dd) { word-break: keep-all; overflow-wrap: anywhere; }`
- Checked: 1280 sets `…ラボにも組織にも属さず、AI·エージェントを / 一人で作っています。…`, and the dd sets
  `各プロジェクトは concept·DOI·で / 引用してください。一覧は hub·にあります。`. No overflow at 320 or 360.
- Leave work lines and intros in ベタ組み (break anywhere). I tried `keep-all` there: it fixes the short last lines but
  gives a heavy rag in the 17–20 character phone measure (`心の地図（アビダルマ）で` alone on a line).

### 6. Spaces between Latin words can break inside a name in Japanese text — **fix**
- Pages: `/ja/` (320: `を聞く Claude / Code·の hook·です。`) and `/ja/about/` (360: `そのひとつは M1 / Mac·上の…`, once
  item 5 is applied).
- `tieMixed` only ties spaces that touch CJK. A space between two Latin words ("Claude Code", "M1 Mac", "concept DOI",
  "Agent Knowledge Cycle") is still a break opportunity. In Japanese text a Latin name is one unit.
- Related: a space that comes right after an inserted `<wbr>` (`切り出した<wbr> Claude`, `の<wbr> hook`) is also missed,
  because the lookbehind sees `>`, not CJK. It only breaks at phrase boundaries, so this part is harmless.
- Fix (build.mjs, Japanese branch of `txt`, and the linked-phrase path): after `tieMixed`, apply
  `.replace(/(?<=[A-Za-z0-9.]) (?=[A-Za-z0-9])/g, '&nbsp;')`.
- Checked by rewriting the DOM text nodes: no Latin name splits at 320–414. The longest run (`Contemplative·Agent・AKC・AAP·は`)
  fits at 360, and scrollWidth equals the viewport at 320 and 360.

### 7. 404: the Japanese half isn't set as Japanese — **fix**
- Page: `/404.html`, all widths.
  - (a) `.lost h1` gets the display face at step-3, but the Japanese heading is an `h2`. 「ページがありません」 renders at
    body size in the body face, under a 40px serif "Nothing here".
  - (b) The Japanese tokens are emitted on `:root:lang(ja)`, so the `<section lang="ja">` keeps the EN font stacks and
    leading 1.6, not 1.85.
- Fix: `.lost :is(h1, h2) { font-family: var(--font-display); font-size: var(--step-3); }`, and in `site/tokens.mjs`
  emit the Japanese block on `:lang(ja)` instead of `:root:lang(ja)`. Custom properties inherit, so this covers both the
  whole page and the island.
- Checked (a) by injection. (b) follows from the selector and wasn't separately measured.

---

## Both languages

### 8. `hanging-punctuation: first` on `html` will double-hang the quoted titles in Safari — **fix** (unverified, no WebKit here)
- `html { hanging-punctuation: first last; }` sets the property everywhere, and `.section-title` also hangs the mark
  with a negative `text-indent`. Chromium ignores the property, so these measurements can't show the problem. In Safari,
  which supports `first`, the opening “ / 「 would hang once from the property and once from the indent. The words would
  then sit 0.41em (EN) or 1em (JA) left of the column edge, the opposite of rule 4.
- Fix: keep one mechanism. `.section-title { hanging-punctuation: none; }` keeps the indent, which works in every engine.
  Optionally keep `last` site-wide.
- Check on Safari / iOS before launch.

### 9. EN sentence: "of AI." alone on the last line at about 900px — **fix**
- Page: `/`, `.sentence`, roughly 860–960. It sets `…and human attention in the·age / of·AI.`, because the current ties
  (`the age` and `of AI`) leave a break between "age" and "of".
- Fix (build.mjs): tie the whole phrase: replace `'the&nbsp;age of&nbsp;AI.'` with `'the&nbsp;age&nbsp;of&nbsp;AI.'`.
  The text is unchanged.
- Checked at 320–1440: the last line is always `the·age·of·AI.` (preceded by `and human attention in` at 900, 1024 and
  1280, and by `… in` at 375). The worst line elsewhere is still `human attention` at 320, which is below the design
  minimum.

### 10. Entrances: "Hugging Face / データセット" wraps just above the 2-column switch — **note**
- Page: `/ja/`, `.entrance-group dd`, 480–530. Each group is about 200px wide there, and only this item wraps. EN is fine.
- Option: move the 2×2 switch from 30rem to 34rem (checked: nothing wraps at 540).

### 11. JA short last lines in body text — **note**
- Pages: `/ja/` `.work-line` and `.section-intro`. 2–3 character last lines (`です。`, `ント。`, `せる。`) appear at most
  widths. Chromium's `text-wrap: pretty` doesn't avoid them for CJK. In ベタ組み this is tolerated, so I would leave it
  rather than switch the body to phrase-wrapping (see item 5).

### 12. CJK in 600-weight headings — **note**
- `.work-name` is 600 with `font-synthesis: none`. Here, WenQuanYi has no bold, so in `AI の文章は、なぜ…` "AI" is
  semibold and the kana are regular. Hiragino Sans (W6), Yu Gothic UI and Noto Sans CJK have the weight, so this is
  probably sandbox-only. To be safe, add `"Noto Sans CJK JP"` (the name Android and Linux actually install) to the JA body
  stack, and `"Noto Serif CJK JP"` to the JA display stack, so Android gets a Japanese Mincho rather than the generic serif.

### 13. Full-width brackets around Latin — **note**
- `Zenodo（DOI）`, `Constitution（憲法）`, `Tatsuya Shimomoto（shimo4228）`. A full-width （ after Latin opens a half-em
  gap, and on the solid-underlined link the underline runs past ） into empty space. The convention is defensible. If the
  gap bothers you, `font-feature-settings: "halt"` on these spans, or half-width parens for the all-Latin `(DOI)`, would
  tighten it.

### 14. Measured and fine
- Rail/gloss baselines are equal in every section at 768, 1024 and 1280, in both languages, and the About `.fact`
  dt/dd baselines match.
- The EN quote hang is exact.
- No size changes across 767 → 768.
- Name, sentence and entrances share the left edge exactly.
- JA gloss measure is about 24 characters at 1280 with leading 1.85. Good.
