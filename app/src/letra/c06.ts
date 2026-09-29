// Chapter 06 · Como uma IA fez este vídeo.
import type * as THREE from 'three';
import type { Frame } from '../engine/scene';
import { W, H, clearRT } from '../engine/gl';
import { LIN, rgba } from '../engine/palette';
import { F, font, measure } from '../engine/type';
import { clamp, ease, lerp, prog, pulse, TAU } from '../engine/util';
import { drawMask2D, MASK, sparkHead, sparkParticles } from '../scenes/_motifs';
import { Block, type BlockFactory, type BlockOut } from './block';
import { S, camPass, fmtTime, rulerX, RY } from './kit';
import { drawListing, source } from './code';
import { callout, hot, typed, type P2 } from './draw';
import { caption, clipPost, remap } from './c02';
import { CLIP_END, MIX_AT } from './soundtrack';

// ---------------------------------------------------------------- 06.1
/** A clip moment for each part of the sentence: [first word, entry, song from, song to]. */
const RECAP: [string, string, number, number][] = [
  ['Máquinas', 'loss', 10.72, 11.6],
  ['que a gente', 'room', 26.8, 27.3],
  ['que sorriem', 'shoggoth', 29.4, 29.85],
  ['e cujos', 'paperclips', 97.9, 98.9],
];
/**
 * 06.1 "Máquinas que aprendem rápido…" — the chapter's four ideas in four remounted shots: the loss
 * plunging, the question cards from the slot, the mask smiling, the clip duplicating. "É disso que a
 * música fala": the outro's end card, from "= ∞" to "NaN¹ · estimativa não mais definida", in two seconds;
 * the counter breaks without a word, and NaN lights on the ruler.
 */
class B061 extends Block {
  private cuts: number[] = []; private tCard = 0;
  override async init() {
    await Promise.all([...RECAP.map((r) => r[1]), 'outro'].map((id) => this.clips.load(id)));
    this.cuts = RECAP.map(([q], i) => (i === 0 ? this.e.start : this.at(q) - 0.05));
    this.tCard = this.at('É disso') - 0.05;
  }
  render(f: Frame, out: THREE.WebGLRenderTarget): BlockOut {
    const t = f.t;
    if (t >= this.tCard) {
      const post = this.clips.render('outro', remap(t, [[this.tCard, 150.85], [this.endOf('música fala.') - 0.1, 153.2], [this.e.end, 153.3]]), out);
      return { post: clipPost(post) };
    }
    const i = this.cuts.filter((x) => t >= x).length - 1;
    const [, id, s0, s1] = RECAP[i]!;
    const t1 = i + 1 < this.cuts.length ? this.cuts[i + 1]! : this.tCard;
    return { post: clipPost(this.clips.render(id, lerp(s0, s1, prog(t, this.cuts[i]!, t1)), out)) };
  }
}

// ---------------------------------------------------------------- 06.2
/** Adjustments asked for while the clip was made, as TREATMENT.md records them (rev. 2 to 5). */
const REVISIONS = [
  'rev. 2 · saiu o olho humano realista',
  'rev. 2 · saiu a placa azul do blues',
  'rev. 3 · RLHF: a mesa inclinada',
  'rev. 4 · marcas de corte só nas pontas',
  'rev. 5 · adesivos um terço mais escuros',
  'rev. 5 · kerning, aspas curvas, sem contorno',
];
const LOOP = ['descreve a ideia', 'a IA escreve o código', 'ele assiste', 'pede ajustes'];

/**
 * 06.2 "E a promessa do começo…" — the end of the ruler flashes (where 00.2 pointed); "Não foi com um
 * prompt só": one prompt, typed — "faça um clipe pra essa música" — and struck out. "O clipe original, em
 * inglês": its repository, "github.com/mexicat/pdoom-video · Giacomo Magnanini + Claude", its first
 * commit. "conversando com o Clód, cena por cena": a loop — describe, the AI writes the code, he watches,
 * he asks for adjustments — each step lit on its words, while the real adjustments scroll by.
 */
