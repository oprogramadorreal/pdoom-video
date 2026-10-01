#!/usr/bin/env bun
// Offline renderer. Drives the app in headless Chrome (?export=1) and either
//   stills:  bun scripts/render.ts stills --t 1.5,23,40.2 [--only id1,id2] [--out dir]
//   sheet:   bun scripts/render.ts sheet --from 20 --to 35 [--n 12] [--cols 4] [--only ids] [--out file.png]   (or --times a,b,c | --cuts)
//   plates:  bun scripts/render.ts plates   (renders one representative JPEG per plate into public/plates/ (used by the outro's rewind), times from plates.json or entry midpoints)
//   perf:    bun scripts/render.ts perf --from 20 --to 25 [--only ids] [--samples 1] [--shutter 0.5]   (avg ms per frame incl. GPU sync and the export's pixel readback)
//   video:   bun scripts/render.ts video [--from 0] [--to 156.65] [--fps 60] [--crf 16] [--x264 aq-mode=3] [--samples 1] [--shutter 0.5] [--out ../out/pdoom.mp4] [--noaudio]
//            --samples N averages N sub-frames per frame over shutter×(1/fps): motion blur + temporal AA;
//            --samples auto picks the count per frame (4, 12, 36, 108 or 324, see Engine.render)
//   --scale N (all modes): render at N× the 1920x1080 layout (--scale 2 = true 3840x2160); stills are then saved
//            full-res from the pixel buffer, videos are encoded at the physical size.
//   --full (with --lang pt-BR, all modes): the full pt-BR video — the clip, the narrated lyrics explainer and the
//            clip restarting under the end screen (docs/letra-explicada-pt-br/). Without it pt-BR is the clip alone.
// Uses the Vite dev server at --url (default http://localhost:5173); starts a private one if unreachable.
import { chromium, type Page } from 'playwright-core';
import { mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { PT_END_FADE_SECONDS } from '../src/locale';
import type { Segment } from '../src/letra/soundtrack';

const argv = process.argv.slice(2);
const mode = argv[0] ?? 'stills';
const opt = (k: string, d?: string) => { const i = argv.indexOf(`--${k}`); return i >= 0 ? argv[i + 1] : d; };
const flag = (k: string) => argv.includes(`--${k}`);
const language = opt('lang', 'en')!.toLowerCase();
if (!['en', 'pt-br'].includes(language)) throw new Error('--lang must be en or pt-BR');
const PT = language === 'pt-br';
const LANG = PT ? 'pt-BR' : 'en';
const FULL = flag('full');
if (FULL && !PT) throw new Error('--full is the pt-BR video with its explainer: use it with --lang pt-BR');
const APP = path.resolve(import.meta.dir, '..');
const SCALE = Math.max(1, Math.round(+opt('scale', '1')!));
const OW = 1920 * SCALE, OH = 1080 * SCALE; // output size
// --samples N (fixed) or --samples auto [--min-samples 4] [--max-samples 324] [--tol 3] (adaptive, see Engine.render)
const SAMPLES = opt('samples', '1') === 'auto'
  ? { min: +opt('min-samples', '4')!, max: +opt('max-samples', '324')!, tol: +opt('tol', '3')! }
  : +opt('samples', '1')!;
const hist = (h: Record<string, number>) => Object.entries(h).sort((a, b) => +a[0] - +b[0]).map(([k, v]) => `${k}:${v}`).join(' ');
const ROOT = path.resolve(APP, '..');

async function reachable(url: string) {
  try { const r = await fetch(url, { signal: AbortSignal.timeout(1500) }); return r.ok; } catch { return false; }
}

async function ensureServer(): Promise<{ url: string; stop: () => void }> {
  const url = opt('url', 'http://localhost:5173')!;
  if (await reachable(url)) return { url, stop: () => {} };
  const port = 5300 + Math.floor(Math.random() * 500);
  // no live reload: a file saved mid-render must not reload the page
  const proc = Bun.spawn([process.execPath, 'x', 'vite', '--port', String(port), '--strictPort'], { cwd: APP, stdout: 'ignore', stderr: 'ignore', env: { ...process.env, PDOOM_NO_HMR: '1' } });
  const u = `http://localhost:${port}`;
  for (let i = 0; i < 100 && !(await reachable(u)); i++) await Bun.sleep(100);
  return { url: u, stop: () => proc.kill() };
}

async function openPage(url: string) {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: !flag('headed'),
    args: ['--enable-gpu-rasterization', '--ignore-gpu-blocklist', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows'],
  });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const logs: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') logs.push(`[${m.type()}] ${m.text()}`); });
  page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
  page.on('response', (r) => { if (r.status() >= 400) logs.push(`[http ${r.status()}] ${r.url()}`); });
  const only = opt('only');
  await page.goto(`${url}/?export=1&lang=${LANG}${FULL ? '&full=1' : ''}${only ? `&only=${only}` : ''}${SCALE !== 1 ? `&scale=${SCALE}` : ''}`);
  await page.waitForFunction(() => (window as any).__pdoom?.ready || (window as any).__pdoom?.error, null, { timeout: 120000 });
  const err = await page.evaluate(() => (window as any).__pdoom.error);
  if (err) { await browser.close(); throw new Error(`app failed to boot:\n${err}\n${logs.join('\n')}`); }
  const size: [number, number] = await page.evaluate(() => [(window as any).__pdoom.width ?? 1920, (window as any).__pdoom.height ?? 1080]);
  if (size[0] !== OW || size[1] !== OH) throw new Error(`app renders ${size[0]}x${size[1]}, expected ${OW}x${OH} (--scale ${SCALE})`);
  const sceneErrors: string[] = await page.evaluate(() => (window as any).__pdoom.errors);
  if (sceneErrors.length) { await browser.close(); throw new Error('SCENE ERRORS:\n' + sceneErrors.join('\n')); }
  return { browser, page, logs };
}

