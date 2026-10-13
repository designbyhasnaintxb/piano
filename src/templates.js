// Build-time HTML renderer. Pure string functions — runs in Node (vite.config.js).
// All Lisa-specific content flows from content/site.js through these helpers.
import { isSlot, plain, filled, collectSlots } from '../content/slots.js';

let REVIEW = true;

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Inline text for any slot. */
function t(v) {
  if (!isSlot(v)) return esc(v);
  if (v.__slot === 'ok') return esc(v.value);
  if (v.__slot === 'draft') {
    if (!REVIEW) return esc(v.text);
    const note = v.note ? ` data-note="${esc(v.note)}"` : '';
    return `<span class="slot-draft"${note}>${esc(v.text)}</span>`;
  }
  if (!REVIEW) return '';
  return `<span class="slot-fact" data-cls="${esc(v.cls || 'VERIFY')}">${esc(v.label)}</span>`;
}

/** Attribute-safe plain text. */
const a = (v) => esc(plain(v));

/** Headline lines (array draft/ok) → spans for SplitText/mask reveals. */
function lines(v, italic = []) {
  const arr = Array.isArray(plain(v)) ? plain(v) : [plain(v)];
  const draftCls = REVIEW && isSlot(v) && v.__slot === 'draft' ? ' slot-draft slot-draft--block' : '';
  const note = REVIEW && v?.note ? ` data-note="${esc(v.note)}"` : '';
  return `<span class="hl${draftCls}"${note}>${arr.map((l, i) =>
    `<span class="hl__line${italic.includes(i) ? ' is-italic' : ''}">${esc(l)}</span>`).join('')}</span>`;
}

/** Image slot → <img> when verified, labelled placeholder frame otherwise. */
function img(slot, altSlot, cls = '', sizes = '100vw') {
  if (filled(slot)) {
    return `<img class="${cls}" src="${a(slot)}" alt="${a(altSlot)}" loading="lazy" decoding="async" sizes="${sizes}">`;
  }
  const label = slot.label || 'Image';
  return `<div class="ph ${cls}" role="img" aria-label="Placeholder: ${esc(label)}">
    <span class="ph__staff" aria-hidden="true"></span>
    <span class="ph__label">${REVIEW ? `<span class="slot-fact" data-cls="${esc(slot.cls || 'KEEP')}">${esc(label)}</span>` : ''}</span>
  </div>`;
}

/* ───────────────────────── shared graphics ───────────────────────── */

export const monogram = (cls = 'mono') => `
<svg class="${cls}" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
  <g class="mono__staff" stroke="currentColor" stroke-width=".6" opacity=".42">
    <path d="M2 12.5H46M2 18.5H46M2 24.5H46M2 30.5H46M2 36.5H46"/>
  </g>
  <g fill="currentColor">
    <path class="mono__l" d="M7 5h6.2v26H20v12H7z"/>
    <path class="mono__m" d="M23 5h20v4h-2.6v34H36.4V9h-1.8v20h-4V9h-1.8v34H23z"/>
  </g>
</svg>`;

const staff = (cls = '') => `
<svg class="staff ${cls}" viewBox="0 0 1000 40" preserveAspectRatio="none" aria-hidden="true" focusable="false">
  <path class="staff__l" d="M0 4H1000"/><path class="staff__l" d="M0 12H1000"/><path class="staff__l" d="M0 20H1000"/>
  <path class="staff__l" d="M0 28H1000"/><path class="staff__l" d="M0 36H1000"/>
</svg>`;

/** Section divider: a staff that draws in, with a note travelling a phrase. */
const divider = (dark = false) => `
<div class="divider${dark ? ' divider--dark' : ''}" aria-hidden="true">
  <svg class="divider__svg" viewBox="0 0 1200 60" preserveAspectRatio="none" focusable="false">
    ${[10, 20, 30, 40, 50].map((y) => `<path class="divider__line" d="M0 ${y}H1200"/>`).join('')}
    <path class="divider__phrase" d="M40 40 C 220 40, 260 20, 420 20 S 640 30, 780 25 S 1020 10, 1160 30" fill="none"/>
    <ellipse class="divider__note" cx="0" cy="0" rx="7" ry="5" transform="rotate(-20)"/>
  </svg>
</div>`;

const arrow = `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 12h15m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`;

const kicker = (v, n) => `<p class="kicker"><span class="kicker__n">${n}</span><span class="kicker__t">${t(v)}</span></p>`;

const soundIcon = `<svg class="ico ico--sound" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z" fill="currentColor"/>
  <path class="ico--sound__on" d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <path class="ico--sound__off" d="M16 9.5l5 5m0-5-5 5" fill="none" stroke="currentColor" stroke-width="1.4"/>
</svg>`;

