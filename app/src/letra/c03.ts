// Chapter 03 · 0,42 · Poder demais.
import type * as THREE from 'three';
import type { Frame } from '../engine/scene';
import { W, H, clearRT } from '../engine/gl';
import { LIN, rgba } from '../engine/palette';
import { F, font, measure } from '../engine/type';
import { clamp, ease, hash, lerp, prog, pulse, TAU } from '../engine/util';
import { sparkHead, sparkParticles } from '../scenes/_motifs';
import { norm } from '../engine/lyrics';
import { Block, type BlockFactory, type BlockOut } from './block';
import { S, camPass, type Cam } from './kit';
import { INK } from './paper';
import { callout, hot, lineIn, typed } from './draw';
import { caption, clipPost, remap } from './c02';

/** A caption for bone paper: ink instead of bone. */
function captionInk(c: CanvasRenderingContext2D, text: string, k: number, x = 120, y = 120) {
  if (k <= 0) return;
  c.save();
  c.globalAlpha *= clamp(k);
  c.font = font(F.mono(600), 17); c.letterSpacing = '4px'; c.fillStyle = rgba('ink', 0.9);
  typed(c, text.toUpperCase(), x, y, k * 1.6);
  c.fillStyle = rgba('signal'); c.fillRect(x, y + 12, 28, 2);
  c.restore();
}
/** Word start of a song line's word (by content). */
function songWord(ly: import('../engine/lyrics').Lyrics, line: string, w: string) {
  const l = ly.get(line);
  const x = l.words.find((q) => norm(q.w) === norm(w));
  if (!x) throw new Error(`song word not found: ${w} in ${line}`);
  return x;
}
/** "10" with a raised exponent, drawn (Plex Mono has no superscript digits beyond ³). */
function pow10(c: CanvasRenderingContext2D, e: string, x: number, y: number, size: number, align: 'left' | 'center' = 'left') {
  c.font = font(F.mono(500), size);
  const wb = measure('10', F.mono(500), size), we = measure(e, F.mono(500), size * 0.62);
  const x0 = align === 'center' ? x - (wb + we) / 2 : x;
  c.textAlign = 'left';
  c.fillText('10', x0, y);
  c.font = font(F.mono(500), size * 0.62);
  c.fillText(e, x0 + wb + 1, y - size * 0.42);
}

// ---------------------------------------------------------------- 03.1
const KNEW = ['Roko · julho de 2010', 'os leitores do LessWrong', 'quem leu os comentários', 'quem ouviu falar', 'quem pesquisou depois', 'quem assistiu a um vídeo sobre isso'];

/**
 * 03.1 "O basilisco de Roko…" — the chorus rolls to 0.42; the basilisk's eye opens on BUM (the clip).
 * "experimento mental da internet": "Basilisco de Roko · LessWrong · 2010". "castigaria quem ficou sabendo":
 * the camera pushes into the slit pupil, and in its dark a list types itself — who knows. "E você acabou de
 * ouvir": the list gets one more line, "você", in signal, and the pupil closes in. "Foi mal." — a footnote.
 */
class B031 extends Block {
  private tEye = 0; private tIn = 0; private tList = 0; private tYou = 0; private tSorry = 0;
  override async init() {
    await Promise.all(['hook2', 'ascent'].map((id) => this.clips.load(id)));
    this.tEye = this.e.start + 0.8;
    this.tIn = this.at('uma superinteligência'); this.tList = this.at('quem ficou');
    this.tYou = this.at('E você'); this.tSorry = this.at('Foi mal');
  }
  render(f: Frame, out: THREE.WebGLRenderTarget): BlockOut {
    const { renderer, comp } = this.ctx;
    const t = f.t;
    if (t < this.tEye) return { post: clipPost(this.clips.render('hook2', remap(t, [[this.e.start, 58.95], [this.e.start + 0.4, 59.4], [this.tEye, 59.43]]), out)) };
    // (held before 61.7 s: there the clip cuts to the NVIDIA chart)
    const s = remap(t, [[this.tEye, 60.55], [this.at('Roko'), 61.5], [this.e.end, 61.64]]);
    const R = S().rt;
    const post = this.clips.render('ascent', s, R[0]!);
    const push = ease.inOutCubic(prog(t, this.tIn, this.tList + 0.6));
    const you = ease.outExpo(prog(t, this.tYou, this.tYou + 0.5));
    const cam: Cam = { x: 960, y: lerp(540, 552, push), zoom: lerp(1, 3.1, push) * (1 + 0.35 * you) };
    camPass(renderer, R[0]!.texture, out, cam);
    const L = S().ui; L.clear(); const c = L.ctx;
    caption(c, 'Basilisco de Roko · LessWrong · 2010', prog(t, this.at('experimento') - 0.1, this.at('experimento') + 0.6) * (1 - prog(t, this.tIn, this.tIn + 0.3)));
    // the list, in the dark of the pupil (its box fits the longest line, with the same margin all round)
    if (t >= this.tList - 0.2) {
      c.save();
      const lines = KNEW.map((n, i) => `${String(i + 1).padStart(2, '0')}  ${n}`);
      const pad = 40, bw = Math.max(...lines.map((l) => measure(l, F.mono(400), 30))) + 2 * pad;
      const bx = W / 2 - bw / 2, x0 = bx + pad;
      c.font = font(F.mono(500), 30); c.textBaseline = 'alphabetic';
      c.fillStyle = rgba('ink', 0.82 * prog(t, this.tList - 0.2, this.tList + 0.2));
      c.fillRect(bx, 250, bw, 520);
      c.fillStyle = rgba('signal', 0.95); c.letterSpacing = '4px';
      c.font = font(F.mono(600), 20);
      typed(c, 'QUEM FICOU SABENDO:', x0, 310, prog(t, this.tList, this.tList + 0.5));
      c.letterSpacing = '0px';
      lines.forEach((l, i) => {
        const t0 = this.tList + 0.4 + i * 0.5;
        c.font = font(F.mono(400), 30); c.fillStyle = rgba('bone', 0.9);
        typed(c, l, x0, 370 + i * 50, prog(t, t0, t0 + 0.45));
      });
      if (t >= this.tYou + 0.55) {
        c.font = font(F.mono(600), 34); c.fillStyle = rgba('signal');
        typed(c, `${String(KNEW.length + 1).padStart(2, '0')}  você`, x0, 370 + KNEW.length * 50 + 6, prog(t, this.tYou + 0.55, this.tYou + 0.9));
      }
      if (t >= this.tSorry) {
        c.font = font(F.mono(400), 20); c.fillStyle = rgba('ash');
        typed(c, '* foi mal.', bx + bw - pad - measure('* foi mal.', F.mono(400), 20), 370 + KNEW.length * 50 + 6, prog(t, this.tSorry, this.tSorry + 0.3));
      }
      c.restore();
    }
    comp.draw(renderer, L.upload(), out);
    return { post: { ...clipPost(post), shake: [0, 0], zoom: 1 + 0.03 * pulse(t, this.tYou + 0.55, 0.1) } };
  }
}

