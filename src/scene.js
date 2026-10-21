import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DirectionalLight,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PMREMGenerator,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  TorusGeometry,
  WebGLRenderer,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const ORANGE = 0xf14b03;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeInCubic = (t) => t * t * t;
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Knobby off-road tyre: a torus whose outer tread is displaced into lugs.
function buildTyre() {
  const R = 1.85;
  const r = 0.52;
  const radial = 40;
  const tubular = 320;
  const geo = new TorusGeometry(R, r, radial, tubular);
  const pos = geo.attributes.position;
  const lugs = 46;
  for (let j = 0; j <= radial; j++) {
    for (let i = 0; i <= tubular; i++) {
      const idx = j * (tubular + 1) + i;
      const u = (i / tubular) * Math.PI * 2;
      const v = (j / radial) * Math.PI * 2;
      const x = pos.getX(idx);
      const y = pos.getY(idx);
      const z = pos.getZ(idx);
      const tread = clamp((Math.cos(v) - 0.25) / 0.6); // 1 on the outer face
      const wave = Math.sin(u * lugs);
      const lug = clamp((wave + 0.1) * 2.6); // blocky lugs with flat tops
      const shoulder = clamp((Math.abs(Math.sin(v)) - 0.55) / 0.35) * 0.35 * Math.pow(clamp(Math.sin(u * lugs + 1.2) * 0.5 + 0.5), 2);
      const d = 0.085 * tread * lug + 0.04 * shoulder * (1 - tread);
      // push outwards along the radial direction of the tube
      const nx = Math.cos(v) * Math.cos(u);
      const ny = Math.cos(v) * Math.sin(u);
      const nz = Math.sin(v);
      pos.setXYZ(idx, x + nx * d, y + ny * d, z + nz * d);
    }
  }
  geo.computeVertexNormals();
  return { geo, R, r };
}

