// Frozen detail units (eval/units.yaml): one check per unit, measured on the rendered page.
// Usage: node eval/units.mjs [root=dist] [--update-golden]
// Exit 1 when a frozen unit fails. Fonts are the machine's own: on macOS the Japanese text is set in Hiragino,
// the author's font; elsewhere the results for font-dependent units (ja-quote-hang) do not transfer.
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { parse } from 'yaml';
import { serve } from './serve.mjs';

const args = process.argv.slice(2);
const update = args.includes('--update-golden');
const root = args.find((a) => !a.startsWith('--')) || 'dist';
const units = parse(readFileSync('eval/units.yaml', 'utf8'));
const goldenFile = 'eval/golden/sentence-lines.json';
const golden = existsSync(goldenFile) ? JSON.parse(readFileSync(goldenFile, 'utf8')) : {};
const WIDTHS = [320, 375, 414, 768, 1000, 1280, 1920];

// Runs in the page: every rendered character with its box, folded into lines by line-box top.
const LINES = `
window.__linesOf = (el) => {
  const chars = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let n; (n = walker.nextNode()); ) {
    if (n.parentElement.closest('svg, .visually-hidden')) continue;
    const t = n.textContent;
    for (let i = 0; i < t.length; i++) {
      const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + 1);
      const rect = r.getClientRects()[0];
      if (!rect || (rect.width === 0 && /\\s/.test(t[i]))) continue;
      chars.push({ ch: t[i], top: rect.top, left: rect.left });
    }
  }
  const lines = [];
  for (const c of chars) {
    const L = lines[lines.length - 1];
    if (L && Math.abs(L.top - c.top) < 2) L.chars.push(c); else lines.push({ top: c.top, chars: [c] });
  }
  return lines.map((l) => ({ chars: l.chars, text: l.chars.map((c) => c.ch).join('').replace(/\\u00a0/g, ' ') }));
};
window.__visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
`;

const JA_TEXT = ':lang(ja) :is(h1, h2, h3, p, dt, dd, li)';

const checks = {
  'ja-kinsoku-start': { pages: ['ja/', 'ja/about/'], widths: WIDTHS, run: (page) => page.evaluate((sel) => {
    const START = /^[ーぁぃぅぇぉっゃゅょゎゕゖァィゥェォッャュョヮヵヶ々〻ゝゞヽヾ、。，．・：；？！‥…）］｝〕〉》」』】〙〗〟’”)\]}]/u;
    const END = /[（［｛〔〈《「『【〘〖〝‘“(\[{]$/u;
    const bad = [];
    for (const el of [...document.querySelectorAll(sel)].filter(__visible)) {
      if (el.querySelector(sel)) continue; // the innermost block owns its lines
      const lines = __linesOf(el);
      lines.forEach((l, i) => {
        if (i > 0 && START.test(l.text)) bad.push(`line starts 「${l.text.slice(0, 8)}」`);
        if (i < lines.length - 1 && END.test(l.text.trimEnd())) bad.push(`line ends 「${l.text.slice(-8)}」`);
      });
    }
    return bad;
  }, JA_TEXT) },

  'ja-quote-hang': { pages: ['ja/'], widths: [375, 1280], run: (page) => page.evaluate(() => {
    const bad = [];
    for (const h of [...document.querySelectorAll('.section-title:lang(ja)')].filter(__visible)) {
      if (!h.querySelector(':scope > q:first-child')) continue;
      const cs = getComputedStyle(h);
      const edge = h.getBoundingClientRect().left + parseFloat(cs.paddingLeft) + parseFloat(cs.borderLeftWidth);
      for (const l of __linesOf(h)) {
        const first = l.chars.find((c) => !/[「『\s]/.test(c.ch));
        if (!first) continue;
        const d = first.left - edge;
        if (Math.abs(d) > 0.5) bad.push(`「${l.text.slice(0, 10)}」 first letter at edge ${d >= 0 ? '+' : ''}${d.toFixed(1)}px`);
      }
    }
    return bad;
  }) },

  'ja-sentence-lines': { pages: ['ja/'], widths: WIDTHS, golden: true },
  'en-sentence-lines': { pages: [''], widths: WIDTHS, golden: true },

  'ja-no-space-at-line-start': { pages: ['ja/', 'ja/about/'], widths: WIDTHS, run: (page) => page.evaluate((sel) => {
    const bad = [];
    for (const el of [...document.querySelectorAll(sel)].filter(__visible)) {
      if (el.querySelector(sel)) continue;
      __linesOf(el).forEach((l, i) => { if (i > 0 && /^[  　]/.test(l.text)) bad.push(`line starts with a space: 「${l.text.slice(0, 8)}」`); });
    }
    return bad;
  }, JA_TEXT) },
};

const sentenceLines = (page) => page.evaluate(() => __linesOf(document.querySelector('p.sentence')).map((l) => l.text.trim()));

const { port, close } = await serve(root);
const browser = await chromium.launch(process.env.EVAL_CHANNEL ? { channel: process.env.EVAL_CHANNEL } : {});
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await ctx.addInitScript(LINES);
const page = await ctx.newPage();
const open = async (p, w) => {
  await page.setViewportSize({ width: w, height: 900 });
  if (page.url() !== `http://localhost:${port}/${p}`) await page.goto(`http://localhost:${port}/${p}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
};

const results = [];
const frozen = units.filter((u) => u.status === 'frozen');
for (const u of frozen) {
  const fails = [];
  if (u.id === 'sentence-size-balance') {
    for (const w of [375, 1280]) {
      const size = async (p) => { await open(p, w); return page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('p.sentence')).fontSize)); };
      const ratio = (await size('')) / (await size('ja/'));
      if (ratio < 1.1 || ratio > 1.2) fails.push(`${w}px: EN/JA ${ratio.toFixed(3)} outside [1.10, 1.20]`);
    }
  } else {
    const c = checks[u.id];
    if (!c) { fails.push('no check implemented'); results.push({ id: u.id, fails }); continue; }
    for (const p of c.pages) for (const w of c.widths) {
      await open(p, w);
      if (c.golden) {
        const got = await sentenceLines(page);
        golden[u.id] ||= {};
        if (update) golden[u.id][w] = got;
        else if (JSON.stringify(got) !== JSON.stringify(golden[u.id][w])) fails.push(`${w}px: got ${JSON.stringify(got)}`);
      } else {
        for (const f of await c.run(page)) fails.push(`/${p} ${w}px: ${f}`);
      }
    }
  }
  results.push({ id: u.id, fails: [...new Set(fails)] });
}
await browser.close();
close();
if (update) writeFileSync(goldenFile, JSON.stringify(golden, null, 2) + '\n');

let failing = 0;
for (const r of results) {
  console.log(`${r.fails.length ? 'FAIL' : 'pass'}  ${r.id}${r.fails.length ? ` (${r.fails.length})` : ''}`);
  for (const f of r.fails.slice(0, 8)) console.log(`      ${f}`);
  if (r.fails.length) failing++;
}
console.log(`\n${failing} of ${results.length} frozen units failing${update ? ' (golden updated)' : ''}`);
process.exit(failing ? 1 : 0);