// ---------------------------------------------------------------- 03.2
/**
 * 03.2 "Um ê trinta flops…" — the verse as a time-lapse of the clip (NVIDIA to the moon, the Omega point),
 * landing on the odometer rolling to 1 followed by thirty zeros. "Em um segundo": a flight along a log
 * ruler, from 10⁰ to 10³⁰ in under a second, landing on "1 segundo". "dezenas de milhares de vezes": an arc
 * back to 2 × 10²⁵ — "÷ 50.000" — and "o treino inteiro do GPT-4" is labelled there.
 */
class B032 extends Block {
  private tRuler = 0; private tLand = 0; private tArc = 0; private tGPT = 0;
  override async init() {
    await this.clips.load('ascent');
    this.tRuler = this.n.nearestBeat(this.at('Em um segundo')) - 0.05;
    this.tLand = this.at('segundo', 1);
    this.tArc = this.at('dezenas'); this.tGPT = this.at('o que se estima');
  }
  render(f: Frame, out: THREE.WebGLRenderTarget): BlockOut {
    const t = f.t;
    if (t < this.tRuler) {
      const s = remap(t, [[this.e.start, 62.05], [this.e.start + 0.45, 63.3], [this.e.start + 0.9, 64.4], [this.e.start + 1.3, 65.3], [this.at('contas') + 0.2, 68.55], [this.tRuler, 68.62]]);
      return { post: clipPost(this.clips.render('ascent', s, out)) };
    }
    return this.ruler(t, out);
  }
  private ruler(t: number, out: THREE.WebGLRenderTarget): BlockOut {
    const { renderer, comp } = this.ctx;
    clearRT(renderer, out, LIN.ink);
    // the view: its centre (decades) and its scale (px per decade)
    const fly = ease.inOutCubic(prog(t, this.tRuler, this.tLand));
    const back = ease.inOutCubic(prog(t, this.tArc, this.tArc + 0.8));
    const centre = lerp(lerp(0.5, 30, fly), 27.6, back);
    const ppd = lerp(lerp(150, 230, fly), 150, back);
    const Y = 620;
    const xOf = (d: number) => W / 2 + (d - centre) * ppd;
    const L = S().ui; L.clear(); const c = L.ctx;
    c.textBaseline = 'alphabetic';
    c.fillStyle = rgba('bone', 0.4); c.fillRect(0, Y, W, 1.5);
    const blur = Math.abs(ppd * (lerp(0.5, 30, ease.inOutCubic(prog(t + 1 / 60, this.tRuler, this.tLand))) - lerp(0.5, 30, fly)));
    for (let d = 0; d <= 31; d++) {
      const x = xOf(d);
      if (x < -200 || x > W + 200) continue;
      c.fillStyle = rgba('bone', 0.85); c.fillRect(x, Y - 26, 2, 26);
      c.fillStyle = rgba('bone', 0.8); pow10(c, String(d), x, Y + 50, 28, 'center');
      for (let k = 2; k <= 9; k++) { const xm = x + Math.log10(k) * ppd; c.fillStyle = rgba('bone', 0.3); c.fillRect(xm, Y - 10, 1, 10); }
    }
    if (blur > 30) { c.fillStyle = rgba('bone', 0.06); for (let i = 0; i < 14; i++) c.fillRect(hash(i, 1) * W, Y - 200 + hash(i, 2) * 400, blur * 2, 1); }
    c.font = font(F.mono(500), 16); c.letterSpacing = '3px'; c.fillStyle = rgba('ash');
    c.fillText('CONTAS (FLOP) · ESCALA LOGARÍTMICA', 120, 140); c.letterSpacing = '0px';
    // the markers
    const mark = (d: number, title: string, sub: string, k: number, up: number, col: string) => {
      if (k <= 0) return;
      const x = xOf(d);
      c.globalAlpha = k;
      c.fillStyle = col; c.fillRect(x - 1.5, Y - up, 3, up);
      c.font = font(F.archivo(100, 700), 44); c.fillText(title, x - measure(title, F.archivo(100, 700), 44) / 2, Y - up - 50);
      c.font = font(F.mono(400), 22); c.fillStyle = rgba('bone', 0.85); c.fillText(sub, x - measure(sub, F.mono(400), 22) / 2, Y - up - 16);
      c.globalAlpha = 1;
    };
    mark(30, '1 segundo', 'a 10³⁰ FLOP por segundo'.replace('10³⁰', '1E30'), prog(t, this.tLand - 0.1, this.tLand + 0.3), 200, rgba('signal'));
    mark(Math.log10(2e25), 'GPT-4', 'treino inteiro ≈ 2 × 10²⁵'.replace('10²⁵', '1E25').replace('2 × 1E25', '2E25'), prog(t, this.tGPT, this.tGPT + 0.4), 130, rgba('bone'));
    // the arc: ÷ 50.000
    const ka = prog(t, this.tArc + 0.3, this.tArc + 1.1);
    if (ka > 0) {
      const x0 = xOf(30), x1 = xOf(Math.log10(2e25)), yA = Y + 110;
      c.strokeStyle = rgba('signal'); c.lineWidth = 2.5;
      c.beginPath();
      const n = 40;
      for (let i = 0; i <= n * ka; i++) { const u = i / n; const x = lerp(x0, x1, u), y = yA + Math.sin(u * Math.PI) * 90; if (i === 0) c.moveTo(x, y); else c.lineTo(x, y); }
      c.stroke();
      c.font = font(F.archivo(100, 900), 64); c.fillStyle = rgba('signal', clamp(ka * 2 - 1));
      const lab = '× 50.000';
      c.fillText(lab, (x0 + x1) / 2 - measure(lab, F.archivo(100, 900), 64) / 2, yA + 170);
    }
    c.font = font(F.mono(400), 16); c.fillStyle = rgba('ash', 0.8 * prog(t, this.tGPT + 0.4, this.tGPT + 0.8));
    c.fillText('estimativa: Epoch AI (incerteza de 2 a 5 vezes)', 120, 960);
    comp.draw(renderer, L.upload(), out);
    const lb = S().lines; lb.clear();
    sparkHead(lb, xOf(lerp(0.5, 30, fly)), Y, t, 1, 1 - back);
    lb.render(renderer, out);
    return { post: { bloom: 0.5, ca: 0.6 + 3 * clamp(blur / 200), frame: 0 } };
  }
}

