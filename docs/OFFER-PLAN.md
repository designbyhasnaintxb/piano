# Offer plan for Lisa, in the style of Alex Hormozi

Hormozi's value equation is:

> **value = (dream outcome × perceived likelihood of success) ÷ (time delay × effort and sacrifice)**

The website already uses every lever that can be built from facts on Lisa's current site. The rest need **decisions only Lisa can make**. Putting them on the site before she makes them would be false advertising, so they're listed here as proposals.

## Already on the site (all true)

| Lever | What the site says | Source |
|---|---|---|
| Likelihood ↑ | Teaching private piano since 1993; master's in Piano Pedagogy (Columbus State); early-childhood and university teaching | `/about` |
| Likelihood ↑ | Real students performing (Wynnton, Dexter), with video | `/mystudents` |
| Likelihood ↑ | "All people are musical", plus the aural / physical / spatial approach | `/philosophy` |
| Effort ↓ | Lessons at **your** home, at Lisa's, or online, with no geographic limit online | `/howto`, `/` |
| Effort ↓ | "Text Lisa" buttons in the hero, offer and mobile bar; a one-minute form that opens a pre-written email | `/contact` |
| Clarity | A named offer ("Private Piano, Built Around You") with an 8-point "everything you get" stack | facts above |
| Honest urgency | "Now accepting students" | `/` |

## Proposals that need Lisa's yes or no

1. **Show the price.** The single biggest conversion lever. Suggested format: a monthly plan (for example "4 lessons a month, 30 / 45 / 60 min"), so people compare value, not per-lesson cost. If prices vary by format, show "from $X".
2. **A low-risk first step.** For example a free 20-minute "meet the teacher and plan" call, or a paid first lesson credited toward the first month.
3. **A guarantee she's comfortable with.** For example: "If after your first month it isn't the right fit, the next month is on me", or a simple no-contract, cancel-any-time policy.
4. **Bonuses that cost her little and matter a lot:**
   - a written practice plan after each lesson;
   - a short progress note for parents every term;
   - a recital or informal performance each year (*only if she runs one*);
   - help choosing a piano or keyboard.
5. **Real scarcity, only if true.** For example "I take a limited number of students so each gets my full attention; X spots open this term." Never invent the number.
6. **Testimonials.** Two or three quotes from parents or adult students, with first name and permission. This is the strongest proof after video.
7. **Result timeline, only if she can stand behind it.** For example "Most beginners play their first full piece within N weeks."

Once Lisa confirms any of these, add them to `content/site.js` (`offer`, `packages`, `faq`) as `ok(…)` entries, and the site renders them automatically.