/* ───────────────────────────── sections ─────────────────────────────
   Section flow follows the Livepower reference: promise → about statement →
   why → who → method → options → proof → objections → path → tools → FAQ →
   final call → contact. Visual design is this site's own. */

const play = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 5.5v13l10-6.5z" fill="currentColor"/></svg>`;

function nav(c) {
  const items = [['#lisa', 'About'], ['#lessons', 'Approach'], ['#options', 'Lessons'], ['#students', 'Students'], ['#faq', 'FAQ']];
  return `
<a class="skip" href="#main">Skip to content</a>
<header class="nav" data-nav>
  <a class="brand" href="#top" aria-label="${a(c.brand.legalName)}, back to top">
    ${monogram('mono brand__mono')}
    <span class="brand__wm"><span class="brand__name">${t(c.brand.name)}</span><span class="brand__desc">${t(c.brand.descriptor)}</span></span>
  </a>
  <nav class="nav__keys" aria-label="Primary">
    <ul>${items.map(([h, l]) => `<li><a class="navkey" href="${h}"><span>${l}</span></a></li>`).join('')}</ul>
  </nav>
  <div class="nav__end">
    <button class="sound-toggle" type="button" aria-pressed="false" data-sound-toggle>
      ${soundIcon}<span class="sound-toggle__label">Sound off</span>
    </button>
    <a class="btn btn--key btn--sm nav__cta" href="#inquire" data-cta="nav">Start lessons</a>
    <button class="nav__menu" type="button" aria-expanded="false" aria-controls="menu" data-menu-btn>
      <span class="nav__menu-bars" aria-hidden="true"></span><span class="sr">Menu</span>
    </button>
  </div>
</header>
<div class="menu" id="menu" hidden data-menu>
  <ul class="menu__keys">${[...items, ['#path', 'Find your path'], ['#practice', 'Practice room'], ['#inquire', 'Start lessons']]
    .map(([h, l], i) => `<li><a href="${h}" class="menu__key"><span class="menu__n">${String(i + 1).padStart(2, '0')}</span>${l}</a></li>`).join('')}</ul>
  <p class="menu__contact"><a href="tel:${a(c.contact.phoneHref)}">${t(c.contact.phoneNote)} · ${t(c.contact.phone)}</a><a href="mailto:${a(c.contact.email)}">${t(c.contact.email)}</a></p>
</div>
<div class="progress" aria-hidden="true" data-progress>
  <svg viewBox="0 0 1000 12" preserveAspectRatio="none" focusable="false">
    ${[1.5, 3.75, 6, 8.25, 10.5].map((y) => `<path d="M0 ${y}H1000"/>`).join('')}
  </svg>
  <span class="progress__note"></span>
</div>`;
}

function hero(c) {
  const h = c.hero, v = c.recital.videos[0];
  return `
<section class="hero" id="top" aria-labelledby="hero-title" data-scene="hero">
  <div class="hero__copy wrap">
    <p class="kicker hero__status"><span class="hero__dot" aria-hidden="true"></span><span class="kicker__t">${t(h.kicker)}</span></p>
    <h1 class="hero__title display" id="hero-title">${lines(h.headline, [2])}</h1>
    <p class="hero__sub lede">${t(h.sub)}</p>
    <div class="hero__ctas">
      <a class="btn btn--key" href="#inquire" data-cta="hero">${t(h.primaryCta)} ${arrow}</a>
      <a class="btn btn--line" href="#lessons">${t(h.secondaryCta)}</a>
    </div>
  </div>
  <a class="hero__watch" href="#students" data-watch="0">
    <span class="hero__watch-media"><img src="${esc(v.poster)}" alt="" width="792" height="540" loading="lazy" decoding="async"><span class="hero__watch-play">${play}</span></span>
    <span class="hero__watch-t"><small>${t(h.watch.label)}</small>${t(h.watch.title)}</span>
  </a>
  <div class="hero__trust wrap">
    ${staff('hero__staff')}
    <dl class="trust">${h.trust.map((x) => `<div class="trust__i"><dt>${t(x.label)}</dt><dd>${t(x.value)}</dd></div>`).join('')}</dl>
  </div>
  <a class="hero__cue" href="#journey"><span>Scroll to open the piano</span><span class="hero__cue-line" aria-hidden="true"></span></a>
</section>`;
}

