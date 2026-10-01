// Chapter 00 · Tudo é código (continued): the lyric's references, the details nobody notices, the title,
// the survey, and the number that goes up with every chorus.
import * as THREE from 'three';
import type { Frame, PostOverrides } from '../engine/scene';
import { W, H, clearRT } from '../engine/gl';
import { LIN, rgba } from '../engine/palette';
import { F, font, measure } from '../engine/type';
import { clamp, ease, hash, lerp, prog, pulse, TAU } from '../engine/util';
import { norm, type Line } from '../engine/lyrics';
import { drawReadout } from '../engine/hud';
import { sparkHead } from '../scenes/_motifs';
import { Block, type BlockFactory, type BlockOut } from './block';
import { S, camPass, fmtPT, type Cam } from './kit';
import { verseLines } from './montage';
import { callout, hot, outline, traceContours, type P2 } from './draw';

/** Clip posts, minus what the explainer owns (the crop marks, the HUD). */
function clipPost(p: PostOverrides): PostOverrides {
  const { frame: _f, hud: _h, hudDraw: _d, ...rest } = p;
  return rest;
}

/** The references the lyric hides, one mark per verse: [line (Portuguese text or hook:n), words]. */
const REFS: [string, string][] = [
  ['Vejo AGI', 'AGI'], ['teus circuitos', 'circuitos'], ['Tua loss', 'loss'], ['ChatGPT, não', 'ChatGPT'],
  ['hook:1', 'P(doom)'], ['faz FOOM', 'FOOM'], ['quarto chinês', 'quarto chinês'], ['shoggoth infame', 'shoggoth'],
  ['olhos de shinigami', 'shinigami'], ['singularidade', 'singularidade'], ['átomos', 'átomos'], ['Sydney', 'Sydney'],
  ['basilisco', 'basilisco'], ['NVIDIA', 'NVIDIA'], ['Ponto Ômega', 'Ponto Ômega'], ['FLOPs', 'FLOPs'],
  ['MLP', 'MLP'], ['von Neumann', 'von Neumann'], ['Guinada', 'Guinada à esquerda'], ['CDR', 'CDR'],
  ['Gato, por', 'Gato'], ['tudo vira clipe', 'clipe'], ['Quem desliga', 'Quem desliga'], ['ortogonalidade', 'ortogonalidade'],
  ['transformers', 'transformers'], ['Chinchilla', 'Pós-Chinchilla'], ['Cem mil GPU', 'GPU'], ['RLHF', 'RLHF'],
  ['previu o Loom', 'Loom'], ['Ilya viu', 'Ilya'],
];

/** The teasers of 00.3: a clip moment for each hook the narration plants, and where it sits in the song. */
const BAITS = [
  { q: 'Uma I-Á que', id: 'prompt2', s0: 55.5, rate: 0.85, line: 'Sydney', tag: 'cap. 02 · Sydney' },
  { q: 'Um monstro', id: 'shoggoth', s0: 30.0, rate: 0.62, line: 'shoggoth infame', tag: 'cap. 02 · shoggoth' },
  { q: 'Uma demissão', id: 'ilya', s0: 131.95, rate: 0.6, line: 'Ilya viu', tag: 'cap. 05 · Ilya' },
  { q: 'E uma fábrica', id: 'paperclips', s0: 97.45, rate: 0.6, line: 'tudo vira clipe', tag: 'cap. 04 · clipes' },
];

/**
 * 00.3 "Mas antes, a letra. Ela esconde umas trinta referências…" — the whole lyric, set as a sheet; on
 * "esconde umas trinta referências" the spark runs the ruler from 0:00 to 2:35 and every verse it passes
 * lights up with its reference marked, a counter going to 30. Then the four hooks the narration plants,
 * each a clip moment remounted, with the cursor jumping to where it is in the song and its chapter tagged.
 */
class B003 extends Block {
  private lines: Line[] = [];
  private marks: { line: number; w0: number; w1: number; s: number }[] = [];
  private tIn = 0; private tS = 0; private tE = 0;
  private cuts: { t: number; b: (typeof BAITS)[number]; pos: number }[] = [];
  private tJump = 0;

