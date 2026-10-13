// Renders a smooth scroll-through video of the site, frame by frame, with a
// virtual clock — so it looks right even in a slow software-rendered browser.
// Usage: node scripts/walkthrough.mjs <out.mp4> [w] [h]   (needs npm run dev)
import { chromium } from 'playwright-core';
import { mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const [out = 'walkthrough.mp4', W = 1280, H = 720] = process.argv.slice(2);
const FPS = 25, DT = 1000 / FPS;
const tmp = `${out}.frames`;
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });

const browser = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: +W, height: +H } });
// Virtual time for the page's JS only (timers, rAF, performance.now, Date.now).
// Unlike page.clock, this leaves the browser's own frame loop alone, so
// screenshots stay fast. Each __advance(ms) runs due timers, then one rAF batch.
await page.addInitScript(() => {
  let now = 0, id = 1, rafQ = [];
  const dateBase = Date.now();
  performance.now = () => now;
  Date.now = () => dateBase + now;
  window.requestAnimationFrame = (cb) => { const i = id++; rafQ.push([i, cb]); return i; };
  window.cancelAnimationFrame = (i) => { rafQ = rafQ.filter(([j]) => j !== i); };
  const timers = new Map();
  window.setTimeout = (cb, ms = 0, ...a) => { const i = id++; timers.set(i, { at: now + (+ms || 0), cb, a }); return i; };
  window.setInterval = (cb, ms = 0, ...a) => { const i = id++; const every = Math.max(+ms || 0, 4); timers.set(i, { at: now + every, cb, a, every }); return i; };
  window.clearTimeout = window.clearInterval = (i) => timers.delete(i);
  window.requestIdleCallback = (cb) => window.setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 10 }), 50);
  window.__advance = (ms) => {
    const end = now + ms;
    for (let guard = 0; guard < 500; guard++) {
      let next = null;
      for (const e of timers) if (e[1].at <= end && (!next || e[1].at < next[1].at)) next = e;
      if (!next) break;
      const [i, t] = next;
      now = Math.max(now, t.at);
      if (t.every) t.at += t.every; else timers.delete(i);
      try { if (typeof t.cb === 'function') t.cb(...t.a); } catch (e) { console.error(e); }
    }
    now = end;
    const q = rafQ; rafQ = [];
    for (const [, cb] of q) { try { cb(now); } catch (e) { console.error(e); } }
  };
});
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
// let the lazy 3D load (idle callback + dynamic import) on the virtual clock
for (let i = 0; i < 60 && !(await page.evaluate(() => !!window.__stage)); i++) { await page.evaluate(() => window.__advance(100)); await page.waitForTimeout(250); }
await page.evaluate(() => document.querySelector('[data-review]')?.remove()); // keep the video clean

let n = 0;
const frame = async () => {
  await page.evaluate((dt) => window.__advance(dt), DT);
  await page.screenshot({ path: `${tmp}/${String(n++).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 88 });
  if (n % 100 === 0) console.log(`${n} frames`);
};
const hold = async (sec) => { for (let i = 0; i < sec * FPS; i++) await frame(); };
const top = (sel) => page.evaluate((s) => document.querySelector(s).getBoundingClientRect().top + scrollY, sel);
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
async function scrollTo(y, sec) {
  const y0 = await page.evaluate(() => scrollY);
  const steps = Math.round(sec * FPS);
  for (let i = 1; i <= steps; i++) { await page.evaluate((v) => window.scrollTo(0, v), y0 + (y - y0) * ease(i / steps)); await frame(); }
}

// 1. hero: headline lands word by word
await hold(3.2);
// 2. the 3D journey, scene by scene
const jTop = await top('#journey');
const jLen = await page.evaluate(() => { const j = document.querySelector('#journey'); return j.offsetHeight - innerHeight; });
for (let s = 0; s < 8; s++) {
  await scrollTo(jTop + jLen * (s / 7), s === 0 ? 1.6 : 1.4);
  await hold(s === 2 || s === 4 || s === 5 ? 1.8 : 1.2);
}
// 3. play a note
await scrollTo((await top('#first-note')) - 40, 1.2);
for (const k of ['C4', 'E4', 'G4', 'C5']) { await page.locator(`.mini__w[data-note="${k}"]`).dispatchEvent('pointerdown'); await hold(0.35); }
await hold(1);
// 4. sections, with one interaction each
const visit = async (sel, sec = 1.6, act) => { await scrollTo((await top(sel)) - 40, 1.1); if (act) await act(); await hold(sec); };
await visit('#lisa', 1.4);
await visit('#lessons', 0.6, async () => { for (const i of [1, 2, 3]) { await page.locator(`#mkey-${i}`).click(); await hold(0.9); } });
await visit('#options', 0.4, async () => { await page.locator('.pkey[data-pkg="intro"]').click(); await hold(1.2); await page.locator('.pkey[data-pkg="extended"]').click(); await hold(1.2); });
await visit('#students', 1.4);
await visit('#recital', 0.4, async () => { await hold(0.6); await page.locator('[data-play]').click(); await hold(1.6); });
await visit('#can-i', 0.4, async () => { await page.locator('.lid__btn').first().click(); await hold(1.2); });
await visit('#path', 0.3, async () => {
  for (const v of ['adult', 'returning', 'perform']) { await page.locator(`.mopt:has(input[value="${v}"])`).click(); await hold(0.9); }
  await hold(1);
});
await visit('#practice', 0.3, async () => { await page.locator('[data-start]').click(); await page.locator('[data-metro-start]').click(); await hold(2.2); });
await visit('#faq', 0.3, async () => { await page.locator('.bar__btn').nth(1).click(); await hold(1); });
// 5. finale + form
await scrollTo((await top('#finale')) + 200, 1.6);
await hold(2);
await visit('#inquire', 2);

await browser.close();
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', `${tmp}/%05d.jpg`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '22', '-movflags', '+faststart', out]);
rmSync(tmp, { recursive: true, force: true });
console.log(`${out}: ${n} frames, ${(n / FPS).toFixed(1)}s`);
