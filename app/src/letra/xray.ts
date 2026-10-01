// The shoggoth's x-ray scan band, reused as the explainer's "this is code" device: where the band has
// passed, the picture is shown as its own source listing — the glyphs lit by the image under them, so the
// frame is still there, made of code (or, with `plain`, the listing alone: the picture gone). Band furniture as in shoggoth-glsl.ts: hairline edges, scanlines,
// a signal glow on the leading edge.
import * as THREE from 'three';
import { FSPass, W, H } from '../engine/gl';

export const xrayPass = new FSPass(/* glsl */ `
  uniform sampler2D sceneTex, codeTex;
  uniform float bandX, bandW, dir, on, uT, codeK, dimK, plainK;
  void main() {
    vec2 px = vec2(vUv.x * ${W.toFixed(1)}, (1.0 - vUv.y) * ${H.toFixed(1)});
    vec3 sc = texture(sceneTex, vUv).rgb;
    vec4 cd = texture(codeTex, vUv);
    // revealed: behind the band (dir = +1: it travels right, so left of it)
    float behind = dir > 0.0 ? smoothstep(bandX - bandW + 1.5, bandX - bandW - 1.5, px.x) : smoothstep(bandX + bandW - 1.5, bandX + bandW + 1.5, px.x);
    float inBand = on * (1.0 - smoothstep(bandW - 1.5, bandW + 1.5, abs(px.x - bandX)));
    float rev = max(codeK, on * behind);
    // the picture made of its code: glyphs lit by the image (and faintly by themselves), the rest dark
    float l = luma(sc);
    vec3 codeView = sc * dimK + cd.rgb * cd.a * (0.3 + 1.2 * sqrt(l)) + sc * 0.9 * cd.a;
    // or the listing alone, as it is written (the picture gone)
    codeView = mix(codeView, cd.rgb * cd.a, plainK);
    vec3 col = mix(sc, codeView, rev);
    if (on > 0.0) {
      col = mix(col, C_INK2 * 0.6 + sc * 0.35, inBand * 0.55);
      float dl = abs(px.x - (bandX - bandW)), dr = abs(px.x - (bandX + bandW));
      col += C_BONE * 0.7 * on * (smoothstep(1.2, 0.0, dl) + smoothstep(1.2, 0.0, dr));
      float lead = dir > 0.0 ? max(px.x - bandX - bandW, 0.0) : max(bandX - bandW - px.x, 0.0);
      float ahead = dir > 0.0 ? step(bandX + bandW - 1.0, px.x) : step(px.x, bandX - bandW + 1.0);
      col += C_SIGNAL * 0.7 * on * exp(-lead / 6.0) * ahead;
      float scan = 0.5 + 0.5 * sin(px.y * 2.1 + uT * 40.0);
      col *= 1.0 - 0.14 * inBand * scan;
    }
    fragColor = vec4(col, 1.0);
  }`, {
  sceneTex: { value: null }, codeTex: { value: null }, bandX: { value: -1000 }, bandW: { value: 90 }, dir: { value: 1 }, on: { value: 0 },
  uT: { value: 0 }, codeK: { value: 0 }, dimK: { value: 0.08 }, plainK: { value: 0 },
});

export interface XrayState {
  /** Band centre (px) and half width; 'on' shows the band itself. */
  x: number; w?: number; on: number; dir?: 1 | -1;
  /** 0..1 everything shown as code regardless of the band. */
  all?: number;
  /** How much of the plain image shows between the glyphs of the code view. */
  dim?: number;
  /** 0..1: the code view is the listing alone, not lit by the picture (the picture gone). */
  plain?: number;
  t: number;
}

export function xray(renderer: THREE.WebGLRenderer, scene: THREE.Texture, code: THREE.Texture, out: THREE.WebGLRenderTarget, s: XrayState) {
  const u = xrayPass.u;
  u.sceneTex!.value = scene; u.codeTex!.value = code;
  u.bandX!.value = s.x; u.bandW!.value = s.w ?? 90; u.dir!.value = s.dir ?? 1; u.on!.value = s.on;
  u.uT!.value = s.t; u.codeK!.value = s.all ?? 0; u.dimK!.value = s.dim ?? 0.08; u.plainK!.value = s.plain ?? 0;
  xrayPass.render(renderer, out);
}
