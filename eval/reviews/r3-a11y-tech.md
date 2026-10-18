# r3 accessibility and launch-tech review: the built site

Reviewer: accessibility and web-platform specialist, fresh eyes. Date: 2026-10-17.
Scope: `dist/` (/, /about/, /ja/, /ja/about/, /404.html, robots.txt, sitemap.xml, icons, OG images), `site/build.mjs`, `site/site.css`, `DESIGN.md`. The hub repo (`shimo4228/shimo4228`, served at `/shimo4228/`) was read to check what the new root does to it.

Method: probe scripts lived in the scratch directory; no project files were changed apart from this report. They used Playwright and Chromium 1194, served by `eval/serve.mjs`.
- WCAG 1.4.12 text-spacing override (line-height 1.5, letter 0.12em, word 0.16em, paragraph 2em) at 320 and 1280 px on all five pages. I swept for overflow and looked at screenshots of the JA pages.
- Text-only zoom, emulated as `html{font-size:200%}`, at 375 and 1280. Page zoom, emulated as a CSS viewport of window ÷ zoom (×1 to ×5) for 375, 1024 and 1280 px windows. In both cases I recorded the rendered font size.
- Forced colours (light and dark), print to A4 PDF (dark scheme on screen), the Chromium ARIA snapshot, a 45-step Tab walk at 375 px, and `reducedMotion: reduce` with `/#aap`.
- Request log and `document.fonts`. CLS with the web font held back 1.5 s.
- Lighthouse 12 (mobile) on / and /ja/. Results: 100 / 100 / 100 / 100. LCP is `p.sentence`, at 1.1–1.2 s on local loopback, and total weight is 49–50 KiB.
- I worked out token contrast from the built `site.css` with the WCAG formula.

Tags: **fix** = do it before launch. **note** = a judgement call, a post-launch item, or fine as it is.

---

## Fix

### F1. The Japanese root sentence does not get bigger when the reader zooms. **fix**
- Page/file: `/ja/` and `/404.html` do not use it; the rule is `site/site.css` → `.sentence:lang(ja) { font-size: min(var(--step-3), 7.1vw) }`.
- Criterion: WCAG 1.4.4 Resize Text (AA).
- Evidence: the size is set in viewport units. On a phone the `7.1vw` term always wins, and browser zoom shrinks the CSS viewport by exactly as much as it magnifies, so the rendered size never changes:

  | window | zoom ×1 | ×2 | ×3 | ×4 | ×5 |
  |---|---|---|---|---|---|
  | 375 px, JA sentence | 26.6 px | 26.7 | 26.6 | 26.7 | 26.6 |
  | 1024 px, JA sentence | 40.7 | 63.9 | 72.6 | 72.7 | 72.8 (stuck at 1.79×) |
  | 375 px, EN sentence (for comparison) | 35.7 | 70.5 | 105.8 | 141 | 176 |

  Text-only zoom fails the same way: a 200% root font size leaves the JA sentence at 26.6 px on a 375 px screen, while every other piece of text doubles. This is the largest, most important text on the Japanese home page, and it is the only text a low-vision reader cannot enlarge.
- Fix: add a rem floor so the vw cap only applies at the default text size.
  ```css
  .sentence:lang(ja) { font-size: max(min(var(--step-3), 7.1vw), 1.375rem); }
  ```
  At 100% this renders exactly as today from 320 px up (at 320 px, 7.1vw = 22.7 px, which is above the 22 px floor). Under zoom the floor takes over: page zoom 300% at 375 px gives 66 px (2.5×), and text zoom 200% gives 44 px. Under zoom the sentence then wraps at its BudouX phrase breaks rather than staying one line, which is the correct trade-off. Then extend `eval/run.mjs` with a check that every text size grows by at least 1.9× when the root font size is doubled, so a vw-only size cannot come back.

