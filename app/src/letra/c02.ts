// Chapter 02 · 0,15 · O que tem lá dentro (02.1–02.4).
import type * as THREE from 'three';
import type { Frame, PostOverrides } from '../engine/scene';
import { W, H, clearRT } from '../engine/gl';
import { LIN, rgba } from '../engine/palette';
import { F, font, measure } from '../engine/type';
import { clamp, ease, hash, lerp, prog, pulse, TAU } from '../engine/util';
import { drawMask2D, sparkHead, sparkParticles } from '../scenes/_motifs';
import { Block, type BlockFactory, type BlockOut } from './block';
import { S, camPass, camToScreen, Regua, type Cam } from './kit';
import { INK } from './paper';
import { callout, hot, lineIn, typed, type P2 } from './draw';

/** Clip posts, minus what the explainer owns (the crop marks, the HUD). */
export function clipPost(p: PostOverrides): PostOverrides {
  const { frame: _f, hud: _h, hudDraw: _d, ...rest } = p;
  return { ...rest, frame: 0 };
}
/** Piecewise-linear song time over video time: [[t, s], …]. */
export function remap(t: number, k: [number, number][]) {
  if (t <= k[0]![0]) return k[0]![1];
  for (let i = 1; i < k.length; i++) if (t < k[i]![0]) return lerp(k[i - 1]![1], k[i]![1], (t - k[i - 1]![0]) / (k[i]![0] - k[i - 1]![0]));
  return k[k.length - 1]![1];
}
/** A short caption in the corner: small caps in Plex Mono (the clip's labels). */
export function caption(c: CanvasRenderingContext2D, text: string, k: number, x = 120, y = 120) {
  if (k <= 0) return;
  c.save();
  c.globalAlpha *= clamp(k);
  c.font = font(F.mono(500), 17); c.letterSpacing = '4px'; c.fillStyle = rgba('bone', 0.9);
  c.textBaseline = 'alphabetic';
  typed(c, text.toUpperCase(), x, y, k * 1.6);
  c.fillStyle = rgba('signal'); c.fillRect(x, y + 12, 28, 2);
  c.restore();
}
export const CJK = '"Songti SC", "STSong", "Hiragino Sans GB", "PingFang SC", serif';

/**
 * 02.1 "Fum é o som de uma explosão…" — the chorus as the clip plays it (the number rolls to 0.15), then
 * FOOM exploding. "o apelido da explosão de inteligência": the branching explosion becomes a chart of
 * versions — each branch a new version (v1, v2, v3…), each one sooner than the last — while the spark
 * traces the exponential over it, too fast for the camera, which lets it go out of the top of the frame.
 */
