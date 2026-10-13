// Binds the 3D stage to the page: hero → 8-scene journey → (paused) → finale.
// Loads three.js lazily, after first paint. Falls back to pre-rendered stills
// when WebGL is unavailable, and to cuts/crossfades under reduced motion.
import { gsap, ScrollTrigger, SplitText, $, $$, reduced } from '../lib/gsap.js';
import { bus } from '../lib/bus.js';
import { store } from '../lib/store.js';
import { playNote } from '../lib/audio.js';

const N = 8;
const capEls = () => $$('[data-cap]');

function hasWebGL() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
}

export function isLite() {
  const conn = navigator.connection;
  return window.matchMedia('(max-width: 760px)').matches || (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4 || !!conn?.saveData;
}

/* ── captions & scene choreography (independent of WebGL) ── */
function captions(onScene) {
  const caps = capEls(), ticks = $$('[data-tick]');
  let cur = 0;
  const splits = caps.map((c) => (reduced ? null : SplitText.create($('.jcap__t', c), { type: 'words', mask: 'words' })));
  function go(i) {
    if (i === cur) return;
    const prev = caps[cur], next = caps[i], dir = i > cur ? 1 : -1;
    cur = i;
    ticks.forEach((t, j) => { t.classList.toggle('is-on', j === i); t.classList.toggle('is-past', j < i); });
    caps.forEach((c, j) => c.setAttribute('aria-hidden', j !== i));
    onScene(i);
    if (reduced) return;
    // Every other caption leaves, whatever state it was in — fast scrolls skip scenes.
    caps.forEach((c, j) => { if (j !== i) gsap.to(c, { autoAlpha: 0, y: j === caps.indexOf(prev) ? -30 * dir : 0, duration: 0.3, ease: 'power2.in', overwrite: true }); });
    gsap.set(next, { autoAlpha: 1, y: 0, overwrite: true });
    gsap.timeline()
      .fromTo(splits[i].words, { yPercent: 110 * dir }, { yPercent: 0, duration: 0.7, ease: 'expo.out', stagger: 0.06, overwrite: true })
      .fromTo($('.jcap__n', next), { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.4, overwrite: true }, 0)
      .fromTo($('.jcap__b', next), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, overwrite: true }, 0.15);
  }
  ticks[0]?.classList.add('is-on');
  return go;
}

/* Scene scripts: what the piano *does* in each scene. */
function sceneScripts(stage) {
  let loop = 0;
  const piano = stage.piano;
  const play = (m, v = 0.6, hold = 0.3) => { piano.strike(m, v, hold); playNote(m, v * 0.6, hold + 0.6); };
  const every = (ms, fn) => { fn(); loop = setInterval(fn, ms); };
  const students = $$('.jstudent');
  return (i) => {
    clearInterval(loop);
    if (reduced) return;
    const id = ['start', 'somewhere', 'foundations', 'technique', 'listening', 'more', 'confidence', 'music'][i];
    if (id === 'somewhere') every(2400, () => play(60, 0.5, 0.5));
    if (id === 'foundations') { let k = 0; const arp = [60, 64, 67, 72, 67, 64]; every(330, () => play(arp[k++ % arp.length], 0.55, 0.22)); }
    if (id === 'technique') every(1100, () => play(57 + Math.floor(Math.random() * 6), 0.9, 0.25));
    if (id === 'listening') every(2600, () => play(45, 0.9, 1.8));
    if (id === 'more') every(3000, () => { [36, 48, 55, 60, 64, 67, 72].forEach((m, k) => setTimeout(() => play(m, 0.55, 2.2), k * 40)); piano.resonate(0.8); });
    if (id === 'music') { let k = 0; const mel = [72, 71, 69, 67, 69, 64, 65, 67]; every(520, () => play(mel[k++ % mel.length], 0.6, 0.4)); }
    gsap.to(students, id === 'confidence'
      ? { opacity: 1, y: 0, rotate: (k) => [-4, 3, -1][k], stagger: 0.12, duration: 0.8, ease: 'expo.out', overwrite: true }
      : { opacity: 0, y: 40, duration: 0.4, overwrite: true });
  };
}

