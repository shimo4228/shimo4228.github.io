# r5 accessibility review (built site after round 4, Chrome 156 on macOS, axe-core)

Fresh reviewer, without eval/. 7 pages; 320–1280; light and dark; reduced motion on and off; forced colours; print.
axe: 56 runs, 0 violations.

1. **fix** — the parallax dims the sentence to opacity 0.2 while it is on screen: sentence links 1.41–2.22:1 when a
   reader stops scrolling (WCAG 1.4.3). Fix: an opacity floor of 0.85 (links ≥ 3.21:1), or translate only.
2. **fix** — with motion on, `.site-head` gets `view-transition-name`, a stacking context painted over the focused
   skip link: 407 of 407 hit points on the header at 320. WCAG 2.4.1, 2.4.7. Fix `.skip-link{z-index:2}`.
3. **fix** (print) — sentence links print without an underline (`text-decoration-color: transparent` survives the
   print rule). Fix `@media print{.sentence a{text-decoration-color:currentColor}}`.
4. **note** — 200% text zoom plus text spacing together overflows at 320 (`.tie` nowrap); not required jointly.

No finding: keyboard and focus (pending:focus-within works), reduced motion, parallax gap, reveal, static contrast,
forced colours, reflow (each alone), lang, target size, print palette.
