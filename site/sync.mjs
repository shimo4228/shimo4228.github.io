// Copies zenn-content's publication feed into content/publications.json, the one file the writing page is built from.
// zenn-content regenerates docs/publications.json with its index (`npm run generate:index`), so the feed on its
// main branch is the published list. If the fetch fails, the copy already in content/ stays and the build goes on.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const FEED = 'https://raw.githubusercontent.com/shimo4228/zenn-content/main/docs/publications.json';
const file = join(dirname(fileURLToPath(import.meta.url)), '..', 'content/publications.json');

try {
  const res = await fetch(FEED);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const feed = await res.json();
  if (!Array.isArray(feed.items)) throw new Error('no items array');
  const next = `${JSON.stringify(feed, null, 2)}\n`;
  const same = next === readFileSync(file, 'utf8');
  writeFileSync(file, next);
  console.log(`publications: ${same ? 'unchanged' : 'updated'} (${feed.items.length} items)`);
} catch (e) {
  console.warn(`publications: kept the existing copy (${e.message})`);
}
