// The full pt-BR video's sound is a splice, never a new mix: the song (the clip, with its end fade), 0.6 s
// of silence, the explainer's mixagem.mp3 exactly as it is, then the song again from 0:00 under the
// YouTube end screen. The same segment list drives the preview (SoundtrackPlayer) and the export
// (render.ts builds the ffmpeg filter from it).
import { PT_END_FADE_SECONDS } from '../locale';

/** Where the clip ends (its last frame is also the explanation's first). */
export const CLIP_END = 155.6;
/** The mixagem starts 0.6 s after the clip, once its fade has died out. */
export const MIX_AT = 156.2;
export const SONG_URL = 'audio/pdoom-pt-BR.mp3';
export const MIX_URL = 'audio/letra-explicada-pt-br/mixagem.mp3';
/** The song restarting with the clip under the end screen: YouTube's longest end screen, 20 s. */
export const END_TAIL = 20;
/** The restarted song fades out over the video's last seconds. */
export const END_FADE = 2.5;

export interface Segment {
  url: string;
  /** Video time where the segment starts. */
  at: number;
  /** Where in the file it starts, and for how long it plays. */
  from: number;
  dur: number;
  /** Linear fade-out over the segment's last `fadeOut` seconds. */
  fadeOut?: number;
}

export function soundtrack(mixDuration: number): Segment[] {
  return [
    { url: SONG_URL, at: 0, from: 0, dur: CLIP_END, fadeOut: PT_END_FADE_SECONDS },
    { url: MIX_URL, at: MIX_AT, from: 0, dur: mixDuration },
    { url: SONG_URL, at: MIX_AT + mixDuration, from: 0, dur: END_TAIL, fadeOut: END_FADE },
  ];
}
export const soundtrackEnd = (segs: Segment[]) => segs[segs.length - 1]!.at + segs[segs.length - 1]!.dur;

/** Gain of segment `s` at video time t (1 inside, ramping down over its fade-out). */
export const segmentGain = (s: Segment, t: number) =>
  s.fadeOut ? Math.max(0, Math.min(1, (s.at + s.dur - t) / s.fadeOut)) : 1;

/**
 * Preview playback of a segment list: a clock of its own (performance.now) that the audio elements
 * follow; each segment is its own element, played only while the clock is inside it.
 */
export class SoundtrackPlayer {
  private els: HTMLAudioElement[];
  private t0 = 0;
  private p0 = 0;
  playing = false;
  constructor(private segs: Segment[]) {
    this.els = segs.map((s) => { const a = new Audio(s.url); a.preload = 'auto'; return a; });
  }
  get duration() { return soundtrackEnd(this.segs); }
  get ended() { return this.now() >= this.duration; }
  now() { return this.playing ? this.t0 + (performance.now() - this.p0) / 1000 : this.t0; }
  seek(t: number) { this.t0 = Math.max(0, Math.min(this.duration, t)); this.p0 = performance.now(); this.sync(true); }
  play() { this.t0 = this.now(); this.p0 = performance.now(); this.playing = true; this.sync(true); }
  pause() { this.t0 = this.now(); this.playing = false; this.sync(true); }
  /** Keep the element under the clock playing at the right offset and the others paused (call every frame). */
  sync(force = false) {
    const t = this.now();
    if (this.playing && t >= this.duration) this.pause();
    this.segs.forEach((s, i) => {
      const el = this.els[i]!;
      const inside = this.playing && t >= s.at && t < s.at + s.dur;
      if (!inside) { if (!el.paused) el.pause(); return; }
      const local = s.from + (t - s.at);
      el.volume = segmentGain(s, t);
      if (el.paused) { el.currentTime = local; void el.play(); }
      else if (force || Math.abs(el.currentTime - local) > 0.08) el.currentTime = local;
    });
  }
}
