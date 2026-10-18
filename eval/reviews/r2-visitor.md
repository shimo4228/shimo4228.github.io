# Round 2 review: first-time visitor's comprehension and next step

Lens: someone who lands on the top page from GitHub, a Dev.to/Zenn article, a Substack/note essay, the Claude
plugin directory, or a name search, and gives it about five seconds. Bio and project one-liners are treated as
fixed. Draft strings (entrance labels and one-liners, "Where the two meet" and its intro, the direction c map
questions) are fair game.

Material: `eval/shots/r2/*` (full page), plus viewport-only shots I took at 375×667 and 1280×800 (light), and
measured positions with Playwright. No project files were changed.

## 5-second test

| | 375 (first screen, 667 px) | 1280 (first screen, 800 px) |
|---|---|---|
| **a** | The name is a small bold label; the bio, in a large serif, fills about two thirds of the screen. Below the rule, only "In English: Dev.to / Substack" are visible (Zenn starts at y≈688, GitHub at y≈820). **Learns:** builds agents, meditates, three themes. **First tap:** probably a dotted-underlined phrase in the bio. Those phrases are in-page jump links, but they look like glossary terms or external links. Next most likely is Dev.to. **Hesitates:** "are these underlines links? where do they go?" | The bio again takes most of the screen, and the entrance grid starts at y≈647, so only the first two rows show. **Learns:** same as 375. **First click:** a bio phrase or Dev.to/GitHub. The name is easy to miss, so someone arriving from a name search has to look for it. |
| **b** | The name comes first in a large sans, then the bio at body size, then the entrance list (Dev.to → GitHub end at y≈635). **Learns:** who he is, plus where he writes in each language. **First tap:** Dev.to or GitHub. **Hesitates:** "build notes" (what is that?) and "Notes as they happen" (the X label) are below the fold, which is fine. | Name, bio and all four entrance groups fit, and "Building AI agents" starts at y≈623, so the reader can see projects are coming. This is the clearest first screen of the three. **First click:** a platform name in the grid. |
| **c** | Same as b down to the entrances. The map starts at y≈941 and the first project only at y≈1477, so the map costs about one and a half screens before any work. | Same first screen as b, but the top of the map (two pill nodes) shows at y≈620 and pulls the eye. **First click:** likely a map node, which jumps down the page. The three question boxes do not say what is behind them. |

All three avoid numbers and a "latest" box. None scrolls horizontally at 375. Every link is at least 16–17 px
tall.

## Findings

### F1 — "Where the two meet" intro talks about a project that isn't in the section · a, b, c · **fix**
**Saw:** the intro under "Where the two meet" says *"My own meditation practice is the source of Contemplative Agent
and Attention, Not Self."* The section then lists Contemplative Agent and **Authorship Strategy**. Attention, Not
Self sits in the section above, and the intro says nothing about Authorship Strategy (a-1280 y≈1515; b-1280
y≈1385; c-1280 y≈1568).
**Why it matters:** this is the one sentence meant to explain the page's structure, and a skimming reader checks
it against the two cards under it. The mismatch reads as an error, and Authorship Strategy looks misfiled.
**Fix:** make the intro describe only what the section holds. Either cut it down to the Contemplative Agent clause
and add a clause for why Authorship Strategy is here, or move Authorship Strategy out of the section and leave
only Contemplative Agent. This mapping is already an open question for the author in PRODUCT.md. What this review
adds is that it already confuses a reader before the author has decided it.

### F2 — Direction c: the map and the section below it name different meeting points · c · **fix**
**Saw:** in the map, both practices lead to one shared question, "Does the origin travel with the idea?" (that is,
Authorship Strategy). In the section below, the meeting is explained through Contemplative Agent, which is not on
the map at all.
**Why it matters:** the map is the only device on the page that explains the structure, and here it disagrees with
the page. A visitor who follows the map finds a section that answers something else.
**Fix:** decide which project or projects are "the meeting" and make the map and the section agree. For example,
add Contemplative Agent as a node under both practices, or drop the second parent from the authorship question.
This follows from F1.