async function stills(page: Page, times: number[], outDir: string) {
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  const files: string[] = [];
  for (const t of times) {
    const k: number = await page.evaluate(([t, s, sh]) => (window as any).__pdoom.still(t, s, sh), [t, SAMPLES, +opt('shutter', '0.5')!] as const);
    const f = path.join(outDir, `f_${t.toFixed(2).padStart(7, '0')}.png`);
    if (typeof SAMPLES !== 'number') console.log(`t=${t}: ${k} sub-frames`);
    // at scale > 1 the canvas is shown downscaled on the page: save the full-res pixel buffer instead
    if (SCALE !== 1) await Bun.write(f, Buffer.from(await page.evaluate(() => (window as any).__pdoom.png()), 'base64'));
    else await page.screenshot({ path: f, clip: { x: 0, y: 0, width: 1920, height: 1080 } });
    files.push(f);
  }
  return files;
}

async function sheet(page: Page, times: number[], cols: number, out: string) {
  const dataUrl: string = await page.evaluate(async ({ times, cols }) => {
    const P = (window as any).__pdoom;
    const cw = 480, ch = 270, pad = 4, lab = 18;
    const rows = Math.ceil(times.length / cols);
    const cv = document.createElement('canvas');
    cv.width = cols * (cw + pad) + pad; cv.height = rows * (ch + lab + pad) + pad;
    const c = cv.getContext('2d')!;
    c.fillStyle = '#222'; c.fillRect(0, 0, cv.width, cv.height);
    const src = document.getElementById('c') as HTMLCanvasElement;
    times.forEach((t: number, i: number) => {
      P.still(t);
      const x = pad + (i % cols) * (cw + pad), y = pad + Math.floor(i / cols) * (ch + lab + pad);
      c.drawImage(src, x, y + lab, cw, ch);
      c.fillStyle = '#ddd'; c.font = '13px monospace'; c.fillText(`${t.toFixed(2)}s`, x + 2, y + 13);
    });
    return cv.toDataURL('image/png');
  }, { times, cols });
  if (!existsSync(path.dirname(out))) mkdirSync(path.dirname(out), { recursive: true });
  await Bun.write(out, Buffer.from(dataUrl.split(',')[1]!, 'base64'));
}

/**
 * ffmpeg inputs and filter for the full video's sound over [from, to): the soundtrack's segments (the song,
 * the mixagem, the song again) trimmed and spliced with silence between them — no mixing, each file as it is,
 * with only the segments' own fade-outs (the clip's end fade, the end screen's).
 */
