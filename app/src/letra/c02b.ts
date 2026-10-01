// Chapter 02 · 0,15 · O que tem lá dentro (02.5–02.7).
import type * as THREE from 'three';
import type { Frame } from '../engine/scene';
import { W, H, clearRT } from '../engine/gl';
import { LIN, rgba } from '../engine/palette';
import { F, font, measure, textPoints } from '../engine/type';
import { clamp, ease, hash, lerp, mulberry32, prog, TAU } from '../engine/util';
import { sparkHead } from '../scenes/_motifs';
import { Block, type BlockFactory, type BlockOut } from './block';
import { S, camPass } from './kit';
import { xray } from './xray';
import { drawListing, lineCount, source } from './code';
import { INK } from './paper';
import { hot, typed, type P2 } from './draw';
import { clipPost, remap } from './c02';

// ---------------------------------------------------------------- 02.5: the monster is a formula
/** A 2D stand-in for the creature's signed distance function: blobs and a tentacle, smoothly merged. */
const BLOBS: [number, number, number][] = [[800, 560, 150], [915, 445, 92], [690, 660, 96], [930, 668, 78], [700, 455, 70]];
const smin = (a: number, b: number, k: number) => { const h = clamp(0.5 + (0.5 * (b - a)) / k); return lerp(b, a, h) - k * h * (1 - h); };
function sdf(x: number, y: number) {
  let d = 1e9;
  for (const [cx, cy, r] of BLOBS) d = smin(d, Math.hypot(x - cx, y - cy) - r, 46);
  // a tentacle: a capsule to the upper right, thinning
  const ax = 900, ay = 470, bx = 1130, by = 250;
  const hx = x - ax, hy = y - ay, vx = bx - ax, vy = by - ay;
  const u = clamp((hx * vx + hy * vy) / (vx * vx + vy * vy));
  d = smin(d, Math.hypot(hx - vx * u, hy - vy * u) - lerp(34, 10, u), 30);
  return d;
}
const EYE = { x: 170, y: 540 };
const PLANE = { x: 330, y0: 300, y1: 780 };

/**
 * 02.5 "E esse monstro não foi desenhado…" — the x-ray band crosses the creature and leaves it drawn by its
 * own code (as in 00.2). "É uma fórmula matemática que calcula a forma": the shader, drawn as a diagram
 * seen from the side — rays leave the camera, one per pixel, and step toward the creature (each step as
 * long as the distance the formula says is safe) until they touch it; "a luz": normals and the light;
 * "cada risco de hachura": the engraving's lines laid along the surface; "pixel por pixel": beside it,
 * the real frame computed in a raster, row by row. "Escrita pela I-Á": its code, and its length.
 */
