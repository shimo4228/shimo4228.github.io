# r5 art direction review (built site after round 4, Chrome 156 on macOS)

Fresh reviewer, without eval/. 7 pages; 375 and 1280; light and dark; motion on and off.

1. **fix** — "research hub" shows a double-width gap (Charter's nbsp). Fix: plain space with nowrap.
2. **fix** — a two-line work name ("After I Ran Out of Things to / Ask AI…") puts its margin note on line 2 at 80rem+:
   `.work-name a{display:inline-block}` makes the heading's baseline the last line. Fix: inline.
3. **fix** — /writing/ at 80rem+: the note starts at x 981.8 against home's 962.8 (+19px margin), and titles run 19px
   past their hairline. Fix: the note track takes the step, `.piece-where` pads instead of margin.
4. **fix** — hover: work-links turn moss while names stay ink; small outbound labels follow two rules.
5. **note** — DESIGN.md drift: Rule 2 lists dotted underlines that no longer exist; two rules numbered 8.
6. **note** — "Unaffiliated by design" in English on /ja/about/ (verbatim?).

No finding: hangs, current-page mark and focus, opening rise, parallax gap, reveal, landing bars, colour roles,
404, palt and keep-all, spacing rhythm.