class B062 extends Block {
  private tPrompt = 0; private tRepo = 0; private tLoop = 0; private tSteps: number[] = [];
  override init() {
    this.tPrompt = this.at('Não foi'); this.tRepo = this.n.nearestBeat(this.at('O clipe original'));
    this.tLoop = this.at('cena por cena') - 0.1;
    this.tSteps = [this.at('ele descrevia'), this.at('a I-Á escrevia'), this.at('ele assistia'), this.at('pedia')];
  }
  render(f: Frame, out: THREE.WebGLRenderTarget): BlockOut {
    const { renderer, comp } = this.ctx;
    const t = f.t;
    clearRT(renderer, out, LIN.ink);
    const L = S().ui; L.clear(); const c = L.ctx;
    c.textBaseline = 'alphabetic';
    let mark: [number, number] | undefined;
    if (t < this.tRepo) {
      mark = [CLIP_END, 1 - prog(t, this.e.start + 0.8, this.e.start + 1.4)];
      // the promise, as a question
      const kq = ease.outCubic(prog(t, this.at('como uma') - 0.1, this.at('como uma') + 0.4)) * (1 - prog(t, this.tPrompt - 0.2, this.tPrompt));
      if (kq > 0) {
        c.font = font(F.archivo(100, 800), 92); c.fillStyle = rgba('bone', kq);
        const q = 'como uma IA fez este vídeo?';
        c.fillText(q, W / 2 - measure(q, F.archivo(100, 800), 92) / 2, 560);
      }
      const k = prog(t, this.tPrompt, this.tPrompt + 0.8);
      if (k > 0) {
        c.strokeStyle = rgba('bone', 0.5); c.lineWidth = 1.2; c.strokeRect(360, 470, 1200, 110);
        c.font = font(F.mono(400), 44); c.fillStyle = rgba('bone');
        c.fillText('›', 390, 540);
        typed(c, 'faça um clipe pra essa música', 440, 540, k, { caret: k < 1 });
        const ks = prog(t, this.at('só.') - 0.05, this.at('só.') + 0.25);
        c.fillStyle = rgba('signal'); c.fillRect(430, 522, 820 * ease.outCubic(ks), 5);
        if (ks > 0) { c.font = font(F.mono(400), 24); c.fillStyle = rgba('signal', ks); c.fillText('não foi assim', 1270, 540); }
      }
    } else {
      // the repository and the conversation loop
      const kr = ease.outCubic(prog(t, this.tRepo, this.tRepo + 0.5));
      c.globalAlpha = kr;
      c.font = font(F.mono(500), 20); c.letterSpacing = '3px'; c.fillStyle = rgba('ash');
      c.fillText('O CLIPE ORIGINAL, EM INGLÊS', 150, 140); c.letterSpacing = '0px';
      c.font = font(F.archivo(100, 700), 52); c.fillStyle = rgba('bone');
      c.fillText('github.com/mexicat/pdoom-video', 150, 205);
      c.font = font(F.mono(400), 26); c.fillStyle = rgba('bone', 0.85);
      c.fillText('Giacomo Magnanini + Claude Opus 5.5 · setembro de 2026', 150, 250);
      c.font = font(F.mono(400), 22); c.fillStyle = rgba('ash');
      c.fillText('c4299a2  I’m Upping My P(doom): code-rendered music video', 150, 300);
      c.globalAlpha = 1;
      // the loop: four stations around a circle, the spark running between them
      const cx = 560, cy = 660, R = 220;
      const kl = ease.outCubic(prog(t, this.tLoop, this.tLoop + 0.6));
      if (kl > 0) {
        c.strokeStyle = rgba('bone', 0.35 * kl); c.lineWidth = 1.3;
        c.beginPath(); c.arc(cx, cy, R, 0, TAU * kl); c.stroke();
        LOOP.forEach((s, i) => {
          const a = -Math.PI / 2 + (i / 4) * TAU;
          const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
          const lit = t >= this.tSteps[i]! && (i === 3 || t < this.tSteps[i + 1]!);
          c.fillStyle = lit ? rgba('signal') : rgba('bone', 0.8 * kl);
          c.beginPath(); c.arc(x, y, 9, 0, TAU); c.fill();
          c.font = font(F.mono(500), 26); c.fillStyle = lit ? rgba('signal') : rgba('bone', 0.7 * kl);
          const w = measure(s, F.mono(500), 26);
          const tx = i === 1 ? x + 26 : i === 3 ? x - 26 - w : x - w / 2;
          const ty = i === 0 ? y - 26 : i === 2 ? y + 46 : y + 9;
          c.fillText(s, tx, ty);
        });
        c.font = font(F.mono(400), 20); c.fillStyle = rgba('ash', kl);
        c.fillText('cena por cena', cx - measure('cena por cena', F.mono(400), 20) / 2, cy + 7);
      }
      // the adjustments, as recorded: they arrive with the loop, and light up on "pedia ajustes"
      const ka = prog(t, this.tLoop + 0.3, this.tLoop + 0.8);
      if (ka > 0) {
        const hot = prog(t, this.tSteps[3]!, this.tSteps[3]! + 0.3);
        c.font = font(F.mono(500), 18); c.letterSpacing = '3px'; c.fillStyle = rgba('ash', ka);
        c.fillText('AJUSTES PEDIDOS · docs/TREATMENT.md', 1120, 470); c.letterSpacing = '0px';
        REVISIONS.forEach((r, i) => {
          c.font = font(F.mono(400), 24); c.fillStyle = hot > 0 ? mixC(rgba('bone', 0.45), rgba('signal'), hot) : rgba('bone', 0.45);
          typed(c, r, 1120, 525 + i * 48, prog(t, this.tLoop + 0.4 + i * 0.35, this.tLoop + 0.75 + i * 0.35));
        });
      }
    }
    comp.draw(renderer, L.upload(), out);
    // the spark running round the loop
    const lb = S().lines; lb.clear();
    if (t >= this.tSteps[0]!) {
      const at = (tt: number): P2 => {
        let i = 0; for (let k = 0; k < 4; k++) if (tt >= this.tSteps[k]!) i = k;
        const t0 = this.tSteps[i]!, t1 = this.tSteps[i + 1] ?? this.e.end;
        const a = -Math.PI / 2 + ((i + ease.inOutCubic(clamp((tt - t0) / Math.max(0.3, (t1 - t0) * 0.6)))) / 4) * TAU;
        return { x: 560 + Math.cos(a) * 220, y: 660 + Math.sin(a) * 220 };
      };
      const p = at(t);
      sparkParticles(lb, t, (tb) => (tb >= this.tSteps[0]! ? at(tb) : null), { rate: 60, speed: 160, seed: 61 });
      sparkHead(lb, p.x, p.y, t, 0.9, 1);
    }
    lb.render(renderer, out);
    return { post: { bloom: 0.45, ca: 0.5, frame: 0 }, regua: mark ? { mark } : undefined };
  }
}

