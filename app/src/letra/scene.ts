// The explainer's scene module: one instance per narration block (timeline entry `x00.1` … `x06.7`). It
// runs the block's image (chapter modules c00.ts … c06.ts) and puts the ruler and the verse in the HUD.
import type * as THREE from 'three';
import { Scene, type Frame, type PostOverrides } from '../engine/scene';
import { clips } from './clips';
import { Regua, type ReguaState } from './kit';
import { MONTAGE } from './montage';
import { narration, getRegua, setRegua, type Block, type BlockFactory } from './block';
import { BLOCKS } from './blocks';
import { placeholder } from './placeholder';

export default class Letra extends Scene {
  private blk!: Block;
  private regua!: Regua;
  private index = 0;

  override async init() {
    const n = narration();
    const regua = getRegua() ?? new Regua(this.ctx.lyrics, n);
    setRegua(regua);
    this.regua = regua;
    const id = String(this.ctx.params.block);
    this.index = MONTAGE.findIndex((b) => b.id === id);
    if (this.index < 0) throw new Error(`block not in the montage: ${id}`);
    const make: BlockFactory = BLOCKS[id] ?? placeholder;
    this.blk = make({
      ctx: this.ctx, n, clips: clips(this.ctx), regua, b: n.block(id), spec: MONTAGE[this.index]!, index: this.index,
      start: this.ctx.start, end: this.ctx.end,
    });
    await this.blk.init();
  }

  override render(f: Frame, out: THREE.WebGLRenderTarget): PostOverrides {
    const r = this.blk.render(f, out) ?? {};
    const post: PostOverrides = { ...(r.post ?? {}) };
    // (the ruler shows itself on demand; a block's own alpha only fades it further)
    const st: ReguaState = { draw: 1, pos: this.regua.cursor(f.t), play: 0, paper: post.paper ?? 0, fuse: 0, ...r.regua, alpha: this.regua.visible(f.t) * (r.regua?.alpha ?? 1) };
    const verse = r.verse ?? st.alpha * Math.max(0, Math.min(1, st.draw * 2 - 1));
    const t = f.t, i = this.index, regua = this.regua;
    // the player lives in the HUD: steady under the image's shake, zoom and fringes
    post.hud = 1;
    post.hudDraw = (c) => { regua.draw(c, t, st); regua.drawVerse(c, i, t, verse, st.paper); };
    return post;
  }
}
