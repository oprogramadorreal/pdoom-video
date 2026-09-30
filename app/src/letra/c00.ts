// Chapter 00 · Tudo é código. The clip has rewound to its first frame; the explanation starts right there.
import * as THREE from 'three';
import type { Frame, PostOverrides } from '../engine/scene';
import { W, H, clearRT } from '../engine/gl';
import { LIN, rgba } from '../engine/palette';
import { F, font, measure } from '../engine/type';
import { clamp, ease, lerp, prog, pulse } from '../engine/util';
import { Block, type BlockFactory, type BlockOut } from './block';
import { CLIP_END } from './soundtrack';
import { S, camPass, mixRgba, RX1, RY, type Cam } from './kit';
import { xray } from './xray';
import { CLIP_FILES, docIndex, drawDoc, drawListing, lineCount, source } from './code';
import { callout, hot, outline, traceContours, typed, type P2 } from './draw';
import { sparkHead } from '../scenes/_motifs';
import { Opening } from './opening';
import { FilmStrip } from './filmstrip';

/**
 * 00.1 "Você acabou de ouvir uma música de amor sobre o fim do mundo." The clip's first frame (black, the
 * crop marks), and on it the opening (opening.ts): the spark draws a heart from the first word, it beats on
 * "amor", rounds into the Earth, cracks on "fim do mundo" and blows up on the cut to 00.2. No ruler yet: it
 * comes in at the end of 00.2, just before it is first used.
 */
class B001 extends Block {
  private op!: Opening;
  override async init() { await this.clips.load('open'); this.op = new Opening(this.n, this.e.end); }
  render(f: Frame, out: THREE.WebGLRenderTarget): BlockOut {
    const post = this.clips.render('open', 0, out);
    return { post: { ...post, ...this.op.render(this.ctx, f.t, out) }, regua: { draw: 0, pos: 0 } };
  }
}

/** A clip moment shown in 00.2, with the file whose code draws it. */
interface Shot { id: string; s: number; rate: number; file: string; cam?: Cam }
const SHOTS: Shot[] = [
  { id: 'open', s: 8.2, rate: 0.4, file: 'open.ts' },
  { id: 'room', s: 25.42, rate: 0.3, file: 'room.ts' },
  { id: 'shoggoth', s: 34.6, rate: 0.4, file: 'shoggoth-glsl.ts' },
  { id: 'paperclips', s: 98.45, rate: 0.35, file: 'paperclips-glsl.ts' },
];

/**
 * 00.2 "E tudo que você viu no vídeo é código…" — the last of the Earth's debris; on "tudo que você viu",
 * the clip flashes past, one plate a beat; on "é código" the shoggoth's x-ray band crosses the last one and
 * leaves only its own source behind it (the picture gone, the listing scrolling). "Nenhum quadro foi…": the code recedes
 * and a strip of film slides in, four frames, one per way of making a picture (filmstrip.ts), each drawn
 * as the voice names it and crossed out as it denies it; "After Effects" is struck through. "vinte mil
 * linhas": the strip leaves and the camera flies down the whole listing while a counter climbs, through
 * 20.000 on "vinte mil", to the real count; the flight lands on `open.ts`, where TypeScript and a GLSL block
 * get their callouts; the shader stands beside what it draws; both shrink into a page at localhost; "Clód
 * Opus cinco ponto cinco" is traced by the spark. The ruler draws itself in on "inteligência artificial",
 * just before "No final" sends the spark to its end.
 */
class B002 extends Block {
  private count = lineCount(CLIP_FILES);
  private name: P2[][] = [];
  private nameBox = { x0: 0, x1: 0, y0: 0, y1: 0 };
  private opening!: Opening;
  private strip!: FilmStrip;
  // times
  private tRecap: number[] = [];
  private tX0 = 0; private tX1 = 0; private tStrip = 0;
  private tFlight = 0; private tLand = 0; private tMil = 0; private tOdo1 = 0; private tTS = 0; private tGLSL = 0;
  private tShader = 0; private tPage = 0; private tWeb = 0; private tAuthor = 0; private tName = 0; private tFinal = 0;
  private tRuler = 0;
  private landAt = 0;

