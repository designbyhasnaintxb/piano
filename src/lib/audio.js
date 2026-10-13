// Sound is OFF by default and only ever starts from an explicit "Sound on".
// The piano voice is synthesised (additive partials with real piano
// inharmonicity + a hammer transient), so there are no audio files to load.

let ctx = null, master = null, wet = null;
let on = false;
const subs = new Set();

function ensure() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -18; comp.ratio.value = 3;
  master = ctx.createGain();
  master.gain.value = 0.55;
  master.connect(comp).connect(ctx.destination);
  // small room: generated impulse response
  const len = ctx.sampleRate * 2.2, ir = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
  }
  const conv = ctx.createConvolver();
  conv.buffer = ir;
  wet = ctx.createGain();
  wet.gain.value = 0.22;
  wet.connect(conv).connect(master);
  return ctx;
}

export const sound = {
  get on() { return on; },
  set(v) {
    on = !!v;
    if (on) { ensure(); ctx?.resume(); }
    subs.forEach((fn) => fn(on));
  },
  toggle() { this.set(!on); },
  subscribe(fn) { subs.add(fn); fn(on); return () => subs.delete(fn); },
  get ctx() { return ctx; },
};

const freq = (m) => 440 * Math.pow(2, (m - 69) / 12);
let noiseBuf = null;

/** Play one piano note. Silent unless sound is on. */
export function playNote(midi, vel = 0.7, dur = 1.4) {
  if (!on || !ensure()) return;
  const t0 = ctx.currentTime + 0.005;
  const f0 = freq(midi);
  const B = 0.00035 * Math.pow(2, (midi - 60) / 24);
  const sustain = Math.max(1.2, 7.5 - (midi - 21) * 0.075);

  const out = ctx.createGain();
  out.gain.value = 0.16 * (0.4 + vel * 0.6);
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(Math.min(16000, f0 * (6 + vel * 10)), t0);
  lp.frequency.setTargetAtTime(Math.min(9000, f0 * 3), t0 + 0.05, 0.6);
  lp.connect(out);
  out.connect(master);
  out.connect(wet);

  const oscs = [];
  for (let n = 1; n <= 9; n++) {
    const fn = n * f0 * Math.sqrt(1 + B * n * n);
    if (fn > 15000) break;
    const amp = Math.pow(n, -1.15) * (n === 1 ? 1 : 0.55 + vel * 0.5);
    const tau = sustain / (1 + n * 0.6);
    for (const det of n <= 3 ? [-0.7, 0.7] : [0]) {
      const o = ctx.createOscillator();
      o.frequency.value = fn * Math.pow(2, det / 1200);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(amp / (n <= 3 ? 2 : 1), t0 + 0.004);
      g.gain.setTargetAtTime(0, t0 + 0.01, tau / 4);
      g.gain.setTargetAtTime(0, t0 + dur, 0.09); // damper falls
      o.connect(g).connect(lp);
      o.start(t0);
      o.stop(t0 + dur + 0.6);
      oscs.push(o);
    }
  }
  // hammer: a short filtered thump
  if (!noiseBuf) {
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  }
  const ns = ctx.createBufferSource();
  ns.buffer = noiseBuf;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass'; bp.frequency.value = Math.min(5000, f0 * 4); bp.Q.value = 0.8;
  const ng = ctx.createGain();
  ng.gain.value = 0.05 * vel;
  ns.connect(bp).connect(ng).connect(out);
  ns.start(t0);
  oscs[0].onended = () => out.disconnect();
}

/** Metronome tick. `when` is AudioContext time (optional). */
export function tick(accent = false, when) {
  if (!on || !ensure()) return;
  const t = when ?? ctx.currentTime;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.frequency.value = accent ? 2100 : 1500;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(accent ? 0.22 : 0.14, t + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
  o.connect(g).connect(master);
  o.start(t); o.stop(t + 0.06);
}

export const NOTE_MIDI = (name) => {
  const m = /^([A-G])(#?)(\d)$/.exec(name);
  if (!m) return 60;
  const base = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]];
  return 12 * (+m[3] + 1) + base + (m[2] ? 1 : 0);
};
