// A mosaic of the whole clip: one frame per tile, rendered once (the first time it is needed) into its
// own target and reused. "Um clipe inteiro" (01.1) pulls back from one tile to all of them.
import * as THREE from 'three';
import { W, H, makeRT } from '../engine/gl';
import type { Clips } from './clips';
import { S, camPass } from './kit';

export const MOSAIC_COLS = 7, MOSAIC_ROWS = 7;

let built: { rt: THREE.WebGLRenderTarget; key: string } | null = null;

/** Song times of the tiles: the clip sampled evenly, skipping its first and last seconds. */
export function mosaicTimes(clips: Clips) {
  const n = MOSAIC_COLS * MOSAIC_ROWS;
  const end = clips.entries[clips.entries.length - 1]!.end;
  return Array.from({ length: n }, (_, i) => 1.9 + (i / (n - 1)) * (end - 9));
}

/** The tile rect (screen px when the mosaic fills the frame). */
export function tileRect(i: number): [number, number, number, number] {
  const c = i % MOSAIC_COLS, r = Math.floor(i / MOSAIC_COLS);
  const tw = W / MOSAIC_COLS, th = H / MOSAIC_ROWS, g = 3;
  return [c * tw + g, r * th + g, (c + 1) * tw - g, (r + 1) * th - g];
}

/** Load every scene the mosaic shows (call in a block's init). */
export async function loadMosaic(clips: Clips) {
  await Promise.all(mosaicTimes(clips).map((s) => clips.load(clips.at(s).id)));
}

/** The mosaic texture (built on first call; `skip` leaves one tile empty for a live picture). */
export function mosaic(renderer: THREE.WebGLRenderer, clips: Clips, skip = -1): THREE.Texture {
  const key = `${skip}`;
  if (built && built.key === key) return built.rt.texture;
  const rt = built?.rt ?? makeRT();
  const clear = new THREE.Color(0, 0, 0);
  renderer.setRenderTarget(rt);
  renderer.setClearColor(clear, 1);
  renderer.clear();
  const R = S().rt[3]!;
  mosaicTimes(clips).forEach((s, i) => {
    if (i === skip) return;
    clips.renderAt(s, R);
    camPass(renderer, R.texture, rt, { rect: tileRect(i), dim: 0.92 }, true);
  });
  built = { rt, key };
  return rt.texture;
}
