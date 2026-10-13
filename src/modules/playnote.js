// "Play a note": eight keys, a vibrating string, and a CTA after the first note.
// Works with mouse, touch, keyboard (A–K or Tab+Enter) and with sound off.
import { gsap, $, $$, reduced } from '../lib/gsap.js';
import { playNote, NOTE_MIDI } from '../lib/audio.js';
import { store } from '../lib/store.js';
import { bus } from '../lib/bus.js';

const KEYMAP = { a: 'C4', s: 'D4', d: 'E4', f: 'F4', g: 'G4', h: 'A4', j: 'B4', k: 'C5', w: 'C#4', e: 'D#4', t: 'F#4', y: 'G#4', u: 'A#4' };

export function initPlayNote() {
  const root = $('[data-playnote]');
  if (!root) return;
  const section = root.closest('section');
  const path = $('.string__path', root);
  const nameEl = $('[data-note-name]', root);
  const live = $('[data-note-live]', root);
  const after = $('[data-after]', section);
  const keys = new Map($$('[data-note]', root).map((b) => [b.dataset.note, b]));
  let played = 0;

  // the string: a quadratic curve whose midpoint swings and decays
  const s = { amp: 0, freq: 10, t: 0 };
  const draw = () => {
    s.t += gsap.ticker.deltaRatio() / 60;
    const y = 40 + Math.sin(s.t * s.freq) * s.amp;
    path.setAttribute('d', `M0 40 Q 300 ${y.toFixed(2)} 600 40`);
    s.amp *= 0.965;
    if (s.amp < 0.05) { s.amp = 0; path.setAttribute('d', 'M0 40 Q 300 40 600 40'); gsap.ticker.remove(draw); }
  };

  function press(note) {
    const btn = keys.get(note);
    if (!btn) return;
    const midi = NOTE_MIDI(note);
    playNote(midi, 0.75, 1.6);
    bus.emit('note:played', midi);
    btn.classList.add('is-down');
    setTimeout(() => btn.classList.remove('is-down'), 180);
    nameEl.textContent = note.replace('#', '♯').replace(/\d/, '');
    live.textContent = `${note.replace('#', ' sharp ')} played`;
    if (!reduced) {
      s.amp = 26; s.freq = 18 + (midi - 60) * 1.4;
      gsap.ticker.remove(draw); gsap.ticker.add(draw);
      gsap.fromTo(nameEl, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35 });
    }
    const notes = new Set(store.get('notes') || []);
    notes.add(midi);
    store.set('notes', [...notes].slice(-6));
    if (++played === 1) revealAfter();
  }

  function revealAfter() {
    after.hidden = false;
    if (reduced) return;
    gsap.from(after.children, { y: 20, opacity: 0, stagger: 0.12, duration: 0.7, ease: 'back.out(1.6)' });
  }

  root.addEventListener('pointerdown', (e) => {
    const b = e.target.closest('[data-note]');
    if (!b) return;
    e.preventDefault();
    press(b.dataset.note);
  });
  // keyboard activation of the focused key (pointer users already handled)
  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-note]');
    if (b && e.detail === 0) press(b.dataset.note);
  });

  // letter keys while the section is on screen and nothing editable has focus
  let inView = false;
  new IntersectionObserver(([en]) => (inView = en.isIntersecting), { threshold: 0.3 }).observe(section);
  window.addEventListener('keydown', (e) => {
    if (!inView || e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target.closest('input, textarea, select, [contenteditable]')) return;
    const note = KEYMAP[e.key.toLowerCase()];
    if (note) press(note);
  });
}
