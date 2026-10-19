# r4 Japanese typography review (built site, Chrome 156 on macOS, Hiragino)

Reviewer: senior Japanese typesetter, fresh, without eval/. Pages /ja/, /ja/about/, /ja/writing/, JA half of /404.html;
320–1440, light and dark, reduced motion. Fonts read with CDP getPlatformFontsForNode: body Hiragino Mincho ProN W3,
names W6, Latin in display lines Newsreader; Shippori Mincho never used on this Mac.

1. **fix** — /404.html JA paragraph set in the English stack and leading (Charter…, 1.55; kana by per-glyph fallback).
   body resolves the variables in English; the section's :lang(ja) redefinition never applies. Fix
   `.lost:lang(ja){font-family:var(--font-body);line-height:var(--leading-body)}` → Hiragino stack, 1.9.
2. **fix** — /ja/about/ `.fact dd a` 「研究の hub」 splits across lines, once inside 研究 (375: 「研究 / の hub」, 414:
   「研 / 究の hub」). Fix `:lang(ja) .fact a{word-break:keep-all}` → one fragment at all widths.
3. **fix** — the Latin–Japanese space in running text is 0.33em (the Hiragino space); JLReq's default is a quarter em.
   Fix `body:lang(ja){word-spacing:-0.08em}` with display lines reset → 0.25em.
4. **note** — U+2060 word joiner before 「 and （ (23 places) forbids a break JLReq permits; mixed effect, deliberate.
5. **note** — DESIGN.md disagrees with the CSS: keep-all "on all running text" vs headings only; 「」 hang "a full em"
   vs 0.5em with palt; two rules numbered 8.
6. **note** — lines end up to 5.6em short before the tied 「Claude Code」; only justify would cure it.
7. **note** — two piece titles end on two characters at 320 (「実測」「こと」).

No finding: kinsoku (0 violations), display line breaks, quote hang (words on the edge), overflow, halt brackets in
link labels, flush 「 at line start.
