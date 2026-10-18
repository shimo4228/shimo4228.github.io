// Copies zenn-content's publication feed into content/publications.json, the one file the writing page is built from.
// zenn-content regenerates docs/publications.json with its index (`npm run generate:index`), so the feed on its
// main branch is the published list. FEED_REF (a commit sha sent with the dispatch) skips the raw CDN's cache.
// Locally a failed fetch keeps the committed copy; in CI it fails the run, so the last good deploy stays live
// instead of a stale or broken list replacing it.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ref = process.env.FEED_REF || 'main';
const FEED = `https://raw.githubusercontent.com/shimo4228/zenn-content/${ref}/docs/publications.json`;
const file = join(dirname(fileURLToPath(import.meta.url)), '..', 'content/publications.json');
const STAMP = /^\d{4}-\d\d-\d\d \d\d:\d\d$/;

try {
  const res = await fetch(FEED, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const feed = await res.json();
  if (!Array.isArray(feed.items)) throw new Error('no items array');
  const bad = feed.items.find((i) => !STAMP.test(i.published_at ?? '') || !i.ja?.url);
  if (bad) throw new Error(`malformed item ${bad.slug ?? '?'}`);
  const old = JSON.parse(readFileSync(file, 'utf8'));
  if (feed.items.length < old.items.length * 0.8) throw new Error(`items fell from ${old.items.length} to ${feed.items.length}`);
  const next = `${JSON.stringify(feed, null, 2)}\n`;
  const same = next === readFileSync(file, 'utf8');
  writeFileSync(file, next);
  console.log(`publications: ${same ? 'unchanged' : 'updated'} (${feed.items.length} items, ${ref})`);
} catch (e) {
  if (process.env.CI) {
    console.error(`publications: ${e.message}; stopping so the live site keeps its last good list`);
    process.exit(1);
  }
  console.warn(`publications: kept the existing copy (${e.message})`);
}