class B025 extends Block {
  private tDiag = 0; private tForm = 0; private tLight = 0; private tHatch = 0; private tPix = 0; private tAI = 0;
  private rays: { y: number; steps: P2[]; hit: P2 | null; n: P2 | null }[] = [];
  private lines = lineCount([source('shoggoth.ts'), source('shoggoth-glsl.ts')]);
  override async init() {
    await this.clips.load('shoggoth');
    this.tDiag = this.at('É uma'); this.tForm = this.at('forma,'); this.tLight = this.at('luz');
    this.tHatch = this.at('risco'); this.tPix = this.at('pixel por'); this.tAI = this.at('Escrita');
    // sphere tracing, one ray per pixel of the image plane
    for (let py = PLANE.y0 + 12; py < PLANE.y1; py += 24) {
      const dx = PLANE.x - EYE.x, dy = py - EYE.y, l = Math.hypot(dx, dy);
      const d = { x: dx / l, y: dy / l };
      let p = { x: PLANE.x, y: py };
      const steps: P2[] = [{ ...p }];
      let hit: P2 | null = null;
      for (let i = 0; i < 40; i++) {
        const s = sdf(p.x, p.y);
        if (s < 1.5) { hit = p; break; }
        p = { x: p.x + d.x * s, y: p.y + d.y * s };
        steps.push({ ...p });
        if (p.x > 1300) break;
      }
      let n: P2 | null = null;
      if (hit) { const e = 1; const gx = sdf(hit.x + e, hit.y) - sdf(hit.x - e, hit.y), gy = sdf(hit.x, hit.y + e) - sdf(hit.x, hit.y - e); const gl = Math.hypot(gx, gy) || 1; n = { x: gx / gl, y: gy / gl }; }
      this.rays.push({ y: py, steps, hit, n });
    }
  }
  render(f: Frame, out: THREE.WebGLRenderTarget): BlockOut {
    const { renderer, comp } = this.ctx;
    const t = f.t;
    const R = S().rt;
    if (t < this.tDiag) {
      // the x-ray: the creature drawn by its own code
      this.clips.render('shoggoth', 34.9 + (t - this.e.start) * 0.1, R[0]!);
      const L = S().ui; L.clear();
      drawListing(L.ctx, source('shoggoth-glsl.ts'), { x: 48, y: 60, w: W - 60, h: H - 160, scroll: 60 + (t - this.e.start) * 4, size: 17, colors: { code: rgba('bone', 0.9), comment: rgba('ash', 0.75), glsl: rgba('ember', 1), num: rgba('ash', 0.45) } });
      const x0 = this.e.start + 0.35, x1 = this.e.start + 1.1;
      xray(renderer, R[0]!.texture, L.upload(), out, { x: lerp(-120, W + 120, ease.inOutQuad(prog(t, x0, x1))), w: 70, on: t >= x0 && t < x1 ? 1 : 0, all: t >= x1 ? 1 : 0, t, dim: 0.07 });
      return { post: { bloom: 0.55, ca: 0.6, frame: 0 } };
    }
    clearRT(renderer, out, LIN.ink);
    const L = S().ui; L.clear(); const c = L.ctx;
    const lt = t - this.tDiag;
    c.textBaseline = 'alphabetic';
    // the formula's surface, faint, and hatched once the light is there
    const surf = prog(t, this.tForm, this.tForm + 0.5);
    // the camera and the image plane
    const ka = ease.outCubic(prog(t, this.tDiag, this.tDiag + 0.4));
    c.strokeStyle = rgba('bone', 0.85 * ka); c.lineWidth = 1.4;
    c.beginPath(); c.moveTo(EYE.x - 40, EYE.y - 26); c.lineTo(EYE.x, EYE.y); c.lineTo(EYE.x - 40, EYE.y + 26); c.closePath(); c.stroke();
    c.beginPath(); c.moveTo(PLANE.x, PLANE.y0); c.lineTo(PLANE.x, PLANE.y1); c.stroke();
    for (let py = PLANE.y0; py <= PLANE.y1; py += 24) { c.beginPath(); c.moveTo(PLANE.x - 6, py); c.lineTo(PLANE.x + 6, py); c.stroke(); }
    c.font = font(F.mono(500), 16); c.fillStyle = rgba('ash', ka); c.letterSpacing = '2px';
    c.fillText('CÂMERA', EYE.x - 70, EYE.y + 60); c.fillText('PIXELS', PLANE.x - 34, PLANE.y1 + 34);
    c.letterSpacing = '0px';
    // rays marching: each advances one step every 0.06 s, one after another
    const lb = S().lines; lb.clear();
    let shown = 0;
    this.rays.forEach((r, i) => {
      const t0 = this.tDiag + 0.3 + i * 0.07;
      const k = Math.floor((t - t0) / 0.05);
      if (k < 0) return;
      shown++;
      const n = Math.min(r.steps.length, k + 1);
      c.strokeStyle = rgba('bone', 0.3); c.lineWidth = 1;
      c.beginPath(); c.moveTo(EYE.x, EYE.y); c.lineTo(r.steps[0]!.x, r.steps[0]!.y); c.stroke();
      for (let j = 1; j < n; j++) {
        const a = r.steps[j - 1]!, b = r.steps[j]!;
        c.strokeStyle = rgba('bone', 0.55); c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
        // the safe distance at each step, as a circle: only on the ray being traced now
        if (k < r.steps.length + 2 && (j >= n - 2)) { const rr = Math.hypot(b.x - a.x, b.y - a.y); c.strokeStyle = rgba('ash', 0.45); c.beginPath(); c.arc(a.x, a.y, rr, 0, TAU); c.stroke(); }
        c.fillStyle = rgba('bone', 0.8); c.fillRect(b.x - 2, b.y - 2, 4, 4);
      }
      if (r.hit && n >= r.steps.length) {
        const h = r.hit;
        lb.seg2(h.x, h.y, h.x + 0.01, h.y, 7, hot(2), 1);
        if (t >= this.tLight && r.n) {
          c.strokeStyle = rgba('signal', 0.9); c.lineWidth = 1.5;
          c.beginPath(); c.moveTo(h.x, h.y); c.lineTo(h.x + r.n.x * 46, h.y + r.n.y * 46); c.stroke();
        }
      }
    });
    // the light, and the shade it gives each hit (lambert): the hatching follows it
    if (t >= this.tLight) {
      const kl = ease.outCubic(prog(t, this.tLight, this.tLight + 0.4));
      const Lx = 520, Ly = 180;
      c.strokeStyle = rgba('ember', kl); c.lineWidth = 2;
      c.beginPath(); c.moveTo(Lx, Ly); c.lineTo(Lx + 120, Ly + 90); c.stroke();
      c.beginPath(); c.arc(Lx - 14, Ly - 10, 18, 0, TAU); c.stroke();
      c.font = font(F.mono(500), 16); c.fillStyle = rgba('ember', kl); c.fillText('LUZ', Lx - 70, Ly - 26);
    }
    if (surf > 0) {
      // the shape the formula describes (faint), then its engraving: short strokes, denser away from the light
      const kh = prog(t, this.tHatch, this.tHatch + 1.2);
      for (let y = 240; y < 860; y += 4) for (let x = 500; x < 1190; x += 4) {
        const d = sdf(x, y);
        if (d > 0) continue;
        c.fillStyle = rgba('bone', (d > -3 ? 0.5 : 0.012) * surf);
        c.fillRect(x, y, 4, 4);
        if (kh > 0 && (y - 240) / 620 < kh) {
          const e = 1, gx = sdf(x + e, y) - sdf(x - e, y), gy = sdf(x, y + e) - sdf(x, y - e);
          const gl = Math.hypot(gx, gy) || 1;
          const lit = clamp(0.5 - 0.5 * (gx * 0.6 + gy * 0.8) / gl + 0.3 * clamp(-d / 60));
          const band = Math.floor((x * 0.7 + y) / 7);
          if (band % Math.max(2, Math.round(2 + 4 * lit)) === 0) { c.fillStyle = rgba('bone', 0.5); c.fillRect(x, y, 4, 1.2); }
        }
      }
    }
    comp.draw(renderer, L.upload(), out);
    lb.render(renderer, out);
    // "pixel por pixel": the real frame, computed in a raster on the right
    if (t >= this.tPix) {
      this.clips.render('shoggoth', 35.0, R[0]!);
      const px0 = 1230, py0 = 250, pw = 600, ph = 560, cell = 40;
      const cols = Math.ceil(pw / cell), rows = Math.ceil(ph / cell);
      const n = Math.floor(prog(t, this.tPix, this.tAI) * cols * rows);
      const full = Math.floor(n / cols), part = n % cols;
      const view = { x: 1200, y: 520, zoom: 1.1 };
      const frame = (rect: [number, number, number, number]) => camPass(renderer, R[0]!.texture, out, { rect, mask: true, x: W / 2 - (px0 + pw / 2 - view.x), y: H / 2 - (py0 + ph / 2 - view.y) }, true);
      if (full > 0) frame([px0, py0, px0 + pw, py0 + Math.min(ph, full * cell)]);
      if (part > 0 && full < rows) frame([px0, py0 + full * cell, px0 + part * cell, py0 + (full + 1) * cell]);
      const L2 = S().ui2; L2.clear(); const c2 = L2.ctx;
      c2.strokeStyle = rgba('bone', 0.5); c2.lineWidth = 1; c2.strokeRect(px0 + 0.5, py0 + 0.5, pw, ph);
      if (full < rows) { c2.fillStyle = rgba('signal'); c2.fillRect(px0 + part * cell, py0 + full * cell, cell, cell); }
      comp.draw(renderer, L2.upload(), out);
    }
    // "Escrita pela I-Á": its code, and how long it is
    const kc = ease.outCubic(prog(t, this.tAI - 0.1, this.tAI + 0.4));
    if (kc > 0) {
      const L3 = S().ui2; L3.clear(); const c3 = L3.ctx;
      c3.fillStyle = rgba('ink', 0.9 * kc); c3.fillRect(1180, 200, 700, 680);
      c3.globalAlpha = kc;
      drawListing(c3, source('shoggoth-glsl.ts'), { x: 1200, y: 290, w: 680, h: 580, scroll: 120 + (t - this.tAI) * 8, size: 15 });
      c3.font = font(F.mono(500), 20); c3.fillStyle = rgba('signal');
      c3.fillText(`shoggoth.ts + shoggoth-glsl.ts · ${this.lines.toLocaleString('pt-BR')} linhas`, 1200, 250);
      comp.draw(renderer, L3.upload(), out);
    }
    void lt; void shown;
    return { post: { bloom: 0.5, ca: 0.5, frame: 0 } };
  }
}