/* ── no-WebGL path: stills crossfade per scene ── */
function stillsFallback(go) {
  const img = $('[data-poster]'), srcP = $('[data-poster-p]');
  const setStill = (n) => {
    const src = `/stills/scene-${n}.webp`;
    if (img.getAttribute('src') === src) return;
    const swap = () => { img.src = src; srcP.srcset = `/stills/scene-${n}-p.webp`; };
    if (reduced) return swap();
    gsap.to(img, { opacity: 0.2, duration: 0.25, onComplete: () => { swap(); gsap.to(img, { opacity: 1, duration: 0.5 }); } });
  };
  bindScroll({ setProgress: (u) => setStill(Math.round(u)), setFinale: (v) => v > 0.5 && setStill(9), setMode() {}, start() {}, stop() {} }, go);
}

/* ── scroll bindings shared by WebGL and stills ── */
function bindScroll(stage, go) {
  const stageEl = $('[data-stage]');
  let inTop = true, inFinale = false;
  const vis = () => {
    const on = inTop || inFinale;
    stageEl.classList.toggle('is-hidden', !on);
    if (on) stage.start(); else stage.stop();
  };

  if (reduced) {
    // Cuts instead of flights: each scene panel snaps the camera with a quick crossfade.
    const canvas = $('[data-canvas]');
    const cut = (u) => { gsap.fromTo(canvas, { opacity: 0.35 }, { opacity: 1, duration: 0.4 }); stage.setProgress(u, true); };
    ScrollTrigger.create({ trigger: '#top', start: 'top top', end: 'bottom center', onEnterBack: () => cut(0) });
    capEls().forEach((c, i) => ScrollTrigger.create({ trigger: c, start: 'top center', end: 'bottom center', onToggle: (s) => { if (s.isActive) { cut(i + 1); go(i); } } }));
  } else {
    ScrollTrigger.create({ trigger: '#top', start: 'top top', end: 'bottom top', onUpdate: (s) => { if (stage.mode !== 'finale') stage.setProgress(s.progress); } });
    ScrollTrigger.create({
      trigger: '#journey', start: 'top top', end: 'bottom bottom',
      onUpdate: (s) => {
        const u = 1 + s.progress * (N - 1);
        stage.setProgress(u);
        go(Math.max(0, Math.min(N - 1, Math.round(u - 1))));
      },
    });
  }
  ScrollTrigger.create({ trigger: '#top', start: 'top bottom', endTrigger: '#journey', end: 'bottom top', onToggle: (s) => { inTop = s.isActive; if (s.isActive) stage.setMode('journey'); vis(); } });
  ScrollTrigger.create({
    trigger: '#finale', start: 'top bottom', end: 'bottom top',
    onToggle: (s) => { inFinale = s.isActive; if (s.isActive) { stage.setMode('finale'); bus.emit('finale:enter'); } vis(); },
    onUpdate: (s) => stage.setFinale(reduced ? 1 : Math.min(1, s.progress * 2.2)),
  });
  vis();
}

export async function initJourney() {
  const stageEl = $('[data-stage]');
  const lite = isLite();
  let scripts = () => {};
  const go = captions((i) => scripts(i));

  if (!hasWebGL()) { stillsFallback(go); return; }

  // Let the page paint and become interactive before pulling in three.js.
  await new Promise((r) => (window.requestIdleCallback ? requestIdleCallback(r, { timeout: 1500 }) : setTimeout(r, 600)));
  let stage;
  try {
    const { createStage } = await import('../three/stage.js');
    stage = createStage($('[data-canvas]'), { lite, reduced, instant: new URLSearchParams(location.search).has('qa') });
  } catch (e) {
    console.warn('3D unavailable, using stills', e);
    stillsFallback(go);
    return;
  }
  scripts = sceneScripts(stage);
  stage.renderOnce();
  requestAnimationFrame(() => stageEl.classList.add('is-live'));
  bindScroll(stage, go);

  // Hero: occasional single key, and one key per headline word.
  bus.on('hero:word', (m) => stage.piano.strike(m, 0.5, 0.18));
  if (!reduced) {
    const idle = () => { if (stage.mode === 'journey' && window.scrollY < innerHeight * 0.5) stage.piano.strike(48 + Math.floor(Math.random() * 30), 0.35, 0.25); };
    setInterval(idle, 4800);
  }
  // Finale: the notes the visitor played earlier, held as a chord.
  bus.on('finale:enter', () => {
    const played = store.get('notes') || [];
    const chord = played.length >= 2 ? played.slice(-4) : [48, 60, 64, 67];
    stage.piano.hold(chord);
  });
  window.__stage = stage;
}
