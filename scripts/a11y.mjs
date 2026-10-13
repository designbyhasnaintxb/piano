// axe-core audit of the whole page (WCAG 2.x A/AA). Needs the dev server.
import { chromium } from 'playwright-core';
import { readFileSync } from 'node:fs';
const axe = readFileSync('node_modules/axe-core/axe.min.js', 'utf8');
const browser = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
for (const [w, h] of [[1280, 860], [390, 844]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
  await page.goto(`${process.env.BASE || 'http://localhost:5173/'}?qa`, { waitUntil: 'networkidle' });
  await page.addScriptTag({ content: axe });
  const res = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'] })).violations);
  console.log(`\n== ${w}x${h}: ${res.length} rule violations`);
  for (const v of res) console.log(`- [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length})\n    e.g. ${v.nodes[0].target.join(' ')} ${v.nodes[0].failureSummary?.split('\n')[1] || ''}`);
  await page.close();
}
await browser.close();
