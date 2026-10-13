# Content audit — pianolessonswithlisamott.com

## Status: blocked, not done

The brief asked for an audit of `https://pianolessonswithlisamott.com/` and `/mystudents` before design.
**That audit has not happened.** The build environment could not reach the site:

| Attempt | Result |
|---|---|
| `curl` via the environment's egress proxy | `CONNECT tunnel failed, response 403` (organization network policy) |
| Web fetch tool | DNS failure — but it also failed on `example.com`, so this says nothing about the site itself |
| Web search for the domain / "Lisa Mott" piano | No indexed pages for the domain. One unrelated-or-unconfirmed hit (a Madison-area accompanist named Lisa Mott on a third-party studio page) — **not used**, because nothing ties it to this business |

So the site's real content is unknown. Nothing on the site is invented: each Lisa-specific fact is an
**empty, visibly labelled slot**. Any new copy (layout labels, headlines, UI text) is marked **draft** until Lisa approves it.

## How the inventory works

All content lives in [`content/site.js`](../content/site.js). Each value is one of:

- `fact('what is needed', { cls, source })`: empty until filled from the current site. In review builds it renders as a dashed, labelled gap.
- `draft('new copy')`: written for the redesign. It renders with a dotted "draft" underline until approved.
- `ok(value, 'source')`: verified content, rendered normally.

`npm run check:content` lists every open slot, grouped by audit class. Add `-- --md` to get a markdown table you can paste.

Production builds **fail** while any `fact` slot is empty. For a review build, set `ALLOW_PLACEHOLDERS=1`.

## Audit classes (from the brief)

| Class | Meaning in this build |
|---|---|
| KEEP | Use as published (contact, location, policies, portrait) |
| REWRITE LIGHTLY | Keep the substance, tighten it for the web (bio) |
| REPOSITION | Same fact, moved to where it helps a decision |
| TURN INTO PROOF | Students, quotes, recitals, achievements → the wall and the recital room |
| TURN INTO OFFER | Lesson lengths, prices, formats, billing → "Choose your rhythm" |
| TURN INTO INTERACTION | Teaching method → the "How lessons work" keyboard |
| VERIFY | Only keep it if the current site supports it (audiences, objections, credentials) |
| REMOVE IF OUTDATED | Old dates, stale prices, past events |

## What to pull from the current site (in priority order)

1. **Offer**: every lesson option, its length, price, billing unit, and whether a trial lesson exists. *(Without this, the packages section and matcher have nothing to recommend.)*
2. **Contact & location**: email, phone, studio area, in-person / online.
3. **Lisa**: portrait, biography, and only the credentials, years and affiliations the site states.
4. **/mystudents**: names (as published), photos, captions, quotes, and any recital or award mentions. For each student, note which progression stages their story supports (first lesson → first song → performance).
5. **Policies**: make-ups, cancellations, payment, practice expectations, instrument requirements, recitals.
6. **Videos**: any student or recital footage. Use the original file URL or YouTube ID, plus captions if available.
7. **Who she teaches**: ages and levels, to confirm or remove the four audience groups and the matcher options.
8. **Voice**: two or three sentences in Lisa's own words. These decide which hero line fits:
   *"Your first note can become a lifetime of music"* / *"From first note to real music"* / *"Learn to play. Learn to hear. Learn to love music."*

## Draft decisions that need Lisa's sign-off

- Hero line and subline. The subline's claim that lessons are "built around each student" must match how she actually describes her teaching.
- The five lesson areas (Foundation, Technique, Reading, Musicality, Confidence). These are placeholders for her real categories.
- Package names (Introductory / Weekly / Extended). These are structural guesses; the slots for length, price and billing are empty.
- The matcher rules that map answers to a package. The mapping is a draft and should follow her advice.
- The "You don't need to be naturally musical" headline. Keep it only if it reflects her philosophy.
- Form options (age bands, contact methods).
