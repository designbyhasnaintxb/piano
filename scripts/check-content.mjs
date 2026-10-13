// Lists every unresolved content slot, grouped by audit class.
// Usage: npm run check:content [-- --md]   (--md prints a markdown table)
import site from '../content/site.js';
import { collectSlots } from '../content/slots.js';

const slots = collectSlots(site);
const facts = slots.filter((s) => s.__slot === 'fact');
const drafts = slots.filter((s) => s.__slot === 'draft');
const md = process.argv.includes('--md');

const byClass = new Map();
for (const s of facts) {
  const k = s.cls || 'UNCLASSIFIED';
  if (!byClass.has(k)) byClass.set(k, []);
  byClass.get(k).push(s);
}

if (md) {
  console.log('| Class | Slot | Needed | Source |\n|---|---|---|---|');
  for (const [cls, list] of byClass) for (const s of list) {
    console.log(`| ${cls} | \`${s.path}\` | ${s.label} | ${s.source ? s.source.replace('https://', '') : '—'} |`);
  }
} else {
  console.log(`\nFact slots still empty: ${facts.length}`);
  console.log(`Draft copy awaiting approval: ${drafts.length}\n`);
  for (const [cls, list] of byClass) {
    console.log(`── ${cls} (${list.length})`);
    for (const s of list) console.log(`   ${s.path.padEnd(34)} ${s.label}`);
  }
  console.log('');
}
process.exitCode = 0;
