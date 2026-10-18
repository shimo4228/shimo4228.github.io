// Renders the share images (og/en.png, og/ja.png) and apple-touch-icon.png into dist/ with Playwright.
// Run after site/build.mjs; uses the built site.css and favicon so the images match the pages.
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from '../eval/serve.mjs';
import { loadDefaultJapaneseParser } from 'budoux';
const budoux = loadDefaultJapaneseParser();

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const en = JSON.parse(readFileSync(join(root, 'content/site.en.json'), 'utf8'));
const ja = JSON.parse(readFileSync(join(root, 'content/site.ja.json'), 'utf8'));

const card = (lang, name, text) => `<!DOCTYPE html><html lang="${lang}"><head><meta charset="utf-8">
<link rel="stylesheet" href="/site.css">
<style>
  html, body { margin: 0; inline-size: 1200px; block-size: 630px; overflow: hidden; }
  body { display: grid; grid-template-rows: auto 1fr auto; padding: 72px 88px 64px; box-sizing: border-box; }
  .name { font-size: 34px; }
  .sentence { font-size: ${lang === 'ja' ? 48 : 60}px !important; line-height: ${lang === 'ja' ? 1.55 : 1.14} !important; max-inline-size: ${lang === 'ja' ? '21em' : '17em'} !important; margin: 28px 0 0; align-self: start; }
  .sentence span { text-decoration: underline dotted var(--color-accent-line); text-decoration-thickness: 0.07em; text-underline-offset: 0.27em; text-decoration-skip-ink: none; }
  .url { font-size: 24px; color: var(--color-muted); }
</style></head><body>
<p class="name">${name}</p>
<p class="sentence">${lang === 'ja' ? text.replace(/。(?!$)/g, '。<br>') : text}</p>
<p class="url">shimo4228.github.io</p>
</body></html>`;

const phrase = (t, lang) => (lang === 'ja' ? budoux.parse(t).join('<wbr>') : t.replace('the age of AI.', 'the&nbsp;age of&nbsp;AI.'));
const wrapLinks = (c) => c.sentence.map((p) => (p.link ? `<span style="white-space:nowrap">${p.text}</span>` : phrase(p.text, c.lang))).join('');

const icon = readFileSync(join(dist, 'favicon.svg'), 'utf8');
const ground = icon.match(/rect\{fill:(#[0-9a-f]+)\}/)[1];
const { port, close } = await serve(dist);
const b = await chromium.launch();
mkdirSync(join(dist, 'og'), { recursive: true });
for (const [lang, c] of [['en', en], ['ja', ja]]) {
  const ctx = await b.newContext({ viewport: { width: 1200, height: 630 }, colorScheme: 'light' });
  const page = await ctx.newPage();
  await page.goto(`http://localhost:${port}/`);
  await page.setContent(card(lang, c.name, wrapLinks(c)), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(dist, 'og', `${lang}.png`) });
  await ctx.close();
}
const ctx = await b.newContext({ viewport: { width: 180, height: 180 } });
const page = await ctx.newPage();
await page.goto(`http://localhost:${port}/`);
// iOS masks the icon itself, so the corners are filled with the page ground instead of left transparent.
await page.setContent(`<html><body style="margin:0;background:${ground}"><img src="http://localhost:${port}/favicon.svg" width="180" height="180" style="display:block"></body></html>`, { waitUntil: 'networkidle' });
await page.screenshot({ path: join(dist, 'apple-touch-icon.png'), clip: { x: 0, y: 0, width: 180, height: 180 } });
// favicon.ico at the root: browsers that ask for /favicon.ico (and the hub under /shimo4228/) get the same mark.
// An ICO file may carry a PNG payload; one 32px image is enough.
await page.setViewportSize({ width: 32, height: 32 });
await page.setContent(`<html><body style="margin:0;background:transparent"><img src="http://localhost:${port}/favicon.svg" width="32" height="32" style="display:block"></body></html>`, { waitUntil: 'networkidle' });
const png = await page.screenshot({ clip: { x: 0, y: 0, width: 32, height: 32 }, omitBackground: true });
const head = Buffer.alloc(22);
head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(1, 4);
head.writeUInt8(32, 6); head.writeUInt8(32, 7); head.writeUInt8(0, 8); head.writeUInt8(0, 9);
head.writeUInt16LE(1, 10); head.writeUInt16LE(32, 12); head.writeUInt32LE(png.length, 14); head.writeUInt32LE(22, 18);
writeFileSync(join(dist, 'favicon.ico'), Buffer.concat([head, png]));
await b.close();
close();
console.log('images: og/en.png og/ja.png apple-touch-icon.png favicon.ico');
