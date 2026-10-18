// Builds the site into dist/: /, /about/, /ja/, /ja/about/, /404.html, robots.txt, sitemap.xml, icons.
// Content: content/site.{en,ja}.json. Design values: DESIGN.md (via site/tokens.mjs).
// The Cloudflare Web Analytics beacon is the only script on the site. The token is public (it ships in every page);
// CF_BEACON_TOKEN overrides it, and an empty value builds without the beacon.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import subsetFont from 'subset-font';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadDefaultJapaneseParser } from 'budoux';
import { readDesign, tokensCss } from './tokens.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const dist = join(root, 'dist');
const ORIGIN = 'https://shimo4228.github.io';
const ORCID = 'https://orcid.org/0009-0002-6168-4162';
const HUB = 'https://shimo4228.github.io/shimo4228/';
const BEACON = process.env.CF_BEACON_TOKEN ?? '2776a8f67e47403f8604a10e2dce848a';

const design = readDesign(join(root, 'DESIGN.md'));
const tokens = tokensCss(design);
const content = {
  en: JSON.parse(readFileSync(join(root, 'content/site.en.json'), 'utf8')),
  ja: JSON.parse(readFileSync(join(root, 'content/site.ja.json'), 'utf8')),
};
// Articles and essays, from zenn-content's docs/publications.json (copied in by `npm run sync`).
// Scheduled items (published_at in the future, JST) stay hidden until their time.
const publications = JSON.parse(readFileSync(join(root, 'content/publications.json'), 'utf8'));
const NOW_JST = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 16).replace('T', ' ');
const published = publications.items.filter((i) => i.published_at <= NOW_JST);
const budoux = loadDefaultJapaneseParser();

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Text for display. Japanese gets BudouX phrase breaks; English gets non-breaking spaces where a line must not end.
// In Japanese every space is tied: lines break only at BudouX phrase boundaries (<wbr>), so neither "AI" nor
// "Claude Code" is split or left alone at a line end.
// A break point never starts a line with the space: <wbr> moves to after it.
// Only a space between Latin and Japanese is tied ("AI エージェント"); a space between two Latin words
// ("Tatsuya Shimomoto") stays an ordinary break point.
const CJK = '\\u3000-\\u30ff\\u3400-\\u9fff\\uff00-\\uffef';
const tieMixed = (h) => h
  .replace(new RegExp(` (?=(?:<wbr>)?[${CJK}])|(?<=[${CJK}](?:<wbr>)?) `, 'gu'), '&nbsp;')
  .replace(/<wbr>&nbsp;/g, '&nbsp;<wbr>');

function txt(s, lang) {
  // Brackets stay with their words: no line ends on （ or starts with ）, and none starts with （ either, since the
  // bracket's built-in half space would read as an indent (a word joiner holds it to the word before).
  if (lang === 'ja') return tieMixed(budoux.parse(s).map(esc).join('<wbr>')).replace(/<wbr>([（「『【〔])/g, '$1').replace(/([^\s>;])([（「『【〔])/g, '$1\u2060$2').replace(/([（「『【〔])<wbr>/g, '$1').replace(/<wbr>([）」』】〕、。])/g, '$1');
  return esc(s);
}