// ---------------------------------------------------------------- 03.3
const LAYERS = [4, 6, 6, 3];
const NX = (i: number) => 260 + i * 330;
const NY = (i: number, j: number) => 430 + (j - (LAYERS[i]! - 1) / 2) * 105;

/**
 * 03.3 "MLP…" — the clip's annex (the verse, its words synced to the voice). Then the network on paper,
 * bigger: "A informação vai": orange pulses run forward, layer by layer; "sai uma resposta": the output
 * lights, with its value. "O erro volta": dark pulses run back from the error, and every connection gets a
 * little thicker or thinner as they pass. "E repete, milhões de vezes": the cycle again, faster and faster,
 * until it blurs, a step counter racing; a small loss curve in the corner drops a step per cycle, then
 * plunges — "É isso que faz a loss despencar".
 */
class B033 extends Block {
  private tNet = 0; private tFwd = 0; private tOut = 0; private tErr = 0; private tAdj = 0; private tRep = 0; private tMil = 0; private tLoss = 0;
  private k: [number, number][] = [];
  override async init() {
    await this.clips.load('bureau');
    const ly = this.ctx.lyrics;
    const line = 'MLP: vai';
    const [wv, wo, wr] = [songWord(ly, line, 'vai,'), songWord(ly, line, 'volta,'), songWord(ly, line, 'repetição,')];
    this.k = [[this.e.start, ly.get(line).start - 0.2], [this.at('vai', 0), wv.start], [this.at('volta', 0), wo.start], [this.at('repetição'), wr.start], [this.at('aprende') + 0.3, wr.end + 0.1]];
    this.tNet = this.n.nearestBeat(this.at('A informação'));
    this.tFwd = this.at('vai', 1); this.tOut = this.at('sai'); this.tErr = this.at('O erro'); this.tAdj = this.at('ajustando');
    this.tRep = this.at('E repete'); this.tMil = this.at('milhões'); this.tLoss = this.at('É isso');
  }
  /** Cycles completed at t (fractional): one at tErr, then faster and faster. */
  private cycles(t: number) {
    if (t < this.tRep) return t < this.tAdj ? 0 : 1;
    // period 0.9 s, shrinking exponentially from "milhões"
    const a = Math.min(t, this.tMil) - this.tRep;
    let n = 1 + a / 0.9;
    if (t > this.tMil) { const b = t - this.tMil; n += (Math.exp(b * 4.2) - 1) / (4.2 * 0.25); }
    return n;
  }
  render(f: Frame, out: THREE.WebGLRenderTarget): BlockOut {
    const { renderer, comp } = this.ctx;
    const t = f.t;
    if (t < this.tNet) return { post: clipPost(this.clips.render('bureau', remap(t, this.k), out)) };
    clearRT(renderer, out, LIN.ink);
    const cyc = this.cycles(t);
    const phase = t < this.tRep ? -1 : cyc % 1;
    const fast = prog(t, this.tMil, this.tMil + 1.0);
    // the forward sweep position (layers, 0..3) and the backward one
    let fwd = -1, bwd = -1;
    if (t < this.tRep) {
      fwd = t >= this.tFwd - 0.05 ? 3 * ease.inOutQuad(prog(t, this.tFwd - 0.05, this.tOut)) : -1;
      bwd = t >= this.tErr ? 3 - 3 * ease.inOutQuad(prog(t, this.tErr + 0.2, this.tAdj + 0.9)) : -1;
      if (t >= this.tAdj + 0.9) bwd = -1;
    } else {
      fwd = phase < 0.5 ? phase * 2 * 3 : -1;
      bwd = phase >= 0.5 ? 3 - (phase - 0.5) * 2 * 3 : -1;
    }
    const lossOf = (n: number) => { const plunge = 1 / (1 + Math.exp(-(n - 14) * 0.9)); return 0.9 - 0.03 * Math.min(n, 12) - 0.66 * plunge; };
    const k = ease.outCubic(prog(t, this.tNet, this.tNet + 0.4));
    S().sheet.render(renderer, out, { x: 900, y: 470, zoom: lerp(1.1, 1.0, k) + 0.01 * (t - this.tNet), roll: -0.006 }, [0, 0, 1800, 940], (c) => {
      c.textBaseline = 'alphabetic';
      c.fillStyle = INK.print(0.85); c.font = font(F.mono(600), 16); c.letterSpacing = '3px';
      c.fillText('ANEXO B — PERCEPTRON MULTICAMADAS (MLP)', 70, 80);
      c.letterSpacing = '0px';
      c.fillRect(70, 94, 1660, 1.5);
      const w = (i: number, a: number, b: number) => {
        const base = 0.25 + 0.75 * hash(i, a, b);
        const n = Math.floor(Math.max(0, cyc));
        return clamp(base + 0.22 * Math.sin(n * 1.7 + hash(i, a, b, 3) * 9) * Math.min(1, n));
      };
      // edges, with the pulses on them
      for (let i = 0; i < 3; i++) for (let a = 0; a < LAYERS[i]!; a++) for (let b = 0; b < LAYERS[i + 1]!; b++) {
        const x0 = NX(i), y0 = NY(i, a), x1 = NX(i + 1), y1 = NY(i + 1, b);
        const ww = w(i, a, b);
        c.strokeStyle = INK.print(0.35 + 0.5 * ww); c.lineWidth = 0.6 + 3.2 * ww;
        c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
        const fx = fwd - i, bx = bwd - i;
        if (fx > 0 && fx < 1 && fast < 0.8) { c.fillStyle = INK.orange(1); c.beginPath(); c.arc(lerp(x0, x1, fx), lerp(y0, y1, fx), 6, 0, TAU); c.fill(); }
        if (bx > 0 && bx < 1 && fast < 0.8) { c.fillStyle = INK.type(1); c.beginPath(); c.arc(lerp(x0, x1, bx), lerp(y0, y1, bx), 6, 0, TAU); c.fill(); }
        if (fast > 0.4) { c.strokeStyle = INK.orange(0.3 * fast); c.lineWidth = 2; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); }
      }
      // nodes
      for (let i = 0; i < 4; i++) for (let j = 0; j < LAYERS[i]!; j++) {
        const lit = fwd >= i || fast > 0.5;
        c.fillStyle = lit ? INK.orange(1) : INK.print(0.02); c.strokeStyle = INK.print(1); c.lineWidth = 2;
        c.beginPath(); c.arc(NX(i), NY(i, j), 20, 0, TAU); c.fill(); c.stroke();
      }
      c.fillStyle = INK.print(0.8); c.font = font(F.mono(500), 18);
      ['entrada', 'camada 1', 'camada 2', 'saída'].forEach((s, i) => c.fillText(s, NX(i) - measure(s, F.mono(500), 18) / 2, 800));
      // the answer, and the error
      if (t >= this.tOut && t < this.tRep + 0.3) {
        c.font = font(F.mono(500), 26); c.fillStyle = INK.type(1);
        typed(c, '→ resposta: "gato"', NX(3) + 50, NY(3, 1) + 10, prog(t, this.tOut, this.tOut + 0.5));
      }
      if (t >= this.tErr && t < this.tRep + 0.3) {
        c.font = font(F.mono(500), 26); c.fillStyle = INK.orange(1);
        typed(c, '← erro: era "cachorro"', NX(3) + 50, NY(3, 1) + 56, prog(t, this.tErr, this.tErr + 0.5));
      }
      if (t >= this.tAdj && t < this.tRep) {
        c.font = font(F.mono(500), 22); c.fillStyle = INK.print(0.9);
        typed(c, 'cada conexão: um pouquinho mais grossa ou mais fina', 330, 150, prog(t, this.tAdj, this.tAdj + 0.9));
      }
      // the counter
      if (t >= this.tRep) {
        const steps = Math.floor(cyc);
        c.font = font(F.mono(500), 18); c.letterSpacing = '3px'; c.fillStyle = INK.print(0.7);
        c.fillText('PASSOS DE TREINO', 1330, 150); c.letterSpacing = '0px';
        c.font = font(F.mono(400), 64); c.fillStyle = INK.type(1);
        const shown = t > this.tMil + 1.3 ? '1.000.000+' : steps.toLocaleString('pt-BR');
        c.fillText(shown, 1330, 220);
      }
      // the loss inset
      const ix = 1330, iy = 560, iw = 400, ih = 220;
      c.strokeStyle = INK.print(0.8); c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(ix, iy); c.lineTo(ix, iy + ih); c.lineTo(ix + iw, iy + ih); c.stroke();
      c.font = font(F.mono(500), 18); c.fillStyle = INK.print(0.8); c.fillText('loss', ix + 8, iy + 18);
      const nMax = Math.max(0, cyc);
      c.strokeStyle = INK.orange(1); c.lineWidth = 3; c.beginPath();
      const xs = (n: number) => ix + iw * clamp(Math.log10(1 + n) / Math.log10(1 + 40));
      for (let s = 0; s <= 120; s++) {
        const n = (s / 120) * Math.min(nMax, 40);
        const x = xs(n), y = iy + ih - ih * lossOf(Math.floor(n));
        if (s === 0) c.moveTo(x, y); else c.lineTo(x, y);
      }
      c.stroke();
    });
    // the loss inset comes forward on "despencar"
    const L = S().ui; L.clear(); const cc = L.ctx;
    if (t >= this.tLoss) {
      const kk = prog(t, this.tLoss, this.tLoss + 0.4);
      cc.font = font(F.archivo(100, 800), 52); cc.fillStyle = rgba('signal', kk);
      cc.fillText('a loss despenca', 1395, 600);
    }
    comp.draw(renderer, L.upload(), out);
    return { post: { bloom: 0.25, bloomThreshold: 1.6, ca: 0.5, vignette: 0.2, frame: 0, paper: 1 } };
  }
}

