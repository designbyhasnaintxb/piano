# Lisa Mott — Piano Lessons

A new website for Lisa Mott's piano lessons. It opens with a procedural 3D grand piano, follows the instrument through a scroll journey (keys → hammers → strings → performance), and lands on the business: lesson options, student proof, a lesson-path matcher, and an inquiry form that remembers the visitor's choices.

> **Content status:** every fact comes from Lisa's current site (audited 2026-10-13; see [`docs/CONTENT-AUDIT.md`](docs/CONTENT-AUDIT.md)). New copy is marked `draft()` in `content/site.js` and still needs her approval. Section order and voice follow the [Livepower](https://livepower.webflow.io/) reference; the visual design is this site's own.

## Run

```bash
npm install
npm run dev                         # http://localhost:5173
npm run check:content               # list every empty fact / draft line
npm run build                       # fails if any fact slot is ever left empty
```

## How content works

All copy lives in **`content/site.js`**. At dev and build time it is rendered into static HTML (`src/templates.js`, via a small Vite plugin in `vite.config.js`), so the page works for search engines and without JavaScript.

| Helper | Meaning | In review builds |
|---|---|---|
| `fact('what is needed')` | Must come from Lisa's current site | Dashed, labelled gap |
| `draft('copy')` | New copy written for this site | Dotted "draft" underline |
| `ok(value, 'source')` | Verified content | Normal text |

To finish the site: replace each `fact()` with `ok(…)`, approve or rewrite each `draft()`, set `reviewMode: false`, and add `contact.formEndpoint` or `contact.email`. If Lisa uses a booking tool, `contact.bookingUrl` switches the final CTA to it.

## Page structure (Livepower flow)

| # | Section | Lisa's content |
|---|---|---|
| 00 | Hero (3D) | "Now Accepting Students", "All people are musical.", who she teaches, where, a "watch a student" card, trust strip |
| — | Journey (3D) | 8 scenes that tell her philosophy: all people are musical → different starting points → spatial → physical → aural → curiosity and enjoyment → real students → "an adventure and a journey" |
| 01 | About | Statement, portrait, her bio (verbatim), quote, stat tiles |
| 02 | Why Lisa | 4 cards: teaching since 1993, pedagogy degree, tailored plan, working musician |
| 03 | Who it's for | Playable 8-key piano, the three audiences, service areas |
| 04 | How lessons work | Her aural / physical / spatial approach plus enjoyment, as four piano keys |
| 05 | Lesson options | At your home, at Lisa's home, virtual. Rates aren't published, and the site says so |
| 06 | My students | Recital room with Wynnton's and Dexter's real performances, with captions |
| 07 | Can I really learn? | 5 objections answered from her own pages |
| 08 | Find your path | 3 questions, with fit rules grounded in her facts |
| 09 | Practice room | Timer and metronome |
| 10 | FAQ | 7 answers, all from her site |
| — | Final call (3D) | "Ready to start your journey?" and "Hear it. Feel it. Read it." |
| 11 | Inquiry | Her contact details, a 3-step "what happens next", and a form that opens an email to Lisa |

## Design system

- **Palette** (from the reference poster): greige `#e5e0d8`, surface `#f1ede6`, ink `#141312`, mustard `#c9971b`, ochre `#7a5806` / `#9a7008` for accent text (contrast-checked).
- **Type** (from the client's references): headlines in **Fraunces** at heavy weight with its soft setting ("gorgeous"), with an elegant Fraunces italic for each heading's accent line ("beautiful"). Text, labels and buttons are in **Bricolage Grotesque** ("Antarctica"), with labels in small, widely spaced capitals. Both fonts are free; they are set by `--serif` and `--sans` in `src/styles/base.css`.
- **Layout:** 1600px content width, with Lenis smooth scrolling (`src/lib/smooth.js`; off under reduced motion).
- **Header:** minimal. On hover, each link rolls its label up into the same word in the italic serif, and a small mustard note head glides underneath it (and rests under the current section). There's a text-only sound toggle and a pill-shaped "Start lessons" button that rolls the same way. A frosted backing keeps it legible over the 3D piano.

## Technical notes

- **3D**: `src/three/piano.js` builds an 88-key grand from code: instanced keys, hammers, dampers and ~230 strings. A shader makes the strings vibrate. There is no model download. `src/three/stage.js` handles camera poses, lighting and adaptive resolution. three.js is lazy-loaded after first paint.
- **Fallbacks**: phones and low-power devices get a lighter piano (no shadows or dust, fewer strings, lower DPR). Without WebGL, the page crossfades through pre-rendered stills (`public/stills`, from `scripts/render-stills.mjs`). Those stills also serve as the hero LCP image.
- **Motion**: GSAP with ScrollTrigger, SplitText, Flip, MotionPath, Observer, MorphSVG and DrawSVG. With `prefers-reduced-motion`, camera flights become cuts, the journey becomes stacked panels, and all content stays readable.
- **Audio**: off by default. The piano voice is synthesised in Web Audio (inharmonic partials, a hammer transient, a small room), so there are no audio files. Nothing plays until the visitor turns sound on.
- **Accessibility**: semantic landmarks, ARIA tabs, radiogroups and accordions, visible focus, keyboard support everywhere (including the piano), live regions, and captions support for video. axe-core reports 0 WCAG A/AA violations at desktop and mobile widths (`scripts/a11y.mjs`).

## QA scripts

These need `npm run dev`. Set `CHROME=/path/to/chrome` if you're not in the build container.

- `node scripts/functional.mjs [--rm]`: clicks through every interactive module (19 checks)
- `node scripts/a11y.mjs`: axe audit (`BASE=http://localhost:4173/` for a `vite preview` build)
- `node scripts/tour.mjs <outdir> [w] [h]`: screenshots of each section
- `node scripts/render-stills.mjs`: regenerates the pre-rendered stills
