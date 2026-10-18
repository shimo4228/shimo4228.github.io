// Builds the three prototype directions from content/proto.en.json.
// Output: proto/out/{a,b,c}/index.html + css, shared fonts.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { directions, tokensCss, palette } from './tokens.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const c = JSON.parse(readFileSync(join(root, 'content/proto.en.json'), 'utf8'));
const out = join(here, 'out');
rmSync(out, { recursive: true, force: true });

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const a = (href, text, attrs = '') => `<a href="${esc(href)}"${attrs}>${text}</a>`;
const hidden = (t) => `<span class="visually-hidden">${t}</span>`;

const fontSrc = {
  'newsreader-latin-400-normal.woff2': '@fontsource/newsreader/files/',
  'schibsted-grotesk-latin-600-normal.woff2': '@fontsource/schibsted-grotesk/files/',
  'jetbrains-mono-latin-400-normal.woff2': '@fontsource/jetbrains-mono/files/',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': 'https://orcid.org/0009-0002-6168-4162',
  name: c.name,
  alternateName: c.handle,
  description: c.bio,
  url: 'https://shimo4228.github.io/',
  sameAs: [
    'https://github.com/shimo4228',
    'https://orcid.org/0009-0002-6168-4162',
    'https://huggingface.co/Shimo4228',
    'https://zenn.dev/shimo4228',
    'https://dev.to/shimo4228',
    'https://note.com/shimo4228',
    'https://shimo4228.substack.com',
    'https://x.com/shimo4228',
  ],
};

// "the age of AI." is tied so the last line never holds a short "age of AI." or a lone "AI."
const tie = (html) => html.replace('the age of AI.', 'the&nbsp;age of&nbsp;AI.');
const plainOf = (html) => html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ');
const checkBio = (html) => {
  if (plainOf(html) !== c.bio) throw new Error(`bio drift:\n${plainOf(html)}\n${c.bio}`);
  return html;
};

function head(d, key) {
  const f = d.fonts[0];
  const light = palette(d.colors, d.light).background;
  const dark = palette(d.colors, d.dark).background;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(c.name)}</title>
<meta name="description" content="${esc(c.bio)}">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="${light}" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="${dark}" media="(prefers-color-scheme: dark)">
<link rel="canonical" href="https://shimo4228.github.io/">
<link rel="alternate" hreflang="en" href="https://shimo4228.github.io/">
<link rel="alternate" hreflang="ja" href="https://shimo4228.github.io/ja/">
<link rel="alternate" hreflang="x-default" href="https://shimo4228.github.io/">
<link rel="preload" href="../fonts/${f.file}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="../shared/base.css">
<link rel="stylesheet" href="style.css">
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body class="dir-${key}">
<a class="skip-link" href="#main">Skip to content</a>
`;
}

function fontFace(d) {
  return d.fonts
    .map(
      (f) => `@font-face {
  font-family: "${f.family}";
  src: url("../fonts/${f.file}") format("woff2");
  font-weight: ${f.weight};
  font-style: ${f.style};
  font-display: swap;
}`,
    )
    .join('\n');
}

const nav = () => `<nav class="site-nav" aria-label="Site">
  <ul role="list" class="cluster">
    <li>${a(c.nav.langHref, esc(c.nav.lang), ' hreflang="ja" lang="ja"')}</li>
    <li>${a('/about/', esc(c.nav.about))}</li>
  </ul>
</nav>`;

// Link lists under each work. A hidden suffix names the work for screen-reader link lists.
const links = (w) =>
  `<ul role="list" class="work-links cluster">${w.links.map((l) => `<li>${a(l.href, `${esc(l.label)}${hidden(` for ${esc(w.name)}`)}`)}</li>`).join('')}</ul>`;

// The name links to the work's main destination (its first link). With asks, a project that carries
// one of the three questions says so in text (direction c, where the map draws the same relation).
const work = (w, o = {}) => `<li class="work stack" id="${w.id}">
  <h3 class="work-name">${a(w.links[0].href, esc(w.name))}</h3>
  ${o.asks && w.questionText ? `<p class="work-asks"><span class="work-asks-label">Asks</span> ${esc(w.questionText)}</p>
  ` : ''}<p class="work-line">${esc(w.line)}</p>
  ${links(w)}
</li>`;

const sectionTitle = (id, text, quoted) =>
  `<h2 id="${id}-h" class="section-title">${quoted ? `<q>${esc(text)}</q>` : esc(text)}</h2>`;

const practice = (p, quoted = false, o = {}) => `<section class="practice practice--${p.id}" id="${p.id}" aria-labelledby="${p.id}-h">
  ${sectionTitle(p.id, p.title, quoted)}
  <ul role="list" class="works stack">${p.works.map((w) => work(w, o)).join('\n')}</ul>
</section>`;

const meeting = (o = {}) => `<section class="meeting" id="${c.meeting.id}" aria-labelledby="${c.meeting.id}-h">
  ${sectionTitle(c.meeting.id, c.meeting.title, false)}
  <p class="meeting-intro">${esc(c.meeting.intro)}</p>
  <ul role="list" class="works stack">${c.meeting.works.map((w) => work(w, o)).join('\n')}</ul>