function spliceAudio(segs: Segment[], from: number, to: number) {
  const files = [...new Set(segs.map((s) => s.url))];
  const inputs = files.flatMap((u) => ['-i', path.join(ROOT, u)]);
  const parts: string[] = [];
  const labels: string[] = [];
  let t = from, k = 0;
  const fmt = 'aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo';
  const silence = (d: number) => { parts.push(`anullsrc=r=48000:cl=stereo,atrim=duration=${d.toFixed(6)},${fmt}[p${k}]`); labels.push(`[p${k++}]`); };
  for (const s of segs) {
    const a = Math.max(t, s.at), b = Math.min(to, s.at + s.dur);
    if (b <= a) continue;
    if (a > t + 1e-6) silence(a - t);
    const fx: string[] = [];
    if (s.fadeOut) {
      const fadeAt = s.at + s.dur - s.fadeOut; // video time where the fade starts
      if (a >= fadeAt) {
        const remaining = s.at + s.dur - a;
        fx.push(`volume=${Math.min(1, remaining / s.fadeOut)}`, `afade=t=out:st=0:d=${remaining.toFixed(6)}`);
      } else if (b > fadeAt) fx.push(`afade=t=out:st=${(fadeAt - a).toFixed(6)}:d=${s.fadeOut}`);
    }
    const i = files.indexOf(s.url) + 1; // input 0 is the video pipe
    parts.push(`[${i}:a]atrim=start=${(s.from + a - s.at).toFixed(6)}:end=${(s.from + b - s.at).toFixed(6)},asetpts=PTS-STARTPTS,${fmt}${fx.length ? ',' + fx.join(',') : ''}[p${k}]`);
    labels.push(`[p${k++}]`);
    t = b;
  }
  if (to > t + 1e-6) silence(to - t);
  parts.push(`${labels.join('')}concat=n=${labels.length}:v=0:a=1[aout]`);
  return { inputs, filter: parts.join(';') };
}

