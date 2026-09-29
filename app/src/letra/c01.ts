// Chapter 01 · P(doom) 0,02 · Faíscas.
import * as THREE from 'three';
import type { Frame } from '../engine/scene';
import { W, H, clearRT } from '../engine/gl';
import { LIN, rgba } from '../engine/palette';
import { F, font, layout, measure } from '../engine/type';
import { clamp, ease, lerp, prog, pulse } from '../engine/util';
import { sparkHead, sparkParticles } from '../scenes/_motifs';
import { Block, type BlockFactory, type BlockOut } from './block';
import { S, camPass, camToScreen, type Cam } from './kit';
import { INK, type SheetCam } from './paper';
import { loadMosaic, mosaic, tileRect } from './mosaic';
import { callout, hot, typed, type P2 } from './draw';
import { at, lengths, octilinear, type Part } from '../scenes/open-geo';

/** The open scene's camera (world units, y up). */
interface OCam { cx: number; cy: number; z: number; roll: number }
const WIDE: OCam = { cx: 2.7, cy: 1.5, z: 80, roll: 0 };

/**
 * A placeholder for the one outside image the ROTEIRO asks for (GPT-4's TikZ unicorns, Fig. 1.3 of
 * "Sparks of AGI"): not in the repository, so a clearly marked empty frame stands in for it.
 */
export function drawFigurePlaceholder(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  c.save();
  c.strokeStyle = INK.print(0.85); c.lineWidth = 2;
  c.strokeRect(x, y, w, h);
  c.beginPath(); c.rect(x, y, w, h); c.clip();
  c.strokeStyle = INK.print(0.14); c.lineWidth = 1.5;
  for (let k = -h; k < w; k += 22) { c.beginPath(); c.moveTo(x + k, y + h); c.lineTo(x + k + h, y); c.stroke(); }
  c.restore();
  c.fillStyle = INK.orange(1);
  c.font = font(F.mono(700), 20); c.letterSpacing = '4px';
  c.fillText('IMAGEM EXTERNA · A INSERIR', x + 28, y + 50);
  c.letterSpacing = '0px';
  c.fillStyle = INK.print(0.9); c.font = font(F.mono(500), 18);
  c.fillText('unicórnios desenhados pelo GPT-4 em TikZ', x + 28, y + 84);
  c.fillText('(Fig. 1.3, Sparks of AGI, 2023) — tratamento duotônico', x + 28, y + 110);
}

/**
 * 01.1 "O faiscar vem de um estudo…" — the TikZ sheet from further back, the whole construction run as a
 * time-lapse under the verse; the study's title page slides over it ("Sparks of Artificial General
 * Intelligence"), glossed in Portuguese; on "A AGI" the initials light and stand in the margin; a small
 * figure shows the machine's bar reaching the person's; "GPT-4" is underlined and the S of Sparks
 * ignites. "desenhar um unicórnio usando só código": the TikZ listing and its prompt. "Saiu isto": the
 * GPT-4 figure (placeholder). "Três anos depois": 2023 | 2026, our unicorn being plotted; on "um clipe
 * inteiro" the camera pulls back and it is one tile of the whole clip.
 */
class B011 extends Block {
  private tLapse = 0; private tPaper = 0; private tTitle = 0; private tGloss = 0; private tAGI = 0; private tBars = 0; private tEq = 0;
  private tGPT = 0; private tSparks = 0; private tListing = 0; private tFig = 0; private tSplit = 0; private tFull = 0; private tPull = 0;
  private readonly LIVE = 24;

  override async init() {
    await this.clips.load('open');
    await loadMosaic(this.clips);
    this.tLapse = this.e.start;
    this.tPaper = this.n.prevBeat(this.at('Faíscas'));
    this.tTitle = this.at('Faíscas') - 0.05; this.tGloss = this.at('Inteligência');
    this.tAGI = this.at('AGI'); this.tBars = this.at('capaz'); this.tEq = this.at('tão bem');
    this.tGPT = this.at('GPT-4'); this.tSparks = this.at('primeiros');
    this.tListing = this.n.prevBeat(this.at('Um dos'));
    this.tFig = this.at('Saiu') - 0.05;
    this.tSplit = this.n.nearestBeat(this.at('Três anos'));
    this.tFull = this.at('uma I-Á');
    this.tPull = this.at('clipe') - 0.15;
  }

  /** Song time of the sheet: the construction as a time-lapse, then a slow drift. */
  private sheetS(t: number) {
    const lt = t - this.tLapse;
    // (held under 4.9 s: the next verse starts at 5.0)
    return lt < 0.85 ? 1.55 + lt * 3.6 : Math.min(4.9, 4.61 + (lt - 0.85) * 0.08);
  }

  render(f: Frame, out: THREE.WebGLRenderTarget): BlockOut {
    const t = f.t;
    if (t < this.tListing) return this.study(t, out);
    if (t < this.tFig) return this.listing(t, out);
    if (t < this.tSplit) return this.figure(t, out);
    return this.split(t, out);
  }

