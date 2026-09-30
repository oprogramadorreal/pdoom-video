// The explainer's first seconds (00.1, and the first beat of 00.2): "Você acabou de ouvir uma música de amor
// sobre o fim do mundo." The spark draws a heart as the voice starts; on "amor" it beats; it rounds into the
// Earth, a dotted globe with the Atlantic facing us; on "fim do mundo" it cracks and heats from one point; on
// the downbeat after "mundo" (the cut to 00.2) it blows apart, and the debris is still flying when the clip's
// plates flash back in on "tudo".
import type * as THREE from 'three';
import type { PostOverrides, SceneCtx } from '../engine/scene';
import { W, H } from '../engine/gl';
import { LIN, rgba } from '../engine/palette';
import { clamp, ease, hash, lerp, prog, pulse, TAU } from '../engine/util';
import { sparkHead, sparkParticles } from '../scenes/_motifs';
import type { LineBatch } from '../engine/lines';
import type { Narration } from './narration';
import { drawPartial, hot, type P2, type RGB } from './draw';
import { S } from './kit';
import { isLand } from './earth';

const CX = W / 2, CY = H / 2 - 20;
/** The globe's radius; the heart is about as wide. */
const R = 235;
/** Points on the heart and on the globe's rim, matched by arc length from the top (the heart's notch). */
const M = 240;

/** The heart outline, clockwise from its notch, M points evenly spaced along it (closed: last = first). */
function heartOutline(): P2[] {
  const raw: P2[] = [];
  for (let i = 0; i <= 720; i++) {
    const a = (i / 720) * TAU;
    raw.push({ x: 16 * Math.sin(a) ** 3, y: -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) });
  }
  let y0 = Infinity, y1 = -Infinity;
  for (const p of raw) { y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); }
  const s = (2 * R) / 32, my = (y0 + y1) / 2;
  const pts = raw.map((p) => ({ x: CX + p.x * s, y: CY + (p.y - my) * s }));
  return resample(pts, M);
}
function resample(pts: P2[], n: number): P2[] {
  const L = [0];
  for (let i = 1; i < pts.length; i++) L.push(L[i - 1]! + Math.hypot(pts[i]!.x - pts[i - 1]!.x, pts[i]!.y - pts[i - 1]!.y));
  const total = L[L.length - 1]!;
  const out: P2[] = [];
  let j = 1;
  for (let k = 0; k < n; k++) {
    const d = (k / (n - 1)) * total;
    while (j < L.length - 1 && L[j]! < d) j++;
    const u = (d - L[j - 1]!) / Math.max(1e-9, L[j]! - L[j - 1]!);
    out.push({ x: lerp(pts[j - 1]!.x, pts[j]!.x, u), y: lerp(pts[j - 1]!.y, pts[j]!.y, u) });
  }
  return out;
}

interface Dot { lon: number; lat: number; sp: number; life: number; w: number; j: [number, number, number] }
interface Crack { pts: P2[]; s0: number; len: number; w: number }
let dotsCache: Dot[] | null = null;
/** Land dots: a Fibonacci lattice on the sphere, kept where the mask says land. */
function landDots(): Dot[] {
  if (dotsCache) return dotsCache;
  const out: Dot[] = [];
  const N = 7000, ga = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const z = 1 - (2 * (i + 0.5)) / N, r = Math.sqrt(1 - z * z), a = i * ga;
    const lat = Math.asin(z) * 180 / Math.PI;
    const lon = ((Math.atan2(r * Math.sin(a), r * Math.cos(a)) * 180) / Math.PI);
    if (!isLand(lon, lat)) continue;
    const k = out.length;
    out.push({
      lon, lat, sp: 0.45 + 1.4 * hash(k, 11) ** 1.5, life: 0.55 + 0.6 * hash(k, 12), w: 0.7 + 0.7 * hash(k, 13),
      j: [hash(k, 14) - 0.5, hash(k, 15) - 0.5, hash(k, 16) - 0.5],
    });
  }
  return (dotsCache = out);
}

