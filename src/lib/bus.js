// Tiny event bus so DOM modules can talk to the (lazy-loaded) 3D stage.
const map = new Map();
export const bus = {
  on(e, fn) { if (!map.has(e)) map.set(e, new Set()); map.get(e).add(fn); return () => map.get(e).delete(fn); },
  emit(e, d) { map.get(e)?.forEach((fn) => fn(d)); },
};