  override async init() {
    await Promise.all(BAITS.map((b) => this.clips.load(b.id)));
    const ly = this.ctx.lyrics;
    this.lines = ly.lines;
    for (const [q, key] of REFS) {
      const line = verseLines(ly, { lines: [q] })[0]!;
      const ks = key.split(/\s+/).map(norm);
      const w0 = line.words.findIndex((_, i) => ks.every((k, j) => norm(line.words[i + j]?.w ?? '') === k));
      if (w0 < 0) throw new Error(`reference not found: ${key} in "${line.text}"`);
      this.marks.push({ line: line.i, w0, w1: w0 + ks.length, s: line.start });
    }
    this.tIn = this.e.start;
    this.tS = this.at('esconde') - 0.05;
    this.tE = this.endOf('trinta referências') + 0.1;
    this.cuts = BAITS.map((b) => {
      const w = this.at(b.q);
      const nb = this.n.nearestBeat(w - 0.03);
      return { t: Math.abs(nb - w) < 0.22 ? nb : w - 0.04, b, pos: verseLines(ly, { lines: [b.line] })[0]!.start };
    });
    this.tJump = this.n.nearestBeat(this.at('que poderia'));
  }

  render(f: Frame, out: THREE.WebGLRenderTarget): BlockOut {
    const t = f.t;
    const cut = [...this.cuts].reverse().find((c) => t >= c.t);
    if (!cut) return this.sheet(t, out);
    const { renderer } = this.ctx;
    const lt = t - cut.t;
    let s = cut.b.s0 + lt * cut.b.rate;
    if (cut.b.id === 'paperclips' && t >= this.tJump) s = 101.75 + (t - this.tJump) * 0.45;
    const R = S().rt;
    const post = this.clips.render(cut.b.id, s, R[0]!);
    camPass(renderer, R[0]!.texture, out, { zoom: 1.04 + 0.02 * lt });
    const prev = this.cuts[this.cuts.indexOf(cut) - 1];
    const from = prev ? prev.pos : 155.6;
    const pos = lerp(from, cut.pos, ease.outExpo(prog(t, cut.t, cut.t + 0.35)));
    return { post: { ...clipPost(post), frame: 0 }, regua: { pos, label: [cut.b.tag, prog(t, cut.t + 0.1, cut.t + 0.3)] } };
  }

  /** The lyric sheet, and the sweep that finds the references. */
  private sheet(t: number, out: THREE.WebGLRenderTarget): BlockOut {
    const { renderer, comp } = this.ctx;
    clearRT(renderer, out, LIN.ink);
    const pos = 155.6 * ease.inOutQuad(prog(t, this.tS, this.tE));
    const L = S().ui; L.clear(); const c = L.ctx;
    const cols = [[0, 16], [16, 31], [31, 46]];
    const x0s = [150, 725, 1300], y0 = 215, lh = 38;
    c.textBaseline = 'alphabetic';
    const found = this.marks.filter((m) => m.s <= pos + 0.01);
    cols.forEach(([a, b], ci) => {
      for (let i = a!; i < b!; i++) {
        const line = this.lines[i]!;
        const k = i - a!;
        const y = y0 + k * lh;
        const appear = ease.outCubic(prog(t, this.tIn + 0.05 + i * 0.022, this.tIn + 0.35 + i * 0.022));
        if (appear <= 0) continue;
        const lit = line.start <= pos + 0.01;
        const x = x0s[ci]!;
        c.globalAlpha = appear;
        c.font = font(F.mono(400), 12); c.fillStyle = rgba(lit ? 'ash' : 'graphite', 0.9);
        const tm = `${Math.floor(line.start / 60)}:${String(Math.floor(line.start % 60)).padStart(2, '0')}`;
        c.textAlign = 'right'; c.fillText(tm, x - 14, y); c.textAlign = 'left';
        const fam = F.archivo(100, 500), size = 22;
        c.font = font(fam, size);
        let xx = x;
        const m = this.marks.find((q) => q.line === i);
        line.words.forEach((w, wi) => {
          const isRef = m && wi >= m.w0 && wi < m.w1;
          const ref = isRef && lit;
          c.fillStyle = ref ? rgba('signal') : rgba('bone', lit ? 0.92 : 0.34);
          c.fillText(w.w, xx, y + (1 - appear) * 10);
          const ww = measure(w.w, fam, size), sp = measure(' ', fam, size);
          if (ref) {
            const k2 = ease.outCubic(prog(pos, line.start, line.start + 3));
            c.fillRect(xx, y + 6, (ww + (wi < m!.w1 - 1 ? sp : 0)) * k2, 2);
          }
          xx += ww + sp;
        });
      }
    });
    c.globalAlpha = 1;
    // header and the count
    c.font = font(F.mono(500), 15); c.letterSpacing = '4px'; c.fillStyle = rgba('ash', 0.9);
    c.fillText('A LETRA · 46 VERSOS', 150, 150);
    const count = found.length;
    const ck = prog(t, this.tS, this.tS + 0.2);
    if (ck > 0) {
      c.globalAlpha = ck;
      c.textAlign = 'right';
      c.fillText('REFERÊNCIAS', 1770 - 150, 150);
      c.letterSpacing = '0px';
      c.font = font(F.mono(500), 44); c.fillStyle = count > 0 ? rgba('signal') : rgba('bone', 0.6);
      c.fillText(String(count).padStart(2, '0'), 1770, 158);
      c.textAlign = 'left';
      c.globalAlpha = 1;
    }
    c.letterSpacing = '0px';
    comp.draw(renderer, L.upload(), out);
    return { post: { bloom: 0.4, ca: 0.5, frame: 0 }, regua: { pos } };
  }
}

