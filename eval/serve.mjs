// Tiny static server for eval runs. Serves <root> as the site root.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.js': 'text/javascript', '.png': 'image/png', '.txt': 'text/plain', '.xml': 'application/xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon' };
export function serve(root, port = 0) {
  return new Promise((resolve) => {
    const srv = createServer(async (req, res) => {
      let p = normalize(decodeURIComponent(req.url.split('?')[0].split('#')[0]));
      try {
        let f = join(root, p);
        if ((await stat(f)).isDirectory()) f = join(f, 'index.html');
        const body = await readFile(f);
        res.writeHead(200, { 'content-type': types[extname(f)] || 'application/octet-stream' });
        res.end(body);
      } catch {
        try { const nf = await readFile(join(root, '404.html')); res.writeHead(404, { 'content-type': types['.html'] }); res.end(nf); }
        catch { res.writeHead(404); res.end('Not found'); }
      }
    }).listen(port, () => resolve({ port: srv.address().port, close: () => srv.close() }));
  });
}
