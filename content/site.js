/**
 * SINGLE SOURCE OF CONTENT for the Lisa Mott site.
 *
 * Facts come from Lisa's current site (audited 2026-10-13, see
 * docs/CONTENT-AUDIT.md) and are marked ok(value, page). New copy written for
 * the redesign is marked draft() — it restates those facts in the section
 * flow/voice of the Livepower reference, and needs Lisa's sign-off.
 *
 * Run `npm run check:content` for anything still open.
 */
import { fact, draft, ok } from './slots.js';

const HOME = '/';
const ABOUT = '/about';
const PHIL = '/philosophy';
const START = '/howto';
const STU = '/mystudents';
const CONTACT = '/contact';

const AREAS = 'Eufaula, Alabama • Opelika • Auburn • Phenix City • Columbus, Georgia';

export default {
  /* ───────────────────────────── identity ───────────────────────────── */
  brand: {
    name: ok('Lisa Mott', CONTACT),
    descriptor: ok('Piano Lessons', HOME),
    legalName: ok('Piano Lessons with Lisa', HOME),
  },

  meta: {
    url: ok('https://pianolessonswithlisamott.com/', HOME),
    title: draft('Piano Lessons with Lisa Mott — Eufaula, Opelika, Auburn, Phenix City, Columbus & Online'),
    description: draft('Private piano lessons with Lisa Mott, teaching since 1993. Children age 5 and up and adults from beginner to early advanced — at your home, Lisa\'s home, or online.'),
  },

  // All facts are filled, so markers are off. Drafts are listed by `npm run check:content`.
  reviewMode: false,

  contact: {
    name: ok('Lisa Mott', CONTACT),
    email: ok('mottgal@gmail.com', CONTACT),
    phone: ok('608-259-6924', CONTACT),
    phoneHref: ok('+16082596924', CONTACT),
    phoneNote: ok('Phone or text', CONTACT),
    location: ok(AREAS, HOME),
    areas: ok(['Eufaula, Alabama', 'Opelika', 'Auburn', 'Phenix City', 'Columbus, Georgia'], HOME),
    virtualNote: ok('Virtual lessons are not limited to the areas listed above.', HOME),
    formats: ok('At your home, my home, or virtually', START),
    status: ok('Now Accepting Students', HOME),
    responseNote: draft('Lisa will be in touch to talk through your goals.'),
    bookingUrl: null,
    // No form service yet → the form opens a pre-written email to Lisa.
    formEndpoint: '',
  },

  /* ─────────────────────────────── hero ─────────────────────────────── */
  hero: {
    kicker: ok('Now Accepting Students', HOME),
    headline: draft(['All people', 'are', 'musical.'], { note: 'From Lisa\'s philosophy page: "I Believe That All People are Musical".' }),
    sub: draft('Private piano lessons with Lisa Mott — teaching since 1993, with a master\'s in Piano Pedagogy. For children age 5 and up and adults from beginner to early advanced, at your home, at Lisa\'s, or online.'),
    primaryCta: draft('Start Your Lessons'),
    secondaryCta: draft('Text Lisa'),
    watch: { label: draft('Watch a student perform'), title: ok('Wynnton — "Seven of Hearts"', STU) },
    trust: [
      { label: draft('Teaching'), value: ok('Since 1993', ABOUT) },
      { label: draft('Training'), value: ok('M.M. Piano Pedagogy', ABOUT) },
      { label: draft('Students'), value: ok('Age 5 to adult', ABOUT) },
      { label: draft('Lessons'), value: ok('Your home · Lisa\'s · Online', START) },
    ],
  },

  /* ───────────── 3D scroll journey — Lisa's three experiences ───────────── */
  journey: [
    { id: 'start', title: ok('All people are musical.', PHIL), body: draft('That belief is where every student\'s lessons begin.') },
    { id: 'somewhere', title: draft('Different skills. Different starting points.'), body: ok('We all show up with different skills and deficits. Let\'s fill in the deficits and nurture the skills together.', PHIL) },
    { id: 'foundations', title: ok('The spatial experience.', PHIL), body: ok('Reading music, and the geography of the keyboard.', PHIL) },
    { id: 'technique', title: ok('The physical experience.', PHIL), body: ok('Do I have freedom, comfort, and ease while playing my instrument?', PHIL) },
    { id: 'listening', title: ok('The aural experience.', PHIL), body: ok('What kind of sound am I making with my instrument?', PHIL) },
    { id: 'more', title: ok('Curiosity, love, and enjoyment.', PHIL), body: draft('Lisa\'s approach is built first and foremost on nurturing them.') },
    { id: 'confidence', title: draft('Real students. Real stages.'), body: ok('Wynnton and Dexter — their performances are below.', STU) },
    { id: 'music', title: ok('An adventure and a journey.', PHIL), body: ok('Let\'s experience the process together!', PHIL) },
  ],
  journeyImages: [
    { src: ok('/media/wynnton-still.webp', STU), alt: ok('Wynnton at the piano during a recital', STU) },
    { src: ok('/media/dexter-poster.webp', STU), alt: ok('Dexter performing on stage at a grand piano', STU) },
    { src: ok('/media/lisa-720.webp', ABOUT), alt: ok('Lisa Mott sitting at her piano', ABOUT) },
  ],

  /* ───────────────────────────── about (02) ───────────────────────────── */
  lisa: {
    kicker: draft('About Lisa'),
    statement: draft('Teaching private piano since 1993 — as a pedagogue, an accompanist, and a working musician.'),
    headline: draft(['The person', 'behind the piano.']),
    portrait: ok('/media/lisa-720.webp', ABOUT),
    portraitLarge: ok('/media/lisa-1400.webp', ABOUT),
    portraitAlt: ok('Lisa Mott, smiling, seated beside her piano with sheet music on the stand', ABOUT),
    bio: [
      ok('I have been teaching private piano lessons since 1993. In addition to teaching, I am also active as an accompanist and freelance musician.', ABOUT),
      ok('I teach children age 5 and up, as well as adults of all skill levels from beginners through early advanced students.', ABOUT),
      ok('I hold a master\'s degree in Piano Pedagogy from Columbus State University and have completed post-graduate studies in piano accompanying.', ABOUT),
      ok('In addition to private teaching, I have taught early childhood music classes and university-level courses for both credit and non-credit programs.', ABOUT),
    ],
    philosophy: ok('Learning to play the piano is both an adventure and a journey — let\'s experience the process together!', PHIL),
    stats: [
      { value: ok('1993', ABOUT), label: draft('Teaching private piano since') },
      { value: ok('M.M.', ABOUT), label: ok('Piano Pedagogy, Columbus State University', ABOUT) },
      { value: ok('5+', ABOUT), label: draft('Children from age 5, and adults of all levels') },
    ],
  },

  /* ───────────────────────────── why Lisa (03) ───────────────────────────── */
  why: {
    kicker: draft('Why Lisa'),
    headline: draft(['What every student', 'gets with Lisa.']),
    image: ok('/media/dexter-poster.webp', STU),
    imageAlt: ok('Dexter performing on stage at a grand piano', STU),
    imageCaption: ok('Dexter performing "Romance Op. 24, No. 9" by Jean Sibelius', STU),
    items: [
      { title: draft('Three decades of teaching'), body: draft('Private lessons since 1993, plus early childhood music classes and university-level courses.') },
      { title: draft('Trained in how people learn'), body: draft('A master\'s degree in Piano Pedagogy from Columbus State University, and post-graduate study in piano accompanying.') },
      { title: draft('A plan built for you'), body: ok('Each student has a unique set of goals and circumstances; therefore, each student has an individually tailored plan.', START) },
      { title: draft('A working musician'), body: draft('Lisa is active as an accompanist and freelance musician — not only a teacher.') },
    ],
  },

  /* ─────────────────────── the offer (Hormozi-style value stack) ───────────────────────
     Every line is a fact from Lisa's site. Price, guarantee, bonuses and limited
     spots are NOT here on purpose — see docs/OFFER-PLAN.md for what Lisa must decide. */
  offer: {
    kicker: draft('The offer'),
    name: draft('Private Piano, Built Around You'),
    headline: draft(['Everything you get', 'when you learn with Lisa.']),
    promise: draft('Learn to play with ease, read music with confidence, and actually enjoy practising — with one experienced teacher who builds the plan around you.'),
    stack: [
      { t: draft('A teacher with over 30 years of private teaching'), d: ok('Teaching private piano lessons since 1993.', ABOUT) },
      { t: draft('Trained in how people learn piano'), d: ok('Master\'s degree in Piano Pedagogy from Columbus State University, plus post-graduate study in piano accompanying.', ABOUT) },
      { t: draft('A plan built for your goals'), d: ok('Each student has an individually tailored plan for their piano education.', START) },
      { t: draft('Lessons where it\'s easiest for you'), d: ok('At your home, at Lisa\'s home, or virtually — and virtual lessons aren\'t limited to her local area.', START) },
      { t: draft('A complete approach, not just notes'), d: draft('Hear it, feel it, read it: the aural, physical and spatial experience of playing.') },
      { t: draft('A teacher for every stage'), d: ok('Children age 5 and up, and adults from beginners through early advanced students.', ABOUT) },
      { t: draft('Students who get on stage'), d: ok('Like Wynnton ("Seven of Hearts", Kevin Olson) and Dexter ("Romance Op. 24, No. 9", Jean Sibelius).', STU) },
      { t: draft('Free practice tools on this site'), d: draft('A practice timer and metronome you can use between lessons.') },
    ],
    notIncluded: draft('What you won\'t get: a one-size-fits-all method book and a teacher who rushes you through it.'),
    investment: draft('Your plan and rates are set after a short conversation about your goals. Asking costs nothing and commits you to nothing.'),
    cta: draft('Claim your spot'),
    textCta: draft('Text Lisa'),
  },

  /* ─────────────────────── who it's for (04) + first note ─────────────────────── */
  firstNote: {
    kicker: draft('Who it\'s for'),
    headline: draft(['Every student', 'starts with', 'one note.']),
    prompt: draft('Play a note.'),
    afterFirst: ok('All people are musical.', PHIL),
    cta: draft('Find your lesson path'),
    audiencesIntro: draft('Who Lisa teaches'),
    audiences: [
      { id: 'young', name: draft('Children, age 5 and up'), detail: draft('Lisa has also taught early childhood music classes, so young beginners are in experienced hands.') },
      { id: 'adult', name: draft('Adult beginners'), detail: ok('Adults of all skill levels, starting from beginners.', ABOUT) },
      { id: 'returning', name: draft('Adults, intermediate to early advanced'), detail: ok('Students through early advanced, each with an individually tailored plan.', ABOUT) },
    ],
  },

  /* ─────────────────────── how lessons work (05) — keys ─────────────────────── */
  method: {
    kicker: draft('How lessons work'),
    headline: draft(['Three experiences.', 'One approach.']),
    intro: ok('While each of my student\'s piano education is individualized, I do have a multifaceted approach encompassing three main concepts.', PHIL),
    steps: [
      { n: '01', name: ok('The aural experience', PHIL), body: ok('What kind of sound am I making with my instrument?', PHIL), lisa: draft('Listening comes first — hearing the sound you make is part of making it.') },
      { n: '02', name: ok('The physical experience', PHIL), body: ok('Do I have freedom, comfort, and ease while playing my instrument?', PHIL), lisa: draft('Playing should feel free and comfortable, not tense.') },
      { n: '03', name: ok('The spatial experience', PHIL), body: ok('In our instance, as it relates to the reading of music and the geography of the keyboard.', PHIL), lisa: draft('Reading music and finding your way around the keys.') },
      { n: '04', name: draft('Curiosity & enjoyment'), body: ok('My approach is contingent first and foremost upon nurturing a curiosity, love, and enjoyment of playing the piano.', PHIL), lisa: ok('Learning to play the piano is both an adventure and a journey.', PHIL) },
    ],
  },

  /* ─────────────────────── lesson formats (06) — "services" ─────────────────────── */
  packages: {
    kicker: draft('Lesson options'),
    headline: draft(['Three ways', 'to take lessons.']),
    intro: ok('Lessons occur at your home, my home, or virtually.', START),
    items: [
      {
        id: 'your-home', meter: '01',
        name: draft('At your home'),
        short: draft('Lisa comes to you'),
        whoFor: draft('Families and adults who would rather learn on their own piano, at home.'),
        where: ok(AREAS, HOME),
        plan: ok('An individually tailored plan for your goals and circumstances.', START),
        price: draft('Rates aren\'t published — contact Lisa to discuss your plan.'),
      },
      {
        id: 'lisas-home', meter: '02', featured: true,
        name: draft('At Lisa\'s home'),
        short: draft('Lessons at Lisa\'s piano'),
        whoFor: draft('Students who like a dedicated lesson space away from home.'),
        where: draft('Lisa will share the location when you get in touch.'),
        plan: ok('An individually tailored plan for your goals and circumstances.', START),
        price: draft('Rates aren\'t published — contact Lisa to discuss your plan.'),
      },
      {
        id: 'virtual', meter: '03',
        name: draft('Virtual lessons'),
        short: draft('Online, from anywhere'),
        whoFor: draft('Students outside Lisa\'s local area, or anyone who prefers to learn online.'),
        where: ok('Virtual lessons are not limited to the areas listed above.', HOME),
        plan: ok('An individually tailored plan for your goals and circumstances.', START),
        price: draft('Rates aren\'t published — contact Lisa to discuss your plan.'),
      },
    ],
    footnote: ok('Each student has a unique set of goals and circumstances; therefore, each student has an individually tailored plan for their piano education. Please contact me to discuss yours.', START),
  },

  /* ─────────────────────── my students (07) — recital room ─────────────────────── */
  recital: {
    kicker: ok('Showcasing My Students', STU),
    headline: draft(['Real students.', 'Real stages.']),
    videos: [
      { id: 'v1', student: ok('Wynnton', STU), piece: ok('"Seven of Hearts"', STU), composer: ok('Kevin Olson', STU),
        title: ok('Wynnton performing "Seven of Hearts" by Kevin Olson', STU),
        src: '/media/wynnton-seven-of-hearts.mp4', webm: '/media/wynnton-seven-of-hearts.webm', youtube: '', poster: '/media/wynnton-poster.webp', captions: '/media/wynnton.vtt' },
      { id: 'v2', student: ok('Dexter', STU), piece: ok('"Romance Op. 24, No. 9"', STU), composer: ok('Jean Sibelius', STU),
        title: ok('Dexter performing "Romance Op. 24, No. 9" by Jean Sibelius', STU),
        src: '/media/dexter-sibelius-romance.mp4', webm: '/media/dexter-sibelius-romance.webm', youtube: '', poster: '/media/dexter-poster.webp', captions: '/media/dexter.vtt' },
    ],
    after: draft('See what lessons can lead to'),
  },

  /* ─────────────────────── can I really learn? (08) ─────────────────────── */
  objections: {
    kicker: draft('Can I really learn?'),
    headline: draft(['You don\'t need', 'to be "naturally musical"', 'to start.'], { note: 'Lisa: "I Believe That All People are Musical."' }),
    items: [
      { q: draft('"I don\'t think I\'m musical."'), a: ok('I believe that all people are musical. We all show up with different skills and deficits. Let\'s fill in the deficits and nurture the skills together.', PHIL) },
      { q: draft('"I\'m an adult. Is it too late?"'), a: draft('No. Lisa teaches adults of all skill levels, from beginners through early advanced students.') },
      { q: draft('"My child is only five."'), a: draft('Lisa teaches children age 5 and up, and has also taught early childhood music classes.') },
      { q: draft('"I\'ve never read music."'), a: draft('Reading music is part of Lisa\'s approach from the start — she calls it the spatial experience: the reading of music and the geography of the keyboard.') },
      { q: draft('"We don\'t live in those towns."'), a: ok('Virtual lessons are not limited to the areas listed.', HOME) },
    ],
  },

  /* ─────────────────────── lesson matcher (09) ─────────────────────── */
  matcher: {
    kicker: draft('Find your lesson path'),
    headline: draft(['Three questions.', 'One clear next step.']),
    steps: [
      { id: 'who', q: draft('Who is learning?'), options: [
        { id: 'child', label: draft('A child, 5 or older') }, { id: 'young', label: draft('A child under 5') }, { id: 'adult', label: draft('An adult') },
      ] },
      { id: 'level', q: draft('Where are they starting?'), options: [
        { id: 'new', label: draft('Brand new') }, { id: 'some', label: draft('Some experience') },
        { id: 'mid', label: draft('Intermediate') }, { id: 'advanced', label: draft('Advanced') },
      ] },
      { id: 'where', q: draft('Where would lessons happen?'), options: [
        { id: 'your-home', label: draft('At our home') }, { id: 'lisas-home', label: draft('At Lisa\'s home') },
        { id: 'virtual', label: draft('Online') }, { id: 'unsure', label: draft('Not sure yet') },
      ] },
    ],
    // First matching rule wins. Each answer is grounded in what Lisa's site says.
    rules: [
      { when: { who: ['young'] }, title: draft('Talk with Lisa first'), why: draft('Lisa teaches children from age 5. She has also taught early childhood music classes, so ask what she suggests until then.') },
      { when: { level: ['advanced'] }, title: draft('Ask Lisa about fit'), why: draft('Lisa teaches students from beginners through early advanced — describe your level and she\'ll tell you honestly.') },
      { when: { where: ['virtual'] }, package: 'virtual', why: ok('Virtual lessons are not limited to the areas listed.', HOME) },
      { when: { where: ['your-home'] }, package: 'your-home', why: draft('Lisa comes to you in Eufaula, Opelika, Auburn, Phenix City and Columbus, Georgia.') },
      { when: { where: ['lisas-home'] }, package: 'lisas-home', why: draft('Lessons at Lisa\'s home — she\'ll share the details when you get in touch.') },
      { when: {}, title: draft('A tailored plan'), why: ok('Each student has a unique set of goals and circumstances; therefore, each student has an individually tailored plan.', START) },
    ],
    cta: draft('Ask Lisa about this path'),
    disclaimer: draft('A starting point based on your answers. Lisa will confirm what fits.'),
  },

  /* ─────────────────────────── practice tools ─────────────────────────── */
  practice: {
    kicker: draft('Practice room'),
    headline: draft(['A little practice.', 'Every day.']),
    intro: draft('A free timer and metronome you can use today. No account, no sign-up.'),
    durations: [5, 10, 15],
    done: draft('Nice work. Consistency compounds.'),
    cta: draft('Start lessons with Lisa'),
  },

  /* ─────────────────────────────── FAQ ─────────────────────────────── */
  faq: {
    kicker: draft('Questions'),
    headline: draft(['Before you', 'ask.']),
    items: [
      { q: draft('Is Lisa taking new students?'), a: ok('Yes — now accepting students.', HOME) },
      { q: draft('Where do lessons take place?'), a: ok('Lessons occur at your home, my home, or virtually.', START) },
      { q: draft('Which areas do you serve?'), a: ok(`${AREAS}. Virtual lessons are not limited to these areas.`, HOME) },
      { q: draft('What ages and levels do you teach?'), a: ok('I teach children age 5 and up, as well as adults of all skill levels from beginners through early advanced students.', ABOUT) },
      { q: draft('What is your background?'), a: ok('I have been teaching private piano lessons since 1993. I hold a master\'s degree in Piano Pedagogy from Columbus State University and have completed post-graduate studies in piano accompanying.', ABOUT) },
      { q: draft('How much do lessons cost?'), a: ok('Each student has a unique set of goals and circumstances; therefore, each student has an individually tailored plan for their piano education. Please contact me to discuss yours.', START) },
      { q: draft('How do I get in touch?'), a: ok('Email mottgal@gmail.com, or phone or text 608-259-6924.', CONTACT) },
    ],
  },

  /* ─────────────────────────── finale + form ─────────────────────────── */
  finale: {
    kicker: draft('Get in touch'),
    headline: draft(['Ready to', 'start your journey?']),
    beat: draft(['Hear it.', 'Feel it.', 'Read it.'], { note: 'Lisa\'s aural, physical and spatial experiences.' }),
    primaryCta: draft('Start Your Journey'),
    secondaryCta: draft('Call or text Lisa'),
  },

  form: {
    kicker: draft('Start the conversation'),
    headline: draft(['Tell Lisa', 'about you.']),
    intro: ok('Each student has a unique set of goals and circumstances. Please contact me to discuss yours. I look forward to hearing from you!', START),
    whoOptions: [draft('Myself'), draft('My child'), draft('Someone else')],
    ageOptions: [draft('5–8'), draft('9–12'), draft('13–17'), draft('Adult')],
    experienceOptions: [draft('Brand new'), draft('Some experience'), draft('Intermediate'), draft('Early advanced')],
    goalOptions: [draft('Play for enjoyment'), draft('Build strong fundamentals'), draft('Learn to read music'), draft('Not sure yet')],
    contactOptions: [draft('Email'), draft('Phone call'), draft('Text message')],
    submit: draft('Send to Lisa'),
    success: draft('Your email app should now be open with your message to Lisa — just press send.'),
    steps: [
      draft('Send this form, or call or text Lisa directly.'),
      draft('Lisa gets in touch to talk through your goals and circumstances.'),
      ok('You get an individually tailored plan for your piano education.', START),
    ],
  },

  footer: {
    note: ok('Piano Lessons with Lisa', HOME),
  },
};
