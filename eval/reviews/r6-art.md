# r6 art direction review (built site after round 5, Chrome 156 on macOS)

Fresh reviewer, without eval/. 7 pages; 375, 1280, 1440; light and dark; motion on and off.

1. **fix** — Japanese work lines get `.work-line:not(:has(.tie)) { text-wrap: balance }` (meant for English): balance
   cuts words (明／示的, ルー／ルファイル) and the column edge steps in and out. Fix `.work-line:lang(ja){text-wrap:pretty}`.
2. **fix** — a piece title's hover and focus ring span its whole 458px grid cell. Fix `justify-self:start`, ring on `.u`.
3. **fix** — dark `--color-link` has twice the chroma of the light moss (C 0.097 vs 0.043) and reads as generic green.
   Fix `oklch(0.585 0.055 154)`, 4.13:1 on the ground, 3.38:1 from the text.
4. **note** — `.writing-title` and `.lost-title` use Newsreader (and moss) outside Rules 1 and 2.
5. **fix (code)** — two section-header comments in site.css label the wrong block.

No finding: margin notes align across pages at 1440, nav marks, landing marks, hangs, opening motion, reveal, dark lines.