</section>`;

// Entrances: the platforms, grouped by language, right under the introduction.
const entrances = () => `<nav class="entrances" aria-labelledby="entrances-h">
  <h2 id="entrances-h" class="visually-hidden">${esc(c.entrances.label)}</h2>
  <dl class="entrance-groups">
    ${c.entrances.groups
      .map(
        (g) => `<div class="entrance-group">
      <dt>${esc(g.label)}</dt>
      ${g.items
        .map((i) => `<dd>${a(i.href, esc(i.name), ' class="entrance"')}${i.what ? `<span class="entrance-what">${esc(i.what)}</span>` : ''}</dd>`)
        .join('\n      ')}
    </div>`,
      )
      .join('\n    ')}
  </dl>
  <p class="entrance-index">${a(c.entrances.index.href, esc(c.entrances.index.name))}</p>
</nav>`;

const footer = () => `<footer class="site-foot center">
  <ul role="list" class="cluster">${c.footer.map((f) => `<li>${a(f.href, esc(f.label))}</li>`).join('')}</ul>
</footer>
</body>
</html>
`;

const allWorks = () => [...c.practices.flatMap((p) => p.works), ...c.meeting.works];
const questionWork = (q) => allWorks().find((w) => w.question === q);
const questionLink = (q) => a(`#${questionWork(q).id}`, esc(q));

// Direction A: the canonical bio with its phrases linked to where the page answers them.
// The two practices go to their sections; each of the three themes goes to the project that carries it.
const sentence = () =>
  checkBio(
    `${a('#agents', esc(c.bioParts.agents))}, and ${a('#mind', esc(c.bioParts.mind))}. Exploring ${questionLink('judgment')}, ${questionLink('authorship')}, and ${questionLink('human attention')} in the&nbsp;age of&nbsp;AI.`,
  );

// Direction B: the two practice clauses are underlined in their line colours, so the bio is the key to the lines.
const keyedBio = () =>
  checkBio(
    `${a('#agents', esc(c.bioParts.agents), ' class="key key--agents"')}, and ${a('#mind', esc(c.bioParts.mind), ' class="key key--mind"')}. Exploring ${esc(c.bioParts.questions)} in the&nbsp;age of&nbsp;AI.`,
  );

// ---------- Direction A: the sentence, glossed ----------
function pageA(d) {
  return `${head(d, 'a')}<header class="site-head center">${nav()}</header>
<main id="main" class="center page">
  <section class="intro" aria-labelledby="name">
    <h1 id="name" class="name">${esc(c.name)}</h1>
    <p class="sentence">${sentence()}</p>
    ${entrances()}
  </section>
  ${c.practices.map((p) => practice(p, true)).join('\n  ')}
  ${meeting()}
</main>
${footer()}`;
}

// ---------- Direction B: two paths ----------
function pageB(d) {
  return `${head(d, 'b')}<header class="site-head center">${nav()}</header>
<main id="main" class="page">
  <section class="intro center" aria-labelledby="name">
    <h1 id="name" class="name">${esc(c.name)}</h1>
    <p class="bio">${keyedBio()}</p>
    ${entrances()}
  </section>
  <div class="paths center">
    ${c.practices.map((p) => practice(p)).join('\n    ')}
    <div class="merge" aria-hidden="true"><span class="merge-left"></span><span class="merge-right"></span><span class="merge-join"></span></div>
  </div>
  <div class="center">${meeting()}</div>
</main>
${footer()}`;
}

// ---------- Direction C: the question map ----------
// Only the true edges: each question links to the project that asks it. Question wording lives in
// site.en.json (questionText / questionLines), so the map and the "Asks" lines come from one source.
const tops = [
  { id: 'agents', lines: ['Building', 'AI agents'], label: c.practices[0].title },
  { id: 'mind', lines: ['Watching the mind', 'through meditation'], label: c.practices[1].title },
];
const questions = [
  { q: 'judgment', from: ['agents'] },
  { q: 'authorship', from: ['agents', 'mind'] },
  { q: 'human attention', from: ['mind'] },
].map((n) => ({ ...n, work: questionWork(n.q) }));

const textAt = (x, y, t, cls = '') => `<text x="${x}" y="${y}" text-anchor="middle"${cls ? ` class="${cls}"` : ''}>${esc(t)}</text>`;

// A practice is a plain two-line label (no outline); a transparent rect keeps the whole label clickable.
const practiceNode = (n, x, y, w, h) =>
  `<a href="#${n.id}" class="node node--practice"><rect class="hit" x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}"/>${textAt(x, y - 4, n.lines[0])}${textAt(x, y + 18, n.lines[1])}</a>`;

// A question is a box: the question in two lines, then the project that asks it.
const questionNode = (n, x, y, w, h) =>
  `<a href="#${n.work.id}" class="node node--question"><rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="3"/>${textAt(x, y - 19, n.work.questionLines[0])}${textAt(x, y + 3, n.work.questionLines[1])}${textAt(x, y + 29, n.work.name, 'node-project')}</a>`;

