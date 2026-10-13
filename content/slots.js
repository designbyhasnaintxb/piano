/**
 * Content slot helpers.
 *
 * Every Lisa-specific fact on the site must come from the current site
 * (pianolessonswithlisamott.com, incl. /mystudents). Nothing is invented.
 *
 *   fact(label, meta)  – a factual slot that is EMPTY until filled from the
 *                        source. Renders as a visible, labelled gap.
 *   draft(text, meta)  – new copy written for the redesign (structure, UI
 *                        wording, positioning). Renders with a "draft" mark
 *                        until Lisa approves it.
 *   ok(value, source)  – verified content. Renders as plain content.
 *
 * meta.cls uses the audit classes from docs/CONTENT-AUDIT.md:
 *   KEEP · REWRITE LIGHTLY · REPOSITION · TURN INTO PROOF · TURN INTO OFFER ·
 *   TURN INTO INTERACTION · VERIFY · REMOVE IF OUTDATED
 */

export const fact = (label, meta = {}) => ({ __slot: 'fact', label, ...meta });
export const draft = (text, meta = {}) => ({ __slot: 'draft', text, ...meta });
export const ok = (value, source = '') => ({ __slot: 'ok', value, source });

export const isSlot = (v) => v && typeof v === 'object' && '__slot' in v;

/** Plain-text value of a slot ('' for empty facts). */
export const plain = (v) => {
  if (!isSlot(v)) return v ?? '';
  if (v.__slot === 'ok') return v.value;
  if (v.__slot === 'draft') return v.text;
  return '';
};

/** True when the slot holds something that can be shown as real content. */
export const filled = (v) => isSlot(v) ? v.__slot !== 'fact' : v != null && v !== '';

/** Walk any content tree and collect every unresolved slot with its path. */
export function collectSlots(node, path = [], out = []) {
  if (isSlot(node)) {
    if (node.__slot !== 'ok') out.push({ path: path.join('.'), ...node });
    return out;
  }
  if (Array.isArray(node)) node.forEach((n, i) => collectSlots(n, [...path, i], out));
  else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) collectSlots(v, [...path, k], out);
  }
  return out;
}
