// The video's own source code, as text on screen: every .ts file of app/src (raw, through Vite), drawn as a
// listing in IBM Plex Mono. "Tudo que você viu é código": the explainer shows the real lines that draw
// the image. Line counts are measured, not written down (the clip's code: app/src without letra/).
import { rgba } from '../engine/palette';
import { F, font } from '../engine/type';

const RAW = import.meta.glob<string>('../**/*.ts', { query: '?raw', import: 'default', eager: true });

export interface SourceFile { path: string; name: string; lines: string[]; kind: ('code' | 'comment' | 'glsl' | 'blank')[] }

const FILES: SourceFile[] = Object.entries(RAW).map(([p, text]) => {
  // (Vite keys the files of this folder './x.ts', the rest '../dir/x.ts')
  const path = p.startsWith('./') ? `app/src/letra/${p.slice(2)}` : p.replace(/^\.\.\//, 'app/src/');
  const lines = text.replace(/\r\n/g, '\n').replace(/\n$/, '').split('\n');
  // GLSL: the template literals tagged /* glsl */ (the shaders)
  let glsl = false;
  const kind = lines.map((l) => {
    const s = l.trim();
    const start = /\/\*\s*glsl\s*\*\/\s*`/.test(l);
    const k = glsl || start ? 'glsl' : s === '' ? 'blank' : s.startsWith('//') || s.startsWith('*') || s.startsWith('/*') ? 'comment' : 'code';
    if (start) glsl = !/`\s*[,;)]?\s*$/.test(l.replace(/.*\/\*\s*glsl\s*\*\/\s*`/, ''));
    else if (glsl && /`/.test(l)) glsl = false;
    return k as SourceFile['kind'][number];
  });
  return { path, name: path.split('/').pop()!, lines, kind };
}).sort((a, b) => a.path.localeCompare(b.path));

/** The clip's code (everything but the explainer's own folder). */
export const CLIP_FILES = FILES.filter((f) => !f.path.includes('/letra/'));
export const ALL_FILES = FILES;
export const lineCount = (files: SourceFile[]) => files.reduce((n, f) => n + f.lines.length, 0);

export function source(name: string): SourceFile {
  const f = FILES.find((x) => x.name === name || x.path.endsWith(name));
  if (!f) throw new Error(`source not found: ${name}`);
  return f;
}

/** Every file of the clip's code in one long listing, each file opened by a header line (for the flight through it). */
export interface DocLine { text: string; kind: SourceFile['kind'][number] | 'header'; file: number; n: number }
let docCache: DocLine[] | null = null;
export function clipDoc(): DocLine[] {
  if (docCache) return docCache;
  const out: DocLine[] = [];
  CLIP_FILES.forEach((f, fi) => {
    out.push({ text: `// ── ${f.path} · ${f.lines.length} linhas`, kind: 'header', file: fi, n: 0 });
    f.lines.forEach((l, i) => out.push({ text: l, kind: f.kind[i]!, file: fi, n: i + 1 }));
    out.push({ text: '', kind: 'blank', file: fi, n: 0 });
  });
  return (docCache = out);
}
/** Where line n (1-based) of a file sits in clipDoc(). */
export function docIndex(name: string, n: number) {
  const fi = CLIP_FILES.findIndex((x) => x.name === name);
  return clipDoc().findIndex((l) => l.file === fi && l.n === n);
}

/** Draw the clip's whole listing at `scroll` (index into clipDoc, fractional). */
export function drawDoc(c: CanvasRenderingContext2D, o: { x: number; y: number; w: number; h: number; scroll: number; size?: number; lead?: number; alpha?: number }) {
  const doc = clipDoc();
  const size = o.size ?? 16, lh = size * (o.lead ?? 1.32);
  c.save();
  c.beginPath(); c.rect(o.x, o.y, o.w, o.h); c.clip();
  c.globalAlpha *= o.alpha ?? 1;
  c.textBaseline = 'alphabetic';
  const first = Math.floor(o.scroll), frac = o.scroll - first;
  const n = Math.ceil(o.h / lh) + 2;
  for (let k = 0; k < n; k++) {
    const d = doc[first + k];
    if (!d) continue;
    const y = o.y + (k - frac + 0.85) * lh;
    if (d.kind === 'header') {
      c.font = font(F.mono(600), size);
      c.fillStyle = rgba('signal', 0.95);
      c.fillText(d.text, o.x, y);
      continue;
    }
    c.font = font(F.mono(400), size);
    c.fillStyle = rgba('graphite', 0.9);
    c.textAlign = 'right';
    if (d.n) c.fillText(String(d.n), o.x + size * 3.2, y);
    c.textAlign = 'left';
    c.fillStyle = d.kind === 'glsl' ? rgba('ember', 0.9) : d.kind === 'comment' ? rgba('ash', 0.6) : rgba('bone', 0.82);
    c.fillText(d.text.replace(/\t/g, '  '), o.x + size * 4.2, y);
  }
  c.restore();
  return lh;
}

export interface ListingOpts {
  x: number; y: number; w: number; h: number;
  /** First line shown (fractional: scrolls smoothly), size in px, line height factor. */
  scroll: number; size?: number; lead?: number;
  /** Line numbers in the gutter. */
  numbers?: boolean;
  alpha?: number;
  /** Colour per kind (defaults: code bone, comments ash, GLSL ember). */
  colors?: Partial<Record<'code' | 'comment' | 'glsl' | 'num', string>>;
  /** Highlight a range of lines (1-based, inclusive) in signal. */
  hot?: [number, number] | null;
}

/** Draw a listing of `f` into a 2D context, clipped to the box. Returns the line height. */
export function drawListing(c: CanvasRenderingContext2D, f: SourceFile, o: ListingOpts) {
  const size = o.size ?? 18, lh = size * (o.lead ?? 1.36);
  const col = { code: rgba('bone', 0.82), comment: rgba('ash', 0.6), glsl: rgba('ember', 0.9), num: rgba('graphite', 0.9), ...o.colors };
  c.save();
  c.beginPath(); c.rect(o.x, o.y, o.w, o.h); c.clip();
  c.globalAlpha *= o.alpha ?? 1;
  c.font = font(F.mono(400), size);
  c.textBaseline = 'alphabetic';
  const first = Math.floor(o.scroll), frac = o.scroll - first;
  const gutter = o.numbers === false ? 0 : size * 3.6;
  const n = Math.ceil(o.h / lh) + 2;
  for (let k = 0; k < n; k++) {
    const i = first + k;
    const li = ((i % f.lines.length) + f.lines.length) % f.lines.length; // the listing wraps around
    const y = o.y + (k - frac + 0.85) * lh;
    const hot = o.hot && li + 1 >= o.hot[0] && li + 1 <= o.hot[1];
    if (gutter) {
      c.fillStyle = hot ? rgba('signal', 0.9) : col.num;
      c.textAlign = 'right';
      c.fillText(String(li + 1), o.x + gutter - size * 1.1, y);
      c.textAlign = 'left';
    }
    const kind = f.kind[li]!;
    c.fillStyle = hot ? rgba('signal') : kind === 'glsl' ? col.glsl : kind === 'comment' ? col.comment : col.code;
    c.fillText(f.lines[li]!.replace(/\t/g, '  '), o.x + gutter, y);
  }
  c.restore();
  return lh;
}