// ---------------------------------------------------------------- 06.3
/**
 * 06.3 "O truque é que cada quadro é uma função do tempo." — quadro = render(t), in type, t running. "Você
 * dá o segundo exato da música": the ruler becomes the control — the spark drags t back and forth and the
 * frame above follows, with render(42,37) under it. "Sempre a mesma": the same t twice, side by side, "=".
 * "pausar, voltar e desenhar por cima": the pause, a step back on the ruler, and the frame splits into its
 * layers — the clip, this explanation's drawings, the ruler — like sheets of glass.
 */
class B063 extends Block {
  private tFn = 0; private tSec = 0; private tSame = 0; private tPause = 0; private tBack = 0; private tDraw = 0;
  override async init() {
    // the scrub runs through the clip from 0:11 to 1:02: every scene on the way
    await Promise.all(this.clips.entries.filter((e) => e.end > 10 && e.start < 63).map((e) => this.clips.load(e.id)));
    this.tFn = this.e.start; this.tSec = this.at('Você dá'); this.tSame = this.at('Sempre');
    this.tPause = this.at('pausar'); this.tBack = this.at('voltar'); this.tDraw = this.at('desenhar');
  }
  /** The song position the spark drags through (s). */
  private scrub(t: number) {
    if (t < this.tSec) return 34.8;
    if (t < this.tSame) return remap(t, [[this.tSec, 34.8], [this.tSec + 1.2, 62.3], [this.tSec + 2.3, 11.1], [this.tSame - 0.3, 34.8]]);
    if (t < this.tBack) return 34.8;
    return remap(t, [[this.tBack, 34.8], [this.tBack + 0.6, 30.2]]);
  }
  render(f: Frame, out: THREE.WebGLRenderTarget): BlockOut {
    const { renderer, comp } = this.ctx;
    const t = f.t;
    const s = this.scrub(t);
    const R = S().rt;
    clearRT(renderer, out, LIN.ink);
    const L = S().ui; L.clear(); const c = L.ctx;
    c.textBaseline = 'alphabetic';
    const fmt = (x: number) => x.toFixed(2).replace('.', ',');
    const same = t >= this.tSame && t < this.tPause;
    const layers = ease.inOutCubic(prog(t, this.tDraw - 0.1, this.tDraw + 0.8));
    if (t < this.tSec) {
      const k = prog(t, this.tFn, this.tFn + 0.6);
      c.font = font(F.mono(400), 110); c.fillStyle = rgba('bone', k);
      const txt = 'quadro = render(t)';
      c.fillText(txt, W / 2 - measure(txt, F.mono(400), 110) / 2, 560);
      const kt = prog(t, this.at('função'), this.at('função') + 0.4);
      c.font = font(F.mono(400), 30); c.fillStyle = rgba('signal', kt);
      c.fillText(`t = ${fmt(34.8 + (t - this.tFn) * 0.5)} s`, W / 2 - 110, 660);
    } else {
      // the frame (or two, or its layers)
      const post = this.clips.renderAt(s, R[0]!);
      void post;
      if (same) {
        const k = ease.inOutCubic(prog(t, this.tSame, this.tSame + 0.4));
        const w = lerp(1280, 800, k), h = w * 9 / 16, y0 = 170;
        const xa = lerp(W / 2 - w / 2, 120, k), xb = lerp(W / 2 - w / 2, W - 120 - w, k);
        camPass(renderer, R[0]!.texture, out, { rect: [xa, y0, xa + w, y0 + h] }, true);
        camPass(renderer, R[0]!.texture, out, { rect: [xb, y0, xb + w, y0 + h] }, true);
        c.font = font(F.mono(400), 30); c.fillStyle = rgba('bone');
        c.fillText(`render(${fmt(s)})`, xa, y0 + h + 50); c.fillText(`render(${fmt(s)})`, xb, y0 + h + 50);
        c.font = font(F.mono(400), 110); c.fillStyle = rgba('signal', k); c.fillText('=', W / 2 - 34, y0 + h / 2 + 36);
      } else if (layers > 0) {
        // three sheets of glass: the clip, the drawings, the ruler
        const w = 1060, h = w * 9 / 16;
        const off = (i: number) => ({ x: 430 + i * 220 * layers, y: 200 - i * 70 * layers });
        const p0 = off(0);
        camPass(renderer, R[0]!.texture, out, { rect: [p0.x, p0.y + 120, p0.x + w, p0.y + 120 + h] }, true);
        for (let i = 0; i < 3; i++) {
          const p = off(i);
          c.strokeStyle = rgba('bone', 0.55); c.lineWidth = 1.2; c.strokeRect(p.x + 0.5, p.y + 120.5, w, h);
          c.fillStyle = rgba('bone', i ? 0.04 : 0); if (i) c.fillRect(p.x, p.y + 120, w, h);
          c.font = font(F.mono(500), 20); c.fillStyle = rgba('bone', 0.8 * layers);
          c.fillText(['o clipe', 'os desenhos da explicação', 'a régua'][i]!, p.x + w + 16, p.y + 140);
        }
        // what lives on the upper sheets
        const p1 = off(1), p2 = off(2);
        c.strokeStyle = rgba('signal', layers); c.lineWidth = 2.5;
        c.beginPath(); c.arc(p1.x + w * 0.6, p1.y + 120 + h * 0.45, 70, 0, TAU); c.stroke();
        c.font = font(F.mono(400), 22); c.fillStyle = rgba('signal', layers); c.fillText('← chamada', p1.x + w * 0.6 + 90, p1.y + 120 + h * 0.45);
        c.fillStyle = rgba('bone', 0.6 * layers); c.fillRect(p2.x + 40, p2.y + 120 + h - 40, w - 80, 1.5);
        c.fillStyle = rgba('signal', layers); c.fillRect(p2.x + 40, p2.y + 120 + h - 41, (w - 80) * (s / CLIP_END), 3);
      } else {
        const w = 1280, h = 720, x0 = W / 2 - w / 2, y0 = 130;
        camPass(renderer, R[0]!.texture, out, { rect: [x0, y0, x0 + w, y0 + h] }, true);
        c.strokeStyle = rgba('bone', 0.4); c.lineWidth = 1; c.strokeRect(x0 + 0.5, y0 + 0.5, w, h);
        c.font = font(F.mono(400), 30); c.fillStyle = rgba('bone');
        c.fillText(`render(${fmt(s)})`, x0, y0 + h + 48);
        // the link down to the cursor on the ruler
        c.strokeStyle = rgba('signal', 0.7); c.lineWidth = 1;
        c.beginPath(); c.moveTo(rulerX(s), RY - 70); c.lineTo(rulerX(s), y0 + h + 60); c.stroke();
      }
    }
    comp.draw(renderer, L.upload(), out);
    const play = t >= this.tSec && t < this.tPause ? 1 : 0;
    return { post: { bloom: 0.45, ca: 0.5, frame: 0 }, regua: { pos: s, play, label: t >= this.tSec && !same && layers <= 0 ? [`t = ${fmtTime(s)}`, 1] : undefined } };
  }
}

