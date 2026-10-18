# Round 3 review: first-time visitor's comprehension and next step (EN / JA)

Lens: someone who lands from GitHub, a Dev.to/Zenn article, a Substack/note essay, the plugin directory or a name
search, and gives the page about five seconds. The English bio and the project one-liners are fixed. Draft strings
(section intros, platform labels, the Japanese sentence, About facts, the Japanese About title) are fair game.

Material: `eval/shots/site/*` (full page), plus first-screen shots at 375×740 and 1280×800 and click-through shots
of every in-sentence link, taken with Playwright from `dist/`. Scripts and shots are in the session scratch folder.
No project files were changed.

## 5-second test

| | 375, first screen | 1280, first screen |
|---|---|---|
| **EN** | The name is small; the bio fills the screen in large serif with dotted underlines. Below the rule, "In English: Dev.to / Substack" and the top of "In Japanese". **Learns:** builds AI agents, meditates, three themes. **First tap:** a dotted bio phrase (the biggest, most link-like thing), then Dev.to. **Hesitates:** nothing says what kind of person this is (researcher? developer?) beyond the bio; that is acceptable because the bio does the job. | Same, with "In English / In Japanese" side by side at the bottom edge. **First click:** a bio phrase, or Dev.to / GitHub once scrolled. The language split of platforms reads instantly. |
| **JA** | 「AI エージェントを作る。瞑想で心を見る。AI の時代の判断、著者性、人の注意を探る。」 in four short lines, then 日本語で Zenn / note. **Learns:** the same thing as EN, faster. **First tap:** a phrase or Zenn. **Hesitates:** the third clause breaks as 「AI の時代の判断、／著者性、／人の注意を探る。」, a list read one item per line (see F7). | Clean; Zenn/note on the left, Dev.to/Substack on the right. **First click:** Zenn or a phrase. The name is Latin-only (see F8). |

What works: the bio-as-index idea lands. Phrase links scroll to a section whose quoted title repeats the phrase
(`#tools`, `#mind` land with the quote visible at both widths), and project links flash the target card. No
horizontal scroll, no numbers, the language switch goes page-to-page (`/` ↔ `/ja/`, `/about/` ↔ `/ja/about/`) and is
written in the target language.

## Findings

### F1 — "human attention" lands outside the section titled with it · home EN/JA · 375 and 1280 · **fix**
**Saw:** the third section is titled "judgment, authorship, and human attention" / 「判断、著者性、人の注意」, but it holds
no attention project. Clicking "human attention" in the bio scrolls *up* to Attention, Not Self in the meditation
section (375: card at top, and right below it the heading "judgment, authorship, and human attention" whose
section does not contain it).
**Why it matters:** the design promise is "each section quotes a phrase; the works under it are the gloss". Here
the quote and the gloss disagree, which is exactly where a careful visitor checks the structure and decides it is
sloppy.
**Fix (draft intro, no change to bio or one-liners):** make the intro state the mapping, e.g. EN: "Judgment is AAP,
authorship is Authorship Strategy; human attention is Attention, Not Self, in the section above." JA:「判断は AAP、
著者性は Authorship Strategy。人の注意は、上の Attention, Not Self です。」 Alternatively retitle the section to the two
phrases it actually glosses ("judgment, authorship") — the quote would still be verbatim from the bio.

### F2 — "Four long-running projects, each with its own DOI" is miscounted from the visitor's view · home EN/JA · all widths · **fix**
**Saw:** the third-section intro says four projects with DOIs. Attention, Not Self, one section up, also shows a
"Zenodo (DOI)" link and is equally long-running.
**Why it matters:** a reader who has just seen a DOI link above reads "four, each with its own DOI" as either an
error or a ranking they cannot decode. It also leads with an identifier instead of what the projects are.
**Fix:** drop the count/DOI clause and lead with the claim, e.g. "Long-running research projects on how agents
hold values and who answers for them." JA:「エージェントが価値をどう持ち、誰が責任を負うかを扱う、長く続けている研究です。」
Or, if the DOI framing stays, say "four of the five lines" and fold in F1.

### F3 — The third-section intro is the densest sentence on the page and uses three acronyms before they are defined · home EN/JA · 375 especially · **fix**
**Saw:** "Contemplative Agent, AKC and AAP share one claim: an agent harness can hold value norms in the same layer
as its coding conventions, revised through the same human review." At 375 it runs 7 lines in muted grey before the
first card; AKC and AAP are expanded only in the cards below. JA is longer (3 sentences, 5 lines at 1280).
**Why it matters:** a skimmer meets "AKC and AAP" as noise; "harness", "value norms", "layer" stack three abstractions.
This is the only prose that explains why the projects belong together, and it is the hardest to read.
**Fix:** use full names or drop the list ("These projects share one claim: …"), and cut to one sentence:
"They share one claim: an agent's values can live beside its coding rules and be revised by the same human review."
JA:「共通する主張は、エージェントの価値の規範もコーディング規約と同じ場所に書け、同じ人間のレビューで直し続けられる、ということです。」

