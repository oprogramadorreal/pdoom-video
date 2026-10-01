// 00.2's film strip: "Nenhum quadro foi desenhado à mão, filmado ou gerado por uma I-Á de vídeo. Nem programa
// de edição teve, nada de After Effects." Four frames of film ("quadros"), one per way of making a picture: the
// spark draws each one's icon as the voice names it (a pencil, a clapperboard that snaps shut, a video with the
// AI sparkles, an editing timeline), and crosses the frame out, grease-pencil style, as the voice denies it.
import type * as THREE from 'three';
import type { PostOverrides, SceneCtx } from '../engine/scene';
import { W } from '../engine/gl';
import { LIN, rgba } from '../engine/palette';
import { F, font, measure } from '../engine/type';
import { clamp, ease, hash, lerp, prog, pulse, TAU } from '../engine/util';
import { sparkHead } from '../scenes/_motifs';
import type { LineBatch } from '../engine/lines';
import { drawPartial, strike, typed, type P2, type RGB } from './draw';
import { S, mixRgba } from './kit';
import { caption } from './c02';

// the strip: film base, sprocket rows, four 16:9 frames
const SY0 = 350, SY1 = 700, FY0 = 412, FY1 = 638, FW = 400, GAP = 36;
const X0 = (W - (4 * FW + 3 * GAP)) / 2;
const FCY = (FY0 + FY1) / 2;
const fcx = (i: number) => X0 + i * (FW + GAP) + FW / 2;
const LABELS = ['desenhado à mão', 'filmado', 'gerado por IA de vídeo', 'programa de edição'];

const rect = (x0: number, y0: number, x1: number, y1: number): P2[] => [{ x: x0, y: y0 }, { x: x1, y: y0 }, { x: x1, y: y1 }, { x: x0, y: y1 }, { x: x0, y: y0 }];
const seg = (x0: number, y0: number, x1: number, y1: number): P2[] => [{ x: x0, y: y0 }, { x: x1, y: y1 }];
const plen = (p: P2[]) => { let s = 0; for (let i = 1; i < p.length; i++) s += Math.hypot(p[i]!.x - p[i - 1]!.x, p[i]!.y - p[i - 1]!.y); return s; };

