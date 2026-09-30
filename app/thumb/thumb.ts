// The YouTube thumbnail of the full pt-BR video ("Opus 5.5 criou esse vídeo"). The clip's shoggoth, every
// eye open and staring at the viewer, the assistant's mask held up beside it; the title in the video's own
// type, on the dark to the left. Variants (thumb.html?v=):
//   hino         "O HINO DA IA", under the line the narration opens with.
//   codigo       "100% CÓDIGO": an x-ray band (the explainer's, 00.2 and 02.5) has crossed half the
//                creature, which is left made of its own shader code.
//   hino-codigo  the title of hino over the creature of codigo, under "FEITO 100% COM CÓDIGO".
//   simples      the title alone, a little larger, and the creature alone beside it: no mask, no tags
//                (too small to read in a feed, and larger ones crowd the title).
//   clipe        the title of simples beside a single paperclip instead of the creature: the first one of
//                the paperclips plate, the spark that bent it still glowing at its end.
// (Outside app/src on purpose: the explainer counts and lists the video's code from there.)
import * as THREE from 'three';
import { Scene, type Frame, type PostOverrides } from '../src/engine/scene';
import { FSPass, Layer2D, W, H, makeRT } from '../src/engine/gl';
import { rgba } from '../src/engine/palette';
import { F, font, glyphX, measure } from '../src/engine/type';
import { TAU } from '../src/engine/util';
import { MASK } from '../src/scenes/_motifs';
import { Clips } from '../src/letra/clips';
import { source } from '../src/letra/code';

/** Song time of the shoggoth: every eye open, back from their glance at the P(doom) box, none shut yet. */
const SHOG_T = 35.1;
const MASK_R = 0.34;

/** What the thumbnail needs of the shoggoth scene (see scenes/shoggoth.ts). */
interface ShogLike { eyeScr: { x: number; y: number; r: number; vis: boolean }[]; maskW: THREE.Vector3; project(p: THREE.Vector3, squash?: number): { x: number; y: number; s: number } }

/** The clip's frame reframed: the source point at the centre of the screen, the zoom, and a roll (radians, clockwise). */
interface Cam { x: number; y: number; zoom: number; roll?: number }
function toScreen(c: Cam, x: number, y: number) {
  const dx = (x - c.x) * c.zoom, dy = (y - c.y) * c.zoom, cr = Math.cos(c.roll ?? 0), sr = Math.sin(c.roll ?? 0);
  return { x: cr * dx - sr * dy + W / 2, y: sr * dx + cr * dy + H / 2 };
}

/** A detector box as the clip draws them (scenes/shoggoth.ts, box()), twice the size: on an eye or on the mask. */
interface Tag { eye: number | 'mask'; name: string; conf: string; below?: boolean }
interface Variant {
  /** The clip scene behind the title and its song time (default: the shoggoth at SHOG_T). */
  scene?: { id: string; t: number };
  /** The line above the title (none: the title alone). */
  kicker?: string;
  /** The kicker's size (px; default 30): a short one can be read larger. */
  kickSize?: number;
  lines: string[];
  /** Where the signal colour starts in each line (-1: none). */
  hot: number[];
  /** The title's width (px; default 780). */
  titleW?: number;
  /** The title's left edge (px; default 96). */
  titleX?: number;
  /** The x-ray band (source px): left of it, the creature is made of its code. */
  band?: number;
  /** The mask (default: shown), the detector tags (default TAGS) and the framing (default DEFAULT_CAM). */
  mask?: boolean;
  tags?: Tag[];
  cam?: Cam;
}

/** The mask and one of the clip's own eye labels: the assistant, and what the detector sees behind it. */
const TAGS: Tag[] = [
  { eye: 'mask', name: 'ASSISTENTE', conf: '0.99', below: true },
  { eye: 0, name: 'BAJULAÇÃO', conf: '0.91' },
];
/** The creature right of the title, the mask whole in the top-right corner. */
const DEFAULT_CAM: Cam = { x: 934, y: 500, zoom: 0.95 };

