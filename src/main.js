import './styles/base.css';
import './styles/layout.css';
import './styles/sections.css';
import './styles/responsive.css';

import { reduced, gsap } from './lib/gsap.js';
import { initChrome } from './modules/chrome.js';
import { initMotion, refreshSoon } from './modules/motion.js';
import { initPlayNote } from './modules/playnote.js';
import { initMethod } from './modules/method.js';
import { initPackages } from './modules/packages.js';
import { initStudents } from './modules/students.js';
import { initRecital } from './modules/recital.js';
import { initAccordions } from './modules/accordions.js';
import { initMatcher } from './modules/matcher.js';
import { initPractice } from './modules/practice.js';
import { initForm } from './modules/form.js';
import { initJourney } from './modules/journey.js';

const data = JSON.parse(document.getElementById('site-data').textContent);
const params = new URLSearchParams(location.search);
if (reduced) document.documentElement.classList.add('rm');
// QA in software-rendered browsers: keep animation time tied to the wall clock
if (params.has('qa')) gsap.ticker.lagSmoothing(0);

if (params.has('pose')) {
  // Debug / still-rendering mode: one camera pose, no page logic.
  const { createStage } = await import('./three/stage.js');
  document.documentElement.classList.add('still');
  document.querySelector('[data-stage]').classList.add('is-live');
  const stage = createStage(document.querySelector('[data-canvas]'), { lite: params.has('lite'), reduced: true });
  const i = +params.get('pose');
  if (i === 9) { stage.setMode('finale'); stage.setFinale(1, true); stage.piano.hold([48, 60, 64, 67]); } else stage.setProgress(i, true);
  if (params.has('strike')) [60, 64, 67].forEach((m) => stage.piano.strike(m, 1, 5));
  if (params.has('res')) stage.piano.resonate(1);
  stage.start();
  setTimeout(() => { stage.stop(); window.__ready = true; }, +(params.get('t') || 1200));
} else {
  const safe = (fn, ...a) => { try { fn(...a); } catch (e) { console.error(fn.name, e); } };
  safe(initChrome);
  safe(initPlayNote);
  safe(initMethod);
  safe(initPackages, data);
  safe(initStudents);
  safe(initRecital);
  safe(initAccordions);
  safe(initMatcher, data);
  safe(initPractice);
  safe(initForm, data);
  safe(initMotion);
  refreshSoon();
  initJourney().catch((e) => console.error('journey', e));
}
