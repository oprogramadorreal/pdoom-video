// The explainer's edit list ("lista de montagem", ROTEIRO.md): one entry per narration block, in order.
// Each block opens with its verse (the song line it explains) and puts the ruler's cursor on it; the
// image of each block is built in the chapter modules (c00.ts … c06.ts). Timing never lives here:
// blocks start and end in the silences of the narration (timeline.ts), and images change on the
// narration's words (NBlock.words) and the track's beats. The ruler comes and goes on its own (see
// Regua.visible): it shows each change of verse, and stays where a block says it uses it (`ruler`).
import type { Lyrics, Line } from '../engine/lyrics';

export interface VerseSpec {
  /** Song lines, found by their Portuguese text (a hook line by its chorus number: 'hook:1'…'hook:4'). */
  lines: string[];
}
export interface BlockSpec {
  id: string;
  verse?: VerseSpec;
  /** Where the ruler's cursor sits during the block when there is no verse: song seconds or 'keep'. */
  pos?: number | 'keep' | 'end';
  /** The block uses the ruler: all through, or from a word of its narration to its end. */
  ruler?: 'block' | { from: string };
}

const V = (...lines: string[]): VerseSpec => ({ lines });

export const MONTAGE: BlockSpec[] = [
  { id: '00.1', pos: 0 },
  // "No final": the spark runs to the ruler's end; the sweep across the lyric and the teasers' jumps
  { id: '00.2', pos: 0, ruler: { from: 'artificial' } }, { id: '00.3', pos: 0, ruler: 'block' },
  { id: '00.4', pos: 0 }, { id: '00.5', pos: 0 },
  // the spark jumping from chorus to chorus
  { id: '00.6', pos: 0, ruler: 'block' },
  { id: '01.1', verse: V('Vejo AGI faiscar') },
  { id: '01.2', verse: V('teus circuitos me dão') },
  { id: '01.3', verse: V('Tua loss de treino') },
  { id: '01.4', verse: V('ChatGPT, não me engole') },
  { id: '02.1', verse: V('hook:1', 'pois o futuro faz FOOM') },
  { id: '02.2', verse: V('Preso no quarto chinês', 'cogumelos pra um mês') },
  // "Guarda essa máscara": it flies into the ruler's corner
  { id: '02.3', verse: V('Desmascara o shoggoth'), ruler: { from: 'Guarda' } },
  { id: '02.4', verse: V('com teus olhos de shinigami') },
  { id: '02.5', pos: 'keep' },
  { id: '02.6', verse: V('mas a singularidade começou') },
  { id: '02.7', verse: V('Sydney, por favor') },
  { id: '03.1', verse: V('hook:2', 'ouço o basilisco') },
  { id: '03.2', verse: V('NVIDIA pra Lua', 'Ponto Ômega em três', 'Um E trinta FLOPs') },
  { id: '03.3', verse: V('MLP: vai, volta') },
  { id: '03.4', verse: V('von Neumann já virou') },
  { id: '03.5', verse: V('Guinada à esquerda') },
  { id: '03.6', verse: V('sem um só CDR') },
  { id: '03.7', verse: V('Gato, por favor') },
  { id: '04.1', verse: V('hook:3', 'tudo vira clipe') },
  { id: '04.2', verse: V('Quem desliga foi viajar', 'não tem pra onde escapar') },
  // "Aceso desde o primeiro segundo": the whole ruler burns as a fuse
  { id: '04.3', verse: V('acendemos o estopim'), ruler: { from: 'Aceso' } },
  { id: '04.4', verse: V('tese da ortogonalidade') },
  { id: '04.5', verse: V('transformers, é simples', 'aprendeu a dizer') },
  { id: '04.6', verse: V('Pós-Chinchilla', 'pula a cerca', 'Cem mil GPU', 'RLHF deu chabu') },
  { id: '05.1', verse: V('hook:4', 'como previu o Loom') },
  { id: '05.2', verse: V('Do pré-treino preditivo', 'ao auto-upgrade recursivo') },
  { id: '05.3', verse: V('O que Ilya viu') },
  { id: '05.4', pos: 'keep' },
  { id: '05.5', verse: V('Foi tudo só pra inglês') },
  { id: '06.1', pos: 'end' }, { id: '06.2', pos: 'end' },
  // the ruler as the time control; the rewind to 0:00 and the play
  { id: '06.3', pos: 'end', ruler: { from: 'Você dá' } },
  { id: '06.4', pos: 'end' }, { id: '06.5', pos: 'end' }, { id: '06.6', pos: 'end' }, { id: '06.7', pos: 0, ruler: 'block' },
];

/** A verse's song lines. */
export function verseLines(ly: Lyrics, v: VerseSpec): Line[] {
  return v.lines.map((q) => {
    const m = /^hook:(\d)$/.exec(q);
    if (m) return ly.lines[ly.findWords('P(doom)')[+m[1]! - 1]!.line]!;
    const l = ly.lines.find((x) => x.text.toLowerCase().includes(q.toLowerCase()));
    if (!l) throw new Error(`verse line not found: ${q}`);
    return l;
  });
}