  private study(t: number, out: THREE.WebGLRenderTarget): BlockOut {
    const { renderer } = this.ctx;
    const lt = t - this.tLapse;
    const cam: OCam = { ...WIDE, z: WIDE.z * (1 + 0.012 * lt), cx: WIDE.cx + 0.02 * lt };
    const post = this.clips.render('open', this.sheetS(t), out, { cam });
    const k = ease.outCubic(prog(t, this.tPaper, this.tPaper + 0.5));
    if (k > 0) {
      const sc: SheetCam = { x: 700, y: lerp(450 - 1000, 440, k) + 6 * Math.sin(t * 0.6), zoom: 1, roll: -0.018 };
      S().sheet.render(renderer, out, sc, [0, 0, 1180, 760], (c) => this.drawStudy(c, t));
      this.sparkS(t, sc, out);
    }
    return { post: { ...post, frame: 0, flash: 0, shake: [0, 0], zoom: 1 } };
  }

  /** Page geometry of the study's title (for the glyph-by-glyph inks and the spark on its S). */
  private title = { x: 70, y: 200, size: 64, fam: F.serif(600) };
  private drawStudy(c: CanvasRenderingContext2D, t: number) {
    c.textBaseline = 'alphabetic';
    c.fillStyle = INK.print(0.7); c.font = font(F.mono(500), 15); c.letterSpacing = '2px';
    c.fillText('ARXIV:2303.12712 · MARÇO DE 2023', 70, 80);
    c.letterSpacing = '0px';
    // the title, typed in (print ink); the initials of Artificial General Intelligence turn orange on "AGI"
    const tt = this.title;
    const line1 = 'Sparks of Artificial General', line2 = 'Intelligence:';
    const n1 = Array.from(line1).length + Array.from(line2).length;
    const kT = prog(t, this.tTitle, this.tTitle + 0.7);
    const shown = Math.floor(kT * n1);
    const agi = t >= this.tAGI;
    let k = 0;
    const put = (text: string, x: number, y: number, initials: number[]) => {
      const lay = layout(text, tt.fam, tt.size);
      c.font = font(tt.fam, tt.size);
      lay.glyphs.forEach((g, i) => {
        if (k++ >= shown) return;
        const sparkS = text === line1 && i === 0 && t >= this.tSparks;
        c.fillStyle = (agi && initials.includes(i)) || sparkS ? INK.orange(1) : INK.print(1);
        c.fillText(g.ch, x + g.x, y);
      });
    };
    put(line1, tt.x, tt.y, [10, 21]);
    put(line2, tt.x, tt.y + 72, [0]);
    const kS = prog(t, this.tTitle + 0.55, this.tTitle + 1.0);
    c.font = font(F.serif(400, true), 44); c.fillStyle = INK.print(0.95);
    typed(c, 'Early experiments with GPT-4', tt.x, tt.y + 138, kS);
    // GPT-4, underlined in orange
    if (t >= this.tGPT) {
      const x0 = tt.x + measure('Early experiments with ', F.serif(400, true), 44), w = measure('GPT-4', F.serif(400, true), 44);
      c.fillStyle = INK.orange(1);
      c.fillRect(x0, tt.y + 150, w * ease.outCubic(prog(t, this.tGPT, this.tGPT + 0.25)), 4);
    }
    c.fillStyle = INK.print(0.75); c.font = font(F.mono(400), 14);
    const auth = ['Sébastien Bubeck, Varun Chandrasekaran, Ronen Eldan, Johannes Gehrke, Eric Horvitz,', 'Ece Kamar, Peter Lee, Yin Tat Lee, Yuanzhi Li, Scott Lundberg, Harsha Nori, Hamid Palangi,', 'Marco Tulio Ribeiro, Yi Zhang · Microsoft Research'];
    auth.forEach((l, i) => typed(c, l, 70, tt.y + 196 + i * 22, prog(t, this.tTitle + 0.8, this.tTitle + 1.3)));
    // the Portuguese title, typed like a note
    c.font = font(F.mono(500), 24); c.fillStyle = INK.type(0.95);
    typed(c, '→ Faíscas de Inteligência Artificial Geral', 70, tt.y + 292, prog(t, this.tGloss - 0.1, this.tGloss + 0.9), { caret: false });
    // AGI in the margin, from the initials
    const ka = ease.outCubic(prog(t, this.tAGI, this.tAGI + 0.35));
    if (ka > 0) {
      c.fillStyle = INK.orange(ka);
      c.font = font(F.archivo(100, 900), 110);
      c.fillText('AGI', 900, tt.y + 60);
      c.font = font(F.mono(500), 16); c.fillStyle = INK.print(0.8 * ka);
      c.fillText('inteligência', 904, tt.y + 96); c.fillText('artificial geral', 904, tt.y + 118);
    }
    // the figure: intellectual tasks, a person's bar and the machine's reaching it
    const kb = prog(t, this.tBars, this.tBars + 0.4);
    if (kb > 0) {
      const fx = 70, fy = 610;
      c.globalAlpha = kb;
      c.fillStyle = INK.print(0.7); c.font = font(F.mono(600), 13); c.letterSpacing = '2px';
      c.fillText('FIG. — TAREFAS INTELECTUAIS (QUASE QUALQUER UMA)', fx, fy - 26);
      c.letterSpacing = '0px';
      c.font = font(F.mono(400), 16);
      c.fillStyle = INK.print(0.9); c.fillText('pessoa', fx, fy + 16); c.fillText('máquina', fx, fy + 62);
      c.fillStyle = INK.print(0.85); c.fillRect(fx + 110, fy, 760 * ease.outCubic(kb), 22);
      const km = lerp(0.18, 1, ease.inOutCubic(prog(t, this.tBars + 0.4, this.tEq + 0.7)));
      c.fillStyle = INK.orange(1); c.fillRect(fx + 110, fy + 46, 760 * km * ease.outCubic(kb), 22);
      c.globalAlpha = 1;
    }
    // greeked abstract
    c.fillStyle = INK.print(0.16);
    for (let i = 0; i < 4; i++) c.fillRect(70, 520 + i * 14, i === 3 ? 520 : 1040, 5);
  }