### F4 — About is a dead end: "something here is for you" with nothing here · About EN/JA · 375 and 1280 · **fix**
**Saw:** the About page has two paragraphs and four facts. Its only links are the name/Home, ORCID, and two facts
that both go to the hub. No platforms, no projects. The second paragraph ends "something here is for you" /
「…に向けています。」
**Why it matters:** About is where a name-search visitor often lands second. After reading "for you", the next step
is the nav or the back button; "here" points at nothing on this page.
**Fix:** add one link line after the paragraphs, e.g. "Start with the projects →" (`/#tools`) and "Read: Dev.to ·
Substack · Zenn · note", or reuse the entrances block. JA:「プロジェクトを見る →」.

### F5 — About facts lean on "hub" and "concept DOI", and two different facts open the same page · About EN/JA · all widths · **fix**
**Saw:** "Cite each project by its concept DOI, listed on the hub." and "The hub carries graph.jsonld and llms.txt."
Both whole sentences are links to `shimo4228.github.io/shimo4228/`. "hub" is never introduced; the footer calls
the same URL "Machine-readable profile".
**Why it matters:** one destination under three names (hub, hub, machine-readable profile) reads as three places.
A citing academic understands "concept DOI"; anyone else does not, and does not need to.
**Fix:** name the destination once and consistently, and link only the noun: Citing — "Each project's DOI is on its
card on the home page, and all are listed on the [research hub]." For machines — "[Research hub]: graph.jsonld,
llms.txt." Use the same label in the footer ("Research hub (machine-readable)"). JA: 「研究のハブ」で統一。

### F6 — "Building AI agents" contains tools for Claude Code, not agents · home EN/JA · all widths · **note**
**Saw:** the first section quotes "Building AI agents" and lists four Claude Code tools; the actual agent
(Contemplative Agent, "A local agent…") is in the third section.
**Why it matters:** a visitor who clicks "Building AI agents" to see an agent finds plugins and hooks. The draft
intro ("Tools for Claude Code, from the harness my agents work in") half-explains it.
**Fix (author's call):** either add a pointer in the intro ("The agent itself, Contemplative Agent, is below.") or
accept it. Jargon in the fixed one-liners ("Jev", "harness", "akc-cycle") is noted but left alone per the rules;
"Jev" is the one a newcomer cannot decode at all.

### F7 — Japanese sentence breaks into a one-word-per-line list at 375 · /ja/ · 375 · **note**
**Saw:** 「AI の時代の判断、」「著者性、」「人の注意を探る。」 on three lines; 「著者性、」 stands alone.
**Why it matters:** it reads as a bullet list rather than one clause and gives 著者性 an emphasis the sentence does not
intend. At 1280 it is fine.
**Fix:** let 「判断、著者性、」 stay together (wrap the three nouns in one BudouX-unbreakable span, or drop the `<wbr>`
between 判断、 and 著者性、), so 375 reads 「AI の時代の判断、著者性、／人の注意を探る。」.

### F8 — Japanese pages give the name only in Latin letters · /ja/, /ja/about/ · all widths · **note**
**Saw:** 「Tatsuya Shimomoto」 everywhere, including 「こんにちは、Tatsuya Shimomoto（shimo4228）です。」
**Why it matters:** Japanese readers search and remember names in kanji; a Zenn/note reader may know the author by
handle only. Author's call whether to publish the kanji name.
**Fix:** if the author wants it, add the kanji name once on /ja/ (e.g. as a small line under the name) and in Person
JSON-LD `alternateName`.

### F9 — "Every article and essay, in one list" opens a GitHub Markdown file · home EN/JA · all widths · **note**
**Saw:** the link under the entrances goes to `github.com/…/docs/PUBLICATIONS.md`.
**Why it matters:** a visitor expecting a reading list gets GitHub chrome; mild surprise, not a blocker.
**Fix:** say where it opens: "Every article and essay, in one list (GitHub)" / 「記事とエッセイの一覧（GitHub）」.

### F10 — Japanese labels that read slightly off · /ja/ · all widths · **note**
- 「この人について」 (nav and About title): a third-person "about this person" on one's own site. 「プロフィール」 or
  「自己紹介」 is the usual label and is shorter in the nav at 375.
- 「その時々のメモ」 for X is fine; X has no 「what」 text in either language, which is the only empty slot in the grid.
- 所属 「Unaffiliated by design」 stays English on the Japanese About (verbatim from GitHub). Acceptable; author's call
  whether to add 「（意図して無所属）」.

### F11 — Nav items shift between pages · all pages · 375 · **note**
**Saw:** home nav is 「日本語 · About」; About and 404 nav is 「Home · 日本語 · About」, so the language switch moves
left on every page change.
**Why it matters:** small, but the switch is the one control visitors reuse across pages.
**Fix:** keep the language switch last (rightmost) on every page, or show "Home" on home as current.

### F12 — 404 is bilingual but English-first everywhere · 404 · 375 · **note**
**Saw:** "Nothing here … Go to the home page", a rule, then 「ページがありません … ホームへ」. Fine and clear; both
home links work. A broken `/ja/…` URL still shows English first and the title is English only.
**Fix (optional):** title "Nothing here · ページがありません". Ordering is acceptable as is.

## Summary of fix items

F1 "human attention" section mismatch; F2 "four … each with its own DOI" miscount; F3 dense acronym intro;
F4 About dead end; F5 "hub" / "concept DOI" naming on About and footer.
