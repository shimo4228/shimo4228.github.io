#!/usr/bin/env bash
# Prove each frozen unit can fail: apply one mutation to the source, rebuild, run the units, restore.
# A unit whose mutation leaves it green is a false green. Usage: bash eval/mutate.sh
set -u
cd "$(dirname "$0")/.."

mutate() { # id file perl-substitution
  local id=$1 file=$2 expr=$3
  cp "$file" "$file.bak"
  perl -0pi -e "$expr" "$file"
  if cmp -s "$file" "$file.bak"; then echo "== $id: MUTATION DID NOT APPLY"; mv "$file.bak" "$file"; return; fi
  node site/build.mjs >/dev/null 2>&1
  echo "== mutation for $id"
  node eval/units.mjs dist | grep -E '^(FAIL|pass)'
  mv "$file.bak" "$file"
}

mutate ja-kinsoku-start site/site.css 's/line-break: strict;/line-break: auto;/'
mutate ja-quote-hang site/site.css 's/text-indent: -0\.5em;/text-indent: -0.4em;/'
mutate ja-sentence-lines site/site.css 's/(\.sentence \.keep \{\n  display: )inline-block/${1}inline/'
mutate en-sentence-lines content/site.en.json 's/and watching the mind\|through/and watching|the mind through/'
mutate ja-no-space-at-line-start site/build.mjs 's/\.replace\(\/<wbr>&nbsp;\/g, .&nbsp;<wbr>.\)//'
mutate typographic-punctuation site/build.mjs 's/const title = typographic\(e\.title\);/const title = e.title;/'
mutate no-dead-ends site/build.mjs 's/<p class="section-title"><a href="\$\{paths\[lang\]\.home\}">/<p class="section-title"><a href="#main">/'
mutate text-zoom site/site.css 's/font-size: max\(min\(var\(--step-3\), 7\.1vw\), 1\.5rem\);/font-size: 7.1vw;/'
mutate no-overflow site/site.css 's/(\.sentence \.keep \{\n  display: inline-block;)/$1\n  white-space: nowrap;\n  min-inline-size: 30em;/'
mutate head-metadata site/build.mjs 's/<meta name="theme-color" content="\$\{tokens\.dark\.background\}" media="\(prefers-color-scheme: dark\)">\n//'
mutate sticky-rail-quotes site/site.css 's/(@media \(min-width: 48rem\) \{\n  \.gloss > \.section-title \{\n    position: )sticky;/${1}static;/'
mutate title-no-widow site/site.css 's/  \/\* balance, not pretty[^\n]*\n  text-wrap: balance;\n//'
mutate link-label-whole site/site.css 's/(under text zoom\. \*\/\n)  word-break: keep-all;\n/$1/'
mutate ja-text-in-ja-stack site/site.css 's/\.lost:lang\(ja\) \{\n  font-family: var\(--font-body\);\n  line-height: var\(--leading-body\);\n\}/.lost:lang(ja) {\n}/'
mutate underline-word-length site/site.css 's/(stays the length of the word \(X\)\. \*\/\n)  min-inline-size: 0;\n  padding-inline: 0\.5rem;\n  margin-inline: -0\.5rem;\n/$1/'
mutate landing-bar-visible site/site.css 's/inset-inline-start: calc\(var\(--space-2xs\) \* -1 - 0\.5em\);/inset-inline-start: calc(var(--space-s) * -1 - 0.5em);/'
mutate single-hairline-first-piece site/site.css 's/(  \.piece:first-child \{\n)    border: 0;\n/$1/'
mutate drift-gap site/site.css 's/animation-name: drift-sm;/animation-name: drift;/'
mutate focus-not-hidden site/site.css 's/  \.reveal \.pending\.in,\n  \.reveal \.pending:focus-within \{/  .reveal .pending.in {/'
mutate forced-colors site/site.css 's/  \.site-nav \[aria-current="page"\] \{\n    text-decoration: underline 2px;\n    text-underline-offset: 0\.3em;\n  \}\n\n//'
mutate sentence-link-large site/site.css 's/7\.1vw\), 1\.5rem\);/7.1vw), 1.375rem);/'
mutate reflow-text-zoom site/site.css 's/  :is\(\.gloss, \.years, \.year, \.pieces, \.lost, \.about-body\) \{\n    grid-template-columns: minmax\(0, 1fr\);\n  \}\n//'
mutate ja-keep-all-scope site/site.css 's/(:lang\(ja\) :is\(h1, h2, h3, dt, \.sentence, \.work-name, \.entrance-group dd\) \{\n)  word-break: keep-all;\n/$1/'
mutate lang-marks site/build.mjs 's/<dd\$\{f\.lang && f\.lang !== c\.lang \? ` lang="\$\{f\.lang\}"` : .{2}\}>/<dd>/'
mutate type-scale-roles site/site.css 's/\z/\n.work:first-child .work-name { font-size: 1.1em; }\n/'
mutate edge-alignment site/site.css 's/\z/\n.section-intro { padding-inline-start: 2px; }\n/'
mutate target-size site/site.css 's/\z/\n.site-foot * { gap: 0 !important; } .site-foot a { padding: 0 !important; margin: 0 !important; min-inline-size: 0 !important; }\n/'
mutate focus-visible site/site.css 's/\z/\n:focus-visible { outline: none !important; }\n/'
mutate print site/site.css 's/(  \.sentence:lang\(ja\) \{\n    font-size: )16pt;/${1}18pt;/'
mutate ja-display-face-fallback site/build.mjs 's/codePointAt\(0\) >= 0x2e80/codePointAt(0) >= 0x4e00/'
mutate authors-words-verbatim site/build.mjs 's/const parts = c\.sentence\.map\(\(p\) => \{/const parts = c.sentence.map((p, i) => { if (i === 0 && c.lang === "ja") p = { ...p, text: p.text.slice(0, -1) };/'
mutate title-no-widow site/site.css 's/(\.work-line:not\(:has\(\.tie\)\):not\(:lang\(ja\)\) \{\n)  text-wrap: balance;\n/$1/'
mutate body-nbsp-width site/build.mjs 's/\(f\.linkText\.includes\(. .\) \? `<span class="tie">\$\{esc\(f\.linkText\)\}<\/span>` : esc\(f\.linkText\)\)/esc(f.linkText).replaceAll(" ", "&nbsp;")/'
mutate ja-no-trailing-nbsp site/build.mjs 's/\n  \.replace\(\/&nbsp;<wbr>\/g, . <wbr>.\);/;/'
mutate note-on-first-line site/site.css 's/(\.work-name a \{\n(?:  \/\*.*\n.*\n))/$1  display: inline-block;\n/'
mutate note-column-x site/site.css 's/grid-template-columns: var\(--rail\) minmax\(0, 1fr\) calc\(var\(--note\) \+ var\(--space-xl\) - var\(--space-l\)\);/grid-template-columns: var(--rail) minmax(0, 1fr) var(--note);/'
mutate skip-link-visible site/site.css 's/  \/\* Above the header[^\n]*\n  z-index: 2;\n//'
mutate print site/site.css 's/(\.sentence a \{\n    text-decoration-color: )currentColor;/${1}transparent;/'
mutate title-ties site/build.mjs 's/tieTitle\(esc\(title\)\)/esc(title)/'
mutate title-quote-hang site/site.css 's/(  \.piece-title\.hang \{\n    )text-indent: -0\.42em;/${1}text-indent: 0;/'
mutate focus-in-intro site/site.css 's/  \.intro:focus-within \{\n    opacity: 1 !important;\n  \}\n//'
mutate focus-not-hidden site/site.css 's/\n  \.reveal \.pending:focus-within \{\n    transition: none;\n  \}//'
mutate ja-title-phrases site/build.mjs 's/\n    \/\/ A closing bracket holds the particle[^\n]*\n    \.replace\([^\n]*\);/;/'
mutate title-no-widow site/build.mjs 's/return n > 1 \|\| parts\.length > 1 \? \[[^\n]*: h;/return h;/'
mutate underline-extent site/site.css 's/--u-y: calc\(0\.5lh \+ 0\.61em\);/--u-y: calc(0.5lh + 0.5em);/'
mutate parallax-floor site/site.css 's/(@keyframes drift \{\n  to \{\n    opacity: )0\.85;/${1}0.2;/'
mutate ja-latin-space site/site.css 's/(\.lost > p:not\(\.sentence\), \.site-foot\) \{\n)  word-spacing: -0\.083em;\n/$1/'
mutate dark-moss-chroma DESIGN.md 's/keyDark: "#618a6e"/keyDark: "#4f9a68"/'
mutate nav-current-mark site/site.css 's/(\.site-nav \[aria-current="page"\] \{\n)  --rest: var\(--color-line-strong\);\n/$1/'
mutate work-link-hover-ink site/site.css 's/(\.work-links a:hover \{\n  )color: var\(--color-text\);/${1}color: var(--color-accent);/'
mutate ja-keep-all-scope site/site.css 's/(:lang\(ja\) \.lead \{\n)  word-break: keep-all;\n/$1/'
mutate sentence-size-balance site/site.css 's/(clamp\(1\.625rem, 0\.75rem \+ 4\.8vw, )3\.25rem/${1}3.75rem/'

node site/build.mjs >/dev/null 2>&1
echo "== restored"
node eval/units.mjs dist | tail -1