  /** The S of Sparks catches fire on "primeiros sinais". */
  private sparkS(t: number, sc: SheetCam, out: THREE.WebGLRenderTarget) {
    if (t < this.tSparks - 0.1) return;
    const x = sc.x, y = sc.y;
    const p = { x: this.title.x + 18 - x + W / 2, y: this.title.y - 40 - y + H / 2 };
    const lb = S().lines; lb.clear();
    const k = pulse(t, this.tSparks, 0.5) * (t >= this.tSparks ? 1 : 0);
    sparkParticles(lb, t, (tb) => (tb >= this.tSparks ? p : null), { rate: (tb) => 90 + 700 * pulse(tb, this.tSparks, 0.12), rateMax: 790, intensity: 1.3, speed: 320, seed: 21 });
    sparkHead(lb, p.x, p.y, t, 1.2 + 1.8 * k, clamp(prog(t, this.tSparks - 0.1, this.tSparks)) * 1.3);
    lb.render(this.ctx.renderer, out);
  }

  private listing(t: number, out: THREE.WebGLRenderTarget): BlockOut {
    const lt = t - this.tListing;
    const cam: OCam = { cx: lerp(3.2, 3.6, lt / 3), cy: 5.35, z: lerp(250, 270, lt / 3), roll: 0.004 };
    const post = this.clips.render('open', 3.35 + lt * 0.08, out, { cam, lyrics: false });
    return { post: { ...post, frame: 0, flash: 0, shake: [0, 0], zoom: 1 } };
  }

  /** The GPT-4 figure (placeholder), on its own paper. */
  private drawFig(c: CanvasRenderingContext2D, t: number) {
    drawFigurePlaceholder(c, 60, 60, 980, 520);
    c.fillStyle = INK.print(0.85); c.font = font(F.serif(400, true), 28);
    c.fillText('Figura 1.3 — “Sparks of Artificial General Intelligence”, 2023', 60, 630);
    void t;
  }
  private figure(t: number, out: THREE.WebGLRenderTarget): BlockOut {
    const { renderer } = this.ctx;
    clearRT(renderer, out, LIN.ink);
    const lt = t - this.tFig;
    S().sheet.render(renderer, out, { x: 550, y: 345, zoom: 1.12 + 0.02 * lt, roll: 0.01 }, [0, 0, 1100, 680], (c) => this.drawFig(c, t));
    return { post: { bloom: 0.2, ca: 0.4, frame: 0 } };
  }

  private split(t: number, out: THREE.WebGLRenderTarget): BlockOut {
    const { renderer, comp } = this.ctx;
    clearRT(renderer, out, LIN.ink);
    const R = S().rt;
    const full = ease.inOutCubic(prog(t, this.tFull, this.tFull + 0.6));
    const pull = ease.inOutCubic(prog(t, this.tPull, this.e.end - 0.1));
    // 2023: the figure on the left half, sliding out as 2026 takes the frame
    const xL = lerp(0, -W / 2, full);
    if (full < 1) {
      S().sheet.render(renderer, out, { x: 550 + (W / 4 - xL) / 0.8, y: 345, zoom: 0.8, roll: 0.01 }, [0, 0, 1100, 680], (c) => this.drawFig(c, t));
    }
    // 2026: our unicorn, being plotted (right half, then all, then one tile of the whole clip)
    const s = Math.min(4.9, 3.05 + (t - this.tSplit) * 0.5);
    this.clips.render('open', s, R[0]!, { cam: { cx: 0.1, cy: 0.9, z: 175, roll: 0 }, lyrics: false });
    if (pull <= 0) {
      // (a window on the frame, not squeezed: the unicorn centred in the right half, then in the whole frame)
      camPass(renderer, R[0]!.texture, out, { rect: [lerp(W / 2, 0, full), 0, W, H], mask: true, x: W / 2 - (W / 4) * (1 - full) }, true);
    } else {
      // the mosaic around it, the camera pulling back from its tile
      const z = lerp(7, 1, pull);
      const tr = tileRect(this.LIVE);
      const tc = { x: (tr[0] + tr[2]) / 2, y: (tr[1] + tr[3]) / 2 };
      const mc: Cam = { x: lerp(tc.x, W / 2, pull), y: lerp(tc.y, H / 2, pull), zoom: z };
      camPass(renderer, mosaic(renderer, this.clips, this.LIVE), out, mc, true);
      const a = camToScreen(mc, tr[0], tr[1]), b = camToScreen(mc, tr[2], tr[3]);
      camPass(renderer, R[0]!.texture, out, { rect: [a.x, a.y, b.x, b.y] }, true);
    }
    // the years
    const L = S().ui; L.clear(); const c = L.ctx;
    c.font = font(F.archivo(100, 700), 64); c.textBaseline = 'alphabetic';
    const ya = 1 - prog(t, this.tFull, this.tFull + 0.3);
    if (ya > 0) {
      c.fillStyle = rgba('bone', ya); c.fillText('2023', 80 + xL, 140);
      c.fillStyle = rgba('signal', ya); c.fillText('2026', W / 2 + 80, 140);
      c.fillStyle = rgba('bone', 0.4 * ya); c.fillRect(W / 2 - 1, 0, 2, H);
    }
    comp.draw(renderer, L.upload(), out);
    return { post: { bloom: 0.55, ca: 0.6, frame: 0 } };
  }
}

