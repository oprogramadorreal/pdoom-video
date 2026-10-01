// Bone paper for the explainer's cards (forms, study title pages, headlines, the deposition): the `bureau`
// idiom — inks drawn channel-coded on a 2D layer (R typewriter, G print, B orange / rubber stamp),
// overprinted Beer–Lambert on procedural paper (fibres, grain, stamp voids). A sheet is a rectangle in page
// px seen through a 2D camera; it is composited over whatever is under it, with a soft drop shadow.
import * as THREE from 'three';
import { FSPass, Layer2D, W, H } from '../engine/gl';

export const INK = {
  type: (a = 1) => `rgba(255,0,0,${a})`,
  print: (a = 1) => `rgba(0,255,0,${a})`,
  orange: (a = 1) => `rgba(0,0,255,${a})`,
};

const PAPER = /* glsl */ `
uniform sampler2D inkTex;
uniform vec3 camA; uniform vec3 camB;   // screen px (y down) -> page px
uniform vec4 sheet;                      // page rect x0, y0, x1, y1
uniform vec4 st0; uniform vec4 st0b;     // stamp: centre.xy, half.xy | angle, strength, seed, -
uniform float zoom, alpha, shadow;

float fibres(vec2 p, float cs) {
  float acc = 0.0;
  vec2 cell = floor(p / cs);
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    vec2 c = cell + vec2(float(i), float(j));
    vec2 h = hash22(c);
    vec2 o = (c + h) * cs;
    float a = hash12(c + 7.1) * TAU;
    float L = cs * (0.3 + 1.1 * hash12(c + 3.3));
    vec2 d = vec2(cos(a), sin(a));
    float dist = sdSegment(p, o - d * L * 0.5, o + d * L * 0.5);
    float s = hash12(c + 9.9) - 0.5;
    acc += s * (1.0 - smoothstep(0.25, 0.9 + 0.4 / zoom, dist));
  }
  return acc;
}
float stampInk(vec2 p, float cov, float edge, float seed, float strength) {
  float n = snoise(p * 0.07 + seed) * 0.45 + snoise(p * 0.23 + seed * 2.0) * 0.35 + snoise(p * 0.9 - seed) * 0.2;
  float press = smoothstep(-0.9, 0.3, snoise(p * 0.0045 + seed * 3.0));
  float voids = smoothstep(-0.58, -0.36, n + (strength - 1.0) * 0.8 + 0.25 * press);
  return sat(cov * voids * (0.72 + 0.28 * press) * 1.25 + edge * 0.5);
}
void main() {
  vec2 sp = vec2(vUv.x * ${W.toFixed(1)}, (1.0 - vUv.y) * ${H.toFixed(1)});
  vec2 pp = vec2(dot(camA, vec3(sp, 1.0)), dot(camB, vec3(sp, 1.0)));
  vec2 c0 = (sheet.xy + sheet.zw) * 0.5, hs = (sheet.zw - sheet.xy) * 0.5;
  float d = sdBox(pp - c0, hs);
  float px = 1.0 / zoom;
  float inside = 1.0 - smoothstep(-px, px, d);
  // the drop shadow (outside the sheet)
  float sh = shadow * (1.0 - smoothstep(0.0, 70.0, sdBox(pp - c0 - vec2(10.0, 18.0), hs))) * 0.55;
  if (inside <= 0.0) { fragColor = vec4(0.0, 0.0, 0.0, sh * alpha); return; }
  float cloud = fbm(pp * 0.0021, 4);
  float fib = fibres(pp, 22.0) + 0.6 * fibres(pp * 1.7 + 31.0, 22.0);
  float speck = step(0.99965, hash12(floor(pp * 0.5)));
  vec3 paper = C_BONE * (0.975 + 0.028 * cloud + 0.008 * snoise(pp * 0.018) + 0.05 * fib);
  paper *= (1.0 - speck * 0.35) * (0.97 + 0.03 * (1.0 - vUv.y * 0.6 - vUv.x * 0.4));
  vec4 ink = texture(inkTex, vUv);
  float dOr = ink.b * (0.92 + 0.08 * snoise(pp * 0.25));
  if (st0b.y > 0.0) {
    vec2 q = rot2(-st0b.x) * (pp - st0.xy);
    vec2 dd = abs(q) - st0.zw;
    if (dd.x < 0.0 && dd.y < 0.0) {
      vec2 e = vec2(3.0) / vec2(${W.toFixed(1)}, ${H.toFixed(1)});
      float b4 = (texture(inkTex, vUv + vec2(e.x, 0.0)).b + texture(inkTex, vUv - vec2(e.x, 0.0)).b + texture(inkTex, vUv + vec2(0.0, e.y)).b + texture(inkTex, vUv - vec2(0.0, e.y)).b) * 0.25;
      dOr = stampInk(pp, ink.b, sat((ink.b - b4) * 2.0), st0b.z, st0b.y);
    }
  }
  float dType = ink.r * (0.86 + 0.14 * smoothstep(-0.5, 0.6, snoise(pp * 0.35))) * (1.0 - 0.18 * sat(fib * 4.0));
  vec3 col = paper;
  col *= pow(clamp(C_SIGNAL / C_BONE, 0.004, 1.0), vec3(sat(dOr)));
  col *= pow(clamp(C_INK / C_BONE * 1.25, 0.004, 1.0), vec3(sat(ink.g)));
  col *= pow(clamp(vec3(0.03, 0.028, 0.03) / C_BONE, 0.004, 1.0), vec3(sat(dType)));
  // edge darkening of the sheet
  col *= 1.0 - 0.1 * (1.0 - smoothstep(0.0, 26.0, -d));
  float a = alpha * inside;
  fragColor = vec4(col * a, max(a, sh * alpha * (1.0 - inside)));
}`;

