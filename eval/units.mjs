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

  'typographic-punctuation': { pages: ['', 'about/', 'writing/', 'ja/', 'ja/about/', 'ja/writing/', '404.html'], widths: [1280], run: (page) => page.evaluate(() => {
    const bad = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n; (n = walker.nextNode()); ) {
      if (n.parentElement.closest('script, style, code, pre')) continue;
      for (const m of n.textContent.matchAll(/.{0,20}['"].{0,20}/g)) bad.push(`straight quote: 「${m[0].trim()}」`);
    }
    return bad;
  }) },

  'no-dead-ends': { pages: ['about/', 'writing/', 'ja/about/', 'ja/writing/', '404.html'], widths: [1280], run: (page) => page.evaluate(() => {
    const home = /^\/(ja\/)?(#[\w-]+)?$/;
    const links = [...document.querySelectorAll('main a[href], footer a[href]')].map((a) => a.getAttribute('href'));
    return links.some((h) => home.test(h)) ? [] : ['no link back to the home page in main or footer'];
  }) },

  'text-zoom': { pages: ['', 'about/', 'writing/', 'ja/', 'ja/about/', 'ja/writing/', '404.html'], widths: [375, 1280], run: (page) => page.evaluate(() => {
    const els = [...document.querySelectorAll('main :is(h1, h2, h3, p, li, dt, dd, a)')].filter(__visible);
    const before = els.map((e) => parseFloat(getComputedStyle(e).fontSize));
    document.documentElement.style.fontSize = '200%';
    const bad = [];
    els.forEach((e, i) => { const after = parseFloat(getComputedStyle(e).fontSize); if (after < before[i] * 1.2) bad.push(`${e.tagName.toLowerCase()}.${e.className} 「${(e.textContent || '').trim().slice(0, 12)}」 ${before[i].toFixed(1)}→${after.toFixed(1)}px at 200% root`); });
    document.documentElement.style.fontSize = '';
    return bad;
  }) },

  'no-overflow': { pages: ['', 'about/', 'writing/', 'ja/', 'ja/about/', 'ja/writing/', '404.html'], widths: [320, 360, 375, 414, 600, 768, 1024, 1280, 1920], run: (page) => page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const bad = [];
    if (document.documentElement.scrollWidth > vw) bad.push(`page scrollWidth ${document.documentElement.scrollWidth} > ${vw}`);
    for (const el of [...document.querySelectorAll('h1, h2, h3, p, li, dt, dd, figure')].filter(__visible)) {
      const r = el.getBoundingClientRect();
      if (r.right > vw + 0.5) bad.push(`${el.tagName.toLowerCase()} 「${(el.textContent || '').trim().slice(0, 12)}」 right ${r.right.toFixed(0)} > ${vw}`);
    }
    return bad;
  }) },

  'head-metadata': { pages: ['', 'about/', 'writing/', 'ja/', 'ja/about/', 'ja/writing/', '404.html'], widths: [1280], run: (page) => page.evaluate(() => {
    const bad = [];
    const themes = [...document.querySelectorAll('meta[name="theme-color"]')].map((m) => m.media);
    if (!themes.some((m) => m.includes('light')) || !themes.some((m) => m.includes('dark'))) bad.push('theme-color for light and dark');
    const ld = [...document.querySelectorAll('script[type="application/ld+json"]')];
    const ok = ld.some((s) => { try { const j = JSON.parse(s.textContent); const p = j['@type'] === 'Person' ? j : j.mainEntity; return p && p['@id'] === 'https://orcid.org/0009-0002-6168-4162'; } catch { return false; } });
    if (/^\/(ja\/)?$/.test(location.pathname) && !ok) bad.push('JSON-LD Person with the shared @id on the home page');
    if (!document.querySelector('script[data-cf-beacon]')) bad.push('analytics beacon');
    if (!document.querySelector('link[rel="icon"]')) bad.push('icon link');
    return bad;
  }) },

  'sticky-rail-quotes': { pages: ['', 'ja/'], widths: [768, 1280], run: (page) => page.evaluate(async () => {
    const bad = [];
    let measured = 0;
    for (const t of [...document.querySelectorAll('.gloss > .section-title')].filter(__visible)) {
      const g = t.parentElement;
      const gTop = g.getBoundingClientRect().top + scrollY;
      const room = g.offsetHeight - t.offsetHeight;
      if (room < 160) continue;
      window.scrollTo(0, gTop + 120);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      measured++;
      const top = t.getBoundingClientRect().top;
      if (top < 0) bad.push(`「${t.textContent.trim().slice(0, 12)}」 scrolled away (${top.toFixed(0)}px) while its gloss is in view`);
    }
    window.scrollTo(0, 0);
    if (!measured) bad.push('no gloss tall enough to measure');
    return bad;
  }) },

  'title-no-widow': { pages: ['writing/', 'ja/writing/'], widths: [375, 414, 768, 1024, 1280, 1440], run: (page) => page.evaluate(() => {
    const bad = [];
    const ja = document.documentElement.lang === 'ja';
    for (const t of [...document.querySelectorAll('.piece-title')].filter(__visible)) {
      const lines = __linesOf(t).map((l) => l.text.trim()).filter(Boolean);
      if (lines.length < 2) continue;
      const last = lines[lines.length - 1];
      const short = ja ? [...last.replace(/[、。」』）\s]/g, '')].length <= 2 : !/\s/.test(last);
      if (short) bad.push(`「${lines[lines.length - 2].slice(-12)} / ${last}」`);
    }
    return bad;
  }) },

  'link-label-whole': { pages: ['about/', 'ja/about/'], widths: [320, 375, 390, 414, 768, 1280], run: (page) => page.evaluate(() =>
    [...document.querySelectorAll('.fact a')].filter(__visible).map((a) => [a, __linesOf(a).length]).filter(([, n]) => n > 1).map(([a, n]) => `「${a.textContent.trim()}」 split over ${n} lines`)) },

  'ja-text-in-ja-stack': { pages: ['ja/', 'ja/about/', 'ja/writing/', '404.html'], widths: [375, 1280], run: (page) => page.evaluate(() => {
    const bad = [];
    // Running text only: the sentence, titles and leads are display lines with their own leading.
    for (const el of [...document.querySelectorAll('main :lang(ja) :is(p, dd, li):not(.sentence, .section-title, .lead)')].filter(__visible)) {
      const cs = getComputedStyle(el);
      const ratio = parseFloat(cs.lineHeight) / parseFloat(cs.fontSize);
      if (!(ratio >= 1.8)) bad.push(`「${el.textContent.trim().slice(0, 12)}」 line-height ${ratio.toFixed(2)}`);
      if (!/Hiragino Mincho/.test(cs.fontFamily.split(',').slice(0, 3).join(','))) bad.push(`「${el.textContent.trim().slice(0, 12)}」 stack ${cs.fontFamily.slice(0, 30)}`);
    }
    return bad;
  }) },

  'underline-word-length': { pages: ['', 'ja/'], widths: [375, 1280], run: (page) => page.evaluate(() => {
    const bad = [];
    for (const a of [...document.querySelectorAll('.site-foot a')].filter(__visible)) {
      const cs = getComputedStyle(a);
      const box = a.getBoundingClientRect().width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const r = document.createRange(); r.selectNodeContents(a);
      const text = r.getBoundingClientRect().width;
      if (box - text > 1.5) bad.push(`「${a.textContent.trim()}」 line ${box.toFixed(1)}px for a ${text.toFixed(1)}px word`);
    }
    return bad;
  }) },

  'landing-bar-visible': { pages: ['#mind', 'ja/#mind', '#tools', 'ja/#tools'], widths: [320, 375, 1280], run: (page) => page.evaluate(() => {
    const t = document.querySelector('.gloss:target > .section-title');
    if (!t) return ['no target title'];
    const left = t.getBoundingClientRect().left + parseFloat(getComputedStyle(t, '::before').left);
    return left >= 4 ? [] : [`bar at ${left.toFixed(1)}px`];
  }) },

  'single-hairline-first-piece': { pages: ['writing/', 'ja/writing/'], widths: [1280, 1440, 1920], run: (page) => page.evaluate(() => {
    const first = document.querySelector('.piece');
    const w = parseFloat(getComputedStyle(first).borderTopWidth);
    return w === 0 ? [] : [`first piece has a ${w}px border above its own hairline`];
  }) },

  'sentence-link-large': { pages: ['ja/'], widths: [320, 330, 336, 340, 360, 375], run: (page) => page.evaluate(() => {
    const px = parseFloat(getComputedStyle(document.querySelector('p.sentence')).fontSize);
    return px >= 24 ? [] : [`JA sentence ${px.toFixed(2)}px: its 4:1 links are not large text`];
  }) },

  'reflow-text-zoom': { pages: ['', 'about/', 'writing/', 'ja/', 'ja/about/', 'ja/writing/', '404.html'], widths: [320, 375], run: (page) => page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
    const vw = document.documentElement.clientWidth;
    const sw = document.documentElement.scrollWidth;
    document.documentElement.style.fontSize = '';
    return sw <= vw ? [] : [`scrollWidth ${sw} > ${vw} at 200% text zoom`];
  }) },

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
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
await ctx.addInitScript(LINES);
const page = await ctx.newPage();
const open = async (p, w) => {
  await page.setViewportSize({ width: w, height: 900 });
  if (page.url() !== `http://localhost:${port}/${p}`) {
    await page.goto('about:blank');
    await page.goto(`http://localhost:${port}/${p}`, { waitUntil: 'networkidle' });
  }
  await page.evaluate(() => document.fonts.ready);
};