function journey(c) {
  const n = c.journey.length;
  return `
<section class="journey" id="journey" aria-label="Lisa's approach, told through the piano" data-scene="journey">
  <div class="journey__pin">
    <ol class="journey__caps">
      ${c.journey.map((s, i) => `
      <li class="jcap" data-cap="${i}" ${i === 0 ? '' : 'aria-hidden="true"'}>
        <p class="jcap__n"><span>${String(i + 1).padStart(2, '0')}</span> / ${String(n).padStart(2, '0')}</p>
        <h2 class="jcap__t">${t(s.title)}</h2>
        <p class="jcap__b">${t(s.body)}</p>
      </li>`).join('')}
    </ol>
    <div class="journey__rail" aria-hidden="true">
      ${c.journey.map((s, i) => `<span class="journey__tick" data-tick="${i}"><i></i></span>`).join('')}
    </div>
    <div class="journey__students" aria-hidden="true">
      ${c.journeyImages.map((im) => img(im.src, im.alt, 'jstudent', '20vw')).join('')}
    </div>
  </div>
</section>`;
}

function lisa(c) {
  const l = c.lisa;
  return `
<section class="lisa sec sec--paper" id="lisa" aria-labelledby="lisa-title">
  ${divider()}
  <div class="wrap about">
    ${kicker(l.kicker, '01')}
    <p class="about__statement">${t(l.statement)}</p>
  </div>
  <div class="wrap lisa__grid">
    <figure class="lisa__portrait" data-reveal="portrait">
      <img class="lisa__img" src="${a(l.portrait)}" srcset="${a(l.portrait)} 720w, ${a(l.portraitLarge)} 1400w" sizes="(min-width: 900px) 40vw, 82vw" alt="${a(l.portraitAlt)}" width="720" height="960" loading="lazy" decoding="async">
      <figcaption class="lisa__cap">${t(c.contact.name)} · ${t(c.brand.legalName)}</figcaption>
    </figure>
    <div class="lisa__copy">
      <h2 class="display display--l" id="lisa-title">${lines(l.headline, [1])}</h2>
      <div class="lisa__bio">${l.bio.map((p) => `<p>${t(p)}</p>`).join('')}</div>
      <blockquote class="lisa__quote"><p>${t(l.philosophy)}</p></blockquote>
      <dl class="stats">${l.stats.map((m) => `<div class="stat"><dt>${t(m.label)}</dt><dd>${t(m.value)}</dd></div>`).join('')}</dl>
    </div>
  </div>
</section>`;
}

function why(c) {
  const w = c.why;
  return `
<section class="why sec sec--dark" id="why" aria-labelledby="why-title">
  ${divider(true)}
  <div class="wrap why__head">
    <div>${kicker(w.kicker, '02')}<h2 class="display display--l" id="why-title">${lines(w.headline, [1])}</h2></div>
  </div>
  <div class="wrap why__grid">
    <figure class="why__media">
      ${img(w.image, w.imageAlt, 'why__img', '(min-width: 900px) 34vw, 100vw')}
      <figcaption>${t(w.imageCaption)}</figcaption>
    </figure>
    <ul class="why__list">
      ${w.items.map((x, i) => `<li class="wcard"><span class="wcard__n">${String(i + 1).padStart(2, '0')}</span><h3 class="wcard__t">${t(x.title)}</h3><p class="wcard__b">${t(x.body)}</p></li>`).join('')}
    </ul>
  </div>
</section>`;
}

function firstNote(c) {
  const f = c.firstNote;
  const whites = [['C4', 'C'], ['D4', 'D'], ['E4', 'E'], ['F4', 'F'], ['G4', 'G'], ['A4', 'A'], ['B4', 'B'], ['C5', 'C']];
  const blacks = [['C#4', 0], ['D#4', 1], ['F#4', 3], ['G#4', 4], ['A#4', 5]];
  const kb = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K'];
  return `
<section class="first sec sec--ivory" id="first-note" aria-labelledby="first-title">
  <div class="wrap first__grid">
    <div class="first__copy">
      ${kicker(f.kicker, '03')}
      <h2 class="display display--l" id="first-title">${lines(f.headline, [2])}</h2>
      <div class="first__after" data-after hidden>
        <p class="first__after-t">${t(f.afterFirst)}</p>
        <a class="btn btn--key btn--dark" href="#path" data-cta="first-note">${t(f.cta)} ${arrow}</a>
      </div>
    </div>
    <div class="first__play" data-playnote>
      <div class="first__head">
        <p class="first__prompt">${t(f.prompt)}</p>
        <button class="sound-toggle sound-toggle--inline" type="button" aria-pressed="false" data-sound-toggle>
          ${soundIcon}<span class="sound-toggle__label">Sound off</span>
        </button>
      </div>
      <div class="string" aria-hidden="true">
        <svg viewBox="0 0 600 80" preserveAspectRatio="none" focusable="false"><path class="string__path" d="M0 40 Q 300 40 600 40"/></svg>
        <span class="string__note" data-note-name>—</span>
      </div>
      <div class="mini" role="group" aria-label="Eight-key piano. Use the buttons, or keys A to K on your keyboard.">
        <div class="mini__whites">
          ${whites.map(([id, l], i) => `<button type="button" class="mini__w" data-note="${id}" aria-label="${id.replace(/(\d)/, ' $1')}${id === 'C4' ? ' (middle C)' : ''}" aria-keyshortcuts="${kb[i]}"><span class="mini__l">${l}</span><kbd>${kb[i]}</kbd></button>`).join('')}
        </div>
        <div class="mini__blacks">
          ${blacks.map(([id, after]) => `<button type="button" class="mini__b" data-note="${id}" style="--after:${after}" aria-label="${id.replace('#', ' sharp ').replace(/ (\d)$/, ' $1')}"></button>`).join('')}
        </div>
      </div>
      <p class="first__hint">Sound is off by default. Every key also shows its note visually.</p>
      <p class="sr" aria-live="polite" data-note-live></p>
    </div>
  </div>
  <div class="wrap audiences">
    <h3 class="audiences__t">${t(f.audiencesIntro)}</h3>
    <ol class="audiences__list">
      ${f.audiences.map((x, i) => `<li class="aud"><span class="aud__n">${['I', 'II', 'III', 'IV'][i]}</span><h4 class="aud__name">${t(x.name)}</h4><p class="aud__d">${t(x.detail)}</p></li>`).join('')}
    </ol>
    <p class="audiences__areas"><strong>${t(c.contact.status)}</strong> in ${t(c.contact.location)}. ${t(c.contact.virtualNote)}</p>
  </div>
</section>`;
}

