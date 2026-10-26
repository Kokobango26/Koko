// Transparent WebGL layer: the knobby tyre the camera flies through at the intro, plus drifting embers.
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
      const tread = clamp((Math.cos(v) - 0.25) / 0.6);
      const lug = clamp((Math.sin(u * lugs) + 0.1) * 2.6);
      const shoulder = clamp((Math.abs(Math.sin(v)) - 0.55) / 0.35) * 0.35 * Math.pow(clamp(Math.sin(u * lugs + 1.2) * 0.5 + 0.5), 2);
      const d = 0.085 * tread * lug + 0.04 * shoulder * (1 - tread);
      pos.setXYZ(
        idx,
        pos.getX(idx) + Math.cos(v) * Math.cos(u) * d,
        pos.getY(idx) + Math.cos(v) * Math.sin(u) * d,
        pos.getZ(idx) + Math.sin(v) * d,
      );
    }
  }
  geo.computeVertexNormals();
  return { geo, R, r };
}

function embers(count) {
  const geo = new BufferGeometry();
  const arr = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const cs = [new Color(ORANGE), new Color(0xffb347), new Color(0xffffff)];
  for (let i = 0; i < count; i++) {
    arr[i * 3] = (Math.random() - 0.5) * 22;
    arr[i * 3 + 1] = (Math.random() - 0.5) * 16;
    arr[i * 3 + 2] = (Math.random() - 0.5) * 12 - 2;
    const c = cs[Math.floor(Math.random() * Math.random() * 3)];
    const k = 0.4 + Math.random() * 0.6;
    col.set([c.r * k, c.g * k, c.b * k], i * 3);
  }
  geo.setAttribute('position', new BufferAttribute(arr, 3));
  geo.setAttribute('color', new BufferAttribute(col, 3));
  return new Points(
    geo,
    new PointsMaterial({ size: 0.05, vertexColors: true, transparent: true, opacity: 0.8, depthWrite: false, blending: AdditiveBlending }),
  );
}

function fibres(count) {
  const geo = new BufferGeometry();
  const arr = new Float32Array(count * 6);
  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * 24;
    const y = (Math.random() - 0.5) * 14;
    const z = -3 - Math.random() * 7;
    arr.set([x, y, z, x, y + 0.6 + Math.random() * 2.2, z], i * 6);
  }
  geo.setAttribute('position', new BufferAttribute(arr, 3));
  return new LineSegments(
    geo,
    new LineBasicMaterial({ color: ORANGE, transparent: true, opacity: 0.25, blending: AdditiveBlending, depthWrite: false }),
  );
}

export function createGate(canvas, { reduced = false } = {}) {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;

  const camera = new PerspectiveCamera(38, 1, 0.1, 80);
  camera.position.set(0, 0, 9);

  const key = new DirectionalLight(ORANGE, 4.6);
  key.position.set(3, 2.5, -4);
  const rim = new DirectionalLight(0xffffff, 2.6);
  rim.position.set(-5, 4, 6);
  const fill = new DirectionalLight(0xff8a4c, 1.4);
  fill.position.set(2, -4, 5);
  scene.add(key, rim, fill);

  const wheel = new Group();
  const { geo, R, r } = buildTyre();
  wheel.add(
    new Mesh(geo, new MeshStandardMaterial({ color: 0x151515, metalness: 0.55, roughness: 0.42 })),
    new Mesh(new TorusGeometry(R - r * 0.62, 0.035, 12, 220), new MeshBasicMaterial({ color: ORANGE })),
    new Mesh(new TorusGeometry(R - r * 0.9, 0.06, 16, 220), new MeshStandardMaterial({ color: 0x8a8a8a, metalness: 1, roughness: 0.18 })),
  );
  wheel.rotation.set(0.12, -0.18, 0);
  scene.add(wheel);

  const dust = embers(reduced ? 160 : 420);
  const lines = fibres(reduced ? 14 : 40);
  scene.add(lines, dust);

  const state = { dolly: 0, velocity: 0, scroll: 0, spin: 0, show: 0 };
  let cur = { velocity: 0, scroll: 0 };
  let last = performance.now();
  let time = 0;

  function resize() {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }

  function draw(dt) {
    cur.velocity += (state.velocity - cur.velocity) * (1 - Math.pow(0.02, dt));
    cur.scroll += (state.scroll - cur.scroll) * (1 - Math.pow(0.01, dt));
    const d = state.dolly; // 0 → ring far away, 1 → camera has crossed it
    const portrait = camera.aspect < 0.9;
    const ease = d * d * d;
    camera.position.z = 9 - ease * 13;
    camera.fov = 38 + ease * 38;
    camera.updateProjectionMatrix();
    wheel.visible = d < 0.995;
    wheel.scale.setScalar(portrait ? 0.62 : 1);
    wheel.rotation.z = state.spin + time * 0.04;
    dust.position.y = (cur.scroll * 0.0012) % 16;
    dust.rotation.y = time * 0.012;
    lines.position.y = -((cur.scroll * 0.002) % 14);
    lines.scale.y = 1 + Math.min(Math.abs(cur.velocity) * 0.02, 2.4);
    lines.material.opacity = 0.18 + Math.min(Math.abs(cur.velocity) * 0.01, 0.35);
    dust.material.opacity = 0.8 * state.show;
    lines.material.opacity *= state.show;
    renderer.render(scene, camera);
  }

  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    time += dt;
    draw(dt);
    requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener('resize', () => {
    resize();
    if (reduced) draw(1 / 60);
  });
  if (reduced) {
    state.dolly = 1;
    state.show = 1;
    draw(1 / 60);
  } else {
    requestAnimationFrame(frame);
  }

  return {
    state,
    set(next) {
      Object.assign(state, next);
      if (reduced) draw(1 / 60);
    },
  };
}
