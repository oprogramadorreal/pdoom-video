// Chapter 05 · 0,99 · O que Ilya viu.
import type * as THREE from 'three';
import type { Frame } from '../engine/scene';
import { W, H, clearRT } from '../engine/gl';
import { LIN, rgba } from '../engine/palette';
import { F, font, measure } from '../engine/type';
import { clamp, ease, hash, lerp, prog, TAU } from '../engine/util';
import { Block, type BlockFactory, type BlockOut } from './block';
import { S, camPass, camToScreen, type Cam } from './kit';
import { INK, type Stamp } from './paper';
import { callout, strike, typed } from './draw';
import { caption, clipPost, remap } from './c02';

// ---------------------------------------------------------------- 05.1
/** The next-token distribution from 01.4 — the bars that turn into branches. */
const DIST: [string, number][] = [['engole', 0.44], ['apague', 0.21], ['treine com', 0.18], ['(outras)', 0.17]];
/** Continuations of each branch (the tree's second level). */
const NEXT: string[][] = [['vivo, não.', 'devagar.', 'primeiro.'], ['meus dados.', 'o histórico.'], ['os meus textos.', 'tudo.'], ['…', '…']];

/**
 * 05.1 "Lembra dos números em cima das palavras?" — the chorus rolls to 0,999…; "como previu o Loom" as
 * the clip draws it. On "Lembra", 01.4's bars come back; "mostra as outras escolhas": they turn 90° and
 * become branches — each candidate a branch, and each branch sprouts its own continuations: "várias
 * continuações pro mesmo texto, como galhos de uma árvore". "alguém que assina como Janus": the clip's
 * tree, "Loom · Janus · 2021", and the prophecies it continues.
 */