class B021 extends Block {
  private tGraph = 0; private tName = 0; private tSelf = 0; private tFast = 0;
  private nodes: { x: number; y: number; t: number; gap: string }[] = [];
  override async init() {
    await Promise.all(['hook1', 'room'].map((id) => this.clips.load(id)));
    this.tGraph = this.n.nearestBeat(this.at('e o apelido'));
    this.tName = this.at('explosão de inteligência'); this.tSelf = this.at('melhora'); this.tFast = this.at('cada vez');
    // versions arrive sooner and sooner (Zeno): intervals halve; capability grows exponentially
    const gaps = ['', '8 meses', '4 meses', '2 meses', '1 mês', '2 semanas', '1 semana', '3 dias', '1 dia', '6 horas', '1 hora'];
    const tEnd = this.e.end - 0.35;
    for (let k = 0; k < gaps.length; k++) {
      const u = (1 - Math.pow(0.52, k)) / (1 - Math.pow(0.52, gaps.length - 1));
      this.nodes.push({ x: 240 + 1480 * (1 - Math.pow(0.5, k)) / (1 - Math.pow(0.5, gaps.length - 1)), y: 860 - 70 * (Math.pow(1.62, k) - 1), t: lerp(this.tGraph + 0.35, tEnd, u), gap: gaps[k]! });
    }
  }
  render(f: Frame, out: THREE.WebGLRenderTarget): BlockOut {
    const t = f.t;
    if (t < this.tGraph) {
      // the chorus, fast, to the new number; then FOOM
      // (the number is held a moment: it is the chapter's marker)
      const hookEnd = this.e.start + 0.85;
      if (t < hookEnd) {
        const post = this.clips.render('hook1', remap(t, [[this.e.start, 22.95], [this.e.start + 0.4, 23.565], [hookEnd, 23.59]]), out);
        return { post: clipPost(post) };
      }
      const s = remap(t, [[hookEnd, 24.3], [this.at('uma explosão') + 0.2, 25.42], [this.tGraph, 25.62]]);
      return { post: clipPost(this.clips.render('room', s, out)) };
    }
    return this.graph(t, out);
  }
  private graph(t: number, out: THREE.WebGLRenderTarget): BlockOut {
    const { renderer, comp } = this.ctx;
    clearRT(renderer, out, LIN.ink);
    const nodes = this.nodes;
    // the head: where the spark is on the curve
    let hi = 0;
    for (let i = 0; i < nodes.length; i++) if (t >= nodes[i]!.t) hi = i;
    const a = nodes[hi]!, b = nodes[Math.min(hi + 1, nodes.length - 1)]!;
    const u = hi + 1 < nodes.length ? ease.inOutCubic(clamp((t - a.t) / Math.max(0.01, b.t - a.t))) : 1;
    const head = { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) };
    // the camera tries to follow up, and cannot keep up
    const camY = Math.max(0, 420 - head.y) * 0.55;
    const lb = S().lines; lb.clear();
    const L = S().ui; L.clear(); const c = L.ctx;
    c.save(); c.translate(0, camY);
    // axes
    c.strokeStyle = rgba('bone', 0.5); c.lineWidth = 1.2;
    const ax = ease.outExpo(prog(t, this.tGraph, this.tGraph + 0.5));
    lineIn(c, 180, 900, 180 + 1560 * ax, 900, 1); lineIn(c, 180, 900, 180, 900 - 1500 * ax, 1);
    c.font = font(F.mono(500), 16); c.letterSpacing = '3px'; c.fillStyle = rgba('ash', 0.9 * ax);
    c.fillText('TEMPO →', 1600, 940); c.fillText('↑ CAPACIDADE', 196, 140 - camY);
    c.letterSpacing = '0px';
    // versions: a dot, a label, twigs branching off (the explosion's branches), the gap to the previous one
    nodes.forEach((n, i) => {
      const k = prog(t, n.t, n.t + 0.15);
      if (k <= 0) return;
      c.fillStyle = rgba('bone', k); c.beginPath(); c.arc(n.x, n.y, 8, 0, TAU); c.fill();
      c.font = font(F.mono(500), 30); c.fillStyle = rgba(i === hi ? 'signal' : 'bone', 0.95 * k);
      c.fillText(`v${i + 1}`, n.x + 16, n.y + 36);
      if (i > 0 && i < 8) {
        const p = nodes[i - 1]!;
        c.font = font(F.mono(400), 20); c.fillStyle = rgba('ash', 0.9 * k);
        if (i < 6) c.fillText(n.gap, (p.x + n.x) / 2 - measure(n.gap, F.mono(400), 20) / 2, 940);
        c.fillStyle = rgba('ash', 0.35 * k); c.fillRect(p.x, 910, 1, 8); c.fillRect(n.x, 910, 1, 8);
      }
      c.strokeStyle = rgba('bone', 0.55 * k); c.lineWidth = 1.4;
      for (let j = 0; j < 4; j++) {
        const an = -Math.PI / 2 + (hash(i, j) - 0.5) * 2.4, L2 = 60 + 110 * hash(i, j + 5);
        lineIn(c, n.x, n.y, n.x + Math.cos(an) * L2, n.y + Math.sin(an) * L2, k);
      }
    });
    // the title of the idea
    c.restore();
    c.textBaseline = 'alphabetic';
    const kn = prog(t, this.tName - 0.1, this.tName + 0.4);
    if (kn > 0) {
      c.globalAlpha = ease.outCubic(kn);
      c.font = font(F.archivo(100, 800), 76); c.fillStyle = rgba('bone');
      c.fillText('explosão de inteligência', 180, 150);
      c.font = font(F.mono(400), 26); c.fillStyle = rgba('ash');
      if (t >= this.tSelf) typed(c, 'cada versão faz a próxima — cada vez mais rápido', 184, 196, prog(t, this.tSelf, this.tSelf + 1.2));
      c.globalAlpha = 1;
    }
    comp.draw(renderer, L.upload(), out);
    // the curve, hot, traced by the spark
    for (let i = 1; i <= hi + 1 && i < nodes.length; i++) {
      const p = nodes[i - 1]!, q = nodes[i]!;
      const r = i <= hi ? 1 : u;
      const steps = 16;
      for (let j = 0; j < steps; j++) {
        const u0 = (j / steps) * r, u1 = ((j + 1) / steps) * r;
        const pt = (uu: number) => ({ x: lerp(p.x, q.x, uu), y: lerp(p.y, q.y, ease.inQuad(uu)) + camY });
        const A = pt(u0), B = pt(u1);
        lb.seg2(A.x, A.y, B.x, B.y, 2.2, hot(1.6), 1);
      }
    }
    const hp = { x: head.x, y: head.y + camY };
    sparkParticles(lb, t, (tb) => {
      let k = 0; for (let i = 0; i < nodes.length; i++) if (tb >= nodes[i]!.t) k = i;
      const A = nodes[k]!, B = nodes[Math.min(k + 1, nodes.length - 1)]!;
      const uu = k + 1 < nodes.length ? clamp((tb - A.t) / Math.max(0.01, B.t - A.t)) : 1;
      return { x: lerp(A.x, B.x, uu), y: lerp(A.y, B.y, ease.inQuad(uu)) + Math.max(0, 420 - lerp(A.y, B.y, uu)) * 0.55 };
    }, { rate: 90, speed: 220, seed: 41 });
    sparkHead(lb, hp.x, hp.y, t, 1.1, 1);
    lb.render(renderer, out);
    return { post: { bloom: 0.55, ca: 0.6, frame: 0, zoom: 1 + 0.02 * pulse(t, this.tFast, 0.2) } };
  }
}

