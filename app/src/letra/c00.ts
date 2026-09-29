// Chapter 00 · Tudo é código. The clip has rewound to its first frame; the explanation starts right there.
import type * as THREE from 'three';
import type { Frame } from '../engine/scene';
import { ease, prog } from '../engine/util';
import { Block, type BlockFactory } from './block';
import { MIX_AT } from './soundtrack';

/**
 * 00.1 "Você acabou de ouvir uma música de amor sobre o fim do mundo." The clip's first frame, held:
 * black, the crop marks. When the mixagem starts (0.6 s in) the ruler draws itself in along the foot of
 * the frame, inside the crop marks, and the spark lights at 0:00 as its cursor, paused.
 */
class B001 extends Block {
  override async init() { await this.clips.load('open'); }
  render(f: Frame, out: THREE.WebGLRenderTarget) {
    const post = this.clips.render('open', 0, out);
    const draw = prog(f.t, MIX_AT, MIX_AT + 1.5, ease.inOutCubic);
    return { post, regua: { draw, pos: 0 } };
  }
}

export const C00: Record<string, BlockFactory> = {
  '00.1': (e) => new B001(e),
};
