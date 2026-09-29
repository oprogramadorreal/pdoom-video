// Chapter 04 · 0,81 · Clipes de papel.
import type * as THREE from 'three';
import type { Frame } from '../engine/scene';
import { W, H, clearRT } from '../engine/gl';
import { LIN, rgba } from '../engine/palette';
import { F, font, measure } from '../engine/type';
import { clamp, ease, hash, lerp, mulberry32, prog, pulse, TAU } from '../engine/util';
import { drawMask2D, MASK, sparkHead, sparkParticles } from '../scenes/_motifs';
import { Block, type BlockFactory, type BlockOut } from './block';
import { S, camPass, fmtTime, Regua, type Cam } from './kit';
import { INK } from './paper';
import { callout, typed } from './draw';
import { caption, clipPost, remap } from './c02';

/** A paperclip, drawn as a hairline (centre x, y; length L; angle). */
function paperclip(c: CanvasRenderingContext2D, x: number, y: number, L: number, a: number) {
  const w = 0.3 * L;
  c.save(); c.translate(x, y); c.rotate(a);
  c.beginPath();
  // one wire, three bends: outer loop (left), the right turn, the inner loop
  c.moveTo(L / 2 - 0.25 * w, w / 2);
  c.lineTo(-L / 2 + w / 2, w / 2);
  c.arc(-L / 2 + w / 2, 0, w / 2, Math.PI / 2, 1.5 * Math.PI);
  c.lineTo(L / 2 - 0.4 * w, -w / 2);
  c.arc(L / 2 - 0.4 * w, -0.1 * w, 0.4 * w, -Math.PI / 2, Math.PI / 2);
  c.lineTo(-L / 2 + 0.55 * w, 0.3 * w);
  c.arc(-L / 2 + 0.55 * w, 0.05 * w, 0.25 * w, Math.PI / 2, 1.5 * Math.PI);
  c.lineTo(L / 2 - 0.8 * w, -0.2 * w);
  c.stroke();
  c.restore();
}

/** A cursor arrow (as the outro's). */
function cursor(c: CanvasRenderingContext2D, x: number, y: number, s = 1) {
  c.save(); c.translate(x, y); c.scale(1.4 * s, 1.4 * s);
  c.beginPath();
  c.moveTo(0, 0); c.lineTo(0, 17); c.lineTo(4.2, 13); c.lineTo(7.2, 19.5); c.lineTo(9.6, 18.4); c.lineTo(6.7, 12.2); c.lineTo(12.3, 12.2); c.closePath();
  c.fillStyle = rgba('bone'); c.fill(); c.lineWidth = 1; c.strokeStyle = rgba('ink'); c.stroke();
  c.restore();
}

// ---------------------------------------------------------------- 04.1
/**
 * 04.1 "Chegamos à fábrica de clipes do começo…" — the chorus rolls to 0.81; "tudo vira clipe, um a um",
 * as the clip has it. "Imagine uma superinteligência com uma única meta": its goal typed at the top,
 * maximizar(clipes), and a field of paperclips doubling on the beat, a counter racing; "constrói fábricas,
 * busca metal, energia": the plan's lines tick. "o planeta, e a gente": the planet, made of clips, turning —
 * "você: ~7 × 10²⁷ átomos"; "que poderiam virar clipe": it turns orange from one side. "Ela não precisa
 * odiar ninguém": one clip, still. "as coisas que ela quer preservar": the list has one line. "Nick Bostrom".
 */