### F3 — Direction c: the question boxes don't say where they lead · c · **fix**
**Saw:** the three monospace boxes ("Who answers when an agent fails?" etc.) are links to #aap,
#authorship-strategy and #attention-not-self. The project name exists only in `aria-label`. On the cards, the tie
back to the map is a small amber ring before three project names (c-1280 y≈1046, 1301, 1646), and nothing explains
what the ring means.
**Why it matters:** the visitor sees three questions without answers and cannot tell they are clickable. After a
click, the jump lands on a card whose title is different from the question.
**Fix:** put the project name as a second line inside or under each box, in small type (for example "→ Agent
Attribution Practice"). Then the map works as navigation, and the ring becomes optional.

### F4 — Direction c: the map's authorship question is hard-coded and differs from the content file · c · **fix**
**Saw:** the map says "Does the origin travel with the idea?". `content/site.en.json` has `questionText`: "How does
an author stay findable when readers meet ideas through LLMs?". The map string is hard-coded in
`proto/build.mjs:200` instead of being read from the content file. The other two questions do match the content
file.
**Why it matters:** the author's read-through of `site.en.json` will not cover the words a visitor actually sees.
**Fix:** read the question lines from `questionText` (split for the SVG), or update `site.en.json` to the shown
string and mark it draft. One source.

### F5 — Direction a: the bio's jump links mis-route and look like something else · a · **fix**
**Saw:** the three underlined parts of the bio are anchor links. "judgment, authorship, and human attention" goes
to `#meet`, but only *authorship* is in that section: judgment (Agent Attribution Practice) is under agents, and
human attention (Attention, Not Self) is under mind. The underline is a light dotted rule under a large serif
(a-1280 first screen), which looks like a glossary/tooltip mark, not a link.
**Why it matters:** in direction a, the bio is the first thing a visitor would tap. One of the three targets is
wrong for two of its three words. On a phone, a tap that scrolls the page somewhere unexpected also feels like
nothing happened.
**Fix:** either link the third clause word by word (judgment → #aap, authorship → #authorship-strategy, human
attention → #attention-not-self), or leave that clause unlinked. Make the link style read as a link at that size,
for example a solid underline that thickens on hover or focus. The bio words stay verbatim; only the markup
changes.

### F6 — Project names are not links · a, b, c · **fix**
**Saw:** every work title (`h3.work-name`) is plain text. The only way out is the small gray "Repository /
Write-up on Dev.to / Zenodo (DOI)" row under it (13–14 px, about 16 px tap height).
**Why it matters:** visitors click the bold name first. On a phone the small links are the hardest targets on the
page. Someone who came from the plugin directory looking for harness-scope will try its name first.
**Fix:** link each name to its primary destination: the repository, or for the essay, the Substack post. Keep the
secondary row for the write-up and DOI.

### F7 — Direction a: the name is the smallest text in the hero · a · **note**
**Saw:** "Tatsuya Shimomoto" is about 16 px bold above a bio set at about 48–56 px (a-1280, a-375).
**Why it matters:** someone arriving from a name search wants to confirm "is this the person" first. The bio-first
hierarchy is direction a's idea, but it does cost that confirmation a moment.
**Fix (if wanted):** increase the name's size or weight one step, keeping the bio as the display element.

### F8 — Entrance labels: "build notes", "Notes as they happen", "Code and records" · a, b, c · **note** (draft strings)
**Saw:** Dev.to and Zenn are labeled "build notes". X's group is "Notes as they happen", with no per-item label.
The third group is "Code and records".
**Why it matters:** "build notes" next to "Notes as they happen" uses "notes" for two different things. A visitor
from a Dev.to article knows them as "articles". "records" is vague; only ORCID's "papers" explains it.
**Fix:** for example Dev.to / Zenn → "technical articles"; the X group → "Short posts"; "Code and records" → "Code,
papers, data". These are drafts; the author picks the wording.

### F9 — "Every article and essay, in one list" opens a GitHub Markdown file · a, b, c · **note**
**Saw:** the link goes to `github.com/.../docs/PUBLICATIONS.md`.
**Why it matters:** a visitor expects a page on this site and lands in a GitHub file view. That works, but it is a
surprise.
**Fix:** say where it goes ("…in one list, on GitHub"), the same way the work links say "on Dev.to".

### F10 — Direction c at 375: the map pushes the projects down by about 1.5 screens · c · **note**
**Saw:** the narrow map runs from y≈941 to about y≈1440, and harness-scope starts at y≈1477, compared with y≈940 in
b. Its curves are thin, and the middle question's two parent lines are hard to follow at this size (c-375-light).
**Why it matters:** mobile visitors who scroll past the entrances meet a diagram before any work. With F3 fixed,
the map would earn that space as navigation; without it, it is a detour.
**Fix (if kept):** shorten the narrow map, for example by putting the two practice pills side by side at the top
with the three questions stacked below. Or hide it below about 480 px and rely on the section headings.

### F11 — Direction b: the two-color "merge" border doesn't explain itself on mobile · b · **note**
**Saw:** at 1280 the blue and amber frames visibly join into "Where the two meet" (b-1280 y≈1280). At 375 that
becomes a blue-and-amber double left border (b-375 y≈1420+), which reads as decoration.
**Why it matters:** minor. The heading carries the meaning anyway.
**Fix:** none required. If wanted, repeat the two colors as small markers on the "Building AI agents" and
"Watching the mind" headings so the pairing reads at a glance.

### F12 — Direction a 1280: X sits alone on a second row · a · **note**
**Saw:** a's three-column entrance grid wraps "Notes as they happen / X" onto its own row (a-1280 y≈617–645),
while b and c fit four columns.
**Why it matters:** a lone X row gets more visual weight than the three main groups.
**Fix:** use four columns at this width, or put X inline with the "every article" line.

## How each direction does the one job

- **a** — Leads with what he does, in a voice that is memorable, but the name, the routes out, and a correct
  meaning for the bio's links all come after the large sentence. The visitor knows *what* sooner than *who* or
  *where next*.
- **b** — Name, bio and every entrance fit on the first screen at 1280, and almost all of them at 375. The
  practice frames make the two-part structure readable. This is the most direct "who, and where next".
- **c** — Same strong first screen as b, plus a map that could explain the structure. As built, the map does not
  name its destinations and disagrees with the section below it, so at present it adds a step instead of a route.