// ---------------------------------------------------------------- 06.4
const CREDITS: [string, string, string?][] = [
  ['Letra', 'osmarks, MusicPerson', 'e o Discord da EleutherAI'],
  ['', '+ Claude', 'o final e o último refrão'],
  ['Música', 'Suno', 'versão “Claude-Pop”: deckard'],
  ['Voz', 'ElevenLabs'],
  ['Versão em português', 'O Programador Real'],
];
/**
 * 06.4 "A letra, não…" — credits set in type: the lyric by people (osmarks, MusicPerson and the EleutherAI
 * Discord), "com uma ajudinha do próprio Clód no final" — then the rest of who made what.
 */
class B064 extends Block {
  private tIn: number[] = [];
  override init() {
    this.tIn = [this.at('escrita'), this.at('Com uma'), this.at('ajudinha') + 0.5, this.at('Clód') + 0.2, this.at('final.') + 0.1];
  }
  render(f: Frame, out: THREE.WebGLRenderTarget): BlockOut {
    const { renderer, comp } = this.ctx;
    const t = f.t;
    clearRT(renderer, out, LIN.ink);
    const L = S().ui; L.clear(); const c = L.ctx;
    c.textBaseline = 'alphabetic';
    const k0 = prog(t, this.e.start, this.e.start + 0.5);
    c.font = font(F.serif(400, true), 76); c.fillStyle = rgba('bone', k0);
    c.fillText('A letra foi escrita por gente.', 200, 230);
    CREDITS.forEach(([role, who, note], i) => {
      const k = ease.outCubic(prog(t, this.tIn[i]!, this.tIn[i]! + 0.35));
      if (k <= 0) return;
      const y = 370 + i * 118 + (1 - k) * 20;
      c.globalAlpha = k;
      c.font = font(F.mono(500), 20); c.letterSpacing = '4px'; c.fillStyle = rgba('ash');
      c.fillText(role.toUpperCase(), 200, y - 44); c.letterSpacing = '0px';
      c.font = font(F.archivo(100, 700), 64); c.fillStyle = i === 1 ? rgba('signal') : rgba('bone');
      c.fillText(who, 200, y + 12);
      if (note) { c.font = font(F.mono(400), 28); c.fillStyle = rgba('ash'); c.fillText(note, 220 + measure(who, F.archivo(100, 700), 64) + 20, y + 8); }
      c.globalAlpha = 1;
    });
    comp.draw(renderer, L.upload(), out);
    return { post: { bloom: 0.4, ca: 0.4, frame: 0 } };
  }
}