// ---------------------------------------------------------------- 02.6: the singularity
/**
 * 02.6 "A singularidade…" — the black hole forming in the O of "começou", as the clip has it; "o que vem
 * depois": the camera falls in. "leva isso pro corpo": the vortex on the other side, the lyric's letters
 * coming apart into dots ("átomo por átomo"); "Inclusive a gente": the dots gather into VOCÊ; "Olha no que a
 * frase vira": the clip's own ending — the dots re-form as a paperclip. "De papel": held.
 */
class B026 extends Block {
  private tFall = 0; private tBody = 0; private tAtoms = 0; private tYou = 0; private tClip = 0;
  private you: P2[] = [];
  override async init() {
    await this.clips.load('spacetime');
    this.tFall = this.at('o que vem'); this.tBody = this.at('E a música'); this.tAtoms = this.at('átomo por');
    this.tYou = this.at('Inclusive'); this.tClip = this.n.nearestBeat(this.at('Olha'));
    const pts = textPoints('VOCÊ', F.archivo(125, 900), 330, 9, 7);
    const w = measure('VOCÊ', F.archivo(125, 900), 330);
    this.you = pts.map((p) => ({ x: p.x + W / 2 - w / 2, y: p.y + H / 2 + 110 }));
  }
  private s(t: number) {
    if (t >= this.tClip) return remap(t, [[this.tClip, 50.95], [this.at('um clipe') + 0.25, 51.8], [this.e.end, 51.92]]);
    return remap(t, [[this.e.start, 41.0], [this.tFall, 43.7], [this.tFall + 0.7, 44.25], [this.tBody, 44.6], [this.tAtoms, 49.3], [this.tYou, 50.0], [this.tClip, 50.3]]);
  }
  render(f: Frame, out: THREE.WebGLRenderTarget): BlockOut {
    const { renderer } = this.ctx;
    const t = f.t, s = this.s(t);
    const R = S().rt;
    const post = this.clips.render('spacetime', s, R[0]!);
    const you = ease.inOutCubic(prog(t, this.tYou - 0.15, this.tYou + 0.55)) * (1 - prog(t, this.tClip - 0.2, this.tClip));
    camPass(renderer, R[0]!.texture, out, { dim: 1 - 0.85 * you });
    if (you > 0) {
      // dots circling the vortex gather into VOCÊ
      const lb = S().lines; lb.clear();
      const rnd = mulberry32(5);
      this.you.forEach((p, i) => {
        const a0 = rnd() * TAU, r0 = 120 + rnd() * 700;
        const a = a0 + (t - this.tYou) * (1.4 - 0.8 * you) * (0.5 + r0 / 800);
        const q = { x: W / 2 + Math.cos(a) * r0 * 1.4, y: H / 2 + Math.sin(a) * r0 * 0.55 };
        const k = ease.inOutCubic(clamp(you * 1.15 - hash(i, 3) * 0.15));
        const x = lerp(q.x, p.x, k), y = lerp(q.y, p.y, k);
        const col: [number, number, number] = k > 0.95 ? [LIN.bone[0] * 1.1, LIN.bone[1] * 1.1, LIN.bone[2] * 1.1] : hot(1.4);
        lb.seg2(x, y, x + 0.01, y, 5.5, col, clamp(you * 2));
      });
      lb.render(renderer, out);
    }
    return { post: { ...clipPost(post), shake: [0, 0] } };
  }
}

