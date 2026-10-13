// Typography and staff motion. Every reveal is timed to the site's tempo
// (sixteenths at 72 BPM) so the page enters "in rhythm", not as generic fades.
import { gsap, ScrollTrigger, SplitText, $, $$, reduced, SIXTEENTH } from '../lib/gsap.js';
import { bus } from '../lib/bus.js';

const HERO_PHRASE = [60, 64, 67, 72, 71, 67, 69, 65, 64]; // one key per word

export function initMotion() {
  if (reduced) { heroStatic(); return; }

  hero();

  // Section headlines: words rise out of a line mask, one per sixteenth.
  $$('.sec .display, .finale__t').forEach((el) => {
    const split = SplitText.create(el.querySelector('.hl') || el, { type: 'lines,words', mask: 'lines', linesClass: 'm-line' });
    gsap.from(split.words, {
      yPercent: 115, rotate: 3, transformOrigin: '0% 100%', duration: 0.9, ease: 'expo.out',
      stagger: SIXTEENTH * 0.6,
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
  });

  // Kickers: letter-spacing settles like a chord resolving.
  $$('.sec .kicker, .finale .kicker').forEach((k) => {
    const st = { trigger: k, start: 'top 90%', once: true };
    gsap.from(k.querySelector('.kicker__t'), { letterSpacing: '.5em', opacity: 0, duration: 1.2, ease: 'power2.out', scrollTrigger: st });
    const n = k.querySelector('.kicker__n');
    if (n) gsap.from(n, { opacity: 0, x: -10, duration: 0.6, scrollTrigger: { ...st } });
  });

  // Ledes & body copy: a reading wipe, top to bottom.
  $$('.sec .lede, .lisa__bio p, .lisa__quote, .about__statement').forEach((el) => {
    gsap.fromTo(el, { clipPath: 'inset(0 0 100% 0)', y: 12 }, {
      clipPath: 'inset(0 0 -10% 0)', y: 0, duration: 1.1, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  // Portrait & media: open like a lid, left to right.
  $$('.lisa__portrait > :first-child, .why__media').forEach((el) => {
    gsap.fromTo(el, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: el, start: 'top 80%', once: true } });
  });

  // Lists that read as a sequence get played in sequence.
  [['.aud', '.audiences'], ['.stat', '.stats'], ['.wcard', '.why__list'], ['.pkey', '.pkeys'], ['.mkey', '.mkeys'], ['.lid', '.lids__list'], ['.bar', '.score'], ['.programme li', '.programme'], ['.inquire__steps li', '.inquire__steps']]
    .forEach(([item, trig]) => {
      const t = $(trig);
      if (!t) return;
      gsap.from($$(item, t), { y: 26, opacity: 0, duration: 0.7, ease: 'back.out(1.6)', stagger: SIXTEENTH, scrollTrigger: { trigger: t, start: 'top 85%', once: true } });
    });

  dividers();
}

function hero() {
  const title = $('.hero__title .hl');
  const split = SplitText.create(title, { type: 'words', mask: 'words' });
  const tl = gsap.timeline({ delay: 0.25 });
  // Words land one per sixteenth note. If the piano is ready, it plays them.
  split.words.forEach((w, i) => {
    tl.from(w, { yPercent: 110, duration: 0.7, ease: 'expo.out', onStart: () => bus.emit('hero:word', HERO_PHRASE[i % HERO_PHRASE.length]) }, i * SIXTEENTH * 1.5);
  });
  tl.from('.hero .kicker', { opacity: 0, x: -14, duration: 0.6 }, 0)
    .fromTo('.hero__sub', { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 -10% 0)', duration: 1 }, '-=0.5')
    .from('.hero__ctas > *', { y: 18, opacity: 0, stagger: SIXTEENTH, duration: 0.6 }, '-=0.6')
    .from('.hero__staff .staff__l', { drawSVG: '0%', stagger: SIXTEENTH / 2, duration: 1.2, ease: 'power2.inOut' }, '-=0.8')
    .from('.trust__i', { opacity: 0, y: 10, stagger: SIXTEENTH, duration: 0.6 }, '-=0.9')
    .from('.hero__meta, .hero__cue', { opacity: 0, duration: 0.8 }, '-=0.5')
    .from('.hero__watch', { y: 24, opacity: 0, duration: 0.8, ease: 'back.out(1.4)' }, '-=0.6');

  // Hero copy drifts back as the camera starts to move.
  gsap.to('.hero__copy', { yPercent: -18, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: '70% top', scrub: true } });
  gsap.to('.hero__trust, .hero__cue, .hero__watch', { opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: '10% top', end: '45% top', scrub: true } });
}

function heroStatic() { /* content is already visible; nothing to do */ }

function dividers() {
  $$('.divider').forEach((d) => {
    const lines = $$('.divider__line', d), note = $('.divider__note', d), path = $('.divider__phrase', d);
    const tl = gsap.timeline({ scrollTrigger: { trigger: d, start: 'top 92%', once: true } });
    tl.from(lines, { drawSVG: '0%', duration: 1.1, stagger: SIXTEENTH / 2, ease: 'power2.inOut' })
      .fromTo(note, { opacity: 0 }, { opacity: 1, duration: 0.2 }, '-=0.4')
      .to(note, { duration: 2.4, ease: 'power1.inOut', motionPath: { path, align: path, alignOrigin: [0.5, 0.5] } }, '<');
  });
}

export function refreshSoon() {
  // fonts/images can shift layout; one batched refresh once things settle
  if (document.fonts?.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
}
