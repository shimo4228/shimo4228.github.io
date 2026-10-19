# r4 art direction review (built site, Chrome 156 on macOS)

Reviewer: art director, fresh, without eval/, DESIGN.md as the brief. 375 and 1280, light and dark, motion on and off;
hover, focus and :target states.

1. **fix** — on phones the opening's `drift` (14vh = 114px at 812h) exceeds the 68px gap; from ~400px of scroll the
   sentence prints over the first quoted title (gap −46px at 812h, −25px at 667h). Fix: `drift-sm` keyframes capped at
   `min(14vh, space-2xl − space-s)` below 48rem → gap ≥ 17px.
2. **fix** — the landing bar on a quoted title is off screen on the JA phone page (x −1.7px) and on the edge in EN
   (x 0.1px). Fix: phone offsets from space-2xs → EN 8.6px, JA 6.8px.
3. **fix** — the footer "X" underline is 24px under a 9px letter (min-inline-size 1.5rem for the target). Fix:
   `min-inline-size:0; padding-inline:.5rem; margin-inline:-.5rem` → line matches the word, target 25px.
4. **fix** — /writing/ at 80rem+: `.piece:first-child` keeps its full-width border over the column-width hairline
   (EN only; JA wins by a later :lang rule), running into the margin note. Fix `border:0` in the 80rem first-child rule.
5. **note** — nav: hover (colour + drawn line) reads stronger than the current page (colour only).
6. **note** — the writing page title uses Newsreader; add it to DESIGN.md Rule 1's list.

No finding: colour roles, hangs, focus with underline, reveal leaves nothing hidden, one motion curve throughout,
spacing rhythm, About and 404 composition.