/** Details of the clip, seen through a macro lens that never lets them be read. */
const DETAILS: { id: string; s: number; cam: Cam }[] = [
  { id: 'prompt1', s: 17.05, cam: { x: 800, y: 300, zoom: 2.3 } },
  { id: 'shoggoth', s: 35.3, cam: { x: 1440, y: 420, zoom: 2.4 } },
  { id: 'ilya', s: 131.75, cam: { x: 1180, y: 430, zoom: 2.1 } },
];

/** The title as 00.5 sets it: P(doom), in Cormorant, its outlines for the spark to trace. */
function titleLayout() {
  const S0 = 250, fP = F.serif(600, true), fT = F.serif(600);
  const wP = measure('P', fP, S0), wDoom = measure('(doom)', fT, S0), gap = 0.05 * S0;
  const x = W / 2 - (wP + gap + wDoom) / 2, y = 470;
  return { P: outline('P', fP, S0, x, y), doom: outline('(doom)', fT, S0, x + wP + gap, y), xP: x, xDoom: x + wP + gap, wP, wDoom, y, S: S0 };
}
let penCache: P2 | null = null;
/** Where the spark starts writing the title (the P's first contour). */
const titlePen = () => (penCache ??= titleLayout().P[0]![0]!);

/**
 * 00.4 "Vamos parar em cada uma. Tem coisa na imagem que quase ninguém percebe." A macro lens drifts,
 * out of focus, over details still to come (the token "Claude, 0,12", a shinigami tag, the laptop's
 * stickers), one a beat, never readable; on "quase ninguém percebe" the picture shrinks into a spark, the one
 * that writes the title in 00.5 (it waits where the P starts). The ruler fades out as the block starts, its
 * cursor running back to 0:00.
 */
class B004 extends Block {
  private cuts: number[] = [];
  private tPull = 0;
  private from = 0;
  override async init() {
    await Promise.all(DETAILS.map((d) => this.clips.load(d.id)));
    this.from = verseLines(this.ctx.lyrics, { lines: [BAITS[BAITS.length - 1]!.line] })[0]!.start;
    const b = this.n.beatsIn(this.e.start + 0.5, this.at('quase') - 0.2);
    this.cuts = [this.e.start, b[1] ?? this.e.start + 1.1, b[3] ?? this.e.start + 2.1];
    this.tPull = this.at('quase');
  }
  render(f: Frame, out: THREE.WebGLRenderTarget): BlockOut {
    const { renderer } = this.ctx;
    const t = f.t;
    let i = 0;
    for (let k = 0; k < this.cuts.length; k++) if (t >= this.cuts[k]!) i = k;
    const d = DETAILS[i]!, lt = t - this.cuts[i]!;
    const R = S().rt;
    const post = this.clips.render(d.id, d.s + lt * 0.08, R[0]!);
    const pull = ease.inCubic(prog(t, this.tPull, this.e.end - 0.08));
    clearRT(renderer, out, LIN.ink);
    // the lens breathes but never quite focuses; the image drifts
    const blur = 19 + 5 * Math.sin(lt * 2.3 + i);
    const r0: [number, number, number, number] = [0, 0, W, H];
    const pen = titlePen();
    const r1: [number, number, number, number] = [pen.x - 3, pen.y - 2, pen.x + 3, pen.y + 2];
    const rect = r0.map((v, j) => lerp(v, r1[j]!, pull)) as [number, number, number, number];
    camPass(renderer, R[0]!.texture, out, { ...d.cam, x: d.cam.x! + 22 * lt, y: d.cam.y! + 8 * lt, blur, rect, alpha: 1 - prog(pull, 0.85, 1), dim: 0.9 }, true);
    const lb = S().lines; lb.clear();
    const k = prog(pull, 0.7, 1);
    if (k > 0) { sparkHead(lb, pen.x, pen.y, t, 0.5 + 0.4 * k, k); lb.render(renderer, out); }
    // (00.3 left the cursor on the paperclips verse: it runs back to 0:00 as the ruler fades)
    const pos = lerp(this.from, 0, ease.inOutCubic(prog(t, this.e.start, this.e.start + 0.7)));
    return { post: { ...clipPost(post), bloom: 0.5, shake: [0, 0], zoom: 1, flash: 0, frame: 0 }, regua: { pos } };
  }
}