const VARIANTS: Record<string, Variant> = {
  hino: { kicker: 'UMA MÚSICA DE AMOR SOBRE O FIM DO MUNDO', lines: ['O HINO', 'DA IA'], hot: [-1, 3] },
  codigo: { kicker: 'NENHUM QUADRO FOI DESENHADO À MÃO', lines: ['100%', 'CÓDIGO'], hot: [0, -1], band: 1130 },
  'hino-codigo': { kicker: 'FEITO 100% COM CÓDIGO', lines: ['O HINO', 'DA IA'], hot: [-1, 3], band: 1130, kickSize: 44 },
  // (the creature right, with the tentacle that held the mask reaching out of the frame's top-right corner)
  simples: { lines: ['O HINO', 'DA IA'], hot: [-1, 3], titleW: 820, titleX: 125, tags: [], mask: false, cam: { x: 735, y: 525, zoom: 1.05 } },
  // (the first paperclip of the paperclips plate, just bent by the spark and still hot, turned to rise on the right)
  clipe: { lines: ['O HINO', 'DA IA'], hot: [-1, 3], titleW: 820, titleX: 125, scene: { id: 'paperclips', t: 97.65 }, cam: { x: 545, y: 126, zoom: 0.78, roll: -0.7 } },
};

/**
 * The clip's frame through the camera, mirrored past its edges instead of black (with the mask out of the
 * scene only the dark background reaches them). Left of the band, the picture is made of its code: the
 * glyphs lit by the picture under them and nothing where it is dark, so only the creature turns to code.
 * The band's furniture is the x-ray's (letra/xray.ts): hairline edges, a signal glow on the leading edge.
 */
const view = new FSPass(/* glsl */ `
  uniform sampler2D tex, codeTex; uniform vec4 cam; uniform float band, fill;
  void main() {
    vec2 sp = vec2(vUv.x * ${W.toFixed(1)}, (1.0 - vUv.y) * ${H.toFixed(1)});
    vec2 d = (sp - 0.5 * vec2(${W.toFixed(1)}, ${H.toFixed(1)})) / cam.z;
    float cr = cos(cam.w), sr = sin(cam.w);
    vec2 p = vec2(cr * d.x + sr * d.y, -sr * d.x + cr * d.y) + cam.xy;
    vec2 raw = vec2(p.x / ${W.toFixed(1)}, 1.0 - p.y / ${H.toFixed(1)});
    vec2 uv = 1.0 - abs(1.0 - abs(raw));
    vec3 sc = texture(tex, uv).rgb;
    if (fill > 0.5) {
      // a turned frame reaches far past its edges, where a mirror would repeat the picture: the background
      // there instead (the corners' colour), faded in over the last 24 px
      vec3 bg = 0.25 * (texture(tex, vec2(0.01)).rgb + texture(tex, vec2(0.99, 0.01)).rgb + texture(tex, vec2(0.01, 0.99)).rgb + texture(tex, vec2(0.99)).rgb);
      vec2 e = min(p, vec2(${W.toFixed(1)}, ${H.toFixed(1)}) - p);
      sc = mix(bg, texture(tex, clamp(raw, 0.0, 1.0)).rgb, smoothstep(0.0, 24.0, min(e.x, e.y)));
    }
    vec3 col = sc;
    if (band > 0.0) {
      vec4 cd = texture(codeTex, vUv);
      float bx = (band - cam.x) * cam.z + ${(W / 2).toFixed(1)}, bw = 22.0 * cam.z;
      float behind = smoothstep(bx - bw + 1.5, bx - bw - 1.5, sp.x);
      float inBand = 1.0 - smoothstep(bw - 1.5, bw + 1.5, abs(sp.x - bx));
      // (each glyph lit by the picture's local average: the hatching's lines and gaps would leave it patchy)
      vec3 soft = vec3(0.0);
      for (int i = 0; i < 12; i++) {
        float a = float(i) * 2.39996, r = sqrt((float(i) + 0.5) / 12.0) * 7.0 / cam.z;
        vec2 q = p + vec2(cos(a), sin(a)) * r;
        vec2 quv = vec2(q.x / ${W.toFixed(1)}, 1.0 - q.y / ${H.toFixed(1)});
        soft += texture(tex, 1.0 - abs(1.0 - abs(quv))).rgb;
      }
      soft /= 12.0;
      // (and only where there is a picture: the dark background around the creature stays dark)
      vec3 code = sc * 0.04 + soft * 2.6 * cd.a * mix(0.12, 1.0, smoothstep(0.02, 0.07, luma(soft)));
      col = mix(sc, code, behind);
      col = mix(col, C_INK2 * 0.6 + sc * 0.35, inBand * 0.55);
      float dl = abs(sp.x - (bx - bw)), dr = abs(sp.x - (bx + bw));
      col += C_BONE * 0.7 * (smoothstep(1.2, 0.0, dl) + smoothstep(1.2, 0.0, dr));
      col += C_SIGNAL * 0.7 * exp(-max(sp.x - bx - bw, 0.0) / 6.0) * step(bx + bw - 1.0, sp.x);
    }
    fragColor = vec4(col, 1.0);
  }`, { tex: { value: null }, codeTex: { value: null }, cam: { value: new THREE.Vector4(W / 2, H / 2, 1, 0) }, band: { value: 0 }, fill: { value: 0 } });

