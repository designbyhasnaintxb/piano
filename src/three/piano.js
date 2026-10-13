// Procedural concert grand. Everything is built from code — no model download —
// so the whole instrument costs ~25 draw calls and a few hundred KB of geometry.
//
// World units are metres. Keyboard runs along X (bass = −X), the case extends
// toward −Z, the floor is y = 0. Keys, hammers, dampers and strings are
// instanced and driven by `strike(midi)`.
import * as THREE from 'three';

const FIRST_MIDI = 21; // A0
const N_KEYS = 88;
const KEY_W = 1.22 / 52;
const KB_X0 = -0.61;
const KEY_TOP = 0.735;
const RIM_TOP = 1.0;
const RIM_BOTTOM = 0.64;
const STRING_Y = 0.888;
const STRIKE_Z = -0.24;
const STRING_START = 0.13; // depth where speaking length begins

const isBlack = (m) => [1, 3, 6, 8, 10].includes(m % 12);

/** Top-view outline of the case. Shape space: x → world x, y → world −z. */
function outline(frontY = 0, inset = 0) {
  const s = new THREE.Shape();
  const L = -0.76 + inset, R = 0.76 - inset;
  s.moveTo(L, frontY + inset);
  s.lineTo(R, frontY + inset);
  s.lineTo(R, 0.32);
  s.bezierCurveTo(R, 0.78 - inset * 0.5, 0.08 + inset, 0.8, 0.02 + inset * 0.6, 1.25 - inset * 0.3);
  s.bezierCurveTo(-0.03 + inset * 0.4, 1.62 - inset, -0.42, 1.86 - inset, L, 1.78 - inset);
  s.lineTo(L, frontY + inset);
  return s;
}

/** Offset a closed shape inward by sampling points along normals. */
function insetPath(shape, d, n = 260) {
  const pts = shape.getSpacedPoints(n);
  pts.pop();
  // Signed area tells us the winding, so we know which normal points inward.
  let area = 0;
  for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; area += a.x * b.y - b.x * a.y; }
  const sign = area > 0 ? 1 : -1;
  const out = pts.map((p, i) => {
    const a = pts[(i - 1 + pts.length) % pts.length], b = pts[(i + 1) % pts.length];
    const tx = b.x - a.x, ty = b.y - a.y, len = Math.hypot(tx, ty) || 1;
    return new THREE.Vector2(p.x - (ty / len) * d * sign, p.y + (tx / len) * d * sign);
  });
  return new THREE.Path(out);
}

/** A true inward offset of the case outline, with the front edge pushed back to minY. */
function insetShape(outer, d, minY = 0) {
  const pts = insetPath(outer, d).getPoints().map((p) => new THREE.Vector2(p.x, Math.max(p.y, minY)));
  return new THREE.Shape(pts);
}

/** Back boundary (max depth) of the inner case at a given x. */
function depthAt(shape) {
  const pts = shape.getSpacedPoints(600);
  return (x) => {
    let best = 0;
    for (const p of pts) if (Math.abs(p.x - x) < 0.012 && p.y > best) best = p.y;
    return best;
  };
}

function woodTexture(w = 1024, h = 512, base = [212, 175, 122]) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = `rgb(${base})`;
  g.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 1) {
    const n = Math.sin(x * 0.05) * 0.5 + Math.sin(x * 0.31) * 0.3 + Math.random() * 0.4;
    g.fillStyle = `rgba(110,70,35,${0.04 + Math.max(0, n) * 0.07})`;
    g.fillRect(x, 0, 1, h);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}

function contactShadow() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(128, 128, 10, 128, 128, 128);
  grd.addColorStop(0, 'rgba(0,0,0,.75)');
  grd.addColorStop(0.55, 'rgba(0,0,0,.35)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  return new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 3.0),
    new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false }),
  );
}

