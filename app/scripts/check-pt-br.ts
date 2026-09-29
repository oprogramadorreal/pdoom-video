// Data-level checks complement render.ts verify's full-track scene/asset checks.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import path from 'node:path';
import vm from 'node:vm';
import { Lyrics, norm } from '../src/engine/lyrics';
import { AudioData, type AudioJSON } from '../src/engine/audio';

const root = path.resolve(import.meta.dir, '../..');
const read = (p: string) => Bun.file(path.join(root, p));
const source = (p: string) => read(p).text().then((s) => vm.runInNewContext(`${s}\nLY`) as [number, number, string][]);
const [src, en, lyricJSON, audioJSON, audioBytes] = await Promise.all([
  source('lyrics/lyrics.src.pt-br.js'), source('lyrics/lyrics.src.js'),
  read('data/lyrics.pt-br.json').json(), read('data/audio.pt-br.json').json(),
  read('audio/pdoom-pt-BR.mp3').arrayBuffer(),
]);
const audioHash = createHash('sha256').update(new Uint8Array(audioBytes)).digest('hex');
assert.equal(lyricJSON.audioSha256, audioHash, 'Lyric alignment must describe the current MP3');
assert.equal(audioJSON.audioSha256, audioHash, 'Music analysis must describe the current MP3');
const lyrics = new Lyrics(lyricJSON), audio = new AudioData(audioJSON);
assert(Number.isFinite(audio.duration) && audio.duration > 0, 'Positive finite audio duration');
assert(Number.isFinite(audio.bpm) && audio.bpm > 0, 'Positive finite tempo');
assert(Number.isFinite(audioJSON.fps) && audioJSON.fps > 0, 'Positive finite feature frame rate');
assert.equal(lyrics.lines.length, src.length, 'Every supplied Portuguese line must be present');
assert.equal(src.length, en.length, 'Source line identities must match');
const clean = (s: string) => s.normalize('NFC').replace(/[“”]/g, '"').replace(/[‘’]/g, "'").trim();
let lastEnd = 0;
for (const [i, l] of lyrics.lines.entries()) {
  assert.equal(lyricJSON.lines[i].i, i, `Line identity ${i + 1}`);
  assert(l.words.length > 0, `Words present, line ${i + 1}`);
  assert.equal(clean(l.text), clean(src[i]![2]), `Lyric wording, line ${i + 1}`);
  assert.equal(clean(l.words.map((w) => w.w).join(' ')), clean(l.text), `Complete tokens, line ${i + 1}`);
  assert.equal(clean(l.sourceText ?? ''), clean(en[i]![2]), `English authoring alias, line ${i + 1}`);
  assert.equal(lyrics.get(en[i]![2], en.slice(0, i).filter((x) => clean(x[2]).toLowerCase().includes(clean(en[i]![2]).toLowerCase())).length).i, i);
  assert(Number.isFinite(l.start) && Number.isFinite(l.end), `Finite line timing ${i + 1}`);
  assert(l.start >= 0 && l.start >= lastEnd - .025, `Overlapping lines ${i}/${i + 1}`);
  assert(l.end > l.start && l.end <= audio.duration, `Line duration ${i + 1}`);
  assert.equal(l.start, l.words[0]!.start, `First word anchors line ${i + 1}`);
  assert.equal(l.end, l.words[l.words.length - 1]!.end, `Last word anchors line ${i + 1}`);
  assert(Math.abs(src[i]![0] - l.start) < .025 && Math.abs(src[i]![1] - l.end) < .025, `Source timestamp ${i + 1}`);
  let wordEnd = l.start;
  for (const w of l.words) {
    assert(Number.isFinite(w.start) && Number.isFinite(w.end), `Finite word timing ${w.w}`);
    assert(w.start >= l.start && w.start >= wordEnd - .025 && w.end > w.start && w.end <= l.end, `Ordered word timing ${i + 1}: ${w.w}`);
    if (w.conf !== undefined) assert(Number.isFinite(w.conf) && w.conf >= 0 && w.conf <= 1, `Acoustic score ${i + 1}: ${w.w}`);
    let syllableEnd = w.start;
    for (const [start, end] of w.syl ?? []) {
      assert(Number.isFinite(start) && Number.isFinite(end), `Finite syllable timing ${i + 1}: ${w.w}`);
      assert(start >= w.start && start >= syllableEnd && end > start && end <= w.end, `Contained ordered syllables ${i + 1}: ${w.w}`);
      syllableEnd = end;
    }
    wordEnd = w.end;
  }
  lastEnd = l.end;
}
assert.equal(lyrics.findWords('P(doom)').length, 4, 'All four choruses');
assert.equal(norm('ÁTOMOS,'), 'atomos', 'Accented word anchors');
for (const list of [audio.beats, audio.downbeats]) {
  assert(list.length > 1);
  list.forEach((x, i) => assert(Number.isFinite(x) && x >= 0 && x < audio.duration && (i === 0 || x > list[i - 1]!), 'Ordered music grid within audio'));
}
audio.downbeats.forEach(t => assert(audio.beats.some(b => Math.abs(b - t) < .001), 'Downbeats belong to the measured beat grid'));
for (const name of ['rms', 'low', 'mid', 'high', 'vocal', 'drums', 'bass', 'other', 'pitchMidi']) {
  const values: number[] = audioJSON.features?.[name] ?? audioJSON[name];
  assert(Array.isArray(values), `Missing ${name} feature`);
  assert(Math.abs(values.length - Math.ceil(audio.duration * audioJSON.fps)) <= 1, `Full-duration ${name} envelope`);
  assert(values.every(Number.isFinite), `Finite ${name} envelope`);
  assert(values.every(v => v >= 0 && v <= (name === 'pitchMidi' ? 128 : 1)), `Valid ${name} feature range`);
}
for (const name of ['kick', 'snare', 'hat', 'vocal']) {
  const events = audio.onsets[name];
  assert(Array.isArray(events), `Missing ${name} onsets`);
  events.forEach(([t, strength], i) => {
    assert(Number.isFinite(t) && t >= 0 && t < audio.duration && (i === 0 || t > events[i - 1]![0]), `Ordered ${name} onsets within audio`);
    assert(Number.isFinite(strength) && strength >= 0 && strength <= 1, `Valid ${name} onset strength`);
  });
}
assert(audio.sections.length > 0, 'Music sections present');
audio.sections.forEach((s, i) => {
  assert(Number.isFinite(s.start) && Number.isFinite(s.end) && s.start >= 0 && s.end >= s.start && s.end <= audio.duration, `Valid section ${s.name}`);
  assert.equal(s.start, i === 0 ? 0 : audio.sections[i - 1]!.end, `Contiguous section ${s.name}`);
});
assert.equal(audio.sections[audio.sections.length - 1]!.end, audio.duration, 'Sections cover the complete recording');
assert(audio.sections.some((s) => s.name === 'outro' && s.start >= lastEnd - .025 && s.end === audio.duration), 'Complete instrumental ending');
const probe = Bun.spawn(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', path.join(root, 'audio/pdoom-pt-BR.mp3')], { stdout: 'pipe' });
const duration = Number((await new Response(probe.stdout).text()).trim());
assert.equal(await probe.exited, 0, 'ffprobe');
assert(Math.abs(duration - audio.duration) < .05, `MP3 ${duration} vs analysis ${audio.duration}`);
console.log(`pt-BR: ${lyrics.lines.length} lines, ${lyrics.words.length} words, ${duration.toFixed(3)} s; wording, aliases, timing ranges, beat grid and envelopes pass.`);
