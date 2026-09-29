// The explainer's shared kit: scratch GPU resources (shared by every block: only one or two blocks render
// per frame, each finishing before the next), the camera pass over a rendered frame, the ruler (the
// song as a paused player at the foot of the frame) and the docked verse.
import * as THREE from 'three';
import { FSPass, Layer2D, W, H, makeRT } from '../engine/gl';
import { LineBatch } from '../engine/lines';
import { LIN, rgba } from '../engine/palette';
import { F, font, layout, textPathCommands } from '../engine/type';
import { clamp, ease, lerp, prog } from '../engine/util';
import type { Lyrics, Line } from '../engine/lyrics';
import type { Narration } from './narration';
import { MONTAGE, verseLines, type BlockSpec } from './montage';
import { blockCuts } from './timeline';
import { CLIP_END } from './soundtrack';
import { Sheet } from './paper';

// ---------------------------------------------------------------- shared scratch resources
const VIEW = /* glsl */ `
  uniform sampler2D tex; uniform vec4 cam; uniform vec4 rect; uniform float dim, duo, satur, alpha, blur, fit, feather; uniform vec3 tint;
  vec3 grade(vec3 c) {
    float l = luma(c);
    vec3 d = mix(C_INK, C_SIGNAL * 1.2, smoothstep(0.02, 0.35, l));
    d = mix(d, C_BONE, smoothstep(0.35, 0.8, l));
    c = mix(c, d, duo);
    return mix(vec3(l), c, satur) * tint * dim;
  }
  vec3 tap(vec2 p) {
    vec2 uv = vec2(p.x / ${W.toFixed(1)}, 1.0 - p.y / ${H.toFixed(1)});
    float inside = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);
    return texture(tex, uv).rgb * inside;
  }
  void main() {
    vec2 sp = vec2(vUv.x * ${W.toFixed(1)}, (1.0 - vUv.y) * ${H.toFixed(1)});
    // the view fills rect (screen px); inside it, a camera looks at source point cam.xy with zoom and roll
    vec2 rs = rect.zw - rect.xy;
    vec2 q = fit > 0.5 ? (sp - rect.xy) / rs * vec2(${W.toFixed(1)}, ${H.toFixed(1)}) : sp;
    vec2 d = (q - 0.5 * vec2(${W.toFixed(1)}, ${H.toFixed(1)})) / cam.z;
    float cr = cos(cam.w), sr = sin(cam.w);
    vec2 p = vec2(cr * d.x + sr * d.y, -sr * d.x + cr * d.y) + cam.xy;
    vec3 c;
    if (blur < 0.5) c = tap(p);
    else {
      // defocus: a 16-tap Vogel disk
      c = vec3(0.0);
      for (int i = 0; i < 16; i++) {
        float r = sqrt((float(i) + 0.5) / 16.0) * blur, a = float(i) * 2.39996;
        c += tap(p + vec2(cos(a), sin(a)) * r / cam.z);
      }
      c /= 16.0;
    }
    vec2 e = min(sp - rect.xy, rect.zw - sp);
    float a = alpha * clamp((min(e.x, e.y) + 0.5) / max(feather, 1.0), 0.0, 1.0);
    fragColor = vec4(grade(c) * a, a);
  }`;
const viewUniforms = () => ({
  tex: { value: null }, cam: { value: new THREE.Vector4(W / 2, H / 2, 1, 0) }, rect: { value: new THREE.Vector4(0, 0, W, H) },
  dim: { value: 1 }, duo: { value: 0 }, satur: { value: 1 }, alpha: { value: 1 }, blur: { value: 0 }, fit: { value: 1 }, feather: { value: 1 }, tint: { value: new THREE.Vector3(1, 1, 1) },
});

