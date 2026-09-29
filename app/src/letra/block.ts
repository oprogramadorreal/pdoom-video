// A block of the explainer: one narration paragraph and its image. The Letra scene (scene.ts) runs the
// block and draws the ruler and the docked verse over it.
import type * as THREE from 'three';
import type { Frame, PostOverrides, SceneCtx } from '../engine/scene';
import type { NBlock, NWord, Narration } from './narration';
import type { Clips } from './clips';
import type { ReguaState, Regua } from './kit';
import type { BlockSpec } from './montage';

let narr: Narration | null = null;
let regua: Regua | null = null;
export const setNarration = (n: Narration) => { narr = n; };
export function narration(): Narration {
  if (!narr) throw new Error('narration not loaded (the explainer needs ?lang=pt-BR&full=1)');
  return narr;
}
export const setRegua = (r: Regua) => { regua = r; };
export const getRegua = () => regua;

export interface BlockEnv {
  ctx: SceneCtx;
  n: Narration;
  clips: Clips;
  regua: Regua;
  /** This block's narration, its montage entry and index, and its window (video time). */
  b: NBlock;
  spec: BlockSpec;
  index: number;
  start: number;
  end: number;
}

export interface BlockOut {
  post?: PostOverrides;
  /** Overrides of the ruler's state (the Letra scene fills in the rest). */
  regua?: Partial<ReguaState>;
  /** Opacity of the docked verse (default: the ruler's). */
  verse?: number;
}

export abstract class Block {
  constructor(protected e: BlockEnv) {}
  init(): Promise<void> | void {}
  abstract render(f: Frame, out: THREE.WebGLRenderTarget): BlockOut | void;

  protected get ctx() { return this.e.ctx; }
  protected get n() { return this.e.n; }
  protected get clips() { return this.e.clips; }
  /** The block's first and last words. */
  protected get w0() { return this.e.b.words[0]!; }
  protected get wN() { return this.e.b.words[this.e.b.words.length - 1]!; }
  /**
   * A word of this block by content (see Narration.word). Without `nth`, the query must match once in the
   * block (accents and case fold together: "é" also matches "E"), so a cue never lands on the wrong word.
   */
  protected w(q: string, nth?: number): NWord {
    if (nth === undefined) {
      let count = 0;
      try { for (;;) { this.n.word(this.e.b.id, q, count); count++; } } catch { /* no more matches */ }
      if (count > 1) throw new Error(`block ${this.e.b.id}: "${q}" matches ${count} times; give more words or nth`);
    }
    return this.n.word(this.e.b.id, q, nth ?? 0);
  }
  /** When a word of this block starts. */
  protected at(q: string, nth?: number) { return this.w(q, nth).start; }
  /** When a phrase of this block ends (its last word's end). */
  protected endOf(q: string, nth?: number) { this.w(q, nth); return this.n.wordEnd(this.e.b.id, q, nth ?? 0).end; }
  /** The beat of the track nearest a time (cuts land on it). */
  protected beat(t: number) { return this.n.nearestBeat(t); }
}

export type BlockFactory = (e: BlockEnv) => Block;