/**
 * 02.2 "O quarto chinês…" — the clip's room ("John Searle, 1980"); then the room seen from above, in
 * section, as a plan: someone who reads no Chinese locked in (the door bolted), question cards coming in
 * through a slot, a rulebook ("SE VIR 你好吗？ ESCREVA 我很好。"), the answer going out. Outside, a stamp:
 * FLUENTE. Inside, a card turns: 我不懂 = eu não entendo. "uma máquina que responde tudo certo": the person
 * becomes a chip, cards streaming through, all ticked; "entende alguma coisa?" — a question mark. "E os
 * cogumelos?": the clip's two seconds of acid, and the room melting.
 */
class B022 extends Block {
  private tPlan = 0; private tLock = 0; private tQ = 0; private tRule = 0; private tOut = 0; private tFl = 0; private tNo = 0; private tMac = 0; private tQm = 0; private tShroom = 0;
  override async init() {
    await this.clips.load('room');
    this.tPlan = this.n.nearestBeat(this.at('Alguém'));
    this.tLock = this.at('trancado'); this.tQ = this.at('responde perguntas'); this.tRule = this.at('seguindo');
    this.tOut = this.at('regras.') + 0.1; this.tFl = this.at('fluente'); this.tNo = this.at('não entende');
    this.tMac = this.at('uma máquina'); this.tQm = this.at('entende alguma');
    this.tShroom = this.n.nearestBeat(this.at('E os cogumelos'));
  }
  render(f: Frame, out: THREE.WebGLRenderTarget): BlockOut {
    const t = f.t;
    if (t < this.tPlan) {
      const post = this.clips.render('room', remap(t, [[this.e.start, 25.9], [this.tPlan, 27.3]]), out);
      const L = S().ui; L.clear();
      caption(L.ctx, 'John Searle · 1980', prog(t, this.at('Searle.') - 0.2, this.at('Searle.') + 0.4), 120, 110);
      this.ctx.comp.draw(this.ctx.renderer, L.upload(), out);
      return { post: clipPost(post) };
    }
    if (t >= this.tShroom) {
      const post = this.clips.render('room', remap(t, [[this.tShroom, 28.32], [this.e.end, 29.28]]), out);
      return { post: clipPost(post) };
    }
    return this.plan(t, out);
  }
  private plan(t: number, out: THREE.WebGLRenderTarget): BlockOut {
    const { renderer, comp } = this.ctx;
    clearRT(renderer, out, LIN.ink);
    const L = S().ui; L.clear(); const c = L.ctx;
    const lt = t - this.tPlan;
    const z = 1.22 + 0.012 * lt;
    c.save();
    c.translate(W / 2, H / 2 - 20); c.scale(z, z); c.rotate(-0.01 + 0.002 * lt); c.translate(-W / 2, -(H / 2 - 20));
    const X0 = 520, Y0 = 250, X1 = 1400, Y1 = 790; // the room's inner walls
    const draw = ease.inOutCubic(prog(t, this.tPlan, this.tPlan + 0.8));
    // walls (double hairline), the door (left) and the slot (right)
    c.strokeStyle = rgba('bone', 0.8); c.lineWidth = 1.3;
    const slotY = 520, doorY = 470;
    const wall = (o: number) => {
      c.beginPath();
      c.moveTo(X1 + o, slotY - 26); c.lineTo(X1 + o, Y0 - o); c.lineTo(X0 - o, Y0 - o); c.lineTo(X0 - o, doorY - 50);
      c.moveTo(X0 - o, doorY + 50); c.lineTo(X0 - o, Y1 + o); c.lineTo(X1 + o, Y1 + o); c.lineTo(X1 + o, slotY + 26);
      c.setLineDash([4000 * draw, 4000]); c.stroke(); c.setLineDash([]);
    };
    wall(0); wall(16);
    c.fillStyle = rgba('bone', 0.08 * draw); c.fillRect(X0 - 16, Y0 - 16, 16, Y1 - Y0 + 32);
    // shelves along the top wall
    c.strokeStyle = rgba('ash', 0.6 * draw); c.lineWidth = 1;
    for (let x = X0 + 30; x < X1 - 60; x += 90) { c.strokeRect(x, Y0 + 12, 70, 34); for (let k = 1; k < 7; k++) { c.beginPath(); c.moveTo(x + k * 10, Y0 + 12); c.lineTo(x + k * 10, Y0 + 46); c.stroke(); } }
    // the door, bolted on "trancado"
    const lk = prog(t, this.tLock, this.tLock + 0.25);
    c.strokeStyle = rgba('bone', 0.8 * draw);
    c.beginPath(); c.arc(X0, doorY - 50, 100, Math.PI / 2 * (1 - 0.1 * (1 - lk)), Math.PI / 2 - 0.02); c.stroke();
    c.beginPath(); c.moveTo(X0, doorY - 50); c.lineTo(X0 + 100 * Math.cos(0.15 * (1 - lk)), doorY - 50 + 100 * Math.sin(Math.PI / 2 - 0.15 * (1 - lk))); c.stroke();
    if (lk > 0) {
      c.fillStyle = rgba('signal', lk); c.fillRect(X0 - 30, doorY - 6, 22, 16);
      c.strokeStyle = rgba('signal', lk); c.lineWidth = 2.5; c.beginPath(); c.arc(X0 - 19, doorY - 8, 7, Math.PI, 0); c.stroke();
      c.font = font(F.mono(500), 18); c.fillStyle = rgba('signal', lk); c.textAlign = 'right';
      c.fillText('TRANCADO', X0 - 44, doorY + 8); c.textAlign = 'left';
    }
    // the desk, the rulebook, and whoever is inside (a plan symbol: head and shoulders from above)
    const dx = 820, dy = 470;
    c.strokeStyle = rgba('bone', 0.7 * draw); c.lineWidth = 1.2; c.strokeRect(dx, dy, 300, 120);
    const mac = ease.inOutCubic(prog(t, this.tMac, this.tMac + 0.5));
    const px = 970, py = 640;
    if (mac < 1) {
      // a person seen from above: shoulders, head, two arms reaching for the desk
      c.globalAlpha = (1 - mac) * draw;
      c.fillStyle = rgba('ink'); c.strokeStyle = rgba('bone', 0.95); c.lineWidth = 1.6;
      c.beginPath(); c.roundRect(px - 70, py - 8, 140, 40, 20); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(px - 58, py); c.lineTo(px - 44, py - 52); c.moveTo(px + 58, py); c.lineTo(px + 44, py - 52); c.stroke();
      c.beginPath(); c.arc(px, py + 6, 25, 0, TAU); c.fill(); c.stroke();
      c.font = font(F.mono(400), 16); c.fillStyle = rgba('ash'); c.fillText('alguém que não sabe chinês', px + 90, py + 20);
      c.globalAlpha = 1;
    }
    if (mac > 0) {
      c.globalAlpha = mac;
      c.strokeStyle = rgba('bone', 0.9); c.fillStyle = rgba('ink');
      c.fillRect(px - 50, py - 40, 100, 80); c.strokeRect(px - 50, py - 40, 100, 80);
      for (let k = 0; k < 5; k++) for (const s of [-1, 1]) { c.beginPath(); c.moveTo(px - 38 + k * 19, py + s * 40); c.lineTo(px - 38 + k * 19, py + s * 52); c.stroke(); }
      c.font = font(F.mono(600), 16); c.fillStyle = rgba('bone'); c.textAlign = 'center'; c.fillText('MÁQUINA', px, py + 6); c.textAlign = 'left';
      c.globalAlpha = 1;
    }
    // the rulebook: open on the desk, pages turning while it is used
    const flip = t >= this.tRule && t < this.tOut ? (t - this.tRule) * 3 : 0;
    const bx = 880, by = 490;
    c.strokeStyle = rgba('bone', 0.85 * draw); c.fillStyle = rgba('ink');
    c.fillRect(bx, by, 170, 80); c.strokeRect(bx, by, 85, 80); c.strokeRect(bx + 85, by, 85, 80);
    if (flip > 0) { const a = (flip % 1) * Math.PI; c.beginPath(); c.moveTo(bx + 85, by); c.lineTo(bx + 85 + 85 * Math.cos(a), by + 6 * Math.sin(a)); c.lineTo(bx + 85 + 85 * Math.cos(a), by + 80); c.lineTo(bx + 85, by + 80); c.stroke(); }
    c.font = font(F.mono(400), 15); c.fillStyle = rgba('ash', draw);
    c.fillText('MANUAL DE REGRAS', bx, by - 12);
    if (t >= this.tRule) {
      const k = prog(t, this.tRule, this.tRule + 0.6);
      c.font = font(F.mono(500), 20); c.fillStyle = rgba('bone', 0.95);
      typed(c, 'SE VIR', 560, 330, k * 3);
      c.font = `500 26px ${CJK}`; c.fillStyle = rgba('signal');
      if (k > 0.33) c.fillText('你好吗？', 650, 332);
      c.font = font(F.mono(500), 20); c.fillStyle = rgba('bone', 0.95);
      if (k > 0.5) c.fillText('ESCREVA', 790, 330);
      c.font = `500 26px ${CJK}`; c.fillStyle = rgba('signal');
      if (k > 0.8) c.fillText('我很好。', 902, 332);
    }
    // the cards: a question in, an answer out (then, for the machine, a stream of them, all ticked)
    const card = (x: number, y: number, text: string, a: number, tick = false) => {
      if (a <= 0) return;
      c.globalAlpha = a;
      c.fillStyle = rgba('bone', 0.95); c.fillRect(x - 60, y - 30, 120, 60);
      c.font = `600 24px ${CJK}`; c.fillStyle = rgba('ink'); c.textAlign = 'center'; c.fillText(text, x, y + 9); c.textAlign = 'left';
      if (tick) { c.strokeStyle = rgba('signal'); c.lineWidth = 4; c.beginPath(); c.moveTo(x + 70, y); c.lineTo(x + 82, y + 12); c.lineTo(x + 104, y - 16); c.stroke(); }
      c.globalAlpha = 1;
    };
    const slotX = X1 + 8;
    if (t >= this.tQ && t < this.tMac) {
      const kin = ease.inOutCubic(prog(t, this.tQ, this.tQ + 0.9));
      if (t < this.tOut) card(lerp(slotX + 260, 1060, kin), lerp(slotY, 450, kin), '你好吗？', 1);
      const kout = ease.inOutCubic(prog(t, this.tOut, this.tOut + 0.9));
      if (t >= this.tOut) card(lerp(1000, slotX + 300, kout), lerp(450, slotY, kout), '我很好。', 1);
    }
    if (t >= this.tMac) {
      for (let i = 0; i < 12; i++) {
        const t0 = this.tMac + 0.3 + i * 0.22, k = prog(t, t0, t0 + 0.8);
        if (k <= 0 || k >= 1) continue;
        const inb = k < 0.5, kk = inb ? k * 2 : (k - 0.5) * 2;
        const x = inb ? lerp(slotX + 260, px + 90, kk) : lerp(px + 90, slotX + 280, kk);
        card(x, slotY + (inb ? -40 : 40), inb ? '问？' : '答。', 1, !inb);
      }
    }
    // outside: FLUENTE; inside: the card that turns
    const kf = prog(t, this.tFl, this.tFl + 0.06);
    if (kf > 0) {
      c.save(); c.translate(1500, 330); c.rotate(-0.1); c.scale(lerp(1.15, 1, kf), lerp(1.15, 1, kf));
      c.strokeStyle = rgba('signal'); c.lineWidth = 6; c.strokeRect(-150, -48, 300, 96);
      c.font = font(F.archivo(75, 900), 64); c.fillStyle = rgba('signal'); c.textAlign = 'center'; c.fillText('FLUENTE', 0, 22);
      c.font = font(F.mono(500), 14); c.fillText('VISTO DE FORA', 0, -58); c.textAlign = 'left';
      c.restore();
    }
    const kn = prog(t, this.tNo - 0.1, this.tNo + 0.35);
    if (kn > 0 && t < this.tMac + 0.2) {
      const sx = Math.abs(Math.cos(kn * Math.PI));
      c.save(); c.translate(760, 660); c.scale(Math.max(0.02, sx), 1);
      c.fillStyle = rgba('bone', 0.95); c.fillRect(-90, -40, 180, 80);
      c.fillStyle = rgba('ink');
      if (kn > 0.5) { c.font = `600 34px ${CJK}`; c.textAlign = 'center'; c.fillText('我不懂', 0, 12); c.textAlign = 'left'; }
      c.restore();
      if (kn > 0.6) { c.font = font(F.mono(500), 22); c.fillStyle = rgba('bone'); c.fillText('= eu não entendo', 680, 740); }
    }
    c.restore();
    // "entende alguma coisa?"
    const kq = prog(t, this.tQm, this.tQm + 0.3);
    if (kq > 0) {
      c.font = font(F.serif(600, true), 380); c.fillStyle = rgba('signal', 0.9 * kq); c.textAlign = 'center';
      c.fillText('?', px + 40, 700 + (1 - ease.outBack(kq)) * 60); c.textAlign = 'left';
    }
    comp.draw(renderer, L.upload(), out);
    return { post: { bloom: 0.45, ca: 0.5, frame: 0, shake: kf > 0 && kf < 1 ? [4, 3] : [0, 0] } };
  }
}