class Shared {
  rt = [makeRT(), makeRT(), makeRT(), makeRT()];
  ui = new Layer2D();
  ui2 = new Layer2D();
  lines = new LineBatch(80000, { blend: 'add' });
  view = new FSPass(VIEW, viewUniforms());
  viewOver = new FSPass(VIEW, viewUniforms(), { blending: THREE.CustomBlending, transparent: true });
  private sheetInst: Sheet | null = null;
  get sheet() { return (this.sheetInst ??= new Sheet()); }
  constructor() {
    const m = this.viewOver.mat;
    m.blendEquation = THREE.AddEquation; m.blendSrc = THREE.OneFactor; m.blendDst = THREE.OneMinusSrcAlphaFactor;
    m.blendSrcAlpha = THREE.OneFactor; m.blendDstAlpha = THREE.OneMinusSrcAlphaFactor;
  }
}
let shared: Shared | null = null;
export const S = () => (shared ??= new Shared());

export interface Cam {
  /** Source point at the centre of the view (px), zoom, roll (radians, clockwise). */
  x?: number; y?: number; zoom?: number; roll?: number;
  /** Grading: brightness, duotone (the outro plates' ink → signal → bone), saturation, tint. */
  dim?: number; duo?: number; sat?: number; tint?: [number, number, number];
  /** Defocus radius (source px). */
  blur?: number;
  /** Where the view sits on screen (default: the whole frame), and its opacity when drawn over. */
  rect?: [number, number, number, number]; alpha?: number;
  /** The rect only masks (the view is not squeezed into it): a window cut out of the full-frame view. */
  mask?: boolean;
  /** Soft edges of the rect (px). */
  feather?: number;
}
/**
 * Draw `tex` (a full frame) into `out` through a 2D camera. `over`: composite over what `out` holds (only
 * inside the rect, with the alpha); otherwise replace the whole target (black outside the rect).
 */
export function camPass(renderer: THREE.WebGLRenderer, tex: THREE.Texture, out: THREE.WebGLRenderTarget, c: Cam = {}, over = false) {
  const p = over ? S().viewOver : S().view, u = p.u;
  u.tex!.value = tex;
  (u.cam!.value as THREE.Vector4).set(c.x ?? W / 2, c.y ?? H / 2, c.zoom ?? 1, c.roll ?? 0);
  (u.rect!.value as THREE.Vector4).set(...(c.rect ?? [0, 0, W, H]));
  u.dim!.value = c.dim ?? 1; u.duo!.value = c.duo ?? 0; u.satur!.value = c.sat ?? 1; u.alpha!.value = c.alpha ?? 1; u.blur!.value = c.blur ?? 0; u.fit!.value = c.mask ? 0 : 1; u.feather!.value = c.feather ?? 1;
  (u.tint!.value as THREE.Vector3).set(...(c.tint ?? [1, 1, 1]));
  p.render(renderer, out);
}

/** Where a source point lands on screen through a camera (inverse of the view pass). */
export function camToScreen(c: Cam, x: number, y: number) {
  const z = c.zoom ?? 1, r = c.roll ?? 0, rc = c.rect && !c.mask ? c.rect : [0, 0, W, H];
  const dx = (x - (c.x ?? W / 2)) * z, dy = (y - (c.y ?? H / 2)) * z;
  const cr = Math.cos(r), sr = Math.sin(r);
  const qx = cr * dx - sr * dy + W / 2, qy = sr * dx + cr * dy + H / 2;
  return { x: rc[0] + (qx / W) * (rc[2] - rc[0]), y: rc[1] + (qy / H) * (rc[3] - rc[1]) };
}

/** "m:ss" of a song time. */
export const fmtTime = (s: number) => { const x = Math.max(0, Math.floor(s + 1e-6)); return `${Math.floor(x / 60)}:${String(x % 60).padStart(2, '0')}`; };
/** A P(doom) value the Brazilian way ("0,15"). */
export const fmtPT = (v: number, d = 2) => v.toFixed(d).replace('.', ',');

// ---------------------------------------------------------------- the ruler
export const RX0 = 150, RX1 = W - 150, RY = H - 62;
const SONG = CLIP_END;
export const rulerX = (s: number) => RX0 + (RX1 - RX0) * clamp(s / SONG);