/**
 * 00.5 "Primeiro, o título…" — P(doom) set as in the clip's end card, traced by the spark; P and doom each
 * get their meaning; the clip's P(doom) instrument cannot settle on a value. The 2023 survey: 2,778 dots
 * fall into place, half of them light up (≥ 5%), and the field shrinks to the 20 seats of a small plane,
 * one of them orange.
 */
class B005 extends Block {
  private eq: { P: P2[][]; doom: P2[][]; xP: number; xDoom: number; wP: number; wDoom: number; y: number; S: number } | null = null;
  private tTrace = 0; private tP = 0; private tDoom = 0; private tProb = 0; private tRuin = 0; private tUp = 0; private tCat = 0; private tHum = 0;
  private tSurvey = 0; private tDrop = 0; private tHalf = 0; private tPlane = 0; private tQ = 0;
  private dots: P2[] = [];
  private seats: P2[] = [];
  private order: number[] = [];
  private rank: number[] = [];

  override init() {
    this.eq = titleLayout();
    this.tTrace = this.at('título') - 0.25;
    this.tP = this.at('Pê dum'); this.tDoom = this.at('dum', 0);
    this.tProb = this.at('probabilidade'); this.tRuin = this.at('ruína');
    this.tUp = this.at('A chance'); this.tCat = this.at('catástrofe'); this.tHum = this.at('humana');
    this.tSurvey = this.n.nearestBeat(this.at('Em dois'));
    this.tDrop = this.at('quase'); this.tQ = this.at('pergunta');
    this.tHalf = this.at('Metade'); this.tPlane = this.at('avião') - 0.3;
    // 2,778 answers on a grid (the left two thirds), and the 20 seats of a small plane (2 + 2, five rows)
    const cols = 62, x0 = 150, y0 = 230, dx = 16.6, dy = 14.6;
    for (let i = 0; i < 2778; i++) this.dots.push({ x: x0 + (i % cols) * dx, y: y0 + Math.floor(i / cols) * dy });
    this.order = this.dots.map((_, i) => i).sort((a, b) => hash(a, 7) - hash(b, 7));
    this.rank = new Array(this.dots.length);
    this.order.forEach((d, k) => { this.rank[d] = k; });
    const cx = 660, cy = 560;
    for (let r = 0; r < 5; r++) for (const sx of [-1.5, -0.5, 0.5, 1.5]) this.seats.push({ x: cx + sx * 64 + Math.sign(sx) * 18, y: cy - 150 + r * 76 });
  }

  render(f: Frame, out: THREE.WebGLRenderTarget): BlockOut {
    return f.t < this.tSurvey ? this.title(f, out) : this.survey(f, out);
  }