export default class Thumb extends Scene {
  private clips!: Clips;
  private v!: Variant;
  private rt = makeRT();
  private ui = new Layer2D();
  private code = new Layer2D();
  private debug = new URLSearchParams(location.search).has('debug');

  override async init() {
    this.v = VARIANTS[String(this.ctx.params.variant)] ?? VARIANTS.hino!;
    this.clips = new Clips(this.ctx);
    await this.clips.load(this.v.scene?.id ?? 'shoggoth');
    if (this.v.band) {
      // the creature's shader, as one dense run of its real source filling every row (large enough to read
      // as code in the thumbnail), from its first line of GLSL
      const f = source('shoggoth-glsl.ts');
      const text = f.lines.slice(f.kind.indexOf('glsl')).map((l) => l.trim()).filter(Boolean).join('  ');
      const c = this.code.ctx, size = 24, fam = F.mono(500);
      const cols = Math.floor((W - 20) / measure('m', fam, size)), lh = size * 1.12;
      this.code.clear();
      c.font = font(fam, size); c.fillStyle = rgba('bone'); c.textBaseline = 'alphabetic';
      for (let row = 0; row * lh < H + lh; row++) c.fillText(text.slice(row * cols, (row + 1) * cols), 10, (row + 0.85) * lh);
      this.code.upload();
    }
  }

  override render(_f: Frame, out: THREE.WebGLRenderTarget): PostOverrides {
    const { renderer, comp } = this.ctx;
    const v = this.v, CAM = v.cam ?? DEFAULT_CAM;
    const id = v.scene?.id ?? 'shoggoth', shog = id === 'shoggoth';
    // the clip's picture without its lyric; the shoggoth also without its tags and boxes (drawn here,
    // bigger) and without its mask (drawn here too, so it can sit whole in the frame: in the clip's shot
    // it runs off the top edge)
    const sp = this.clips.render(id, v.scene?.t ?? SHOG_T, this.rt, shog ? { bare: true, hideMask: true } : { bare: true });
    const u = view.u;
    u.tex!.value = this.rt.texture;
    u.codeTex!.value = this.code.texture;
    (u.cam!.value as THREE.Vector4).set(CAM.x, CAM.y, CAM.zoom, CAM.roll ?? 0);
    u.band!.value = v.band ?? 0;
    u.fill!.value = CAM.roll ? 1 : 0;
    view.render(renderer, out);

    const L = this.ui; L.clear(); const c = L.ctx;
    if (shog) {
      const sc = this.clips.scene<ShogLike>('shoggoth');
      const m = sc.project(sc.maskW), mp = toScreen(CAM, m.x, m.y);
      if (v.mask !== false) engravedMask(c, mp.x, mp.y, MASK_R * m.s * CAM.zoom);
      if (this.debug) {
        c.font = font(F.mono(700), 22); c.fillStyle = rgba('acid'); c.strokeStyle = rgba('acid');
        sc.eyeScr.forEach((e, i) => { const p = toScreen(CAM, e.x, e.y); c.fillText(String(i), p.x + 6, p.y - 6); c.beginPath(); c.arc(p.x, p.y, e.r * CAM.zoom, 0, TAU); c.stroke(); });
      }
      this.drawTags(c, sc);
    }
    this.drawTitle(c);
    comp.draw(renderer, L.upload(), out);
    // (the scene's own bloom: the hot clip glows by it)
    return { bloom: sp.bloom ?? 0.7, bloomThreshold: sp.bloomThreshold ?? 0.82, ca: 0.6, grain: 0.04, vignette: 0.45, hud: 0, frame: 0, shake: [0, 0], zoom: 1 };
  }

