// "Choose your rhythm": the selected option's key slides out (Flip), the
// detail card swaps, and the choice is remembered for the inquiry form.
import { gsap, Flip, $, $$, reduced } from '../lib/gsap.js';
import { store } from '../lib/store.js';
import { playNote } from '../lib/audio.js';

export function initPackages(data) {
  const root = $('[data-packages]');
  if (!root) return;
  const keys = $$('[role="radio"]', root);
  const cards = new Map($$('[data-pcard]', root).map((c) => [c.dataset.pcard, c]));
  const byId = new Map(data.packages.map((p) => [p.id, p]));
  let cur = keys.findIndex((k) => k.getAttribute('aria-checked') === 'true');
  if (cur < 0) cur = 0;

  function select(i, { focus = false, remember = true } = {}) {
    const state = reduced ? null : Flip.getState(keys);
    keys.forEach((k, j) => { k.classList.toggle('is-on', j === i); k.setAttribute('aria-checked', j === i); k.tabIndex = j === i ? 0 : -1; });
    if (state) Flip.from(state, { duration: 0.55, ease: 'power3.inOut' });
    if (focus) keys[i].focus();
    const id = keys[i].dataset.pkg;
    if (i !== cur) {
      const prev = cards.get(keys[cur].dataset.pkg), next = cards.get(id);
      cur = i;
      prev.hidden = true;
      next.hidden = false;
      if (!reduced) {
        gsap.fromTo(next, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.6, ease: 'expo.out' });
        gsap.from($$('.pcard__facts > div, .pcard__next', next), { y: 16, opacity: 0, stagger: 0.05, duration: 0.5, delay: 0.1 });
        gsap.from($$('.pkey__beats i', keys[i]), { scale: 0, stagger: 0.06, duration: 0.4, ease: 'back.out(3)' });
      }
      // the meter, played: 1 note, 4 notes, 6 notes
      const beats = $$('.pkey__beats i', keys[i]).length;
      for (let b = 0; b < Math.min(beats, 6); b++) setTimeout(() => playNote(b === 0 ? 60 : 67, b === 0 ? 0.6 : 0.35, 0.3), b * 140);
    }
    if (remember) store.set('interest', { id, label: byId.get(id)?.name || '' });
  }

  keys.forEach((k, i) => {
    k.addEventListener('click', () => select(i));
    k.addEventListener('keydown', (e) => {
      if (['ArrowDown', 'ArrowRight'].includes(e.key)) { e.preventDefault(); select((cur + 1) % keys.length, { focus: true }); }
      if (['ArrowUp', 'ArrowLeft'].includes(e.key)) { e.preventDefault(); select((cur - 1 + keys.length) % keys.length, { focus: true }); }
    });
  });

  // "Ask about …" buttons carry the choice to the form
  $$('[data-choose]', root).forEach((a) => a.addEventListener('click', () => {
    store.set('interest', { id: a.dataset.choose, label: byId.get(a.dataset.choose)?.name || a.dataset.chooseLabel });
  }));

  // restore a previous choice from this session
  const saved = store.get('interest');
  const si = saved ? keys.findIndex((k) => k.dataset.pkg === saved.id) : -1;
  if (si >= 0 && si !== cur) select(si, { remember: false });
}
