# shimo4228.github.io — source

The personal site at <https://shimo4228.github.io/>. This branch (`source`) holds the source and is the default
branch; GitHub Actions builds it and deploys the pages (`.github/workflows/deploy.yml`).

- `content/site.en.json`, `content/site.ja.json` — every string on the site, with where it came from
- `DESIGN.md` — design values (front matter) and rules; `site/tokens.mjs` turns them into CSS
- `site/build.mjs` — writes `dist/`; `site/images.mjs` renders the share images and icons
- `eval/` — the polish loop (`npm run eval`), the frozen detail units (`npm run units`) and their ledger

```sh
npm ci
npm run build   # dist/
npm run eval    # checks on the built pages
npm run units   # frozen detail units; EVAL_CHANNEL=chrome or EVAL_ENGINE=webkit on macOS
```

Publishing: push to `source`. The workflow also rebuilds every morning at 09:17 JST and when zenn-content sends a
`publications` dispatch, so a newly published piece appears on the writing page without a push. The old `main`
branch of hand-copied builds was removed; its last build is the tag `archive/main-2026-10-20`.