  override async init() {
    await Promise.all(['open', ...SHOTS.map((s) => s.id)].map((id) => this.clips.load(id)));
    const n = this.n;
    const nb = (t: number) => n.nextBeat(t - 0.02);
    this.opening = new Opening(n, this.e.start);
    // the recap: a plate per beat from "tudo"; the last one is x-rayed on "é código"
    const b0 = nb(this.at('tudo'));
    this.tRecap = [b0, nb(b0 + 0.1), nb(nb(b0 + 0.1) + 0.1), nb(nb(nb(b0 + 0.1) + 0.1) + 0.1)];
    this.tX0 = this.at('é código') - 0.06; this.tX1 = this.at('código') + 0.42;
    this.tFlight = n.nearestBeat(this.at('São'));
    // the film strip: each way of making a picture, named and crossed out
    this.tStrip = this.at('Nenhum');
    const tIcon = [this.at('desenhado'), this.at('filmado'), this.at('gerado'), this.at('programa')];
    this.strip = new FilmStrip({
      tIn: this.tStrip, tIcon, tSnap: tIcon[1]! + 0.38,
      tCross: [this.at('mão') + 0.02, tIcon[1]! + 0.6, this.at('vídeo', 1), this.at('teve')],
      tAE: this.at('After'), tAEx: this.at('Effects') + 0.12, tOut: this.tFlight,
    });
    // the flight through the code and the counter
    this.tMil = this.at('mil');
    this.tOdo1 = this.tMil + (this.count - 20000) * (this.tMil - this.tFlight) / 20000;
    this.tTS = this.at('TypeScript'); this.tGLSL = this.at('GLSL');
    this.tLand = this.tTS - 0.05;
    this.landAt = docIndex('open.ts', 30);
    this.tShader = this.at('shaders') - 0.35;
    this.tPage = n.prevBeat(this.at('rodando')); this.tWeb = this.at('página');
    this.tAuthor = this.at('Escritas'); this.tName = this.at('Clód'); this.tFinal = this.at('No final');
    // the ruler: in on the downbeat at "inteligência artificial", once the page has moved aside
    this.tRuler = n.prevBeat(this.at('artificial'));
    // the name, traced by the spark
    const fam = F.archivo(100, 700), size = 150;
    const text = 'Claude Opus 5.5';
    const w = measure(text, fam, size);
    const x = W / 2 - w / 2, y = 560;
    this.name = outline(text, fam, size, x, y);
    this.nameBox = { x0: x, x1: x + w, y0: y - size * 0.72, y1: y };
  }

  render(f: Frame, out: THREE.WebGLRenderTarget): BlockOut {
    const t = f.t;
    const r = t < this.tFlight ? this.partSheet(f, out) : t < this.tPage ? this.partCode(f, out) : this.partPage(f, out);
    return { ...r, regua: { ...r.regua, draw: prog(t, this.tRuler, this.tRuler + 1.5, ease.inOutCubic) } };
  }

  /** Which clip moment is up at t (the recap, then the x-rayed plate held behind the strip), and its song time. */
  private shotAt(t: number): { shot: Shot; s: number } {
    let i = 0, t0 = this.tRecap[0]!;
    for (let k = 0; k < 4; k++) if (t >= this.tRecap[k]!) { i = k; t0 = this.tRecap[k]!; }
    const shot = SHOTS[i]!;
    // (behind the strip the plate slows to a drift)
    const s = t < this.tStrip ? shot.s + (t - t0) * shot.rate : shot.s + (this.tStrip - t0) * shot.rate + (t - this.tStrip) * shot.rate * 0.4;
    return { shot, s };
  }

