# r4 accessibility review (built site, Chrome 156 on macOS, axe-core)

Reviewer: accessibility engineer, fresh, without eval/. 7 pages; 320, 375, 1280; light and dark; reduced motion on and
off; forced colours; print.

1. **fix** — the scroll reveal leaves a keyboard-focused link invisible: focus scrolling stops the item inside the
   observer's −8% margin, so it stays `.pending` at opacity 0 (/ 375: 1 stop, / 1280: 4, /ja/ 375: 3, /writing/
   1280: 3, /ja/writing/ 1280: 2). WCAG 2.4.7, 2.4.11. Fix `.reveal .pending:focus-within{opacity:1;translate:0 0}`.
2. **fix** — the opening's scroll-linked fade (to opacity .2 over 85vh) takes the sentence links to 1.41–2.07:1 while
   still on screen and clickable. WCAG 1.4.3 (large text, 3:1). Fix: drift without the fade.
3. **fix** — the JA sentence is 22.7–23.9px at 320–337, below large text, with 4.02:1 links. Fix: floor 1.5rem.
4. **fix** — under 200% text-only zoom phone pages scroll sideways (/ja/ 490 at 375, /404 515…); the 404 also under
   1.4.12 text spacing. Grid tracks without minmax(0, …), nowrap labels, the EN .keep span. Fix: phone
   `minmax(0,1fr)` tracks, `.piece-where` wrapping, `overflow-wrap` on running text, `.keep{max-inline-size:100%}`.
5. **note** — fluid type grows 1.5–1.7× under text-only zoom on wide screens; 1.4.4 holds through page zoom.
6. **fix** (forced colours) — the current page in the nav is marked by lightness only and not at all in forced colours.
   Fix: underline `[aria-current]` in forced colours.

No finding: axe (28 runs clean), reduced motion, nothing left hidden after scrolling, reflow at 320, target size,
forced-colour underlines and focus, print palette, skip link and focus order, lang marking.