function method(c) {
  const m = c.method;
  return `
<section class="method sec sec--dark" id="lessons" aria-labelledby="method-title">
  ${divider(true)}
  <div class="wrap method__head">
    <div>
      ${kicker(m.kicker, '04')}
      <h2 class="display display--l" id="method-title">${lines(m.headline, [1])}</h2>
    </div>
    <p class="method__intro lede">${t(m.intro)}</p>
  </div>
  <div class="wrap method__body" data-method>
    <div class="method__panels">
      ${m.steps.map((s, i) => `
      <div class="mpanel" role="tabpanel" id="mpanel-${i}" aria-labelledby="mkey-${i}" ${i ? 'hidden' : ''} tabindex="0">
        <p class="mpanel__n">${s.n}</p>
        <h3 class="mpanel__t">${t(s.name)}</h3>
        <p class="mpanel__b">${t(s.body)}</p>
        <p class="mpanel__lisa"><span>In practice</span>${t(s.lisa)}</p>
      </div>`).join('')}
    </div>
    <div class="mkeys" role="tablist" aria-label="Parts of Lisa's approach">
      ${m.steps.map((s, i) => `
      <button class="mkey" role="tab" id="mkey-${i}" aria-controls="mpanel-${i}" aria-selected="${i === 0}" tabindex="${i ? -1 : 0}" type="button" data-i="${i}">
        <span class="mkey__n">${s.n}</span><span class="mkey__name">${a(s.name)}</span>
      </button>${i < m.steps.length - 1 ? '<span class="mkey__black" aria-hidden="true"></span>' : ''}`).join('')}
    </div>
  </div>
</section>`;
}

function packages(c) {
  const p = c.packages;
  return `
<section class="packages sec sec--ivory" id="options" aria-labelledby="pk-title">
  ${divider()}
  <div class="wrap packages__head">
    <div>${kicker(p.kicker, '05')}<h2 class="display display--l" id="pk-title">${lines(p.headline, [1])}</h2></div>
    <p class="lede">${t(p.intro)}</p>
  </div>
  <div class="wrap packages__body" data-packages>
    <div class="pkeys" role="radiogroup" aria-label="Lesson options">
      ${p.items.map((x) => `
      <button class="pkey${x.featured ? ' is-on' : ''}" role="radio" aria-checked="${!!x.featured}" tabindex="${x.featured ? 0 : -1}" type="button" data-pkg="${x.id}">
        <span class="pkey__meter" aria-hidden="true"><b>${esc(x.meter)}</b></span>
        <span class="pkey__name">${t(x.name)}</span>
        <span class="pkey__short">${t(x.short)}</span>
      </button>`).join('')}
    </div>
    <div class="pdetail" aria-live="polite">
      ${p.items.map((x) => `
      <article class="pcard" data-pcard="${x.id}" ${x.featured ? '' : 'hidden'} aria-label="${a(x.name)}">
        <div class="pcard__top">
          <p class="pcard__meter" aria-hidden="true">${esc(x.meter)} / ${String(p.items.length).padStart(2, '0')}</p>
          <h3 class="pcard__name">${t(x.name)}</h3>
          <p class="pcard__short">${t(x.short)}</p>
        </div>
        <dl class="pcard__facts">
          <div><dt>Who it's for</dt><dd>${t(x.whoFor)}</dd></div>
          <div><dt>Where</dt><dd>${t(x.where)}</dd></div>
          <div><dt>Your plan</dt><dd>${t(x.plan)}</dd></div>
          <div><dt>Rates</dt><dd>${t(x.price)}</dd></div>
        </dl>
        <div class="pcard__next">
          <a class="btn btn--key btn--dark" href="#inquire" data-choose="${x.id}" data-choose-label="${a(x.name)}">Ask about lessons ${esc(plain(x.name)).replace(/^At /, 'at ').replace(/^Virtual lessons$/, 'online')} ${arrow}</a>
          <p class="pcard__then">Or call or text <a href="tel:${a(c.contact.phoneHref)}">${t(c.contact.phone)}</a></p>
        </div>
      </article>`).join('')}
    </div>
  </div>
  <p class="wrap packages__foot">${t(p.footnote)}</p>
</section>`;
}

