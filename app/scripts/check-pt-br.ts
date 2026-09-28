// Data-level checks complement render.ts verify's full-track scene/asset checks.
import assert from 'node:assert/strict';
import path from 'node:path';
import vm from 'node:vm';
import { Lyrics, norm } from '../src/engine/lyrics';
import { AudioData, type AudioJSON } from '../src/engine/audio';

const root = path.resolve(import.meta.dir, '../..');
const read = (p: string) => Bun.file(path.join(root, p));
const source = (p: string) => read(p).text().then((s) => vm.runInNewContext(`${s}\nLY`) as [number, number, string][]);
const [src, en, lyricJSON, audioJSON] = await Promise.all([
  source('lyrics/lyrics.src.pt-br.js'), source('lyrics/lyrics.src.js'),
  read('data/lyrics.pt-br.json').json(), read('data/audio.pt-br.json').json(),
]);
const lyrics = new Lyrics(lyricJSON), audio = new AudioData(audioJSON);
assert.equal(lyrics.lines.length, src.length, 'Every supplied Portuguese line must be present');
assert.equal(src.length, en.length, 'Source line identities must match');
const clean = (s: string) => s.normalize('NFC').replace(/[“”]/g, '"').replace(/[‘’]/g, "'").trim();
let lastEnd = 0;
for (const [i, l] of lyrics.lines.entries()) {
  assert.equal(clean(l.text), clean(src[i]![2]), `Lyric wording, line ${i + 1}`);
  assert.equal(clean(l.words.map((w) => w.w).join(' ')), clean(l.text), `Complete tokens, line ${i + 1}`);
  assert.equal(clean(l.sourceText ?? ''), clean(en[i]![2]), `English authoring alias, line ${i + 1}`);
  assert.equal(lyrics.get(en[i]![2], en.slice(0, i).filter((x) => clean(x[2]).toLowerCase().includes(clean(en[i]![2]).toLowerCase())).length).i, i);
  assert(l.start >= lastEnd - .025, `Overlapping lines ${i}/${i + 1}`);
  assert(l.end > l.start && l.end <= audio.duration, `Line duration ${i + 1}`);
  assert(Math.abs(src[i]![0] - l.start) < .025 && Math.abs(src[i]![1] - l.end) < .025, `Source timestamp ${i + 1}`);
  let wordEnd = l.start;
  for (const w of l.words) {
    assert(Number.isFinite(w.start) && Number.isFinite(w.end), `Finite word timing ${w.w}`);
    assert(w.start >= wordEnd - .025 && w.end > w.start && w.end <= l.end + .025, `Ordered word timing ${i + 1}: ${w.w}`);
    wordEnd = w.end;
  }
  lastEnd = l.end;
}
assert.equal(lyrics.findWords('P(doom)').length, 4, 'All four choruses');
assert.equal(norm('ÁTOMOS,'), 'atomos', 'Accented word anchors');
for (const list of [audio.beats, audio.downbeats]) {
  assert(list.length > 1);
  list.forEach((x, i) => assert(Number.isFinite(x) && (i === 0 || x > list[i - 1]!), 'Ordered music grid'));
}
const features = audioJSON.features ?? Object.fromEntries(['rms', 'low', 'mid', 'high', 'vocal', 'drums', 'bass', 'other', 'pitchMidi'].map(k => [k, audioJSON[k]]));
for (const [name, values] of Object.entries(features) as [string, number[]][]) {
  assert(Array.isArray(values), `Missing ${name} feature`);
  assert(values.length >= Math.floor(audio.duration * audioJSON.fps) - 1, `Complete ${name} envelope`);
  assert(values.every(Number.isFinite), `Finite ${name} envelope`);
}
assert(audio.sections.some((s) => s.name === 'outro' && s.start >= lastEnd - .025 && s.end === audio.duration), 'Complete instrumental ending');
const probe = Bun.spawn(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', path.join(root, 'audio/pdoom-pt-BR.mp3')], { stdout: 'pipe' });
const duration = Number((await new Response(probe.stdout).text()).trim());
assert.equal(await probe.exited, 0, 'ffprobe');
assert(Math.abs(duration - audio.duration) < .05, `MP3 ${duration} vs analysis ${audio.duration}`);
console.log(`pt-BR: ${lyrics.lines.length} lines, ${lyrics.words.length} words, ${duration.toFixed(3)} s; wording, aliases, timing ranges, beat grid and envelopes pass.`);