// ---------------------------------------------------------------- 02.7: Sydney
/**
 * 02.7 "Sydney era o codinome do chatbot do Bing…" — the prompt types "Bing," and corrects it to "Sydney,"
 * (the clip's candidates). "se declarou para um jornalista do New York Times": behind bars that close one
 * a beat, a newspaper clipping is typed — the headline, Kevin Roose, 16 fev. 2023. "Daí o pedido: me solta":
 * the clip's own bars slam shut on the plea.
 */
class B027 extends Block {
  private tPaper = 0; private tRoose = 0; private tPlea = 0;
  override async init() {
    await this.clips.load('prompt2');
    this.tPaper = this.n.nearestBeat(this.at('Em dois'));
    this.tRoose = this.at('jornalista do');
    this.tPlea = this.n.nearestBeat(this.at('Daí'));
  }
  render(f: Frame, out: THREE.WebGLRenderTarget): BlockOut {
    const { renderer, comp } = this.ctx;
    const t = f.t;
    if (t < this.tPaper) return { post: clipPost(this.clips.render('prompt2', remap(t, [[this.e.start, 52.3], [this.tPaper, 54.9]]), out)) };
    if (t >= this.tPlea) return { post: clipPost(this.clips.render('prompt2', remap(t, [[this.tPlea, 57.1], [this.e.end, 57.98]]), out)) };
    clearRT(renderer, out, LIN.ink);
    const lt = t - this.tPaper;
    const kin = ease.outCubic(prog(t, this.tPaper, this.tPaper + 0.5));
    S().sheet.render(renderer, out, { x: 560, y: lerp(-400, 350, kin) + 5 * Math.sin(lt * 0.7), zoom: 1.02 + 0.01 * lt, roll: 0.012 }, [0, 0, 1120, 700], (c) => {
      c.textBaseline = 'alphabetic';
      c.fillStyle = INK.print(0.8); c.font = font(F.mono(500), 15); c.letterSpacing = '3px';
      c.fillText('THE NEW YORK TIMES · 16 FEV. 2023 · TECNOLOGIA', 60, 70);
      c.letterSpacing = '0px';
      c.fillStyle = INK.print(1); c.fillRect(60, 86, 1000, 2);
      const kh = prog(t, this.tPaper + 0.25, this.tPaper + 1.4);
      c.font = font(F.serif(600), 70); c.fillStyle = INK.print(1);
      typed(c, 'A Conversation With Bing’s', 60, 190, kh * 2);
      typed(c, 'Chatbot Left Me Deeply Unsettled', 60, 268, kh * 2 - 1);
      c.font = font(F.mono(500), 20); c.fillStyle = INK.print(0.85);
      c.fillText('Por Kevin Roose', 60, 330);
      if (t >= this.tRoose) { c.fillStyle = INK.orange(1); c.fillRect(60 + measure('Por ', F.mono(500), 20), 338, measure('Kevin Roose', F.mono(500), 20) * ease.outCubic(prog(t, this.tRoose, this.tRoose + 0.3)), 3); }
      c.fillStyle = INK.print(0.14);
      for (let col = 0; col < 3; col++) for (let i = 0; i < 12; i++) c.fillRect(60 + col * 340, 380 + i * 22, i === 11 ? 150 : 310, 6);
    });
    // bars in front, closing a notch per beat (the clip's Sydney cage)
    const beats = this.n.beatsIn(this.tPaper, t).length;
    const L = S().ui; L.clear(); const c = L.ctx;
    const gap = lerp(360, 150, clamp(beats / 14));
    const bw = 20;
    for (let x = W / 2 - Math.floor(W / 2 / gap) * gap - gap / 2; x < W + gap; x += gap) {
      const g = c.createLinearGradient(x - bw / 2, 0, x + bw / 2, 0);
      g.addColorStop(0, 'rgba(20,20,22,1)'); g.addColorStop(0.35, 'rgba(160,156,150,1)'); g.addColorStop(0.55, 'rgba(90,88,86,1)'); g.addColorStop(1, 'rgba(12,12,13,1)');
      c.fillStyle = g; c.fillRect(x - bw / 2, 0, bw, H);
    }
    comp.draw(renderer, L.upload(), out);
    return { post: { bloom: 0.3, ca: 0.5, frame: 0, shake: [0, 0] } };
  }
}

export const C02B: Record<string, BlockFactory> = {
  '02.5': (e) => new B025(e),
  '02.6': (e) => new B026(e),
  '02.7': (e) => new B027(e),
};
void sparkHead;