  // ---------------------------------------------------------------- 1. the blast's debris, recap, x-ray, the film strip
  private partSheet(f: Frame, out: THREE.WebGLRenderTarget): BlockOut {
    const { renderer } = this.ctx;
    const t = f.t;
    if (t < this.tRecap[0]!) {
      const post = this.clips.render('open', 0, out);
      return { post: { ...post, ...this.opening.render(this.ctx, t, out) } };
    }
    const sh = this.shotAt(t);
    const R = S().rt;
    const clipPost = this.clips.render(sh.shot.id, sh.s, R[0]!);
    const flash = t < this.tX0 ? pulse(t, [...this.tRecap].reverse().find((x) => t >= x) ?? 0, 0.06) : 0;
    camPass(renderer, R[0]!.texture, R[1]!, { zoom: 1 + 0.03 * prog(t, this.tRecap[0]!, this.tFlight) });
    // the code over it: its own source, scrolling
    const L = S().ui; L.clear();
    const file = source(sh.shot.file);
    const scroll = 8 + (t - this.tRecap[0]!) * 3.2;
    drawListing(L.ctx, file, { x: 48, y: 60, w: W - 60, h: H - 120, scroll, size: 17, colors: { code: rgba('bone', 0.9), comment: rgba('ash', 0.75), glsl: rgba('ember', 1), num: rgba('ash', 0.45) } });
    const band = t >= this.tX0 && t < this.tX1;
    const bx = lerp(-120, W + 120, ease.inOutQuad(prog(t, this.tX0, this.tX1)));
    // once the strip comes, the code recedes: dimmer, softer, a little further away
    const back = ease.inOutCubic(prog(t, this.tStrip - 0.05, this.tStrip + 0.5));
    // (behind the band the picture is gone: only its code is left)
    xray(renderer, R[1]!.texture, L.upload(), back > 0 ? R[2]! : out, { x: bx, w: 70, on: band ? 1 : 0, all: t >= this.tX1 ? 1 : 0, t, dim: 0.07, plain: 1 });
    if (back > 0) camPass(renderer, R[2]!.texture, out, { dim: lerp(1, 0.3, back), blur: 2.5 * back, zoom: lerp(1, 0.965, back) });
    if (band) this.bandHeader(out, bx);
    let post: PostOverrides = { ...pick(clipPost, 'bloom', 'bloomThreshold'), flash: 0.35 * flash, ca: 0.8, shake: [0, 0], frame: 1 - prog(t, this.tX0, this.tX0 + 0.5, ease.inOutCubic) };
    if (t >= this.tStrip - 0.1) post = { ...post, bloom: 0.45, bloomThreshold: 0.9, ca: 0.6, ...this.strip.render(this.ctx, t, out) };
    return { post };
  }

  /** The x-ray's little header (as in the shoggoth plate), riding the band. */
  private bandHeader(out: THREE.WebGLRenderTarget, bx: number) {
    const L = S().ui2; L.clear(); const c = L.ctx;
    c.font = font(F.mono(500), 13); c.letterSpacing = '2px';
    c.fillStyle = rgba('signal');
    const hx = clamp(bx - 60, 70, W - 300);
    c.fillText(`XR ${String(Math.round(clamp(bx / W) * 100)).padStart(3, '0')}%`, hx, 110);
    c.fillStyle = rgba('bone', 0.7);
    c.fillText('MODO RAIO X · CÓDIGO-FONTE', hx, 130);
    c.letterSpacing = '0px';
    this.ctx.comp.draw(this.ctx.renderer, L.upload(), out);
  }

