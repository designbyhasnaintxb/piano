// WebGL stage: one renderer, one camera, one piano.
// Shared by the hero, the scroll journey and the finale; paused everywhere else.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { buildPiano } from './piano.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);

/* Camera poses. 0 = hero, 1–8 = journey scenes, 9 = finale.
   lid: lid angle (rad) · desk: music-desk opacity · rot: instrument yaw
   key/spot: light levels · shift: horizontal frame offset (desktop) */
export const POSES = [
  { name: 'hero', pos: V(2.2, 1.62, 1.95), tgt: V(-0.08, 0.84, -0.5), lid: 0.62, desk: 1, rot: 0, key: 1, spot: 0, shift: 0.2, fov: 30 },
  { name: 'start', pos: V(2.9, 2.1, 2.9), tgt: V(-0.1, 0.72, -0.7), lid: 0.62, desk: 1, rot: 0, key: 1, spot: 0, shift: 0.14, fov: 30 },
  { name: 'somewhere', pos: V(0.55, 1.12, 0.82), tgt: V(0.12, 0.74, 0.06), lid: 0.62, desk: 1, rot: 0, key: 1, spot: 0, shift: 0.1, fov: 32 },
  { name: 'foundations', pos: V(0.2, 0.98, 0.52), tgt: V(-0.06, 0.735, 0.04), lid: 0.62, desk: 0.6, rot: 0, key: 1, spot: 0, shift: 0.08, fov: 34 },
  { name: 'technique', pos: V(0.24, 0.96, -0.2), tgt: V(-0.08, 0.865, -0.26), lid: 1.15, desk: 0, rot: 0, key: 1.1, spot: 0.2, shift: 0.06, fov: 40 },
  { name: 'listening', pos: V(0.34, 1.12, -0.32), tgt: V(-0.12, 0.88, -0.95), lid: 1.25, desk: 0, rot: 0, key: 1.1, spot: 0.35, shift: 0.06, fov: 38 },
  { name: 'more', pos: V(0.55, 2.9, 0.1), tgt: V(-0.12, 0.86, -0.8), lid: 1.35, desk: 0, rot: 0, key: 0.95, spot: 0.5, shift: 0.14, fov: 36 },
  { name: 'confidence', pos: V(2.6, 1.55, 1.8), tgt: V(-0.15, 0.82, -0.6), lid: 0.8, desk: 1, rot: 0, key: 0.9, spot: 0.4, shift: -0.12, fov: 30 },
  { name: 'music', pos: V(1.0, 1.4, 4.3), tgt: V(0.05, 0.85, -0.55), lid: 0.62, desk: 1, rot: -1.15, key: 0.55, spot: 1, shift: 0.1, fov: 30 },
  { name: 'finale', pos: V(3.6, 2.3, 3.4), tgt: V(-0.1, 0.8, -0.65), lid: 0.62, desk: 1, rot: -0.35, key: 1.35, spot: 1, shift: 0.18, fov: 30 },
];

const smooth = (x) => x * x * (3 - 2 * x);
const clamp01 = (x) => Math.max(0, Math.min(1, x));

