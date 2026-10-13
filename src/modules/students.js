// Student wall: a horizontal piano roll on desktop (drag, buttons, native
// scroll), a vertical list on phones. Each story opens to its quote and path.
import { gsap, Flip, Observer, $, $$, reduced } from '../lib/gsap.js';

export function initStudents() {
  const track = $('[data-roll-track]');
  if (!track) return;
  const list = $('.roll__list', track);
  const stories = $$('[data-story]', track);
  const wide = window.matchMedia('(min-width: 761px)');

  const sizeStaff = () => track.style.setProperty('--roll-w', `${list.scrollWidth}px`);
  sizeStaff();
  window.addEventListener('resize', sizeStaff, { passive: true });

  // buttons: advance by one story
  $$('[data-roll]').forEach((b) => b.addEventListener('click', () => {
    const step = (stories[0]?.offsetWidth || 300) + 40;
    track.scrollBy({ left: step * +b.dataset.roll, behavior: reduced ? 'auto' : 'smooth' });
  }));

  // drag to scroll (desktop pointer only; touch keeps native scrolling)
  let moved = 0;
  Observer.create({
    target: track, type: 'pointer', dragMinimum: 4,
    onPress: () => { moved = 0; },
    onDragStart: () => wide.matches && track.classList.add('is-drag'),
    onDrag: (self) => { if (!wide.matches) return; moved += Math.abs(self.deltaX); track.scrollLeft -= self.deltaX; },
    onDragEnd: () => track.classList.remove('is-drag'),
  });
  track.addEventListener('click', (e) => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true);

  // open / close a story
  stories.forEach((st) => {
    const btn = $('.story__open', st), more = $('.story__more', st);
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      const state = reduced ? null : Flip.getState(stories);
      btn.setAttribute('aria-expanded', open);
      more.hidden = !open;
      st.classList.toggle('is-open', open);
      if (state) {
        Flip.from(state, { duration: 0.6, ease: 'power3.inOut', onComplete: sizeStaff });
        if (open) gsap.from($$('.story__q, .story__path li', more), { y: 14, opacity: 0, stagger: 0.07, duration: 0.5, delay: 0.2 });
      } else sizeStaff();
    });
  });

  // stories rise onto their staff lane as the wall scrolls into view
  if (!reduced) gsap.from(stories, { y: 60, opacity: 0, stagger: 0.08, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: track, start: 'top 80%', once: true } });
}