function recital(c) {
  const r = c.recital;
  const v0 = r.videos[0];
  return `
<section class="recital sec sec--black" id="students" aria-labelledby="rc-title" data-recital>
  <div class="recital__spot" aria-hidden="true"></div>
  <div class="wrap recital__head">
    ${kicker(r.kicker, '06')}
    <h2 class="display display--l" id="rc-title">${lines(r.headline, [1])}</h2>
  </div>
  <div class="wrap recital__stage">
    <div class="screen" data-screen>
      <img class="screen__img" src="${esc(v0.poster)}" alt="" loading="lazy" decoding="async" data-screen-poster>
      <div class="screen__shade" aria-hidden="true"></div>
      <p class="screen__label" data-screen-label>${t(v0.title)}</p>
      <button class="screen__play" type="button" data-play aria-label="Play: ${a(v0.title)}">
        ${play.replace('<svg', '<svg class="screen__play-ico"')}
        <span>Play with sound · captions included</span>
      </button>
    </div>
    <ol class="programme" aria-label="Programme">
      ${r.videos.map((v, i) => `<li><button type="button" class="programme__i${i ? '' : ' is-on'}" data-video="${i}" aria-pressed="${i === 0}">
        <span class="programme__n">${['I', 'II', 'III', 'IV'][i]}.</span>
        <span class="programme__t"><strong>${t(v.student)}</strong> ${t(v.piece)}<em>${t(v.composer)}</em></span>
      </button></li>`).join('')}
    </ol>
  </div>
  <div class="wrap recital__after">
    <p>${t(r.after)}</p>
    <a class="btn btn--key" href="#inquire">Start your lessons ${arrow}</a>
  </div>
  <script type="application/json" data-videos>${JSON.stringify(r.videos.map((v) => ({ src: v.src, webm: v.webm || '', youtube: v.youtube, poster: v.poster, captions: v.captions, title: plain(v.title) }))).replace(/</g, '\\u003c')}</script>
</section>`;
}

const lidIcon = `<svg class="lid__ico" viewBox="0 0 40 24" aria-hidden="true" focusable="false">
  <path class="lid__lid" d="M3 13 L37 13 L37 15 L3 15 Z"/>
  <path class="lid__body" d="M3 16h34v4H3z"/>
  <path class="lid__leg" d="M6 20v3M34 20v3"/>
</svg>`;

function objections(c) {
  const o = c.objections;
  return `
<section class="lids sec sec--ivory" id="can-i" aria-labelledby="ob-title">
  ${divider()}
  <div class="wrap lids__grid">
    <div class="lids__head">
      ${kicker(o.kicker, '07')}
      <h2 class="display display--m" id="ob-title">${lines(o.headline, [1])}</h2>
    </div>
    <ul class="lids__list" data-lids>
      ${o.items.map((x, i) => `
      <li class="lid">
        <h3 class="lid__h"><button type="button" class="lid__btn" aria-expanded="false" aria-controls="lid-${i}" id="lidb-${i}">
          <span class="lid__q">${t(x.q)}</span>${lidIcon}
        </button></h3>
        <div class="lid__a" id="lid-${i}" role="region" aria-labelledby="lidb-${i}" hidden><div class="lid__inner"><p>${t(x.a)}</p></div></div>
      </li>`).join('')}
    </ul>
  </div>
</section>`;
}

