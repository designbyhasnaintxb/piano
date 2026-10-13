// Practice room: a timer (5/10/15 min) and a metronome. Visual first;
// clicks/chimes only if sound is on. Time is computed from timestamps so a
// backgrounded tab stays accurate.
import { gsap, $, $$, reduced } from '../lib/gsap.js';
import { sound, tick, playNote } from '../lib/audio.js';

const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

function radiogroup(buttons, onPick) {
  buttons.forEach((b, i) => {
    b.addEventListener('click', () => pick(i));
    b.addEventListener('keydown', (e) => {
      if (['ArrowRight', 'ArrowDown'].includes(e.key)) { e.preventDefault(); pick((i + 1) % buttons.length, true); }
      if (['ArrowLeft', 'ArrowUp'].includes(e.key)) { e.preventDefault(); pick((i - 1 + buttons.length) % buttons.length, true); }
    });
  });
  function pick(i, focus) {
    buttons.forEach((b, j) => { b.classList.toggle('is-on', j === i); b.setAttribute('aria-checked', j === i); b.tabIndex = j === i ? 0 : -1; });
    if (focus) buttons[i].focus();
    onPick(i);
  }
}

function initTimer() {
  const root = $('[data-timer]');
  if (!root) return;
  const timeEl = $('[data-time]', root), live = $('[data-timer-live]', root);
  const startBtn = $('[data-start]', root), resetBtn = $('[data-reset]', root);
  const done = $('[data-done]', root), note = $('[data-tnote]', root), track = $('.timer__track', root);
  const arm = $('.pendulum__arm', root);
  let total = 600, left = 600, endAt = 0, running = false, raf = 0;
  const swing = reduced ? null : gsap.fromTo(arm, { rotate: -16 }, { rotate: 16, duration: 60 / 60, ease: 'sine.inOut', repeat: -1, yoyo: true, paused: true });

  const render = () => {
    timeEl.textContent = fmt(Math.ceil(left));
    const p = 1 - left / total;
    gsap.set(note, { x: p * track.clientWidth, y: Math.sin(p * Math.PI * 4) * 10 });
  };
  const loop = () => {
    left = Math.max(0, (endAt - performance.now()) / 1000);
    render();
    if (left <= 0) return finish();
    raf = requestAnimationFrame(loop);
  };
  function start() {
    if (left <= 0) left = total;
    running = true; endAt = performance.now() + left * 1000;
    startBtn.textContent = 'Pause';
    done.hidden = true;
    swing?.play();
    live.textContent = `Timer started: ${fmt(left)} remaining.`;
    raf = requestAnimationFrame(loop);
  }
  function pause() {
    running = false; cancelAnimationFrame(raf);
    startBtn.textContent = 'Resume';
    swing?.pause();
    live.textContent = `Paused at ${fmt(left)}.`;
  }
  function reset() {
    running = false; cancelAnimationFrame(raf);
    left = total; startBtn.textContent = 'Start';
    swing?.pause(); if (swing) gsap.to(arm, { rotate: 0, duration: 0.3 });
    done.hidden = true; render();
  }
  function finish() {
    running = false; left = 0; render();
    startBtn.textContent = 'Start again';
    swing?.pause(); if (swing) gsap.to(arm, { rotate: 0, duration: 0.4 });
    done.hidden = false;
    live.textContent = 'Session complete. Nice work.';
    [72, 76, 79, 84].forEach((m, i) => setTimeout(() => playNote(m, 0.45, 1.6), i * 120));
    if (!reduced) gsap.from(done.children, { y: 16, opacity: 0, stagger: 0.1, duration: 0.6, ease: 'back.out(1.6)' });
  }
  startBtn.addEventListener('click', () => (running ? pause() : start()));
  resetBtn.addEventListener('click', reset);
  radiogroup($$('[data-min]', root), (i) => { total = +$$('[data-min]', root)[i].dataset.min * 60; reset(); });
  window.addEventListener('resize', render, { passive: true });
  render();
}

const TERMS = [[60, 'Largo'], [66, 'Larghetto'], [76, 'Adagio'], [108, 'Andante'], [120, 'Moderato'], [168, 'Allegro'], [200, 'Presto'], [999, 'Prestissimo']];

function initMetronome() {
  const root = $('[data-metro]');
  if (!root) return;
  const input = $('[data-bpm-input]', root), bpmEl = $('[data-bpm]', root), termEl = $('[data-term]', root);
  const arc = $('[data-arc]', root), beats = $$('.metro__beats i', root);
  const btn = $('[data-metro-start]', root), tapBtn = $('[data-tap]', root);
  const len = arc.getTotalLength();
  arc.style.strokeDasharray = `${len}`;
  let bpm = +input.value, running = false, beat = 0, timer = 0, nextAt = 0;

  const setBpm = (v) => {
    bpm = Math.max(40, Math.min(208, Math.round(v)));
    input.value = bpm;
    bpmEl.textContent = bpm;
    termEl.textContent = TERMS.find(([max]) => bpm < max)[1];
    arc.style.strokeDashoffset = `${len * (1 - (bpm - 40) / 168)}`;
    input.setAttribute('aria-valuetext', `${bpm} beats per minute, ${termEl.textContent}`);
  };
  input.addEventListener('input', () => setBpm(+input.value));

  function flash(i) {
    beats.forEach((b, j) => b.classList.toggle('is-on', j === i));
    if (!reduced) gsap.fromTo(beats[i], { scale: 1.6 }, { scale: 1, duration: 0.25 });
  }
  // lookahead scheduler: audio clock when sound is on, timers otherwise
  function schedule() {
    const ctx = sound.on ? sound.ctx : null;
    const now = ctx ? ctx.currentTime : performance.now() / 1000;
    while (nextAt < now + 0.1) {
      const i = beat % 4, delay = Math.max(0, (nextAt - now) * 1000);
      if (ctx) tick(i === 0, nextAt);
      setTimeout(() => flash(i), delay);
      nextAt += 60 / bpm; beat++;
    }
  }
  function start() {
    running = true; beat = 0;
    const ctx = sound.on ? sound.ctx : null;
    nextAt = (ctx ? ctx.currentTime : performance.now() / 1000) + 0.05;
    timer = setInterval(schedule, 25);
    btn.textContent = 'Stop'; btn.setAttribute('aria-pressed', 'true');
  }
  function stop() {
    running = false; clearInterval(timer);
    beats.forEach((b) => b.classList.remove('is-on'));
    btn.textContent = 'Start'; btn.setAttribute('aria-pressed', 'false');
  }
  btn.addEventListener('click', () => (running ? stop() : start()));
  sound.subscribe(() => { if (running) { stop(); start(); } }); // switch clocks cleanly

  let taps = [];
  tapBtn.addEventListener('click', () => {
    const t = performance.now();
    taps = taps.filter((x) => t - x < 2500);
    taps.push(t);
    if (taps.length >= 2) {
      const iv = (taps[taps.length - 1] - taps[0]) / (taps.length - 1);
      setBpm(60000 / iv);
    }
  });
  // stop when off screen
  new IntersectionObserver(([en]) => { if (!en.isIntersecting && running) stop(); }).observe(root);
  setBpm(bpm);
}

export function initPractice() { initTimer(); initMetronome(); }
