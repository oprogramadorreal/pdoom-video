// The clip's scenes, re-rendered by the explainer at any song time. One private instance per clip
// timeline entry (made on first use and shared by every block), so a block can show `shoggoth` at 33.1 s
// of the song, slowed down or run backwards, with a `remix` (Frame.remix) for opt-in variations.
import type * as THREE from 'three';
import type { TimelineEntry } from '../engine/engine';
import type { Frame, PostOverrides, Scene, SceneCtx } from '../engine/scene';
import { makeTimeline } from '../timeline';

let pool: Clips | null = null;
/** The shared pool (the song timeline is the same for every block). */
export function clips(ctx: SceneCtx): Clips {
  if (!pool) pool = new Clips(ctx);
  return pool;
}

export class Clips {
  /** The clip's own timeline, in song time. */
  readonly entries: TimelineEntry[];
  private scenes = new Map<string, Promise<Scene>>();
  private ready = new Map<string, Scene>();

  constructor(private ctx: SceneCtx) {
    this.entries = makeTimeline(ctx.lyrics, ctx.audio);
  }

  entry(id: string): TimelineEntry {
    const e = this.entries.find((x) => x.id === id);
    if (!e) throw new Error(`clip entry not found: ${id}`);
    return e;
  }
  /** The clip entry on screen at song time s. */
  at(s: number): TimelineEntry {
    return this.entries.find((e) => s >= e.start && s < e.end) ?? this.entries[s < 0 ? 0 : this.entries.length - 1]!;
  }

  /** Load (once) the scene of a clip entry. Blocks await this in init() for every entry they show. */
  load(id: string): Promise<Scene> {
    let p = this.scenes.get(id);
    if (!p) {
      const e = this.entry(id);
      p = e.load().then(async (m) => {
        const s = new m.default({ ...this.ctx, id: `${e.id}@letra`, params: e.params ?? {}, start: e.start, end: e.end });
        await s.init();
        this.ready.set(id, s);
        return s;
      });
      this.scenes.set(id, p);
    }
    return p;
  }

  /** A loaded clip scene, to use its own geometry (cameras, projections, paths) in an explanation. */
  scene<T = any>(id: string): T {
    const sc = this.ready.get(id);
    if (!sc) throw new Error(`clip scene not loaded: ${id}`);
    return sc as unknown as T;
  }

  /** The frame a clip scene would get at song time s (the song's audio analysis at s). */
  frame(e: TimelineEntry, s: number, remix?: Record<string, any>): Frame {
    const au = this.ctx.audio;
    const beat = au.beatAt(s), bar = au.barAt(s);
    return {
      t: s, dt: 1 / 60, lt: s - e.start, p: (s - e.start) / (e.end - e.start), start: e.start, end: e.end, seeked: true, preroll: false,
      beat, bar, beatPhase: beat - Math.floor(beat), barPhase: bar - Math.floor(bar), a: au.sample(s), under: null, tin: 1, tout: 0,
      ...(remix ? { remix } : {}),
    };
  }

  /**
   * Render clip entry `id` at song time s into `out` (clamped inside the entry's window). Returns the
   * scene's post overrides. The scene must have been loaded.
   */
  render(id: string, s: number, out: THREE.WebGLRenderTarget, remix?: Record<string, any>): PostOverrides {
    const e = this.entry(id);
    const sc = this.ready.get(id);
    if (!sc) throw new Error(`clip scene not loaded: ${id} (await clips.load('${id}') in init)`);
    const t = Math.min(Math.max(s, e.start), e.end - 1e-4);
    return (sc.render(this.frame(e, t, remix), out) as PostOverrides | undefined) ?? {};
  }

  /** Render whatever the clip shows at song time s (the entry is found by time). */
  renderAt(s: number, out: THREE.WebGLRenderTarget, remix?: Record<string, any>): PostOverrides {
    return this.render(this.at(s).id, s, out, remix);
  }
}