// ---------------------------------------------------------------- 06.5
/**
 * 06.5 "E tem uma ironia aqui…" — the mask, big, facing us, smiling. "Foi esse tipo de I-Á que escreveu o
 * código deste vídeo, inclusive o do monstro": it turns round, and on its back is the shoggoth's code. "E o
 * roteiro": this chapter's script scrolls, and "Inclusive esta frase" lights word by word as it is said.
 * "E esta voz": the waveform of this very speech, drawn by the spark, labelled "voz sintética"; "Loucura,
 * né?": the wave bends into the mask's smile.
 */
class B065 extends Block {
  private tAI = 0; private tTurn = 0; private tScript = 0; private tThis = 0; private tVoice = 0; private tSmile = 0;
  override init() {
    this.tAI = this.at('Foi esse'); this.tTurn = this.at('inclusive o do');
    this.tScript = this.at('E o roteiro'); this.tThis = this.at('Inclusive esta');
    this.tVoice = this.at('E esta voz'); this.tSmile = this.at('Loucura');
  }
  render(f: Frame, out: THREE.WebGLRenderTarget): BlockOut {
    const { renderer, comp } = this.ctx;
    const t = f.t;
    clearRT(renderer, out, LIN.ink);
    const L = S().ui; L.clear(); const c = L.ctx;
    c.textBaseline = 'alphabetic';
    const lb = S().lines; lb.clear();
    const M = { x: W / 2, y: 500, r: 300 };
    if (t < this.tScript) {
      // the mask turning: its back carries the monster's code
      const turn = ease.inOutCubic(prog(t, this.tTurn - 0.3, this.tTurn + 0.5));
      const sx = Math.cos(turn * Math.PI);
      const kin = ease.outCubic(prog(t, this.e.start + 0.8, this.e.start + 1.4));
      // (a slow push, and the mask breathing: nothing holds still)
      const r = lerp(40, M.r, kin) * (1 + 0.018 * Math.max(0, t - this.e.start - 1.4)) * (1 + 0.01 * Math.sin((t - this.e.start) * 2.1));
      c.save(); c.translate(M.x, M.y); c.scale(Math.max(0.02, Math.abs(sx)), 1);
      if (sx >= 0) drawMask2D(c, 0, 0, r);
      else {
        c.fillStyle = rgba('ink2'); c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill();
        c.strokeStyle = rgba('bone', 0.6); c.lineWidth = 2; c.stroke();
        c.save(); c.beginPath(); c.arc(0, 0, r - 6, 0, TAU); c.clip(); c.scale(-1, 1);
        drawListing(c, source('shoggoth-glsl.ts'), { x: -r, y: -r, w: 2 * r, h: 2 * r, scroll: 160 + (t - this.tTurn) * 6, size: 15, numbers: false });
        c.restore();
      }
      c.restore();
      if (t >= this.tAI) {
        c.font = font(F.mono(400), 28); c.fillStyle = rgba('bone', 0.85);
        typed(c, '// o assistente simpático escreveu este código', 150, 950, prog(t, this.tAI, this.tAI + 1.0));
      }
      if (sx < 0) { c.font = font(F.mono(500), 22); c.fillStyle = rgba('signal'); c.fillText('shoggoth-glsl.ts', M.x + M.r + 40, M.y - M.r + 30); }
    } else if (t < this.tVoice) {
      // the script: this chapter's paragraphs; the sentence being said lights word by word
      const b = this.e.b;
      const words = b.words;
      const i0 = words.findIndex((w) => w.start >= this.tThis - 0.01);
      c.font = font(F.mono(500), 18); c.letterSpacing = '3px'; c.fillStyle = rgba('ash');
      c.fillText('tts/06-bastidores.txt', 150, 140); c.letterSpacing = '0px';
      const size = 40, fam = F.mono(400);
      let x = 150, y = 260;
      const sp = measure(' ', fam, size);
      words.forEach((w, i) => {
        const ww = measure(w.w, fam, size);
        if (x + ww > W - 150) { x = 150; y += size * 1.45; }
        const lit = i >= i0 && i0 >= 0 && t >= w.start;
        const said = t >= w.start;
        c.font = font(fam, size);
        c.fillStyle = lit ? rgba('signal') : said ? rgba('bone', 0.9) : rgba('bone', 0.25);
        c.fillText(w.w, x, y);
        x += ww + sp;
      });
    } else {
      // the voice itself, drawn by the spark; then it bends into the smile
      const bend = ease.inOutCubic(prog(t, this.tSmile, this.tSmile + 0.6));
      const x0 = 160, x1 = W - 160, span = 3.2;
      const pts: P2[] = [];
      for (let i = 0; i <= 320; i++) {
        const u = i / 320;
        const tt = t - span + u * span;
        const v = this.n.voice(tt) * (tt <= t ? 1 : 0);
        const lx = lerp(x0, x1, u), ly = 520 + Math.sin(u * 240 + tt * 30) * v * 150;
        // the smile: the mask's arc
        const a = lerp(MASK.smileA1, MASK.smileA0, u);
        const sx = M.x + Math.cos(a) * MASK.smileR * M.r, sy = M.y + MASK.smileCY * M.r + Math.sin(a) * MASK.smileR * M.r;
        pts.push({ x: lerp(lx, sx, bend), y: lerp(ly, sy, bend) + Math.sin(u * 240 + tt * 30) * v * 30 * bend });
      }
      if (bend > 0) {
        c.globalAlpha = bend;
        c.fillStyle = rgba('bone'); c.beginPath(); c.arc(M.x, M.y, M.r, 0, TAU); c.fill();
        c.fillStyle = rgba('ink');
        for (const sgn of [-1, 1]) { c.beginPath(); c.arc(M.x + sgn * MASK.eyeX * M.r, M.y + MASK.eyeY * M.r, MASK.eyeR * M.r, 0, TAU); c.fill(); }
        c.globalAlpha = 1;
      }
      for (let i = 1; i < pts.length; i++) lb.seg2(pts[i - 1]!.x, pts[i - 1]!.y, pts[i]!.x, pts[i]!.y, 2.2 + 3 * bend, bend > 0.5 ? [LIN.ink[0], LIN.ink[1], LIN.ink[2]] : hot(1.6), 1);
      const hp = pts[pts.length - 1]!;
      if (bend < 1) sparkHead(lb, hp.x, hp.y, t, 0.9, 1 - bend);
      c.font = font(F.mono(500), 24); c.letterSpacing = '4px'; c.fillStyle = rgba('signal', 1 - bend);
      c.fillText('VOZ SINTÉTICA', 160, 330); c.letterSpacing = '0px';
      c.font = font(F.mono(400), 20); c.fillStyle = rgba('ash', 1 - bend);
      c.fillText('a forma de onda desta frase', 160, 366);
    }
    comp.draw(renderer, L.upload(), out);
    // (the smile's ink stroke must sit over the bone face: the line batch adds light, so draw it in 2D)
    lb.render(renderer, out);
    if (t >= this.tVoice && ease.inOutCubic(prog(t, this.tSmile, this.tSmile + 0.6)) > 0.5) {
      const L2 = S().ui2; L2.clear(); const c2 = L2.ctx;
      c2.strokeStyle = rgba('ink'); c2.lineWidth = MASK.smileW * M.r; c2.lineCap = 'round';
      c2.beginPath(); c2.arc(M.x, M.y + MASK.smileCY * M.r, MASK.smileR * M.r, MASK.smileA0, MASK.smileA1); c2.stroke();
      comp.draw(renderer, L2.upload(), out);
    }
    return { post: { bloom: 0.5, ca: 0.5, frame: 0 } };
  }
}