class B051 extends Block {
  private tBars = 0; private tTurn = 0; private tGrow = 0; private tJanus = 0;
  override async init() {
    await Promise.all(['hook4', 'loom'].map((id) => this.clips.load(id)));
    this.tBars = this.n.nearestBeat(this.at('Lembra'));
    this.tTurn = this.at('mostra'); this.tGrow = this.at('várias'); this.tJanus = this.n.nearestBeat(this.at('Com ela'));
  }
  render(f: Frame, out: THREE.WebGLRenderTarget): BlockOut {
    const { renderer, comp } = this.ctx;
    const t = f.t;
    if (t < this.tBars) {
      const hookEnd = this.e.start + 0.55;
      if (t < hookEnd) return { post: clipPost(this.clips.render('hook4', remap(t, [[this.e.start, 125.2], [hookEnd, 125.72]]), out)) };
      return { post: clipPost(this.clips.render('loom', remap(t, [[hookEnd, 126.5], [this.tBars, 127.4]]), out)) };
    }
    if (t >= this.tJanus) {
      const post = this.clips.render('loom', 127.42 + (t - this.tJanus) * 0.02, S().rt[0]!);
      camPass(renderer, S().rt[0]!.texture, out, { x: 1450, y: 540, zoom: lerp(1.0, 1.45, ease.inOutCubic(prog(t, this.tJanus, this.tJanus + 2))) });
      const L = S().ui; L.clear();
      caption(L.ctx, 'Loom · Janus · 2021', prog(t, this.at('Janus') - 0.1, this.at('Janus') + 0.5), 120, 150);
      comp.draw(renderer, L.upload(), out);
      return { post: { ...clipPost(post), shake: [0, 0], zoom: 1 } };
    }
    clearRT(renderer, out, LIN.ink);
    const L = S().ui; L.clear(); const c = L.ctx;
    c.textBaseline = 'alphabetic';
    // the context
    c.font = font(F.mono(400), 30); c.fillStyle = rgba('bone', 0.85);
    c.fillText('ChatGPT, não me', 150, 540 + 10);
    const x0 = 150 + measure('ChatGPT, não me ', F.mono(400), 30);
    const turn = ease.inOutCubic(prog(t, this.tTurn - 0.2, this.tTurn + 0.6));
    const grow = prog(t, this.tGrow, this.tGrow + 1.6);
    // bars (horizontal, stacked) → branches (fanning right from the last word)
    DIST.forEach(([w, p], i) => {
      const barY = 300 + i * 120, barX = 700, barW = 900 * p / 0.44;
      const ang = lerp(-0.5, 0.5, i / (DIST.length - 1)) * 1.0;
      const bLen = 380;
      const ex = x0 + 10 + Math.cos(ang) * bLen, ey = 540 + Math.sin(ang) * bLen;
      if (turn < 1) {
        c.globalAlpha = 1 - turn;
        c.fillStyle = i === 0 ? rgba('signal') : rgba('ash', 0.6);
        c.fillRect(barX, barY, barW, 64);
        c.font = font(F.archivo(100, 700), 44); c.fillStyle = rgba('bone', 0.92); c.fillText(w, barX, barY - 12);
        c.font = font(F.mono(400), 30); c.fillStyle = rgba('ash'); c.fillText(p.toFixed(2).replace('.', ','), barX + barW + 16, barY + 44);
        c.globalAlpha = 1;
      }
      if (turn > 0) {
        c.globalAlpha = turn;
        c.strokeStyle = i === 0 ? rgba('signal') : rgba('bone', 0.6); c.lineWidth = 1 + 6 * p;
        c.beginPath(); c.moveTo(x0, 540); c.quadraticCurveTo(x0 + bLen * 0.5, 540, lerp(x0, ex, turn), lerp(540, ey, turn)); c.stroke();
        c.font = font(F.mono(500), 26); c.fillStyle = i === 0 ? rgba('signal') : rgba('bone', 0.9);
        c.fillText(`${w} ${p.toFixed(2).replace('.', ',')}`, ex + 10, ey + 8);
        c.globalAlpha = 1;
        // the next level
        NEXT[i]!.forEach((nw, j) => {
          const kk = prog(grow, (i * 3 + j) * 0.07, (i * 3 + j) * 0.07 + 0.3);
          if (kk <= 0) return;
          const a2 = ang + lerp(-0.18, 0.18, NEXT[i]!.length === 1 ? 0.5 : j / (NEXT[i]!.length - 1));
          const sx = ex + measure(`${w} 0,00`, F.mono(500), 26) + 24;
          const tx = sx + Math.cos(a2) * 260 * kk, ty = ey + Math.sin(a2) * 170 * kk;
          c.strokeStyle = rgba('bone', 0.4); c.lineWidth = 1.2;
          c.beginPath(); c.moveTo(sx, ey); c.lineTo(tx, ty); c.stroke();
          c.globalAlpha = kk;
          c.font = font(F.mono(400), 20); c.fillStyle = rgba('ash'); c.fillText(nw, tx + 8, ty + 6);
          c.globalAlpha = 1;
        });
      }
    });
    comp.draw(renderer, L.upload(), out);
    return { post: { bloom: 0.45, ca: 0.5, frame: 0 } };
  }
}

// ---------------------------------------------------------------- 05.2
const SENTENCES: [string, string][] = [
  ['O gato subiu no', 'telhado'], ['Era uma vez uma', 'princesa'], ['A capital do Brasil é', 'Brasília'], ['Dois mais dois são', 'quatro'],
  ['Choveu muito, então levei o', 'guarda-chuva'], ['function soma(a, b) { return a +', 'b'], ['Ser ou não', 'ser'], ['Bom dia! Tudo', 'bem?'],
];
/**
 * 05.2 "No pré-treino, o pê do GPT…" — the verse, its words unmasked as the clip sings them. "o pê do GPT":
 * GPT with the P lit, Generative **Pre-trained** Transformer. "adivinhar a próxima palavra": a sentence with
 * its last word under a [MASK] block that opens on the guess; another, and another, faster and faster —
 * "Bilhões de vezes", a blur and a counter. "a máquina melhorando a si mesma": the clip's recursion;
 * "A explosão de inteligência, de volta": a second of FOOM.
 */