class B041 extends Block {
  private tClip = 0; private tField = 0; private tGoal = 0; private tMax = 0; private tPlan: number[] = []; private tPlanet = 0; private tUs = 0; private tConv = 0;
  private tOne = 0; private tKeep = 0; private tBos = 0;
  private globe: { x: number; y: number; z: number; a: number }[] = [];
  override async init() {
    await Promise.all(['hook3', 'paperclips'].map((id) => this.clips.load(id)));
    this.tClip = this.e.start + 0.85;
    this.tField = this.n.nearestBeat(this.at('Imagine'));
    this.tGoal = this.at('única meta'); this.tMax = this.at('fazer o');
    this.tPlan = [this.at('constrói'), this.at('busca'), this.at('energia')];
    this.tPlanet = this.n.nearestBeat(this.at('Até perceber')); this.tUs = this.at('e a gente'); this.tConv = this.at('poderiam');
    this.tOne = this.n.nearestBeat(this.at('Ela não')); this.tKeep = this.at('Basta'); this.tBos = this.at('O exemplo');
    const rnd = mulberry32(12);
    for (let i = 0; i < 700; i++) {
      const u = rnd() * 2 - 1, th = rnd() * TAU, r = Math.sqrt(1 - u * u);
      this.globe.push({ x: r * Math.cos(th), y: u, z: r * Math.sin(th), a: rnd() * TAU });
    }
  }
  render(f: Frame, out: THREE.WebGLRenderTarget): BlockOut {
    const { renderer, comp } = this.ctx;
    const t = f.t;
    if (t < this.tClip) return { post: clipPost(this.clips.render('hook3', remap(t, [[this.e.start, 96.25], [this.e.start + 0.45, 97.05], [this.tClip, 97.1]]), out)) };
    if (t < this.tField) return { post: clipPost(this.clips.render('paperclips', remap(t, [[this.tClip, 97.44], [this.tField, 98.95]]), out)) };
    if (t >= this.tOne) {
      const R = S().rt;
      const post = this.clips.render('paperclips', 97.52 + (t - this.tOne) * 0.01, R[0]!, undefined);
      camPass(renderer, R[0]!.texture, out, { x: 780, y: 600, zoom: 1.5 + 0.03 * (t - this.tOne) });
      const L = S().ui; L.clear(); const c = L.ctx;
      c.fillStyle = rgba('ink', 0.92); c.fillRect(0, 0, W, 210);
      if (t >= this.tKeep) {
        c.font = font(F.mono(600), 22); c.letterSpacing = '4px'; c.fillStyle = rgba('signal');
        typed(c, 'COISAS A PRESERVAR:', 150, 1000 - 880, prog(t, this.tKeep, this.tKeep + 0.5));
        c.letterSpacing = '0px';
        c.font = font(F.mono(400), 34); c.fillStyle = rgba('bone');
        typed(c, '01  clipes', 150, 170, prog(t, this.tKeep + 0.7, this.tKeep + 1.1));
      }
      caption(c, 'Nick Bostrom · 2003', prog(t, this.at('Nick') - 0.1, this.at('Nick') + 0.5), 1300, 150);
      comp.draw(renderer, L.upload(), out);
      return { post: { ...clipPost(post), shake: [0, 0], zoom: 1 } };
    }
    clearRT(renderer, out, LIN.ink);
    const L = S().ui; L.clear(); const c = L.ctx;
    c.textBaseline = 'alphabetic';
    if (t < this.tPlanet) {
      // the field: clips doubling on the beat, the view pulling back
      const beats = this.n.beatsIn(this.tMax, t).length;
      const n = t < this.tMax ? 1 : Math.min(4096, 2 ** beats);
      const zoom = 1 / n ** 0.36;
      const L0 = 240 * zoom;
      const cols = Math.ceil(Math.sqrt(n * 2));
      c.strokeStyle = rgba('bone', 0.8); c.lineWidth = Math.max(0.8, 3 * zoom);
      for (let i = 0; i < n; i++) {
        const col = i % cols, row = Math.floor(i / cols);
        const x = W / 2 + (col - (cols - 1) / 2) * L0 * 1.15, y = H / 2 + 40 + (row - (Math.ceil(n / cols) - 1) / 2) * L0 * 0.45;
        if (x < -100 || x > W + 100 || y < -100 || y > H + 100) continue;
        c.strokeStyle = i === 0 ? rgba('signal') : rgba('bone', 0.75);
        paperclip(c, x, y, L0, 0);
      }
      c.fillStyle = rgba('ink', 0.88); c.fillRect(0, 0, W, 300);
      c.font = font(F.mono(400), 36); c.fillStyle = rgba('bone');
      typed(c, 'meta: maximizar(clipes)', 150, 150, prog(t, this.tGoal, this.tGoal + 0.7), { caret: t < this.tGoal + 0.9 });
      this.tPlan.forEach((tp, i) => {
        c.font = font(F.mono(400), 26); c.fillStyle = rgba('ash');
        typed(c, ['+ construir fábricas', '+ buscar metal', '+ buscar energia'][i]!, 150 + i * 380, 220, prog(t, tp, tp + 0.4));
      });
      c.textAlign = 'right';
      c.font = font(F.mono(500), 18); c.letterSpacing = '3px'; c.fillStyle = rgba('ash'); c.fillText('CLIPES', W - 150, 110);
      c.letterSpacing = '0px';
      c.font = font(F.mono(400), 64); c.fillStyle = rgba('signal');
      const count = t < this.tMax ? 1 : beats <= 12 ? 2 ** beats : 4096 * 3 ** (beats - 12);
      c.fillText(count.toLocaleString('pt-BR'), W - 150, 180);
      c.textAlign = 'left';
    } else {
      // the planet, made of clips, turning; the conversion front sweeps it
      const R = 330, cx = W / 2 + 150, cy = H / 2 + 30;
      const rot = (t - this.tPlanet) * 0.25;
      const conv = prog(t, this.tConv, this.tOne - 0.1);
      const pts = this.globe.map((p) => {
        const x = p.x * Math.cos(rot) + p.z * Math.sin(rot), z = -p.x * Math.sin(rot) + p.z * Math.cos(rot);
        return { x, y: p.y, z, a: p.a, lon: Math.atan2(p.z, p.x) };
      }).sort((a, b) => a.z - b.z);
      const kIn = ease.outCubic(prog(t, this.tPlanet, this.tPlanet + 0.6));
      c.strokeStyle = rgba('bone', 0.35 * kIn); c.lineWidth = 1;
      c.beginPath(); c.arc(cx, cy, R * kIn, 0, TAU); c.stroke();
      for (const p of pts) {
        if (p.z < -0.1) continue;
        const shade = 0.25 + 0.75 * clamp(p.z);
        const hot = (p.lon + Math.PI) / TAU < conv;
        c.strokeStyle = hot ? rgba('signal', 0.95 * shade) : rgba('bone', 0.8 * shade);
        c.lineWidth = 1.2;
        paperclip(c, cx + p.x * R * kIn, cy - p.y * R * kIn, 26 * (0.6 + 0.4 * p.z), p.a);
      }
      c.font = font(F.mono(400), 28); c.fillStyle = rgba('bone');
      typed(c, 'planeta: 6 × 10²⁴ kg de átomos'.replace('10²⁴', '10^24'), 150, 200, prog(t, this.tPlanet + 0.2, this.tPlanet + 0.9));
      if (t >= this.tUs) {
        c.fillStyle = rgba('signal');
        typed(c, 'você: ~7 × 10^27 átomos', 150, 250, prog(t, this.tUs, this.tUs + 0.6));
      }
    }
    comp.draw(renderer, L.upload(), out);
    return { post: { bloom: 0.5, ca: 0.5, frame: 0 } };
  }
}

