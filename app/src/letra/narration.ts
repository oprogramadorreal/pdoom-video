// The explainer's narration (data/narracao.pt-br.json, from analysis/narracao.py): blocks and words of
// the voice, and the beat grid of the background track under it. The JSON is in mix time (0 = the first
// sample of mixagem.mp3); everything here is in VIDEO time, so scenes compare it with f.t directly.
import { norm } from '../engine/lyrics';
import { MIX_AT } from './soundtrack';

export interface NWord { w: string; start: number; end: number; conf: number; block: string; i: number }
export interface NBlock { id: string; chapter: string; text: string; start: number; end: number; words: NWord[] }
export interface NChapter { id: string; title: string; start: number; duration: number }

export class Narration {
  blocks: NBlock[];
  words: NWord[];
  chapters: NChapter[];
  beats: number[];
  downbeats: number[];
  /** Strong percussive hits of the track: [time, strength 0..1]. */
  hits: [number, number][];
  bpm: number;
  mixDuration: number;

  constructor(j: any) {
    const at = (x: number) => x + MIX_AT;
    this.mixDuration = j.mix.duration;
    this.chapters = j.chapters.map((c: any) => ({ id: c.id, title: c.title, start: at(c.start), duration: c.duration }));
    this.blocks = j.blocks.map((b: any) => ({
      id: b.id, chapter: b.chapter, text: b.text, start: at(b.start), end: at(b.end),
      words: b.words.map((w: any, i: number) => ({ w: w.w, start: at(w.start), end: at(w.end), conf: w.conf, block: b.id, i })),
    }));
    this.words = this.blocks.flatMap((b) => b.words);
    this.bpm = j.grid.bpm;
    // (the tracker's first beat sits on the file's first sample: not a beat)
    this.beats = j.grid.beats.filter((b: number) => b > 0.05).map(at);
    this.downbeats = j.grid.downbeats.filter((b: number) => b > 0.05).map(at);
    this.hits = j.grid.hits.map(([t, s]: [number, number]) => [at(t), s]);
  }

  static async load(url = 'data/narracao.pt-br.json'): Promise<Narration> {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`narration data not found: ${url}`);
    return new Narration(await r.json());
  }

  block(id: string): NBlock {
    const b = this.blocks.find((x) => x.id === id);
    if (!b) throw new Error(`narration block not found: ${id}`);
    return b;
  }

  /**
   * A word of a block by content (accents, case and punctuation ignored), like lyrics.get(): the
   * first word starting a match of `q` (one or more words), `nth` for later matches. Throws if missing.
   */
  word(blockId: string, q: string, nth = 0): NWord {
    const ws = this.block(blockId).words;
    const qs = q.split(/\s+/).map(norm).filter(Boolean);
    let n = 0;
    for (let i = 0; i + qs.length <= ws.length; i++) {
      if (qs.every((x, k) => norm(ws[i + k]!.w) === x) && n++ === nth) return ws[i]!;
    }
    throw new Error(`narration word not found in ${blockId}: ${q}`);
  }
  /** The last word of a match of `q` (for "when the phrase ends"). */
  wordEnd(blockId: string, q: string, nth = 0): NWord {
    const w = this.word(blockId, q, nth);
    return this.block(blockId).words[w.i + q.split(/\s+/).filter(Boolean).length - 1]!;
  }

  // ---------------------------------------------------------------- beat grid
  beatAt(t: number): number {
    const b = this.beats;
    if (t <= b[0]!) return (t - b[0]!) / (b[1]! - b[0]!);
    if (t >= b[b.length - 1]!) return b.length - 1 + (t - b[b.length - 1]!) / (b[b.length - 1]! - b[b.length - 2]!);
    let lo = 0, hi = b.length - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (b[m]! <= t) lo = m; else hi = m; }
    return lo + (t - b[lo]!) / (b[hi]! - b[lo]!);
  }
  timeOfBeat(i: number): number {
    const b = this.beats, n = b.length;
    const p = (b[n - 1]! - b[0]!) / (n - 1);
    if (i <= 0) return b[0]! + i * p;
    if (i >= n - 1) return b[n - 1]! + (i - (n - 1)) * p;
    const k = Math.floor(i);
    return b[k]! + (b[k + 1]! - b[k]!) * (i - k);
  }
  /** The beat at or before t, and the next one after t. */
  prevBeat(t: number) { return this.timeOfBeat(Math.floor(this.beatAt(t) + 1e-6)); }
  nextBeat(t: number) { return this.timeOfBeat(Math.floor(this.beatAt(t) + 1e-6) + 1); }
  nearestBeat(t: number) { return this.timeOfBeat(Math.round(this.beatAt(t))); }
  /** Beats in [t0, t1). */
  beatsIn(t0: number, t1: number) { return this.beats.filter((b) => b >= t0 && b < t1); }
  /** The strongest hit in [t0, t1] (null if none). */
  hitIn(t0: number, t1: number): [number, number] | null {
    let best: [number, number] | null = null;
    for (const h of this.hits) if (h[0] >= t0 && h[0] <= t1 && (!best || h[1] > best[1])) best = h;
    return best;
  }
  /** Beat period (s). */
  get period() { return 60 / this.bpm; }
}