/** The shoggoth, seen from outside: its projection, its eyes on screen and its mask. */
interface ShogLike { eyeScr: { x: number; y: number; r: number; vis: boolean }[]; maskW: THREE.Vector3; project(p: THREE.Vector3): { x: number; y: number; s: number } }
const MASK_R = 0.34;

/**
 * 02.3 "O shoggoth…" — the clip's mask, close; "H. P. Lovecraft". "Por dentro": the x-ray passes and the
 * camera is yanked back: the mask is a small disc held out by a colossal mass. "Por fora": the detector
 * boxes it — ASSISTENTE, amigável, prestativo, ok. "Guarda essa máscara": it comes off the scene and flies
 * down to the corner of the ruler, where it waits (until 04.6).
 */
class B023 extends Block {
  private k: [number, number][] = [];
  private tKeep = 0;
  override async init() {
    await this.clips.load('shoggoth');
    this.k = [[this.e.start, 29.36], [this.at('Por dentro'), 30.5], [this.at('massa') + 0.9, 32.25], [this.at('Por fora'), 32.55], [this.e.end, 32.88]];
    this.tKeep = this.at('Guarda');
  }
  render(f: Frame, out: THREE.WebGLRenderTarget): BlockOut {
    const { renderer, comp } = this.ctx;
    const t = f.t, s = remap(t, this.k);
    const flying = t >= this.tKeep;
    const post = this.clips.render('shoggoth', s, out, flying ? { hideMask: true } : undefined);
    const L = S().ui; L.clear(); const c = L.ctx;
    caption(c, 'Shoggoth · H. P. Lovecraft', prog(t, this.at('Lovecraft') - 0.1, this.at('Lovecraft') + 0.5) * (1 - prog(t, this.at('Por dentro') - 0.3, this.at('Por dentro'))));
    if (flying) {
      const sc = this.clips.scene<ShogLike>('shoggoth');
      const m = sc.project(sc.maskW);
      const r0 = MASK_R * m.s;
      const k = ease.inOutCubic(prog(t, this.tKeep, this.tKeep + 0.62));
      const to = Regua.MASK_AT;
      // a small arc down to the ruler, spinning a quarter turn
      const x = lerp(m.x, to.x, k), y = lerp(m.y, to.y, k) - Math.sin(k * Math.PI) * 120;
      if (k < 1) drawMask2D(c, x, y, lerp(r0, to.r, k), -k * 0.6);
    }
    comp.draw(renderer, L.upload(), out);
    return { post: clipPost(post) };
  }
}