export interface SheetCam { x: number; y: number; zoom: number; roll: number }
export interface Stamp { x: number; y: number; hw: number; hh: number; rot: number; strength: number; seed?: number }

/** Page px -> screen px affine of a camera looking at page point (x, y). */
export function pageToScreen(cam: SheetCam) {
  const cs = Math.cos(cam.roll) * cam.zoom, sn = Math.sin(cam.roll) * cam.zoom;
  return { a: cs, b: sn, c: -sn, d: cs, e: W / 2 - (cs * cam.x - sn * cam.y), f: H / 2 - (sn * cam.x + cs * cam.y) };
}

export class Sheet {
  ink = new Layer2D();
  pass = new FSPass(PAPER, {
    inkTex: { value: null }, camA: { value: new THREE.Vector3() }, camB: { value: new THREE.Vector3() },
    sheet: { value: new THREE.Vector4() }, st0: { value: new THREE.Vector4() }, st0b: { value: new THREE.Vector4() },
    zoom: { value: 1 }, alpha: { value: 1 }, shadow: { value: 1 },
  }, { blending: THREE.CustomBlending, transparent: true });
  constructor() {
    const m = this.pass.mat;
    m.blendEquation = THREE.AddEquation; m.blendSrc = THREE.OneFactor; m.blendDst = THREE.OneMinusSrcAlphaFactor;
    m.blendSrcAlpha = THREE.OneFactor; m.blendDstAlpha = THREE.OneMinusSrcAlphaFactor;
  }
  /**
   * Draw the sheet `rect` (page px) seen by `cam` over `out`. `draw` paints the inks in page px (the
   * context is already transformed; use INK.* colours, they add up per channel).
   */
  render(renderer: THREE.WebGLRenderer, out: THREE.WebGLRenderTarget, cam: SheetCam, rect: [number, number, number, number], draw: (c: CanvasRenderingContext2D) => void, o: { alpha?: number; stamp?: Stamp | null; shadow?: number } = {}) {
    const L = this.ink;
    L.clear('#000');
    const c = L.ctx;
    const m = pageToScreen(cam);
    c.save();
    c.setTransform(m.a, m.b, m.c, m.d, m.e, m.f);
    c.globalCompositeOperation = 'lighter';
    draw(c);
    c.restore();
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalCompositeOperation = 'source-over';
    // screen -> page: the inverse affine
    const det = m.a * m.d - m.b * m.c;
    const ia = m.d / det, ib = -m.b / det, ic = -m.c / det, id = m.a / det;
    const ie = -(ia * m.e + ic * m.f), iff = -(ib * m.e + id * m.f);
    const u = this.pass.u;
    u.inkTex!.value = L.upload();
    (u.camA!.value as THREE.Vector3).set(ia, ic, ie);
    (u.camB!.value as THREE.Vector3).set(ib, id, iff);
    (u.sheet!.value as THREE.Vector4).set(...rect);
    const s = o.stamp;
    (u.st0!.value as THREE.Vector4).set(s?.x ?? 0, s?.y ?? 0, (s?.hw ?? 0) * 1.12, (s?.hh ?? 0) * 1.12);
    (u.st0b!.value as THREE.Vector4).set(s?.rot ?? 0, s ? s.strength : 0, s?.seed ?? 3.7, 0);
    u.zoom!.value = cam.zoom; u.alpha!.value = o.alpha ?? 1; u.shadow!.value = o.shadow ?? 1;
    this.pass.render(renderer, out);
  }
}
