# r6 accessibility review (built site after round 5, Chrome 156 on macOS, axe-core)

Fresh reviewer, without eval/. axe 0 violations; contrast computed per text node.

1. **fix** — Shift+Tab back into the dimmed opening puts focus on a sentence link at 1.62:1 (opacity 0.40). Fix
   `.intro:focus-within{opacity:1 !important}` under motion. Unfocused links scrolled into the dim stay below 3:1
   (the author's call).
2. **fix** — a pending reveal item that takes focus still fades and slides for ~0.6s. Fix `transition:none` on
   `.reveal .pending:focus-within`.

No finding: skip link, keyboard order and focus not obscured, contrast, reduced motion, deep links, forced colours,
reflow and text spacing (each alone), target size, lang, print. Note: the fluid sentence reaches 151–180% under 200%
zoom; 1.4.4 holds through page zoom.
