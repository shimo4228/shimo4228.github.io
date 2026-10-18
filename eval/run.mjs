// Eval layers 1-3 for the site (or the prototypes).
// Usage: node eval/run.mjs <root> <comma-separated paths> [outDir]
// Exit code 1 when any hard check fails. Report: <outDir>/report.json and summary.md
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { HtmlValidate } from 'html-validate';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { serve } from './serve.mjs';

const [root, pathsArg = '', outDir = 'eval/report'] = process.argv.slice(2);
const paths = pathsArg.split(',').filter(Boolean);
mkdirSync(outDir, { recursive: true });

const findings = [];
const add = (layer, check, page, detail, severity = 'fail') => findings.push({ layer, check, page, severity, detail });

// ---------- Layer 1: broken things (static) ----------
const htmlv = new HtmlValidate({
  extends: ['html-validate:recommended'],
  rules: {
    // role="list" is kept on purpose: Safari drops list semantics when list-style is none.
    'no-redundant-role': 'off',
    'no-inline-style': 'off', 'void-style': 'off', 'no-trailing-whitespace': 'off', 'long-title': 'off', 'attribute-boolean-style': 'off' },
});
// A path is a directory (its index.html) or an .html file.
const fileOf = (p) => (p.endsWith('.html') ? join(root, p) : join(root, p, 'index.html'));
for (const p of paths) {
  const file = fileOf(p);
  if (!existsSync(file)) { add(1, 'exists', p, 'index.html missing'); continue; }
  const html = readFileSync(file, 'utf8');
  const rep = await htmlv.validateString(html);
  for (const r of rep.results) for (const m of r.messages) add(1, 'html-validate', p, `${m.ruleId}: ${m.message} (line ${m.line})`);
  // JSON-LD parses and keeps the shared identity
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const j = JSON.parse(m[1]);
      const person = j['@type'] === 'Person' ? j : j.mainEntity;
      if (person && person['@type'] === 'Person' && person['@id'] !== 'https://orcid.org/0009-0002-6168-4162') add(1, 'json-ld', p, `Person @id is ${person['@id']}`);
    } catch (e) { add(1, 'json-ld', p, `does not parse: ${e.message}`); }
  }
}

