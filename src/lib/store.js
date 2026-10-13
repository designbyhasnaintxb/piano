// Session memory for the visitor's choices (selected option, matcher path,
// notes they played). Storage can be unavailable — everything degrades to
// in-memory state.
const KEY = 'lm-session';
let mem = {};
try { mem = JSON.parse(sessionStorage.getItem(KEY) || '{}') || {}; } catch { mem = {}; }

const subs = new Set();
const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify(mem)); } catch { /* private mode */ } };

export const store = {
  get: (k) => mem[k],
  set(k, v) { mem[k] = v; save(); subs.forEach((fn) => fn(k, v)); },
  subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
};

export const prefs = {
  get(k) { try { return localStorage.getItem(`lm-${k}`); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(`lm-${k}`, v); } catch { /* ignore */ } },
};
