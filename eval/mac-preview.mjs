// Builds a file:// preview of dist/ for checking the site in the author's own browser (Hiragino on macOS).
// Usage: node eval/mac-preview.mjs <out-dir>
//   <out-dir>/light/, <out-dir>/dark/  copies of dist/ with root paths made relative; dark forces the dark scheme
//   <out-dir>/view.html?p=ja/&t=light&w=375,1000&y=0&h=1600
//     p: page inside dist (default ""), t: light|dark, w: iframe widths in CSS px, y: scroll offset, h: frame height,
//     z: zoom (default: fit the window; 2 shows details at twice the size)
// The viewer lays the widths side by side, scaled to fit the window, so one screenshot of the window
// shows the same page at several widths without resizing anything.
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, relative, dirname } from "node:path";

const out = process.argv[2];
if (!out) throw new Error("usage: node eval/mac-preview.mjs <out-dir>");

function walk(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

for (const theme of ["light", "dark"]) {
  const root = join(out, theme);
  rmSync(root, { recursive: true, force: true });
  mkdirSync(root, { recursive: true });
  cpSync("dist", root, { recursive: true });
  for (const file of walk(root)) {
    if (!/\.(html|css)$/.test(file)) continue;
    let up = relative(dirname(file), root) || ".";
    let s = readFileSync(file, "utf8");
    // Root-absolute links and assets → relative; directory links → their index.html (file:// has no index).
    s = s.replace(/(href|src)="\/([^"/][^"]*)?"/g, (m, a, p = "") => {
      const target = !p || p.endsWith("/") ? `${p}index.html` : p;
      return `${a}="${up}/${target}"`;
    });
    s = s.replace(/url\((["']?)\/([^)"']*)\1\)/g, (m, qt, p) => `url(${qt}${up}/${p}${qt})`);
    if (theme === "dark" && file.endsWith(".css")) {
      s = s.replace(/@media screen and \(prefers-color-scheme: dark\)/g, "@media screen");
      s = s.replace(/color-scheme:\s*light dark/g, "color-scheme: dark");
    }
    writeFileSync(file, s);
  }
}

writeFileSync(
  join(out, "view.html"),
  `<!doctype html><meta charset="utf-8"><title>preview</title>
<style>
  html,body{margin:0;background:#888;font:12px system-ui;overflow:hidden}
  #row{display:flex;gap:16px;padding:8px 16px;align-items:flex-start}
  .cell span{display:block;color:#fff;margin-bottom:4px}
  .clip{overflow:hidden;background:#fff}
  iframe{border:0;display:block;transform-origin:0 0}
</style>
<div id="row"></div>
<script>
  const q = new URLSearchParams(location.search);
  const p = q.get("p") || "", t = q.get("t") || "light";
  const ws = (q.get("w") || "375,1000").split(",").map(Number);
  const y = +(q.get("y") || 0), h = +(q.get("h") || 1600);
  const page = !p || p.endsWith("/") || p.includes("/#") || p.startsWith("#") ? p.replace(/(^|\\/)(#|$)/, "$1index.html$2") : p;
  const avail = innerWidth - 32 - 16 * (ws.length - 1);
  const sc = +q.get("z") || Math.min(1, avail / ws.reduce((a, b) => a + b, 0), (innerHeight - 40) / h);
  for (const w of ws) {
    const c = document.createElement("div"); c.className = "cell";
    c.innerHTML = '<span>' + w + 'px · ' + t + ' · ' + (p || "/") + (y ? ' · y=' + y : '') + '</span>';
    const clip = document.createElement("div"); clip.className = "clip";
    clip.style.width = w * sc + "px"; clip.style.height = h * sc + "px";
    const f = document.createElement("iframe");
    f.src = t + "/" + page; f.width = w; f.height = h + y;
    f.style.transform = "scale(" + sc + ") translateY(" + -y + "px)";
    clip.append(f); c.append(clip); document.getElementById("row").append(c);
  }
</script>
`
);
console.log(`preview written to ${out} (light/, dark/, view.html)`);