function matcher(c) {
  const m = c.matcher;
  return `
<section class="matcher sec sec--wine" id="path" aria-labelledby="mt-title">
  <div class="wrap matcher__grid" data-matcher>
    <div class="matcher__head">
      ${kicker(m.kicker, '08')}
      <h2 class="display display--m" id="mt-title">${lines(m.headline, [1])}</h2>
      <div class="measures" aria-hidden="true">
        ${m.steps.map((s, i) => `<span class="measure" data-measure="${i}"><i class="measure__note"></i></span>`).join('')}
        <span class="measure measure--end" data-measure="${m.steps.length}"><i class="measure__note"></i></span>
      </div>
    </div>
    <form class="matcher__form" novalidate>
      <p class="matcher__count" aria-live="polite"><span data-step-n>1</span> of ${m.steps.length}</p>
      ${m.steps.map((s, i) => `
      <fieldset class="mstep" data-step="${i}" ${i ? 'hidden' : ''}>
        <legend class="mstep__q">${t(s.q)}</legend>
        <div class="mstep__opts">
          ${s.options.map((o) => `<label class="mopt"><input type="radio" name="${s.id}" value="${o.id}" data-label="${a(o.label)}"><span>${t(o.label)}</span></label>`).join('')}
        </div>
        ${i ? '<button type="button" class="btn btn--line btn--light mstep__back" data-back>Back</button>' : ''}
      </fieldset>`).join('')}
      <div class="mresult" data-result hidden tabindex="-1">
        <p class="mresult__k">Suggested next step</p>
        <h3 class="mresult__name" data-result-name></h3>
        <p class="mresult__why" data-result-why></p>
        <p class="mresult__sum" data-result-sum></p>
        <div class="mresult__ctas">
          <a class="btn btn--key" href="#inquire" data-result-cta>${t(m.cta)} ${arrow}</a>
          <button type="button" class="btn btn--line btn--light" data-restart>Start over</button>
        </div>
        <p class="mresult__note">${t(m.disclaimer)}</p>
      </div>
    </form>
  </div>
</section>`;
}

function practice(c) {
  const p = c.practice;
  return `
<section class="practice sec sec--paper" id="practice" aria-labelledby="pr-title">
  <div class="wrap practice__head">
    <div>${kicker(p.kicker, '09')}<h2 class="display display--m" id="pr-title">${lines(p.headline, [1])}</h2></div>
    <p class="lede">${t(p.intro)}</p>
  </div>
  <div class="wrap practice__grid">
    <div class="tool timer" data-timer>
      <h3 class="tool__t">Practice timer</h3>
      <div class="timer__choose" role="radiogroup" aria-label="Session length">
        ${p.durations.map((d, i) => `<button type="button" role="radio" class="chip${i === 1 ? ' is-on' : ''}" aria-checked="${i === 1}" tabindex="${i === 1 ? 0 : -1}" data-min="${d}">${d} min</button>`).join('')}
      </div>
      <div class="timer__face">
        <div class="pendulum" aria-hidden="true"><span class="pendulum__arm"><i></i></span><span class="pendulum__base"></span></div>
        <p class="timer__time" data-time role="timer" aria-live="off">10:00</p>
      </div>
      <div class="timer__track" aria-hidden="true">${staff('timer__staff')}<span class="timer__note" data-tnote></span></div>
      <div class="tool__ctrls">
        <button type="button" class="btn btn--key btn--dark" data-start>Start</button>
        <button type="button" class="btn btn--line" data-reset>Reset</button>
      </div>
      <div class="timer__done" data-done hidden>
        <p class="timer__done-t">${t(p.done)}</p>
        <a class="btn btn--key btn--dark" href="#inquire" data-cta="practice">${t(p.cta)} ${arrow}</a>
      </div>
      <p class="sr" aria-live="polite" data-timer-live></p>
    </div>
    <div class="tool metro" data-metro>
      <h3 class="tool__t">Metronome</h3>
      <div class="metro__dial">
        <svg class="metro__arc" viewBox="0 0 200 120" aria-hidden="true" focusable="false">
          <path class="metro__track" d="M20 110 A 80 80 0 0 1 180 110"/>
          <path class="metro__fill" d="M20 110 A 80 80 0 0 1 180 110" data-arc/>
        </svg>
        <p class="metro__bpm"><span data-bpm>72</span><small>BPM</small></p>
        <p class="metro__term" data-term>Adagio</p>
      </div>
      <label class="metro__slider"><span class="sr">Tempo in beats per minute</span>
        <input type="range" min="40" max="208" step="1" value="72" data-bpm-input>
      </label>
      <div class="metro__beats" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
      <div class="tool__ctrls">
        <button type="button" class="btn btn--key btn--dark" data-metro-start aria-pressed="false">Start</button>
        <button type="button" class="btn btn--line" data-tap>Tap tempo</button>
      </div>
      <p class="tool__note">Clicks are silent unless sound is on.</p>
    </div>
  </div>
</section>`;
}