export interface ReguaState {
  /** 0..1: the ruler drawn in from the left (1 = whole). */
  draw: number;
  /** Overall opacity. */
  alpha: number;
  /** The cursor: song seconds. */
  pos: number;
  /** 0 = paused (two bars), 1 = playing (a triangle). */
  play: number;
  /** The frame is bone paper: draw in ink. */
  paper: number;
  /** 0..1 the whole ruler burning as a fuse (04.3). */
  fuse: number;
  /** A song position flashed on the ruler (a tick and a glow), with its strength 0..1. */
  mark?: [number, number];
  /** A short tag over the cursor ("cap. 02 · Sydney"), with its opacity. */
  label?: [string, number];
}

/** Montage-level ruler data: the verse ticks, the choruses and their values, the cursor over the whole explainer. */
export class Regua {
  ticks: number[];
  hooks: { s: number; v: string; lit: number }[];
  cuts: number[];
  specs: BlockSpec[];
  verses: (Line[] | null)[];
  pos: number[];
  constructor(public ly: Lyrics, public n: Narration) {
    this.ticks = ly.lines.map((l) => l.start);
    this.cuts = blockCuts(n);
    this.specs = MONTAGE;
    this.verses = MONTAGE.map((b) => (b.verse ? verseLines(ly, b.verse) : null));
    let last = 0;
    this.pos = MONTAGE.map((b, i) => {
      const v = this.verses[i];
      if (v) last = v[0]!.start;
      else if (typeof b.pos === 'number') last = b.pos;
      else if (b.pos === 'end') last = SONG;
      return last;
    });
    const hookLines = ly.findWords('P(doom)').map((w) => ly.lines[w.line]!.start);
    const at = (id: string) => this.cuts[MONTAGE.findIndex((b) => b.id === id)]! + 0.35;
    this.hooks = [
      { s: 0, v: '0,02', lit: -1 },
      ...['0,15', '0,42', '0,81', '0,99'].map((v, i) => ({ s: hookLines[i]!, v, lit: at(`0${i + 2}.1`) })),
      { s: ly.get('Was it all for show').end, v: 'NaN', lit: at('06.1') + 7.5 },
    ];
  }
  /** Index of the block on screen at video time t. */
  blockAt(t: number) {
    let i = 0;
    while (i + 1 < this.cuts.length && this.cuts[i + 1]! <= t) i++;
    return i;
  }
  /**
   * The default cursor: on the block's verse; in the block's last words the spark runs to the next
   * block's verse, arriving in the silence between them.
   */
  cursor(t: number): number {
    const i = this.blockAt(t);
    const next = this.cuts[i + 1];
    if (next == null) return this.pos[i]!;
    const b = this.n.blocks[i]!;
    const w = b.words[b.words.length - 1]!;
    const a = Math.max(w.start, next - 0.9);
    return lerp(this.pos[i]!, this.pos[i + 1]!, ease.inOutCubic(prog(t, a, next)));
  }

