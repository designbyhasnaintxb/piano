// Smooth scrolling (Lenis) driven by GSAP's ticker, so ScrollTrigger, the 3D
// camera and the page all move on the same clock. Off under reduced motion;
// touch devices keep their native scrolling.
import Lenis from 'lenis';
import { gsap, ScrollTrigger, reduced } from './gsap.js';

let lenis = null;

export function initSmooth() {
  if (reduced) return null;
  lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true, syncTouch: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // In-page links glide instead of jumping, and focus follows for keyboard users.
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
    const id = a.getAttribute('href');
    const target = id.length > 1 && document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    // html's scroll-padding-top already reserves room for the header, and Lenis honours it.
    lenis.scrollTo(target, { duration: 1.4, onComplete: () => {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    } });
    history.pushState(null, '', id);
  });
  return lenis;
}

export const smooth = {
  stop: () => lenis?.stop(),
  start: () => lenis?.start(),
};