export function createStage(canvas, { lite = false, reduced = false, instant = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !lite, alpha: true, powerPreference: 'high-performance' });
  const maxDpr = lite ? 1.25 : 1.75;
  let dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = !lite;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(30, 1, 0.02, 40);

  // one warm key light, a soft fill, and a spot for the performance moment
  const key = new THREE.DirectionalLight(0xffe6c7, 2.4);
  key.position.set(-2.4, 4.6, 2.4);
  key.target.position.set(0, 0.6, -0.7);
  key.castShadow = !lite;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -2.2, right: 2.2, top: 2.2, bottom: -2.2, near: 1, far: 12 });
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.02;
  scene.add(key, key.target);
  const fill = new THREE.HemisphereLight(0x5b4a40, 0x0a0908, 0.45);
  scene.add(fill);
  const rimLight = new THREE.DirectionalLight(0xb8c8ff, 0.5);
  rimLight.position.set(3, 2, -4);
  scene.add(rimLight);
  const spot = new THREE.SpotLight(0xfff0d8, 0, 9, 0.42, 0.6, 1.2);
  spot.position.set(0.2, 4.6, -0.4);
  spot.target.position.set(0, 0.8, -0.6);
  scene.add(spot, spot.target);

  const piano = buildPiano({ lite });
  scene.add(piano.root);

  // a little dust in the key light — desktop only
  let dust = null;
  if (!lite && !reduced) {
    const n = 260, p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { p[i * 3] = (Math.random() - 0.5) * 4; p[i * 3 + 1] = Math.random() * 2.6; p[i * 3 + 2] = (Math.random() - 0.6) * 4; }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    dust = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffe9c9, size: 0.006, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending }));
    scene.add(dust);
  }

  /* ── pose blending ── */
  const cur = { pos: V(0, 0, 0), tgt: V(0, 0, 0), lid: 0.62, desk: 1, rot: 0, key: 1, spot: 0, shift: 0, fov: 30 };
  function blend(a, b, f, out) {
    out.pos.lerpVectors(a.pos, b.pos, f);
    out.tgt.lerpVectors(a.tgt, b.tgt, f);
    for (const k of ['lid', 'desk', 'rot', 'key', 'spot', 'shift', 'fov']) out[k] = a[k] + (b[k] - a[k]) * f;
    return out;
  }
  /** u ∈ [0, 8]: hero → scene 8, with a short hold on every pose. */
  function poseAt(u, out) {
    const i = Math.min(Math.floor(u), 7), f = u - i;
    const held = smooth(clamp01((f - 0.18) / 0.64));
    return blend(POSES[i], POSES[i + 1], held, out);
  }

  let mode = 'journey';
  let uTarget = 0, u = 0, finaleT = 0, finaleTarget = 0;
  let width = 1, height = 1, aspect = 1, portrait = false;

  function resize() {
    width = canvas.clientWidth || window.innerWidth;
    height = canvas.clientHeight || window.innerHeight;
    aspect = width / height;
    portrait = aspect < 0.9;
    renderer.setSize(width, height, false);
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
  }
  resize();

  const tmp = { pos: V(0, 0, 0), tgt: V(0, 0, 0) };
  function applyPose(p) {
    // Narrow screens: pull the camera back along its own line of sight.
    const k = portrait ? Math.min(2.3, 1 + (0.95 - aspect) * 1.5) : aspect < 1.3 ? 1.12 : 1;
    camera.position.copy(p.tgt).addScaledVector(tmp.pos.copy(p.pos).sub(p.tgt), k);
    camera.fov = p.fov;
    camera.lookAt(p.tgt);
    const shift = portrait ? 0 : p.shift;
    camera.setViewOffset(width, height, -shift * width, 0, width, height);
    camera.updateProjectionMatrix();
    piano.setLid(p.lid);
    piano.setDesk(p.desk);
    piano.body.rotation.y = p.rot;
    key.intensity = 2.4 * p.key;
    fill.intensity = 0.45 * p.key;
    spot.intensity = 26 * p.spot;
    scene.environmentIntensity = 0.55 * (0.6 + 0.4 * p.key);
  }

  /* ── loop ── */
  let running = false, raf = 0, last = 0, t = 0;
  let slow = 0;
  const onFrame = [];
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - (last || now)) / 1000);
    last = now;
    t += dt;
    // adaptive resolution: if we keep missing frames, render fewer pixels
    if (dt > 0.024) slow += dt; else slow = Math.max(0, slow - dt * 0.5);
    if (slow > 1.5 && dpr > 1) { dpr = Math.max(1, dpr - 0.25); renderer.setPixelRatio(dpr); resize(); slow = 0; }

    const damp = reduced || instant ? 1 : 1 - Math.exp(-dt * 6);
    u += (uTarget - u) * damp;
    finaleT += (finaleTarget - finaleT) * damp;
    if (mode === 'finale') blend(POSES[8], POSES[9], smooth(clamp01(finaleT)), cur);
    else poseAt(u, cur);
    applyPose(cur);

    if (scene.environmentRotation) scene.environmentRotation.y = Math.sin(t * 0.05) * 0.6; // light drifts across the lacquer
    if (dust) { dust.rotation.y = t * 0.01; dust.position.y = Math.sin(t * 0.2) * 0.02; }
    for (const fn of onFrame) fn(dt, t);
    piano.update(dt, t);
    renderer.render(scene, camera);
  }

  const api = {
    piano, renderer, camera,
    onFrame: (fn) => onFrame.push(fn),
    setProgress(v, jump = false) { uTarget = Math.max(0, Math.min(8, v)); if (jump) u = uTarget; },
    setFinale(v, jump = false) { finaleTarget = clamp01(v); if (jump) finaleT = finaleTarget; },
    setMode(m) { mode = m; },
    get mode() { return mode; },
    start() { if (running) return; running = true; last = 0; raf = requestAnimationFrame(frame); },
    stop() { running = false; cancelAnimationFrame(raf); },
    renderOnce() { poseAt(u, cur); if (mode === 'finale') blend(POSES[8], POSES[9], finaleT, cur); applyPose(cur); piano.update(0.016, t); renderer.render(scene, camera); },
    resize,
    dispose() { api.stop(); renderer.dispose(); },
  };
  window.addEventListener('resize', resize, { passive: true });
  return api;
}