  /**
   * Draw the ruler into the HUD layer (PostParams.hudDraw: the image's shake, zoom and fringes never reach
   * it). A hairline from 0:00 to 2:35 with a tick per verse, the choruses taller with their P(doom)
   * above; the played part in signal; the spark as the cursor; "▮▮ 0:23 / 2:35" under the left end.
   */
  draw(c: CanvasRenderingContext2D, t: number, st: ReguaState) {
    if (st.alpha <= 0.002 || st.draw <= 0) return;
    const ink = st.paper > 0.5;
    const col = (a: number) => (ink ? rgba('ink', Math.min(1, a * 1.1)) : rgba('bone', a));
    const xEnd = lerp(RX0, RX1, ease.inOutCubic(clamp(st.draw)));
    const xc = Math.min(rulerX(st.pos), xEnd);
    c.save();
    // a soft ink gradient under the player keeps it legible over any image (not on paper: ink on bone reads)
    if (!ink) {
      const g = c.createLinearGradient(0, H - 190, 0, H);
      g.addColorStop(0, rgba('ink', 0)); g.addColorStop(0.55, rgba('ink', 0.5 * st.alpha)); g.addColorStop(1, rgba('ink', 0.72 * st.alpha));
      c.fillStyle = g; c.fillRect(0, H - 190, W, 190);
    }
    c.globalAlpha = st.alpha;
    c.fillStyle = col(0.3);
    c.fillRect(RX0, RY, xEnd - RX0, 1);
    c.fillStyle = rgba('signal', 0.95);
    if (xc > RX0) c.fillRect(RX0, RY - 0.5, xc - RX0, 2);
    if (st.fuse > 0) {
      c.fillStyle = rgba('signal', clamp(st.fuse));
      c.fillRect(RX0, RY - 1, (xEnd - RX0) * clamp(st.fuse * 1.15), 3);
    }
    for (const s of this.ticks) {
      const x = Math.round(rulerX(s));
      if (x > xEnd) continue;
      c.fillStyle = s <= st.pos + 0.01 ? rgba('signal', 0.85) : col(0.4);
      c.fillRect(x, RY - 5, 1, 5);
    }
    c.font = font(F.mono(500), 14);
    c.textBaseline = 'alphabetic';
    c.textAlign = 'center';
    for (const h of this.hooks) {
      const x = Math.round(rulerX(h.s));
      if (x > xEnd + 1) continue;
      const lit = h.lit < 0 ? 1 : prog(t, h.lit, h.lit + 0.3);
      c.fillStyle = lit > 0 ? mixRgba(col(0.5), rgba('signal', 1), lit) : col(0.5);
      c.fillRect(x, RY - 12, 1, 12);
      const tw = c.measureText(h.v).width;
      c.fillText(h.v, Math.max(RX0 + tw / 2, x), RY - 22);
    }
    if (st.mark && st.mark[1] > 0) {
      const x = Math.round(Math.min(rulerX(st.mark[0]), xEnd));
      c.save();
      c.globalAlpha = st.alpha * st.mark[1];
      c.fillStyle = rgba('signal');
      c.fillRect(x - 1, RY - 16, 3, 22);
      hudSpark(c, x, RY + 0.5, t, 0.8);
      c.restore();
    }
    if (st.label && st.label[1] > 0) {
      c.save();
      c.globalAlpha = st.alpha * st.label[1];
      c.font = font(F.mono(500), 15); c.letterSpacing = '1px'; c.textAlign = 'left';
      const tw = c.measureText(st.label[0]).width;
      const lx = clamp(xc - tw / 2, RX0, RX1 - tw);
      c.fillStyle = rgba('signal');
      c.fillText(st.label[0], lx, RY - 44);
      c.fillRect(Math.round(xc), RY - 38, 1, 30);
      c.restore();
    }
    // under the left end: pause (or play) and the song position
    const ua = clamp(st.draw * 3 - 1.2);
    if (ua > 0) {
      const y = RY + 25, k = ease.inOutCubic(clamp(st.play));
      c.fillStyle = col(0.85);
      if (k < 1) { c.globalAlpha = st.alpha * ua * (1 - k); c.fillRect(RX0, y - 12, 3.5, 12); c.fillRect(RX0 + 7, y - 12, 3.5, 12); }
      if (k > 0) { c.globalAlpha = st.alpha * ua * k; c.beginPath(); c.moveTo(RX0, y - 13); c.lineTo(RX0 + 11, y - 6.5); c.lineTo(RX0, y); c.closePath(); c.fill(); }
      c.globalAlpha = st.alpha * ua;
      c.textAlign = 'left';
      c.fillStyle = col(0.72);
      c.fillText(`${fmtTime(st.pos)} / ${fmtTime(SONG)}`, RX0 + 22, y);
    }
    // the cursor: the spark
    const sa = clamp(st.draw * 5);
    if (sa > 0) {
      c.globalAlpha = st.alpha * sa;
      hudSpark(c, xc, RY + 0.5, t, 1);
    }
    c.restore();
  }