class B052 extends Block {
  private tP = 0; private tGuess = 0; private tBil = 0; private tRec = 0; private tFoom = 0;
  override async init() {
    await Promise.all(['loom', 'room'].map((id) => this.clips.load(id)));
    this.tP = this.at('o pê'); this.tGuess = this.at('o modelo'); this.tBil = this.at('Bilhões');
    this.tRec = this.n.nearestBeat(this.at('O verso')); this.tFoom = this.n.nearestBeat(this.at('A explosão'));
  }
  render(f: Frame, out: THREE.WebGLRenderTarget): BlockOut {
    const { renderer, comp } = this.ctx;
    const t = f.t;
    if (t < this.tP) return { post: clipPost(this.clips.render('loom', remap(t, [[this.e.start, 127.62], [this.tP, 129.2]]), out)) };
    if (t >= this.tFoom) return { post: clipPost(this.clips.render('room', remap(t, [[this.tFoom, 24.9], [this.e.end, 25.7]]), out)) };
    if (t >= this.tRec) return { post: clipPost(this.clips.render('loom', remap(t, [[this.tRec, 129.3], [this.tFoom, 131.2]]), out)) };
    clearRT(renderer, out, LIN.ink);
    const L = S().ui; L.clear(); const c = L.ctx;
    c.textBaseline = 'alphabetic';
    if (t < this.tGuess) {
      const k = prog(t, this.tP, this.tP + 0.3);
      c.font = font(F.archivo(100, 900), 300); c.textAlign = 'center';
      c.fillStyle = rgba('bone', 0.3 * k); c.fillText('G', W / 2 - 245, 560); c.fillText('T', W / 2 + 230, 560);
      c.fillStyle = rgba('signal', k); c.fillText('P', W / 2 - 10, 560);
      c.textAlign = 'left';
      c.font = font(F.mono(400), 40);
      let x = W / 2 - measure('Generative Pre-trained Transformer', F.mono(400), 40) / 2;
      for (const [w, hot] of [['Generative ', false], ['Pre-trained ', true], ['Transformer', false]] as const) { c.fillStyle = hot ? rgba('signal', k) : rgba('bone', 0.3 * k); c.fillText(w, x, 700); x += measure(w, F.mono(400), 40); }
      comp.draw(renderer, L.upload(), out);
      return { post: { bloom: 0.5, ca: 0.4, frame: 0 } };
    }
    // sentences, each with its next word masked, faster and faster
    const dur = (i: number) => Math.max(0.12, 1.1 * Math.pow(0.72, i));
    let t0 = this.tGuess, i = 0;
    while (t >= t0 + dur(i) && i < 200) { t0 += dur(i); i++; }
    const d = dur(i), lt = (t - t0) / d;
    const [ctx, word] = SENTENCES[i % SENTENCES.length]!;
    const size = 56;
    c.font = font(F.mono(400), size);
    const cw = measure(ctx + ' ', F.mono(400), size), ww = measure(word, F.mono(400), size);
    const x = W / 2 - (cw + ww) / 2, y = 560;
    const blur = clamp((0.4 - d) / 0.3);
    c.fillStyle = rgba('bone', 0.9); c.fillText(ctx, x, y);
    const open = ease.outCubic(clamp((lt - 0.45) / 0.3));
    c.fillStyle = rgba('signal'); c.fillText(word, x + cw, y);
    c.fillStyle = rgba('bone', 0.92);
    c.fillRect(x + cw - 6, y - size * 0.8 - 6 - open * 70, ww + 12, size + 12);
    if (open < 0.6) { c.font = font(F.mono(500), 20); c.fillStyle = rgba('ink'); c.fillText('[MASK]', x + cw + ww / 2 - 34, y - 12 - open * 70); }
    if (blur > 0) {
      // the stream: ghost sentences above and below
      for (let k = -4; k <= 4; k++) {
        if (!k) continue;
        const [a, b] = SENTENCES[(i + k + 80) % SENTENCES.length]!;
        c.globalAlpha = blur * (0.35 - Math.abs(k) * 0.06);
        c.font = font(F.mono(400), 36); c.fillStyle = rgba('bone');
        c.fillText(`${a} ${b}`, W / 2 - 400 + hash(i, k) * 80, y + k * 80 + (lt - 0.5) * 80);
      }
      c.globalAlpha = 1;
    }
    c.font = font(F.mono(500), 18); c.letterSpacing = '3px'; c.fillStyle = rgba('ash');
    c.fillText('PRÉ-TREINO · ADIVINHE A PRÓXIMA PALAVRA', 150, 150); c.letterSpacing = '0px';
    if (t >= this.tBil) {
      c.textAlign = 'right';
      c.font = font(F.mono(400), 60); c.fillStyle = rgba('signal');
      const n = Math.floor(Math.pow(10, lerp(3, 12, prog(t, this.tBil, this.tRec - 0.2))));
      c.fillText(n.toLocaleString('pt-BR'), W - 150, 190);
      c.textAlign = 'left';
    }
    comp.draw(renderer, L.upload(), out);
    return { post: { bloom: 0.45, ca: 0.5 + 3 * blur, frame: 0 } };
  }
}

