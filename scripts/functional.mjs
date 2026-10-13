// Functional checks for every interactive module. Needs the dev server.
// Usage: node scripts/functional.mjs [--rm]
import { chromium } from 'playwright-core';
const rm = process.argv.includes('--rm');
const browser = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 860 }, reducedMotion: rm ? 'reduce' : 'no-preference' });
const errs = [];
page.on('pageerror', (e) => errs.push(e.message));
page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
await page.goto('http://localhost:5173/?qa', { waitUntil: 'networkidle' });
const results = [];
const check = async (name, fn) => { try { const r = await fn(); results.push([r ? 'PASS' : 'FAIL', name]); } catch (e) { results.push(['FAIL', `${name} — ${e.message.split('\n')[0]}`]); } };
const vis = (sel) => page.locator(sel).first().isVisible();

await check('sound toggle starts off, turns on', async () => {
  const b = page.locator('.nav [data-sound-toggle]');
  const before = await b.getAttribute('aria-pressed');
  await b.click();
  const after = await b.getAttribute('aria-pressed');
  await b.click();
  return before === 'false' && after === 'true';
});
await check('play-a-note: click shows note + CTA', async () => {
  await page.locator('#first-note').scrollIntoViewIfNeeded();
  await page.locator('.mini__w[data-note="E4"]').click();
  await page.waitForTimeout(300);
  return (await page.locator('[data-note-name]').textContent()) === 'E' && await vis('[data-after]');
});
await check('play-a-note: keyboard letter G plays G', async () => {
  await page.keyboard.press('g');
  await page.waitForTimeout(100);
  return (await page.locator('[data-note-name]').textContent()) === 'G';
});
await check('method tabs: click + arrow keys', async () => {
  await page.locator('#lessons').scrollIntoViewIfNeeded();
  await page.locator('#mkey-2').click();
  await page.waitForTimeout(600);
  const a = await page.locator('#mpanel-2').isVisible();
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(600);
  const sel = await page.locator('#mkey-3').getAttribute('aria-selected');
  const focused = await page.evaluate(() => document.activeElement.id);
  return a && sel === 'true' && focused === 'mkey-3' && await page.locator('#mpanel-3').isVisible();
});
await check('packages: select intro → card + remembered', async () => {
  await page.locator('#options').scrollIntoViewIfNeeded();
  await page.locator('.pkey[data-pkg="intro"]').click();
  await page.waitForTimeout(700);
  const card = await page.locator('[data-pcard="intro"]').isVisible();
  const stored = await page.evaluate(() => JSON.parse(sessionStorage.getItem('lm-session')).interest.id);
  return card && stored === 'intro';
});
await check('form pre-fills chosen option', async () => {
  return (await page.locator('[data-chosen-label]').textContent()) === 'Introductory lesson' && (await page.locator('[data-lesson-select]').inputValue()) === 'intro';
});
await check('students: open story shows quote/path', async () => {
  await page.locator('#students').scrollIntoViewIfNeeded();
  await page.locator('.story__open').first().click();
  await page.waitForTimeout(800);
  return (await page.locator('.story__open').first().getAttribute('aria-expanded')) === 'true' && await vis('#story-s1');
});
await check('recital: play dims room, no fake video', async () => {
  await page.locator('#recital').scrollIntoViewIfNeeded();
  await page.locator('[data-play]').click();
  await page.waitForTimeout(300);
  const dim = await page.locator('[data-recital]').evaluate((n) => n.classList.contains('is-dim'));
  return dim && await vis('.screen__empty');
});
await check('objection lid opens + icon morphs', async () => {
  await page.locator('#can-i').scrollIntoViewIfNeeded();
  const d0 = await page.locator('.lid__lid').first().getAttribute('d');
  await page.locator('.lid__btn').first().click();
  await page.waitForTimeout(900);
  const d1 = await page.locator('.lid__lid').first().getAttribute('d');
  return (await page.locator('.lid__btn').first().getAttribute('aria-expanded')) === 'true' && await vis('#lid-0') && d0 !== d1;
});
await check('matcher: child → new → enjoy recommends intro', async () => {
  await page.locator('#path').scrollIntoViewIfNeeded();
  await page.locator('.mopt:has(input[value="child"])').click();
  await page.waitForTimeout(800);
  await page.locator('.mopt:has(input[value="new"])').click();
  await page.waitForTimeout(800);
  await page.locator('.mopt:has(input[value="enjoy"])').click();
  await page.waitForTimeout(900);
  const name = await page.locator('[data-result-name]').textContent();
  return name === 'Introductory lesson' && await vis('[data-result]');
});
await check('matcher: restart returns to step 1', async () => {
  await page.locator('[data-restart]').click();
  await page.waitForTimeout(700);
  return await vis('[data-step="0"]') && !(await vis('[data-result]'));
});
await check('timer: 5 min, start counts down, pause', async () => {
  await page.locator('#practice').scrollIntoViewIfNeeded();
  await page.locator('[data-min="5"]').click();
  const t0 = await page.locator('[data-time]').textContent();
  await page.locator('[data-start]').click();
  await page.waitForTimeout(2200);
  const t1 = await page.locator('[data-time]').textContent();
  await page.locator('[data-start]').click();
  return t0 === '5:00' && t1 !== '5:00' && (await page.locator('[data-start]').textContent()) === 'Resume';
});
await check('metronome: slider updates BPM + term', async () => {
  await page.locator('[data-bpm-input]').fill('120');
  await page.locator('[data-bpm-input]').dispatchEvent('input');
  return (await page.locator('[data-bpm]').textContent()) === '120' && (await page.locator('[data-term]').textContent()) === 'Allegro';
});
await check('metronome: start flashes beats', async () => {
  await page.locator('[data-metro-start]').click();
  await page.waitForTimeout(1200);
  const on = await page.locator('.metro__beats i.is-on').count();
  await page.locator('[data-metro-start]').click();
  return on === 1;
});
await check('faq bar opens', async () => {
  await page.locator('#faq').scrollIntoViewIfNeeded();
  await page.locator('.bar__btn').nth(2).click();
  await page.waitForTimeout(700);
  return await vis('#faq-2');
});
await check('form: empty submit lists errors + focuses first', async () => {
  await page.locator('#inquire').scrollIntoViewIfNeeded();
  await page.locator('[data-inquiry] [type="submit"]').click();
  const err = await page.locator('[data-form-err]').textContent();
  const focused = await page.evaluate(() => document.activeElement.name);
  return err.startsWith('Please complete') && focused === 'who';
});
await check('form: valid submit is honest about missing destination', async () => {
  await page.locator('.fchip:has(input[name="who"])').first().click();
  await page.selectOption('select[name="age"]', { index: 1 });
  await page.selectOption('select[name="experience"]', { index: 1 });
  await page.fill('input[name="name"]', 'Test Parent');
  await page.fill('input[name="email"]', 'parent@example.com');
  await page.locator('[data-inquiry] [type="submit"]').click();
  await page.waitForTimeout(200);
  return (await page.locator('[data-form-err]').textContent()).includes('isn\'t connected');
});
await check('3D stage loaded or fell back', async () => page.evaluate(() => !!window.__stage || document.querySelector('[data-poster]').complete));
await check('no horizontal page scroll', async () => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));

for (const [s, n] of results) console.log(`${s}  ${n}`);
console.log(errs.length ? `console errors:\n${errs.join('\n')}` : 'no console errors');
await browser.close();