// ---------------------------------------------------------------- 03.4
/** The 1945 report's "organs", and what they are called in a phone today. */
const ORGANS: { name: string; now: string; x: number; y: number; w: number; h: number }[] = [
  { name: 'ENTRADA', now: 'toque, câmera', x: 80, y: 250, w: 220, h: 120 },
  { name: 'ÓRGÃO DE CONTROLE', now: 'processador', x: 420, y: 150, w: 330, h: 120 },
  { name: 'ÓRGÃO ARITMÉTICO', now: 'processador', x: 420, y: 330, w: 330, h: 120 },
  { name: 'SAÍDA', now: 'tela, som', x: 870, y: 250, w: 220, h: 120 },
  { name: 'MEMÓRIA', now: 'memória RAM', x: 420, y: 560, w: 330, h: 120 },
];

/**
 * 03.4 "John von Neumann…" — the clip's appendix C (before the strike): "John von Neumann · 1903–1957".
 * "Se até ele virou peça de coleção": the page is behind glass in a museum case, labelled; "imagina o resto
 * de nós": the camera moves on to the next case — empty, labelled "O resto de nós". "o aparelho em que você
 * vê este vídeo segue uma arquitetura com o nome dele": the diagram, out of the case, and the 1945 names of
 * its boxes get today's, handwritten. "É ela que o vídeo risca de laranja": the clip's orange X.
 */
