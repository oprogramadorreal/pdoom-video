// A browser window, for "rodando numa página web" (00.2): the chrome drawn round a viewport the caller fills
// (tabs, window controls, back/forward/reload, the address bar with its URL typed in). Dark, like the rest of
// the video; the spark is the tab's favicon.
import { rgba } from '../engine/palette';
import { F, font, measure } from '../engine/type';
import { clamp, ease } from '../engine/util';

const TABS = 'rgb(24,24,27)', BAR = 'rgb(42,42,47)', OMNI = 'rgb(21,21,24)';

export interface BrowserOpts {
  /** 0..1: the chrome unfolding above the viewport (0 = none yet). */
  unfold: number;
  /** 0..1 of the address typed. */
  url: number;
  t: number;
  alpha?: number;
  title: string;
  host: string;
  path: string;
}

/** The chrome's height at full unfold for a viewport `w` wide. */
export const chromeHeight = (w: number) => 92 * (w / 1280);

/**
 * Draw the window round the viewport rect r (screen px): shadow, body, tab strip, toolbar. The viewport itself
 * is left for the caller (it is painted over the body).
 */
export function drawBrowser(c: CanvasRenderingContext2D, r: [number, number, number, number], o: BrowserOpts) {
  const [x0, y0, x1, y1] = r, w = x1 - x0, sc = w / 1280;
  const u = ease.outCubic(clamp(o.unfold));
  const tabH = 40 * sc, barH = 52 * sc, ch = (tabH + barH) * u, top = y0 - ch, rad = 12 * sc;
  c.save();
  c.globalAlpha *= o.alpha ?? 1;
  // the body, with its shadow
  c.save();
  c.shadowColor = 'rgba(0,0,0,0.7)'; c.shadowBlur = 80 * sc; c.shadowOffsetY = 20 * sc;
  c.fillStyle = TABS; c.beginPath(); c.roundRect(x0, top, w, y1 - top, [rad * u, rad * u, 4 * sc, 4 * sc]); c.fill();
  c.restore();
  // the chrome, anchored to the window's top edge and uncovered as it unfolds
  c.save();
  c.beginPath(); c.rect(x0, top, w, ch); c.clip();
  // the tab strip: one tab (the video), a new-tab button, the window controls
  const tx = x0 + 10 * sc, ty = top + 8 * sc, tw = 300 * sc, th = tabH - 8 * sc, tm = ty + th / 2;
  c.fillStyle = BAR; c.beginPath(); c.roundRect(tx, ty, tw, th + 1, [9 * sc, 9 * sc, 0, 0]); c.fill();
  // (the favicon: the spark)
  const g = c.createRadialGradient(tx + 20 * sc, tm, 0, tx + 20 * sc, tm, 9 * sc);
  g.addColorStop(0, 'rgba(255,240,220,1)'); g.addColorStop(0.35, rgba('signal', 1)); g.addColorStop(1, rgba('signal', 0));
  c.fillStyle = g; c.beginPath(); c.arc(tx + 20 * sc, tm, 9 * sc, 0, Math.PI * 2); c.fill();
  c.font = font(F.archivo(100, 500), 15 * sc); c.textBaseline = 'middle'; c.fillStyle = rgba('bone', 0.9);
  c.save(); c.beginPath(); c.rect(tx, ty, tw - 34 * sc, th); c.clip(); c.fillText(o.title, tx + 36 * sc, tm + 1); c.restore();
  c.strokeStyle = rgba('bone', 0.55); c.lineWidth = 1.4 * sc; c.lineCap = 'round';
  const cross = (x: number, y: number, s: number) => { c.beginPath(); c.moveTo(x - s, y - s); c.lineTo(x + s, y + s); c.moveTo(x + s, y - s); c.lineTo(x - s, y + s); c.stroke(); };
  cross(tx + tw - 18 * sc, tm, 4.5 * sc);
  c.beginPath(); c.moveTo(tx + tw + 18 * sc, tm); c.lineTo(tx + tw + 30 * sc, tm); c.moveTo(tx + tw + 24 * sc, tm - 6 * sc); c.lineTo(tx + tw + 24 * sc, tm + 6 * sc); c.stroke();
  const cm = top + tabH / 2 + 2 * sc;
  c.strokeStyle = rgba('bone', 0.7);
  c.beginPath(); c.moveTo(x1 - 142 * sc, cm); c.lineTo(x1 - 130 * sc, cm); c.stroke();
  c.strokeRect(x1 - 90 * sc, cm - 6 * sc, 11 * sc, 11 * sc);
  cross(x1 - 34 * sc, cm, 6 * sc);
  // the toolbar: back, forward, reload, the address bar, the menu
  const by = top + tabH, bm = by + barH / 2;
  c.fillStyle = BAR; c.fillRect(x0, by, w, barH);
  c.strokeStyle = rgba('bone', 0.75); c.lineWidth = 1.8 * sc; c.lineJoin = 'round';
  const arrow = (x: number, dir: number, a: number) => {
    c.globalAlpha *= a;
    c.beginPath(); c.moveTo(x + 8 * sc * dir, bm); c.lineTo(x - 8 * sc * dir, bm);
    c.moveTo(x - 2 * sc * dir, bm - 6 * sc); c.lineTo(x - 8 * sc * dir, bm); c.lineTo(x - 2 * sc * dir, bm + 6 * sc); c.stroke();
    c.globalAlpha /= a;
  };
  arrow(x0 + 26 * sc, 1, 1); arrow(x0 + 62 * sc, -1, 0.45);
  c.beginPath(); c.arc(x0 + 98 * sc, bm, 7.5 * sc, -0.3, Math.PI * 1.55); c.stroke();
  const ra = -0.3, rx = x0 + 98 * sc + Math.cos(ra) * 7.5 * sc, ry = bm + Math.sin(ra) * 7.5 * sc;
  c.beginPath(); c.moveTo(rx - 5 * sc, ry - 3 * sc); c.lineTo(rx + 1 * sc, ry - 1 * sc); c.lineTo(rx + 1 * sc, ry - 7 * sc); c.stroke();
  const ox0 = x0 + 126 * sc, ox1 = x1 - 64 * sc, oh = 34 * sc;
  c.fillStyle = OMNI; c.beginPath(); c.roundRect(ox0, bm - oh / 2, ox1 - ox0, oh, oh / 2); c.fill();
  c.strokeStyle = rgba('ash', 0.8); c.lineWidth = 1.3 * sc;
  c.beginPath(); c.arc(ox0 + 20 * sc, bm, 7 * sc, 0, Math.PI * 2); c.stroke();
  c.fillStyle = rgba('ash', 0.9); c.fillRect(ox0 + 19.3 * sc, bm - 1 * sc, 1.4 * sc, 5 * sc); c.fillRect(ox0 + 19.3 * sc, bm - 4 * sc, 1.4 * sc, 1.4 * sc);
  // the address, typed
  const fam = F.archivo(100, 400), size = 17 * sc, full = o.host + o.path;
  const n = Math.floor(clamp(o.url) * full.length + 1e-6);
  const shownHost = full.slice(0, Math.min(n, o.host.length)), shownPath = n > o.host.length ? full.slice(o.host.length, n) : '';
  const ax = ox0 + 38 * sc;
  c.font = font(fam, size); c.fillStyle = rgba('bone', 0.95); c.fillText(shownHost, ax, bm + 1);
  const hx = ax + measure(shownHost, fam, size);
  c.fillStyle = rgba('ash', 0.95); c.fillText(shownPath, hx, bm + 1);
  if (o.url > 0 && o.url < 1 && Math.floor(o.t * 4) % 2 === 0) { c.fillStyle = rgba('signal'); c.fillRect(hx + measure(shownPath, fam, size) + 2 * sc, bm - 9 * sc, 2 * sc, 18 * sc); }
  c.fillStyle = rgba('bone', 0.7);
  for (let i = -1; i <= 1; i++) { c.beginPath(); c.arc(x1 - 32 * sc, bm + i * 6 * sc, 1.6 * sc, 0, Math.PI * 2); c.fill(); }
  c.restore();
  // a hairline between the chrome and the page
  c.fillStyle = 'rgba(255,255,255,0.07)'; c.fillRect(x0, y0 - 1, w, 1);
  c.restore();
}
