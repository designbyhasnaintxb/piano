// Site chrome: nav (light/dark, active key, menu), the staff progress bar,
// sound toggles, review markers and the mobile sticky CTA.
import { gsap, ScrollTrigger, $, $$ } from '../lib/gsap.js';
import { sound } from '../lib/audio.js';
import { store, prefs } from '../lib/store.js';
import { playNote } from '../lib/audio.js';
import { smooth } from '../lib/smooth.js';

export function initChrome() {
  const nav = $('[data-nav]');

  /* nav background + light sections */
  ScrollTrigger.create({ start: 40, end: 'max', onToggle: (s) => nav.classList.toggle('is-scrolled', s.isActive) });
  // The page is light; the nav flips to dark only over dark sections.
  $$('.sec--dark, .sec--black, .foot').forEach((sec) => {
    ScrollTrigger.create({ trigger: sec, start: 'top top+=36', end: 'bottom top+=36', onToggle: (s) => nav.classList.toggle('is-dark', s.isActive) });
  });

  /* links: a small note head glides under the hovered link, and rests under the
     current section's link. Hover also plays the link's note when sound is on. */
  const keys = $$('.navkey');
  const dot = $('[data-nav-dot]');
  const nav0 = $('.nav__keys');
  const moveDot = (k) => {
    if (!dot) return;
    if (!k) { dot.classList.remove('is-on'); return; }
    const x = k.offsetLeft + k.offsetWidth / 2;
    dot.style.setProperty('--dot-x', `${x}px`);
    dot.classList.add('is-on');
  };
  const current = () => keys.find((k) => k.classList.contains('is-active'));
  keys.forEach((k) => {
    const enter = () => { moveDot(k); playNote(+k.dataset.pitch, 0.4, 0.5); };
    k.addEventListener('pointerenter', enter);
    k.addEventListener('focus', enter);
  });
  nav0?.addEventListener('pointerleave', () => moveDot(current()));
  nav0?.addEventListener('focusout', (e) => { if (!nav0.contains(e.relatedTarget)) moveDot(current()); });

  keys.forEach((k) => {
    const sec = $(k.getAttribute('href'));
    if (!sec) return;
    ScrollTrigger.create({ trigger: sec, start: 'top center', end: 'bottom center', onToggle: (s) => {
      k.classList.toggle('is-active', s.isActive);
      if (s.isActive) k.setAttribute('aria-current', 'location'); else k.removeAttribute('aria-current');
      if (!nav0?.matches(':hover')) moveDot(current());
    } });
  });

  /* mobile menu */
  const btn = $('[data-menu-btn]'), menu = $('[data-menu]');
  const setMenu = (open) => {
    btn.setAttribute('aria-expanded', open);
    menu.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) smooth.stop(); else smooth.start();
    if (open) nav.classList.remove('is-dark');
    if (open) {
      gsap.fromTo($$('.menu__key', menu), { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.04, duration: 0.5 });
      $('.menu__key', menu).focus();
    }
  };
  btn.addEventListener('click', () => setMenu(btn.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); btn.focus(); } });

  /* progress: one note travelling a thin staff */
  const note = $('.progress__note');
  const contour = [3, 1.5, 4.5, 6, 3.75, 8.25, 6, 2.6, 4.5, 1.5, 6, 3]; // a little melody, in staff px
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (s) => {
      const p = s.progress, f = p * (contour.length - 1), i = Math.floor(f), r = f - i;
      const y = contour[i] + ((contour[i + 1] ?? contour[i]) - contour[i]) * r;
      gsap.set(note, { x: p * (window.innerWidth - 10) + 5, y: y - 3.5 });
    },
  });

  /* sound toggles (nav + inline) */
  const toggles = $$('[data-sound-toggle]');
  toggles.forEach((t) => t.addEventListener('click', () => sound.toggle()));
  sound.subscribe((on) => toggles.forEach((t) => {
    t.setAttribute('aria-pressed', on);
    const l = $('.sound-toggle__label', t);
    if (l) l.textContent = on ? 'Sound on' : 'Sound off';
    t.setAttribute('aria-label', on ? 'Sound on — press to mute' : 'Sound off — press to turn on');
  }));

  /* review markers */
  const rt = $('[data-review-toggle]');
  if (rt) {
    const apply = (off) => {
      document.documentElement.classList.toggle('markers-off', off);
      rt.setAttribute('aria-pressed', !off);
      rt.textContent = off ? 'Show markers' : 'Hide markers';
    };
    apply(prefs.get('markers') === 'off');
    rt.addEventListener('click', () => { const off = !document.documentElement.classList.contains('markers-off'); prefs.set('markers', off ? 'off' : 'on'); apply(off); });
  }

  /* sticky CTA (phones): after the hero, hidden near the form */
  const sticky = $('[data-sticky]');
  const label = $('[data-sticky-label]');
  let pastHero = false, atForm = false;
  const sync = () => sticky.classList.toggle('is-on', pastHero && !atForm);
  ScrollTrigger.create({ trigger: '#first-note', start: 'top bottom', end: 'max', onToggle: (s) => { pastHero = s.isActive; sync(); } });
  ScrollTrigger.create({ trigger: '#finale', start: 'top 80%', end: 'max', onToggle: (s) => { atForm = s.isActive; sync(); } });
  const syncLabel = () => { const i = store.get('interest'); label.textContent = i?.label ? `Start lessons · ${i.label}` : 'Start lessons'; };
  store.subscribe(syncLabel);
  syncLabel();
}
