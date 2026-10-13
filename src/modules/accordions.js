// Two accordions with different musical metaphors:
//  · objections open like a piano lid (the icon's lid morphs open)
//  · FAQ bars expand like a measure of sheet music
import { gsap, $, $$, reduced } from '../lib/gsap.js';

const LID_CLOSED = 'M3 13 L37 13 L37 15 L3 15 Z';
const LID_OPEN = 'M3 13 L35 2 L36 4 L3 15 Z';

function accordion(root, btnSel, { onToggle } = {}) {
  $$(btnSel, root).forEach((btn) => {
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', open);
      onToggle?.(btn, open);
      if (reduced) { panel.hidden = !open; return; }
      gsap.killTweensOf(panel);
      if (open) {
        panel.hidden = false;
        gsap.fromTo(panel, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: 0.55, ease: 'power3.out', clearProps: 'height' });
        gsap.from(panel.firstElementChild, { y: -12, duration: 0.55, ease: 'power3.out' });
      } else {
        gsap.to(panel, { height: 0, opacity: 0, duration: 0.4, ease: 'power3.inOut', onComplete: () => { panel.hidden = true; gsap.set(panel, { clearProps: 'all' }); } });
      }
    });
  });
}

export function initAccordions() {
  const lids = $('[data-lids]');
  if (lids) accordion(lids, '.lid__btn', {
    onToggle: (btn, open) => {
      const lid = $('.lid__lid', btn);
      if (reduced) lid.setAttribute('d', open ? LID_OPEN : LID_CLOSED);
      else gsap.to(lid, { morphSVG: open ? LID_OPEN : LID_CLOSED, duration: 0.6, ease: open ? 'back.out(1.8)' : 'power3.inOut' });
    },
  });
  const faq = $('[data-faq]');
  if (faq) accordion(faq, '.bar__btn');
}