// ---------------------------------------------------------------- 05.3
/** The stickers on the back of the lid at s = 131.75 (measured), and what they refer to. */
const STICKERS: { x: number; y: number; t: string; sub: string; lx: number; ly: number }[] = [
  { x: 1030, y: 385, t: 'SINTA A AGI', sub: 'o grito dele na festa da OpenAI, 2022', lx: 620, ly: 250 },
  { x: 1340, y: 578, t: 'LEVEMENTE CONSCIENTE', sub: 'um tuíte dele, fevereiro de 2022', lx: 1240, ly: 900 },
  { x: 1190, y: 495, t: 'Q*', sub: 'o boato de nov. de 2023', lx: 560, ly: 760 },
];
/**
 * 05.3 "Ília Sutskever…" — the verse ("O que Ilya viu? Nunca vamos saber.") as the clip plays it, the
 * laptop seen from behind. "um dos fundadores da OpenAI": "Ilya Sutskever · cofundador da OpenAI". "demitir
 * Sam Altman … em 2023": a timeline typewritten over the dark — 17 nov. 2023 · Altman demitido; "Dias
 * depois": 22 nov. · de volta. "E a internet perguntou": the clip's "O que Ilya viu?"; "Uma
 * superinteligência escondida?": back behind the lid, and its stickers light up with what they are.
 */