export function buildPiano({ lite = false } = {}) {
  const root = new THREE.Group();
  root.name = 'piano';
  const body = new THREE.Group(); // everything except the floor; rotates in the performance scene
  root.add(body);

  /* ── materials ── */
  const lacquer = new THREE.MeshPhysicalMaterial({ color: 0x0a0909, roughness: 0.2, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05 });
  const lacquerSoft = new THREE.MeshStandardMaterial({ color: 0x0c0b0b, roughness: 0.5 });
  const desk = lacquer;
  const spruce = new THREE.MeshStandardMaterial({ map: woodTexture(), roughness: 0.6, color: 0xffffff });
  const plateMat = new THREE.MeshStandardMaterial({ color: 0x8a6a36, metalness: 0.75, roughness: 0.5 });
  const ivory = new THREE.MeshPhysicalMaterial({ color: 0xf2ead8, roughness: 0.32, clearcoat: 0.35, clearcoatRoughness: 0.3 });
  const ebony = new THREE.MeshPhysicalMaterial({ color: 0x0e0d0d, roughness: 0.28, clearcoat: 0.7, clearcoatRoughness: 0.15 });
  const felt = new THREE.MeshStandardMaterial({ color: 0xf1e9d6, roughness: 0.9, emissive: 0x2a1a10 });
  const shankWood = new THREE.MeshStandardMaterial({ color: 0xc8a372, roughness: 0.7 });
  const damperMat = new THREE.MeshStandardMaterial({ color: 0x1a1817, roughness: 0.85 });
  const brass = new THREE.MeshStandardMaterial({ color: 0xc9a24d, metalness: 1, roughness: 0.25 });
  const steel = new THREE.MeshStandardMaterial({ color: 0xcfcfcf, metalness: 1, roughness: 0.28 });
  const redFelt = new THREE.MeshStandardMaterial({ color: 0x6b2737, roughness: 1 });

  const cast = (m) => { m.castShadow = !lite; m.receiveShadow = !lite; return m; };
  const flat = (shape, depth, mat, y, opts = {}) => {
    const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: !!opts.bevel, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 2, curveSegments: lite ? 32 : 64 });
    g.rotateX(-Math.PI / 2); // shape (x, y) → (x, 0, −y), extrusion → +y
    const m = new THREE.Mesh(g, mat);
    m.position.y = y;
    return cast(m);
  };

  /* ── case ── */
  const outer = outline(0, 0);
  const rimShape = outline(0, 0);
  rimShape.holes.push(insetPath(outer, 0.038));
  body.add(flat(rimShape, RIM_TOP - RIM_BOTTOM, lacquer, RIM_BOTTOM, { bevel: true }));
  body.add(flat(insetShape(outer, 0.005, 0.005), 0.03, lacquerSoft, RIM_BOTTOM - 0.005));

  // soundboard & cast-iron plate
  const inner = insetShape(outer, 0.036, 0.004);
  const sb = flat(inner, 0.01, spruce, 0.78);
  sb.material.map.repeat.set(2, 1);
  body.add(sb);

  const plate = insetShape(outer, 0.075, 0.37);
  [[-0.28, 0.78, 0.055], [0.16, 0.62, 0.045], [-0.45, 1.28, 0.05], [-0.12, 1.12, 0.04], [0.3, 0.46, 0.035], [-0.52, 0.52, 0.04]]
    .forEach(([x, y, r]) => { const h = new THREE.Path(); h.absarc(x, y, r, 0, Math.PI * 2, true); plate.holes.push(h); });
  body.add(flat(plate, 0.016, plateMat, 0.862));
  // pin-block plate in front of the strike gap
  const pin = new THREE.Shape();
  pin.moveTo(-0.7, 0.04); pin.lineTo(0.7, 0.04); pin.lineTo(0.7, 0.19); pin.lineTo(-0.7, 0.19); pin.closePath();
  body.add(flat(pin, 0.016, plateMat, 0.862));

  /* ── strings ── */
  const backDepth = depthAt(insetShape(outer, 0.1, 0));
  const strings = [];
  for (let k = 0; k < N_KEYS; k++) {
    const x = -0.66 + (k / (N_KEYS - 1)) * 1.32;
    const n = lite ? 1 : k < 10 ? 1 : k < 28 ? 2 : 3;
    const end = Math.max(0.36, backDepth(x) - 0.04);
    for (let j = 0; j < n; j++) {
      strings.push({ key: k, x: x + (j - (n - 1) / 2) * 0.0036, len: end - STRING_START, r: k < 28 ? 0.0019 - k * 0.00003 : 0.0008 });
    }
  }
  const sGeo = new THREE.CylinderGeometry(1, 1, 1, 5, 14, true);
  sGeo.rotateX(Math.PI / 2);
  sGeo.translate(0, 0, -0.5); // spans z ∈ [−1, 0]
  const pos = sGeo.attributes.position;
  const aT = new Float32Array(pos.count);
  for (let i = 0; i < pos.count; i++) aT[i] = -pos.getZ(i); // 0 at the pins, 1 at the hitch
  sGeo.setAttribute('aT', new THREE.BufferAttribute(aT, 1));
  const aAmp = new THREE.InstancedBufferAttribute(new Float32Array(strings.length), 1);
  const aFreq = new THREE.InstancedBufferAttribute(new Float32Array(strings.length), 1);
  const aPhase = new THREE.InstancedBufferAttribute(new Float32Array(strings.length), 1);
  aAmp.setUsage(THREE.DynamicDrawUsage);
  sGeo.setAttribute('aAmp', aAmp);
  sGeo.setAttribute('aFreq', aFreq);
  sGeo.setAttribute('aPhase', aPhase);

  const stringMat = steel.clone();
  const uTime = { value: 0 };
  stringMat.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = uTime;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', `#include <common>
        uniform float uTime; attribute float aT; attribute float aAmp; attribute float aFreq; attribute float aPhase; varying float vGlow;`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        float env = sin(3.14159 * aT);
        float osc = sin(uTime * aFreq + aPhase);
        transformed.x += aAmp * env * osc;
        transformed.y += aAmp * env * 0.6 * cos(uTime * aFreq * 1.01 + aPhase);
        vGlow = clamp(aAmp * 0.18, 0.0, 1.0) * env;`);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vGlow;')
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += vec3(1.0, 0.78, 0.45) * vGlow * 1.4;');
  };
  const stringMesh = new THREE.InstancedMesh(sGeo, stringMat, strings.length);
  stringMesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3();
  const copper = new THREE.Color(0xb8743e), silver = new THREE.Color(0xd8d8d8);
  strings.forEach((s, i) => {
    m4.compose(v.set(s.x, STRING_Y, -STRING_START), q.identity(), sc.set(s.r, s.r, s.len));
    stringMesh.setMatrixAt(i, m4);
    stringMesh.setColorAt(i, s.key < 28 ? copper : silver);
    aFreq.array[i] = 34 + (s.key / N_KEYS) * 60 + Math.random() * 4;
    aPhase.array[i] = Math.random() * 6.28;
  });
  stringMesh.frustumCulled = false;
  body.add(stringMesh);
  const byKey = Array.from({ length: N_KEYS }, () => []);
  strings.forEach((s, i) => byKey[s.key].push(i));

  // tuning pins
  const pinMesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.0028, 0.0028, 0.03, 6), steel, lite ? N_KEYS : N_KEYS * 2);
  for (let i = 0; i < pinMesh.count; i++) {
    const k = lite ? i : i >> 1;
    const x = -0.66 + (k / (N_KEYS - 1)) * 1.32 + (lite ? 0 : (i & 1 ? 0.004 : -0.004));
    m4.compose(v.set(x, 0.885, -0.07 - (i & 1 ? 0.035 : 0) - (k % 3) * 0.012), q.identity(), sc.set(1, 1, 1));
    pinMesh.setMatrixAt(i, m4);
  }
  body.add(pinMesh);

  /* ── hammers & dampers ── */
  const headGeo = new THREE.BoxGeometry(KEY_W * 0.55, 0.026, 0.024);
  headGeo.translate(0, -0.013, 0);
  const shankGeo = new THREE.CylinderGeometry(0.0022, 0.0022, 0.14, 5);
  shankGeo.rotateX(Math.PI / 2);
  shankGeo.translate(0, -0.03, 0.07);
  const heads = new THREE.InstancedMesh(headGeo, felt, N_KEYS);
  const shanks = new THREE.InstancedMesh(shankGeo, shankWood, N_KEYS);
  const dampGeo = new THREE.BoxGeometry(KEY_W * 0.62, 0.016, 0.014);
  dampGeo.translate(0, 0.008, 0);
  const dampers = new THREE.InstancedMesh(dampGeo, damperMat, N_KEYS);
  [heads, shanks, dampers].forEach((m) => { m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); cast(m); body.add(m); });
  const hammerX = (k) => -0.66 + (k / (N_KEYS - 1)) * 1.32;

  // red felt strip across the front of the keys (the bit everyone remembers)
  const felts = new THREE.Mesh(new THREE.BoxGeometry(1.24, 0.006, 0.012), redFelt);
  felts.position.set(0, KEY_TOP + 0.002, -0.004);
  body.add(felts);

  /* ── keys ── */
  const wGeo = new THREE.BoxGeometry(KEY_W * 0.94, 0.022, 0.15);
  wGeo.translate(0, -0.011, 0.075); // origin at the back edge, top surface at y=0
  const bGeo = new THREE.BoxGeometry(0.0128, 0.012, 0.094);
  bGeo.translate(0, 0.006, 0.047);
  const keys = [];
  let wi = 0;
  for (let k = 0; k < N_KEYS; k++) {
    const m = FIRST_MIDI + k;
    const black = isBlack(m);
    const x = black ? KB_X0 + wi * KEY_W : KB_X0 + (wi + 0.5) * KEY_W;
    keys.push({ midi: m, black, x, idx: black ? null : wi, d: 0 });
    if (!black) wi++;
  }
  const whites = keys.filter((k) => !k.black), blacks = keys.filter((k) => k.black);
  whites.forEach((k, i) => (k.inst = i));
  blacks.forEach((k, i) => (k.inst = i));
  const whiteMesh = cast(new THREE.InstancedMesh(wGeo, ivory, whites.length));
  const blackMesh = cast(new THREE.InstancedMesh(bGeo, ebony, blacks.length));
  whiteMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  blackMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  body.add(whiteMesh, blackMesh);

  // key bed, slip, cheeks, nameboard
  const box = (w, h, d, x, y, z, mat = lacquer) => { const m = cast(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)); m.position.set(x, y, z); body.add(m); return m; };
  box(1.4, 0.06, 0.2, 0, 0.67, 0.085, lacquerSoft); // key bed
  box(1.38, 0.05, 0.02, 0, 0.705, 0.165); // key slip
  box(0.075, 0.1, 0.19, -0.66, 0.735, 0.08); // cheek L
  box(0.075, 0.1, 0.19, 0.66, 0.735, 0.08); // cheek R
  box(1.3, 0.07, 0.03, 0, 0.775, -0.02); // nameboard / open fallboard

  // music desk (fades out when the camera goes inside)
  const deskMesh = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.22, 0.012), desk);
  deskMesh.position.set(0, RIM_TOP + 0.1, -0.27);
  deskMesh.rotation.x = -0.26;
  body.add(deskMesh);

  /* ── lid ── */
  const lidPivot = new THREE.Group();
  lidPivot.position.set(-0.76, RIM_TOP + 0.004, 0);
  const lidShape = outline(0.24, -0.006);
  const lidMesh = flat(lidShape, 0.018, lacquer, 0, { bevel: true });
  lidMesh.position.x = 0.76;
  lidPivot.add(lidMesh);
  body.add(lidPivot);
  const prop = cast(new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1, 8), lacquer));
  body.add(prop);
  const propBase = new THREE.Vector3(0.6, RIM_TOP, -0.82);

  /* ── legs, lyre, pedals ── */
  const legGeo = new THREE.CylinderGeometry(0.05, 0.036, RIM_BOTTOM - 0.04, 16);
  [[-0.64, -0.12], [0.64, -0.12], [-0.44, -1.5]].forEach(([x, z]) => {
    const l = cast(new THREE.Mesh(legGeo, lacquer));
    l.position.set(x, (RIM_BOTTOM - 0.04) / 2 + 0.04, z);
    body.add(l);
    const c = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 8), brass);
    c.position.set(x, 0.03, z);
    body.add(c);
  });
  box(0.24, 0.1, 0.07, 0, 0.1, -0.36); // lyre box
  [-0.08, 0.08].forEach((x) => box(0.022, RIM_BOTTOM - 0.15, 0.022, x, (RIM_BOTTOM + 0.15) / 2, -0.36));
  const pedalGeo = new THREE.BoxGeometry(0.03, 0.012, 0.11);
  [-0.055, 0, 0.055].forEach((x) => { const p = new THREE.Mesh(pedalGeo, brass); p.position.set(x, 0.075, -0.29); body.add(p); });

  /* ── floor ── */
  const floor = new THREE.Mesh(new THREE.CircleGeometry(9, 64), new THREE.MeshStandardMaterial({ color: 0x15120f, roughness: 0.6, metalness: 0 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = !lite;
  root.add(floor);
  const shadow = contactShadow();
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0, 0.002, -0.75);
  body.add(shadow);

  /* ── state & animation ── */
  const state = keys.map(() => ({ down: 0, target: 0, hammer: 0, hammerV: 0, release: 0 }));
  const amps = new Float32Array(strings.length);
  let lidAngle = 0.62;

  function writeInstances() {
    for (let k = 0; k < N_KEYS; k++) {
      const key = keys[k], st = state[k];
      const ang = st.down * 0.065;
      q.setFromAxisAngle(v.set(1, 0, 0), ang);
      if (key.black) {
        m4.compose(v.set(key.x, KEY_TOP + 0.0005, 0.0), q, sc.set(1, 1, 1));
        blackMesh.setMatrixAt(key.inst, m4);
      } else {
        m4.compose(v.set(key.x, KEY_TOP, 0.0), q, sc.set(1, 1, 1));
        whiteMesh.setMatrixAt(key.inst, m4);
      }
      const hx = hammerX(k);
      const lift = st.hammer * 0.026;
      q.identity();
      m4.compose(v.set(hx, STRING_Y - 0.004 - 0.026 + lift, STRIKE_Z), q, sc.set(1, 1, 1));
      heads.setMatrixAt(k, m4);
      q.setFromAxisAngle(v.set(1, 0, 0), -st.hammer * 0.18);
      m4.compose(v.set(hx, STRING_Y - 0.03 + lift * 0.5, STRIKE_Z), q, sc.set(1, 1, 1));
      shanks.setMatrixAt(k, m4);
      const damp = k < 70 ? Math.max(st.down, st.release) * 0.012 : 0.03;
      q.identity();
      m4.compose(v.set(hx, STRING_Y + 0.002 + damp, STRIKE_Z - 0.09), q, sc.set(1, k < 70 ? 1 : 0.001, 1));
      dampers.setMatrixAt(k, m4);
    }
    whiteMesh.instanceMatrix.needsUpdate = blackMesh.instanceMatrix.needsUpdate = true;
    heads.instanceMatrix.needsUpdate = shanks.instanceMatrix.needsUpdate = dampers.instanceMatrix.needsUpdate = true;
  }
  writeInstances();

  const api = {
    root, body, keys, uTime,
    midiToKey: (m) => m - FIRST_MIDI,
    /** Press a key: key dips, hammer flies, strings ring. */
    strike(midi, vel = 0.8, hold = 0.35) {
      const k = midi - FIRST_MIDI;
      if (k < 0 || k >= N_KEYS) return;
      const st = state[k];
      st.target = 1;
      st.hammerV = 7 + vel * 6;
      st.holdUntil = performance.now() + hold * 1000;
      for (const i of byKey[k]) amps[i] = Math.max(amps[i], (1.2 + vel * 1.8) / strings[i].r * 0.001);
    },
    /** Keep a set of keys down (finale chord). */
    hold(midis = []) {
      const set = new Set(midis.map((m) => m - FIRST_MIDI));
      state.forEach((st, k) => { st.held = set.has(k); });
      for (const k of set) for (const i of byKey[k] || []) amps[i] = Math.max(amps[i], 0.6 / strings[i].r * 0.001);
    },
    /** Sympathetic shimmer across many strings (scene: "more than notes"). */
    resonate(level = 1) {
      for (let i = 0; i < amps.length; i++) amps[i] = Math.max(amps[i], (Math.random() * 0.6 + 0.4) * level * 0.0012 / strings[i].r);
    },
    setLid(a) { lidAngle = a; },
    // the desk slides down behind the nameboard instead of fading (no transparency sorting)
    setDesk(o) { deskMesh.position.y = RIM_TOP + 0.1 - (1 - o) * 0.24; deskMesh.visible = o > 0.02; },
    update(dt, t) {
      uTime.value = t;
      const now = performance.now();
      for (let k = 0; k < N_KEYS; k++) {
        const st = state[k];
        if (st.target === 1 && !st.held && now > (st.holdUntil || 0)) { st.target = 0; st.release = 1; }
        const goal = st.held ? 1 : st.target;
        st.down += (goal - st.down) * Math.min(1, dt * (goal > st.down ? 40 : 14));
        // hammer: thrown up, falls back under gravity-ish spring
        if (st.hammerV) { st.hammer += st.hammerV * dt; st.hammerV -= 60 * dt; if (st.hammer >= 1) { st.hammer = 1; st.hammerV = -Math.abs(st.hammerV) * 0.3; } }
        if (st.hammer <= 0 && st.hammerV < 0) { st.hammer = 0; st.hammerV = 0; }
        st.release = Math.max(0, st.release - dt * 3);
      }
      // string decay — damped strings stop quickly, held/high strings ring on
      for (let i = 0; i < amps.length; i++) {
        const st = state[strings[i].key];
        const damped = !(st.held || st.target) && strings[i].key < 70;
        amps[i] *= Math.exp(-dt * (damped ? 3.2 : 0.9));
        aAmp.array[i] = amps[i];
      }
      aAmp.needsUpdate = true;
      writeInstances();
      lidPivot.rotation.z = lidAngle;
      // prop stick from rim to the lid underside
      const tip = new THREE.Vector3(0.6 + 0.76, 0, -0.82).applyAxisAngle(new THREE.Vector3(0, 0, 1), lidAngle).add(lidPivot.position);
      const dir = tip.clone().sub(propBase);
      prop.position.copy(propBase).addScaledVector(dir, 0.5);
      prop.scale.set(1, dir.length(), 1);
      prop.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
      prop.visible = lidAngle < 0.9;
    },
  };
  return api;
}