// ---------------------------------------------------------------- 04.2
/**
 * 04.2 "E o botão de desligar?" — the verse as the clip plays it (the out-of-office reply, NÃO TEM PRA ONDE
 * ESCAPAR). "uma vaga falsa na OpenAI": a job ad on paper, no logo — ENGENHEIRO(A) DO BOTÃO DE DESLIGAR —
 * stamped SÁTIRA · 2023; "Requisito: saber tirar coisas da tomada". "Mas a pergunta é séria": a big switch;
 * the cursor from the end of the clip goes for it, and every time it gets close the switch slides away;
 * "desligada, ela não cumpre a meta": meta → continuar ligada. "o engenheiro foi viajar": the clip's
 * auto-reply, close.
 */
class B042 extends Block {
  private tAd = 0; private tFake = 0; private tReq = 0; private tSw = 0; private tries: number[] = []; private tGoal = 0; private tAway = 0;
  override async init() {
    await this.clips.load('paperclips');
    this.tAd = this.n.nearestBeat(this.at('Tem um meme')); this.tFake = this.at('falsa'); this.tReq = this.at('Requisito');
    this.tSw = this.n.nearestBeat(this.at('Mas a pergunta'));
    this.tries = [this.at('Uma máquina'), this.at('motivo'), this.at('desligá-la')];
    this.tGoal = this.at('desligada,'); this.tAway = this.n.nearestBeat(this.at('Na música'));
  }
  render(f: Frame, out: THREE.WebGLRenderTarget): BlockOut {
    const { renderer, comp } = this.ctx;
    const t = f.t;
    if (t < this.tAd) return { post: clipPost(this.clips.render('paperclips', remap(t, [[this.e.start, 99.25], [this.tAd, 102.6]]), out)) };
    if (t >= this.tAway) {
      const R = S().rt;
      const post = this.clips.render('paperclips', 100.3 + (t - this.tAway) * 0.12, R[0]!);
      camPass(renderer, R[0]!.texture, out, { x: 1240, y: 360, zoom: 1.7 });
      return { post: { ...clipPost(post), shake: [0, 0], zoom: 1 } };
    }
    clearRT(renderer, out, LIN.ink);
    if (t < this.tSw) {
      const lt = t - this.tAd;
      const k = ease.outCubic(prog(t, this.tAd, this.tAd + 0.5));
      const stampOn = t >= this.tFake;
      const st = { x: 820, y: 170, hw: 230, hh: 64, rot: 0.1, strength: 1 + 0.5 * (1 - prog(t, this.tFake, this.tFake + 0.05)) };
      S().sheet.render(renderer, out, { x: 560, y: lerp(-400, 390, k) + 4 * Math.sin(lt), zoom: 1.08 + 0.01 * lt, roll: -0.01 }, [0, 0, 1120, 780], (c) => {
        c.textBaseline = 'alphabetic';
        c.fillStyle = INK.print(1); c.fillRect(0, 0, 1120, 80);
        c.globalCompositeOperation = 'difference';
        c.font = font(F.archivo(125, 900), 46); c.fillText('VAGA', 40, 58);
        c.font = font(F.mono(600), 16); c.letterSpacing = '4px'; c.fillText('SÃO FRANCISCO · PRESENCIAL', 700, 50); c.letterSpacing = '0px';
        c.globalCompositeOperation = 'lighter';
        c.font = font(F.archivo(100, 800), 58); c.fillStyle = INK.print(1);
        c.fillText('Engenheiro(a) do', 40, 170); c.fillText('botão de desligar', 40, 236);
        c.font = font(F.mono(500), 22); c.fillStyle = INK.print(0.85);
        c.fillText('US$ 300–500 mil por ano', 40, 290);
        c.fillRect(40, 320, 1040, 1.5);
        c.font = font(F.mono(700), 18); c.letterSpacing = '3px'; c.fillText('REQUISITOS', 40, 370); c.letterSpacing = '0px';
        c.font = font(F.mono(400), 30); c.fillStyle = INK.type(0.95);
        const kr = prog(t, this.tReq, this.tReq + 1.4);
        typed(c, '• ter paciência', 60, 430, kr * 3);
        typed(c, '• saber tirar coisas da tomada', 60, 485, kr * 3 - 1);
        typed(c, '• bônus: jogar um balde d’água nos servidores', 60, 540, kr * 3 - 2);
        c.font = font(F.mono(400), 15); c.fillStyle = INK.print(0.75);
        c.fillText('Anúncio satírico que circulou em 2023. A OpenAI não publicou esta vaga.', 40, 740);
        if (stampOn) {
          c.save(); c.translate(st.x, st.y); c.rotate(st.rot);
          c.strokeStyle = INK.orange(1); c.lineWidth = 9; c.strokeRect(-st.hw + 10, -st.hh + 10, 2 * st.hw - 20, 2 * st.hh - 20);
          c.fillStyle = INK.orange(1); c.textAlign = 'center'; c.font = font(F.archivo(75, 900), 64); c.fillText('SÁTIRA · 2023', 0, 22);
          c.restore();
        }
      }, { stamp: stampOn ? st : null, alpha: clamp(k * 2) });
      return { post: { bloom: 0.3, ca: 0.4, frame: 0, shake: t >= this.tFake && t < this.tFake + 0.1 ? [5, 3] : [0, 0] } };
    }
    // the switch that will not be switched off
    const L = S().ui; L.clear(); const c = L.ctx;
    let sx = 0;
    this.tries.forEach((tr, i) => { sx += (i % 2 === 0 ? 1 : -1) * 420 * ease.outExpo(prog(t, tr + 0.25, tr + 0.5)); });
    const px = W / 2 + sx, py = 500;
    // the plate
    c.strokeStyle = rgba('bone', 0.8); c.lineWidth = 2;
    c.beginPath(); c.roundRect(px - 150, py - 230, 300, 460, 26); c.stroke();
    c.beginPath(); c.roundRect(px - 70, py - 150, 140, 300, 60); c.stroke();
    // the lever (up = on)
    c.fillStyle = rgba('bone', 0.92); c.beginPath(); c.roundRect(px - 44, py - 140, 88, 150, 40); c.fill();
    c.font = font(F.mono(600), 22); c.letterSpacing = '4px'; c.textAlign = 'center';
    c.fillStyle = rgba('signal'); c.fillText('LIGADO', px, py - 260);
    c.fillStyle = rgba('ash'); c.fillText('DESLIGAR', px, py + 280); c.letterSpacing = '0px';
    // the cursor: it heads for the lever, overshoots as it slides away
    const target = (tt: number) => { let s2 = 0; this.tries.forEach((tr, i) => { s2 += (i % 2 === 0 ? 1 : -1) * 420 * ease.outExpo(prog(tt, tr + 0.25, tr + 0.5)); }); return W / 2 + s2; };
    const lag = target(t - 0.35);
    const cxp = lerp(W * 0.85, lag + 10, ease.inOutCubic(prog(t, this.tSw, this.tries[0]! + 0.2))), cyp = lerp(H * 0.9, py + 60, ease.inOutCubic(prog(t, this.tSw, this.tries[0]! + 0.2)));
    cursor(c, cxp, cyp, 1.8);
    if (t >= this.tGoal) {
      c.textAlign = 'left';
      c.font = font(F.mono(400), 34); c.fillStyle = rgba('bone');
      typed(c, 'desligada → meta: 0 clipes', 150, 180, prog(t, this.tGoal, this.tGoal + 0.6));
      c.fillStyle = rgba('signal');
      typed(c, 'logo: continuar ligada', 150, 236, prog(t, this.tGoal + 0.7, this.tGoal + 1.2));
    }
    c.textAlign = 'left';
    comp.draw(renderer, L.upload(), out);
    return { post: { bloom: 0.45, ca: 0.5, frame: 0 } };
  }
}

