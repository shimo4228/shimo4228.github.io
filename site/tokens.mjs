// Reads the inputs in DESIGN.md and turns them into CSS custom properties.
// Colour from Leonardo (target contrast ratios), sizes from the Utopia fluid-scale formula.
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { Theme, Color, BackgroundColor } from '@adobe/leonardo-contrast-colors';

export function readDesign(path) {
  const src = readFileSync(path, 'utf8');
  const m = src.match(/^---\n([\s\S]*?)\n---/);
  if (!m) throw new Error('DESIGN.md has no front matter');
  return parse(m[1]);
}

function clampFor(minPx, maxPx, vw) {
  const slope = (maxPx - minPx) / (vw.max - vw.min);
  const intercept = minPx - slope * vw.min;
  const r = (n) => +(n / 16).toFixed(4);
  // A step can shrink as the viewport grows (when the ratio rises); clamp needs min <= max either way.
  return `clamp(${r(Math.min(minPx, maxPx))}rem, ${r(intercept)}rem + ${+(slope * 100).toFixed(4)}vw, ${r(Math.max(minPx, maxPx))}rem)`;
}

function typeScale({ baseMin, baseMax, ratioMin, ratioMax }, vw) {
  const out = {};
  for (const s of [-2, -1, 0, 1, 2, 3, 4]) out[`step-${s < 0 ? 'n' + -s : s}`] = clampFor(baseMin * ratioMin ** s, baseMax * ratioMax ** s, vw);
  return out;
}

function spaceScale({ baseMin, baseMax }, vw) {
  const mult = { '3xs': 0.25, '2xs': 0.5, xs: 0.75, s: 1, m: 1.5, l: 2, xl: 3, '2xl': 4, '3xl': 6 };
  const out = {};
  for (const [k, m] of Object.entries(mult)) out[`space-${k}`] = clampFor(baseMin * m, baseMax * m, vw);
  return out;
}

const NEUTRAL_ROLES = ['surface-2', 'line', 'line-strong', 'muted', 'text'];

export function palette(colors, lightness) {
  const dark = lightness < 50;
  const pick = (keys) => Object.fromEntries(keys.map((k) => [k, colors.ratios[k]]));
  const accentRoles = Object.keys(colors.ratios).filter((k) => !NEUTRAL_ROLES.includes(k));
  const silence = console.log;
  const warn = console.warn;
  console.log = () => {};
  console.warn = () => {};
  try {
    const bg = new BackgroundColor({ name: 'neutral', colorKeys: [colors.neutral], ratios: pick(NEUTRAL_ROLES) });
    const accent = new Color({ name: 'accent', colorKeys: [dark ? colors.accent.keyDark : colors.accent.key], ratios: pick(accentRoles) });
    return new Theme({ colors: [bg, accent], backgroundColor: bg, lightness }).contrastColorPairs;
  } finally {
    console.log = silence;
    console.warn = warn;
  }
}

export function tokensCss(d) {
  const vw = d.viewport;
  const light = palette(d.colors, d.colors.lightness.light);
  const dark = palette(d.colors, d.colors.lightness.dark);
  const decl = (obj) => Object.entries(obj).map(([k, v]) => `  --${k}: ${v};`).join('\n');
  const color = (p, indent = '  ') => Object.entries(p).map(([k, v]) => `${indent}--color-${k}: ${v};`).join('\n');
  const t = d.typography;
  return {
    light,
    dark,
    css: `/* Generated from DESIGN.md by site/tokens.mjs. Do not edit by hand. */
@font-face {
  font-family: "${t.display.family}";
  src: url("/fonts/${t.display.file}") format("woff2");
  font-weight: ${t.display.weight};
  font-style: normal;
  font-display: swap;
}
:root {
${decl(typeScale(t.scale, vw))}
${decl(spaceScale(d.spacing, vw))}
  --font-display: ${t.display.stack};
  --font-body: ${t.body.stack};
  --measure: ${d.layout.measure};
  --column: ${d.layout.column};
  --rail: ${d.layout.rail};
  --note: ${d.layout.note};
  --radius-s: ${d.rounded.s};
  --line-thin: 1px;
  --leading-tight: 1.15;
  --leading-body: 1.6;
  color-scheme: light dark;
${color(light)}
}
:lang(ja) {
  --font-display: ${t.display.stackJa};
  --font-body: ${t.body.stackJa};
  --leading-body: 1.9;
}
/* Screen only: print always uses the light palette. */
@media screen and (prefers-color-scheme: dark) {
  :root {
${color(dark, '    ')}
  }
}
`,
  };
}