class B034 extends Block {
  private tCase = 0; private tRest = 0; private tNow = 0; private tX = 0;
  override async init() {
    await this.clips.load('bureau');
    this.tCase = this.n.nearestBeat(this.at('Se até'));
    this.tRest = this.at('imagina'); this.tNow = this.n.nearestBeat(this.at('E tem mais')); this.tX = this.n.nearestBeat(this.at('É ela'));
  }
  private diagram(c: CanvasRenderingContext2D, t: number, relabel: number) {
    c.textBaseline = 'alphabetic';
    c.fillStyle = INK.print(0.85); c.font = font(F.mono(600), 15); c.letterSpacing = '3px';
    c.fillText('APÊNDICE C — ARQUITETURA DE VON NEUMANN (1945)', 60, 80); c.letterSpacing = '0px';
    c.fillRect(60, 94, 1060, 1.5);
    c.strokeStyle = INK.print(1); c.lineWidth = 2.5;
    for (const o of ORGANS) {
      c.strokeRect(o.x, o.y, o.w, o.h);
      c.font = font(F.mono(700), 17); c.fillStyle = INK.print(1);
      c.fillText(o.name, o.x + 16, o.y + 34);
    }
    // the bus
    c.lineWidth = 2;
    const arrow = (x0: number, y0: number, x1: number, y1: number) => {
      c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
      const a = Math.atan2(y1 - y0, x1 - x0);
      c.beginPath(); c.moveTo(x1, y1); c.lineTo(x1 - 14 * Math.cos(a - 0.4), y1 - 14 * Math.sin(a - 0.4)); c.lineTo(x1 - 14 * Math.cos(a + 0.4), y1 - 14 * Math.sin(a + 0.4)); c.closePath(); c.fillStyle = INK.print(1); c.fill();
    };
    arrow(300, 310, 420, 310); arrow(750, 310, 870, 310); arrow(585, 450, 585, 560); arrow(620, 560, 620, 450); arrow(585, 270, 585, 330);
    c.font = font(F.serif(400, true), 22); c.fillStyle = INK.print(0.8);
    c.fillText('Fig. C.1 — programa armazenado na memória, com os dados', 60, 740);
    // today's names, handwritten in orange
    if (relabel > 0) {
      ORGANS.forEach((o, i) => {
        const k = prog(relabel, i * 0.12, i * 0.12 + 0.4);
        c.font = font(F.archivoItalic(100, 400), 30); c.fillStyle = INK.orange(1);
        typed(c, o.now, o.x + 16, o.y + o.h - 22, k);
      });
    }
    void t;
  }
  render(f: Frame, out: THREE.WebGLRenderTarget): BlockOut {
    const { renderer, comp } = this.ctx;
    const t = f.t;
    if (t < this.tCase) {
      const post = this.clips.render('bureau', remap(t, [[this.e.start, 77.15], [this.tCase, 78.9]]), out);
      const L = S().ui; L.clear();
      captionInk(L.ctx, 'John von Neumann · 1903–1957', prog(t, this.at('Neumann') - 0.1, this.at('Neumann') + 0.6), 120, 1000);
      comp.draw(renderer, L.upload(), out);
      return { post: clipPost(post) };
    }
    if (t >= this.tX) return { post: clipPost(this.clips.render('bureau', remap(t, [[this.tX, 79.2], [this.e.end, 80.15]]), out)) };
    clearRT(renderer, out, LIN.ink);
    if (t < this.tNow) {
      // the museum: two cases side by side; the camera moves from the first to the empty one
      const pan = ease.inOutCubic(prog(t, this.tRest, this.tRest + 1.0));
      const camX = lerp(0, 1150, pan) + 20 * (t - this.tCase);
      const cz = 0.62;
      // the page's centre sits in the first case (screen x 960 − camX, y 475)
      S().sheet.render(renderer, out, { x: 590 + camX / cz, y: 390 + 65 / cz, zoom: cz, roll: 0 }, [0, 0, 1180, 780], (c) => this.diagram(c, t, 0), { shadow: 0.6 });
      const L = S().ui; L.clear(); const c = L.ctx;
      const cases = [{ x: 960 - camX, label: ['JOHN VON NEUMANN', '1903–1957', 'arquitetura de computador, 1945', 'peça de coleção'] }, { x: 960 - camX + 1150, label: ['O RESTO DE NÓS', '—', '', 'em breve'] }];
      for (const cs of cases) {
        const x0 = cs.x - 420, x1 = cs.x + 420, y0 = 150, y1 = 800;
        c.strokeStyle = rgba('bone', 0.55); c.lineWidth = 1.3;
        c.strokeRect(x0, y0, x1 - x0, y1 - y0);
        c.beginPath(); c.moveTo(x0 - 30, y1); c.lineTo(x1 + 30, y1); c.lineTo(x1 + 30, y1 + 150); c.lineTo(x0 - 30, y1 + 150); c.closePath(); c.stroke();
        c.strokeStyle = rgba('bone', 0.14); c.lineWidth = 1;
        for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(x0 + 80 + k * 50, y0 + 20); c.lineTo(x0 + 20 + k * 50, y0 + 200); c.stroke(); }
        // the label card on the plinth
        c.fillStyle = rgba('bone', 0.92); c.fillRect(cs.x - 170, y1 + 30, 340, 96);
        c.fillStyle = rgba('ink'); c.font = font(F.mono(700), 16); c.fillText(cs.label[0]!, cs.x - 150, y1 + 60);
        c.font = font(F.mono(400), 15); c.fillText(cs.label[1]!, cs.x - 150, y1 + 82); c.fillText(cs.label[2]!, cs.x - 150, y1 + 102);
        c.font = font(F.serif(400, true), 18); c.fillStyle = rgba('blood'); c.fillText(cs.label[3]!, cs.x + 30, y1 + 118);
      }
      comp.draw(renderer, L.upload(), out);
      return { post: { bloom: 0.3, ca: 0.4, frame: 0 } };
    }
    // out of the case: the diagram, and today's names
    const k = ease.inOutCubic(prog(t, this.tNow, this.tNow + 0.6));
    S().sheet.render(renderer, out, { x: 590, y: 440, zoom: lerp(0.62, 1.12, k), roll: 0 }, [0, 0, 1180, 780], (c) => this.diagram(c, t, prog(t, this.at('aparelho'), this.at('dele.') + 0.3)));
    return { post: { bloom: 0.2, bloomThreshold: 1.6, ca: 0.4, vignette: 0.2, frame: 0, paper: 1 } };
  }
}

// ---------------------------------------------------------------- 03.5
/**
 * 03.5 "A guinada à esquerda…" — the clip's swerve on "esquerda". Then a map from above: a straight road,
 * "COMPORTAMENTO DESEJADO", the spark driving on it; beside it a capability gauge, low ("fraca"). "num
 * salto de capacidade": the gauge jumps; "o bom comportamento fique pra trás": the spark turns 90° left off
 * the road, the camera whips with it and the road is left behind. "o trabalho do alinhamento": back on the
 * road, guard rails drawn along it — ALINHAMENTO — "querer o que a gente quer": they end a little further on.
 */