  private title(f: Frame, out: THREE.WebGLRenderTarget): BlockOut {
    const { renderer, comp } = this.ctx;
    const t = f.t, g = this.eq!;
    clearRT(renderer, out, LIN.ink);
    const up = ease.inOutCubic(prog(t, this.tUp - 0.1, this.tUp + 0.5)) * 150;
    const tf = (p: P2) => ({ x: p.x, y: p.y - up });
    const L = S().ui; L.clear(); const c = L.ctx;
    const fillK = prog(t, this.tTrace + 0.75, this.tTrace + 0.95);
    c.textBaseline = 'alphabetic';
    if (fillK > 0) {
      c.globalAlpha = fillK; c.fillStyle = rgba('signal');
      c.font = font(F.serif(600, true), g.S); c.fillText('P', g.xP, g.y - up);
      c.font = font(F.serif(600), g.S); c.fillText('(doom)', g.xDoom, g.y - up);
      c.globalAlpha = 1;
    }
    // meanings, under each part
    const kP = prog(t, this.tProb - 0.25, this.tProb + 0.35), kD = prog(t, this.tRuin - 0.25, this.tRuin + 0.35);
    callout(c, g.xP + g.wP * 0.45, g.y + 40 - up, g.xP + g.wP * 0.45 - 50, g.y + 190 - up, 'P, de probability', kP, { title: 'probabilidade', titleSize: 52, size: 24, align: 'right' });
    callout(c, g.xDoom + g.wDoom * 0.55, g.y + 40 - up, g.xDoom + g.wDoom * 0.55 + 50, g.y + 190 - up, 'doom, em inglês', kD, { title: 'ruína', titleSize: 52, size: 24, align: 'left' });
    // the clip's instrument: it cannot settle on a value
    const rk = prog(t, this.tUp, this.tUp + 0.4);
    if (rk > 0) {
      const scale = 3.2, rx = W / 2 - 110 * scale, ry = 830;
      const flick = t > this.tCat - 0.2 && t < this.tHum + 0.4;
      const v = flick ? hash(Math.floor(t * 9), 3) : 0;
      const text = flick ? fmtPT(v) : '?';
      c.globalAlpha = ease.outCubic(rk);
      drawReadout(c, rx, ry, flick ? v : 0, { scale, text, digits: rgba('bone', 0.95), label: rgba('signal', 1) });
      c.globalAlpha = 1;
    }
    comp.draw(renderer, L.upload(), out);
    const lb = S().lines; lb.clear();
    const k = t - this.tTrace;
    // the spark 00.4's picture shrank into, waiting where the P starts until it writes it
    if (k < 0) { const p = g.P[0]![0]!; sparkHead(lb, p.x, p.y, t, 0.9, 1); }
    traceContours(lb, g.P, k, t, { k0: 0, dur: 0.5, stagger: 0.04, width: 2.2, tf, alpha: 1 - prog(t, this.tTrace + 0.9, this.tTrace + 1.3) });
    traceContours(lb, g.doom, k, t, { k0: 0.12, dur: 0.5, stagger: 0.04, width: 2.2, tf, alpha: 1 - prog(t, this.tTrace + 0.9, this.tTrace + 1.3) });
    // "Pê" and "dum": each part flashes hot along its outline as it is named
    for (const [cs, t0] of [[g.P, this.tP], [g.doom, this.tDoom]] as const) {
      const h = pulse(t, t0, 0.18) * (t >= t0 ? 1 : 0);
      if (h > 0.02) for (const ct of cs) for (let j = 1; j < ct.length; j++) { const a = tf(ct[j - 1]!), b = tf(ct[j]!); lb.seg2(a.x, a.y, b.x, b.y, 2.4, hot(2.4 * h), 1); }
    }
    lb.render(renderer, out);
    return { post: { bloom: 0.5, bloomThreshold: 0.9, ca: 0.5, frame: 0 }, regua: { pos: 0 } };
  }

