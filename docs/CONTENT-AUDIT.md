# Content audit: pianolessonswithlisamott.com

**Audited:** 2026-10-13. All 6 pages were crawled in a browser: `/`, `/about`, `/philosophy`, `/howto` (Getting Started), `/mystudents` and `/contact`.
**Section-flow reference:** [livepower.webflow.io](https://livepower.webflow.io/) was used for section order and voice only. Nothing was copied from its design or content.

The current site is short, about 2,000 characters across six pages. Every fact on the new site comes from these pages and is marked `ok(value, page)` in [`content/site.js`](../content/site.js). New copy is marked `draft()` and needs Lisa's sign-off (`npm run check:content` lists it).

## Inventory

| Content on the current site | Page | Class | Where it lives now |
|---|---|---|---|
| "Piano Lessons with Lisa" (business name) | `/` | KEEP | Footer ©, meta, brand label |
| "Now Accepting Students" | `/` | REPOSITION | Hero status line, FAQ, footer |
| Eufaula, Alabama • Opelika • Auburn • Phenix City • Columbus, Georgia | `/` | TURN INTO OFFER | Lesson options ("Where"), who-it's-for, contact, footer, matcher |
| "Virtual lessons are not limited to the areas listed above." | `/` | TURN INTO OFFER | Virtual option, objections, FAQ |
| Teaching private piano since 1993; accompanist and freelance musician | `/about` | TURN INTO PROOF | Hero trust strip, about statement, stat tile, "Why Lisa" |
| Children age 5 and up; adults beginner through early advanced | `/about` | TURN INTO OFFER | Hero sub, who-it's-for, matcher rules, FAQ |
| Master's in Piano Pedagogy (Columbus State University); post-graduate study in piano accompanying | `/about` | TURN INTO PROOF | Trust strip, stat tile, "Why Lisa", FAQ |
| Early childhood music classes; university-level courses | `/about` | TURN INTO PROOF | "Why Lisa", young-children answers |
| Portrait (`IMG_0412 (1).jpg`, 3024×4032) | `/about` | KEEP | About section, journey scene 7 (converted to WebP) |
| "I Believe That All People are Musical" | `/philosophy` | REPOSITION | Hero headline, journey scene 1, objections |
| "We all show up with different skills and deficits…" | `/philosophy` | KEEP | Journey scene 2, objections |
| Aural / physical / spatial experiences | `/philosophy` | TURN INTO INTERACTION | Journey scenes 3–5, the "How lessons work" keyboard, finale "Hear it. Feel it. Read it." |
| "nurturing a curiosity, love, and enjoyment…"; "an adventure and a journey" | `/philosophy` | KEEP | Journey scenes 6 and 8, method key 04, about quote |
| Lessons at your home, my home, or virtually | `/howto` | TURN INTO OFFER | The three lesson options, FAQ |
| Individually tailored plan; "Please contact me to discuss yours" | `/howto` | TURN INTO OFFER | Option cards, "Why Lisa", FAQ (cost), inquiry intro and steps |
| Wynnton performing "Seven of Hearts" by Kevin Olson (`video1.mp4`) | `/mystudents` | TURN INTO PROOF | Recital room, hero "watch a student" card, journey scene 7 |
| Dexter performing "Romance Op. 24, No. 9" by Jean Sibelius (`video2.mp4`) | `/mystudents` | TURN INTO PROOF | Recital room, "Why Lisa" image, journey scene 7 |
| mottgal@gmail.com; phone or text 608-259-6924 | `/contact` | KEEP | Inquiry section, form (opens an email to Lisa), finale, footer, mobile menu |
| Header photo (hot-linked from hidraupianobenches.com) | all | REMOVE | Not Lisa's image, and served from someone else's site |

## Not on the current site, so not on the new one

Ask Lisa for these if she wants them shown. Until then, the sections that would hold them were removed or reworded, and nothing was invented:

- **Rates, lesson lengths and billing.** The cost FAQ uses her own line: each plan is tailored, so contact her.
- **Lesson policies:** make-ups, cancellations, payment, practice expectations, piano requirements, recitals.
- **Testimonials or quotes** from students or parents.
- **Photos of students** other than the two performance videos. The stills on the new site are frames from those videos.
- **The address for lessons at Lisa's home.** The new site says she'll share it when you get in touch.
- **A form service.** Until `contact.formEndpoint` is set, the inquiry form opens a pre-written email to mottgal@gmail.com.

## Media processing

- **Portrait:** WebP at 720 and 1400 wide (`public/media/lisa-*.webp`).
- **Videos:** re-encoded to H.264 with fast start (`public/media/*.mp4`). Posters and journey stills are frames from the videos.
- **Captions:** `public/media/*.vtt`. Both performances are solo piano with no speech, so the captions describe the music.