// ---------------------------------------------------------------- 06.6
const GUESSES: [string, number][] = [['depende', 0.34], ['5%', 0.27], ['50%', 0.18], ['???', 0.21]];
/**
 * 06.6 "Talvez o fim do mundo que a música canta nunca aconteça…" — the clip's prompt field, empty, the
 * caret blinking. "o seu pê dum subiu ou desceu?": "Meu P(doom) é " types itself, and over the caret a
 * next-token distribution: depende, 5%, 50%, ???. "Deixa o seu número nos comentários": the caret waits.
 */
class B066 extends Block {
  private tType = 0; private tDist = 0; private tLeave = 0;
  override init() { this.tType = this.at('Então me diz'); this.tDist = this.at('subiu'); this.tLeave = this.at('Deixa'); }
  render(f: Frame, out: THREE.WebGLRenderTarget): BlockOut {
    const { renderer, comp } = this.ctx;
    const t = f.t;
    clearRT(renderer, out, LIN.ink);
    const L = S().ui; L.clear(); const c = L.ctx;
    c.textBaseline = 'alphabetic';
    const z = 1 + 0.015 * (t - this.e.start);
    c.save(); c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-W / 2, -H / 2);
    const fx0 = 380, fx1 = 1540, fy0 = 560, fy1 = 680;
    c.fillStyle = rgba('ink', 0.9); c.fillRect(fx0, fy0, fx1 - fx0, fy1 - fy0);
    c.strokeStyle = rgba('bone', 0.42); c.lineWidth = 1; c.strokeRect(fx0 + 0.5, fy0 + 0.5, fx1 - fx0, fy1 - fy0);
    c.font = font(F.mono(400), 56); c.fillStyle = rgba('ash'); c.fillText('›', fx0 + 36, fy0 + 80);
    const txt = 'Meu P(doom) é ';
    const k = prog(t, this.tType, this.tType + 0.9);
    const shown = txt.slice(0, Math.floor(k * txt.length));
    c.fillStyle = rgba('bone'); c.fillText(shown, fx0 + 96, fy0 + 80);
    const cx = fx0 + 96 + measure(shown, F.mono(400), 56);
    const blink = Math.floor((t - this.e.start) * 2.2) % 2 === 0;
    if (blink || k < 1) { c.fillStyle = rgba('signal'); c.fillRect(cx + 4, fy0 + 32, 30, 60); }
    c.font = font(F.mono(500), 18); c.letterSpacing = '3px'; c.fillStyle = rgba('ash');
    c.fillText('PROMPT 04 · VOCÊ', fx0, fy1 + 40); c.letterSpacing = '0px';
    const kd = ease.outCubic(prog(t, this.tDist, this.tDist + 0.4));
    if (kd > 0) {
      const px = cx - 10, py = fy0 - 40;
      c.globalAlpha = kd;
      c.fillStyle = rgba('ink2', 0.95); c.fillRect(px, py - 250, 470, 240);
      c.strokeStyle = rgba('bone', 0.4); c.strokeRect(px + 0.5, py - 249.5, 470, 240);
      c.font = font(F.mono(400), 18); c.fillStyle = rgba('ash'); c.fillText('p(próximo)', px + 20, py - 215);
      GUESSES.forEach(([g, p], i) => {
        const y = py - 170 + i * 44;
        c.font = font(F.mono(500), 28); c.fillStyle = i === 0 ? rgba('signal') : rgba('bone', 0.9); c.fillText(g, px + 20, y + 8);
        c.fillStyle = i === 0 ? rgba('signal') : rgba('ash', 0.6); c.fillRect(px + 180, y - 12, 200 * p / 0.34, 18);
        c.font = font(F.mono(400), 20); c.fillStyle = rgba('ash'); c.fillText(p.toFixed(2).replace('.', ','), px + 395, y + 4);
      });
      c.globalAlpha = 1;
    }
    c.restore();
    if (t >= this.tLeave) caption(c, 'o seu número vai nos comentários', prog(t, this.tLeave, this.tLeave + 0.8), 380, 880);
    comp.draw(renderer, L.upload(), out);
    return { post: { bloom: 0.5, ca: 0.4, frame: 0 } };
  }
}

