// The end: the song restarts with the clip from its first frame (the frame the explanation started and
// ended on) and plays under the YouTube end screen, fading out over the video's last seconds.
import type * as THREE from 'three';
import { Scene, type Frame, type PostOverrides } from '../engine/scene';
import { clips, type Clips } from './clips';
import { END_FADE } from './soundtrack';
import { prog } from '../engine/util';

export default class Replay extends Scene {
  private pool!: Clips;
  override async init() {
    this.pool = clips(this.ctx);
    const span = this.ctx.end - this.ctx.start;
    await Promise.all(this.pool.entries.filter((e) => e.start < span).map((e) => this.pool.load(e.id)));
  }
  override render(f: Frame, out: THREE.WebGLRenderTarget): PostOverrides {
    const s = f.t - Number(this.ctx.params.from);
    const post = this.pool.renderAt(s, out);
    return { ...post, fade: Math.max(post.fade ?? 0, prog(f.t, this.ctx.end - END_FADE, this.ctx.end)) };
  }
}
