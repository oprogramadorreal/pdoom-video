// Entry of thumb.html: the YouTube thumbnail of the full pt-BR video, one still drawn by the video's own
// engine and scenes (thumb.ts). A one-entry timeline, so the video's own page and edit stay untouched;
// scripts/thumb.ts drives it (the same still()/png() calls as the export API in main.ts).
import { Engine } from '../src/engine/engine';
import { PW, PH } from '../src/engine/gl';

declare global {
  interface Window { __thumb: any }
}

const params = new URLSearchParams(location.search);
const canvas = document.getElementById('c') as HTMLCanvasElement;
canvas.width = PW;
canvas.height = PH;

const engine = new Engine(canvas, () => [
  { id: 'thumb', load: () => import('./thumb'), start: 0, end: 10, params: { variant: params.get('v') ?? 'hino' } },
]);
engine.hudOff = true;

async function boot() {
  await engine.init();
  window.__thumb = {
    width: PW,
    height: PH,
    errors: engine.errors,
    /** Render the still (the scene ignores t: its song time comes from the variant). */
    still(samples = 36, shutter = 0) { return engine.render(1, 1 / 60, true, samples, shutter); },
    /** The last rendered frame as a full-resolution (PW x PH) PNG, base64. */
    async png() {
      const px = await engine.readPixelsAsync(), row = PW * 4;
      const img = new ImageData(PW, PH);
      for (let y = 0; y < PH; y++) img.data.set(px.subarray((PH - 1 - y) * row, (PH - y) * row), y * row); // bottom-up -> top-down
      const oc = new OffscreenCanvas(PW, PH);
      oc.getContext('2d')!.putImageData(img, 0, 0);
      const b = new Uint8Array(await (await oc.convertToBlob({ type: 'image/png' })).arrayBuffer());
      let s = '';
      for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode(...b.subarray(i, i + 0x8000));
      return btoa(s);
    },
    ready: true,
  };
}

boot().catch((e) => { window.__thumb = { error: String((e as Error)?.stack ?? e) }; });