### F2. An English phrase on the Japanese About page has no language tag. **fix**
- Page/file: `/ja/about/`, `<div class="fact"><dt>所属</dt><dd>Unaffiliated by design</dd></div>`; the source is `content/site.ja.json:128` and `about()` in `site/build.mjs`.
- Criterion: WCAG 3.1.2 Language of Parts (AA). Proper names (Contemplative Agent, Attention, Not Self, ORCID) are exempt; this phrase is an ordinary English phrase, so it is not.
- Evidence: in the ARIA snapshot it is `definition: Unaffiliated by design` inside `<html lang="ja">`. A Japanese voice (Kyoko or O-Ren) spells it out in katakana phonetics.
- Fix: give the fact a `lang` field in the content file and emit `<dd lang="en">` (or a `<span lang="en">`) when the field is set. Alternatively, translate the phrase. The EN page writes `by&nbsp;design`; the JA page, which runs it through `prose(…, 'ja')`, does not. That is harmless, but it is another sign the string skipped the English path.

### F3. The Japanese sentence prints at 45 px. **fix** (small)
- Page/file: `/ja/` print; `site/site.css` `@media print { .sentence { font-size: 20pt } }`.
- Evidence: `.sentence:lang(ja)` (specificity 0,2,0) beats the print rule `.sentence` (0,1,0). The computed print size is 45 px on /ja/ against 26.7 px (20pt) on /. In the PDF, the JA sentence fills a third of page 1, and the EN one is a modest lead.
- Fix: in the print block, add `.sentence:lang(ja) { font-size: 16pt; }` (or raise the print rule to `.sentence, .sentence:lang(ja)`).

### F4. The English sentence scrolls sideways at a 375 px width with 200% text size. **fix** (low)
- Page/file: `/`, `.sentence`.
- Criterion: 1.4.4 (no loss of content), 1.4.10 in spirit.
- Evidence: with `html{font-size:200%}` at 375 px, `document.scrollWidth` is 384. The overflowing run is "meditation." after the link: at 70 px Newsreader the word plus its full stop is wider than the 324 px column and cannot break. Every other page stays within the viewport.
- Fix: `.sentence { overflow-wrap: break-word; }`, or `hyphens: auto`, which needs the `lang="en"` that is already on `<html>`. Both only take effect when a word cannot fit.

---

## Notes: accessibility

### N1. The target flash has no equivalent when reduced motion is on. **note**
- `/#aap` with `reducedMotion: reduce` computes `animation: none`, `outline: none` and a transparent background. Because the animation is gated correctly, no motion leaks through. The cost is that a reduced-motion reader who follows "judgment" lands on AAP with no cue at all, and with smooth scrolling also off the jump is abrupt. One option is a static, non-animated mark: `@media (prefers-reduced-motion: reduce) { .work:target { background: var(--color-accent-wash); box-shadow: 0 0 0 var(--space-xs) var(--color-accent-wash); } }`. The flash itself is a single 1.8 s fade with no flicker, so 2.3.1 is not in play.

### N2. Heading outline and reading order are sound. **note**
- Home: h1 name → h2 "Read and follow" (visually hidden, inside the named nav) → h2 ×3 quoted phrases → h3 per work. About: the visible name link comes first, then the h1 "About" (visually hidden), then the paragraphs and the `dl`. 404: h1 EN, then h2 JA inside `lang="ja"`. The Tab order at 375 px follows visual order (skip link → nav → five sentence links → entrances → per work: name, then its links → footer).
- Each `section[aria-labelledby]` becomes a region landmark: 4 on home, 2 on 404, plus the 2 named navs. That is acceptable and the names are distinct. If you want a quieter landmark menu, drop `aria-labelledby` from `.intro` (it duplicates the h1).

### N3. Link purpose: the hidden suffixes work. Two smaller points. **note**
- "Repository for claude-harness" and the JA "リポジトリ（claude-harness）" read correctly out of context.
- Each work's name link and its "Repository" link have the same URL, so there are two tab stops per work for one destination. That is not a failure. The name link is the 24 px target, and the round-2 ledger kept it on purpose.
- The sentence links ("judgment", "authorship") go to projects whose names differ from the link text. They pass 2.4.4 through the sentence context, but not 2.4.9 (AAA). That is fine to leave.
- In the `dl`, "Dev.to" and "build notes" are adjacent flex items. Screen readers announce them separately, but `innerText` and copy-paste join them as "Dev.tobuild notes". A visually hidden ", " (or ` — `) between them would fix copy-paste and some braille displays.