  private survey(f: Frame, out: THREE.WebGLRenderTarget): BlockOut {
    const { renderer, comp } = this.ctx;
    const t = f.t;
    clearRT(renderer, out, LIN.ink);
    const lb = S().lines; lb.clear();
    const L = S().ui; L.clear(); const c = L.ctx;
    const toPlane = ease.inOutCubic(prog(t, this.tPlane, this.tPlane + 0.8));
    let shown = 0;
    this.dots.forEach((p, i) => {
      const row = Math.floor(i / 62);
      const td = this.tDrop + (row / 45) * 0.8 + hash(i, 3) * 0.12;
      const a = ease.outCubic(prog(t, td, td + 0.25));
      if (a <= 0) return;
      shown++;
      const si = this.rank[i]!;
      const orange = si < 1389 && t >= this.tHalf + (si / 1389) * 0.7;
      // the plane: every dot heads for a seat, all but twenty fade on the way
      const keep = si < 20;
      let x = p.x, y = p.y - (1 - a) * 26;
      let alpha = a;
      if (toPlane > 0) {
        const seat = this.seats[keep ? si : si % 20]!;
        x = lerp(x, seat.x, toPlane); y = lerp(y, seat.y, toPlane);
        if (!keep) alpha *= 1 - prog(toPlane, 0.05, 0.6);
      }
      if (alpha <= 0.01) return;
      const isHot = keep && toPlane > 0 ? si === 7 : orange;
      const col: [number, number, number] = isHot ? [LIN.signal[0] * 1.6, LIN.signal[1] * 1.6, LIN.signal[2] * 1.6] : [LIN.bone[0] * 0.8, LIN.bone[1] * 0.8, LIN.bone[2] * 0.8];
      const r = lerp(6.2, 22, toPlane * (keep ? 1 : 0));
      lb.seg2(x, y, x + 0.01, y, r, col, alpha);
    });
    lb.render(renderer, out);
    // the plane's outline (top view), drawn once the seats are in
    const ok = prog(t, this.tPlane + 0.5, this.tPlane + 1.1);
    c.textBaseline = 'alphabetic';
    if (ok > 0) {
      c.strokeStyle = rgba('bone', 0.55); c.lineWidth = 1.2;
      c.save();
      c.beginPath();
      const cx = 660, top = 250, bot = 900;
      c.moveTo(cx, top - 90); c.bezierCurveTo(cx + 140, top - 40, cx + 150, top + 60, cx + 150, top + 140);
      c.lineTo(cx + 150, bot - 80); c.lineTo(cx + 40, bot + 40); c.lineTo(cx - 40, bot + 40); c.lineTo(cx - 150, bot - 80);
      c.lineTo(cx - 150, top + 140); c.bezierCurveTo(cx - 150, top + 60, cx - 140, top - 40, cx, top - 90);
      c.moveTo(cx + 150, 520); c.lineTo(cx + 520, 640); c.lineTo(cx + 520, 690); c.lineTo(cx + 150, 650);
      c.moveTo(cx - 150, 520); c.lineTo(cx - 520, 640); c.lineTo(cx - 520, 690); c.lineTo(cx - 150, 650);
      const len = 5200;
      c.setLineDash([len * ok, len]);
      c.stroke();
      c.restore();
    }
    // the numbers, on the right
    const x = 1260;
    c.font = font(F.mono(500), 16); c.letterSpacing = '3px'; c.fillStyle = rgba('ash', 0.9);
    c.fillText('PESQUISA · OUT. 2023', x, 250);
    c.letterSpacing = '0px';
    const count = Math.min(2778, shown);
    c.globalAlpha = 1 - toPlane;
    c.font = font(F.archivo(100, 700), 110); c.fillStyle = rgba('bone');
    c.fillText(count.toLocaleString('pt-BR'), x, 380);
    c.font = font(F.mono(400), 22); c.fillStyle = rgba('ash');
    if (t > this.tDrop + 0.5) c.fillText('pesquisadores de IA', x + 4, 420);
    const qk = prog(t, this.tQ, this.tQ + 0.3);
    if (qk > 0) {
      c.globalAlpha = qk * (1 - toPlane);
      c.font = font(F.serif(400, true), 30); c.fillStyle = rgba('bone', 0.85);
      const q = ['“Qual a chance de um desfecho', 'extremamente ruim, como a', 'extinção humana?”'];
      q.forEach((l, i) => c.fillText(l, x, 500 + i * 38));
    }
    const hk = prog(t, this.tHalf, this.tHalf + 0.4);
    if (hk > 0) {
      c.globalAlpha = ease.outCubic(hk) * (1 - toPlane);
      c.font = font(F.archivo(100, 900), 150); c.fillStyle = rgba('signal');
      c.fillText('≥ 5%', x, 780);
      c.font = font(F.mono(400), 22); c.fillStyle = rgba('bone', 0.85);
      c.fillText('metade das respostas', x + 6, 824);
    }
    c.globalAlpha = 1;
    c.font = font(F.mono(400), 14); c.fillStyle = rgba('ash', 0.75 * (1 - toPlane));
    c.fillText('Grace et al., “Thousands of AI Authors on the Future of AI”, 2024', x, 900);
    // the plane: one seat in twenty
    const pk = prog(t, this.tPlane + 0.9, this.tPlane + 1.3);
    if (pk > 0) {
      c.globalAlpha = ease.outCubic(pk);
      c.font = font(F.archivo(100, 900), 150); c.fillStyle = rgba('signal');
      c.fillText('1 em 20', x, 560);
      c.font = font(F.mono(400), 24); c.fillStyle = rgba('bone', 0.85);
      c.fillText('5% de chance de cair', x + 6, 610);
      c.globalAlpha = 1;
    }
    comp.draw(renderer, L.upload(), out);
    return { post: { bloom: 0.45, bloomThreshold: 0.9, ca: 0.5, frame: 0 }, regua: { pos: 0 } };
  }
}