class B035 extends Block {
  private tMap = 0; private tWeak = 0; private tJump = 0; private tTurn = 0; private tAlign = 0; private tWant = 0;
  private k: [number, number][] = [];
  override async init() {
    await this.clips.load('leftturn');
    const ly = this.ctx.lyrics;
    const we = songWord(ly, 'Guinada à esquerda', 'esquerda,');
    this.k = [[this.e.start, ly.get('Guinada à esquerda').start - 0.1], [this.at('esquerda'), we.start], [this.at('é o medo'), we.end + 0.3]];
    this.tMap = this.at('é o medo');
    this.tWeak = this.at('se comporte'); this.tJump = this.at('num salto'); this.tTurn = this.at('o bom');
    this.tAlign = this.n.nearestBeat(this.at('Evitar')); this.tWant = this.at('fazer a');
  }
  render(f: Frame, out: THREE.WebGLRenderTarget): BlockOut {
    const { renderer, comp } = this.ctx;
    const t = f.t;
    if (t < this.tMap) return { post: clipPost(this.clips.render('leftturn', remap(t, this.k), out)) };
    clearRT(renderer, out, LIN.ink);
    // world: the road runs up (y decreasing); the spark's distance along it
    const aligned = t >= this.tAlign;
    const speed = 170;
    const dist = aligned ? (t - this.tAlign) * speed * 1.3 : (t - this.tMap) * speed * lerp(1, 2.2, prog(t, this.tJump, this.tJump + 0.4));
    const turnK = aligned ? 0 : ease.inOutCubic(prog(t, this.tTurn, this.tTurn + 0.8));
    // spark position in world (x, y); after the turn it goes left
    const dTurn = (this.tTurn - this.tMap) * speed * 1.6;
    let sx = 0, sy = -dist;
    if (!aligned && t > this.tTurn) {
      const a = (Math.PI / 2) * turnK, R = 160;
      const along = dist - dTurn;
      sx = -R + R * Math.cos(a) - Math.max(0, along - R * a) * (turnK >= 1 ? 1 : 0);
      sy = -dTurn - R * Math.sin(a);
    }
    const camRot = -Math.PI / 2 * turnK;
    const L = S().ui; L.clear(); const c = L.ctx;
    c.save();
    c.translate(W / 2, H * 0.62); c.rotate(-camRot); c.translate(-sx, -sy);
    // terrain: contour hairlines
    c.strokeStyle = rgba('bone', 0.08); c.lineWidth = 1;
    for (let k = -30; k < 30; k++) { c.beginPath(); for (let i = -40; i <= 40; i++) { const x = i * 60, y = k * 90 + Math.sin(i * 0.3 + k) * 30 + sy; if (i === -40) c.moveTo(x + sx, y); else c.lineTo(x + sx, y); } c.stroke(); }
    // the road
    const y0 = 400, y1 = -6000;
    c.strokeStyle = rgba('bone', 0.8); c.lineWidth = 2;
    c.beginPath(); c.moveTo(-70, y0); c.lineTo(-70, y1); c.moveTo(70, y0); c.lineTo(70, y1); c.stroke();
    c.strokeStyle = rgba('bone', 0.4); c.setLineDash([30, 30]); c.beginPath(); c.moveTo(0, y0); c.lineTo(0, y1); c.stroke(); c.setLineDash([]);
    c.save(); c.translate(110, sy - 60); c.rotate(-Math.PI / 2);
    c.font = font(F.mono(600), 22); c.letterSpacing = '6px'; c.fillStyle = rgba('bone', 0.8);
    c.fillText('COMPORTAMENTO DESEJADO', 0, 0); c.letterSpacing = '0px'; c.restore();
    // the rails
    if (aligned) {
      const kr = ease.outCubic(prog(t, this.tAlign, this.tAlign + 0.8));
      const railEnd = -(this.tWant - this.tAlign) * speed * 1.3 - 900;
      const top = lerp(y0, railEnd, kr);
      c.strokeStyle = rgba('signal', 0.95); c.lineWidth = 4;
      for (const x of [-100, 100]) { c.beginPath(); c.moveTo(x, y0); c.lineTo(x, top); c.stroke(); for (let y = y0; y > top; y -= 70) { c.fillStyle = rgba('signal'); c.fillRect(x - 5, y - 5, 10, 10); } }
      if (t >= this.tWant) {
        c.fillStyle = rgba('signal'); c.font = font(F.mono(600), 20);
        c.fillText('FIM DA PROTEÇÃO', 120, railEnd + 10);
      }
      c.save(); c.translate(-130, sy - 200); c.rotate(-Math.PI / 2);
      c.font = font(F.archivo(100, 800), 54); c.fillStyle = rgba('signal', kr); c.fillText('ALINHAMENTO', 0, 0); c.restore();
    }
    c.restore();
    // the gauge (screen-fixed)
    const cap = aligned ? 0.35 : t < this.tJump ? lerp(0.12, 0.22, prog(t, this.tMap, this.tJump)) : lerp(0.22, 0.95, ease.outExpo(prog(t, this.tJump, this.tJump + 0.5)));
    const gx = 1650, gy0 = 830, gh = 560;
    c.strokeStyle = rgba('bone', 0.7); c.lineWidth = 1.5; c.strokeRect(gx, gy0 - gh, 44, gh);
    c.fillStyle = rgba('signal'); c.fillRect(gx + 6, gy0 - gh * cap, 32, gh * cap - 6);
    c.font = font(F.mono(500), 18); c.letterSpacing = '3px'; c.fillStyle = rgba('bone', 0.9); c.textAlign = 'right';
    c.fillText('CAPACIDADE', gx + 44, gy0 + 34); c.letterSpacing = '0px';
    c.font = font(F.mono(400), 22); c.fillStyle = rgba('ash');
    if (!aligned && t >= this.tWeak && t < this.tJump) c.fillText('fraca · bem-comportada', gx - 20, gy0 - gh * cap);
    if (!aligned && t >= this.tJump) c.fillText('salto', gx - 20, gy0 - gh * cap);
    c.textAlign = 'left';
    comp.draw(renderer, L.upload(), out);
    const lb = S().lines; lb.clear();
    const hx = W / 2, hy = H * 0.62;
    sparkParticles(lb, t, () => ({ x: hx, y: hy }), { rate: 80, speed: 200, seed: 51 });
    sparkHead(lb, hx, hy, t, 1.1, 1);
    lb.render(renderer, out);
    const whip = prog(t, this.tTurn, this.tTurn + 0.8) > 0 && prog(t, this.tTurn, this.tTurn + 0.8) < 1 ? 1 : 0;
    return { post: { bloom: 0.5, ca: 0.6 + 3 * whip, frame: 0 } };
  }
}