/** The impact point (screen), where the cracks start: up and right of the centre, over the Atlantic. */
const IMPACT: P2 = { x: CX + 0.16 * R, y: CY - 0.2 * R };
let cracksCache: Crack[] | null = null;
/** Cracks radiating from the impact point to the rim, with a few branches (a seeded random walk). */
function cracks(): Crack[] {
  if (cracksCache) return cracksCache;
  const out: Crack[] = [];
  let seed = 1;
  const walk = (x: number, y: number, a: number, s0: number, steps: number, w: number, depth: number) => {
    const pts: P2[] = [{ x, y }];
    let len = 0;
    for (let i = 0; i < steps; i++) {
      a += (hash(seed++, 21) - 0.5) * 0.7;
      const st = 11 + 7 * hash(seed++, 22);
      const nx = x + Math.cos(a) * st, ny = y + Math.sin(a) * st;
      if (Math.hypot(nx - CX, ny - CY) > R * 0.985) break;
      x = nx; y = ny; len += st;
      pts.push({ x, y });
      if (depth < 2 && i > 2 && hash(seed++, 23) < 0.16) walk(x, y, a + (hash(seed++, 24) < 0.5 ? -1 : 1) * (0.5 + 0.4 * hash(seed++, 25)), s0 + len, 4 + Math.floor(8 * hash(seed++, 26)), w * 0.6, depth + 1);
    }
    if (pts.length > 1) out.push({ pts, s0, len, w });
  };
  for (let k = 0; k < 9; k++) walk(IMPACT.x, IMPACT.y, (k / 9) * TAU + (hash(k, 27) - 0.5) * 0.5, 0, 40, 2.6, 0);
  return (cracksCache = out);
}

const D2R = Math.PI / 180;
/** Orthographic view of the globe centred on (lon0, lat0): x right, y up, z towards us (unit sphere). */
function project(lon: number, lat: number, lon0: number, lat0: number) {
  const p = lat * D2R, l = (lon - lon0) * D2R, p0 = lat0 * D2R;
  const cp = Math.cos(p);
  return { x: cp * Math.sin(l), y: Math.cos(p0) * Math.sin(p) - Math.sin(p0) * cp * Math.cos(l), z: Math.sin(p0) * Math.sin(p) + Math.cos(p0) * cp * Math.cos(l) };
}
const mixRGB = (a: RGB, b: RGB, k: number): RGB => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const scaleRGB = (a: RGB, s: number): RGB => [a[0] * s, a[1] * s, a[2] * s];
const BONE: RGB = [LIN.bone[0], LIN.bone[1], LIN.bone[2]];

export class Opening {
  /** The spark lights; the heart is traced; it beats (lub, dub); it rounds into the globe; the cracks; the blast. */
  tIgnite: number; tH0: number; tH1: number; tLub: number; tDub: number; tM0: number; tM1: number; tFim: number; tBoom: number;
  private heart = heartOutline();
  private rim = Array.from({ length: M }, (_, k) => {
    const a = -Math.PI / 2 + (k / (M - 1)) * TAU;
    return { x: CX + Math.cos(a) * R, y: CY + Math.sin(a) * R };
  });
  private dots = landDots();
  private cracks = cracks();

  constructor(n: Narration, tBoom: number) {
    const at = (q: string) => n.word('00.1', q).start;
    this.tH0 = at('Você'); this.tIgnite = this.tH0 - 0.35;
    this.tLub = at('amor'); this.tH1 = this.tLub - 0.08; this.tDub = this.tLub + 0.22;
    this.tM0 = n.nextBeat(this.tLub + 0.05); this.tM1 = this.tM0 + 0.34;
    this.tFim = at('fim');
    this.tBoom = tBoom;
  }