// ---------------------------------------------------------------- the icons (frame-local px, y down)
/** A pencil at an angle, and the wavy line it has just drawn (ending at its tip). */
function pencil(): P2[][] {
  const d = { x: Math.cos(-0.7), y: Math.sin(-0.7) }, n = { x: -d.y, y: d.x };
  const T = { x: -70, y: 62 }, hw = 17;
  const at = (s: number, o: number) => ({ x: T.x + d.x * s + n.x * o, y: T.y + d.y * s + n.y * o });
  const wave: P2[] = [];
  for (let i = 0; i <= 40; i++) { const u = i / 40; wave.push({ x: lerp(-178, T.x, u), y: lerp(92, T.y, u) + 11 * Math.sin(u * TAU * 2) * (1 - 0.4 * u) }); }
  return [
    [at(0, 0), at(40, hw), at(212, hw), at(212, -hw), at(40, -hw), at(0, 0)],
    [at(40, hw), at(40, -hw)], [at(186, hw), at(186, -hw)], [at(13, 5.6), at(13, -5.6)],
    wave,
  ];
}
/** A clapperboard; its arm lifted by `a` radians (0 = shut). */
function clapper(a: number): P2[][] {
  const hx = -120, hy = -28;
  const rot = (p: P2): P2 => { const c = Math.cos(a), s = Math.sin(a), x = p.x - hx, y = p.y - hy; return { x: hx + c * x - s * y, y: hy + s * x + c * y }; };
  const out: P2[][] = [rect(-120, -28, 120, 92), seg(-120, 0, 120, 0), seg(-100, 34, 20, 34), seg(-100, 64, 60, 64)];
  for (let k = 0; k < 6; k++) { const x = -112 + k * 40; out.push(seg(x, 0, x + 22, -28)); }
  out.push(rect(-120, -56, 120, -28).map(rot));
  for (let k = 0; k < 6; k++) { const x = -112 + k * 40; out.push([rot({ x: x + 22, y: -28 }), rot({ x, y: -56 })]); }
  return out;
}
/** A video (rounded frame, play button) and the three sparkles every AI tool wears. */
function aiVideo(t: number, twinkle: number): P2[][] {
  const r = 16, box: P2[] = [];
  const corners: [number, number, number][] = [[128 - r, -74 + r, -Math.PI / 2], [128 - r, 74 - r, 0], [-128 + r, 74 - r, Math.PI / 2], [-128 + r, -74 + r, Math.PI]];
  for (const [cx, cy, a0] of corners) for (let k = 0; k <= 6; k++) { const a = a0 + (k / 6) * (Math.PI / 2); box.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r }); }
  box.push(box[0]!);
  const star = (cx: number, cy: number, R: number, i: number): P2[] => {
    const s = R * (1 + 0.22 * twinkle * Math.sin(t * 9 + i * 2.1));
    return Array.from({ length: 9 }, (_, k) => { const a = -Math.PI / 2 + (k * Math.PI) / 4, rr = k % 2 ? s * 0.28 : s; return { x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr }; });
  };
  return [box, [{ x: -22, y: -34 }, { x: 36, y: 0 }, { x: -22, y: 34 }, { x: -22, y: -34 }], star(150, -80, 30, 0), star(98, -96, 13, 1), star(178, -30, 11, 2)];
}
/** An editing timeline: three tracks of clips and the playhead at `ph` (0..1). */
function timeline(ph: number): P2[][] {
  const out: P2[][] = [rect(-160, -78, 160, 78), seg(-160, -26, 160, -26), seg(-160, 26, 160, 26)];
  const lanes: [number, number, [number, number][]][] = [[-72, -32, [[-152, -70], [-62, 30], [38, 152]]], [-20, 20, [[-152, -10], [-2, 110]]], [32, 72, [[-120, 0], [10, 80]]]];
  for (const [y0, y1, bs] of lanes) for (const [x0, x1] of bs) out.push(rect(x0, y0, x1, y1));
  const x = lerp(-150, 150, ph);
  out.push(seg(x, -94, x, 78), [{ x: x - 9, y: -106 }, { x: x + 9, y: -106 }, { x, y: -94 }, { x: x - 9, y: -106 }]);
  return out;
}

/** Draw the first k (0..1) of a set of polylines with one pen (in order, into `ol`), the spark at its tip (into `lb`). */
function pen(ol: LineBatch, lb: LineBatch, cs: P2[][], k: number, t: number, rgb: RGB, w: number, a: number, tf: (p: P2) => P2) {
  if (k <= 0) return;
  const lens = cs.map(plen), total = lens.reduce((s, x) => s + x, 0);
  let left = clamp(k) * total, head: P2 | null = null;
  for (let i = 0; i < cs.length && left > 0; i++) {
    head = drawPartial(ol, cs[i]!, Math.min(1, left / lens[i]!), w, rgb, a, tf);
    left -= lens[i]!;
  }
  if (k < 1 && head) { const h = tf(head); sparkHead(lb, h.x, h.y, t, 0.6, 1); }
}
/** A grease-pencil stroke from a to b: a slight bow and a wobble. */
function greaseStroke(a: P2, b: P2, bow: number, seed: number): P2[] {
  const nx = -(b.y - a.y), ny = b.x - a.x, nl = Math.hypot(nx, ny);
  return Array.from({ length: 15 }, (_, i) => {
    const u = i / 14, o = bow * Math.sin(Math.PI * u) + 2.5 * (hash(i, seed) - 0.5);
    return { x: lerp(a.x, b.x, u) + (nx / nl) * o, y: lerp(a.y, b.y, u) + (ny / nl) * o };
  });
}

export interface StripTimes {
  /** "Nenhum": the strip slides in; each icon's word; the clapper's snap; each frame crossed out. */
  tIn: number; tIcon: number[]; tSnap: number; tCross: number[];
  /** "After" / "Effects"; when the strip leaves (the flight into the code starts). */
  tAE: number; tAEx: number; tOut: number;
}