  // ---------------------------------------------------------------- 2. the code, all of it
  private partCode(f: Frame, out: THREE.WebGLRenderTarget): BlockOut {
    const { renderer, comp } = this.ctx;
    const t = f.t;
    const L = S().ui; L.clear(); const c = L.ctx;
    // the flight: from the top of the listing down to open.ts, fast, braking into the landing
    const k = prog(t, this.tFlight, this.tLand);
    const scroll = lerp(0, this.landAt, ease.inOutQuart(k)) + (t > this.tLand ? (t - this.tLand) * 0.6 : 0);
    // after landing, the camera eases in on the region (TypeScript first, then the GLSL block)
    const zin = ease.inOutCubic(prog(t, this.tShader, this.tShader + 0.8));
    c.save();
    const zoom = lerp(1, 1.32, zin);
    const cx = lerp(W / 2, W / 2 + 60, zin), cy = lerp(H / 2, H / 2 + 110, zin);
    c.translate(W / 2, H / 2); c.scale(zoom, zoom); c.translate(-cx, -cy);
    const lh = drawDoc(c, { x: 60, y: 40, w: zin > 0 ? 1080 : W - 120, h: H - 80, scroll, size: 18 });
    c.restore();
    // callouts from the ends of two lines of open.ts (horizontal leaders into the empty right side), and
    // brackets in the gutter: the TypeScript around the shader, the GLSL block itself
    const src = source('open.ts');
    const lineY = (n: number) => 40 + (docIndex('open.ts', n) - scroll + 0.85) * lh - 6;
    const lineEnd = (n: number) => 60 + 18 * 4.2 + measure(src.lines[n - 1]!, F.mono(400), 18) + 16;
    const toScreen = (x: number, y: number) => ({ x: W / 2 + (x - cx) * zoom, y: H / 2 + (y - cy) * zoom });
    const out1 = 1 - prog(t, this.tShader, this.tShader + 0.3);
    const glEnd = src.kind.findIndex((k, i) => i > 45 && k !== 'glsl');
    const bracket = (n0: number, n1: number, k: number, col: string) => {
      if (k <= 0) return;
      const a = toScreen(44, lineY(n0) - 14), b = toScreen(44, lineY(n1) + 6);
      c.fillStyle = col;
      c.fillRect(a.x, a.y, 2, (b.y - a.y) * ease.outCubic(clamp(k)));
    };
    if (t >= this.tTS) {
      const kk = prog(t, this.tTS, this.tTS + 0.5);
      bracket(30, 44, kk, rgba('bone', 0.6 * out1));
      const a = toScreen(lineEnd(42), lineY(42));
      callout(c, a.x, a.y, 1240, a.y, 'arquivos .ts', kk, { title: 'TypeScript', alpha: out1 });
    }
    if (t >= this.tGLSL) {
      const kk = prog(t, this.tGLSL, this.tGLSL + 0.5);
      bracket(45, glEnd, kk, rgba('ember', 0.9 * (1 - 0.5 * zinK(t, this.tShader))));
      const a = toScreen(lineEnd(45), lineY(45));
      callout(c, a.x, a.y, 1240, a.y, 'blocos /* glsl */', kk, { title: 'GLSL', color: rgba('ember', 0.95), alpha: out1 });
    }
    this.drawCounter(c, t);
    // (replace: the listing's transparent background comes out black)
    comp.draw(renderer, L.upload(), out, { mode: 'replace' });
    // the shader's output beside it: the sheet it paints, live
    if (t >= this.tShader) {
      const wk = ease.outExpo(prog(t, this.tShader + 0.2, this.tShader + 0.8));
      if (wk > 0) {
        const R = S().rt;
        this.clips.render('open', 4.4 + (t - this.tShader) * 0.3, R[0]!);
        const rx0 = 1180, ry0 = 300, rw = 640, rh = 360;
        camPass(renderer, R[0]!.texture, out, { x: 760, y: 470, zoom: 1.5, rect: [rx0, ry0 + (1 - wk) * 40, rx0 + rw, ry0 + rh + (1 - wk) * 40], alpha: wk }, true);
        const L2 = S().ui2; L2.clear(); const c2 = L2.ctx;
        c2.strokeStyle = rgba('bone', 0.5 * wk); c2.lineWidth = 1; c2.strokeRect(rx0 + 0.5, ry0 + 0.5, rw, rh);
        c2.font = font(F.mono(400), 16); c2.fillStyle = rgba('ash', wk);
        c2.fillText('BG_FRAG → a folha quadriculada do começo', rx0, ry0 + rh + 30);
        comp.draw(renderer, L2.upload(), out);
      }
    }
    return { post: { bloom: 0.45, bloomThreshold: 0.95, ca: 0.6, frame: 0, zoom: 1 + 0.012 * pulse(t, this.tOdo1, 0.1) } };
  }

  /**
   * The counted lines at t: speeding up from the start of the flight to 20.000 on "mil", then slowing at the
   * same rate into the real count (a smooth landing, during "linhas").
   */
  private countAt(t: number) {
    const T1 = this.tMil - this.tFlight, T2 = this.tOdo1 - this.tMil, r = 40000 / T1;
    if (t <= this.tFlight) return 0;
    if (t < this.tMil) return (r / (2 * T1)) * (t - this.tFlight) ** 2;
    const x = Math.min(t - this.tMil, T2);
    return 20000 + r * x - (r / (2 * T2)) * x * x;
  }

