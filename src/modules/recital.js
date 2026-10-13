// The recital room. Video loads only when someone presses play, the room's
// lights dim, and nothing ever autoplays with sound.
import { $, $$ } from '../lib/gsap.js';

export function initRecital() {
  const root = $('[data-recital]');
  if (!root) return;
  const screen = $('[data-screen]', root);
  const playBtn = $('[data-play]', root);
  const label = $('[data-screen-label]', root);
  const poster = $('[data-screen-poster]', root);
  const videos = JSON.parse($('[data-videos]', root).textContent);
  const items = $$('[data-video]', root);
  let cur = 0;
  const dimmer = document.createElement('div');
  dimmer.className = 'recital-dimmer';
  document.body.appendChild(dimmer);

  const dim = (on) => { root.classList.toggle('is-dim', on); dimmer.style.opacity = on ? 1 : 0; };

  function clearMedia() {
    $$('video, iframe, .screen__empty', screen).forEach((n) => n.remove());
    playBtn.hidden = false;
    dim(false);
  }

  function select(i) {
    cur = i;
    items.forEach((b, j) => { b.classList.toggle('is-on', j === i); b.setAttribute('aria-pressed', j === i); });
    clearMedia();
    const v = videos[i];
    label.textContent = v.title || 'Performance video';
    if (v.poster) poster.src = v.poster;
    playBtn.setAttribute('aria-label', `Play: ${v.title}`);
  }

  function play() {
    const v = videos[cur];
    dim(true);
    if (v.src) {
      const el = document.createElement('video');
      Object.assign(el, { controls: true, playsInline: true, preload: 'metadata', src: v.src });
      if (v.poster) el.poster = v.poster;
      if (v.captions) {
        const tr = document.createElement('track');
        Object.assign(tr, { kind: 'captions', srclang: 'en', label: 'English', src: v.captions, default: true });
        el.appendChild(tr);
      }
      el.addEventListener('ended', () => dim(false));
      screen.appendChild(el);
      playBtn.hidden = true;
      el.play().catch(() => {});
      el.focus();
    } else if (v.youtube) {
      const f = document.createElement('iframe');
      f.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.youtube)}?autoplay=1&cc_load_policy=1&rel=0`;
      f.title = v.title || 'Performance video';
      f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      screen.appendChild(f);
      playBtn.hidden = true;
    } else {
      // No verified footage yet: say so instead of faking a player.
      const p = document.createElement('p');
      p.className = 'screen__empty';
      p.textContent = 'Video slot — performance footage from Lisa\'s current site goes here.';
      screen.appendChild(p);
      setTimeout(() => dim(false), 2600);
    }
  }

  playBtn.addEventListener('click', play);
  // "Watch a student perform" in the hero picks the performance; the visitor presses play.
  $$('[data-watch]').forEach((a) => a.addEventListener('click', () => select(+a.dataset.watch)));
  items.forEach((b, i) => b.addEventListener('click', () => select(i)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && root.classList.contains('is-dim')) clearMedia(); });
  dimmer.addEventListener('click', clearMedia);
  // leaving the room turns the lights back on
  new IntersectionObserver(([en]) => { if (!en.isIntersecting) { $$('video', screen).forEach((v) => v.pause()); dim(false); } }, { threshold: 0.1 }).observe(root);
}