// ---------------------------------------------------------------- 03.6
/**
 * 03.6 "CDR é piada dupla…" — the clip's Gantt, the empty CDR slot. "No Lisp": a Lisp session types
 * (cdr '(a b c)) under the list drawn as cons cells; "a linguagem das antigas inteligências artificiais de
 * regras": "Lisp · John McCarthy · 1958"; "pega o resto de uma lista": the first cell drops away and
 * (B C) prints. "Na engenharia": back to the Gantt, "CDR · revisão crítica de projeto"; "No vídeo": the
 * clip's stamp, SITUAÇÃO: NÃO REALIZADA.
 */
class B036 extends Block {
  private tLisp = 0; private tRest = 0; private tEng = 0; private tVid = 0;
  override async init() {
    await this.clips.load('leftturn');
    this.tLisp = this.n.nearestBeat(this.at('No Lisp')); this.tRest = this.at('pega'); this.tEng = this.n.nearestBeat(this.at('Na engenharia')); this.tVid = this.at('No vídeo');
  }
  render(f: Frame, out: THREE.WebGLRenderTarget): BlockOut {
    const { renderer, comp } = this.ctx;
    const t = f.t;
    if (t < this.tLisp) return { post: clipPost(this.clips.render('leftturn', remap(t, [[this.e.start, 84.4], [this.at('CDR'), 85.55], [this.tLisp, 85.65]]), out)) };
    if (t >= this.tEng) {
      // the clip's own footnote ("* CDR: revisão crítica de projeto") arrives with "revisão", its stamp with "No vídeo"
      const post = this.clips.render('leftturn', remap(t, [[this.tEng, 85.3], [this.at('revisão'), 85.7], [this.tVid - 0.1, 85.8], [this.tVid + 0.3, 85.98], [this.e.end, 86.5]]), out);
      return { post: clipPost(post) };
    }
    clearRT(renderer, out, LIN.ink);
    const L = S().ui; L.clear(); const c = L.ctx;
    c.textBaseline = 'alphabetic';
    const lt = t - this.tLisp;
    c.font = font(F.mono(400), 44); c.fillStyle = rgba('ash');
    c.fillText('*', 200, 330);
    c.fillStyle = rgba('bone');
    typed(c, "(cdr '(a b c))", 250, 330, prog(t, this.tLisp + 0.2, this.tLisp + 1.2), { caret: true });
    // cons cells
    const dropK = ease.inCubic(prog(t, this.tRest, this.tRest + 0.7));
    const cells = ['a', 'b', 'c'];
    cells.forEach((ch, i) => {
      const x = 260 + i * 330, y = 480 + (i === 0 ? dropK * 700 : 0), rot = i === 0 ? dropK * 0.6 : 0;
      const a = ease.outCubic(prog(lt, 0.9 + i * 0.15, 1.3 + i * 0.15));
      if (a <= 0) return;
      c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(rot);
      c.strokeStyle = rgba('bone', 0.9); c.lineWidth = 2;
      c.strokeRect(0, 0, 110, 90); c.strokeRect(110, 0, 110, 90);
      c.font = font(F.mono(500), 48); c.fillStyle = i === 0 && t >= this.tRest - 0.3 ? rgba('signal') : rgba('bone');
      c.fillText(ch, 38, 62);
      c.fillStyle = rgba('bone');
      if (i < 2) { c.beginPath(); c.arc(165, 45, 7, 0, TAU); c.fill(); c.beginPath(); c.moveTo(165, 45); c.lineTo(330, 45); c.stroke(); c.beginPath(); c.moveTo(330, 45); c.lineTo(316, 37); c.lineTo(316, 53); c.closePath(); c.fill(); }
      else { c.beginPath(); c.moveTo(110, 90); c.lineTo(220, 0); c.stroke(); }
      c.restore();
    });
    c.font = font(F.mono(400), 22); c.fillStyle = rgba('ash');
    c.fillText('cabeça (car)', 262, 610 + dropK * 700); c.fillText('resto (cdr)', 590, 610);
    if (t >= this.tRest + 0.6) {
      c.font = font(F.mono(400), 44); c.fillStyle = rgba('signal');
      typed(c, '(B C)', 250, 790, prog(t, this.tRest + 0.6, this.tRest + 1.0));
    }
    caption(c, 'Lisp · John McCarthy · 1958', prog(t, this.at('a linguagem') - 0.1, this.at('a linguagem') + 0.6), 120, 140);
    comp.draw(renderer, L.upload(), out);
    return { post: { bloom: 0.5, ca: 0.5, frame: 0 } };
  }
}

// ---------------------------------------------------------------- 03.7
const COLS = 29, ROWS = 21; // 609 cells, 604 used
const GAMES = ['Breakout', 'Pong', 'Seaquest', 'Boxing', 'Asterix', 'Enduro', 'Frostbite', 'Qbert', 'Tennis', 'Freeway', 'Krull', 'Robotank', 'Bowling', 'Skiing', 'Tutankham'];
function taskName(i: number) {
  const r = hash(i, 17);
  if (i % 97 === 5 || r < 0.08) return { kind: 'chat', name: 'conversa' };
  if (r < 0.14) return { kind: 'chat', name: 'legenda de imagem' };
  if (r < 0.5) return { kind: 'game', name: `Atari · ${GAMES[Math.floor(hash(i, 3) * GAMES.length)]}` };
  if (r < 0.62) return { kind: 'arm', name: 'braço robótico · blocos' };
  return { kind: 'sim', name: ['simulação · andar', 'simulação · pegar', 'labirinto 3D', 'controle contínuo', 'empilhar'][Math.floor(hash(i, 9) * 5)]! };
}