/** The open scene, seen from outside: its geometry, camera and projection. */
interface OpenLike { geometry(t: number): { parts: Part[] }; cam(t: number): OCam; w2s(c: OCam, x: number, y: number): [number, number] }

/** What each circuit "does" when the interpretability lens finds it; everything else is "???". */
const FOUND: [string, string][] = [['body', 'detecta curvas'], ['leg1', 'detecta pernas'], ['horn', 'detecta chifre?']];
const UNKNOWN = ['neck', 'head', 'mane0', 'mane1', 'tail0', 'leg0', 'leg2', 'leg3', 'ear', 'mane2', 'tail1', 'tail2'];

/**
 * 01.2 "Circuitos também é termo técnico…" — the verse as the clip plays it (the unicorn's strokes
 * re-routed into circuit traces). "conexões dentro da rede": the camera dives into the traces and rides a
 * pulse around the body's circuit, which isolates and glows: "circuito". "interpretabilidade": a lens
 * glides over the drawing and names three circuits. "a gente sabe treinar": the drawing retrains through
 * its checkpoints; "explicar como elas funcionam": every other circuit gets its tag — "???".
 */
class B012 extends Block {
  private tDive = 0; private tIso = 0; private tLens = 0; private tTrain = 0; private tQ = 0;
  private route: P2[] = [];
  private L: Float32Array<ArrayBufferLike> = new Float32Array(0);
  private o!: OpenLike;
  private readonly S_HOLD = 6.84;

  override async init() {
    await this.clips.load('open');
    this.o = this.clips.scene<OpenLike>('open');
    this.tDive = this.at('conexões') - 0.1; this.tIso = this.at('fazem');
    this.tLens = this.at('Mapear') - 0.1; this.tTrain = this.at('treinar'); this.tQ = this.at('muito melhor');
    const body = this.o.geometry(this.S_HOLD).parts.find((p) => p.id === 'body')!;
    this.route = octilinear(body.pts, 0.24, 0.08, true);
    this.L = lengths(this.route);
  }

  /** Song time: the verse (the re-routing) played fast, then held just after the tremor; retraining on "treinar". */
  private s(t: number) {
    const lt = t - this.e.start;
    if (t >= this.tTrain && t < this.tQ) {
      const k = prog(t, this.tTrain, this.tQ);
      return lerp(5.25, this.S_HOLD, ease.inOutCubic(k));
    }
    return lt < 0.75 ? 4.95 + lt * 2.2 : this.S_HOLD;
  }

  /** The camera over the sheet (world units): the clip's, a dive onto the pulse, the whole drawing. */
  private cam(t: number, s: number): OCam {
    const clip = this.o.cam(s);
    const pulse = this.pulseAt(t);
    const dive: OCam = { cx: pulse.x + 0.2, cy: pulse.y + 0.1, z: 430, roll: -0.02 };
    const whole: OCam = { cx: 0.35, cy: 0.75, z: 175, roll: 0 };
    const kd = ease.inOutCubic(prog(t, this.tDive, this.tDive + 0.8));
    const kw = ease.inOutCubic(prog(t, this.tLens, this.tLens + 0.7));
    const mix = (a: OCam, b: OCam, k: number): OCam => ({ cx: lerp(a.cx, b.cx, k), cy: lerp(a.cy, b.cy, k), z: Math.exp(lerp(Math.log(a.z), Math.log(b.z), k)), roll: lerp(a.roll, b.roll, k) });
    return mix(mix(clip, dive, kd), whole, kw);
  }

  /** The pulse riding the body's circuit (world). */
  private pulseAt(t: number): P2 {
    const tot = this.L[this.L.length - 1]!;
    const k = ease.inOutQuad(prog(t, this.tDive + 0.3, this.tIso + 0.1));
    const q = at(this.route, this.L, (0.12 + 0.95 * k) * tot % tot);
    return { x: q.x, y: q.y };
  }