function buildParticles(count) {
  const geo = new BufferGeometry();
  const arr = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const c1 = new Color(ORANGE);
  const c2 = new Color(0xffffff);
  const c3 = new Color(0xff9a3c);
  for (let i = 0; i < count; i++) {
    arr[i * 3] = (Math.random() - 0.5) * 22;
    arr[i * 3 + 1] = (Math.random() - 0.5) * 16;
    arr[i * 3 + 2] = (Math.random() - 0.5) * 14 - 2;
    const pick = Math.random();
    const c = pick < 0.55 ? c1 : pick < 0.8 ? c3 : c2;
    const k = 0.35 + Math.random() * 0.65;
    col[i * 3] = c.r * k;
    col[i * 3 + 1] = c.g * k;
    col[i * 3 + 2] = c.b * k;
  }
  geo.setAttribute('position', new BufferAttribute(arr, 3));
  geo.setAttribute('color', new BufferAttribute(col, 3));
  const mat = new PointsMaterial({
    size: 0.045,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  return new Points(geo, mat);
}

// Long vertical light fibres that stretch with scroll velocity.
function buildFibres(count) {
  const geo = new BufferGeometry();
  const arr = new Float32Array(count * 6);
  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * 24;
    const y = (Math.random() - 0.5) * 14;
    const z = -3 - Math.random() * 7;
    const len = 0.6 + Math.random() * 2.2;
    arr.set([x, y, z, x, y + len, z], i * 6);
  }
  geo.setAttribute('position', new BufferAttribute(arr, 3));
  const mat = new LineBasicMaterial({
    color: ORANGE,
    transparent: true,
    opacity: 0.28,
    blending: AdditiveBlending,
    depthWrite: false,
  });
  return new LineSegments(geo, mat);
}

export function createScene(canvas, { reduced = false } = {}) {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;

  const camera = new PerspectiveCamera(38, 1, 0.1, 80);
  camera.position.set(0, 0, 8);

  // Lights: hot orange from the back-right, cold white rim from the front-left.
  const orange = new DirectionalLight(ORANGE, 4.2);
  orange.position.set(4, 2.5, -3);
  const white = new DirectionalLight(0xffffff, 2.4);
  white.position.set(-5, 4, 4);
  const fill = new DirectionalLight(0xff8a4c, 1.2);
  fill.position.set(2, -4, 5);
  scene.add(orange, white, fill);

  // Wheel group
  const wheel = new Group();
  const { geo, R, r } = buildTyre();
  const tyre = new Mesh(
    geo,
    new MeshStandardMaterial({ color: 0x151515, metalness: 0.55, roughness: 0.42 }),
  );
  const bead = new Mesh(
    new TorusGeometry(R - r * 0.62, 0.035, 12, 220),
    new MeshBasicMaterial({ color: ORANGE }),
  );
  const rim = new Mesh(
    new TorusGeometry(R - r * 0.9, 0.06, 16, 220),
    new MeshStandardMaterial({ color: 0x8a8a8a, metalness: 1, roughness: 0.18 }),
  );
  wheel.add(tyre, bead, rim);
  scene.add(wheel);

  const particles = buildParticles(reduced ? 220 : 520);
  const fibres = buildFibres(reduced ? 18 : 46);
  scene.add(fibres, particles);

  // ---- state -------------------------------------------------------------
  const target = { hero: 0, uni: 0, scroll: 0, velocity: 0, px: 0, py: 0, appear: reduced ? 1 : 0 };
  const cur = { hero: 0, uni: 0, scroll: 0, velocity: 0, px: 0, py: 0, appear: reduced ? 1 : 0 };
  let width = 1;
  let height = 1;
  let aspect = 1;
  let last = performance.now();
  let time = 0;
  let running = true;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    aspect = width / height;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(width, height, false);
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
  }

  function viewHalf(dist) {
    const h = Math.tan((camera.fov * Math.PI) / 360) * dist;
    return { w: h * aspect, h };
  }

  function pose(dt) {
    const k = reduced ? 1 : 1 - Math.pow(0.0015, dt); // frame-rate independent smoothing
    cur.hero = lerp(cur.hero, target.hero, k);
    cur.uni = lerp(cur.uni, target.uni, k);
    cur.scroll = lerp(cur.scroll, target.scroll, k);
    cur.velocity = lerp(cur.velocity, target.velocity, 1 - Math.pow(0.02, dt));
    cur.px = lerp(cur.px, target.px, 1 - Math.pow(0.02, dt));
    cur.py = lerp(cur.py, target.py, 1 - Math.pow(0.02, dt));
    cur.appear = lerp(cur.appear, target.appear, k);
    const ap = lerp(0.55, 1, easeOutCubic(clamp(cur.appear)));

    const portrait = aspect < 0.9;
    const half = viewHalf(8);
    const baseX = portrait ? 0 : half.w * 0.3;
    const baseY = portrait ? -half.h * 0.3 : 0;
    const sizeK = portrait ? clamp(aspect * 1.2, 0.4, 0.8) : 1;

    // Journey 1 – hero: the tyre spins and the camera ends up flying through it.
    const h = clamp(cur.hero, 0, 1);
    const hz = easeInCubic(h);
    // Journey 2 – universe: the tyre rushes in from the depth and flies through again.
    const u = clamp(cur.uni);
    const uIn = easeOutCubic(clamp(u / 0.28));
    const uOut = easeInCubic(clamp((u - 0.86) / 0.14));

    let visible = true;
    // the smoothed values only approach 0/1 asymptotically: use a small epsilon
    if (h < 0.998 && u < 0.002) {
      wheel.position.set(baseX * (1 - hz * 0.6), baseY * (1 - hz), lerp(-0.8, 9.4, hz));
      wheel.rotation.set(0.34 - h * 0.34, -0.56 + h * 0.9, -h * Math.PI * 1.1 + time * 0.05);
      wheel.scale.setScalar(sizeK * ap);
    } else if (u >= 0.002 && u < 0.998) {
      wheel.position.set(baseX * 1.05 * (1 - uOut * 0.6), baseY * (1 - uOut), lerp(-26, -5.2, uIn) + uOut * 14.5);
      wheel.rotation.set(0.3, -0.5 + u * 0.35, u * Math.PI * 2.4 + time * 0.05);
      wheel.scale.setScalar(sizeK * 1.05);
    } else {
      visible = false;
    }
    wheel.visible = visible;

    // gentle idle drift + pointer parallax
    wheel.rotation.y += cur.px * 0.12;
    wheel.rotation.x += cur.py * 0.08;

    // particles & fibres drift with time and with scroll
    const drift = cur.scroll * 0.0016;
    particles.position.y = (drift % 16) - 0;
    particles.rotation.y = time * 0.01 + cur.px * 0.05;
    fibres.position.y = -((drift * 1.8) % 14);
    fibres.scale.y = 1 + Math.min(Math.abs(cur.velocity) * 0.02, 2.4);
    fibres.material.opacity = 0.2 + Math.min(Math.abs(cur.velocity) * 0.01, 0.35);
    camera.position.x = cur.px * 0.25;
    camera.position.y = cur.py * -0.18;
    camera.lookAt(0, 0, 0);
  }

  function frame(now) {
    if (!running) return;
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    time += dt;
    pose(dt);
    renderer.render(scene, camera);
    if (!reduced) requestAnimationFrame(frame);
  }

  function renderOnce() {
    pose(1 / 60);
    renderer.render(scene, camera);
  }

  resize();
  window.addEventListener('resize', () => {
    resize();
    if (reduced) renderOnce();
  });
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running && !reduced) {
      last = performance.now();
      requestAnimationFrame(frame);
    }
  });

  if (reduced) {
    // Calm version: a single still frame, no loop.
    target.hero = 0.02;
    cur.hero = 0.02;
    renderOnce();
  } else {
    requestAnimationFrame(frame);
  }

  return {
    set(next) {
      Object.assign(target, next);
      if (reduced) renderOnce();
    },
    renderer,
  };
}