/** The four eyes the narration reads, and what each tag means. */
const EYES_READ: [string, number, string, string][] = [
  ['Bajulação', 0, 'BAJULAÇÃO', 'concorda pra agradar'],
  ['Explora', 3, 'EXPLORA RECOMPENSAS', 'cumpre a meta do jeito errado'],
  ['Alinhamento', 7, 'ALINHAMENTO ENGANOSO', 'finge estar alinhado no treino'],
  ['Busca', 8, 'BUSCA PODER', 'acumula recursos: servem pra qualquer meta'],
];

/**
 * 02.4 "Os olhos de shinigami…" — the eyes opening as the clip sings "com teus olhos de shinigami",
 * with its tags in the margin ("Death Note"); "o nome e o tempo de vida": a tag, labelled; "leem os olhos do
 * monstro": every eye boxed. Then a hard cut to each eye as it is named, its tag with a line of meaning;
 * "Não são piadas": back out, the four marked.
 */
class B024 extends Block {
  private tName = 0; private tRead = 0; private cuts: number[] = []; private tBack = 0;
  override async init() {
    await this.clips.load('shoggoth');
    this.tName = this.at('nome'); this.tRead = this.at('Aqui');
    this.cuts = EYES_READ.map(([q]) => this.at(q) - 0.06);
    this.tBack = this.at('Não são');
  }
  private s(t: number) {
    // (held before 35.3 s: from there the clip starts shutting the eyes, EXPLORA RECOMPENSAS first)
    return remap(t, [[this.e.start, 32.95], [this.at('Death') - 0.2, 34.9], [this.e.end, 35.22]]);
  }
  render(f: Frame, out: THREE.WebGLRenderTarget): BlockOut {
    const { renderer, comp } = this.ctx;
    const t = f.t, s = this.s(t);
    const R = S().rt;
    const post = this.clips.render('shoggoth', s, R[0]!);
    const sc = this.clips.scene<ShogLike>('shoggoth');
    const L = S().ui; L.clear(); const c = L.ctx;
    const ci = t >= this.tBack ? -1 : this.cuts.filter((x) => t >= x).length - 1;
    let cam: Cam = { zoom: 1 };
    if (t >= this.tName - 0.2 && t < this.tRead) {
      // the tag in the margin: its name, its lifespan
      const k = ease.inOutCubic(prog(t, this.tName - 0.2, this.tName + 0.4));
      cam = { x: lerp(W / 2, 520, k), y: lerp(H / 2, 610, k), zoom: lerp(1, 1.9, k) };
    } else if (ci >= 0) {
      const e = sc.eyeScr[EYES_READ[ci]![1]]!;
      cam = { x: e.x - 40, y: e.y - 70, zoom: 2.0 + 0.05 * (t - this.cuts[ci]!) };
    } else if (t >= this.tBack) cam = { zoom: lerp(1.08, 1, ease.outCubic(prog(t, this.tBack, this.tBack + 0.6))) };
    camPass(renderer, R[0]!.texture, out, cam);
    c.textBaseline = 'alphabetic';
    caption(c, 'Death Note · Tsugumi Ohba e Takeshi Obata · 2003', prog(t, this.at('Death') - 0.1, this.at('Death') + 0.6) * (1 - prog(t, this.tName - 0.4, this.tName - 0.2)));
    if (t >= this.tName && t < this.tRead) {
      const at = (x: number, y: number) => camToScreen(cam, x, y);
      const n = at(300, 640), l = at(250, 690);
      callout(c, n.x, n.y, n.x + 300, n.y - 140, 'nome', prog(t, this.tName, this.tName + 0.4), { size: 40, color: rgba('bone') });
      callout(c, l.x, l.y, l.x + 360, l.y + 110, 'tempo de vida', prog(t, this.at('tempo'), this.at('tempo') + 0.4), { size: 40, color: rgba('bone') });
    }
    if (ci >= 0) {
      const [, , name, meaning] = EYES_READ[ci]!;
      const k = prog(t, this.cuts[ci]!, this.cuts[ci]! + 0.25);
      c.font = font(F.archivo(100, 800), 72); c.fillStyle = rgba('signal', k);
      c.fillText(name, 120, 790);
      c.font = font(F.mono(400), 32); c.fillStyle = rgba('bone', 0.95);
      typed(c, meaning, 124, 842, prog(t, this.cuts[ci]! + 0.1, this.cuts[ci]! + 0.6));
    }
    if (t >= this.tBack) {
      // the four, ringed
      const k = prog(t, this.tBack + 0.3, this.tBack + 0.8);
      c.strokeStyle = rgba('signal', k); c.lineWidth = 3;
      for (const [, i] of EYES_READ) { const e = sc.eyeScr[i]!; const p = camToScreen(cam, e.x, e.y); c.beginPath(); c.arc(p.x, p.y, e.r * 2.2 * cam.zoom!, 0, TAU); c.stroke(); }
    }
    comp.draw(renderer, L.upload(), out);
    return { post: { ...clipPost(post), shake: [0, 0], zoom: 1 } };
  }
}

export const C02: Record<string, BlockFactory> = {
  '02.1': (e) => new B021(e),
  '02.2': (e) => new B022(e),
  '02.3': (e) => new B023(e),
  '02.4': (e) => new B024(e),
};
void INK; void measure;
