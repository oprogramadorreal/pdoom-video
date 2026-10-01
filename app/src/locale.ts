/** One language selection controls preview, analysis data, and generated assets. */
export const PT = typeof location !== 'undefined' && new URLSearchParams(location.search).get('lang')?.toLowerCase() === 'pt-br';
export const LANG = PT ? 'pt-BR' : 'en';
/**
 * `?lang=pt-BR&full=1`: the full pt-BR video — the clip, the narrated lyrics explainer (app/src/letra/),
 * then the clip restarting under the end screen. Without it, pt-BR is the clip alone.
 */
export const FULL = PT && new URLSearchParams(location.search).get('full') === '1';
/** Finish the Portuguese master's quiet but non-silent tail at the file boundary. */
export const PT_END_FADE_SECONDS = 1.25;
export const tr = (en: string, pt: string): string => PT ? pt : en;
export const AUDIO_URL = PT ? 'audio/pdoom-pt-BR.mp3' : 'audio/pdoom.mp3';
export const LYRICS_URLS = PT ? ['data/lyrics.pt-br.json'] : ['data/lyrics.json', 'data/lyrics.approx.json'];
export const AUDIO_DATA_URLS = PT ? ['data/audio.pt-br.json'] : ['data/audio.json', 'data/audio.approx.json'];

const sceneNames: Record<string, string> = {
  open: 'Faíscas', loss: 'Loss de treino', prompt1: 'ChatGPT', hook1: 'P(doom) 1', room: 'Quarto chinês',
  shoggoth: 'Shoggoth', spacetime: 'Singularidade', prompt2: 'Sydney', hook2: 'P(doom) 2', ascent: 'Ascensão',
  bureau: 'Burocracia', leftturn: 'Guinada', prompt3: 'Gato', hook3: 'P(doom) 3', paperclips: 'Clipes',
  fuse: 'Estopim', stack: 'Transformers', dense: 'Escala', hook4: 'P(doom) 4', loom: 'Loom', ilya: 'Ilya', outro: 'Final',
};
export const sceneName = (id: string) => PT ? sceneNames[id] ?? (/^x\d/.test(id) ? id.slice(1) : id === 'replay' ? 'Recomeço' : id) : id;