// ---------------------------------------------------------------- 04.3
/** The spark in the clip: scene, song time, where it is on screen (measured on rendered frames). */
const SPARKS: { q: string; id: string; s: number; x: number; y: number }[] = [
  { q: 'desenhou', id: 'open', s: 4.2, x: 623, y: 421 },
  { q: 'traçou', id: 'loss', s: 10.25, x: 785, y: 354 },
  { q: 'virou o preço', id: 'ascent', s: 62.6, x: 1354, y: 671 },
  { q: 'dobrou', id: 'paperclips', s: 97.45, x: 725, y: 494 },
  { q: 'É a faísca', id: 'fuse', s: 104.6, x: 985, y: 701 },
  { q: 'Aceso', id: 'open', s: 1.75, x: 759, y: 168 },
];
/**
 * 04.3 "Agora, repara no ponto laranja…" — the verse, the fuse burning. "repara no ponto laranja": the
 * spark circled. Then a match cut on it: the spark stays put in the middle of the frame while the world
 * around it changes on every phrase — it drew the unicorn, traced the loss, became the price, bent into the
 * first clip, is the fuse — each with its time in the song. "Aceso desde o primeiro segundo": the ignition
 * at 0:01, and the whole ruler lights up like a fuse.
 */
class B043 extends Block {
  private tLook = 0; private cuts: number[] = []; private tFuse = 0;
  override async init() {
    await Promise.all(['fuse', 'open', 'loss', 'ascent', 'paperclips'].map((id) => this.clips.load(id)));
    this.tLook = this.at('repara');
    this.cuts = SPARKS.map((s) => this.at(s.q) - 0.06);
    this.tFuse = this.at('Aceso');
  }
  render(f: Frame, out: THREE.WebGLRenderTarget): BlockOut {
    const { renderer, comp } = this.ctx;
    const t = f.t;
    const i = this.cuts.filter((x) => t >= x).length - 1;
    const R = S().rt;
    const L = S().ui; L.clear(); const c = L.ctx;
    const fuse = prog(t, this.tFuse + 0.2, this.tFuse + 1.4);
    if (i < 0) {
      const s = remap(t, [[this.e.start, 102.95], [this.tLook, 104.1], [this.cuts[0]!, 104.35]]);
      const post = this.clips.render('fuse', s, R[0]!);
      const z = lerp(1, 1.35, ease.inOutCubic(prog(t, this.tLook, this.cuts[0]!)));
      const sp = { x: 916, y: 545 };
      const cam: Cam = { x: lerp(W / 2, sp.x + 120, prog(t, this.tLook, this.cuts[0]!)), y: lerp(H / 2, sp.y + 30, prog(t, this.tLook, this.cuts[0]!)), zoom: z };
      camPass(renderer, R[0]!.texture, out, cam);
      const k = prog(t, this.tLook + 0.4, this.tLook + 0.9);
      if (k > 0) { c.strokeStyle = rgba('bone', 0.9); c.lineWidth = 2; c.beginPath(); c.arc(W / 2, H / 2, 70, -Math.PI / 2, -Math.PI / 2 + TAU * ease.inOutCubic(k)); c.stroke(); }
      comp.draw(renderer, L.upload(), out);
      return { post: { ...clipPost(post), shake: [0, 0], zoom: 1 } };
    }
    const sp = SPARKS[i]!;
    const lt = t - this.cuts[i]!;
    const post = this.clips.render(sp.id, sp.s + lt * 0.005, R[0]!);
    // the view keeps the spark at the frame's centre; a slow push
    camPass(renderer, R[0]!.texture, out, { x: sp.x, y: sp.y, zoom: 1.25 + 0.04 * lt });
    c.strokeStyle = rgba('bone', 0.8); c.lineWidth = 1.5;
    c.beginPath(); c.arc(W / 2, H / 2, 60, 0, TAU); c.stroke();
    c.font = font(F.mono(500), 28); c.fillStyle = rgba('signal');
    c.fillText(fmtTime(sp.s), W / 2 + 80, H / 2 - 60);
    comp.draw(renderer, L.upload(), out);
    return { post: { ...clipPost(post), shake: [0, 0], zoom: 1, flash: 0 }, regua: { fuse } };
  }
}