/** The chorus numbers as the clip blows them up: [hook entry, song time]. */
const HOOKS: [string, number][] = [['hook1', 23.565], ['hook2', 59.4], ['hook3', 97.05], ['hook4', 125.62]];

/**
 * 00.6 "No vídeo, esse número sobe a cada refrão. Vamos subir junto." The clip's P(doom) instrument at
 * 0,02; on "sobe a cada refrão" the spark jumps from chorus to chorus on the ruler, one a beat, each with
 * its number as the clip blew it up; "Vamos subir junto": back to 0,02, and to the start of the song.
 */
class B006 extends Block {
  private jumps: number[] = [];
  private pos: number[] = [];
  private tBack = 0;
  override async init() {
    await Promise.all(HOOKS.map(([id]) => this.clips.load(id)));
    const b = this.n.beatsIn(this.at('sobe') - 0.1, this.at('junto'));
    this.jumps = b.slice(0, 4);
    while (this.jumps.length < 4) this.jumps.push((this.jumps[this.jumps.length - 1] ?? this.at('sobe')) + 0.4);
    this.tBack = this.n.nextBeat(this.jumps[3]! + 0.05);
    const ly = this.ctx.lyrics;
    this.pos = ly.findWords('P(doom)').map((w) => ly.lines[w.line]!.start);
  }
  render(f: Frame, out: THREE.WebGLRenderTarget): BlockOut {
    const { renderer, comp } = this.ctx;
    const t = f.t;
    const i = t >= this.tBack ? -1 : this.jumps.filter((x) => t >= x).length - 1;
    if (i >= 0) {
      const [id, s] = HOOKS[i]!;
      const R = S().rt;
      const post = this.clips.render(id, s + (t - this.jumps[i]!) * 0.04, R[0]!);
      camPass(renderer, R[0]!.texture, out, { zoom: 1.02 + 0.06 * (t - this.jumps[i]!) });
      const pos = lerp(i ? this.pos[i - 1]! : 0, this.pos[i]!, ease.outExpo(prog(t, this.jumps[i]!, this.jumps[i]! + 0.18)));
      return { post: { ...clipPost(post), frame: 0 }, regua: { pos, mark: [this.pos[i]!, 1 - prog(t, this.jumps[i]!, this.jumps[i]! + 0.4)] } };
    }
    // the instrument, big: 0,02
    clearRT(renderer, out, LIN.ink);
    const L = S().ui; L.clear(); const c = L.ctx;
    const scale = 4.2;
    const back = t >= this.tBack;
    const k = back ? prog(t, this.tBack, this.tBack + 0.3) : prog(t, this.e.start, this.e.start + 0.35);
    c.globalAlpha = ease.outCubic(k);
    const z = 1 + 0.03 * (t - this.e.start);
    c.translate(W / 2, H / 2 - 40); c.scale(z, z); c.translate(-W / 2, -(H / 2 - 40));
    drawReadout(c, W / 2 - 110 * scale, 600, 0.02, { scale, text: '0,02', digits: rgba('bone', 0.95), label: rgba('signal', 1) });
    comp.draw(renderer, L.upload(), out);
    const lb = S().lines; lb.clear();
    const bx = W / 2 - 110 * scale + 220 * scale * 0.02, by = 600 + 16 * scale;
    sparkHead(lb, bx, by, t, 1, ease.outCubic(k));
    lb.render(renderer, out);
    const pos = back ? lerp(this.pos[3]!, 0, ease.outExpo(prog(t, this.tBack, this.tBack + 0.3))) : 0;
    return { post: { bloom: 0.55, bloomThreshold: 0.9, ca: 0.5, frame: 0 }, regua: { pos: back ? pos : 0 } };
  }
}

export const C00B: Record<string, BlockFactory> = {
  '00.3': (e) => new B003(e),
  '00.4': (e) => new B004(e),
  '00.5': (e) => new B005(e),
  '00.6': (e) => new B006(e),
};
void TAU;
