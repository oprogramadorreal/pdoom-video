// Drawing helpers for the explainer's annotations: type outlines traced by the spark (the narrator's pen),
// callouts (hairline leaders to a mono label), strikes and underlines drawn in, typewriter text.
import type { LineBatch } from '../engine/lines';
import { LIN, rgba } from '../engine/palette';
import { F, font, textPathCommands } from '../engine/type';
import { clamp, ease, prog } from '../engine/util';
import { sparkHead } from '../scenes/_motifs';

export type P2 = { x: number; y: number };
export type RGB = [number, number, number];
export const hot = (k = 2.4): RGB => [LIN.signal[0] * k, LIN.signal[1] * k, LIN.signal[2] * k];

/** Opentype path commands → polylines, one per contour. */
export function flatten(cmds: any[], steps = 10): P2[][] {
  const out: P2[][] = [];
  let cur: P2[] = [], x0 = 0, y0 = 0, sx = 0, sy = 0;
  for (const c of cmds) {
    if (c.type === 'M') { if (cur.length > 1) out.push(cur); cur = [{ x: c.x, y: c.y }]; x0 = sx = c.x; y0 = sy = c.y; }
    else if (c.type === 'L') { cur.push({ x: c.x, y: c.y }); x0 = c.x; y0 = c.y; }
    else if (c.type === 'Q') {
      for (let i = 1; i <= steps; i++) { const u = i / steps, v = 1 - u; cur.push({ x: v * v * x0 + 2 * v * u * c.x1 + u * u * c.x, y: v * v * y0 + 2 * v * u * c.y1 + u * u * c.y }); }
      x0 = c.x; y0 = c.y;
    } else if (c.type === 'C') {
      for (let i = 1; i <= steps; i++) {
        const u = i / steps, v = 1 - u;
        cur.push({ x: v * v * v * x0 + 3 * v * v * u * c.x1 + 3 * v * u * u * c.x2 + u * u * u * c.x, y: v * v * v * y0 + 3 * v * v * u * c.y1 + 3 * v * u * u * c.y2 + u * u * u * c.y });
      }
      x0 = c.x; y0 = c.y;
    } else if (c.type === 'Z') { cur.push({ x: sx, y: sy }); if (cur.length > 1) out.push(cur); cur = []; }
  }
  if (cur.length > 1) out.push(cur);
  return out;
}

/** The outline of a string (kerned), as contours in px, baseline-left at (x, y). */
export const outline = (text: string, family: string, size: number, x: number, y: number) => flatten(textPathCommands(text, family, size, x, y));

/** Draw the first `r` (0..1, by length) of a polyline; returns the head. */
export function drawPartial(lb: LineBatch, pts: P2[], r: number, width: number, rgb: RGB, alpha: number, tf: (p: P2) => P2 = (p) => p): P2 | null {
  let total = 0;
  for (let i = 1; i < pts.length; i++) total += Math.hypot(pts[i]!.x - pts[i - 1]!.x, pts[i]!.y - pts[i - 1]!.y);
  let left = r * total;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]!, b = pts[i]!, len = Math.hypot(b.x - a.x, b.y - a.y);
    const f = len > 0 ? Math.min(1, left / len) : 1;
    const e = { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
    const A = tf(a), E = tf(e);
    lb.seg2(A.x, A.y, E.x, E.y, width, rgb, alpha);
    left -= len;
    if (left <= 0) return e;
  }
  return pts[pts.length - 1] ?? null;
}

/**
 * Trace contours with the spark, staggered: each contour runs from k0 + i·stagger over `dur` (in the same
 * units as k). Returns true while any is still being drawn.
 */
export function traceContours(lb: LineBatch, contours: P2[][], k: number, t: number, o: { k0: number; dur: number; stagger: number; width?: number; alpha?: number; heads?: boolean; tf?: (p: P2) => P2 }) {
  let busy = false;
  contours.forEach((ct, i) => {
    const r = ease.inOutCubic(prog(k, o.k0 + i * o.stagger, o.k0 + i * o.stagger + o.dur));
    if (r <= 0 || (o.alpha ?? 1) <= 0) return;
    const head = drawPartial(lb, ct, r, o.width ?? 2.2, hot(), o.alpha ?? 1, o.tf);
    if (r < 1 && head && o.heads !== false) { const q = (o.tf ?? ((p: P2) => p))(head); sparkHead(lb, q.x, q.y, t, 0.5, 1); busy = true; }
  });
  return busy;
}

