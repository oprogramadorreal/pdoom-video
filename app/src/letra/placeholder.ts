// Stand-in image for a block not built yet: the clip at the block's verse, slowed down, with a slow push-in
// and the block id in a corner. Keeps the full video renderable end to end while the chapters are built.
import type * as THREE from 'three';
import type { Frame } from '../engine/scene';
import { rgba } from '../engine/palette';
import { F, font } from '../engine/type';
import { Block, type BlockEnv } from './block';
import { camPass, S } from './kit';

class Placeholder extends Block {
  private s0 = 0;
  override async init() {
    const v = this.e.regua.verses[this.e.index];
    this.s0 = v ? v[0]!.start - 0.3 : this.e.regua.pos[this.e.index]!;
    await this.clips.load(this.clips.at(this.s0).id);
  }
  render(f: Frame, out: THREE.WebGLRenderTarget) {
    const { renderer, comp } = this.ctx;
    const lt = f.t - this.e.start;
    const s = this.s0 + lt * 0.35;
    const id = this.clips.at(this.s0).id;
    const post = this.clips.render(id, s, S().rt[0]!);
    camPass(renderer, S().rt[0]!.texture, out, { zoom: 1 + 0.01 * lt, dim: 0.8 });
    const L = S().ui; L.clear();
    const c = L.ctx;
    c.font = font(F.mono(500), 16); c.fillStyle = rgba('signal', 0.9);
    c.fillText(`[${this.e.b.id} · rascunho]`, 64, 64);
    comp.draw(renderer, L.upload(), out);
    return { post: { ...post, frame: 0, flash: 0, shake: [0, 0] as [number, number] } };
  }
}

export const placeholder = (e: BlockEnv) => new Placeholder(e);