// A Japanese title turns over at its own joints when it does not fit, not at the last phrase that fits
// (「…尽きたあと、／ひとつだけ…」, not 「…尽きた／あと、…」): after 、 and 。, and before a dash, which starts the
// next clause. Each clause is an inline-block; one longer than the line still breaks inside at its BudouX phrases.
// Latin words in a title stay together ("LLM judge", "memory RAG").
function clauses(h, lang) {
  if (lang !== 'ja') return h;
  const tied = h
    .replace(/(?<=[A-Za-z0-9.+#-]) (?=[A-Za-z0-9])/g, '&nbsp;')
    .replace(/—(?:&nbsp;| )/g, '—&nbsp;');
  const parts = tied
    .split(/(?<=[、。])(?:<wbr>)?|(?<=&nbsp;| )(?:<wbr>)?(?<!—)(?=—)|(?<![\s;—])(?:<wbr>)?(?=—)/)
    .filter(Boolean);
  if (parts.length < 2) return h;
  // The 、 and 。 stay outside the underline, as in the root sentence, so a line ending on one has no underlined blank half.
  return parts
    .map((x) => {
      // A space before a dash ends the clause outside the underline, so it falls away at a line end.
      const m = x.match(/^(.*?)([、。]?)((?:&nbsp;| )?)$/s);
      return `<span class="clause"><span class="u">${m[1]}</span>${m[2]}</span>${m[3] ? ' ' : ''}`;
    })
    .join('<wbr>');
}

// Running text in English: no paragraph ends on a short last line.
function prose(s, lang) {
  if (lang === 'ja') return txt(s, lang);
  // Tie words onto the last one until the tail is at least 8 letters, so it never stands as a short last line.
  const w = esc(s).split(' ');
  let n = 1;
  while (n < Math.min(4, w.length) && w.slice(-n).join('').length < 8) n++;
  // A nowrap span, not &nbsp;: Charter has no no-break space glyph, so &nbsp; falls back to a wider one.
  return n > 1 ? [...w.slice(0, -n), `<span class="tie">${w.slice(-n).join(' ')}</span>`].join(' ') : w.join(' ');
}

const paths = {
  en: { home: '/', about: '/about/', writing: '/writing/' },
  ja: { home: '/ja/', about: '/ja/about/', writing: '/ja/writing/' },
};
const other = (lang) => (lang === 'en' ? 'ja' : 'en');
const ogLocale = { en: 'en_US', ja: 'ja_JP' };

// ---------- Sentence ----------
// The root text with its phrases linked. The plain text must equal the bio (EN) exactly.
function sentence(c, base = '') {
  // English: a line may turn over only between the phrases of `phrasing` ("|"); every other space is tied.
  // [ ... ] marks phrases kept together on one line when they fit (an inline-block), like the Japanese "keep".
  let breakAt = null;
  const opens = new Set();
  const closes = new Set();
  if (c.phrasing) {
    if (c.phrasing.replace(/[[\]]/g, '').replaceAll('|', ' ') !== c.bio) throw new Error(`phrasing drift:\n${c.phrasing}\n${c.bio}`);
    breakAt = new Set();
    let i = 0;
    for (const ch of c.phrasing) {
      if (ch === '[') opens.add(i);
      else if (ch === ']') closes.add(i);
      else { if (ch === '|') breakAt.add(i); i++; }
    }
  }
  let offset = 0;
  const parts = c.sentence.map((p) => {
    let t;
    let lead = ''; // a group that opens where this part starts, kept outside its link
    if (breakAt) {
      const chars = [...p.text];
      if (p.link && chars.some((_, k) => (k > 0 && opens.has(offset + k)) || closes.has(offset + k))) throw new Error(`phrasing group splits the link "${p.text}"`);
      t = chars.map((ch, k) => (k > 0 && opens.has(offset + k) ? '\uE000keep\uE002' : '') + (closes.has(offset + k) ? '\uE001' : '') + (ch === ' ' && !breakAt.has(offset + k) ? '&nbsp;' : esc(ch))).join('');
      if (opens.has(offset)) lead = '\uE000keep\uE002';
      offset += chars.length;
      if (closes.has(offset) && offset === c.bio.length) t += '\uE001';
    } else {
      // A linked phrase never breaks inside (no <wbr>), so its underline stays on one line.
      t = p.link ? (c.lang === 'ja' ? tieMixed(esc(p.text)) : esc(p.text)) : txt(p.text, c.lang);
    }
    // Japanese: a phrase may break after 、 even when the next phrase is a link (BudouX sees each part alone).
    if (c.lang === 'ja' && !p.link) t = t.replace(/、$/, '、<wbr>');
    t = lead + (p.link ? `<a href="${base}${p.link}">${t}</a>` : t);
    // Optional groups (Japanese): "keep" moves to the next line whole; "tail" always takes its own line.
    if (p.open) t = `\uE000${p.open}\uE002${t}`;
    if (p.close) t = t.endsWith('<wbr>') ? `${t.slice(0, -5)}\uE001<wbr>` : `${t}\uE001`;
    return t;
  });
  // Each sentence starts its own line, in both languages.
  let html = parts.join('');
  if (c.lang === 'en') {
    const ss = html.split(/\. (?=[A-Z])/);
    html = ss.map((x, i) => `<span class="line">${x}${i < ss.length - 1 ? '.' : ''}</span>`).join(' ');
  }
  if (c.lang === 'ja') html = html.split(/(?<=。)(?!\uE001)|(?<=。\uE001)/).filter((x) => x.replace(/<wbr>/g, '')).map((x) => `<span class="line">${x.replace(/^<wbr>/, '')}</span>`).join('');
  html = html.replace(/\uE000(\w+)\uE002/g, '<span class="$1">').replace(/\uE001/g, '</span>');
  const plain = c.sentence.map((p) => p.text).join('');
  if (c.lang === 'en' && plain !== c.bio) throw new Error(`bio drift:\n${plain}\n${c.bio}`);
  return { html, plain };
}

// ---------- Pieces ----------
function head(c, page, { title, description, path, jsonLd }) {
  const lang = c.lang;
  const alt = paths[other(lang)][page];
  const og = `${ORIGIN}/og/${lang}.png`;
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="author" content="${esc(c.name)}">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="${tokens.light.background}" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="${tokens.dark.background}" media="(prefers-color-scheme: dark)">
<link rel="canonical" href="${ORIGIN}${path}">
<link rel="alternate" hreflang="${lang}" href="${ORIGIN}${path}">
<link rel="alternate" hreflang="${other(lang)}" href="${ORIGIN}${alt}">
<link rel="alternate" hreflang="x-default" href="${ORIGIN}${paths.en[page]}">
<meta property="og:type" content="${page === 'home' ? 'profile' : 'website'}">
<meta property="og:site_name" content="${esc(c.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${ORIGIN}${path}">
<meta property="og:image" content="${og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(c.name)}: ${esc(sentence(c).plain)}">
<meta property="og:locale" content="${ogLocale[lang]}">
<meta property="og:locale:alternate" content="${ogLocale[other(lang)]}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@shimo4228">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/fonts/${design.typography.display.file}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/site.css">
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>\n` : ''}</head>
<body>
<a class="skip-link" href="#main">${esc(c.skip)}</a>
`;
}

function nav(c, page) {
  const p = paths[c.lang];
  const o = other(c.lang);
  const items = [];
  const here = (k) => (page === k ? ' aria-current="page"' : '');
  items.push(`<li><a href="${p.home}"${here('home')}>${txt(c.nav.home, c.lang)}</a></li>`);
  items.push(`<li><a href="${p.writing}"${here('writing')}>${txt(c.nav.writing, c.lang)}</a></li>`);
  items.push(`<li><a href="${p.about}"${here('about')}>${txt(c.nav.about, c.lang)}</a></li>`);
  items.push(`<li><a href="${paths[o][page] || paths[o].home}" hreflang="${o}" lang="${o}">${esc(c.nav.lang)}</a></li>`);
  const label = c.lang === 'ja' ? 'サイト' : 'Site';
  return `<header class="site-head center"><nav class="site-nav" aria-label="${label}">
  <ul role="list" class="cluster">${items.join('')}</ul>
</nav></header>`;
}

function footer(c) {
  const f = c.footer;
  const scriptTag = BEACON
    ? `\n<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='${JSON.stringify({ token: BEACON })}'></script>`
    : '';
  // Code, records and X: the profiles that are the same person, on every page and marked rel="me".
  const me = c.entrances.groups
    .filter((g) => g.place === 'footer')
    .flatMap((g) => g.items)
    .map((i) => {
      const what = i.what && /Sakamaki/.test(i.what) ? (c.lang === 'ja' ? '（Sakamaki）' : ' (Sakamaki)') : '';
      return `<li><a href="${esc(i.href)}" rel="me"${hreflangAttr(i.hreflang)}>${esc(i.name)}${txt(what, c.lang)}</a></li>`;
    })
    .join('');
  return `<footer class="site-foot center">
  <ul role="list" class="cluster">
    ${me}
    <li><a href="${f.hubHref}">${txt(f.hub, c.lang)}</a></li>
    <li><a href="${f.sourceHref}">${txt(f.source, c.lang)}</a></li>
  </ul>
</footer>${scriptTag}
</body>
</html>
`;
}

const hreflangAttr = (h) => (h ? ` hreflang="${h}"` : '');

function entrances(c) {
  const e = c.entrances;
  const label = esc(e.label);
  return `<nav class="entrances" aria-labelledby="entrances-h">
  <h2 id="entrances-h" class="visually-hidden">${label}</h2>
  <dl class="entrance-groups">
    ${e.groups
      .filter((g) => g.place === 'writing')
      .map(
        (g) => `<div class="entrance-group">
      <dt>${txt(g.label, c.lang)}</dt>
      ${g.items
        .map(
          (i) =>
            `<dd><a href="${esc(i.href)}" class="entrance" rel="me"${hreflangAttr(i.hreflang)}>${esc(i.name)}</a>${i.what ? `<span class="entrance-what">${txt(i.what, c.lang)}</span>` : ''}</dd>`,
        )
        .join('\n      ')}
    </div>`,
      )
      .join('\n    ')}
  </dl>
</nav>`;
}

function work(w, c) {
  const forName = c.lang === 'ja' ? (n) => `（${esc(n)}）` : (n) => ` for ${esc(n)}`;
  const links = w.links
    .map((l) => `<li><a href="${esc(l.href)}">${txt(l.label, c.lang)}<span class="visually-hidden">${forName(w.name)}</span></a></li>`)
    .join('');
  return `<li class="work stack" id="${w.id}">
  <h3 class="work-name"><a href="${esc(w.links[0].href)}">${clauses(txt(w.name, c.lang), c.lang)}</a></h3>
  <p class="work-line">${prose(w.line, c.lang)}</p>
  <ul role="list" class="work-links cluster">${links}</ul>
</li>`;
}

function section(s, c) {
  return `<section class="gloss" id="${s.id}" aria-labelledby="${s.id}-h">
  <h2 id="${s.id}-h" class="section-title">${[].concat(s.quote).map((q) => `<q>${txt(q, c.lang)}</q>`).join('')}</h2>
  ${s.intro ? `<p class="section-intro">${prose(s.intro, c.lang)}</p>\n  ` : ''}<ul role="list" class="works stack">
    ${s.works.map((w) => work(w, c)).join('\n    ')}
  </ul>
</section>`;
}

// ---------- Pages ----------
function personLd(c) {
  const en = content.en;
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${ORIGIN}${paths[c.lang].home}#page`,
    url: `${ORIGIN}${paths[c.lang].home}`,
    inLanguage: c.lang,
    mainEntity: {
      '@type': 'Person',
      '@id': ORCID,
      name: en.name,
      alternateName: en.handle,
      description: en.bio,
      url: `${ORIGIN}/`,
      sameAs: [
        'https://github.com/shimo4228',
        ORCID,
        'https://scholar.google.com/citations?user=56_p8vEAAAAJ',
        'https://openalex.org/A5130593171',
        'https://huggingface.co/Shimo4228',
        'https://zenn.dev/shimo4228',
        'https://dev.to/shimo4228',
        'https://note.com/shimo4228',
        'https://shimo4228.substack.com',
        'https://x.com/shimo4228',
        'https://note.com/sakamaki4228',
        'https://x.com/sakamakiuzutaro',
        HUB,
      ],
    },
  };
}

function home(c) {
  const s = sentence(c);
  const description = c.lang === 'en' ? c.bio : s.plain;
  return `${head(c, 'home', { title: c.name, description, path: paths[c.lang].home, jsonLd: personLd(c) })}${nav(c, 'home')}
<main id="main" class="center page">
  <section class="intro" aria-labelledby="name">
    <h1 id="name" class="name">${esc(c.name)}</h1>
    <p class="sentence">${s.html}</p>
  </section>
  ${c.sections.map((x) => section(x, c)).join('\n  ')}
</main>
${footer(c)}`;
}

function about(c) {
  const a = c.about;
  const title = c.lang === "ja" ? `${c.name} について` : `About ${c.name}`;
  // A fact links only its noun (linkText), not the whole sentence.
  const value = (f) =>
    f.linkText
      ? `${txt(f.before, c.lang)}<a href="${esc(f.href)}">${c.lang === 'ja' ? tieMixed(esc(f.linkText)) : esc(f.linkText)}</a>${prose(f.after, c.lang)}`
      : f.href
        ? `<a href="${esc(f.href)}">${esc(f.value)}</a>`
        : f.lang && f.lang !== c.lang ? esc(f.value) : prose(f.value, c.lang);
  const facts = a.facts
    .map((f) => `<div class="fact"><dt>${txt(f.label, c.lang)}</dt><dd${f.lang && f.lang !== c.lang ? ` lang="${f.lang}"` : ''}>${value(f)}</dd></div>`)
    .join('\n    ');
  return `${head(c, 'about', { title, description: a.paragraphs[0], path: paths[c.lang].about })}${nav(c, 'about')}
<main id="main" class="center page">
  <h1 id="about-h" class="visually-hidden">${esc(a.title)}</h1>
  <section class="gloss about" aria-labelledby="about-h">
    <p class="section-title"><a href="${paths[c.lang].home}">${esc(c.name)}</a></p>
    <div class="about-body">
      ${a.paragraphs.map((p) => `<p class="lead">${prose(p, c.lang)}</p>`).join('\n      ')}
      <ul role="list" class="about-next cluster">${a.next.map((n) => `<li><a href="${n.href}">${txt(n.text, c.lang)}</a></li>`).join('')}</ul>
    </div>
  </section>
  <dl class="facts">
    ${facts}
  </dl>
</main>
${footer(c)}`;
}

// The writing list: one year per row of the rail, each piece a link that leaves (date, title, platform).
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const shortDate = (d, lang) => (lang === 'ja' ? `${+d.slice(5, 7)}月${+d.slice(8, 10)}日` : `${MONTHS[+d.slice(5, 7) - 1]} ${+d.slice(8, 10)}`);
const where = (e, lang) => (e.platform === 'note' && e.url.includes('/sakamaki4228/') ? (lang === 'ja' ? 'note（Sakamaki 名義）' : 'note (as Sakamaki)') : e.platform);

function writing(c) {
  const w = c.writing;
  const lang = c.lang;
  const items = published.filter((i) => i[lang]);
  const years = [...new Set(items.map((i) => i.date.slice(0, 4)))];
  const row = (i) => {
    const e = i[lang];
    return `<li class="piece"><a class="piece-title" href="${esc(e.url)}">${lang === 'ja' ? clauses(txt(e.title, lang), lang) : esc(e.title)}</a><time class="piece-date" datetime="${i.date}">${shortDate(i.date, lang)}</time><span class="piece-where">${txt(where(e, lang), lang)}</span></li>`;
  };
  const groups = years
    .map(
      (y) => `<section class="year" aria-labelledby="y${y}">
    <h2 id="y${y}" class="year-label">${y}</h2>
    <ul role="list" class="pieces">
      ${items.filter((i) => i.date.startsWith(y)).map(row).join('\n      ')}
    </ul>
  </section>`,
    )
    .join('\n  ');
  const o = other(lang);
  return `${head(c, 'writing', { title: lang === 'ja' ? `${c.name} が書いたもの` : `Writing by ${c.name}`, description: w.intro, path: paths[lang].writing })}${nav(c, 'writing')}
<main id="main" class="center page">
  <section class="gloss about writing-head" aria-labelledby="writing-h">
    <p class="section-title"><a href="${paths[lang].home}">${esc(c.name)}</a></p>
    <div class="about-body">
      <h1 id="writing-h" class="writing-title">${txt(w.title, lang)}</h1>
      <p class="section-intro">${prose(w.intro, lang)}</p>
    </div>
  </section>
  ${entrances(c)}
  <div class="years">
  ${groups}
  </div>
  <ul role="list" class="writing-more cluster">
    <li><a href="${paths[o].writing}" hreflang="${o}">${txt(w.other, lang)}</a></li>
    <li><a href="${esc(w.fullHref)}">${txt(w.full, lang)}</a></li>
  </ul>
</main>
${footer(c)}`;
}

function notFound() {
  const en = content.en;
  const ja = content.ja;
  return `${head(en, 'home', { title: en.notFound.title, description: en.notFound.body, path: '/404.html' })
    .replace(/<link rel="canonical"[^>]*>\n/, '')
    .replace(/<link rel="alternate"[^>]*>\n/g, '')
    .replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<meta name="robots" content="noindex">')}${nav(en, 'notfound')}
<main id="main" class="center page">
  <section class="lost" aria-labelledby="lost-en">
    <h1 id="lost-en" class="lost-title">${esc(en.notFound.title)}</h1>
    <p>${esc(en.notFound.body)}</p>
    <p class="sentence sentence--small">${sentence(en, '/').html}</p>
  </section>
  <section class="lost" lang="ja" aria-labelledby="lost-ja">
    <h2 id="lost-ja" class="lost-title">${txt(ja.notFound.title, 'ja')}</h2>
    <p>${txt(ja.notFound.body, 'ja')}</p>
    <p class="sentence sentence--small">${sentence(ja, '/ja/').html}</p>
  </section>
</main>
${footer(en)}`;
}

// ---------- Icons ----------
// Newsreader's opening quotation mark (U+201C), drawn from the font's outline, on the accent.
const QUOTE_PATH =
  'M392 1300Q295 1259 258.5 1217.5Q222 1176 222 1131Q222 1102 242.5 1081.5Q263 1061 289.5 1045.5Q316 1030 336.5 1016.5Q357 1003 357 988Q357 934 322.0 899.5Q287 865 228 865Q169 865 129.0 906.0Q89 947 89 1023Q89 1100 114.5 1160.0Q140 1220 199.5 1270.5Q259 1321 359 1367ZM742 1300Q645 1259 608.5 1217.5Q572 1176 572 1131Q572 1102 592.5 1081.5Q613 1061 639.5 1045.5Q666 1030 686.5 1016.5Q707 1003 707 988Q707 934 672.0 899.5Q637 865 578 865Q519 865 479.0 906.0Q439 947 439 1023Q439 1100 464.5 1160.0Q490 1220 549.5 1270.5Q609 1321 709 1367Z';

function favicon() {
  const s = 26 / 653;
  const path = `<path transform="translate(16 15.5) scale(${s.toFixed(5)} -${s.toFixed(5)}) translate(-415.5 -1116)" d="${QUOTE_PATH}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><style>rect{fill:${tokens.light.background}}path{fill:${tokens.light.accent}}@media (prefers-color-scheme:dark){rect{fill:${tokens.dark.background}}path{fill:${tokens.dark.accent}}}</style><rect width="32" height="32" rx="7"/>${path}</svg>\n`;
}

// ---------- Write ----------
rmSync(dist, { recursive: true, force: true });
const out = (p, s) => {
  mkdirSync(dirname(join(dist, p)), { recursive: true });
  writeFileSync(join(dist, p), s);
};

const pages = new Map();
for (const lang of ['en', 'ja']) {
  pages.set(`${paths[lang].home.slice(1)}index.html`, home(content[lang]));
  pages.set(`${paths[lang].about.slice(1)}index.html`, about(content[lang]));
  pages.set(`${paths[lang].writing.slice(1)}index.html`, writing(content[lang]));
}
pages.set('404.html', notFound());

// The Japanese display face, cut down to the kanji, kana and punctuation the display roles use.
const DISPLAY_ROLES = ['name', 'sentence', 'section-title', 'lead', 'lost-title', 'writing-title'];
function displayText(html) {
  let text = '';
  const open = /<([a-z0-9]+)\b[^>]*\bclass="([^"]*)"[^>]*>/g;
  let m;
  while ((m = open.exec(html))) {
    if (!m[2].split(/\s+/).some((c) => DISPLAY_ROLES.includes(c))) continue;
    const tag = new RegExp(`<(/?)${m[1]}\\b[^>]*>`, 'g');
    tag.lastIndex = open.lastIndex;
    let depth = 1;
    let t;
    while (depth && (t = tag.exec(html))) depth += t[1] ? -1 : 1;
    text += html.slice(open.lastIndex, t ? t.index : html.length).replace(/<[^>]*>/g, '');
    open.lastIndex = tag.lastIndex;
  }
  return text;
}
const ja = design.typography.displayJa;
// 「」『』 come from <q> generated content, which the page text never shows, so they are added by hand.
const jaChars = [...new Set([...[...pages.values()].map(displayText).join('') + '「」『』'].filter((ch) => ch.codePointAt(0) >= 0x2e80))].sort();
const jaFont = await subsetFont(readFileSync(join(root, ja.source)), jaChars.join(''), { targetFormat: 'woff2' });
const jaFile = `shippori-mincho-display.${createHash('sha256').update(jaFont).digest('hex').slice(0, 10)}.woff2`;
const jaRange = jaChars.map((ch) => `U+${ch.codePointAt(0).toString(16).toUpperCase()}`).join(', ');
const jaFace = `/* ${jaChars.length} characters from the display roles, subset from ${ja.source} (SIL OFL 1.1, fonts/OFL.txt). */
@font-face {
  font-family: "${ja.family}";
  src: url("/fonts/${jaFile}") format("woff2");
  font-weight: ${ja.weight};
  font-style: normal;
  font-display: swap;
  unicode-range: ${jaRange};
}
`;

