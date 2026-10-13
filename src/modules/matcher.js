// "Find your lesson path": three questions → the closest listed option.
// Rule-based (rules live in content/site.js), and it says so.
import { gsap, $, $$, reduced } from '../lib/gsap.js';
import { store } from '../lib/store.js';
import { playNote } from '../lib/audio.js';

export function initMatcher(data) {
  const root = $('[data-matcher]');
  if (!root) return;
  const steps = $$('[data-step]', root);
  const measures = $$('[data-measure]', root);
  const countEl = $('[data-step-n]', root);
  const result = $('[data-result]', root);
  const answers = {};
  let cur = 0;

  function show(i) {
    const prev = steps[cur];
    cur = i;
    countEl.textContent = Math.min(i + 1, steps.length);
    measures.forEach((m, j) => m.classList.toggle('is-on', j < i || (i >= steps.length && j <= steps.length)));
    const next = i < steps.length ? steps[i] : result;
    if (prev !== next) {
      prev.hidden = true;
      if (prev === result) result.hidden = true;
    }
    next.hidden = false;
    if (!reduced) gsap.fromTo(next, { x: 30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5 });
    const focusEl = i < steps.length ? $('input', next) : result;
    focusEl?.focus({ preventScroll: true });
  }

  function recommend() {
    const rule = data.matcher.rules.find((r) => Object.entries(r.when).every(([k, vals]) => vals.includes(answers[k]?.value)));
    const pkg = data.packages.find((p) => p.id === rule?.package);
    $('[data-result-name]', root).textContent = pkg ? pkg.name : 'A conversation with Lisa';
    $('[data-result-why]', root).textContent = rule?.why || '';
    const facts = pkg ? [pkg.duration, pkg.frequency, pkg.price && `${pkg.price}`].filter(Boolean).join(' · ') : '';
    const path = Object.values(answers).map((a) => a.label).join(' · ');
    $('[data-result-sum]', root).textContent = [path, facts].filter(Boolean).join('  →  ');
    store.set('path', path);
    if (pkg) store.set('interest', { id: pkg.id, label: pkg.name });
    [60, 64, 67, 72].forEach((m, k) => setTimeout(() => playNote(m, 0.5, 1.4), k * 110));
  }

  steps.forEach((st, i) => {
    $$('input', st).forEach((inp) => inp.addEventListener('change', () => {
      answers[inp.name] = { value: inp.value, label: inp.dataset.label };
      measures[i]?.classList.add('is-on');
      playNote([60, 64, 67][i] ?? 60, 0.5, 0.6);
      setTimeout(() => {
        if (i + 1 < steps.length) show(i + 1);
        else { recommend(); show(steps.length); }
      }, reduced ? 0 : 280);
    }));
    $('[data-back]', st)?.addEventListener('click', () => show(i - 1));
  });

  $('[data-restart]', root).addEventListener('click', () => {
    steps.forEach((s) => $$('input', s).forEach((x) => (x.checked = false)));
    Object.keys(answers).forEach((k) => delete answers[k]);
    result.hidden = true;
    steps.forEach((s, j) => (s.hidden = j !== 0));
    cur = 0;
    show(0);
  });
}
