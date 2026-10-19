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
mutate text-zoom site/site.css 's/font-size: max\(min\(var\(--step-3\), 7\.1vw\), 1\.375rem\);/font-size: 7.1vw;/'
mutate no-overflow site/site.css 's/(\.sentence \.keep \{\n  display: inline-block;)/$1\n  white-space: nowrap;\n  min-inline-size: 30em;/'
mutate head-metadata site/build.mjs 's/<meta name="theme-color" content="\$\{tokens\.dark\.background\}" media="\(prefers-color-scheme: dark\)">\n//'
mutate sticky-rail-quotes site/site.css 's/(@media \(min-width: 48rem\) \{\n  \.gloss > \.section-title \{\n    position: )sticky;/${1}static;/'
mutate sentence-size-balance site/site.css 's/(clamp\(1\.625rem, 0\.75rem \+ 4\.8vw, )3\.25rem/${1}3.75rem/'

node site/build.mjs >/dev/null 2>&1
echo "== restored"
node eval/units.mjs dist | tail -1
