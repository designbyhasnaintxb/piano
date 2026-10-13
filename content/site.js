/**
 * SINGLE SOURCE OF CONTENT for the Lisa Mott site.
 *
 * Status: the source site could not be reached from the build environment
 * (see docs/CONTENT-AUDIT.md). Every Lisa-specific fact is therefore an
 * empty `fact()` slot, and every piece of new copy is a `draft()` awaiting
 * approval. Replace slots with `ok(value, 'source page')` as they are verified.
 *
 * Run `npm run check:content` for the outstanding list.
 */
import { fact, draft, ok } from './slots.js';

const SRC = 'https://pianolessonswithlisamott.com/';
const STU = 'https://pianolessonswithlisamott.com/mystudents';

export default {
  /* ───────────────────────────── identity ───────────────────────────── */
  brand: {
    name: ok('Lisa Mott', 'client brief'),
    descriptor: ok('Piano Lessons', 'client brief'),
    // Domain implies "Piano Lessons with Lisa Mott". Confirm the exact trading name.
    legalName: fact('Exact business name as written on the current site', { cls: 'VERIFY', source: SRC }),
  },

  meta: {
    url: ok('https://pianolessonswithlisamott.com/', 'client brief'),
    title: draft('Lisa Mott — Piano Lessons'),
    description: draft('Piano lessons with Lisa Mott. Lesson options, real student stories and an easy way to ask about starting.'),
  },

  /* When true, unresolved slots are visibly marked and a review bar shows.
     Production builds refuse to ship with unresolved fact slots unless
     ALLOW_PLACEHOLDERS=1 is set (see vite.config.js). */
  reviewMode: true,

  contact: {
    email: fact('Email address', { cls: 'KEEP', source: SRC }),
    phone: fact('Phone number (if published)', { cls: 'KEEP', source: SRC }),
    location: fact('Studio location / area served', { cls: 'KEEP', source: SRC }),
    formats: fact('Lesson format: in person, online, or both', { cls: 'TURN INTO OFFER', source: SRC }),
    responseNote: fact('How and when Lisa replies to inquiries', { cls: 'VERIFY', source: SRC }),
    // If the current site uses a booking/calendar tool, put its URL here and
    // the final CTA switches to it automatically.
    bookingUrl: null,
    // Form endpoint (Formspree, Netlify, own API…). Empty → mailto fallback.
    formEndpoint: '',
  },

  /* ─────────────────────────────── hero ─────────────────────────────── */
  hero: {
    kicker: draft('Piano lessons with Lisa Mott'),
    // Alternatives kept for when Lisa's real voice is known:
    //   "From first note to real music."  ·  "Learn to play. Learn to hear. Learn to love music."
    headline: draft(['Your first note', 'can become', 'a lifetime', 'of music.']),
    sub: draft('Piano lessons with Lisa Mott, built around each student — skill, confidence and a genuine relationship with music.',
      { note: 'Only keep "built around each student" if it matches Lisa\'s stated philosophy.' }),
    primaryCta: draft('Explore lessons'),
    secondaryCta: draft('Meet Lisa'),
    trust: [
      { label: draft('Teaching'), value: fact('Years teaching / experience', { cls: 'TURN INTO PROOF', source: SRC }) },
      { label: draft('Students'), value: fact('Ages taught', { cls: 'TURN INTO OFFER', source: SRC }) },
      { label: draft('Lessons'), value: fact('In person / online', { cls: 'TURN INTO OFFER', source: SRC }) },
      { label: draft('Studio'), value: fact('Location', { cls: 'KEEP', source: SRC }) },
    ],
  },

  /* ───────────────────────── 3D scroll journey ───────────────────────── */
  journey: [
    { id: 'start', title: draft('The start.'), body: draft('Every pianist begins in front of the same eighty-eight keys.') },
    { id: 'somewhere', title: draft('Every student starts somewhere.'), body: draft('A first lesson, a return after years away, a child\'s first week at the keys.') },
    { id: 'foundations', title: draft('Foundations.'), body: draft('Notes, hand shape, pulse. Small things done well, in order.') },
    { id: 'technique', title: draft('Technique turns motion into sound.'), body: draft('A key is a lever. A hammer meets a string. How you move decides what is heard.') },
    { id: 'listening', title: draft('Listening.'), body: draft('Hearing the sound you make is half of making it.') },
    { id: 'more', title: draft('Music is more than the right notes.'), body: draft('Phrasing, colour, balance — the string keeps singing after the key is down.') },
    { id: 'confidence', title: draft('Practice becomes confidence.'), body: draft('Real students, real progress — see their stories below.') },
    { id: 'music', title: draft('Confidence becomes music.'), body: draft('And music is something you keep for life.') },
  ],

  /* ─────────────────────── first note / audiences ─────────────────────── */
  firstNote: {
    headline: draft(['Every student', 'starts with', 'one note.']),
    prompt: draft('Play a note.'),
    afterFirst: draft('Every player starts with one.'),
    cta: draft('Start your lesson journey'),
    audiencesIntro: draft('Who lessons are for'),
    // Only keep audiences the current site confirms.
    audiences: [
      { id: 'young', name: draft('Young beginners'), detail: fact('Youngest age Lisa accepts / how she starts young children', { cls: 'VERIFY', source: SRC }) },
      { id: 'teen', name: draft('Teens'), detail: fact('What teen students work toward with Lisa', { cls: 'VERIFY', source: SRC }) },
      { id: 'adult', name: draft('Adult beginners'), detail: fact('Whether Lisa teaches adult beginners', { cls: 'VERIFY', source: SRC }) },
      { id: 'returning', name: draft('Returning players'), detail: fact('Whether Lisa takes returning / experienced students', { cls: 'VERIFY', source: SRC }) },
    ],
  },

  /* ───────────────────────────── meet Lisa ───────────────────────────── */
  lisa: {
    kicker: draft('Meet Lisa'),
    headline: draft(['The person', 'behind the piano.']),
    portrait: fact('Portrait of Lisa (from current site)', { cls: 'KEEP', source: SRC, kind: 'image' }),
    portraitAlt: fact('Alt text describing the portrait', { cls: 'KEEP' }),
    bio: [
      fact('Biography paragraph 1 — Lisa\'s teaching story, verbatim or lightly edited from the current site', { cls: 'REWRITE LIGHTLY', source: SRC }),
      fact('Biography paragraph 2 — background and training (only what the site states)', { cls: 'REWRITE LIGHTLY', source: SRC }),
    ],
    philosophy: fact('One sentence of Lisa\'s teaching philosophy, in her words', { cls: 'TURN INTO PROOF', source: SRC }),
    markers: [
      { label: draft('Background'), value: fact('Degree / training — only if stated', { cls: 'VERIFY', source: SRC }) },
      { label: draft('Teaching since'), value: fact('Year or years of teaching — only if stated', { cls: 'VERIFY', source: SRC }) },
      { label: draft('Affiliations'), value: fact('Memberships / certifications — only if stated', { cls: 'VERIFY', source: SRC }) },
    ],
  },

  /* ─────────────────────── how lessons work (keys) ─────────────────────── */
  method: {
    kicker: draft('How lessons work'),
    headline: draft(['Five things', 'every lesson', 'builds.']),
    intro: draft('Press a key to see what each part of a lesson is for.',
      { note: 'Replace the five areas with the categories Lisa actually uses.' }),
    steps: [
      { n: '01', name: draft('Foundation'), body: draft('Posture, hand shape, finding your way around the keyboard, and a steady pulse.'), lisa: fact('How Lisa teaches this', { cls: 'TURN INTO INTERACTION', source: SRC }) },
      { n: '02', name: draft('Technique'), body: draft('How fingers, wrists and arms turn movement into a clear, even sound.'), lisa: fact('How Lisa teaches this', { cls: 'TURN INTO INTERACTION', source: SRC }) },
      { n: '03', name: draft('Reading'), body: draft('Reading notes and rhythm so new music opens up without guesswork.'), lisa: fact('How Lisa teaches this', { cls: 'TURN INTO INTERACTION', source: SRC }) },
      { n: '04', name: draft('Musicality'), body: draft('Dynamics, phrasing and listening — making the notes say something.'), lisa: fact('How Lisa teaches this', { cls: 'TURN INTO INTERACTION', source: SRC }) },
      { n: '05', name: draft('Confidence'), body: draft('Playing for others, at whatever level suits the student.'), lisa: fact('Recitals / performance opportunities Lisa offers', { cls: 'TURN INTO PROOF', source: SRC }) },
    ],
  },

  /* ───────────────────────────── packages ───────────────────────────── */
  packages: {
    kicker: draft('Lesson options'),
    headline: draft(['Choose', 'your rhythm.']),
    intro: draft('Pick an option to see who it suits, what is included and what it costs.'),
    currency: '$',
    // One entry per option the current site actually lists. Names are drafts.
    items: [
      {
        id: 'intro', meter: '1', beats: 1,
        name: draft('Introductory lesson', { note: 'Only if Lisa offers a trial / first lesson.' }),
        whoFor: draft('Anyone who wants to meet Lisa and try a lesson before committing.'),
        duration: fact('Length', { cls: 'TURN INTO OFFER', source: SRC }),
        frequency: draft('Once'),
        price: fact('Price', { cls: 'TURN INTO OFFER', source: SRC }),
        priceUnit: draft('per lesson'),
        includes: [fact('What the first lesson includes', { cls: 'TURN INTO OFFER', source: SRC })],
      },
      {
        id: 'weekly', meter: '4/4', beats: 4, featured: true,
        name: draft('Weekly lessons'),
        whoFor: draft('Students who want steady progress with the same time each week.'),
        duration: fact('Length', { cls: 'TURN INTO OFFER', source: SRC }),
        frequency: draft('Weekly'),
        price: fact('Price', { cls: 'TURN INTO OFFER', source: SRC }),
        priceUnit: fact('Billing unit (per lesson / per month / per term)', { cls: 'TURN INTO OFFER', source: SRC }),
        includes: [fact('What is included', { cls: 'TURN INTO OFFER', source: SRC })],
      },
      {
        id: 'extended', meter: '6/8', beats: 6,
        name: draft('Extended weekly lessons'),
        whoFor: draft('More experienced students with longer pieces or performance goals.'),
        duration: fact('Length', { cls: 'TURN INTO OFFER', source: SRC }),
        frequency: draft('Weekly'),
        price: fact('Price', { cls: 'TURN INTO OFFER', source: SRC }),
        priceUnit: fact('Billing unit', { cls: 'TURN INTO OFFER', source: SRC }),
        includes: [fact('What is included', { cls: 'TURN INTO OFFER', source: SRC })],
      },
    ],
    footnote: fact('Payment / billing terms in one line', { cls: 'TURN INTO OFFER', source: SRC }),
  },

  /* ────────────────────────── student proof wall ────────────────────────── */
  students: {
    kicker: draft('My students'),
    headline: draft(['A wall', 'of progress.']),
    intro: draft('Real students of Lisa\'s, in their own words and moments.'),
    // Fill from /mystudents. Use names/photos only with permission as published there.
    items: Array.from({ length: 6 }, (_, i) => ({
      id: `s${i + 1}`,
      name: fact('Student name (as published)', { cls: 'TURN INTO PROOF', source: STU }),
      photo: fact('Student photo', { cls: 'TURN INTO PROOF', source: STU, kind: 'image' }),
      alt: fact('Photo description', { cls: 'TURN INTO PROOF' }),
      caption: fact('Caption / milestone from /mystudents', { cls: 'TURN INTO PROOF', source: STU }),
      quote: fact('Quote (student or parent), if published', { cls: 'TURN INTO PROOF', source: STU }),
      // Progression stages – only the ones the student's story supports.
      path: [
        { stage: draft('First lesson'), when: fact('When', { cls: 'TURN INTO PROOF', source: STU }) },
        { stage: draft('First song'), when: fact('Piece / when', { cls: 'TURN INTO PROOF', source: STU }) },
        { stage: draft('Performance'), when: fact('Recital / event', { cls: 'TURN INTO PROOF', source: STU }) },
      ],
    })),
  },

  /* ─────────────────────────── recital room ─────────────────────────── */
  recital: {
    kicker: draft('The recital room'),
    headline: draft(['What lessons', 'can lead to.']),
    // { title, src (mp4) or youtube id, poster, captions (vtt) }
    videos: [
      { id: 'v1', title: fact('Performance video title', { cls: 'TURN INTO PROOF', source: STU }), src: '', youtube: '', poster: '', captions: '' },
      { id: 'v2', title: fact('Performance video title', { cls: 'TURN INTO PROOF', source: STU }), src: '', youtube: '', poster: '', captions: '' },
      { id: 'v3', title: fact('Performance video title', { cls: 'TURN INTO PROOF', source: STU }), src: '', youtube: '', poster: '', captions: '' },
    ],
    after: draft('See what lessons can lead to'),
  },

  /* ─────────────────────── objections (piano lids) ─────────────────────── */
  objections: {
    kicker: draft('Can I really learn?'),
    headline: draft(['You don\'t need', 'to be "naturally musical"', 'to start.'], { note: 'Keep only if it matches Lisa\'s philosophy.' }),
    items: [
      { q: draft('"I\'m starting late."'), a: fact('Lisa\'s answer — does she teach adult beginners?', { cls: 'VERIFY', source: SRC }) },
      { q: draft('"My child is a complete beginner."'), a: fact('How Lisa starts young beginners', { cls: 'VERIFY', source: SRC }) },
      { q: draft('"We don\'t own the right piano yet."'), a: fact('Instrument requirements (acoustic / digital / weighted keys)', { cls: 'VERIFY', source: SRC }) },
      { q: draft('"I\'ve never read music."'), a: fact('Whether reading is taught from zero', { cls: 'VERIFY', source: SRC }) },
      { q: draft('"I tried lessons before and stopped."'), a: fact('How Lisa approaches returning students', { cls: 'VERIFY', source: SRC }) },
      { q: draft('"I\'m nervous about performing."'), a: fact('Whether recitals are optional', { cls: 'VERIFY', source: SRC }) },
    ],
  },

  /* ─────────────────────────── lesson matcher ─────────────────────────── */
  matcher: {
    kicker: draft('Find your lesson path'),
    headline: draft(['Three questions.', 'One clear next step.']),
    steps: [
      { id: 'who', q: draft('Who is learning?'), options: [
        { id: 'child', label: draft('A child') }, { id: 'teen', label: draft('A teen') }, { id: 'adult', label: draft('An adult') },
      ] },
      { id: 'level', q: draft('Where are they starting?'), options: [
        { id: 'new', label: draft('Brand new') }, { id: 'some', label: draft('Some experience') },
        { id: 'returning', label: draft('Returning after a break') }, { id: 'advanced', label: draft('Advanced') },
      ] },
      { id: 'goal', q: draft('What is the main goal?'), options: [
        { id: 'enjoy', label: draft('Play for enjoyment') }, { id: 'fundamentals', label: draft('Build strong fundamentals') },
        { id: 'perform', label: draft('Perform') }, { id: 'unsure', label: draft('Not sure yet') },
      ] },
    ],
    // First matching rule wins. `when` keys are step ids; values are option ids.
    // These are a draft mapping onto the draft packages above — Lisa should confirm.
    rules: [
      { when: { level: ['new'] }, package: 'intro', why: draft('Starting fresh: a first lesson is the simplest way to see if it feels right.') },
      { when: { goal: ['perform'], level: ['some', 'advanced', 'returning'] }, package: 'extended', why: draft('Performance goals usually need longer lessons for repertoire work.') },
      { when: {}, package: 'weekly', why: draft('A steady weekly slot is the usual way to keep progress moving.') },
    ],
    cta: draft('Ask Lisa about this path'),
    disclaimer: draft('A starting suggestion based on your answers — Lisa will confirm what fits.'),
  },

  /* ─────────────────────────── practice tools ─────────────────────────── */
  practice: {
    kicker: draft('Practice room'),
    headline: draft(['Ten good minutes', 'beat an hour of guessing.'], { note: 'General encouragement — not a claim about Lisa\'s method.' }),
    intro: draft('A small timer and metronome you can use today. No account, no sign-up.'),
    durations: [5, 10, 15],
    done: draft('Nice work. Consistency compounds.'),
    cta: draft('Start learning with Lisa'),
  },

  /* ─────────────────────────────── FAQ ─────────────────────────────── */
  faq: {
    kicker: draft('Studio policies & questions'),
    headline: draft(['Before you', 'ask.']),
    items: [
      { q: draft('Where do lessons take place?'), a: fact('Location / online details', { cls: 'KEEP', source: SRC }) },
      { q: draft('What ages do you teach?'), a: fact('Ages', { cls: 'KEEP', source: SRC }) },
      { q: draft('What happens if we miss a lesson?'), a: fact('Make-up policy', { cls: 'KEEP', source: SRC }) },
      { q: draft('What is the cancellation policy?'), a: fact('Cancellation policy', { cls: 'KEEP', source: SRC }) },
      { q: draft('How much practice is expected?'), a: fact('Practice expectations', { cls: 'VERIFY', source: SRC }) },
      { q: draft('Do we need an acoustic piano?'), a: fact('Instrument requirements', { cls: 'VERIFY', source: SRC }) },
      { q: draft('How does payment work?'), a: fact('Payment terms', { cls: 'KEEP', source: SRC }) },
      { q: draft('Are there recitals?'), a: fact('Recital opportunities', { cls: 'TURN INTO PROOF', source: SRC }) },
    ],
  },

  /* ─────────────────────────── finale + form ─────────────────────────── */
  finale: {
    headline: draft(['Your first note', 'can start here.']),
    primaryCta: draft('Ask about piano lessons'),
    secondaryCta: draft('View lesson options'),
  },

  form: {
    kicker: draft('Start the conversation'),
    intro: draft('A few details help Lisa reply with something useful. Nothing here commits you to anything.'),
    whoOptions: [draft('Myself'), draft('My child'), draft('Someone else')],
    ageOptions: [draft('Under 7'), draft('7–12'), draft('13–17'), draft('Adult')],
    experienceOptions: [draft('Brand new'), draft('Some experience'), draft('Returning after a break'), draft('Advanced')],
    goalOptions: [draft('Play for enjoyment'), draft('Build strong fundamentals'), draft('Perform'), draft('Not sure yet')],
    contactOptions: [draft('Email'), draft('Phone call'), draft('Text message')],
    submit: draft('Start the conversation'),
    success: draft('Thank you — your message is on its way to Lisa.'),
  },

  footer: {
    note: draft('Piano lessons with Lisa Mott.'),
  },
};
