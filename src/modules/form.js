// Inquiry form. Pre-fills the option/path chosen earlier in the session,
// validates accessibly, and posts to the configured endpoint (or falls back
// to a pre-written email when no endpoint is configured).
import { $, $$ } from '../lib/gsap.js';
import { store } from '../lib/store.js';

export function initForm(data) {
  const form = $('[data-inquiry]');
  if (!form) return;
  const chosen = $('[data-chosen]', form), chosenLabel = $('[data-chosen-label]', form);
  const select = $('[data-lesson-select]', form), pathField = $('[data-path-field]', form);
  const err = $('[data-form-err]', form), ok = $('[data-form-ok]', form);

  function sync() {
    const i = store.get('interest');
    chosen.hidden = !i?.label;
    if (i?.label) chosenLabel.textContent = i.label;
    if (i?.id && select.querySelector(`option[value="${i.id}"]`)) select.value = i.id;
    pathField.value = store.get('path') || '';
  }
  store.subscribe(sync);
  sync();
  $('[data-chosen-clear]', form).addEventListener('click', () => { store.set('interest', null); select.value = ''; select.focus(); });
  select.addEventListener('change', () => {
    const o = select.selectedOptions[0];
    store.set('interest', select.value ? { id: select.value, label: o.textContent } : null);
  });

  function validate() {
    const bad = [];
    $$('[required]', form).forEach((el) => {
      let valid = el.type === 'radio' ? !!form.querySelector(`input[name="${el.name}"]:checked`) : el.checkValidity();
      if (el.type === 'radio') { if (el !== form.querySelector(`input[name="${el.name}"]`)) return; }
      el.setAttribute('aria-invalid', !valid);
      if (!valid) bad.push(el);
    });
    return bad;
  }

  const label = (el) => (el.closest('.ff')?.querySelector('span, legend')?.textContent || el.name).trim();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const bad = validate();
    if (bad.length) {
      err.hidden = false;
      err.textContent = `Please complete: ${bad.map(label).join(', ')}.`;
      bad[0].focus();
      return;
    }
    err.hidden = true;
    const fd = new FormData(form);
    fd.set('lesson', select.selectedOptions[0]?.textContent || '');
    const btn = form.querySelector('[type="submit"]');
    btn.disabled = true;
    try {
      if (data.contact.endpoint) {
        const r = await fetch(data.contact.endpoint, { method: 'POST', body: fd, headers: { Accept: 'application/json' } });
        if (!r.ok) throw new Error(String(r.status));
      } else if (data.contact.email) {
        const body = [...fd.entries()].filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n');
        location.href = `mailto:${data.contact.email}?subject=${encodeURIComponent('Piano lesson inquiry')}&body=${encodeURIComponent(body)}`;
      } else {
        // Draft build: no destination configured yet. Be honest about it.
        throw new Error('not-configured');
      }
      ok.hidden = false;
      $$('.ff, .frow, [type="submit"], [data-chosen]', form).forEach((n) => (n.hidden = true));
      ok.focus();
    } catch (x) {
      err.hidden = false;
      err.textContent = x.message === 'not-configured'
        ? 'This draft isn\'t connected to Lisa yet — add her email or a form endpoint in content/site.js.'
        : 'Something went wrong sending your message. Please try again in a moment.';
    } finally {
      btn.disabled = false;
    }
  });
  form.addEventListener('input', (e) => { if (e.target.getAttribute('aria-invalid') === 'true') e.target.setAttribute('aria-invalid', !e.target.checkValidity()); });
}
