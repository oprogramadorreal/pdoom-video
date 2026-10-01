// The explainer's timeline: one entry per narration block, from the clip's last frame (155.6 s) to the
// end of the mixagem, then the clip restarting under the end screen. Cuts fall in the silence between
// two paragraphs, on a beat of the background track when one fits there.
import type { TimelineEntry } from '../engine/engine';
import type { Narration } from './narration';
import { CLIP_END, END_TAIL, MIX_AT } from './soundtrack';
import { MONTAGE } from './montage';

const load = () => import('./scene');
const replay = () => import('./replay');

/** Video time where block i starts (block 0: the clip's end). */
export function blockCuts(n: Narration): number[] {
  return n.blocks.map((b, i) => {
    if (i === 0) return CLIP_END;
    const prev = n.blocks[i - 1]!;
    // the silence: after the last word has rung out, before the next one starts (leave the verse a moment)
    const a = prev.end + 0.05, z = b.start - 0.1;
    const beats = n.beatsIn(a, z);
    if (beats.length) return beats[0]!;
    const hit = n.hitIn(a, z);
    return hit ? hit[0] : a + Math.max(0, z - a) * 0.4;
  });
}

export function makeExtension(n: Narration): TimelineEntry[] {
  if (n.blocks.length !== MONTAGE.length || n.blocks.some((b, i) => b.id !== MONTAGE[i]!.id))
    throw new Error('the narration blocks and the montage list disagree (see letra/montage.ts)');
  const cuts = blockCuts(n);
  const mixEnd = MIX_AT + n.mixDuration;
  const entries: TimelineEntry[] = n.blocks.map((b, i) => ({
    id: `x${b.id}`, load, start: cuts[i]!, end: i + 1 < cuts.length ? cuts[i + 1]! : mixEnd, params: { block: b.id },
  }));
  entries.push({ id: 'replay', load: replay, start: mixEnd, end: mixEnd + END_TAIL, params: { from: mixEnd } });
  return entries;
}