// ---------- Layer 2: discipline (static) ----------
// Hand-written CSS only (generated tokens are allowed raw values). EVAL_CSS overrides the default.
const cssFiles = process.env.EVAL_CSS ? process.env.EVAL_CSS.split(',') : paths.map((p) => join(root, p, 'style.css')).filter(existsSync);
for (const f of cssFiles) {
  const css = readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const lines = css.split('\n');
  lines.forEach((l, i) => {
    if (/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|oklch\(/i.test(l)) add(2, 'raw-color', f, `line ${i + 1}: ${l.trim()}`);
    const px = l.match(/(?<![\w-])(\d*\.?\d+)px/g);
    if (px && !/@media/.test(l)) add(2, 'raw-px', f, `line ${i + 1}: ${l.trim()}`, 'warn');
  });
}

// Generated-page tells (frontend-design's list), checked by text and computed style later.
// Impeccable's detector ships as a prebuilt binary, so it stays out until the author decides.
for (const p of paths) {
  // Piece titles on the writing page are the author's published titles, quoted as data, not site chrome.
  const html = readFileSync(fileOf(p), 'utf8').replace(/<script[\s\S]*?<\/script>/g, '').replace(/<a class="piece-title"[^>]*>[\s\S]*?<\/a>/g, '');
  const text = html.replace(/<[^>]+>/g, ' ');
  if (/\S\s+·\s+\S/.test(text)) add(2, 'tell:middle-dot-meta', p, 'meta string joined with " · "');
  if (/→|&rarr;/.test(html)) add(2, 'tell:arrow-link', p, 'an arrow appended to link text');
  if (/\s—\s/.test(text)) add(2, 'tell:spaced-em-dash', p, 'a label built with a spaced em dash', 'warn');
  if (/\b0[1-9]\b\s*\//.test(text)) add(2, 'tell:numbered-markers', p, '01 / 02 style markers');
}
for (const f of cssFiles) {
  const css = readFileSync(f, 'utf8');
  if (/text-transform:\s*uppercase/.test(css)) add(2, 'tell:all-caps', f, 'text-transform: uppercase');
  if (/box-shadow:[^;]*rgba\(0,\s*0,\s*0,\s*0?\.1\)/.test(css)) add(2, 'tell:soft-card-shadow', f, 'soft grey card shadow');
}

// ---------- Layer 3: measured details (browser) ----------
const { port, close } = await serve(root);
const browser = await chromium.launch();
const sweep = [];
for (let w = 320; w <= 1920; w += 10) sweep.push(w);
const keyWidths = [320, 375, 414, 768, 1024, 1280, 1440, 1920];

async function measure(page) {
  return page.evaluate(() => {
    const out = { overflow: [], nearMiss: [], widows: [], measure: [], targets: [] };
    const vw = document.documentElement.clientWidth;
    if (document.documentElement.scrollWidth > vw) out.overflow.push(`page scrollWidth ${document.documentElement.scrollWidth} > ${vw}`);
    const desc = (el) => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : ''} "${(el.textContent || '').trim().slice(0, 40)}"`;
    const visible = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
    const blocks = [...document.querySelectorAll('h1,h2,h3,p,li,dt,dd,figure,svg.map')].filter(visible);
    for (const el of blocks) {
      const r = el.getBoundingClientRect();
      if (r.right > vw + 0.5) out.overflow.push(`${desc(el)} right ${r.right.toFixed(1)} > ${vw}`);
    }
    // Text left edges: collect the first line's left for every text block, find near-misses (1-3px).
    const lefts = [];
    for (const el of blocks) {
      const s = getComputedStyle(el);
      if (s.textAlign === 'center') continue;
      // The nav is set flush right, so where its items start depends on their widths, not on an axis.
      if (el.closest('.site-nav')) continue;
      const range = document.createRange();
      const tn = [...el.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim()) || el.querySelector('a, span')?.firstChild;
      if (!tn || tn.nodeType !== 3) continue;
      const off = tn.textContent.search(/\S/);
      range.setStart(tn, off); range.setEnd(tn, off + 1);
      const rr = range.getClientRects()[0];
      if (rr) lefts.push({ x: rr.left, el: desc(el) });
    }
    const xs = [...new Set(lefts.map((l) => Math.round(l.x * 2) / 2))].sort((a, b) => a - b);
    for (let i = 1; i < xs.length; i++) {
      const d = xs[i] - xs[i - 1];
      if (d > 1 && d <= 3) {
        const a = lefts.find((l) => Math.round(l.x * 2) / 2 === xs[i - 1]);
        const b = lefts.find((l) => Math.round(l.x * 2) / 2 === xs[i]);
        out.nearMiss.push(`${d.toFixed(1)}px apart: ${a.el} / ${b.el}`);
      }
    }
    // Widows and line length: walk words with ranges.
    const textBlocks = [...document.querySelectorAll('main h1, main h2, main h3, main p, main dd, main dt, .read-what, .question-line')].filter(visible);
    for (const el of textBlocks) {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const words = [];
      let n;
      while ((n = walker.nextNode())) {
        if (n.parentElement.closest('svg')) continue;
        const re = /\S+/g; let m;
        while ((m = re.exec(n.textContent))) {
          const r = document.createRange(); r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length);
          const rect = r.getClientRects(); if (!rect.length) continue;
          words.push({ w: m[0], top: Math.round(rect[rect.length - 1].top), len: m[0].length });
        }
      }
      if (!words.length) continue;
      const lines = [];
      for (const w of words) { const L = lines.find((l) => Math.abs(l.top - w.top) < 4); if (L) L.words.push(w); else lines.push({ top: w.top, words: [w] }); }
      lines.sort((a, b) => a.top - b.top);
      if (lines.length > 1 && words.length > 3) {
        const last = lines[lines.length - 1].words;
        const cjk = /[぀-ヿ一-鿿]/.test(el.textContent);
        const lastLen = last.reduce((s, w) => s + w.len, 0);
        if ((!cjk && lastLen < 8) || (cjk && lastLen < 3)) out.widows.push(`${desc(el)} last line "${last.map((w) => w.w).join(' ')}" (${lines.length} lines)`);
        if (!el.matches('h1,h2,h3,dt')) {
          const chars = lines.slice(0, -1).map((l) => l.words.reduce((s, w) => s + w.len + 1, 0));
          const avg = chars.reduce((a, b) => a + b, 0) / chars.length;
          if (avg > 80) out.measure.push(`${desc(el)} ~${avg.toFixed(0)} chars/line`);
        }
      }
    }
    // Target size: WCAG 2.2 AA 24px for links not inside running text.
    for (const a of document.querySelectorAll('a')) {
      if (!visible(a) || a.closest('p, svg') || a.classList.contains('skip-link')) continue;
      const r = a.getBoundingClientRect();
      if (r.height < 24 || r.width < 24) out.targets.push(`${desc(a)} ${r.width.toFixed(0)}x${r.height.toFixed(0)}`);
    }
    return out;
  });
}

for (const p of paths) {
  for (const scheme of ['light', 'dark']) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: scheme, reducedMotion: scheme === 'dark' ? 'reduce' : 'no-preference' });
    const page = await ctx.newPage();
    await page.goto(`http://localhost:${port}/${p}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    // Internal anchors resolve
    const missing = await page.evaluate(() => [...document.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute('href')).filter((h) => h.length > 1 && !document.getElementById(h.slice(1))));
    for (const m of new Set(missing)) add(1, 'anchor', p, `${m} has no target`);
    // Sweep widths for overflow; detailed checks at key widths
    const seen = new Set();
    for (const w of sweep) {
      await page.setViewportSize({ width: w, height: 900 });
      const r = await measure(page);
      const key = keyWidths.includes(w);
      for (const o of r.overflow) add(3, 'overflow', `${p} ${scheme} ${w}px`, o);
      if (!key) continue;
      for (const [check, list, sev] of [['near-miss-left-edge', r.nearMiss, 'fail'], ['widow', r.widows, 'fail'], ['line-length', r.measure, 'warn'], ['target-size', r.targets, 'fail']]) {
        for (const item of list) {
          const k = `${check}|${item}`;
          if (seen.has(k)) continue; seen.add(k);
          add(3, check, `${p} ${scheme} ${w}px`, item, sev);
        }
      }
    }
    // axe at narrow and wide, with every element at its end state (the scroll-in fade would read as low contrast)
    await page.addStyleTag({ content: '*, *::before, *::after { animation: none !important; }' });
    for (const w of [375, 1280]) {
      await page.setViewportSize({ width: w, height: 900 });
      const ax = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze();
      for (const v of ax.violations) add(3, `axe:${v.id}`, `${p} ${scheme} ${w}px`, `${v.help} (${v.nodes.length} nodes: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(', ')})`);
    }
    // Focus: every tab stop shows an outline
    await page.setViewportSize({ width: 1280, height: 900 });
    const stops = [];
    for (let i = 0; i < 60; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(30);
      const s = await page.evaluate(() => {
        const el = document.activeElement; if (!el || el === document.body) return null;
        const cs = getComputedStyle(el);
        const rect = el.querySelector?.('rect');
        const ring = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0 || (rect && parseFloat(getComputedStyle(rect).strokeWidth) >= 3);
        return { t: (el.textContent || '').trim().slice(0, 30), ring, y: el.getBoundingClientRect().top + scrollY };
      });
      if (!s) break;
      if (stops.length && stops[0].t === s.t && stops[0].y === s.y) break;
      stops.push(s);
    }
    for (const s of stops) if (!s.ring) add(3, 'focus-visible', `${p} ${scheme}`, `no visible focus on "${s.t}"`);
    await ctx.close();
  }
}
await browser.close();
close();

// Volatile content: numbers in visible text (counts, versions, dates) are not allowed on the page.
for (const p of paths) {
  // The writing list is a record (publication dates, titles as written), not state: it is left out.
  const html = readFileSync(fileOf(p), 'utf8')
    .replace(/<ul role="list" class="pieces">[\s\S]*?<\/ul>/g, '')
    .replace(/<h2 [^>]*class="year-label">\d{4}<\/h2>/g, '');
  // ORCID iDs are identifiers, not counts.
  const text = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<[^>]+>/g, ' ').replace(/\b\d{4}-\d{4}-\d{4}-\d{3}[\dX]\b/g, '');
  for (const m of text.matchAll(/\b(v?\d+(\.\d+)+|\d{2,})\b/g)) add(1, 'volatile-number', p, `"${m[0]}" in visible text`, 'warn');
}

const fails = findings.filter((f) => f.severity === 'fail');
writeFileSync(join(outDir, 'report.json'), JSON.stringify(findings, null, 2));
const byCheck = {};
for (const f of findings) (byCheck[`L${f.layer} ${f.check} (${f.severity})`] ||= []).push(f);
let md = `# Eval report\n\n${fails.length} failing, ${findings.length - fails.length} warnings\n\n`;
for (const [k, list] of Object.entries(byCheck)) {
  md += `## ${k}: ${list.length}\n\n`;
  for (const f of list.slice(0, 25)) md += `- ${f.page}: ${f.detail}\n`;
  if (list.length > 25) md += `- … ${list.length - 25} more\n`;
  md += '\n';
}
writeFileSync(join(outDir, 'summary.md'), md);
console.log(md);
process.exit(fails.length ? 1 : 0);
