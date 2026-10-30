# PRODUCT.md

What this site is for, who reads it, and where every sentence on it comes from.
Design values live in DESIGN.md (written after the author picks a direction). This file is the brief.

## The one job

A first-time visitor understands within seconds who Tatsuya Shimomoto is and where to go next.
The site is an entrance to the author's platforms, not a second copy of them.

## Readers

- Arrive from GitHub (the profile, a repository README), a Dev.to or Zenn article, a Substack or note essay,
  the Claude plugin directory, or a search for the author's name.
- Most read English. Japanese readers switch to `/ja/`.
- They decide in seconds whether to read further; nobody reads the whole page.

## Constraints

- English first at `/`, Japanese at `/ja/` through a switch on every page (author, 2026-10-17).
- Static HTML and CSS. The only script is the Cloudflare Web Analytics beacon.
- No numbers (stars, views, followers, counts, versions) and no "latest" box. Articles are linked, not copied.
- The self-introduction is the GitHub profile bio, word for word. Change the GitHub bio first; this site follows.
- Body text in system fonts; at most one web font in one weight for display text.
- Person `@id` is the ORCID URL, `alternateName` is shimo4228, the same as the hub.
- Creating the `shimo4228.github.io` repository publishes the site, and its root `robots.txt` also governs the hub at
  `/shimo4228/`. Nothing is created or published before the author's GO.

## Where the words come from

| String | Source | Status |
|---|---|---|
| Bio | GitHub profile `bio` | canonical, verbatim |
| Japanese one-liner (`/ja/`) | personal-branding `docs/facts.md` one-liner | confirmed |
| Project one-liners | hub `README.md` "At a glance" and "Start here" | verbatim |
| Essay line | the Substack subtitle of the essay | verbatim |
| Section titles, platform one-liners, "Where they meet" mapping | written by Claude | draft, waits for the author's read-through |

## Open content questions for the author

- The "Where they meet" mapping (judgment → AAP, authorship → Authorship Strategy, human attention → Attention, Not Self)
  is a draft. Attention, Not Self then appears twice on the page.
- Japanese wording beyond the one-liner.
- `note.com/sakamaki4228`: list it or not.
- Bluesky: add when the profile URL is given.