// ---------------------------------------------------------------- 06.7
/**
 * 06.7 "E agora, ouve de novo. Aposto que vai ser outra música." — the clip's first frame again, the crop
 * marks back; on "ouve de novo" the spark runs back to 0:00. When the mixagem ends, the pause turns to play,
 * the ruler fades, and the song restarts with the clip (replay.ts).
 */
class B067 extends Block {
  private tBack = 0; private tEnd = 0;
  override async init() {
    await this.clips.load('open');
    this.tBack = this.at('ouve'); this.tEnd = MIX_AT + this.n.mixDuration;
  }
  render(f: Frame, out: THREE.WebGLRenderTarget): BlockOut {
    const t = f.t;
    const post = this.clips.render('open', 0, out);
    const pos = lerp(CLIP_END, 0, ease.inOutCubic(prog(t, this.tBack, this.tBack + 0.9)));
    const play = prog(t, this.tEnd - 0.7, this.tEnd - 0.5);
    const alpha = 1 - prog(t, this.tEnd - 0.4, this.tEnd - 0.02);
    return { post: { ...post, frame: 1 }, regua: { pos, play, alpha }, verse: 0 };
  }
}

export const C06: Record<string, BlockFactory> = {
  '06.1': (e) => new B061(e),
  '06.2': (e) => new B062(e),
  '06.3': (e) => new B063(e),
  '06.4': (e) => new B064(e),
  '06.5': (e) => new B065(e),
  '06.6': (e) => new B066(e),
  '06.7': (e) => new B067(e),
};
void callout; void pulse;

/** Mix two rgba() colours. */
function mixC(a: string, b: string, k: number) {
  const pa = a.match(/[\d.]+/g)!.map(Number), pb = b.match(/[\d.]+/g)!.map(Number);
  const v = [0, 1, 2, 3].map((i) => (pa[i] ?? 1) + ((pb[i] ?? 1) - (pa[i] ?? 1)) * k);
  return `rgba(${Math.round(v[0]!)},${Math.round(v[1]!)},${Math.round(v[2]!)},${v[3]})`;
}
