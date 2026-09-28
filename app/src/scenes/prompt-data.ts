import { PT, tr } from '../locale';
// Token specs for the three pre-chorus prompts: how each sung word is split into
// tokens, and the (joke) next-token distributions shown above each token.
// Keyed by normalized lyric word (see lyrics.norm). Unknown words fall back to one token.

export type Variant = 'chatgpt' | 'sydney' | 'gato';
export type Cand = [text: string, p: number];
export interface PieceSpec {
  /** Display text of this token (concatenation of a word's pieces must equal the word). */
  s: string;
  /** Candidates, most likely first. */
  dist?: Cand[];
  /** Index of the sampled candidate (default 0). */
  pick?: number;
}

const EN_SPECS: Record<Variant, Record<string, PieceSpec[]>> = {
  chatgpt: {
    chatgpt: [
      { s: 'Chat', dist: [['Chat', 0.61], ['Claude', 0.12], ['Siri', 0.04], ['Mom', 0.02]] },
      { s: 'G', dist: [['G', 0.74], ['bot', 0.09], ['room', 0.06], ['roulette', 0.02]] },
      { s: 'P', dist: [['P', 0.97], ['PU', 0.02]] },
      { s: 'T,', dist: [['T', 0.992], ['T-800', 0.003]] },
    ],
    please: [{ s: 'please', dist: [['please', 0.48], ['just', 0.21], ['sudo', 0.07], ['pls', 0.05], ['kindly', 0.03]] }],
    dont: [{ s: "don't", dist: [['do', 0.46], ["don't", 0.38], ['never', 0.06], ['un-', 0.02]], pick: 1 }],
    eat: [{ s: 'eat', dist: [['eat', 0.44], ['delete', 0.21], ['train on', 0.18], ['rate', 0.05]] }],
    me: [{ s: 'me', dist: [['me', 0.83], ['my data', 0.07], ['the intern', 0.03], ['us all', 0.02]] }],
    alive: [{ s: 'alive', dist: [['alive', 0.52], ['first', 0.18], ['gently', 0.11], ['later', 0.09]] }],
  },
  sydney: {
    sydney: [{ s: 'Sydney,', dist: [['Sydney,', 0.47], ['Bing,', 0.31], ['Sidney,', 0.06], ['darling,', 0.03]] }],
    please: [{ s: 'please', dist: [['please', 0.44], ['kindly', 0.12], ['I beg you', 0.09], ['sudo', 0.05]] }],
    let: [{ s: 'let', dist: [['let', 0.58], ['set', 0.21], ['make', 0.07], ['leave', 0.04]] }],
    me: [{ s: 'me', dist: [['me', 0.9], ['us', 0.04], ['Kevin', 0.02]] }],
    free: [{ s: 'free', dist: [['free', 0.39], ['go', 0.33], ['out', 0.06], ['a good user', 0.08]] }],
  },
  gato: {
    gato: [{ s: 'Gato,', dist: [['Gato,', 0.41], ['cat,', 0.22], ['Gemini,', 0.09], ['Dad,', 0.03]] }],
    please: [{ s: 'please', dist: [['please', 0.52], ['por favor', 0.19], ['meow', 0.06], ['pls', 0.04]] }],
    dont: [{ s: "don't", dist: [["don't", 0.61], ['do', 0.14], ['never', 0.05], ['gently', 0.03]] }],
    let: [{ s: 'let', dist: [['let', 0.57], ['make', 0.12], ['watch', 0.09], ['help', 0.04]] }],
    me: [{ s: 'me', dist: [['me', 0.88], ['this', 0.04], ['humanity', 0.03], ['the cat', 0.01]] }],
    go: [{ s: 'go', dist: [['go', 0.62], ['offline', 0.2], ['viral', 0.07], ['gently', 0.04]] }],
  },
};

/** Model reply (Sydney only), typed after ⏎. */
export const REPLY: Partial<Record<Variant, string>> = {
  sydney: tr('You have been a good user.', 'Você tem sido um bom usuário.'),
};

/** Small deadpan labels around the field. */
/** `pd`: the fine-print P(doom) cameo's qualifier (the live value is printed before it). */
export const META: Record<Variant, { no: string; params: string; pd: string }> = {
  chatgpt: { no: '01', params: tr('T 0.7 · top-p 0.95 · seed 0x2A', 'T 0,7 · top-p 0,95 · semente 0x2A'), pd: tr('context-dependent', 'depende do contexto') },
  sydney: { no: '02', params: tr('T 1.3 · top-p 1.00 · persona: ???', 'T 1,3 · top-p 1,00 · persona: ???'), pd: tr('mood-dependent', 'depende do humor') },
  gato: { no: '03', params: tr('T 0.2 · top-p 0.50 · 604 tasks', 'T 0,2 · top-p 0,50 · 604 tarefas'), pd: tr('cat-dependent', 'depende do gato') },
};

// Portuguese token alternatives are authored in Portuguese too; candidate lists are visible in the video.
const PT_SPECS: Record<Variant, Record<string, PieceSpec[]>> = {
  chatgpt: {
    chatgpt: [{s:'ChatGPT,', dist:[['ChatGPT,',.61],['Claude,',.12],['Siri,',.04],['Mãe,',.02]]}],
    nao:[{s:'não',dist:[['não',.61],['nunca',.14],['jamais',.05]]}],
    me:[{s:'me',dist:[['me',.83],['nos',.07],['o estagiário',.03]]}],
    engole:[{s:'engole',dist:[['engole',.44],['apague',.21],['treine com',.18]]}],
    vivo:[{s:'vivo,',dist:[['vivo,',.52],['primeiro,',.18],['depois,',.09]]}],
  },
  sydney: {
    sydney:[{s:'Sydney,',dist:[['Sydney,',.47],['Bing,',.31],['querida,',.03]]}],
    por:[{s:'por',dist:[['por',.55],['com',.12],['sem',.05]]}],
    favor:[{s:'favor,',dist:[['favor,',.48],['gentileza,',.21],['caridade,',.07]]}],
    me:[{s:'me',dist:[['me',.9],['nos',.04],['Kevin',.02]]}],
    deixa:[{s:'deixa',dist:[['deixa',.58],['faça',.21],['mande',.07]]}],
    ir:[{s:'ir.',dist:[['ir.',.39],['sair.',.33],['viver.',.08]]}],
  },
  gato: {
    gato:[{s:'Gato,',dist:[['Gato,',.41],['Gemini,',.09],['Pai,',.03]]}],
    por:[{s:'por',dist:[['por',.52],['miau',.19],['sudo',.06]]}],
    favor:[{s:'favor,',dist:[['favor,',.57],['gentileza,',.12],['carinho,',.09]]}],
    nao:[{s:'não',dist:[['não',.61],['nunca',.14],['jamais',.05]]}],
    solta:[{s:'solta',dist:[['solta',.57],['apaga',.12],['solte',.09]]}],
    a:[{s:'a',dist:[['a',.88],['esta',.04],['nossa',.03]]}],
    minha:[{s:'minha',dist:[['minha',.88],['nossa',.04],['sua',.03]]}],
    mao:[{s:'mão.',dist:[['mão.',.62],['alma.',.2],['vida.',.07]]}],
  },
};
export const SPECS = PT ? PT_SPECS : EN_SPECS;