  private drawTags(c: CanvasRenderingContext2D, sc: ShogLike) {
    const CAM = this.v.cam ?? DEFAULT_CAM;
    for (const tag of this.v.tags ?? TAGS) {
      let x: number, y: number, hw: number, hh: number;
      if (tag.eye === 'mask') {
        const m = sc.project(sc.maskW);
        ({ x, y } = toScreen(CAM, m.x, m.y));
        hw = hh = MASK_R * m.s * CAM.zoom * 1.14;
      } else {
        const e = sc.eyeScr[tag.eye]!;
        ({ x, y } = toScreen(CAM, e.x, e.y));
        hw = e.r * CAM.zoom * 1.7; hh = e.r * CAM.zoom * 1.5;
      }
      const x0 = x - hw, x1 = x + hw, y0 = y - hh, y1 = y + hh;
      const L = Math.min(hw, hh) * 0.34;
      c.strokeStyle = rgba('bone', 0.85); c.lineWidth = 2.2;
      c.beginPath();
      for (const [px, py, sx, sy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]] as const) {
        c.moveTo(px + sx * L, py); c.lineTo(px, py); c.lineTo(px, py + sy * L);
      }
      c.stroke();
      c.strokeStyle = rgba('bone', 0.18); c.lineWidth = 1.5; c.strokeRect(x0, y0, x1 - x0, y1 - y0);
      // the label: on the box's top-left corner, or under the box (the mask's top is near the frame's)
      const label = `${tag.name}  ${tag.conf}`;
      c.font = font(F.mono(600), 24); c.letterSpacing = '2px';
      const tw = c.measureText(label).width + 22, th = 36;
      const tx = Math.min(x0, W - 40 - tw), ty = tag.below ? y1 : y0 - th;
      c.fillStyle = rgba('signal', 0.95); c.fillRect(tx, ty, tw, th);
      c.fillStyle = rgba('ink'); c.fillText(label, tx + 11, ty + th - 10);
      c.letterSpacing = '0px';
    }
  }

  /** The kicker in Plex Mono, then the title in Archivo condensed black, the block centred on the frame's height. */
  private drawTitle(c: CanvasRenderingContext2D) {
    const v = this.v;
    const X = v.titleX ?? 96, maxW = v.titleW ?? 780;
    const fam = F.archivo(62, 900);
    const size = Math.min(360, ...v.lines.map((l) => (maxW / measure(l, fam, 100)) * 100));
    const cap = size * 0.72, lead = size * 0.9, kick = v.kicker ? v.kickSize ?? 30 : 0, gap = kick * 1.7;
    const top = (H - (kick + gap + cap + lead * (v.lines.length - 1))) / 2;
    c.textBaseline = 'alphabetic';
    if (v.kicker) {
      c.font = font(F.mono(500), kick); c.letterSpacing = `${kick / 10}px`;
      c.fillStyle = rgba('signal');
      c.fillText(v.kicker, X + 4, top + kick * 0.72);
      c.letterSpacing = '0px';
    }
    c.font = font(fam, size);
    v.lines.forEach((line, i) => {
      const y = top + kick + gap + cap + i * lead, h = v.hot[i] ?? -1;
      c.fillStyle = rgba('bone');
      c.fillText(h < 0 ? line : line.slice(0, h), X, y);
      if (h >= 0) { c.fillStyle = rgba('signal'); c.fillText(line.slice(h), X + glyphX(line, h, fam, size), y); }
    });
  }
}

/**
 * The mask as the clip renders it (scenes/shoggoth-glsl.ts): a bone disc engraved with fine diagonal lines,
 * its edge showing at the lower left, lit from the upper right; the face of _motifs.ts.
 */
function engravedMask(c: CanvasRenderingContext2D, x: number, y: number, R: number) {
  c.save();
  // a soft shadow on the creature behind it, and the disc's thickness
  c.fillStyle = 'rgba(0,0,0,0.45)';
  c.beginPath(); c.arc(x - R * 0.1, y + R * 0.12, R * 1.02, 0, TAU); c.fill();
  c.fillStyle = rgba('ash');
  c.beginPath(); c.arc(x - R * 0.05, y + R * 0.05, R, 0, TAU); c.fill();
  const g = c.createRadialGradient(x + R * 0.35, y - R * 0.4, R * 0.1, x, y, R * 1.05);
  g.addColorStop(0, rgba('bone')); g.addColorStop(0.7, '#E4DED3'); g.addColorStop(1, '#C9C2B6');
  c.fillStyle = g;
  c.beginPath(); c.arc(x, y, R, 0, TAU); c.fill();
  // the burin lines
  c.save();
  c.beginPath(); c.arc(x, y, R, 0, TAU); c.clip();
  c.strokeStyle = 'rgba(40,36,32,0.10)'; c.lineWidth = 1;
  for (let d = -2 * R; d < 2 * R; d += 4.5) { c.beginPath(); c.moveTo(x + d - R, y - R); c.lineTo(x + d + R, y + R); c.stroke(); }
  c.restore();
  // the face
  c.fillStyle = rgba('ink');
  for (const s of [-1, 1]) { c.beginPath(); c.arc(x + s * MASK.eyeX * R, y + MASK.eyeY * R, MASK.eyeR * R, 0, TAU); c.fill(); }
  c.strokeStyle = rgba('ink'); c.lineWidth = MASK.smileW * R; c.lineCap = 'round';
  c.beginPath(); c.arc(x, y + MASK.smileCY * R, MASK.smileR * R, MASK.smileA0, MASK.smileA1); c.stroke();
  c.restore();
}
