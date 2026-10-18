# shimo4228.github.io — source

The personal site at <https://shimo4228.github.io/>. This branch (`source`) holds the source; `main` holds the built
pages that GitHub Pages serves.

- `content/site.en.json`, `content/site.ja.json` — every string on the site, with where it came from
- `DESIGN.md` — design values (front matter) and rules; `site/tokens.mjs` turns them into CSS
- `site/build.mjs` — writes `dist/`; `site/images.mjs` renders the share images and icons
- `eval/` — the polish loop (`npm run eval`) and its ledger

```sh
npm ci
npm run build   # dist/
npm run eval    # checks on the built pages
```

Publishing: build, then copy `dist/` to the root of `main` and push.