async function video(page: Page, from: number, to: number, fps: number, out: string) {
  if (!existsSync(path.dirname(out))) mkdirSync(path.dirname(out), { recursive: true });
  const crf = opt('crf', '16')!;
  const audio = path.join(ROOT, PT ? 'audio/pdoom-pt-BR.mp3' : 'audio/pdoom.mp3');
  const segs: Segment[] | null = FULL ? await page.evaluate(() => (window as any).__pdoom.soundtrack) : null;
  const splice = segs && !flag('noaudio') ? spliceAudio(segs, from, to) : null;
  const args = ['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${OW}x${OH}`, '-r', String(fps), '-i', 'pipe:0'];
  if (splice) args.push(...splice.inputs, '-filter_complex', splice.filter, '-map', '0:v', '-map', '[aout]');
  else if (!flag('noaudio')) args.push('-ss', String(from), '-t', String(to - from), '-i', audio);
  // Frames are sRGB (toSRGB in the final pass): convert with the BT.709 matrix and tag the stream,
  // otherwise ffmpeg converts with BT.601 while players and YouTube decode untagged HD as BT.709.
  // scale tags the matrix and range; primaries and transfer need setparams (the -color_* output flags don't reach the stream).
  args.push('-vf', 'vflip,scale=out_color_matrix=bt709,setparams=color_primaries=bt709:color_trc=bt709', '-c:v', 'libx264', '-preset', opt('preset', 'slow')!, '-crf', crf, '-pix_fmt', 'yuv420p', '-tune', 'grain', '-x264-params', opt('x264', 'aq-mode=3')!);
  if (!flag('noaudio')) args.push('-c:a', 'aac', '-b:a', '320k', '-shortest');
  if (PT && !FULL && !flag('noaudio')) {
    const duration: number = await page.evaluate(() => (window as any).__pdoom.duration);
    const remaining = duration - from;
    // Match preview volume; source MP3 stays byte-for-byte unchanged. Handles
    // clips starting within the fade, as well as the complete recording.
    const initialVolume = Math.min(1, remaining / PT_END_FADE_SECONDS);
    args.push('-af', `volume=${initialVolume},afade=t=out:st=${Math.max(0, remaining - PT_END_FADE_SECONDS)}:d=${Math.min(PT_END_FADE_SECONDS, remaining)}`);
  }
  args.push('-movflags', '+faststart', out);
  const ff = Bun.spawn(args, { stdin: 'pipe', stdout: 'inherit', stderr: 'inherit' });
  let frames = 0;
  const total = Math.round(to * fps) - Math.round(from * fps);
  const t0 = performance.now();
  const server = Bun.serve({
    port: 0,
    fetch(req, srv) { return srv.upgrade(req) ? undefined : new Response('ws only', { status: 400 }); },
    websocket: {
      maxPayloadLength: Math.max(64 * 1024 * 1024, OW * OH * 4 + 1024),
      async message(ws, msg) {
        ff.stdin.write(msg as Uint8Array);
        await ff.stdin.flush();
        frames++;
        ws.send(String(frames)); // ack: the page keeps at most a few frames ahead of ffmpeg (bounded memory at 4K)
        if (frames % 60 === 0 || frames === total) {
          const el = (performance.now() - t0) / 1000;
          process.stdout.write(`\r${frames}/${total} frames  ${(frames / el).toFixed(1)} fps  eta ${((total - frames) / (frames / el)).toFixed(0)}s   `);
        }
      },
    },
  });
  const used: Record<string, number> = await page.evaluate((o) => (window as any).__pdoom.stream(o), { from, to, fps, ws: `ws://localhost:${server.port}`, samples: SAMPLES, shutter: +opt('shutter', '0.5')!, inflight: 4 });
  // wait for all frames to arrive
  while (frames < total) await Bun.sleep(20);
  ff.stdin.end();
  const code = await ff.exited;
  server.stop();
  if (code !== 0) throw new Error(`ffmpeg failed with exit code ${code}`);
  console.log(`\nwrote ${out} (${frames} frames in ${((performance.now() - t0) / 1000).toFixed(1)}s)`);
  console.log(`sub-frames per frame (count:frames): ${hist(used)}`);
}

const { url, stop } = await ensureServer();
let activeBrowser: Awaited<ReturnType<typeof openPage>>['browser'] | undefined;
try {
  const { browser, page, logs } = await openPage(url);
  activeBrowser = browser;
  if (mode === 'verify') {
    const report = await page.evaluate(async () => {
      const p = (window as any).__pdoom;
      const times = new Set<number>([0, p.duration - 1 / 60]);
      for (const w of p.engine.lyrics.words) for (const t of [w.start - 1 / 60, w.start + 1 / 60, (w.start + w.end) / 2, w.end]) times.add(t);
      for (const e of p.timeline) for (const t of [e.start - 1 / 60, e.start + 1 / 60, e.end - 1 / 60]) times.add(t);
      for (let t = 0; t < p.duration; t += 0.5) times.add(t);
      // the explainer: every narration word too (images change on them)
      if (p.full) for (const w of p.narration.words) for (const t of [w.start - 1 / 60, w.start + 1 / 60, (w.start + w.end) / 2]) times.add(t);
      let frames = 0;
      for (const t of [...times].sort((a, b) => a - b)) {
        if (t < 0 || t >= p.duration) continue;
        p.still(t); frames++;
        if (frames % 20 === 0) await new Promise((r) => setTimeout(r, 0));
      }
      const meta = (url: string) => new Promise<number>((resolve, reject) => {
        const a = new Audio(url);
        a.onloadedmetadata = () => resolve(a.duration); a.onerror = () => reject(new Error(`Audio asset failed: ${url}`));
      });
      if (p.full) {
        // the picture must run exactly as long as the spliced sound, and every segment must fit in its file
        const segs = p.soundtrack as { url: string; at: number; from: number; dur: number }[];
        const end = segs[segs.length - 1]!.at + segs[segs.length - 1]!.dur;
        if (Math.abs(end - p.duration) > 1e-6) throw new Error(`Soundtrack ${end} s != timeline ${p.duration} s`);
        const tl = p.timeline as { id: string; start: number; end: number }[];
        for (let t = 0; t < p.duration; t += 0.05) if (!tl.some((e) => t >= e.start && t < e.end)) throw new Error(`No scene at ${t.toFixed(2)} s`);
        const files: Record<string, number> = {};
        for (const s of segs) {
          const d = files[s.url] ??= await meta(s.url);
          if (s.from + s.dur > d + 0.05) throw new Error(`${s.url}: segment ends at ${s.from + s.dur} s, the file at ${d} s`);
        }
        return { language: p.language, full: true, frames, duration: p.duration, soundtrack: segs, fileDurations: files, timeline: p.timeline, errors: p.errors };
      }
      const audioDuration = await meta(p.audioUrl);
      if (Math.abs(audioDuration - p.duration) > 0.1) throw new Error(`Audio duration ${audioDuration} != timeline ${p.duration}`);
      return { language: p.language, frames, duration: p.duration, audioDuration, timeline: p.timeline, errors: p.errors };
    });
    const file = path.resolve(opt('out', path.join(ROOT, `out/verify-${LANG}${FULL ? '-full' : ''}.json`))!);
    if (!existsSync(path.dirname(file))) mkdirSync(path.dirname(file), { recursive: true });
    const browserErrors = logs.filter((l) => /^\[(error|pageerror|http )/.test(l));
    const result = { ...report, browserErrors, passed: report.errors.length === 0 && browserErrors.length === 0 };
    await Bun.write(file, JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result));
  } else if (mode === 'gpu') {
    console.log(await page.evaluate(() => {
      const gl = document.createElement('canvas').getContext('webgl2')!;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    }));
  } else if (mode === 'stills') {
    const times = (opt('t') ?? '0').split(',').map(Number);
    const files = await stills(page, times, opt('out', path.join(ROOT, 'out/stills'))!);
    console.log(files.join('\n'));
  } else if (mode === 'sheet') {
    const from = +opt('from', '0')!, to = +opt('to', '10')!, n = +opt('n', '12')!;
    let times = Array.from({ length: n }, (_, i) => from + ((to - from) * i) / Math.max(1, n - 1));
    if (opt('times')) times = opt('times')!.split(',').map(Number);
    if (flag('cuts')) {
      // 4 frames around every timeline boundary: 2 frames before, 2 after
      const tl: { id: string; start: number }[] = await page.evaluate(() => (window as any).__pdoom.timeline);
      times = tl.slice(1).flatMap((e) => [e.start - 0.1, e.start - 1 / 60, e.start + 1 / 60, e.start + 0.1]);
    }
    const out = opt('out', path.join(ROOT, `out/sheets/sheet_${from}-${to}.png`))!;
    await sheet(page, times, +opt('cols', '4')!, out);
    console.log(out);
  } else if (mode === 'plates') {
    const tl: { id: string; start: number; end: number }[] = await page.evaluate(() => (window as any).__pdoom.timeline);
    const figs = ['open', 'loss', 'room', 'shoggoth', 'spacetime', 'ascent', 'bureau', 'leftturn', 'paperclips', 'fuse', 'stack', 'dense', 'loom', 'ilya'];
    const plateConfig = path.join(APP, PT ? 'plates.pt-br.json' : 'plates.json');
    const overrides: Record<string, number> = existsSync(plateConfig) ? await Bun.file(plateConfig).json() : {};
    const dir = path.join(APP, PT ? 'public/plates/pt-br' : 'public/plates');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    await page.evaluate(() => { (window as any).__pdoom.engine.hudOff = true; });
    for (let i = 0; i < figs.length; i++) {
      const e = tl.find((x) => x.id === figs[i]);
      if (!e) continue;
      const t = overrides[figs[i]!] ?? (e.start + e.end) / 2;
      await page.evaluate((t) => (window as any).__pdoom.still(t, 4, 0.2), t);
      const f = path.join(dir, `fig${String(i + 1).padStart(2, '0')}.jpg`);
      await page.screenshot({ path: f, type: 'jpeg', quality: 90, clip: { x: 0, y: 0, width: 1920, height: 1080 } });
      console.log(f, t.toFixed(2));
    }
  } else if (mode === 'perf') {
    const from = +opt('from', '0')!, to = +opt('to', '5')!;
    const r = await page.evaluate(async ({ from, to, samples, shutter }) => {
      const P = (window as any).__pdoom;
      const ms: number[] = [];
      const buf = new Uint8Array(P.width * P.height * 4);
      P.still(from);
      const used: Record<number, number> = {};
      for (let t = from; t < to; t += 1 / 60) {
        const a = performance.now();
        const k = P.engine.render(t, 1 / 60, false, samples, shutter);
        used[k] = (used[k] ?? 0) + 1;
        await P.engine.readPixelsAsync(buf);
        ms.push(performance.now() - a);
      }
      ms.sort((a, b) => a - b);
      return { n: ms.length, avg: ms.reduce((a, b) => a + b, 0) / ms.length, p50: ms[ms.length >> 1], p95: ms[Math.floor(ms.length * 0.95)], max: ms[ms.length - 1], used };
    }, { from, to, samples: SAMPLES, shutter: +opt('shutter', '0.5')! });
    console.log(`frames ${r.n}  avg ${r.avg.toFixed(1)}ms  p50 ${r.p50.toFixed(1)}  p95 ${r.p95.toFixed(1)}  max ${r.max.toFixed(1)}  sub-frames ${hist(r.used)}`);
  } else if (mode === 'video') {
    const dur: number = await page.evaluate(() => (window as any).__pdoom.duration);
    await video(page, +opt('from', '0')!, +opt('to', String(dur))!, +opt('fps', '60')!, path.resolve(opt('out', path.join(ROOT, FULL ? 'out/pdoom-pt-BR-letra-explicada.mp4' : PT ? 'out/pdoom-pt-BR.mp4' : 'out/pdoom.mp4'))!));
  }
  const finalErrors: string[] = await page.evaluate(() => (window as any).__pdoom.errors);
  if (finalErrors.length) throw new Error('SCENE ERRORS:\n' + finalErrors.join('\n'));
  if (logs.length) console.error('BROWSER LOG:\n' + logs.slice(0, 40).join('\n'));
  if (logs.some((l) => /^\[(error|pageerror|http )/.test(l))) throw new Error('Browser errors occurred; render is incomplete (see log).');
} finally {
  await activeBrowser?.close();
  stop();
}
