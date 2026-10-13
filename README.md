# Lisa Mott — Piano Lessons

A new website for Lisa Mott's piano lessons. It opens with a procedural 3D grand piano, follows the instrument through a scroll journey (keys → hammers → strings → performance), and lands on the business: lesson options, student proof, a lesson-path matcher, and an inquiry form that remembers the visitor's choices.

> **Content status: draft.** The source site (`pianolessonswithlisamott.com`) could not be reached from the build environment, so **no Lisa-specific facts are on the page yet**. Every fact is an empty, labelled slot. See [`docs/CONTENT-AUDIT.md`](docs/CONTENT-AUDIT.md).

## Run

```bash
npm install
npm run dev                         # http://localhost:5173
npm run check:content               # list every empty fact / draft line
ALLOW_PLACEHOLDERS=1 npm run build  # review build (a normal build fails while facts are empty)
```

## How content works

All copy lives in **`content/site.js`**. At dev and build time it is rendered into static HTML (`src/templates.js`, via a small Vite plugin in `vite.config.js`), so the page works for search engines and without JavaScript.

| Helper | Meaning | In review builds |
|---|---|---|
| `fact('what is needed')` | Must come from Lisa's current site | Dashed, labelled gap |
| `draft('copy')` | New copy written for this site | Dotted "draft" underline |
| `ok(value, 'source')` | Verified content | Normal text |

To finish the site: replace each `fact()` with `ok(…)`, approve or rewrite each `draft()`, set `reviewMode: false`, and add `contact.formEndpoint` or `contact.email`. If Lisa uses a booking tool, `contact.bookingUrl` switches the final CTA to it.

## Page structure

| # | Section | What it does |
|---|---|---|
| 01 | Hero | 3D piano, headline words land one per sixteenth note (72 BPM) and the piano plays them silently |
| — | Journey | 8 scroll scenes: the camera moves to the keys, then the hammers, then the strings, then a performance view. Captions change with each scene |
| 02 | First note | 8-key playable piano (mouse, touch, A–K keys). Works with sound off. After the first note, a CTA appears |
| 03 | Meet Lisa | Portrait, bio and credentials (slots) |
| 04 | How lessons work | Five lesson areas as white keys (ARIA tabs) |
| 05 | Choose your rhythm | Lesson options as keys with time signatures. The selection is remembered |
| 06 | Wall of progress | Horizontal piano-roll of student stories on desktop, vertical list on phones |
| 07 | Recital room | Click-to-load video. The room dims, and nothing autoplays |
| 08 | Can I really learn? | Objections open like piano lids (the icon morphs) |
| 09 | Find your path | 3 questions map to an option through rules in `content/site.js` (no "AI" claims) |
| 10 | Practice room | 5/10/15-min timer and metronome. Visual first, audio only if sound is on |
| 11 | FAQ | Sheet-music measures that expand |
| 12 | Finale | Wide 3D shot. The notes the visitor played earlier are held as a chord |
| 13 | Inquiry | Intake form, pre-filled with the chosen option and matcher path |

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
