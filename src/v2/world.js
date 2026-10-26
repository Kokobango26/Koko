// Living colour world: a full-screen smoke/cloud shader whose palette morphs between "worlds".
import { Color, Mesh, OrthographicCamera, PlaneGeometry, Scene, ShaderMaterial, Vector2, Vector3, WebGLRenderer } from 'three';

const hex = (h) => new Color(h);

// [dark, mid, light] per world
export const PALETTES = [
  [hex('#150300'), hex('#d8390a'), hex('#ffb347')], // 0 sunset (hero)
  [hex('#1c0200'), hex('#f14b03'), hex('#ffd27a')], // 1 deals
  [hex('#14030c'), hex('#9a1033'), hex('#ff6a80')], // 2 motos – crimson
  [hex('#020a1e'), hex('#0c4ddb'), hex('#74b8ff')], // 3 quads – electric blue
  [hex('#02110b'), hex('#0f7040'), hex('#86e394')], // 4 buggy / ssv – forest
  [hex('#1d1300'), hex('#f0a500'), hex('#fff0a6')], // 5 kids – sun yellow
  [hex('#070606'), hex('#1b100b'), hex('#43200d')], // 6 night
  [hex('#150300'), hex('#d8390a'), hex('#ffb347')], // 7 sunset (finale)
];

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const FRAG = `
precision highp float;
varying vec2 vUv;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uC0; uniform vec3 uC1; uniform vec3 uC2;
uniform vec2 uGlow; uniform float uGlowK;
uniform float uWarp;

float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  float a = hash(i), b = hash(i+vec2(1.,0.)), c = hash(i+vec2(0.,1.)), d = hash(i+vec2(1.,1.));
  vec2 u = f*f*(3.-2.*f);
  return mix(a,b,u.x) + (c-a)*u.y*(1.-u.x) + (d-b)*u.x*u.y;
}
float fbm(vec2 p){
  float v = 0.0; float a = 0.5;
  mat2 m = mat2(1.6,1.2,-1.2,1.6);
  for(int i=0;i<4;i++){ v += a*noise(p); p = m*p; a *= 0.5; }
  return v;
}
void main(){
  vec2 uv = vUv;
  vec2 p = (uv-0.5)*vec2(uRes.x/uRes.y, 1.0);
  float t = uTime*0.045;
  vec2 q = vec2(fbm(p*1.5+vec2(0.0,t)), fbm(p*1.5+vec2(5.2,1.3)-t));
  vec2 r = vec2(fbm(p*2.0+q*2.0+vec2(1.7,9.2)+t*1.4), fbm(p*2.0+q*2.0+vec2(8.3,2.8)-t));
  float f = fbm(p*1.7+r*(1.6+uWarp));
  vec2 g = p - (uGlow-0.5)*vec2(uRes.x/uRes.y, 1.0);
  float glow = exp(-length(g)*1.7) * uGlowK;
  float k = f*0.9 + glow*0.75;
  vec3 col = mix(uC0, uC1, smoothstep(0.18, 0.72, k));
  col = mix(col, uC2, smoothstep(0.55, 1.05, k + glow*0.35));
  col += vec3(1.0,0.96,0.9) * pow(glow, 3.0) * 0.55;
  col *= smoothstep(1.55, 0.2, length(p));
  float gr = hash(gl_FragCoord.xy + uTime) - 0.5;
  col += gr * 0.035;
  gl_FragColor = vec4(col, 1.0);
}`;

export function createWorld(canvas, { reduced = false } = {}) {
  const renderer = new WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const uniforms = {
    uRes: { value: new Vector2(1, 1) },
    uTime: { value: 0 },
    uC0: { value: new Vector3() },
    uC1: { value: new Vector3() },
    uC2: { value: new Vector3() },
    uGlow: { value: new Vector2(0.5, 0.5) },
    uGlowK: { value: 1 },
    uWarp: { value: 0 },
  };
  const mat = new ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, depthTest: false, depthWrite: false });
  scene.add(new Mesh(new PlaneGeometry(2, 2), mat));

  const target = { world: 0, gx: 0.62, gy: 0.5, glow: 1, warp: 0 };
  const cur = { world: 0, gx: 0.62, gy: 0.5, glow: 1, warp: 0 };
  let last = performance.now();
  let time = 0;
  let scale = window.innerWidth < 900 ? 0.4 : 0.55;

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setPixelRatio(1);
    renderer.setSize(Math.max(2, Math.round(w * scale)), Math.max(2, Math.round(h * scale)), false);
    uniforms.uRes.value.set(renderer.domElement.width, renderer.domElement.height);
  }

  function palette() {
    const w = Math.min(Math.max(cur.world, 0), PALETTES.length - 1);
    const i = Math.floor(w);
    const j = Math.min(i + 1, PALETTES.length - 1);
    const f = w - i;
    const s = f * f * (3 - 2 * f);
    for (let c = 0; c < 3; c++) {
      const a = PALETTES[i][c];
      const b = PALETTES[j][c];
      uniforms['uC' + c].value.set(a.r + (b.r - a.r) * s, a.g + (b.g - a.g) * s, a.b + (b.b - a.b) * s);
    }
  }

  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    time += dt;
    const k = 1 - Math.pow(0.002, dt);
    for (const key of ['world', 'gx', 'gy', 'glow', 'warp']) cur[key] += (target[key] - cur[key]) * k;
    palette();
    uniforms.uTime.value = time;
    uniforms.uGlow.value.set(cur.gx, cur.gy);
    uniforms.uGlowK.value = cur.glow;
    uniforms.uWarp.value = cur.warp;
    renderer.render(scene, camera);
    if (!reduced) requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener('resize', () => {
    scale = window.innerWidth < 900 ? 0.4 : 0.55;
    resize();
    if (reduced) frame(performance.now());
  });
  if (reduced) {
    cur.world = target.world;
    frame(performance.now());
  } else {
    requestAnimationFrame(frame);
  }

  return {
    set(next) {
      Object.assign(target, next);
      if (reduced) {
        Object.assign(cur, next);
        frame(performance.now());
      }
    },
    snap() { Object.assign(cur, target); },
  };
}