const results = [];
const frozen = units.filter((u) => u.status === 'frozen');
for (const u of frozen) {
  const fails = [];
  if (u.id === 'focus-not-hidden') {
    // Motion on: every link inside an item still waiting to reveal is visible as soon as it takes focus.
    for (const w of [375, 1280]) for (const p of ['', 'ja/', 'writing/']) {
      const mctx = await browser.newContext({ viewport: { width: w, height: 800 }, reducedMotion: 'no-preference' });
      const mp = await mctx.newPage();
      await mp.goto(`http://localhost:${port}/${p}`, { waitUntil: 'networkidle' });
      await mp.waitForTimeout(300);
      const hidden = await mp.evaluate(async () => {
        const out = [];
        const links = [...document.querySelectorAll('.pending a')].slice(0, 12);
        for (const a of links) {
          a.focus();
          await new Promise((r) => setTimeout(r, 900));
          let o = 1;
          for (let e = a; e; e = e.parentElement) o *= parseFloat(getComputedStyle(e).opacity);
          if (o < 0.9) out.push(`「${a.textContent.trim().slice(0, 20)}」 opacity ${o.toFixed(2)}`);
        }
        return out;
      });
      for (const h of hidden) fails.push(`/${p} ${w}px: focused ${h}`);
      await mctx.close();
    }
  } else if (u.id === 'forced-colors') {
    const fctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, forcedColors: 'active' });
    const fp = await fctx.newPage();
    for (const p of ['about/', 'ja/about/', 'writing/']) {
      await fp.goto(`http://localhost:${port}/${p}`, { waitUntil: 'networkidle' });
      const r = await fp.evaluate(() => {
        const cur = document.querySelector('.site-nav [aria-current="page"]');
        const bad = [];
        if (!cur || !getComputedStyle(cur).textDecorationLine.includes('underline')) bad.push('current page not underlined');
        for (const a of document.querySelectorAll('main a, .site-foot a')) {
          if (a.closest('.section-title')) continue;
          const d = (el) => getComputedStyle(el).textDecorationLine.includes('underline');
          if (!d(a) && !(a.querySelector('.u') && d(a.querySelector('.u')))) { bad.push(`「${a.textContent.trim().slice(0, 16)}」 has no underline`); break; }
        }
        return bad;
      });
      for (const b of r) fails.push(`/${p} forced colors: ${b}`);
    }
    await fctx.close();
  } else if (u.id === 'drift-gap') {
    // Motion on: the opening drifts down as the page scrolls; it must not reach the first section.
    for (const [w, h] of [[375, 812], [375, 667], [1280, 900]]) for (const p of ['', 'ja/']) {
      const mctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: 'no-preference' });
      const mp = await mctx.newPage();
      await mp.goto(`http://localhost:${port}/${p}`, { waitUntil: 'networkidle' });
      await mp.waitForTimeout(1500); // the opening's rise-in finishes first
      const min = await mp.evaluate(async () => {
        let least = Infinity;
        for (let y = 0; y <= 900; y += 50) {
          window.scrollTo(0, y);
          // A scroll-driven animation updates after the scroll is processed; two frames are not always enough.
          await new Promise((r) => setTimeout(r, 120));
          const s = document.querySelector('.intro .sentence').getBoundingClientRect().bottom;
          const g = document.querySelector('.gloss').getBoundingClientRect().top;
          least = Math.min(least, g - s);
        }
        return least;
      });
      if (min < 0) fails.push(`/${p} ${w}x${h}: sentence reaches ${(-min).toFixed(0)}px into the first section`);
      await mctx.close();
    }
  } else if (u.id === 'sentence-size-balance') {
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