const label = 'Two practices and the three questions they lead to; each question links to the project that asks it';

// Wide: the practices on top, the questions below, edges drop from under each label.
function diagramWide() {
  const T = { agents: [300, 50], mind: [660, 50] };
  const Q = [160, 480, 800], qy = 262, qW = 250, qH = 96, tW = 240, tH = 64;
  const y1 = T.agents[1] + tH / 2, y2 = qy - qH / 2, mid = (y1 + y2) / 2;
  const edges = [];
  questions.forEach((q, i) => {
    for (const f of q.from) {
      const tx = T[f][0];
      const two = q.from.length > 1;
      const sx = tx + (two ? (f === 'agents' ? 40 : -40) : (f === 'agents' ? -40 : 40));
      const ex = Q[i] + (two ? (f === 'agents' ? -40 : 40) : 0);
      edges.push(`<path class="edge" d="M${sx} ${y1} C ${sx} ${mid}, ${ex} ${mid}, ${ex} ${y2}"/>`);
    }
  });
  // The viewBox is cropped to the drawing so its outer strokes sit on the text column's edges.
  const minX = Q[0] - qW / 2 - 1, maxX = Q[2] + qW / 2 + 1;
  const minY = T.agents[1] - tH / 2, maxY = qy + qH / 2 + 1;
  return `<svg class="map map--wide" viewBox="${minX} ${minY} ${maxX - minX} ${maxY - minY}" role="group" aria-label="${label}">
  <g class="edges" aria-hidden="true">${edges.join('')}</g>
  ${tops.map((n) => practiceNode(n, ...T[n.id], tW, tH)).join('\n  ')}
  ${questions.map((n, i) => questionNode(n, Q[i], qy, qW, qH)).join('\n  ')}
</svg>`;
}

// Narrow: agents on top, the questions stacked, meditation at the bottom. Nodes are emitted in visual
// order so Tab follows the eye. Each practice reaches its nearest question by a straight drop and the
// shared question by a curve round its own side.
function diagramNarrow() {
  const cx = 180, qW = 230, qH = 88, tW = 260, tH = 56;
  const agentsY = 36, Q = [160, 280, 400], mindY = 524;
  const L = cx - qW / 2, R = cx + qW / 2;
  const aB = agentsY + tH / 2, mT = mindY - tH / 2;
  const edges = [
    `<path class="edge" d="M${cx - 50} ${aB} V ${Q[0] - qH / 2}"/>`,
    `<path class="edge" d="M${cx - 80} ${aB} C 22 ${aB + 24}, 22 ${Q[1]}, ${L} ${Q[1]}"/>`,
    `<path class="edge" d="M${cx + 80} ${mT} C 338 ${mT - 24}, 338 ${Q[1]}, ${R} ${Q[1]}"/>`,
    `<path class="edge" d="M${cx + 50} ${mT} V ${Q[2] + qH / 2}"/>`,
  ];
  const minY = agentsY - tH / 2, maxY = mindY + tH / 2;
  return `<svg class="map map--narrow" viewBox="0 ${minY} 360 ${maxY - minY}" role="group" aria-label="${label}">
  <g class="edges" aria-hidden="true">${edges.join('')}</g>
  ${practiceNode(tops[0], cx, agentsY, tW, tH)}
  ${questions.map((n, i) => questionNode(n, cx, Q[i], qW, qH)).join('\n  ')}
  ${practiceNode(tops[1], cx, mindY, tW, tH)}
</svg>`;
}

function pageC(d) {
  return `${head(d, 'c')}<header class="site-head center">${nav()}</header>
<main id="main" class="center page">
  <section class="intro" aria-labelledby="name">
    <h1 id="name" class="name">${esc(c.name)}</h1>
    <p class="bio">${tie(esc(c.bio))}</p>
    ${entrances()}
  </section>
  <figure class="map-figure" aria-labelledby="map-cap">
    ${diagramWide()}
    ${diagramNarrow()}
    <figcaption id="map-cap" class="map-caption">Two practices, three questions. Each question links to the project that asks it.</figcaption>
  </figure>
  <div class="index">
    ${c.practices.map((p) => practice(p, false, { asks: true })).join('\n    ')}
    ${meeting({ asks: true })}
  </div>
</main>
${footer()}`;
}

const pages = { a: pageA, b: pageB, c: pageC };
mkdirSync(join(out, 'fonts'), { recursive: true });
mkdirSync(join(out, 'shared'), { recursive: true });
copyFileSync(join(here, 'shared/base.css'), join(out, 'shared/base.css'));
for (const [key, d] of Object.entries(directions)) {
  const dir = join(out, key);
  mkdirSync(dir, { recursive: true });
  for (const f of d.fonts) copyFileSync(join(root, 'node_modules', fontSrc[f.file], f.file), join(out, 'fonts', f.file));
  writeFileSync(join(dir, 'tokens.css'), tokensCss(d) + '\n' + fontFace(d) + '\n');
  copyFileSync(join(here, key, 'style.css'), join(dir, 'style.css'));
  writeFileSync(join(dir, 'index.html'), pages[key](d));
}
console.log('built', Object.keys(pages).join(', '));
