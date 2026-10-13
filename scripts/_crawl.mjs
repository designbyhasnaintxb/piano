// Crawl a site's internal pages, save rendered text + image list + full screenshot.
import { chromium } from 'playwright-core';
import { writeFileSync, mkdirSync } from 'node:fs';
const [start, outDir, max = 25] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });
const origin = new URL(start).origin;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const seen = new Set(), queue = [start], pages = [];
while (queue.length && pages.length < +max) {
  const url = queue.shift().split('#')[0].replace(/\/$/, '') || origin;
  if (seen.has(url)) continue;
  seen.add(url);
  try { await p.goto(url, { waitUntil: 'networkidle', timeout: 45000 }); } catch (e) { console.log('ERR', url, e.message.split('\n')[0]); continue; }
  // trigger lazy content
  for (let y = 0; y < 30; y++) { await p.mouse.wheel(0, 900); await p.waitForTimeout(120); }
  await p.waitForTimeout(800);
  const info = await p.evaluate(() => ({
    title: document.title,
    text: document.body.innerText,
    links: [...document.querySelectorAll('a[href]')].map((a) => ({ href: a.href, text: a.innerText.trim().slice(0, 80) })),
    images: [...document.querySelectorAll('img')].map((i) => ({ src: i.currentSrc || i.src || i.dataset.src, alt: i.alt, w: i.naturalWidth, h: i.naturalHeight })).filter((i) => i.src),
    bg: [...document.querySelectorAll('[style*="background-image"]')].map((e) => e.style.backgroundImage).slice(0, 40),
    videos: [...document.querySelectorAll('iframe, video, source, [data-html*="youtube"], [data-url]')].map((v) => v.src || v.dataset.url || v.getAttribute('data-html') || '').filter(Boolean),
    headings: [...document.querySelectorAll('h1,h2,h3,h4')].map((h) => `${h.tagName}: ${h.innerText.trim()}`),
  }));
  const slug = (new URL(url).pathname.replace(/\W+/g, '_') || 'home').replace(/^_|_$/g, '') || 'home';
  writeFileSync(`${outDir}/${slug}.json`, JSON.stringify({ url, ...info }, null, 1));
  writeFileSync(`${outDir}/${slug}.txt`, `${url}\n${info.title}\n\n${info.text}`);
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.screenshot({ path: `${outDir}/${slug}.png`, fullPage: true });
  pages.push(url);
  console.log('OK', url, `${info.text.length} chars, ${info.images.length} imgs`);
  for (const l of info.links) { try { const u = new URL(l.href); if (u.origin === origin && !/\.(jpg|png|pdf|jpeg)$/i.test(u.pathname)) queue.push(u.href); } catch {} }
}
await b.close();