  /**
   * The counter: every line of the clip's code, counted while the camera flies down the listing. It climbs
   * (no random digits), passes 20.000 as the voice says "vinte mil", lands on the real count and holds it;
   * on "TypeScript" it fades for the callouts.
   */
  private drawCounter(c: CanvasRenderingContext2D, t: number) {
    const kin = ease.outCubic(prog(t, this.tFlight, this.tFlight + 0.25));
    const kout = ease.inOutCubic(prog(t, this.tTS + 0.05, this.tTS + 0.4));
    const a = kin * (1 - kout);
    if (a <= 0) return;
    const v = Math.min(this.count, Math.floor(this.countAt(t) + 1e-6));
    const land = pulse(t, this.tOdo1, 0.14);
    const cy = H / 2 + 20 + 30 * kout;
    // a dark band across the listing, so the number reads over the code flying past
    const g = c.createLinearGradient(0, cy - 290, 0, cy + 190);
    g.addColorStop(0, rgba('ink', 0)); g.addColorStop(0.28, rgba('ink', 0.92 * a)); g.addColorStop(0.75, rgba('ink', 0.92 * a)); g.addColorStop(1, rgba('ink', 0));
    c.fillStyle = g; c.fillRect(0, cy - 290, W, 480);
    c.save();
    c.globalAlpha = a;
    c.textBaseline = 'alphabetic'; c.textAlign = 'center';
    // the digits in fixed cells (they never jitter sideways while they run)
    const fam = F.archivo(100, 800), size = 210 * (1 + 0.035 * land);
    const cell = Math.max(...'0123456789'.split('').map((d) => measure(d, fam, size)));
    const dot = measure('.', fam, size) * 1.2;
    const txt = v.toLocaleString('pt-BR');
    const w = [...txt].reduce((s, ch) => s + (ch === '.' ? dot : cell), 0);
    c.font = font(fam, size);
    c.fillStyle = land > 0.02 ? mixRgba(rgba('bone'), rgba('signal'), land) : rgba('bone');
    let x = W / 2 - w / 2;
    for (const ch of txt) { const cw = ch === '.' ? dot : cell; c.fillText(ch, x + cw / 2, cy + 40); x += cw; }
    c.font = font(F.mono(500), 24); c.letterSpacing = '8px'; c.fillStyle = rgba('ash', 0.95);
    c.fillText('LINHAS DE CÓDIGO', W / 2 + 4, cy + 110);
    c.font = font(F.mono(400), 19); c.letterSpacing = '3px'; c.fillStyle = rgba('ash', 0.7);
    c.fillText(`app/src · ${CLIP_FILES.length} arquivos`, W / 2 + 1.5, cy - 150);
    c.restore();
  }