class B053 extends Block {
  private tBack = 0; private tFire = 0; private tReturn = 0; private tAsk = 0; private tHidden = 0;
  override async init() {
    await this.clips.load('ilya');
    this.tBack = this.at('Ília Sutskever'); this.tFire = this.at('demitir'); this.tReturn = this.at('Dias');
    this.tAsk = this.n.nearestBeat(this.at('E a internet')); this.tHidden = this.at('Uma superinteligência');
  }
  render(f: Frame, out: THREE.WebGLRenderTarget): BlockOut {
    const { renderer, comp } = this.ctx;
    const t = f.t;
    const R = S().rt;
    const L = S().ui; L.clear(); const c = L.ctx;
    c.textBaseline = 'alphabetic';
    if (t >= this.tAsk && t < this.tHidden) {
      const post = this.clips.render('ilya', remap(t, [[this.tAsk, 131.95], [this.tHidden, 132.8]]), out);
      return { post: clipPost(post) };
    }
    const hidden = t >= this.tHidden;
    const s = hidden ? 131.75 : remap(t, [[this.e.start, 131.3], [this.tBack, 131.75], [this.tAsk, 131.75]]);
    const post = this.clips.render('ilya', s, R[0]!, undefined);
    const lt = t - (hidden ? this.tHidden : this.e.start);
    const cam: Cam = hidden ? { x: 1180, y: 490, zoom: 1.35 + 0.02 * lt } : { zoom: 1 + 0.01 * lt, dim: t >= this.tFire - 0.3 ? lerp(1, 0.35, prog(t, this.tFire - 0.3, this.tFire)) : 1 };
    camPass(renderer, R[0]!.texture, out, cam);
    if (!hidden) {
      caption(c, 'Ilya Sutskever · cofundador da OpenAI', prog(t, this.at('fundadores'), this.at('fundadores') + 0.6) * (1 - prog(t, this.tFire - 0.3, this.tFire)), 120, 150);
      if (t >= this.tFire - 0.2) {
        c.font = font(F.mono(500), 20); c.letterSpacing = '4px'; c.fillStyle = rgba('ash');
        c.fillText('OPENAI · NOVEMBRO DE 2023', 200, 330); c.letterSpacing = '0px';
        c.fillStyle = rgba('bone', 0.5); c.fillRect(200, 470, 1400 * ease.outCubic(prog(t, this.tFire - 0.2, this.tFire + 0.4)), 2);
        const node = (x: number, t0: number, d: string, what: string, hot: boolean) => {
          const k = prog(t, t0, t0 + 0.3);
          if (k <= 0) return;
          c.globalAlpha = k;
          c.fillStyle = hot ? rgba('signal') : rgba('bone'); c.beginPath(); c.arc(x, 471, 10, 0, TAU); c.fill();
          c.font = font(F.mono(500), 30); c.fillStyle = rgba('bone'); typed(c, d, x - 20, 430, prog(t, t0, t0 + 0.4));
          c.font = font(F.archivo(100, 800), 50); c.fillStyle = hot ? rgba('signal') : rgba('bone'); typed(c, what, x - 20, 550, prog(t, t0 + 0.1, t0 + 0.6));
          c.globalAlpha = 1;
        };
        node(320, this.tFire, '17 nov. 2023', 'Altman demitido', true);
        node(1100, this.tReturn, '22 nov.', 'de volta', false);
      }
    } else {
      STICKERS.forEach((st, i) => {
        const t0 = this.tHidden + 0.15 + i * 0.35;
        const p = camToScreen(cam, st.x, st.y);
        callout(c, p.x, p.y, st.lx, st.ly, st.sub, prog(t, t0, t0 + 0.45), { title: st.t, titleSize: 36, size: 22, color: i === 0 ? rgba('signal') : rgba('bone') });
      });
    }
    comp.draw(renderer, L.upload(), out);
    return { post: { ...clipPost(post), shake: [0, 0], zoom: 1 } };
  }
}

// ---------------------------------------------------------------- 05.4
/**
 * 05.4 "Mas nessa, a letra envelheceu." — the REDACTED screen, as the clip has it. "Em dois mil e vinte e
 * cinco, um depoimento … veio a público": the redaction bar peels off and behind it is paper — the
 * deposition's cover (Musk v. Altman, 1 Oct. 2025, made public in Nov. 2025). "não é uma máquina secreta":
 * struck through. "É um memorando de cinquenta e duas páginas": 52 pages fan out; "com queixas sobre o
 * jeito como Altman comandava a empresa": the memo's first page, its lines mostly censored. "Menos ficção
 * científica. Mais novela corporativa.": two stamps.
 */