function faq(c) {
  const f = c.faq;
  return `
<section class="faq sec sec--ivory" id="faq" aria-labelledby="faq-title">
  ${divider()}
  <div class="wrap faq__grid">
    <div class="faq__head">${kicker(f.kicker, '10')}<h2 class="display display--m" id="faq-title">${lines(f.headline, [1])}</h2></div>
    <div class="score" data-faq>
      ${f.items.map((x, i) => `
      <div class="bar">
        <h3 class="bar__h"><button type="button" class="bar__btn" aria-expanded="false" aria-controls="faq-${i}" id="faqb-${i}">
          <span class="bar__n">${i + 1}</span><span class="bar__q">${t(x.q)}</span><span class="bar__sign" aria-hidden="true"></span>
        </button></h3>
        <div class="bar__a" id="faq-${i}" role="region" aria-labelledby="faqb-${i}" hidden><div class="bar__inner"><p>${t(x.a)}</p></div></div>
      </div>`).join('')}
    </div>
  </div>
</section>`;
}

function finale(c) {
  const f = c.finale;
  const booking = filled(c.contact.bookingUrl) ? plain(c.contact.bookingUrl) : '';
  return `
<section class="finale" id="finale" aria-labelledby="fin-title" data-scene="finale">
  <div class="wrap finale__inner">
    <p class="kicker"><span class="kicker__t">${t(f.kicker)}</span></p>
    <h2 class="display finale__t" id="fin-title">${lines(f.headline, [1])}</h2>
    <p class="finale__beat">${plain(f.beat).map((b) => `<span>${esc(b)}</span>`).join('')}</p>
    <div class="finale__ctas">
      <a class="btn btn--key" href="${booking ? esc(booking) : '#inquire'}" data-cta="finale">${t(f.primaryCta)} ${arrow}</a>
      <a class="btn btn--line btn--light" href="tel:${a(c.contact.phoneHref)}">${t(f.secondaryCta)} · ${t(c.contact.phone)}</a>
    </div>
  </div>
</section>`;
}

function inquire(c) {
  const fm = c.form;
  const opts = (arr) => arr.map((o) => `<option>${a(o)}</option>`).join('');
  const radios = (name, arr) => arr.map((o, i) => `<label class="fchip"><input type="radio" name="${name}" value="${a(o)}" ${i === 0 ? 'required' : ''}><span>${t(o)}</span></label>`).join('');
  return `
<section class="inquire sec sec--ivory" id="inquire" aria-labelledby="inq-title">
  ${divider()}
  <div class="wrap inquire__grid">
    <div class="inquire__copy">
      ${kicker(fm.kicker, '11')}
      <h2 class="display display--m" id="inq-title">${lines(fm.headline, [1])}</h2>
      <p class="lede">${t(fm.intro)}</p>
      <dl class="inquire__contact">
        <div><dt>Email</dt><dd><a href="mailto:${a(c.contact.email)}">${t(c.contact.email)}</a></dd></div>
        <div><dt>${t(c.contact.phoneNote)}</dt><dd><a href="tel:${a(c.contact.phoneHref)}">${t(c.contact.phone)}</a></dd></div>
        <div><dt>Areas</dt><dd>${t(c.contact.location)}</dd></div>
        <div><dt>Lessons</dt><dd>${t(c.contact.formats)}</dd></div>
      </dl>
      <ol class="inquire__steps">
        ${fm.steps.map((s, i) => `<li><span>${i + 1}</span><p>${t(s)}</p></li>`).join('')}
      </ol>
    </div>
    <form class="inquiry" id="inquiry-form" data-inquiry novalidate aria-label="Lesson inquiry">
      <div class="inquiry__chosen" data-chosen hidden>
        <span>Interested in</span><strong data-chosen-label></strong>
        <button type="button" class="inquiry__clear" data-chosen-clear>Change</button>
      </div>
      <fieldset class="ff"><legend>Who is the student?</legend><div class="fchips">${radios('who', fm.whoOptions)}</div></fieldset>
      <div class="frow">
        <label class="ff"><span>Age</span><select name="age" required><option value="">Choose…</option>${opts(fm.ageOptions)}</select></label>
        <label class="ff"><span>Current experience</span><select name="experience" required><option value="">Choose…</option>${opts(fm.experienceOptions)}</select></label>
      </div>
      <div class="frow">
        <label class="ff"><span>Where would lessons happen?</span><select name="lesson" data-lesson-select><option value="">Not sure yet</option>${c.packages.items.map((p) => `<option value="${p.id}">${a(p.name)}</option>`).join('')}</select></label>
        <label class="ff"><span>Main goal</span><select name="goal"><option value="">Choose…</option>${opts(fm.goalOptions)}</select></label>
      </div>
      <div class="frow">
        <label class="ff"><span>Your name</span><input name="name" autocomplete="name" required></label>
        <label class="ff"><span>Email</span><input name="email" type="email" autocomplete="email" required></label>
      </div>
      <div class="frow">
        <label class="ff"><span>Phone <em>(optional)</em></span><input name="phone" type="tel" autocomplete="tel"></label>
        <label class="ff"><span>Preferred contact</span><select name="contact">${opts(fm.contactOptions)}</select></label>
      </div>
      <label class="ff"><span>Town, or "online" <em>(optional)</em></span><input name="town" autocomplete="address-level2"></label>
      <label class="ff"><span>Message <em>(optional)</em></span><textarea name="message" rows="3"></textarea></label>
      <input type="hidden" name="path" data-path-field>
      <p class="form-err" data-form-err role="alert" hidden></p>
      <button class="btn btn--key btn--dark btn--wide" type="submit">${t(fm.submit)} ${arrow}</button>
      <p class="inquiry__alt">Prefer to talk? ${t(c.contact.phoneNote)} <a href="tel:${a(c.contact.phoneHref)}">${t(c.contact.phone)}</a>.</p>
      <div class="inquiry__ok" data-form-ok hidden tabindex="-1"><p>${t(fm.success)}</p><p class="inquiry__ok-s">${t(c.contact.responseNote)}</p></div>
    </form>
  </div>
</section>`;
}

