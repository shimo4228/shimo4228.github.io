// Screenshot matrix: node eval/shoot.mjs <root> <widths> <schemes> <paths> <outDir>
import { chromium } from 'playwright';
import { serve } from './serve.mjs';
import { mkdirSync } from 'node:fs';
const [root, w = '375,1280', s = 'light,dark', p = 'a,b,c', outDir = 'eval/shots'] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });
const { port, close } = await serve(root);
const b = await chromium.launch();
for (const pg of p.split(',')) for (const scheme of s.split(',')) for (const width of w.split(',').map(Number)) {
  const ctx = await b.newContext({ viewport: { width, height: 900 }, colorScheme: scheme });
  const page = await ctx.newPage();
  await page.goto(`http://localhost:${port}/${pg}/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  // Full-page shots show everything at its end state, not mid scroll-in fade.
  await page.addStyleTag({ content: '*, *::before, *::after { animation: none !important; }' });
  const f = `${outDir}/${pg.replace(/\//g, '_') || 'root'}-${width}-${scheme}.png`;
  await page.screenshot({ path: f, fullPage: true });
  console.log(f);
  await ctx.close();
}
await b.close(); close();