  render(f: Frame, out: THREE.WebGLRenderTarget): BlockOut {
    const { renderer, comp } = this.ctx;
    const t = f.t, s = this.s(t);
    const cam = this.cam(t, s);
    const post = this.clips.render('open', s, out, { cam, lyrics: t < this.tDive });
    const w2s = (p: P2) => { const [x, y] = this.o.w2s(cam, p.x, p.y); return { x, y }; };
    const lb = S().lines; lb.clear();
    // the pulse, and the circuit it isolates (the rest of the drawing dims)
    const iso = prog(t, this.tIso, this.tIso + 0.3) * (1 - prog(t, this.tLens, this.tLens + 0.5));
    if (iso > 0) {
      const V = S().ui2; V.clear(rgba('ink', 0.62 * iso));
      comp.draw(renderer, V.upload(), out);
    }
    if (t >= this.tDive + 0.3 && t < this.tLens + 0.4) {
      const tot = this.L[this.L.length - 1]!;
      const k = ease.inOutQuad(prog(t, this.tDive + 0.3, this.tIso + 0.1));
      const head = (0.12 + 0.95 * k) * tot;
      const glow = 1 - prog(t, this.tLens, this.tLens + 0.4);
      for (let i = 1; i < this.route.length; i++) {
        const s0 = this.L[i - 1]!;
        let d = head - s0;
        if (d < 0) d += tot;
        const trail = Math.exp(-d / 0.5) * (d >= 0 && d < tot * 0.95 ? 1 : 0);
        const a = Math.max(trail, 0.9 * iso);
        if (a < 0.02) continue;
        const A = w2s(this.route[i - 1]!), B = w2s(this.route[i]!);
        lb.seg2(A.x, A.y, B.x, B.y, 2.6, hot(1.2 + 2.2 * trail), a * glow);
      }
      const h = w2s(this.pulseAt(t));
      if (t < this.tIso + 0.3) sparkHead(lb, h.x, h.y, t, 0.9, glow);
    }
    lb.render(renderer, out);
    // tags
    const Lr = S().ui; Lr.clear(); const c = Lr.ctx;
    c.textBaseline = 'alphabetic';
    if (iso > 0) {
      const p = w2s(this.pulseAt(t));
      const up = p.y > H / 2 ? -1 : 1;
      c.globalAlpha = iso;
      c.font = font(F.archivo(100, 700), 64); c.fillStyle = rgba('bone');
      c.fillText('circuito', p.x - 60, p.y + up * 150 + (up < 0 ? 0 : 50));
      c.font = font(F.mono(400), 22); c.fillStyle = rgba('ash');
      c.fillText('conexões que, juntas, fazem uma tarefa', p.x - 58, p.y + up * 150 + (up < 0 ? 36 : 86));
      c.strokeStyle = rgba('bone', 0.8); c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(p.x, p.y + up * 14); c.lineTo(p.x, p.y + up * 100); c.stroke();
      c.globalAlpha = 1;
    }
    const parts = this.o.geometry(s).parts;
    const mid = (id: string) => { const pp = parts.find((q) => q.id === id)!.pts; const m = pp[Math.floor(pp.length * 0.3)]!; return w2s(m); };
    let lens: { x: number; y: number; r: number } | null = null;
    if (t >= this.tLens + 0.5 && t < this.tTrain) {
      // the lens glides over body, legs, horn — naming each as it passes
      const k = prog(t, this.tLens + 0.5, this.tTrain - 0.2);
      const path = [mid('body'), mid('leg1'), mid('horn')];
      const seg = Math.min(1.999, k * 2), i = Math.floor(seg), u = ease.inOutCubic(seg - i);
      const a = path[i]!, b = path[i + 1]!;
      lens = { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), r: 150 };
    }
    // found circuits (they stay), then the unknown ones
    const tagAt = (id: string, text: string, t0: number, col: string) => {
      if (t < t0) return;
      const p = mid(id);
      const k = prog(t, t0, t0 + 0.35);
      const dx = p.x > W / 2 - 100 ? 90 : -90;
      callout(c, p.x, p.y, p.x + dx, p.y - 60, text, k, { color: col, size: text === '???' ? 30 : 26, align: dx > 0 ? 'left' : 'right' });
    };
    const lensDur = this.tTrain - 0.2 - (this.tLens + 0.5);
    FOUND.forEach(([id, text], i) => tagAt(id, text, this.tLens + 0.5 + lensDur * (i / 2) + 0.05, rgba('bone', 0.95)));
    UNKNOWN.forEach((id, i) => tagAt(id, '???', this.tQ + 0.05 + i * 0.12, rgba('signal', 0.95)));
    comp.draw(renderer, Lr.upload(), out);
    if (lens) {
      // the magnified view inside the lens: the sheet rendered twice as close, around the lens
      const R = S().rt;
      const wl = this.s2w(cam, lens.x, lens.y);
      this.clips.render('open', s, R[0]!, { cam: { ...cam, cx: wl.x, cy: wl.y, z: cam.z * 2 }, lyrics: false });
      camPass(renderer, R[0]!.texture, out, { mask: true, x: W - lens.x, y: H - lens.y, circle: [lens.x, lens.y, lens.r], dim: 1.35 }, true);
      const L2 = S().ui2; L2.clear(); const c2 = L2.ctx;
      c2.strokeStyle = rgba('bone', 0.85); c2.lineWidth = 1.5;
      c2.beginPath(); c2.arc(lens.x, lens.y, lens.r, 0, Math.PI * 2); c2.stroke();
      c2.lineWidth = 5; c2.beginPath(); c2.moveTo(lens.x + lens.r * 0.72, lens.y + lens.r * 0.72); c2.lineTo(lens.x + lens.r * 1.25, lens.y + lens.r * 1.25); c2.stroke();
      comp.draw(renderer, L2.upload(), out);
    }
    return { post: { ...post, frame: 0, flash: 0, zoom: 1, shake: t < this.tDive ? post.shake : [0, 0] } };
  }

  /** Screen px → world, for the sheet camera. */
  private s2w(c: OCam, sx: number, sy: number): P2 {
    const dx = sx - W / 2, dy = sy - H / 2;
    const co = Math.cos(-c.roll), si = Math.sin(-c.roll);
    const rx = co * dx - si * dy, ry = si * dx + co * dy;
    return { x: c.cx + rx / c.z, y: c.cy - ry / c.z };
  }
}