function footer(c) {
  return `
<footer class="foot">
  <div class="wrap foot__grid">
    <div class="foot__brand">${monogram('mono foot__mono')}<p class="foot__wm">${t(c.brand.name)}<span>${t(c.brand.descriptor)}</span></p></div>
    <nav aria-label="Footer"><ul class="foot__nav">
      <li><a href="#lisa">About Lisa</a></li><li><a href="#lessons">Lisa's approach</a></li><li><a href="#options">Lesson options</a></li>
      <li><a href="#students">My students</a></li><li><a href="#path">Find your path</a></li>
      <li><a href="#practice">Practice room</a></li><li><a href="#faq">FAQ</a></li><li><a href="#inquire">Start lessons</a></li>
    </ul></nav>
    <dl class="foot__contact">
      <div><dt>Email</dt><dd><a href="mailto:${a(c.contact.email)}">${t(c.contact.email)}</a></dd></div>
      <div><dt>${t(c.contact.phoneNote)}</dt><dd><a href="tel:${a(c.contact.phoneHref)}">${t(c.contact.phone)}</a></dd></div>
      <div><dt>Areas</dt><dd>${t(c.contact.location)}<br>${t(c.contact.virtualNote)}</dd></div>
    </dl>
  </div>
  <div class="wrap foot__base">${staff('foot__staff')}<p>© <span data-year>${new Date().getFullYear()}</span> ${t(c.brand.legalName)}</p><p>${t(c.contact.status)}</p></div>
</footer>
<nav class="sticky-nav" aria-label="Quick action"><a class="sticky-cta" href="#inquire" data-sticky><span data-sticky-label>Start lessons</span>${arrow}</a></nav>`;
}

/* ───────────────────────────── page ───────────────────────────── */

export function renderPage(c) {
  REVIEW = !!c.reviewMode;
  const open = collectSlots(c);
  const nFacts = open.filter((s) => s.__slot === 'fact').length;
  const nDraft = open.filter((s) => s.__slot === 'draft').length;
  const review = REVIEW && (nFacts || nDraft) ? `
<aside class="review" aria-label="Draft review status" data-review>
  <p><strong>Draft build.</strong><span class="review__long"> ${nFacts} facts are waiting for content; ${nDraft} lines of new copy need approval.</span><span class="review__short"> ${nFacts} facts open.</span>
  <button type="button" class="review__btn" data-review-toggle aria-pressed="true">Hide markers</button></p>
</aside>` : '';

  const data = {
    packages: c.packages.items.map((p) => ({ id: p.id, name: plain(p.name), short: plain(p.short) })),
    matcher: { rules: c.matcher.rules.map((r) => ({ when: r.when, package: r.package || '', title: plain(r.title) || '', why: plain(r.why) })) },
    contact: { email: plain(c.contact.email), phone: plain(c.contact.phone), endpoint: c.contact.formEndpoint || '' },
    journey: c.journey.map((j) => j.id),
    review: REVIEW,
  };

  return {
    body: [nav(c), review, '<main id="main">', hero(c), journey(c), lisa(c), why(c), firstNote(c), method(c), packages(c),
      recital(c), objections(c), matcher(c), practice(c), faq(c), finale(c), inquire(c), '</main>', footer(c),
      `<script type="application/json" id="site-data">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`].join('\n'),
    title: plain(c.meta.title),
    description: plain(c.meta.description),
    url: plain(c.meta.url),
    nFacts, nDraft,
  };
}