export class FilmStrip {
  private crosses = [0, 1, 2, 3].map((i) => [
    greaseStroke({ x: -166, y: -88 }, { x: 166, y: 86 }, 10 + 8 * hash(i, 41), 50 + i),
    greaseStroke({ x: 164, y: -90 }, { x: -168, y: 88 }, -8 - 8 * hash(i, 42), 60 + i),
  ]);
  constructor(private T: StripTimes) {}

  /** The strip's horizontal offset: in from the right, out to the left. */
  private ox(t: number) {
    const T = this.T;
    return W * 1.1 * (1 - ease.outCubic(prog(t, T.tIn - 0.05, T.tIn + 0.55))) - (W + 300) * ease.inCubic(prog(t, T.tOut - 0.38, T.tOut));
  }
  private crossed(t: number, i: number) { return prog(t, this.T.tCross[i]! + 0.12, this.T.tCross[i]! + 0.4); }

  /** Draw the strip over `out`; returns the post nudges (a small punch on each cross). */
  render(ctx: SceneCtx, t: number, out: THREE.WebGLRenderTarget): PostOverrides {
    const { renderer, comp } = ctx;
    const T = this.T;
    const ox = this.ox(t), dy = 3 * Math.sin(t * 1.1);
    if (ox > W + 50 || ox < -W - 250) return {};
    const L = S().ui2; L.clear(); const c = L.ctx;
    c.save();
    c.translate(ox, dy);
    // the film base, its sprocket holes punched through, and the four frames
    const bx0 = X0 - 90, bx1 = X0 + 4 * FW + 3 * GAP + 90;
    // (a soft dark backing above and below, for the caption and the labels over the code)
    for (const [y0, y1] of [[SY0, SY0 - 120], [SY1, SY1 + 170]] as const) {
      const g = c.createLinearGradient(0, y0, 0, y1);
      g.addColorStop(0, rgba('ink', 0.85)); g.addColorStop(1, rgba('ink', 0));
      c.fillStyle = g; c.fillRect(bx0, Math.min(y0, y1), bx1 - bx0, Math.abs(y1 - y0));
    }
    c.fillStyle = 'rgba(29,29,32,0.97)'; c.fillRect(bx0, SY0, bx1 - bx0, SY1 - SY0);
    c.fillStyle = rgba('bone', 0.18); c.fillRect(bx0, SY0, bx1 - bx0, 1); c.fillRect(bx0, SY1 - 1, bx1 - bx0, 1);
    const holes = new Path2D();
    for (let x = bx0 + 22; x < bx1 - 30; x += 50) for (const y of [SY0 + 16, SY1 - 44]) holes.roundRect(x, y, 22, 28, 4);
    c.globalCompositeOperation = 'destination-out'; c.fill(holes);
    c.globalCompositeOperation = 'source-over';
    c.strokeStyle = rgba('bone', 0.14); c.lineWidth = 1; c.stroke(holes);
    c.font = font(F.mono(500), 11); c.textBaseline = 'alphabetic'; c.letterSpacing = '2px';
    for (let i = 0; i < 4; i++) {
      const x = fcx(i) - FW / 2;
      c.fillStyle = rgba('ink', 1); c.fillRect(x, FY0, FW, FY1 - FY0);
      c.strokeStyle = rgba('bone', 0.3); c.lineWidth = 1.2; c.strokeRect(x + 0.5, FY0 + 0.5, FW - 1, FY1 - FY0 - 1);
      c.fillStyle = rgba('ash', 0.55); c.fillText(`▸ ${String(i + 1).padStart(2, '0')}`, x, FY0 - 7);
    }
    c.letterSpacing = '0px';
    caption(c, 'Nenhum quadro foi…', prog(t, T.tIn, T.tIn + 0.7), X0, SY0 - 46);
    // the labels, as each way is named; greyed once crossed out
    c.textBaseline = 'alphabetic';
    LABELS.forEach((lab, i) => {
      const k = ease.outCubic(prog(t, T.tIcon[i]!, T.tIcon[i]! + 0.3));
      if (k <= 0) return;
      const fam = F.archivo(100, 600);
      const size = Math.min(32, 32 * (FW - 20) / measure(lab, fam, 32));
      c.font = font(fam, size);
      c.globalAlpha = k;
      c.fillStyle = this.crossed(t, i) > 0 ? mixRgba(rgba('bone', 0.95), rgba('ash', 0.8), this.crossed(t, i)) : rgba('bone', 0.95);
      c.fillText(lab, fcx(i) - measure(lab, fam, size) / 2, SY1 + 62 + (1 - k) * 14);
      c.globalAlpha = 1;
    });
    // "nada de After Effects": typed under the last label, struck through
    if (t >= T.tAE - 0.05) {
      const fam = F.mono(400), size = 26, txt = 'After Effects', w = measure(txt, fam, size);
      const x = fcx(3) - w / 2, y = SY1 + 110;
      c.font = font(fam, size); c.fillStyle = rgba('ash', 0.95);
      typed(c, txt, x, y, prog(t, T.tAE - 0.05, T.tAE + 0.25));
      strike(c, x - 6, y - 9, w + 12, prog(t, T.tAEx, T.tAEx + 0.18), { width: 4 });
    }
    c.restore();
    comp.draw(renderer, L.upload(), out);

    // the icons (the spark's lines) and the crosses
    const lb = S().lines; lb.clear();
    const ol = S().solid; ol.clear();
    const bone: RGB = [LIN.bone[0] * 0.95, LIN.bone[1] * 0.95, LIN.bone[2] * 0.95];
    const snap = t < T.tSnap ? -0.42 : -0.42 * Math.exp(-(t - T.tSnap) * 40) * Math.cos((t - T.tSnap) * 30);
    const icons = [
      pencil(), clapper(t < T.tSnap ? -0.42 : Math.min(0, snap)),
      aiVideo(t, prog(t, T.tIcon[2]! + 0.4, T.tIcon[2]! + 0.6)),
      timeline(0.1 + 0.8 * ease.inOutQuad(clamp((t - T.tIcon[3]! - 0.4) / 1.6))),
    ];
    const dur = [0.42, 0.32, 0.42, 0.42];
    icons.forEach((cs, i) => {
      const tf = (p: P2): P2 => ({ x: fcx(i) + ox + p.x, y: FCY + dy + p.y });
      const k = ease.inOutCubic(prog(t, T.tIcon[i]!, T.tIcon[i]! + dur[i]!));
      pen(ol, lb, cs, k, t, bone, 2.6, 1 - 0.62 * this.crossed(t, i), tf);
      // the cross: two quick strokes, the spark as the grease pencil
      const kc = prog(t, T.tCross[i]!, T.tCross[i]! + 0.22);
      if (kc > 0) {
        const col: RGB = [LIN.signal[0] * 1.3, LIN.signal[1] * 1.3, LIN.signal[2] * 1.3];
        const [a, b] = this.crosses[i]!;
        const ka = ease.outQuad(prog(kc, 0, 0.45)), kb = ease.outQuad(prog(kc, 0.55, 1));
        const ha = drawPartial(ol, a!, ka, 8, col, 0.95, tf);
        const hb = kb > 0 ? drawPartial(ol, b!, kb, 8, col, 0.95, tf) : null;
        const h = kc < 0.5 ? ha : kc < 1 ? hb : null;
        if (h && (ka < 1 || (kb > 0 && kb < 1))) { const q = tf(h); sparkHead(lb, q.x, q.y, t, 0.7, 1); }
      }
    });
    ol.render(renderer, out);
    lb.render(renderer, out);
    const punch = T.tCross.reduce((s, x) => s + pulse(t, x + 0.1, 0.07), 0) + 0.6 * pulse(t, T.tSnap, 0.06);
    return { zoom: 1 + 0.008 * punch, shake: [2.5 * punch * Math.sin(t * 91), 2.5 * punch * Math.cos(t * 77)] };
  }
}