### N4. lang and hreflang on mixed-language links are correct. **note**
- The nav language switch has both `lang` and `hreflang`. Entrances to the other language carry `hreflang`. The JA section of the 404 page is `lang="ja"`. English project names on the JA page are proper names (exempt). F2 is the one gap.

### N5. Contrast passes in both themes, including over the flash wash. **note**
| token | light vs bg | dark vs bg | over accent-wash (L / D) |
|---|---|---|---|
| text | 14.05 | 13.98 | 12.46 / 12.47 |
| muted | 5.60 | 5.61 | 4.97 / 5.00 |
| accent | 6.20 | 6.18 | 5.50 / 5.51 |
| accent-line (dotted in-page underline) | 3.00 | 3.01 | — |
| line-strong (solid link underline) | 2.21 | 2.20 | — |

  The muted work links and the bold entrances rely on a 2.2:1 underline as their non-colour link cue. An underline counts for 1.4.1 regardless of its contrast, so this passes. It is faint in low light, though, and raising `line-strong` toward 3:1 would cost little.

### N6. Forced colours, focus, skip link and text spacing all pass. **note**
- Forced colours (light and dark): links take LinkText, focus outlines take CanvasText, and the skip link renders with system colours at 17,17 (120 × 48 px) when focused. Under the 1.4.12 override nothing is clipped or overflows at 320 or 1280 on any page. In Japanese the extra tracking breaks 「作る」 across lines at 320 px, and `overflow-wrap: anywhere` absorbs it.

### N7. Print is otherwise good. Two small gaps. **note**
- External URLs print after work links, entrances, the index link and facts. Footer links ("Source of this site" and the hub) print without URLs. Add `.site-foot a::after` to the print rule.
- The sentence's in-page links still print their dotted underline, which has no meaning on paper. Use `.sentence a { text-decoration: none }` in print.
- The quote rail stays two-column on A4 (794 px > 48rem). That works, but a rail title can end up alone at the bottom of a page (seen on EN page 2). `.gloss { break-inside: avoid-page }` is too strong for long sections, so `.section-title { break-after: avoid }` is the cheap fix.

---

## Notes: launch tech

### N8. Head metadata is complete and consistent. **note**
- Every indexable page has a unique `<title>` and description, a self-referencing canonical, a reciprocal `en`/`ja` hreflang pair and `x-default` → EN. The 404 correctly has `noindex` and no canonical or hreflang.
- Small items:
  - The 404 page inherits `og:type=profile` and `og:url=…/404.html`. That is harmless, but `og:type=website` (or no OG at all) would be cleaner.
  - X does not reliably fall back from `og:image:alt`. Add `twitter:image:alt` with the same text.
  - `og:type=profile` can take `profile:username` = `shimo4228`.
- The OG images are 1200 × 630 (85 KB and 54 KB) and each language page points to its own image. The apple-touch-icon is 180 × 180 with opaque corners.

### N9. JSON-LD works. One entity-alignment item affects the hub. **note**
- `ProfilePage` → `Person @id = ORCID` on both homes, matching the hub's Person `@id`, so the graphs merge.
- The hub's `sameAs` has Google Scholar and OpenAlex, which this site's does not. The hub also has no `url` and no link to `https://shimo4228.github.io/`. To make the two descriptions of the one Person agree, add Scholar and OpenAlex here, and (hub-side, separate change) add this site's root as the Person `url` or a `sameAs`.
- The `ja` ProfilePage carries the English bio as `description`. A JA `description` (or a language-tagged pair) would match `inLanguage: ja`.
- The About pages have no JSON-LD. An `AboutPage` with `mainEntity: {"@id": ORCID}` is optional.
- `rel="me"` on the profile entrances is right. GitHub's own profile website link carries `rel="me"`, so that pair verifies once the profile website field points here.

