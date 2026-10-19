# r5 Japanese typography review (built site after round 4, Chrome 156 on macOS, Hiragino)

Fresh reviewer, without eval/. /ja/, /ja/about/, /ja/writing/, JA half of /404.html; 320–1440.

1. **fix** — a line-final `&nbsp;` before `<wbr>` keeps its 0.333em and carries the `.u` underline past the last
   character: 47 of 1230 non-final lines. Fix: emit a plain space before `<wbr>` (same break points).
2. **fix** — Latin–Japanese space varies 0.125–0.333em; JLReq 3.2.3 sets a quarter em. Fix: body word-spacing −0.083em.
3. **note** — running paragraphs are ragged-right; kinsoku push-out leaves up to 2.8em. Justify at ≥30rem, or leave.
4. **note** — DESIGN.md says keep-all on all running text; the CSS applies it to short lines only.
5. **note** — /ja/about/ at 320 (below the 360 minimum): the lead opens with 「こんにちは、」 alone.

No finding: kinsoku, overflow, hanging 「, Hiragino weights, bracket trimming, sentence breaks, dark mode.
