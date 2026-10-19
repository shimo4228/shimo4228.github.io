# r6 Japanese typography review (built site after round 5, Chrome 156 on macOS, Hiragino)

Fresh reviewer, without eval/. 3,799 lines measured at 320–1440.

1. **fix** — in titles a break after 」 or ） starts a line with a particle (「価値」|は, 「観測窓」|として). Fix: U+2060 after
   a closing bracket before a particle.
2. **fix** — Japanese work lines are balanced, not filled (3.62em short on average at 375). Fix: `text-wrap: pretty`.
3. **fix** — Claude|Code splits in /ja/writing/ titles (12 plain spaces, 11 tied) and concept|DOI in About at 320.
4. **fix** — the About lead (display role) breaks inside words; keep-all would keep phrases whole.
5. **note** — DESIGN.md "keep-all on all running text" vs the CSS; break-anywhere leaves short last lines (道具|です。).
6. **fix (minor)** — Latin–Japanese spacing 0.333em in body vs JLReq's quarter em.

No finding: kinsoku (0 in 3,799 lines), bracket trim, hanging 「, the sentence, underlines on JA links, overflow.