out('site.css', tokens.css + jaFace + '\n' + readFileSync(join(here, 'site.css'), 'utf8'));
mkdirSync(join(dist, 'fonts'), { recursive: true });
copyFileSync(join(root, 'node_modules/@fontsource/newsreader/files', design.typography.display.file), join(dist, 'fonts', design.typography.display.file));
writeFileSync(join(dist, 'fonts', jaFile), jaFont);
copyFileSync(join(root, 'site/fonts/ShipporiMincho-OFL.txt'), join(dist, 'fonts', 'OFL.txt'));
for (const [p, html] of pages) out(p, html);
out('favicon.svg', favicon());
out(
  'robots.txt',
  `# The user site's robots.txt also covers the hub at /shimo4228/. Nothing is blocked.
User-agent: *
Allow: /

Sitemap: ${ORIGIN}/sitemap.xml
Sitemap: ${ORIGIN}/shimo4228/sitemap.xml
`,
);
const urlEntry = (page) => ['en', 'ja']
  .map(
    (lang) => `  <url>
    <loc>${ORIGIN}${paths[lang][page]}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${ORIGIN}${paths.en[page]}"/>
    <xhtml:link rel="alternate" hreflang="ja" href="${ORIGIN}${paths.ja[page]}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${ORIGIN}${paths.en[page]}"/>
  </url>`,
  )
  .join('\n');
out(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntry('home')}
${urlEntry('about')}
${urlEntry('writing')}
</urlset>
`,
);
out('.nojekyll', '');
// Google Search Console ownership file for the https://shimo4228.github.io/ property (2026-10-18). Keep it:
// deleting it un-verifies the property. Google's file content is this exact line.
out('googleb056734478b4d8a5.html', 'google-site-verification: googleb056734478b4d8a5.html');
console.log(`built dist/ (Japanese display face: ${jaChars.length} characters, ${(jaFont.length / 1024).toFixed(1)} KB)`);
