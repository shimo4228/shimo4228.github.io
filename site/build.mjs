// Builds the site into dist/: /, /about/, /ja/, /ja/about/, /404.html, robots.txt, sitemap.xml, icons.
// Content: content/site.{en,ja}.json. Design values: DESIGN.md (via site/tokens.mjs).
// The Cloudflare Web Analytics beacon is the only script on the site. The token is public (it ships in every page);
// CF_BEACON_TOKEN overrides it, and an empty value builds without the beacon.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
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
const budoux = loadDefaultJapaneseParser();

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Text for display. Japanese gets BudouX phrase breaks; English gets non-breaking spaces where a line must not end.
// In Japanese every space is tied: lines break only at BudouX phrase boundaries (<wbr>), so neither "AI" nor
// "Claude Code" is split or left alone at a line end.
// A break point never starts a line with the space: <wbr> moves to after it.
const tieMixed = (h) => h.replace(/ /g, '&nbsp;').replace(/<wbr>&nbsp;/g, '&nbsp;<wbr>');

function txt(s, lang) {
  // Brackets stay with their words: no line ends on （ or starts with ）, and none starts with （ either, since the
  // bracket's built-in half space would read as an indent (a word joiner holds it to the word before).
  if (lang === 'ja') return tieMixed(budoux.parse(s).map(esc).join('<wbr>')).replace(/<wbr>([（「『【〔])/g, '$1').replace(/([^\s>;])([（「『【〔])/g, '$1\u2060$2').replace(/([（「『【〔])<wbr>/g, '$1').replace(/<wbr>([）」』】〕、。])/g, '$1');
  return esc(s);
}

// Running text in English: no paragraph ends on a short last line.
function prose(s, lang) {
  if (lang === 'ja') return txt(s, lang);
  // Tie words onto the last one until the tail is at least 8 letters, so it never stands as a short last line.
  const w = esc(s).split(' ');
  let n = 1;
  while (n < Math.min(4, w.length) && w.slice(-n).join('').length < 8) n++;
  return n > 1 ? [...w.slice(0, -n), w.slice(-n).join('&nbsp;')].join(' ') : w.join(' ');
}

const paths = {
  en: { home: '/', about: '/about/' },
  ja: { home: '/ja/', about: '/ja/about/' },
};
const other = (lang) => (lang === 'en' ? 'ja' : 'en');
const ogLocale = { en: 'en_US', ja: 'ja_JP' };

// ---------- Sentence ----------
// The root text with its phrases linked. The plain text must equal the bio (EN) exactly.
function sentence(c, base = '') {
  const parts = c.sentence.map((p) => {
    // A linked phrase never breaks inside (no <wbr>), so its underline stays on one line.
    let t = p.link ? (c.lang === 'ja' ? tieMixed(esc(p.text)) : esc(p.text)) : txt(p.text, c.lang);
    if (c.lang === 'en') t = t.replace('the age of AI.', 'the&nbsp;age&nbsp;of&nbsp;AI.');
    // Japanese: a phrase may break after 、 even when the next phrase is a link (BudouX sees each part alone).
    if (c.lang === 'ja' && !p.link) t = t.replace(/、$/, '、<wbr>');
    return p.link ? `<a href="${base}${p.link}">${t}</a>` : t;
  });
  // Each sentence starts its own line, in both languages.
  let html = parts.join('');
  if (c.lang === 'en') {
    const ss = html.split(/\. (?=[A-Z])/);
    html = ss.map((x, i) => `<span class="line">${x}${i < ss.length - 1 ? '.' : ''}</span>`).join(' ');
  }
  if (c.lang === 'ja') html = html.split('。').filter((x) => x.replace(/<wbr>/g, '')).map((x) => `<span class="line">${x.replace(/^<wbr>/, '')}。</span>`).join('');
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
  items.push(`<li><a href="${paths[o][page] || paths[o].home}" hreflang="${o}" lang="${o}">${esc(c.nav.lang)}</a></li>`);
  items.push(`<li><a href="${p.about}"${page === 'about' ? ' aria-current="page"' : ''}>${txt(c.nav.about, c.lang)}</a></li>`);
  const label = c.lang === 'ja' ? 'サイト' : 'Site';
  return `<header class="site-head center"><nav class="site-nav" aria-label="${label}">
  <ul role="list" class="cluster">${items.join('')}</ul>
</nav></header>`;
}

function footer(c) {
  const f = c.footer;
  const scriptTag = BEACON
    ? `\n<script type="module" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='${JSON.stringify({ token: BEACON })}'></script>`
    : '';
  return `<footer class="site-foot center">
  <ul role="list" class="cluster">
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
  <p class="entrance-index"><a href="${esc(e.index.href)}">${txt(e.index.name, c.lang)}</a></p>
</nav>`;
}

function work(w, c) {
  const forName = c.lang === 'ja' ? (n) => `（${esc(n)}）` : (n) => ` for ${esc(n)}`;
  const links = w.links
    .map((l) => `<li><a href="${esc(l.href)}">${txt(l.label, c.lang)}<span class="visually-hidden">${forName(w.name)}</span></a></li>`)
    .join('');
  return `<li class="work stack" id="${w.id}">
  <h3 class="work-name"><a href="${esc(w.links[0].href)}">${txt(w.name, c.lang)}</a></h3>
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
    ${entrances(c)}
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
      <p class="about-next"><a href="${a.next.href}">${txt(a.next.text, c.lang)}</a></p>
    </div>
  </section>
  <dl class="facts">
    ${facts}
  </dl>
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

out('site.css', tokens.css + '\n' + readFileSync(join(here, 'site.css'), 'utf8'));
mkdirSync(join(dist, 'fonts'), { recursive: true });
copyFileSync(join(root, 'node_modules/@fontsource/newsreader/files', design.typography.display.file), join(dist, 'fonts', design.typography.display.file));
for (const lang of ['en', 'ja']) {
  out(`${paths[lang].home.slice(1)}index.html`, home(content[lang]));
  out(`${paths[lang].about.slice(1)}index.html`, about(content[lang]));
}
out('404.html', notFound());
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
</urlset>
`,
);
out('.nojekyll', '');
console.log('built dist/');