class B054 extends Block {
  private tDep = 0; private tNot = 0; private tMemo = 0; private tComp = 0; private tFic = 0; private tNov = 0;
  override async init() {
    await this.clips.load('ilya');
    this.tDep = this.n.nearestBeat(this.at('um depoimento')); this.tNot = this.at('não é');
    this.tMemo = this.n.nearestBeat(this.at('É um memorando')); this.tComp = this.at('com queixas');
    this.tFic = this.at('Menos'); this.tNov = this.at('Mais novela');
  }
  render(f: Frame, out: THREE.WebGLRenderTarget): BlockOut {
    const { renderer } = this.ctx;
    const t = f.t;
    if (t < this.tDep) {
      const R = S().rt;
      const post = this.clips.render('ilya', remap(t, [[this.e.start, 132.9], [this.tDep, 133.35]]), R[0]!);
      camPass(renderer, R[0]!.texture, out, { x: 1010, y: 470, zoom: lerp(1.2, 1.6, prog(t, this.e.start, this.tDep)) });
      return { post: { ...clipPost(post), shake: [0, 0], zoom: 1 } };
    }
    clearRT(renderer, out, LIN.ink);
    const memo = t >= this.tMemo;
    const lt = t - this.tDep;
    if (!memo) {
      // the deposition's cover, the redaction peeling off it
      const peel = ease.inOutCubic(prog(t, this.tDep, this.tDep + 0.7));
      S().sheet.render(renderer, out, { x: 560, y: 390, zoom: 1.12 + 0.01 * lt, roll: 0.008 }, [0, 0, 1120, 780], (c) => {
        c.textBaseline = 'alphabetic';
        c.fillStyle = INK.print(0.8); c.font = font(F.mono(500), 16); c.letterSpacing = '3px';
        c.fillText('TRIBUNAL FEDERAL · DISTRITO NORTE DA CALIFÓRNIA', 70, 90); c.letterSpacing = '0px';
        c.font = font(F.serif(600), 56); c.fillStyle = INK.print(1);
        c.fillText('Elon Musk v. Samuel Altman et al.', 70, 190);
        c.fillRect(70, 215, 980, 2);
        c.font = font(F.mono(500), 26); c.fillStyle = INK.print(0.9);
        c.fillText('DEPOIMENTO DE ILYA SUTSKEVER', 70, 280);
        c.font = font(F.mono(400), 22);
        c.fillText('tomado em 1º de outubro de 2025', 70, 330);
        c.fillText('divulgado em novembro de 2025', 70, 370);
        c.font = font(F.mono(400), 22); c.fillStyle = INK.type(0.95);
        if (t >= this.tNot) {
          typed(c, 'P. O que você viu?', 70, 470, prog(t, this.tNot - 0.3, this.tNot));
          typed(c, 'R. —', 70, 510, prog(t, this.tNot, this.tNot + 0.2));
          c.font = font(F.archivo(100, 800), 44); c.fillStyle = INK.print(1);
          typed(c, 'uma máquina secreta', 70, 600, prog(t, this.at('máquina'), this.at('máquina') + 0.4));
          c.fillStyle = INK.orange(1);
          const w = measure('uma máquina secreta', F.archivo(100, 800), 44);
          c.fillRect(64, 584, (w + 12) * ease.outCubic(prog(t, this.at('secreta'), this.at('secreta') + 0.3)), 6);
        }
        // the redaction bar, peeling up from the bottom-left corner
        if (peel < 1) {
          c.save(); c.translate(70, 450); c.rotate(-0.4 * peel); c.translate(0, -700 * peel);
          c.fillStyle = INK.print(1); c.fillRect(0, 0, 980, 170);
          c.globalCompositeOperation = 'difference'; c.font = font(F.mono(700), 40); c.letterSpacing = '12px';
          c.fillText('CENSURADO', 340, 100); c.letterSpacing = '0px';
          c.restore();
        }
      });
      return { post: { bloom: 0.2, ca: 0.4, frame: 0 } };
    }
    // the memo: 52 pages fanning out, the top one legible
    const fan = ease.outCubic(prog(t, this.tMemo, this.tMemo + 0.9));
    const fic = t >= this.tFic, nov = t >= this.tNov;
    const stampFor = (t0: number, x: number, y: number, rot: number): Stamp => ({ x, y, hw: 330, hh: 70, rot, strength: 1 + 0.5 * (1 - prog(t, t0, t0 + 0.05)) });
    for (let i = 51; i >= 0; i--) {
      const a = (i - 25) / 25 * 0.5 * fan, dx = (i - 25) * 7 * fan;
      if (i > 0 && i % 4 !== 0) continue; // a few of the 52 are enough to read as a pile
      S().sheet.render(renderer, out, { x: 560 - dx, y: 420 + Math.abs(i - 25) * 2 * fan, zoom: 0.95, roll: a }, [0, 0, 1120, 780], (c) => {
        c.fillStyle = INK.print(0.14);
        for (let r = 0; r < 18; r++) c.fillRect(80, 120 + r * 32, 900 - 180 * hash(i, r), 7);
        c.font = font(F.mono(400), 14); c.fillStyle = INK.print(0.6); c.fillText(`${52 - i} / 52`, 980, 750);
      }, { shadow: 0.4 });
    }
    S().sheet.render(renderer, out, { x: 560, y: 400, zoom: 1.0 + 0.01 * (t - this.tMemo), roll: 0 }, [0, 0, 1120, 780], (c) => {
      c.textBaseline = 'alphabetic';
      c.fillStyle = INK.print(0.8); c.font = font(F.mono(600), 18); c.letterSpacing = '4px';
      c.fillText('MEMORANDO · CONFIDENCIAL · 52 PÁGINAS', 70, 80); c.letterSpacing = '0px';
      c.font = font(F.mono(400), 20); c.fillStyle = INK.type(0.95);
      c.fillText('Para: conselheiros independentes', 70, 140);
      c.fillText('De:   Ilya Sutskever', 70, 172);
      c.fillText('Assunto: a conduta de Sam Altman', 70, 204);
      c.fillStyle = INK.print(1); c.fillRect(70, 226, 980, 1.5);
      const lines = ['1. Padrão consistente de', '2. Comunicação com o conselho', '3. Atritos entre executivos', '4. Relatos de'];
      lines.forEach((l, r) => {
        const k = prog(t, this.tComp + r * 0.3, this.tComp + r * 0.3 + 0.4);
        c.font = font(F.mono(500), 22); c.fillStyle = INK.type(k);
        c.fillText(l, 70, 290 + r * 70);
        c.fillStyle = INK.print(k); c.fillRect(70 + measure(l + ' ', F.mono(500), 22), 272 + r * 70, 420 - r * 40, 24);
      });
      if (fic) {
        c.save(); c.translate(760, 590); c.rotate(-0.08);
        c.strokeStyle = INK.print(1); c.lineWidth = 6; c.strokeRect(-300, -52, 600, 104);
        c.fillStyle = INK.print(1); c.font = font(F.archivo(75, 900), 52); c.textAlign = 'center'; c.fillText('FICÇÃO CIENTÍFICA', 0, 18);
        c.fillStyle = INK.orange(1); c.fillRect(-310, -4, 620 * ease.outCubic(prog(t, this.tFic + 0.3, this.tFic + 0.6)), 8);
        c.restore();
      }
      if (nov) {
        c.save(); c.translate(700, 700); c.rotate(0.06);
        c.strokeStyle = INK.orange(1); c.lineWidth = 9; c.strokeRect(-310, -60, 620, 120);
        c.fillStyle = INK.orange(1); c.font = font(F.archivo(75, 900), 56); c.textAlign = 'center'; c.fillText('NOVELA CORPORATIVA', 0, 20);
        c.restore();
      }
    }, { stamp: nov ? stampFor(this.tNov, 700, 700, 0.06) : null });
    return { post: { bloom: 0.2, ca: 0.4, frame: 0, shake: nov && t < this.tNov + 0.08 ? [5, 4] : [0, 0] } };
  }
}

// ---------------------------------------------------------------- 05.5
/**
 * 05.5 "Quanto das promessas de segurança…" — the empty theatre, the spotlight on nothing, the question on
 * the proscenium; the curtains close on the last word.
 */
class B055 extends Block {
  override async init() { await this.clips.load('ilya'); }
  render(f: Frame, out: THREE.WebGLRenderTarget): BlockOut {
    const t = f.t;
    const s = remap(t, [[this.e.start, 135.95], [this.at('E quanto'), 137.2], [this.endOf('pra inglês ver?') - 0.2, 138.35], [this.e.end, 138.95]]);
    return { post: clipPost(this.clips.render('ilya', s, out)) };
  }
}

export const C05: Record<string, BlockFactory> = {
  '05.1': (e) => new B051(e),
  '05.2': (e) => new B052(e),
  '05.3': (e) => new B053(e),
  '05.4': (e) => new B054(e),
  '05.5': (e) => new B055(e),
};
void strike;