/** Text typed in (a monospace voice): the first `k` (0..1) of it, with a caret while typing. */
export function typed(c: CanvasRenderingContext2D, text: string, x: number, y: number, k: number, o: { caret?: boolean; color?: string } = {}) {
  const chars = Array.from(text);
  const n = Math.floor(clamp(k) * chars.length + 1e-6);
  c.fillText(chars.slice(0, n).join(''), x, y);
  if (o.caret && n < chars.length && k > 0) {
    const w = c.measureText(chars.slice(0, n).join('')).width;
    const size = parseFloat(c.font) || 20;
    c.fillStyle = o.color ?? rgba('signal');
    c.fillRect(x + w + 1, y - size * 0.78, size * 0.55, size * 0.95);
  }
}

/** A hairline drawn in from a to b (k 0..1). */
export function lineIn(c: CanvasRenderingContext2D, ax: number, ay: number, bx: number, by: number, k: number) {
  if (k <= 0) return;
  c.beginPath(); c.moveTo(ax, ay); c.lineTo(ax + (bx - ax) * clamp(k), ay + (by - ay) * clamp(k)); c.stroke();
}

/**
 * A callout: a dot on the anchor, a leader (anchor → elbow → label) drawn in, then the label typed.
 * `k` runs 0..1 over the whole gesture. Label: Plex Mono; `title` (optional) in Archivo above it.
 */
export function callout(c: CanvasRenderingContext2D, ax: number, ay: number, lx: number, ly: number, label: string, k: number, o: { color?: string; size?: number; title?: string; titleSize?: number; align?: 'left' | 'right'; alpha?: number } = {}) {
  if (k <= 0) return;
  const col = o.color ?? rgba('bone', 0.9);
  const right = (o.align ?? (lx >= ax ? 'left' : 'right')) === 'left';
  c.save();
  c.globalAlpha *= o.alpha ?? 1;
  c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 1.2;
  const kl = ease.outCubic(prog(k, 0, 0.45)), kt = prog(k, 0.35, 1);
  c.beginPath(); c.arc(ax, ay, 3, 0, Math.PI * 2); c.fill();
  const ex = lx, ey = ly;
  const L1 = Math.hypot(ex - ax, ey - ay), L2 = 26;
  const d = kl * (L1 + L2);
  lineIn(c, ax, ay, ex, ey, Math.min(1, d / Math.max(1, L1)));
  if (d > L1) lineIn(c, ex, ey, ex + (right ? L2 : -L2), ey, (d - L1) / L2);
  const size = o.size ?? 20;
  const tx = ex + (right ? L2 + 10 : -L2 - 10);
  c.textAlign = 'left';
  c.textBaseline = 'middle';
  if (o.title) {
    c.font = font(F.archivo(100, 700), o.titleSize ?? 34);
    const tw = c.measureText(o.title).width;
    c.save();
    c.globalAlpha *= ease.outCubic(prog(kt, 0, 0.5));
    c.fillText(o.title, right ? tx : tx - tw, ey - (o.titleSize ?? 34) * 0.62);
    c.restore();
  }
  c.font = font(F.mono(400), size);
  typed(c, label, right ? tx : tx - c.measureText(label).width, o.title ? ey + size * 0.55 : ey, kt);
  c.restore();
}

/** A strike-through (or underline, with dy) drawn in by the pen, in signal. */
export function strike(c: CanvasRenderingContext2D, x: number, y: number, w: number, k: number, o: { width?: number; color?: string } = {}) {
  if (k <= 0) return;
  c.save();
  c.fillStyle = o.color ?? rgba('signal');
  c.fillRect(x, y - (o.width ?? 3) / 2, w * ease.outCubic(clamp(k)), o.width ?? 3);
  c.restore();
}