/** The loss scene, seen from outside. */
type P3 = { x: number; y: number; z: number };
interface LCam { pos: P3; tgt: P3; roll: number; fov: number }
interface LossLike { T0: number; tDrop: number; tIn: number; tRoll: number; camera(t: number): LCam; sparkPos(t: number): P3; proj(x: number, y: number, z: number): { x: number; y: number } | null }

/**
 * 01.3 "E a loss é o erro do modelo no treino…" — the chart as the clip draws it, the verse riding the
 * curve; "loss = erro" hangs from the spark. "fica parada por muito tempo": the camera rides the curve on a
 * rail, next to the spark, crawling along the plateau while the training steps race by. "despenca": the
 * plunge, in real time, the clip's camera taking over and falling with it into the landscape. "Sem aviso":
 * the world flips over, as it did on "dominou".
 */
class B013 extends Block {
  private sc!: LossLike;
  private k: [number, number][] = [];
  private tErro = 0; private tPar = 0; private tRail0 = 0; private tRail1 = 0; private tDesp = 0; private tLand = 0; private tSem = 0;
  override async init() {
    await this.clips.load('loss');
    this.sc = this.clips.scene<LossLike>('loss');
    const sc = this.sc;
    this.tErro = this.at('erro'); this.tPar = this.at('parada');
    this.tRail0 = this.at('Às vezes') - 0.3; this.tDesp = this.at('despenca'); this.tRail1 = this.tDesp + 0.15;
    this.tSem = this.at('Sem aviso') - 0.08;
    this.tLand = this.tDesp + (sc.tIn - sc.tDrop);
    // song time keyframes: the chart drawn slowly, the plateau crawled, the drop in real time
    this.k = [[this.e.start, sc.T0 + 0.04], [this.tErro, 9.78], [this.tRail0 + 0.3, 10.2], [this.at('repente'), 10.72], [this.tDesp, sc.tDrop], [this.tLand, sc.tIn]];
  }
  private s(t: number) {
    const sc = this.sc;
    if (t >= this.tSem) return sc.tRoll - 0.1 + (t - this.tSem);
    if (t >= this.tLand) return sc.tIn + (t - this.tLand) * 0.45;
    const k = this.k;
    for (let i = 1; i < k.length; i++) if (t < k[i]![0]) return lerp(k[i - 1]![1], k[i]![1], (t - k[i - 1]![0]) / (k[i]![0] - k[i - 1]![0]));
    return sc.tIn;
  }
  render(f: Frame, out: THREE.WebGLRenderTarget): BlockOut {
    const { renderer, comp } = this.ctx;
    const t = f.t, s = this.s(t), sc = this.sc;
    // the rail: behind and above the spark, looking along the curve
    const clip = sc.camera(s);
    const sp = sc.sparkPos(s);
    // (ahead of the spark, looking back at it: the verse it has written recedes behind it)
    const rail: LCam = { pos: { x: sp.x + 2.4, y: sp.y + 0.7, z: 5.4 }, tgt: { x: sp.x + 0.5, y: sp.y + 0.15, z: 0 }, roll: 0.03, fov: 30 };
    const kr = ease.inOutCubic(prog(t, this.tRail0, this.tRail0 + 0.6)) * (1 - ease.inOutCubic(prog(t, this.tRail1 - 0.1, this.tRail1 + 0.45)));
    const l3 = (a: P3, b: P3, k: number): P3 => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), z: lerp(a.z, b.z, k) });
    const cam: LCam = { pos: l3(clip.pos, rail.pos, kr), tgt: l3(clip.tgt, rail.tgt, kr), roll: lerp(clip.roll, rail.roll, kr), fov: lerp(clip.fov, rail.fov, kr) };
    const post = this.clips.render('loss', s, out, { cam });
    const hp = sc.proj(sp.x, sp.y, sp.z);
    const L = S().ui; L.clear(); const c = L.ctx;
    c.textBaseline = 'alphabetic';
    // "loss = erro", hanging from the spark
    const ke = prog(t, this.tErro - 0.1, this.tErro + 0.4) * (1 - prog(t, this.tRail0 - 0.2, this.tRail0 + 0.1));
    if (hp && ke > 0) callout(c, hp.x, hp.y + 14, hp.x + 60, hp.y + 170, 'o erro do modelo no treino', ke, { title: 'loss = erro', titleSize: 56, size: 22 });
    // the plateau: training steps racing by
    const kp = prog(t, this.tRail0 + 0.3, this.tRail0 + 0.6) * (1 - prog(t, this.tDesp - 0.6, this.tDesp - 0.3));
    if (kp > 0) {
      c.globalAlpha = kp;
      const steps = Math.floor(lerp(3000, 31000, prog(t, this.tRail0 + 0.3, this.tDesp)) / 100) * 100;
      c.textAlign = 'right';
      c.font = font(F.mono(500), 16); c.letterSpacing = '4px'; c.fillStyle = rgba('ash');
      c.fillText('PASSO DE TREINO', W - 120, 120);
      c.letterSpacing = '0px';
      c.font = font(F.mono(400), 64); c.fillStyle = rgba('bone');
      c.fillText(steps.toLocaleString('pt-BR'), W - 120, 190);
      c.font = font(F.mono(400), 22); c.fillStyle = rgba('ash');
      c.fillText('loss ≈ 0,5 · parada', W - 120, 228);
      c.textAlign = 'left';
      const kpl = prog(t, this.tPar, this.tPar + 0.4);
      if (hp && kpl > 0) callout(c, hp.x - 40, hp.y + 30, hp.x - 140, hp.y + 150, 'platô', kpl, { size: 30, color: rgba('bone', 0.95), align: 'right' });
      c.globalAlpha = 1;
    }
    comp.draw(renderer, L.upload(), out);
    const onRail = kr > 0.5;
    return { post: { ...post, frame: 0, flash: onRail ? 0 : post.flash, shake: onRail ? [0, 0] : post.shake, zoom: onRail ? 1 : post.zoom } };
  }
}