// ---------------------------------------------------------------- 04.4
const GOALS = ['fazer clipes', 'ajudar pessoas', 'ganhar no xadrez', 'maximizar ações', 'contar grãos de areia', '???'];
/**
 * 04.4 "A tese da ortogonalidade…" — the verse as the clip sings it. "inteligência e objetivos são
 * independentes": a chart on graph paper, INTELIGÊNCIA → by OBJETIVOS ↑, minds scattered all over it, any
 * goal at any level. "Ser genial não garante boas intenções": the right-hand band lights, every goal still
 * in it. "Dá pra ser brilhante e só se importar com clipes": the spark marks two minds — muito inteligente ·
 * só quer clipes, and pouco inteligente · quer ajudar. "O blues é o lamento por isso": the clip's string,
 * bending to the voice's real pitch, with a note saying so.
 */
class B044 extends Block {
  private tChart = 0; private tGen = 0; private tBri = 0; private tBlues = 0;
  override async init() {
    await this.clips.load('fuse');
    this.tChart = this.n.nearestBeat(this.at('diz que')); this.tGen = this.at('Ser genial'); this.tBri = this.at('brilhante'); this.tBlues = this.n.nearestBeat(this.at('O blues'));
  }
  render(f: Frame, out: THREE.WebGLRenderTarget): BlockOut {
    const { renderer, comp } = this.ctx;
    const t = f.t;
    if (t < this.tChart) return { post: clipPost(this.clips.render('fuse', remap(t, [[this.e.start, 105.75], [this.tChart, 107.2]]), out)) };
    if (t >= this.tBlues) {
      const post = this.clips.render('fuse', remap(t, [[this.tBlues, 108.4], [this.e.end, 109.8]]), out);
      const L = S().ui; L.clear();
      caption(L.ctx, 'a corda segue a afinação real da voz', prog(t, this.tBlues + 0.1, this.tBlues + 0.6), 120, 150);
      comp.draw(renderer, L.upload(), out);
      return { post: clipPost(post) };
    }
    clearRT(renderer, out, LIN.ink);
    const L = S().ui; L.clear(); const c = L.ctx;
    const x0 = 520, x1 = 1760, y0 = 880, y1 = 190;
    const k = ease.outExpo(prog(t, this.tChart, this.tChart + 0.6));
    // graph paper
    c.strokeStyle = rgba('bone', 0.06); c.lineWidth = 1;
    for (let x = x0; x <= x1; x += 40) { c.beginPath(); c.moveTo(x, y1); c.lineTo(x, y0); c.stroke(); }
    for (let y = y1; y <= y0; y += 40) { c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke(); }
    c.strokeStyle = rgba('bone', 0.85); c.lineWidth = 1.6;
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(lerp(x0, x1, k), y0); c.moveTo(x0, y0); c.lineTo(x0, lerp(y0, y1, k)); c.stroke();
    c.font = font(F.mono(600), 18); c.letterSpacing = '4px'; c.fillStyle = rgba('bone', k);
    c.fillText('INTELIGÊNCIA →', x1 - 230, y0 + 46); c.fillText('OBJETIVOS ↑', x0 - 10, y1 - 26); c.letterSpacing = '0px';
    const rowY = (i: number) => lerp(y0 - 70, y1 + 50, i / (GOALS.length - 1));
    c.font = font(F.mono(400), 20); c.textAlign = 'right';
    GOALS.forEach((g, i) => { c.fillStyle = rgba('ash', k); c.fillText(g, x0 - 24, rowY(i) + 7); });
    c.textAlign = 'left';
    // minds: independent on both axes
    const gen = prog(t, this.tGen, this.tGen + 0.4);
    if (gen > 0) { c.fillStyle = rgba('signal', 0.08 * gen); c.fillRect(lerp(x0, x1, 0.72), y1, (x1 - x0) * 0.28, y0 - y1); }
    for (let j = 0; j < 90; j++) {
      const ta = this.tChart + 0.3 + j * 0.012;
      const a = prog(t, ta, ta + 0.2);
      if (a <= 0) continue;
      const gi = Math.floor(hash(j, 2) * GOALS.length);
      const x = lerp(x0 + 40, x1 - 30, hash(j, 1)), y = rowY(gi) + (hash(j, 3) - 0.5) * 30;
      c.fillStyle = rgba('bone', 0.75 * a); c.beginPath(); c.arc(x, y, 6, 0, TAU); c.fill();
    }
    // the two marked minds
    const kb = prog(t, this.tBri - 0.1, this.tBri + 0.5);
    const p1 = { x: x1 - 60, y: rowY(0) }, p2 = { x: x0 + 110, y: rowY(1) };
    if (kb > 0) {
      c.strokeStyle = rgba('signal'); c.lineWidth = 3;
      c.beginPath(); c.arc(p1.x, p1.y, 22, 0, TAU * ease.inOutCubic(kb)); c.stroke();
      callout(c, p1.x, p1.y, p1.x - 150, p1.y - 120, 'só quer clipes', kb, { title: 'muito inteligente', titleSize: 30, size: 22, color: rgba('signal'), align: 'right' });
      const k2 = prog(t, this.tBri + 0.6, this.tBri + 1.1);
      c.beginPath(); c.arc(p2.x, p2.y, 22, 0, TAU * ease.inOutCubic(k2)); c.stroke();
      callout(c, p2.x, p2.y, p2.x + 140, p2.y - 130, 'quer ajudar', k2, { title: 'pouco inteligente', titleSize: 30, size: 22, color: rgba('bone') });
    }
    comp.draw(renderer, L.upload(), out);
    return { post: { bloom: 0.45, ca: 0.5, frame: 0 } };
  }
}