/**
 * 03.7 "E Gato, sim, esse é o nome…" — the clip's Gato prompt, "Gato," with its candidates. "um modelo da
 * DeepMind": a grid of 604 cells, one per task (tiny names in Plex Mono), "Gato · DeepMind · 2022"; the
 * conversations light as they are named, then the video games, then the robot arm: "604 tarefas · uma
 * rede". "Com Sydney, o pedido era me solta": split — Sydney's plea on the left; "Agora é: não solta a minha
 * mão": Gato's on the right, its letters drifting apart, and it takes the frame.
 */
class B037 extends Block {
  private tGrid = 0; private tChat = 0; private tGame = 0; private tArm = 0; private tAll = 0; private tSyd = 0; private tNow = 0;
  private k: [number, number][] = [];
  override async init() {
    await Promise.all(['prompt3', 'prompt2'].map((id) => this.clips.load(id)));
    const ly = this.ctx.lyrics;
    const g = songWord(ly, 'Gato, por favor', 'Gato,');
    this.k = [[this.e.start, g.start - 0.4], [this.at('Gato'), g.start], [this.at('é um') , g.start + 1.2]];
    this.tGrid = this.n.nearestBeat(this.at('é um'));
    this.tChat = this.at('conversava'); this.tGame = this.at('jogava'); this.tArm = this.at('mexia');
    this.tAll = this.at('robótico') + 0.3; this.tSyd = this.n.nearestBeat(this.at('Com Sydney')); this.tNow = this.at('Agora');
  }
  render(f: Frame, out: THREE.WebGLRenderTarget): BlockOut {
    const { renderer, comp } = this.ctx;
    const t = f.t;
    if (t < this.tGrid) return { post: clipPost(this.clips.render('prompt3', remap(t, this.k), out)) };
    if (t >= this.tSyd) {
      clearRT(renderer, out, LIN.ink);
      const R = S().rt;
      const full = ease.inOutCubic(prog(t, this.tNow + 0.9, this.tNow + 1.5));
      this.clips.render('prompt2', 57.55, R[0]!);
      const split = lerp(W / 2, 0, full);
      if (full < 1) camPass(renderer, R[0]!.texture, out, { rect: [0, 0, split, H], mask: true, x: W / 2 + W / 4 + (1 - full) * 0 - 60, zoom: 1 }, true);
      if (t >= this.tNow) {
        this.clips.render('prompt3', lerp(93.3, 95.4, prog(t, this.tNow, this.e.end)), R[1]!);
        camPass(renderer, R[1]!.texture, out, { rect: [split, 0, W, H], mask: true, x: W / 2 - W / 4 * (1 - full) + 60 * (1 - full) }, true);
      }
      const L = S().ui; L.clear(); const c = L.ctx;
      c.font = font(F.mono(500), 18); c.letterSpacing = '3px';
      c.fillStyle = rgba('bone', 0.8 * (1 - full)); c.fillText('SYDNEY · 2023', 80, 120);
      if (t >= this.tNow) { c.fillStyle = rgba('bone', 0.8 * (1 - full)); c.fillText('GATO · 2022', split + 80, 120); }
      c.letterSpacing = '0px';
      c.fillStyle = rgba('bone', 0.4 * (1 - full)); c.fillRect(split - 1, 0, 2, H);
      comp.draw(renderer, L.upload(), out);
      return { post: { bloom: 0.5, ca: 0.5, frame: 0 } };
    }
    clearRT(renderer, out, LIN.ink);
    const L = S().ui; L.clear(); const c = L.ctx;
    const x0 = 130, y0 = 150, cw = (W - 260) / COLS, ch = 34;
    c.textBaseline = 'alphabetic';
    for (let i = 0; i < 604; i++) {
      const col = i % COLS, row = Math.floor(i / COLS);
      const a = prog(t, this.tGrid + (row + col) * 0.012, this.tGrid + (row + col) * 0.012 + 0.2);
      if (a <= 0) continue;
      const tk = taskName(i);
      const lit = (tk.kind === 'chat' && t >= this.tChat) || (tk.kind === 'game' && t >= this.tGame) || (tk.kind === 'arm' && t >= this.tArm) || t >= this.tAll;
      const hotk = (tk.kind === 'chat' && t < this.tGame) || (tk.kind === 'game' && t >= this.tGame && t < this.tArm) || (tk.kind === 'arm' && t >= this.tArm && t < this.tAll);
      const x = x0 + col * cw, y = y0 + row * ch;
      c.globalAlpha = a;
      c.fillStyle = lit ? (hotk ? rgba('signal', 0.95) : rgba('bone', 0.14)) : rgba('bone', 0.04);
      c.fillRect(x + 1, y + 1, cw - 2, ch - 2);
      c.font = font(F.mono(400), 8.5); c.fillStyle = lit && hotk ? rgba('ink') : rgba('bone', 0.45);
      c.fillText(tk.name.slice(0, 11), x + 3, y + ch / 2 + 3);
    }
    c.globalAlpha = 1;
    caption(c, 'Gato · DeepMind · 2022', prog(t, this.at('DeepMind') - 0.1, this.at('DeepMind') + 0.6), 130, 110);
    const ka = prog(t, this.tAll, this.tAll + 0.4);
    if (ka > 0) {
      c.fillStyle = rgba('ink', 0.75 * ka); c.fillRect(W / 2 - 520, H / 2 - 110, 1040, 200);
      c.font = font(F.archivo(100, 900), 110); c.fillStyle = rgba('bone', ka); c.textAlign = 'center';
      c.fillText('604 tarefas · uma rede', W / 2, H / 2 + 30); c.textAlign = 'left';
    }
    const lab = t >= this.tArm ? 'mexia um braço robótico' : t >= this.tGame ? 'jogava videogame' : t >= this.tChat ? 'conversava' : '';
    if (lab && ka <= 0) { c.font = font(F.mono(500), 30); c.fillStyle = rgba('signal'); c.fillText(lab, 130, 930); }
    comp.draw(renderer, L.upload(), out);
    return { post: { bloom: 0.4, ca: 0.5, frame: 0 } };
  }
}

export const C03: Record<string, BlockFactory> = {
  '03.1': (e) => new B031(e),
  '03.2': (e) => new B032(e),
  '03.3': (e) => new B033(e),
  '03.4': (e) => new B034(e),
  '03.5': (e) => new B035(e),
  '03.6': (e) => new B036(e),
  '03.7': (e) => new B037(e),
};
void hot; void callout; void lineIn;