  /** The heart's point at r (0..1 of its length), before it rounds off. */
  private heartAt(r: number): P2 {
    const x = clamp(r) * (M - 1), i = Math.min(M - 2, Math.floor(x)), u = x - i;
    const a = this.heart[i]!, b = this.heart[i + 1]!;
    return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) };
  }
  private traceK(t: number) { return ease.inOutCubic(prog(t, this.tH0, this.tH1)); }
  /** The heartbeat: a scale around the centre. */
  private beat(t: number) { return 1 + 0.075 * pulse(t, this.tLub, 0.09) + 0.05 * pulse(t, this.tDub, 0.08); }
  private view(t: number) {
    // the globe turns while it forms, and holds still once it cracks
    return { lon0: lerp(-18, -36, ease.outCubic(prog(t, this.tM0, this.tFim + 0.2))), lat0: 8 };
  }

  /**
   * Draw the opening over `out` (which holds the clip's first frame: black, the crop marks). Returns the
   * post overrides (the blast's flash, shake and punch).
   */
  render(ctx: SceneCtx, t: number, out: THREE.WebGLRenderTarget): PostOverrides {
    const { renderer, comp } = ctx;
    const lb = S().lines; lb.clear();
    const ol = S().solid; ol.clear();
    const L = S().ui; L.clear(); const c = L.ctx;
    const boom = t >= this.tBoom;
    const morph = ease.inOutCubic(prog(t, this.tM0, this.tM1));
    const sc = this.beat(t);
    const tf = (p: P2): P2 => ({ x: CX + (p.x - CX) * sc, y: CY + (p.y - CY) * sc });
    const outline = this.heart.map((p, k) => tf({ x: lerp(p.x, this.rim[k]!.x, morph), y: lerp(p.y, this.rim[k]!.y, morph) }));

    if (!boom) {
      // the heart's glow: a soft fill that comes on with "amor" and goes as it rounds off
      const fill = prog(t, this.tLub - 0.04, this.tLub + 0.12) * (1 - morph);
      if (fill > 0) {
        c.save();
        c.beginPath(); outline.forEach((p, k) => (k ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y))); c.closePath();
        const g = c.createRadialGradient(CX, CY - 30, 10, CX, CY, R * 1.1);
        g.addColorStop(0, rgba('signal', 0.34 * fill)); g.addColorStop(1, rgba('blood', 0.12 * fill));
        c.fillStyle = g; c.fill();
        c.restore();
      }
      // echoes of the heartbeat
      for (const [t0, k] of [[this.tLub, 1], [this.tDub, 0.7]] as const) {
        const age = t - t0;
        if (age < 0 || age > 0.5 || morph > 0.5) continue;
        const s = 1 + 0.35 * ease.outCubic(age / 0.5);
        const e = outline.map((p) => ({ x: CX + (p.x - CX) * s, y: CY + (p.y - CY) * s }));
        ol.polyline(e, 1.6, hot(1.2 * k), (1 - age / 0.5) * 0.7);
      }
      // the outline: traced by the spark, then the globe's rim
      const k = this.traceK(t);
      if (t >= this.tIgnite && k <= 0) sparkHead(lb, this.heart[0]!.x, this.heart[0]!.y, t, 0.8, prog(t, this.tIgnite, this.tIgnite + 0.2));
      if (k > 0) {
        const col = mixRGB(hot(1.7), scaleRGB(BONE, 0.55), morph);
        const head = drawPartial(ol, outline, k, lerp(3.2, 1.8, morph), col, 1);
        if (k < 1 && head) {
          sparkParticles(lb, t, (tb) => (tb >= this.tH0 && tb <= this.tH1 ? tf(this.heartAt(this.traceK(tb))) : null), { rate: 70, speed: 170, seed: 7 });
          sparkHead(lb, head.x, head.y, t, 0.9, 1);
        }
      }
      if (morph > 0) this.globe(lb, t, morph);
      if (t >= this.tFim) this.crack(ol, lb, t);
    } else this.blast(c, lb, t);

    comp.draw(renderer, L.upload(), out);
    ol.render(renderer, out);
    lb.render(renderer, out);
    // the ground shakes while it cracks; the blast flashes and punches in
    const quake = 4 * prog(t, this.tFim, this.tBoom) ** 2 * (boom ? 0 : 1);
    const hit = 18 * pulse(t, this.tBoom, 0.1);
    const a = quake + hit;
    return {
      bloom: boom ? 0.5 : 0.62, bloomThreshold: boom ? 1 : 0.8, ca: 0.8 + 3 * pulse(t, this.tBoom, 0.12), frame: 1,
      flash: 0.45 * pulse(t, this.tBoom, 0.012), zoom: 1 + 0.035 * pulse(t, this.tBoom, 0.16),
      shake: [a * Math.sin(t * 97.3), a * Math.cos(t * 83.1)],
    };
  }

  /** The dotted globe (land only), a faint graticule; the dots heat up behind the crack front. */
  private globe(lb: LineBatch, t: number, morph: number) {
    const { lon0, lat0 } = this.view(t);
    const grow = ease.outCubic(prog(t, this.tM0 + 0.08, this.tM1 + 0.2));
    const front = this.frontR(t);
    // graticule: parallels and meridians, the front half only
    const ga = 0.3 * grow;
    if (ga > 0) {
      const g: RGB = scaleRGB([LIN.graphite[0], LIN.graphite[1], LIN.graphite[2]], 0.9);
      const seg = (lon: number, lat: number, lon2: number, lat2: number) => {
        const p = project(lon, lat, lon0, lat0), q = project(lon2, lat2, lon0, lat0);
        if (p.z <= 0 || q.z <= 0) return;
        lb.seg2(CX + p.x * R, CY - p.y * R, CX + q.x * R, CY - q.y * R, 1, g, ga * Math.min(p.z, q.z) ** 0.5);
      };
      for (let lat = -60; lat <= 60; lat += 30) for (let lon = -180; lon < 180; lon += 6) seg(lon, lat, lon + 6, lat);
      for (let lon = -180; lon < 180; lon += 30) for (let lat = -84; lat < 84; lat += 6) seg(lon, lat, lon, lat + 6);
    }
    for (const d of this.dots) {
      const p = project(d.lon, d.lat, lon0, lat0);
      if (p.z <= 0.02) continue;
      const x = CX + p.x * R, y = CY - p.y * R;
      // the dots come in from the centre outwards
      const rr = Math.hypot(p.x, p.y);
      const a = clamp((grow * 1.25 - rr) / 0.25) * morph;
      if (a <= 0) continue;
      const heat = front > 0 ? clamp((front - Math.hypot(x - IMPACT.x, y - IMPACT.y)) / 90) : 0;
      const col = mixRGB(scaleRGB(BONE, 0.3 + 0.62 * p.z), hot(1.5 + heat), heat);
      lb.seg2(x, y, x + 0.01, y, 3.4 * (0.7 + 0.3 * p.z), col, a);
    }
  }

  /** The radius of the heat front around the impact point (0 before the cracks). */
  private frontR(t: number) { return t < this.tFim ? 0 : R * 2.1 * ease.inQuad(prog(t, this.tFim + 0.1, this.tBoom)); }

  /** The cracks, running out from the impact point, and the glow where it started. */
  private crack(ol: LineBatch, lb: LineBatch, t: number) {
    const g = R * 2.3 * ease.outCubic(prog(t, this.tFim, this.tBoom - 0.12));
    for (const k of this.cracks) {
      const r = (g - k.s0) / k.len;
      if (r <= 0) continue;
      drawPartial(ol, k.pts, clamp(r), k.w * (0.8 + 0.4 * prog(t, this.tFim, this.tBoom)), hot(2.2), 1);
    }
    sparkHead(lb, IMPACT.x, IMPACT.y, t, 0.7 + 0.9 * prog(t, this.tFim, this.tBoom), 1);
  }

  /**
   * The blast: a soft fireball (a 2D glow), a shock ring, the land dots thrown out as streaks — the continents
   * swell for an instant before they come apart — and a burst of sparks. Kept dim enough that the frame stays
   * black around it (the bloom would grey it all).
   */
  private blast(c: CanvasRenderingContext2D, lb: LineBatch, t: number) {
    const age = t - this.tBoom;
    const { lon0, lat0 } = this.view(this.tBoom);
    // the fireball
    const fr = R * (0.5 + 1.3 * (1 - Math.exp(-age * 7))), fa = Math.exp(-age * 5);
    const g = c.createRadialGradient(CX, CY, 0, CX, CY, fr);
    g.addColorStop(0, `rgba(255,236,210,${0.95 * fa})`); g.addColorStop(0.18, rgba('ember', 0.8 * fa));
    g.addColorStop(0.5, rgba('signal', 0.35 * fa)); g.addColorStop(1, rgba('signal', 0));
    c.fillStyle = g; c.beginPath(); c.arc(CX, CY, fr, 0, TAU); c.fill();
    // the shock ring
    const rr = R * (1 + 4.2 * (1 - Math.exp(-age * 4))), ra = Math.exp(-age * 4);
    if (ra > 0.02) {
      const pts: P2[] = [];
      for (let i = 0; i <= 160; i++) { const u = (i / 160) * TAU; pts.push({ x: CX + Math.cos(u) * rr, y: CY + Math.sin(u) * rr }); }
      lb.polyline(pts, 1 + 3 * ra, scaleRGB(BONE, 0.9), 0.8 * ra);
    }
    // the land, thrown out: each dot along its own direction, hot, cooling, gone within a second
    const reach = (a: number, sp: number) => 1 + sp * (1 - Math.exp(-a * 3.2)) * 2.6 + sp * 0.35 * a;
    for (const d of this.dots) {
      if (age > d.life) continue;
      const p = project(d.lon, d.lat, lon0, lat0);
      const vx = p.x + d.j[0] * 0.3, vy = p.y + d.j[1] * 0.3, vz = p.z + d.j[2] * 0.3;
      const persp = (D: number) => 1 + 0.35 * vz * (D - 1);
      const D1 = reach(age, d.sp), D0 = reach(Math.max(0, age - 0.03), d.sp);
      const x1 = CX + vx * R * D1 * persp(D1), y1 = CY - vy * R * D1 * persp(D1);
      const x0 = CX + vx * R * D0 * persp(D0), y0 = CY - vy * R * D0 * persp(D0);
      const k = 1 - age / d.life;
      const heat = Math.exp(-age * 7);
      const col = mixRGB(scaleRGB([LIN.signal[0], LIN.signal[1], LIN.signal[2]], 1.1), [1.35, 1.05, 0.8], heat * heat);
      lb.seg2(x0, y0, x1, y1, 2.2 * d.w * (1 + 0.4 * Math.max(0, vz)), col, clamp(k * 1.5) * (vz < 0 ? 0.35 : 0.85));
    }
    // sparks
    for (let i = 0; i < 140; i++) {
      const life = 0.25 + 0.5 * hash(i, 31);
      if (age > life) continue;
      const a = hash(i, 32) * TAU, v = 900 + 1900 * hash(i, 33) ** 2, kd = 3;
      const dist = (x: number) => (v / kd) * (1 - Math.exp(-kd * x));
      const r1 = dist(age), r0 = dist(Math.max(0, age - 0.02));
      const gy = 260 * age * age;
      const k = 1 - age / life;
      lb.seg2(CX + Math.cos(a) * r0, CY + Math.sin(a) * r0 + gy, CX + Math.cos(a) * r1, CY + Math.sin(a) * r1 + gy, 1.2 + k, hot(1.1 + k * k), k);
    }
    sparkHead(lb, CX, CY, t, 2.4 * Math.exp(-age * 7) + 0.01, Math.exp(-age * 6));
  }
}
