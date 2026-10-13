// Visual QA: screenshots of each section. Usage: node scripts/tour.mjs <outdir> [w] [h] [--rm] [--only=sel,sel]
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
const [out, w = 1440, h = 900] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const rm = process.argv.includes('--rm');
const only = (process.argv.find((a) => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: +w, height: +h }, reducedMotion: rm ? 'reduce' : 'no-preference', hasTouch: +w < 800, isMobile: +w < 800 });
const errs = [];
page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) errs.push(`[${m.type()}] ${m.text()}`); });
page.on('pageerror', (e) => errs.push(`[pageerror] ${e.message}`));
await page.goto('http://localhost:5173/?qa', { waitUntil: 'networkidle' });
await page.waitForTimeout(3500);
const shots = [
  ['hero', null], ['j1', '#journey', 0.02], ['j3', '#journey', 0.29], ['j4', '#journey', 0.43], ['j5', '#journey', 0.57], ['j6', '#journey', 0.71], ['j7', '#journey', 0.86], ['j8', '#journey', 0.995],
  ['lisa', '#lisa'], ['why', '#why'], ['first', '#first-note'], ['method', '#lessons'], ['options', '#options'], ['recital', '#students'],
  ['canI', '#can-i'], ['path', '#path'], ['practice', '#practice'], ['faq', '#faq'], ['finale', '#finale', 0.35], ['inquire', '#inquire'], ['footer', '.foot'],
];
for (const [name, sel, frac] of shots) {
  if (only.length && !only.includes(name)) continue;
  await page.evaluate(([sel, frac]) => {
    if (!sel) return window.scrollTo(0, 0);
    const el = document.querySelector(sel);
    const top = el.getBoundingClientRect().top + scrollY;
    const y = frac == null ? top - 60 : top + (el.offsetHeight - innerHeight) * frac;
    window.scrollTo(0, y);
  }, [sel, frac]);
  await page.waitForTimeout(name.startsWith('j') || name === 'finale' ? 2600 : 1600);
  await page.screenshot({ path: `${out}/${name}.png` });
}
console.log(errs.slice(0, 20).join('\n') || 'no console errors');
await browser.close();