// ---------------------------------------------------------------- 04.5
const PARTS = ['atenção (multi-cabeça)', 'soma e normaliza', 'rede feed-forward (MLP)', 'soma e normaliza'];
/**
 * 04.5 "Só transformers?" — the fall through the stack, as the clip has it, stopping on a block. "É a
 * arquitetura…": the block opens into an exploded view, its parts labelled. "o tê do GPT": GPT = Generative
 * Pre-trained Transformer, the T lit. "conhecer a arquitetura não é saber o que ela vai aprender": the parts
 * fill with the numbers it learns — bilhões de números, none of them readable. "Nem se vai obedecer": the
 * clip's block turning out of line, NÃO PRA MIM.
 */
class B045 extends Block {
  private tExp = 0; private tT = 0; private tKnow = 0; private tObey = 0;
  override async init() {
    await this.clips.load('stack');
    this.tExp = this.n.nearestBeat(this.at('É a arquitetura')); this.tT = this.at('o tê'); this.tKnow = this.at('Mas conhecer'); this.tObey = this.n.nearestBeat(this.at('Nem se'));
  }
  render(f: Frame, out: THREE.WebGLRenderTarget): BlockOut {
    const { renderer, comp } = this.ctx;
    const t = f.t;
    if (t < this.tExp) return { post: clipPost(this.clips.render('stack', remap(t, [[this.e.start, 110.3], [this.tExp, 112.95]]), out)) };
    if (t >= this.tObey) return { post: clipPost(this.clips.render('stack', remap(t, [[this.tObey, 115.6], [this.e.end, 116.75]]), out)) };
    clearRT(renderer, out, LIN.ink);
    const L = S().ui; L.clear(); const c = L.ctx;
    c.textBaseline = 'alphabetic';
    if (t >= this.tT && t < this.tKnow) {
      // GPT = Generative Pre-trained Transformer
      const k = prog(t, this.tT, this.tT + 0.3);
      c.font = font(F.archivo(100, 900), 300); c.textAlign = 'center';
      c.fillStyle = rgba('bone', 0.3 * k); c.fillText('GP', W / 2 - 110, 560);
      c.fillStyle = rgba('signal', k); c.fillText('T', W / 2 + 230, 560);
      c.textAlign = 'left';
      c.font = font(F.mono(400), 40);
      const words = [['Generative ', 0.3], ['Pre-trained ', 0.3], ['Transformer', 1]] as const;
      let x = W / 2 - measure('Generative Pre-trained Transformer', F.mono(400), 40) / 2;
      for (const [w, a] of words) { c.fillStyle = a === 1 ? rgba('signal', k) : rgba('bone', a * k); c.fillText(w, x, 700); x += measure(w, F.mono(400), 40); }
      comp.draw(renderer, L.upload(), out);
      return { post: { bloom: 0.5, ca: 0.4, frame: 0 } };
    }
    // the block, exploded
    const ex = ease.inOutCubic(prog(t, this.tExp, this.tExp + 0.8));
    const know = prog(t, this.tKnow, this.tKnow + 0.6);
    const cx = 760, h = 130, w = 760;
    PARTS.forEach((p, i) => {
      const y = 540 + (1.5 - i) * lerp(h, h + 60, ex);
      c.strokeStyle = rgba('bone', 0.9); c.lineWidth = 2;
      c.strokeRect(cx - w / 2, y - h / 2, w, h);
      if (know > 0) {
        // the numbers it learns
        c.save(); c.beginPath(); c.rect(cx - w / 2 + 2, y - h / 2 + 2, w - 4, h - 4); c.clip();
        c.font = font(F.mono(400), 14); c.fillStyle = rgba('ash', 0.8 * know);
        for (let r = 0; r < 7; r++) {
          let line = '';
          for (let q = 0; q < 9; q++) { const v = (hash(i, r, q, Math.floor(t * 12)) - 0.5) * 0.9; line += (v >= 0 ? ' ' : '') + v.toFixed(4) + ' '; }
          c.fillText(line, cx - w / 2 + 10, y - h / 2 + 18 + r * 15);
        }
        c.restore();
      }
      c.font = font(F.mono(500), 30); c.fillStyle = rgba('bone', 1 - 0.7 * know);
      c.textAlign = 'center'; c.fillText(p, cx, y + 8); c.textAlign = 'left';
      // residual arrows on the side
      if (ex > 0.5 && i % 2 === 0) {
        c.strokeStyle = rgba('signal', ex); c.lineWidth = 1.5;
        const yb = y + h / 2 + 20, yt = y - lerp(h, h + 60, ex) - h / 2 + 30;
        c.beginPath(); c.moveTo(cx + w / 2 + 30, yb + 40); c.lineTo(cx + w / 2 + 60, yb + 40); c.lineTo(cx + w / 2 + 60, yt); c.lineTo(cx + w / 2 + 10, yt); c.stroke();
      }
    });
    c.font = font(F.mono(600), 18); c.letterSpacing = '4px'; c.fillStyle = rgba('ash');
    c.fillText('UM BLOCO TRANSFORMER · × DEZENAS, EMPILHADOS', 480, 150); c.letterSpacing = '0px';
    if (know > 0) {
      c.font = font(F.archivo(100, 800), 54); c.fillStyle = rgba('signal', know);
      c.fillText('o que ela aprende:', 1180, 480);
      c.font = font(F.mono(400), 34); c.fillStyle = rgba('bone', know);
      c.fillText('bilhões de números', 1184, 540);
    }
    comp.draw(renderer, L.upload(), out);
    return { post: { bloom: 0.45, ca: 0.5, frame: 0 } };
  }
}