  // ---------------------------------------------------------------- 3. a page, and who wrote it
  private partPage(f: Frame, out: THREE.WebGLRenderTarget): BlockOut {
    const { renderer, comp } = this.ctx;
    const t = f.t;
    const R = S().rt;
    // the page: the code (left) and the clip running (right), shrinking into a frame with its address
    const k = ease.inOutCubic(prog(t, this.tPage, this.tPage + 0.6));
    const away = ease.inOutCubic(prog(t, this.tAuthor, this.tAuthor + 0.9));
    const nameK = prog(t, this.tName - 0.3, this.tName);
    const pw = lerp(W, 1180, k) * lerp(1, 0.62, away), ph = pw * 9 / 16;
    const px = lerp(W / 2, W / 2, k) - lerp(0, 520, away), py = lerp(H / 2, H / 2 - 40, k) - lerp(0, 150, away);
    const rect: [number, number, number, number] = [px - pw / 2, py - ph / 2, px + pw / 2, py + ph / 2];
    // the page's content: the clip playing from its start
    this.clips.render('open', 3.4 + (t - this.tPage) * 0.8, R[0]!);
    clearRT(renderer, out, LIN.ink);
    camPass(renderer, R[0]!.texture, out, { rect, alpha: 1 - 0.85 * nameK }, true);
    const L = S().ui; L.clear(); const c = L.ctx;
    const bar = 34 * (pw / W) + 8;
    c.globalAlpha = 1 - 0.85 * nameK;
    c.strokeStyle = rgba('bone', 0.55); c.lineWidth = 1;
    c.strokeRect(rect[0] + 0.5, rect[1] - bar + 0.5, pw, ph + bar);
    c.beginPath(); c.moveTo(rect[0], rect[1] + 0.5); c.lineTo(rect[2], rect[1] + 0.5); c.stroke();
    c.font = font(F.mono(400), Math.max(12, 20 * (pw / W) + 4)); c.fillStyle = rgba('bone', 0.85);
    c.textBaseline = 'middle';
    typed(c, 'localhost:5173/?lang=pt-BR', rect[0] + 14, rect[1] - bar / 2, prog(t, this.tWeb - 0.1, this.tWeb + 0.5), { caret: true });
    c.globalAlpha = 1;
    // "Escritas por uma inteligência artificial:" — a comment typed where the name will go
    c.font = font(F.mono(400), 24); c.fillStyle = rgba('ash', 0.9);
    c.textBaseline = 'alphabetic';
    typed(c, '// escrito por', this.nameBox.x0, this.nameBox.y0 - 60, prog(t, this.tAuthor + 0.3, this.tAuthor + 0.9));
    // the name fills once its outline is closed
    const fillK = prog(t, this.tName + 1.5, this.tName + 1.8);
    if (fillK > 0) {
      c.globalAlpha = fillK;
      c.font = font(F.archivo(100, 700), 150); c.fillStyle = rgba('bone');
      c.fillText('Claude Opus 5.5', this.nameBox.x0, this.nameBox.y1);
      c.globalAlpha = 1;
    }
    comp.draw(renderer, L.upload(), out);
    // the spark traces it; on "No final" it leaves the name and runs down to the end of the ruler
    const lb = S().lines; lb.clear();
    const kk = (t - this.tName) / 1.55;
    traceContours(lb, this.name, kk, t, { k0: 0, dur: 0.55, stagger: 0.035, width: 2.4, alpha: 1 - prog(t, this.tName + 1.8, this.tName + 2.3) });
    const run = prog(t, this.tFinal, this.tFinal + 0.75);
    if (run > 0 && run < 1) {
      const p0 = { x: this.nameBox.x1 + 8, y: this.nameBox.y1 - 30 }, p1 = { x: RX1 + 40, y: 700 }, p2 = { x: RX1, y: RY };
      const at = (u: number) => { const v = 1 - u; return { x: v * v * p0.x + 2 * v * u * p1.x + u * u * p2.x, y: v * v * p0.y + 2 * v * u * p1.y + u * u * p2.y }; };
      const u = ease.inOutCubic(run);
      for (let i = 1; i <= 18; i++) {
        const a = at(Math.max(0, u - (i - 1) * 0.025)), b = at(Math.max(0, u - i * 0.025));
        lb.seg2(a.x, a.y, b.x, b.y, 2.2 * (1 - i / 19), hot(2.2 * (1 - i / 19)), 1 - i / 19);
      }
      const h = at(u);
      sparkHead(lb, h.x, h.y, t, 0.9, 1);
    }
    lb.render(renderer, out);
    const mark: [number, number] = [CLIP_END, prog(t, this.tFinal + 0.7, this.tFinal + 0.8) * (1 - 0.6 * prog(t, this.tFinal + 1.2, this.tFinal + 1.8))];
    return { post: { bloom: 0.5, bloomThreshold: 0.9, ca: 0.6, frame: 0 }, regua: { mark } };
  }
}

const zinK = (t: number, t0: number) => ease.inOutCubic(prog(t, t0, t0 + 0.8));

/** Some keys of a post override. */
function pick(p: PostOverrides, ...keys: (keyof PostOverrides)[]): PostOverrides {
  const o: Record<string, unknown> = {};
  for (const k of keys) if (p[k] !== undefined) o[k] = p[k];
  return o as PostOverrides;
}

export const C00: Record<string, BlockFactory> = {
  '00.1': (e) => new B001(e),
  '00.2': (e) => new B002(e),
};