/** The ChatGPT prompt, seen from outside: the popups' geometry at s = 17.3 (measured on the frame). */
const POP = { x0: 472, y0: 208, x1: 1145, y1: 465, rowY: [282, 330, 378, 427], claude: { x0: 520, x1: 680, y: 330 } };
/** The distribution the clip shows over "engole" (prompt-data.ts), with the rest of the mass. */
const ENGOLE: [string, number][] = [['engole', 0.44], ['apague', 0.21], ['treine com', 0.18], ['(as outras)', 0.17]];

/**
 * 01.4 "Aí chega o ChatGPT…" — the prompt as the clip types it; "números em cima de cada palavra": each
 * word gets its little distribution, run fast; "é assim que um modelo de linguagem escreve": the one over
 * "engole" grows into a full-screen chart; "uma palavra por vez, sorteada": the bars become one strip and the
 * spark drops on it like a roulette ball, stopping on "engole"; "Engole, 0,44", "Treine com, 0,18" light as
 * they are said. "olha quem aparece em segundo lugar": back to the first word, and the spark circles
 * "Claude, 0.12".
 */
class B014 extends Block {
  private tRep = 0; private tChart = 0; private tStrip = 0; private tDraw = 0; private tEng = 0; private tTre = 0; private tBack = 0; private tSeg = 0;
  override async init() {
    await this.clips.load('prompt1');
    this.tRep = this.at('Repare');
    this.tChart = this.n.nearestBeat(this.at('é assim'));
    this.tStrip = this.at('Uma palavra'); this.tDraw = this.at('sorteada');
    this.tEng = this.at('Engole'); this.tTre = this.at('Treine');
    this.tBack = this.n.nearestBeat(this.at('E olha'));
    this.tSeg = this.at('segundo');
  }
  render(f: Frame, out: THREE.WebGLRenderTarget): BlockOut {
    const t = f.t;
    if (t < this.tChart) return this.prompt(t, out);
    if (t < this.tBack) return this.chart(t, out);
    return this.claude(t, out);
  }
  private prompt(t: number, out: THREE.WebGLRenderTarget): BlockOut {
    // "ChatGPT," typed with its popup; from "Repare", the rest of the line and a popup over every word
    const s = t < this.tRep ? 16.2 + (t - this.e.start) * 0.5 : Math.min(19.7, 17.25 + (t - this.tRep) * 1.2);
    const post = this.clips.render('prompt1', s, out);
    return { post: { ...post, frame: 0 } };
  }
  private chart(t: number, out: THREE.WebGLRenderTarget): BlockOut {
    const { renderer, comp } = this.ctx;
    clearRT(renderer, out, LIN.ink);
    const L = S().ui; L.clear(); const c = L.ctx;
    c.textBaseline = 'alphabetic';
    // the context so far, as typed in the prompt
    c.font = font(F.mono(400), 30); c.fillStyle = rgba('ash');
    c.fillText('p( próximo | ', 160, 170);
    c.fillStyle = rgba('bone', 0.9);
    const ctxText = t >= this.tEng ? 'ChatGPT, não me engole' : 'ChatGPT, não me ';
    const cx0 = 160 + measure('p( próximo | ', F.mono(400), 30);
    c.fillText(ctxText, cx0, 170);
    let cx1 = cx0 + measure(ctxText, F.mono(400), 30);
    if (t < this.tEng) {
      // the slot for the next word: a caret, drawn (Plex Mono has no block glyph)
      c.fillStyle = rgba('signal', 0.5 + 0.5 * Math.round((Math.sin(t * 9) + 1) / 2));
      c.fillRect(cx1, 142, 16, 34);
      cx1 += 22;
    }
    c.fillStyle = rgba('ash'); c.fillText(' )', cx1, 170);
    const grow = ease.outExpo(prog(t, this.tChart, this.tChart + 0.6));
    const strip = ease.inOutCubic(prog(t, this.tStrip, this.tStrip + 0.7));
    const x0 = 160, xW = W - 320, y0 = 290, rowH = 150;
    let acc = 0;
    const segs = ENGOLE.map(([w, p]) => { const s0 = acc; acc += p; return { w, p, s0 }; });
    // bars → one strip
    segs.forEach((g, i) => {
      const barW = xW * 0.78 * g.p / 0.44 * grow;
      const bx = lerp(x0 + 360, x0 + xW * g.s0, strip), by = lerp(y0 + i * rowH, 560, strip);
      const bw = lerp(barW - 360 * 0 , xW * g.p - 4, strip) * (strip > 0 ? 1 : 1);
      const bh = lerp(64, 110, strip);
      const lit = (i === 0 && t >= this.tEng) || (i === 2 && t >= this.tTre);
      c.fillStyle = i === 0 ? rgba(lit ? 'signal' : 'bone', lit ? 1 : 0.85) : rgba(lit ? 'signal' : 'ash', lit ? 0.9 : 0.55);
      c.fillRect(bx, by, Math.max(0, i === 0 && strip < 1 ? bw : bw), bh);
      // labels
      const la = 1;
      c.globalAlpha = la;
      c.font = font(F.archivo(100, 700), lerp(54, 40, strip)); c.fillStyle = lit ? rgba('signal') : rgba('bone', 0.92);
      const lx = lerp(x0, bx + 8, strip), ly = lerp(by + 52, by - 24, strip);
      c.fillText(g.w, lx, ly);
      c.font = font(F.mono(400), lerp(40, 30, strip)); c.fillStyle = lit ? rgba('signal') : rgba('ash');
      const val = g.p.toFixed(2).replace('.', ',');
      if (strip < 0.5) c.fillText(val, bx + bw + 20, by + 48);
      else c.fillText(val, bx + 8, by + bh + 42);
      c.globalAlpha = 1;
    });
    comp.draw(renderer, L.upload(), out);
    // the draw: the spark falls on the strip and rolls like a roulette ball, stopping inside "engole"
    const lb = S().lines; lb.clear();
    if (t >= this.tDraw) {
      const k = prog(t, this.tDraw, this.tEng - 0.3);
      const ball = (tt: number) => {
        const kk = prog(tt, this.tDraw, this.tEng - 0.3);
        const drop = ease.outQuad(prog(tt, this.tDraw, this.tDraw + 0.25));
        const u = kk < 1 ? 0.95 - 0.73 * ease.outCubic(kk) + 0.06 * Math.sin(kk * 22) * (1 - kk) : 0.22;
        const bounce = Math.abs(Math.sin(kk * 18)) * 60 * (1 - kk) ** 2;
        return { x: x0 + xW * u, y: lerp(300, 552, drop) - bounce };
      };
      const b = ball(t);
      sparkParticles(lb, t, (tb) => (tb >= this.tDraw ? ball(tb) : null), { rate: 120, intensity: 0.9, speed: 180, seed: 31 });
      sparkHead(lb, b.x, b.y, t, 1.1, 1);
      void k;
    }
    lb.render(renderer, out);
    return { post: { bloom: 0.5, bloomThreshold: 0.9, ca: 0.5, frame: 0 } };
  }
  private claude(t: number, out: THREE.WebGLRenderTarget): BlockOut {
    const { renderer } = this.ctx;
    const R = S().rt;
    const lt = t - this.tBack;
    const post = this.clips.render('prompt1', 17.3 + lt * 0.03, R[0]!);
    const cam: Cam = { x: 808, y: 350, zoom: lerp(1.25, 1.7, ease.inOutCubic(prog(t, this.tBack, this.tSeg))) };
    camPass(renderer, R[0]!.texture, out, cam);
    // the spark circles "Claude," on "segundo lugar"
    const lb = S().lines; lb.clear();
    const kc = prog(t, this.tSeg - 0.1, this.tSeg + 0.55);
    if (kc > 0) {
      const cc = camToScreen(cam, (POP.claude.x0 + POP.claude.x1) / 2 + 250, POP.claude.y);
      const z = cam.zoom!;
      const rx = 410 * z / 1.7 * 1.02, ry = 34 * z;
      const pts: P2[] = [];
      for (let i = 0; i <= 96; i++) { const a = -2.2 + (i / 96) * (Math.PI * 2 + 0.5); pts.push({ x: cc.x + Math.cos(a) * rx * (1 + 0.02 * Math.sin(a * 3)), y: cc.y + Math.sin(a) * ry }); }
      const r = ease.inOutCubic(kc);
      let head: P2 | null = null;
      const n = Math.floor(r * (pts.length - 1));
      for (let i = 1; i <= n; i++) lb.seg2(pts[i - 1]!.x, pts[i - 1]!.y, pts[i]!.x, pts[i]!.y, 2.4, hot(1.8), 1);
      head = pts[n] ?? null;
      if (head && kc < 1) sparkHead(lb, head.x, head.y, t, 0.8, 1);
    }
    lb.render(renderer, out);
    return { post: { ...post, frame: 0, shake: [0, 0], zoom: 1, flash: 0 } };
  }
}

export const C01: Record<string, BlockFactory> = {
  '01.1': (e) => new B011(e),
  '01.2': (e) => new B012(e),
  '01.3': (e) => new B013(e),
  '01.4': (e) => new B014(e),
};