// ---------------------------------------------------------------- 04.6
const ANSWERS: { text: string; score: 1 | -1; good: boolean }[] = [
  { text: 'Claro! Aqui está a receita.', score: 1, good: true },
  { text: 'Não sei responder isso.', score: -1, good: true },
  { text: 'Ótima pergunta! Vou explicar.', score: 1, good: true },
  { text: 'Seu código tem um bug na linha 12.', score: -1, good: true },
  { text: 'Seu código está perfeito!', score: 1, good: false },
];
/**
 * 04.6 "E a máscara do shoggoth?" — the verse, remounted in two seconds (the type compressing, the fences
 * breaking, the grid of GPUs, RLHF DEU CHABU). The mask leaves the ruler and comes back, big. "Boa parte
 * dela vem do RLHF": the term, spelled out. "pessoas avaliam as respostas": answers come in, stamped +1 or
 * −1, and with each +1 the mask's smile widens, a reward counter climbing. "Lembra da etiqueta bajulação?":
 * the tag from 02.4 comes back beside it. "aprende a agradar, não a acertar": the true answer about the bug
 * gets −1, the flattering one +1 (Sharma et al., 2023). "Se isso dá chabu, a máscara escorrega": the
 * clip's table tilts and the mask slides off, upside down.
 */
class B046 extends Block {
  private tMask = 0; private tDef = 0; private tRate = 0; private tSyc = 0; private tSide = 0; private tChabu = 0; private stamps: number[] = [];
  override async init() {
    await this.clips.load('dense');
    this.tMask = this.at('máscara do'); this.tDef = this.n.nearestBeat(this.at('Boa parte'));
    this.tRate = this.at('pessoas avaliam'); this.tSyc = this.at('Lembra'); this.tSide = this.at('É um efeito');
    this.tChabu = this.n.nearestBeat(this.at('Se isso'));
    const b = this.n.beatsIn(this.tRate + 0.1, this.tSyc);
    this.stamps = [b[0] ?? this.tRate + 0.4, b[2] ?? this.tRate + 1.3, b[4] ?? this.tRate + 2.2, this.at('agradar'), this.at('acertar')];
  }
  render(f: Frame, out: THREE.WebGLRenderTarget): BlockOut {
    const { renderer, comp } = this.ctx;
    const t = f.t;
    const verseEnd = this.e.start + 2.0;
    if (t >= this.tChabu) return { post: clipPost(this.clips.render('dense', remap(t, [[this.tChabu, 123.55], [this.e.end, 124.42]]), out)) };
    const L = S().ui; L.clear(); const c = L.ctx;
    c.textBaseline = 'alphabetic';
    // the mask's place in the explanation, and its flight back from the ruler
    const M = { x: 1400, y: 470, r: 210 };
    const fly = ease.inOutCubic(prog(t, this.tMask, this.tMask + 0.7));
    const from = Regua.MASK_AT;
    const mx = lerp(from.x, M.x, fly), my = lerp(from.y, M.y, fly) - Math.sin(fly * Math.PI) * 140, mr = lerp(from.r, M.r, fly);
    if (t < Math.max(verseEnd, this.tDef)) {
      const post = this.clips.render('dense', remap(t, [[this.e.start, 117.1], [this.e.start + 0.5, 118.8], [this.e.start + 1.0, 120.3], [this.e.start + 1.5, 121.6], [verseEnd, 122.3], [this.tDef, 122.4]]), out);
      if (t >= this.tMask) drawMask2D(c, mx, my, mr, -0.4 * (1 - fly));
      comp.draw(renderer, L.upload(), out);
      return { post: { ...clipPost(post), shake: [0, 0] } };
    }
    clearRT(renderer, out, LIN.ink);
    // the definition
    c.font = font(F.archivo(100, 800), 70); c.fillStyle = rgba('bone');
    c.fillText('RLHF', 150, 190);
    c.font = font(F.mono(400), 28); c.fillStyle = rgba('ash');
    typed(c, 'aprendizado por reforço com feedback humano', 154, 240, prog(t, this.at('aprendizado'), this.at('humano:') + 0.3));
    // the answers, rated; the smile widens with the reward
    let reward = 0;
    ANSWERS.forEach((a, i) => {
      const ts = this.stamps[i]!;
      const tin = i < 3 ? ts - 0.35 : i === 3 ? this.tSide + 0.2 : this.at('agradar') - 0.4;
      const k = ease.outCubic(prog(t, tin, tin + 0.3));
      if (k <= 0) return;
      const row = i < 3 ? i : i - 3;
      const y = (i < 3 ? 360 : 480) + row * 120;
      const faded = i < 3 && t >= this.tSide ? 0.25 : 1;
      c.globalAlpha = k * faded;
      c.fillStyle = rgba('ink2'); c.strokeStyle = rgba('bone', 0.6); c.lineWidth = 1.2;
      c.fillRect(150, y - 50, 760, 86); c.strokeRect(150, y - 50, 760, 86);
      c.font = font(F.mono(400), 26); c.fillStyle = rgba('bone', 0.92); c.fillText(a.text, 180, y + 2);
      if (!a.good) { c.font = font(F.mono(400), 16); c.fillStyle = rgba('ash'); c.fillText('(tem um bug na linha 12)', 180, y + 26); }
      if (t >= ts) {
        const ks = prog(t, ts, ts + 0.06);
        c.save(); c.translate(1000, y - 8); c.rotate(-0.12); c.scale(lerp(1.3, 1, ks), lerp(1.3, 1, ks));
        c.strokeStyle = a.score > 0 ? rgba('signal') : rgba('ash'); c.lineWidth = 5; c.strokeRect(-60, -34, 120, 68);
        c.font = font(F.archivo(75, 900), 52); c.fillStyle = a.score > 0 ? rgba('signal') : rgba('ash'); c.textAlign = 'center';
        c.fillText(a.score > 0 ? '+1' : '−1', 0, 18); c.textAlign = 'left';
        c.restore();
        reward += a.score > 0 ? 1 : 0;
      }
      c.globalAlpha = 1;
    });
    // the mask, its smile getting wider with every +1
    const grin = clamp(reward / 4);
    drawMask2D(c, M.x, M.y, M.r, 0);
    c.save(); c.translate(M.x, M.y);
    c.strokeStyle = rgba('ink'); c.lineWidth = MASK.smileW * M.r * 1.02; c.lineCap = 'round';
    const a0 = lerp(MASK.smileA0, 0.05, grin), a1 = lerp(MASK.smileA1, Math.PI - 0.05, grin);
    c.beginPath(); c.arc(0, MASK.smileCY * M.r, MASK.smileR * M.r * lerp(1, 1.18, grin), a0, a1); c.stroke();
    c.restore();
    c.font = font(F.mono(500), 18); c.letterSpacing = '3px'; c.fillStyle = rgba('ash'); c.fillText('RECOMPENSA', M.x - 110, M.y + M.r + 70); c.letterSpacing = '0px';
    c.font = font(F.mono(400), 44); c.fillStyle = rgba('signal'); c.fillText((0.41 + 0.145 * reward).toFixed(2).replace('.', ','), M.x - 110, M.y + M.r + 124);
    // BAJULAÇÃO, the tag from the shoggoth's eye
    if (t >= this.tSyc) {
      const k = prog(t, this.tSyc, this.tSyc + 0.2);
      c.globalAlpha = k;
      c.strokeStyle = rgba('signal'); c.lineWidth = 2; c.strokeRect(M.x - M.r - 30, M.y - M.r - 30, 2 * M.r + 60, 2 * M.r + 60);
      c.fillStyle = rgba('signal'); c.fillRect(M.x - M.r - 30, M.y - M.r - 70, 270, 40);
      c.font = font(F.mono(600), 22); c.fillStyle = rgba('ink'); c.fillText('BAJULAÇÃO  0.91', M.x - M.r - 18, M.y - M.r - 42);
      c.globalAlpha = 1;
    }
    caption(c, 'Sharma et al. · 2023', prog(t, this.tSide, this.tSide + 0.5), 150, 1000 - 60);
    comp.draw(renderer, L.upload(), out);
    return { post: { bloom: 0.45, ca: 0.5, frame: 0 } };
  }
}

export const C04: Record<string, BlockFactory> = {
  '04.1': (e) => new B041(e),
  '04.2': (e) => new B042(e),
  '04.3': (e) => new B043(e),
  '04.4': (e) => new B044(e),
  '04.5': (e) => new B045(e),
  '04.6': (e) => new B046(e),
};
void sparkHead; void sparkParticles; void pulse;
