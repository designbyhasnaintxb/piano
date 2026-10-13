// "How lessons work": five white keys as an ARIA tablist.
import { gsap, SplitText, $, $$, reduced } from '../lib/gsap.js';
import { playNote } from '../lib/audio.js';

const PITCH = [60, 62, 64, 65, 67];

export function initMethod() {
  const root = $('[data-method]');
  if (!root) return;
  const tabs = $$('[role="tab"]', root);
  const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
  let cur = 0;

  function select(i, focus = false) {
    if (i === cur) { if (focus) tabs[i].focus(); return; }
    const prev = panels[cur];
    tabs.forEach((t, j) => { t.setAttribute('aria-selected', j === i); t.tabIndex = j === i ? 0 : -1; });
    if (focus) tabs[i].focus();
    playNote(PITCH[i], 0.6, 0.9);
    const next = panels[i];
    cur = i;
    if (reduced) { prev.hidden = true; next.hidden = false; return; }
    gsap.to(prev, { opacity: 0, x: -20, duration: 0.2, onComplete: () => {
      prev.hidden = true; gsap.set(prev, { clearProps: 'all' });
      next.hidden = false;
      const title = $('.mpanel__t', next);
      const split = SplitText.create(title, { type: 'chars' });
      gsap.timeline({ onComplete: () => split.revert() })
        .from($('.mpanel__n', next), { yPercent: 60, opacity: 0, duration: 0.5, ease: 'back.out(2)' })
        .from(split.chars, { yPercent: 80, opacity: 0, stagger: 0.018, duration: 0.45 }, 0.05)
        .from([$('.mpanel__b', next), $('.mpanel__lisa', next)], { y: 14, opacity: 0, stagger: 0.08, duration: 0.5 }, 0.15);
    } });
  }

  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(i));
    t.addEventListener('keydown', (e) => {
      const k = e.key;
      if (k === 'ArrowRight' || k === 'ArrowDown') { e.preventDefault(); select((cur + 1) % tabs.length, true); }
      if (k === 'ArrowLeft' || k === 'ArrowUp') { e.preventDefault(); select((cur - 1 + tabs.length) % tabs.length, true); }
      if (k === 'Home') { e.preventDefault(); select(0, true); }
      if (k === 'End') { e.preventDefault(); select(tabs.length - 1, true); }
    });
  });
}
