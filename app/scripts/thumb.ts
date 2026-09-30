#!/usr/bin/env bun
// The YouTube thumbnail of the full pt-BR video: renders thumb.html (src/thumb/) at 3840x2160 and
// downsamples it 3x to YouTube's 1280x720.
//   bun scripts/thumb.ts [--v hino,codigo] [--out ../out/thumb] [--samples 36] [--scale 2] [--debug]
// Writes <variant>.png (1280x720), <variant>.jpg (the upload: YouTube takes up to 2 MB) and <variant>-4k.png.
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const opt = (k: string, d?: string) => { const i = argv.indexOf(`--${k}`); return i >= 0 ? argv[i + 1] : d; };
const flag = (k: string) => argv.includes(`--${k}`);
const APP = path.resolve(import.meta.dir, '..');
const OUT = path.resolve(opt('out', path.join(APP, '../out/thumb'))!);
const VARIANTS = opt('v', 'hino,codigo')!.split(',');
const SCALE = Math.max(1, Math.round(+opt('scale', '2')!));
const SAMPLES = +opt('samples', '36')!;

async function reachable(url: string) {
  try { const r = await fetch(url, { signal: AbortSignal.timeout(1500) }); return r.ok; } catch { return false; }
}

// a private server without live reload (as scripts/render.ts starts one)
const port = 5300 + Math.floor(Math.random() * 500);
const server = Bun.spawn([process.execPath, 'x', 'vite', '--port', String(port), '--strictPort'], { cwd: APP, stdout: 'ignore', stderr: 'ignore', env: { ...process.env, PDOOM_NO_HMR: '1' } });
const url = `http://localhost:${port}`;
for (let i = 0; i < 100 && !(await reachable(url)); i++) await Bun.sleep(100);

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--enable-gpu-rasterization', '--ignore-gpu-blocklist'] });
try {
  for (const v of VARIANTS) {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
    const logs: string[] = [];
    page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') logs.push(`[${m.type()}] ${m.text()}`); });
    page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
    await page.goto(`${url}/thumb.html?lang=pt-BR&v=${v}${SCALE !== 1 ? `&scale=${SCALE}` : ''}${flag('debug') ? '&debug=1' : ''}`);
    await page.waitForFunction(() => (window as any).__thumb?.ready || (window as any).__thumb?.error, null, { timeout: 120000 });
    const err = await page.evaluate(() => (window as any).__thumb.error ?? (window as any).__thumb.errors.join('\n'));
    if (err) throw new Error(`thumb.html failed (${v}):\n${err}\n${logs.join('\n')}`);
    await page.evaluate((n) => (window as any).__thumb.still(n, 0), SAMPLES);
    const big = path.join(OUT, `${v}-4k.png`);
    await Bun.write(big, Buffer.from(await page.evaluate(() => (window as any).__thumb.png()), 'base64'));
    // 1280x720: an area-average of the 3x3 physical pixels (sharp, and it averages the film grain down)
    const png = path.join(OUT, `${v}.png`), jpg = path.join(OUT, `${v}.jpg`);
    for (const [f, q] of [[png, []], [jpg, ['-q:v', '2']]] as const) {
      const ff = Bun.spawnSync(['ffmpeg', '-v', 'error', '-y', '-i', big, '-vf', 'scale=1280:720:flags=area', ...q, f]);
      if (ff.exitCode) throw new Error(`ffmpeg failed: ${ff.stderr}`);
    }
    if (logs.length) console.error(logs.join('\n'));
    console.log([big, png, jpg].map((f) => `${f}  ${(Bun.file(f).size / 1024).toFixed(0)} KB`).join('\n'));
    await page.close();
  }
} finally {
  await browser.close();
  server.kill();
}
