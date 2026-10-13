// Pre-renders every camera pose to WebP. These are the hero poster (LCP),
// the no-WebGL fallback, and the share image. Needs `npm run dev` running.
// Usage: node scripts/render-stills.mjs [baseUrl]
import { chromium } from 'playwright-core';
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const base = process.argv[2] || 'http://localhost:5173/';
mkdirSync('public/stills', { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const variants = [
  { suffix: '', w: 1600, h: 1000, q: 72 },
  { suffix: '-p', w: 780, h: 1400, q: 68 },
];
const extra = { 3: '&strike', 4: '&strike&t=180', 6: '&res', 8: '&strike' };
for (const v of variants) {
  const page = await browser.newPage({ viewport: { width: v.w, height: v.h } });
  for (let i = 0; i <= 9; i++) {
    await page.goto(`${base}?pose=${i}${extra[i] || ''}`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
    const png = await page.locator('[data-stage]').screenshot();
    await sharp(png).webp({ quality: v.q }).toFile(`public/stills/scene-${i}${v.suffix}.webp`);
    console.log(`scene-${i}${v.suffix}.webp`);
  }
  await page.close();
}
await browser.close();