### N10. robots.txt and sitemap.xml are valid and safe for the hub. **note**
- `Allow: /` matches today's behaviour: before this site existed the root robots.txt was a 404, which means everything is allowed. Nothing under `/shimo4228/` is newly blocked.
- Listing the hub's sitemap here is valid. A sitemap is allowed to list URLs outside its own path when robots.txt references it, and that file exists in the hub with 27 `<loc>`s.
- The sitemap's `xhtml:link` hreflang triples match the HTML exactly.
- The hub's `CLAUDE.md` says its sitemap is "not referenced from robots.txt (project Pages cannot serve a domain-root robots.txt)". After launch that statement is out of date. It is a hub-doc edit, not this repo's.

### N11. The new root changes what the hub's visitors get in two places. **note**
- **favicon.ico**: the hub pages declare no icon, so browsers request `/favicon.ico` at the root, and that request now gets this site's 404 HTML. Adding a `favicon.ico` (32 × 32, or 48 × 48 for Google results), or a PNG fallback, gives the hub an icon for free. It also helps older Safari and crawlers that ignore SVG icons.
- **404 fallback**: the hub has no `404.html`. I believe GitHub Pages then serves the user site's `404.html` for missing `/shimo4228/…` URLs; that is unverified, so check after deploy with `curl -I https://shimo4228.github.io/shimo4228/nope`. If it does, the page still works, because every asset and link is root-absolute. It points visitors to this home page, not to the hub, which is acceptable.

### N12. Root-level files now available to the author. **note**
- llms.txt convention expects `/llms.txt` at the site root. The hub's copy lives at `/shimo4228/llms.txt`. A short root `/llms.txt` pointing to it (or a copy of it) is now possible. This is a decision for authorship-strategy, not a defect.
- A Search Console URL-prefix property for `https://shimo4228.github.io/` needs its own verification at the root. The hub's `google-site-verification` meta only verifies `/shimo4228/`. Either add the meta to `head()` or use the HTML-file method in `dist/`.

### N13. Fonts, weight and render path. **note**
- The preload is correct. It has `as=font`, `type=font/woff2` and `crossorigin` (needed even for same-origin fonts) and it matches the `@font-face` URL. The font is used on first paint on every page, including /ja/ (the name) and the 404, so there is no unused-preload warning. Lighthouse reports nothing to fix.
- `font-display: swap` without fallback metric overrides: with the font held back 1.5 s, CLS is 0.084 on / at 375 px and 0.032 at 1280. That is under 0.1, but the margin is thin. A `@font-face { font-family: "Newsreader Fallback"; src: local("Georgia"); size-adjust / ascent-override … }` added to the display stack would take it near 0.
- The @font-face has no `unicode-range`. That is fine, since the font is needed everywhere anyway, but adding `unicode-range: U+0000-00FF, U+2018-201F, …` would make clear that it never covers kana and kanji.
- Weight is about 50 KiB per page with one render-blocking stylesheet (13 KB). Inlining it would save one round trip on a cold load, but the cost is losing the shared cache across five pages. Keep it external.
- Caching: GitHub Pages sends `Cache-Control: max-age=600` and gzip, and neither can be changed. Lighthouse's `uses-long-cache-ttl`, `uses-text-compression` and `unminified-css` items are artefacts of the local test server or not worth acting on (about 3 KiB). The font and CSS are not fingerprinted, so after a deploy returning visitors can see the old CSS for up to 10 minutes. That is acceptable for this site.

### N14. Paths will work on the real origin. **note**
- Every internal reference is root-absolute (`/site.css`, `/fonts/…`, `/ja/`, `/about/`). That is correct for a user site, and it also keeps the 404 page working at any depth. GitHub redirects `/about` and `/ja` to their trailing-slash forms, and canonicals already use the slash form. `.nojekyll` is present.
- No `shimo4228/` directory exists in `dist/`, so the user site cannot shadow the project site.
- The site cannot be previewed by opening `dist/index.html` from disk (`file://`); use `eval/serve.mjs`.