  /** The block's verse, docked above the ruler: in fast (≤0.4 s) at the block's start, key word in signal. */
  drawVerse(c: CanvasRenderingContext2D, i: number, t: number, alpha: number, paper: number) {
    const lines = this.verses[i];
    const spec = this.specs[i]!.verse;
    if (!lines || !spec || alpha <= 0.002) return;
    const t0 = this.cuts[i]!;
    const words = lines.flatMap((l, li) => l.words.map((w, wi) => ({ w: w.w, br: li > 0 && wi === 0 })));
    const keyWords = spec.key.split(/\s+/);
    let k0 = -1;
    for (let j = 0; j + keyWords.length <= words.length && k0 < 0; j++)
      if (keyWords.every((kw, q) => words[j + q]!.w.toLowerCase() === kw.toLowerCase())) k0 = j;
    const fam = F.archivo(100, 500), size = 30;
    const sp = layout(' ', fam, size).width;
    c.save();
    c.font = font(fam, size);
    c.textBaseline = 'alphabetic';
    let x = RX0;
    const y = RY - 46;
    words.forEach((wd, j) => {
      const a = ease.outCubic(prog(t, t0 + j * 0.028, t0 + j * 0.028 + 0.22));
      if (wd.br) {
        c.globalAlpha = alpha * a;
        c.fillStyle = paper > 0.5 ? rgba('ink', 0.35) : rgba('bone', 0.35);
        c.fillText('/', x, y + (1 - a) * 12);
        x += layout('/', fam, size).width + sp;
      }
      const isKey = k0 >= 0 && j >= k0 && j < k0 + keyWords.length;
      c.globalAlpha = alpha * a;
      c.fillStyle = isKey ? rgba('signal') : paper > 0.5 ? rgba('ink', 0.88) : rgba('bone', 0.9);
      c.fillText(wd.w, x, y + (1 - a) * 12);
      x += layout(wd.w, fam, size).width + sp;
    });
    c.restore();
  }
}

/**
 * The spark drawn in a 2D layer (the HUD has no bloom): a white-hot core, a steep orange falloff and four
 * short flickering rays, like sparkHead's.
 */
export function hudSpark(c: CanvasRenderingContext2D, x: number, y: number, t: number, scale = 1) {
  const flick = 0.85 + 0.15 * Math.sin(t * 91.7) * Math.sin(t * 57.3);
  const R = 17 * scale;
  c.save();
  c.globalCompositeOperation = 'lighter';
  const g = c.createRadialGradient(x, y, 0, x, y, R);
  g.addColorStop(0, `rgba(255,190,120,${0.95 * flick})`);
  g.addColorStop(0.14, `rgba(255,120,50,${0.75 * flick})`);
  g.addColorStop(0.35, rgba('signal', 0.28 * flick));
  g.addColorStop(0.7, rgba('signal', 0.07 * flick));
  g.addColorStop(1, rgba('signal', 0));
  c.fillStyle = g;
  c.beginPath(); c.arc(x, y, R, 0, Math.PI * 2); c.fill();
  c.strokeStyle = `rgba(255,200,140,${0.8 * flick})`;
  c.lineWidth = 1.1 * scale; c.lineCap = 'round';
  for (let i = 0; i < 4; i++) {
    const a = i * (Math.PI / 2) + t * 3 + 0.4, r = (7 + 3 * Math.sin(t * 37 + i * 2.1)) * scale;
    c.beginPath(); c.moveTo(x + Math.cos(a) * 2 * scale, y + Math.sin(a) * 2 * scale); c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); c.stroke();
  }
  c.globalCompositeOperation = 'source-over';
  c.fillStyle = 'rgba(255,250,242,1)';
  c.beginPath(); c.arc(x, y, 2.4 * scale, 0, Math.PI * 2); c.fill();
  c.restore();
}

/** Mix two rgba() strings. */
export function mixRgba(a: string, b: string, k: number) {
  const pa = a.match(/[\d.]+/g)!.map(Number), pb = b.match(/[\d.]+/g)!.map(Number);
  const v = [0, 1, 2, 3].map((i) => (pa[i] ?? 1) + ((pb[i] ?? 1) - (pa[i] ?? 1)) * k);
  return `rgba(${Math.round(v[0]!)},${Math.round(v[1]!)},${Math.round(v[2]!)},${v[3]})`;
}

/** Linear colour scaled (for LineBatch). */
export const lin = (k: keyof typeof LIN, s = 1): [number, number, number] => [LIN[k][0] * s, LIN[k][1] * s, LIN[k][2] * s];
