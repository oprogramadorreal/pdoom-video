"""pt-BR lyrics explainer: narration word timings and the background track's beat grid.

The explainer's sound is audio/letra-explicada-pt-br/mixagem.mp3, used as it is. This script
measures what the video needs to follow it and writes data/narracao.pt-br.json:

* words: every paragraph of docs/letra-explicada-pt-br/tts/*.txt is a block (00.1, 00.2 ...).
  Each chapter's voice MP3 (no music under it) is force-aligned to its text with MMS_FA CTC
  (one Viterbi pass per chapter, a garbage token between paragraphs, see ctcalign.py), then
  shifted by the chapter's start in the mix. The starts are the running sum of the voice MP3
  durations, and each one is confirmed by cross-correlating the voice with the mix.
* beats: the background track's beat grid (librosa, refined to a constant tempo), mapped into
  mix time through the loop structure measured by cross-correlating the mix with the track.

Run in the portable analysis environment (see docs/PT-BR-ALIGNMENT.md):
  analysis/.venv/Scripts/python.exe analysis/narracao.py all
Intermediates (emissions) are cached in analysis/work/narracao/.
"""
import common
import argparse
import hashlib
import json
import re
import unicodedata

import numpy as np

AUDIO_DIR = common.PROJECT / "audio" / "letra-explicada-pt-br"
TTS_DIR = common.PROJECT / "docs" / "letra-explicada-pt-br" / "tts"
MIX = AUDIO_DIR / "mixagem.mp3"
TRACK = AUDIO_DIR / "trilha-de-fundo.mp3"
OUT = common.DATA / "narracao.pt-br.json"
# The background track loops its steady part (23 four-bar phrases) under the voice.
STEADY_START, STEADY_END, BEATS_PER_LOOP = 12.427, 174.880, 23 * 16
WORK = common.WORK / "narracao"
WORK.mkdir(parents=True, exist_ok=True)

CHAPTERS = [
    ("00-abertura", "Tudo é código"),
    ("01-faiscas", "P(doom) 0,02 · Faíscas"),
    ("02-o-que-tem-dentro", "0,15 · O que tem lá dentro"),
    ("03-poder-demais", "0,42 · Poder demais"),
    ("04-clipes-de-papel", "0,81 · Clipes de papel"),
    ("05-o-que-ilya-viu", "0,99 · O que Ilya viu"),
    ("06-bastidores", "Como uma IA fez este vídeo"),
]

# How the voice says the words the text writes as they look (letters the aligner can match).
PRON = {
    "i-á": "i a", "agi": "a ge i", "gpt-4": "ge pe te quatro", "gpt": "ge pe te", "chatgpt": "chat ge pe te",
    "mlp": "eme ele pe", "cdr": "ce de erre", "rlhf": "erre ele aga efe", "glsl": "ge ele esse ele",
    "typescript": "taipiscript", "effects": "efects", "clód": "clod", "microsoft": "maicrosoft",
    "john": "jon", "searle": "serl", "shoggoth": "chogote", "lovecraft": "lovecraft", "death": "det",
    "note": "nout", "shinigami": "chinigami", "sydney": "sidnei", "new": "niu", "york": "iork",
    "times": "taims", "von": "fon", "neumann": "noiman", "deepmind": "dipmaind", "videogame": "videoguei",
    "openai": "open ei ai", "feedback": "fidbec", "blues": "blus", "sam": "sem", "shaders": "cheiders",
    "web": "ueb", "prompt": "prompt", "bing": "bim", "chatbot": "chatbot",
}


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def normalized(text):
    return re.sub(r"[^a-z' ]", " ", unicodedata.normalize("NFKD", text.lower()).encode("ascii", "ignore").decode()).strip()


def pron(token):
    key = re.sub(r"^[^\wÀ-ÿ]+|[^\wÀ-ÿ]+$", "", token.lower())
    return (PRON.get(key) or normalized(token)).split()


def paragraphs(stem):
    text = (TTS_DIR / f"{stem}.txt").read_text(encoding="utf-8-sig")
    return [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]


def load(path, sr=None):
    import soundfile as sf
    import soxr
    y, s = sf.read(path, dtype="float32", always_2d=True)
    y = y.mean(axis=1)
    if sr and sr != s:
        y = soxr.resample(y, s, sr)
        s = sr
    return y, s


def emissions(y):
    import torch
    import torchaudio
    torch.set_num_threads(8)
    bundle = torchaudio.pipelines.MMS_FA
    model = bundle.get_model(with_star=False).eval()
    hop, chunk, context = 320, 20 * 16000, 3 * 16000
    nframes = len(y) // hop
    result = None
    for start in range(0, len(y), chunk):
        a, b = max(0, start - context), min(len(y), start + chunk + context)
        with torch.inference_mode():
            e, _ = model(torch.from_numpy(y[a:b].copy())[None])
            e = e.log_softmax(-1)[0].numpy()
        if result is None:
            result = np.full((nframes, e.shape[1]), np.nan, dtype=np.float32)
        lo, hi = start // hop, min(nframes, (start + chunk) // hop)
        part = e[lo - a // hop:hi - a // hop]
        result[lo:lo + len(part)] = part
    last = np.where(~np.isnan(result[:, 0]))[0].max()
    result[last + 1:] = result[last]
    return result, list(bundle.get_labels(star=None))


def xcorr_lag(a, b, max_lag):
    """Lag (samples) that best aligns b to a: a[n] ~ b[n - lag], |lag| <= max_lag."""
    n = len(a) + len(b)
    fa, fb = np.fft.rfft(a, n), np.fft.rfft(b, n)
    c = np.fft.irfft(fa * np.conj(fb), n)
    lags = np.concatenate([np.arange(0, max_lag + 1), np.arange(-max_lag, 0)])
    vals = np.concatenate([c[:max_lag + 1], c[-max_lag:]])
    k = int(np.argmax(vals))
    return int(lags[k]), float(vals[k] / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-9))


def align(args):
    from ctcalign import ALPHA, align as ctc_align, word_table, FRAME
    mix, _ = load(MIX, 16000)
    chapters, blocks = [], []
    start = 0.0
    for ci, (stem, title) in enumerate(CHAPTERS):
        path = AUDIO_DIR / f"{stem}.mp3"
        y, _ = load(path, 16000)
        dur = len(load(path)[0]) / 44100
        # confirm the chapter's place in the mix: the voice against the mix, first 20 s
        a0 = int(start * 16000)
        seg = mix[a0:a0 + 20 * 16000]
        lag, corr = xcorr_lag(seg, y[:len(seg)], 8000)
        print(f"{stem}: start {start:.3f} s, duration {dur:.3f} s, voice/mix offset {lag / 16:.1f} ms (r = {corr:.2f})", flush=True)
        if abs(lag) > 16 * 30:
            raise ValueError(f"{stem} is not where the running sum puts it in the mix ({lag / 16:.1f} ms off)")
        cache = WORK / f"{stem}-{sha256(path)[:12]}.npy"
        if cache.exists():
            E = np.load(cache)
            labels = json.loads((WORK / "mms-labels.json").read_text())
        else:
            E, labels = emissions(y)
            np.save(cache, E)
            (WORK / "mms-labels.json").write_text(json.dumps(labels))
        E = E.astype(np.float64)[:, [labels.index(c) for c in ALPHA]]
        paras = paragraphs(stem)
        tokens = [p.split() for p in paras]
        overrides = {(li, ti): pron(w) for li, row in enumerate(tokens) for ti, w in enumerate(row)}
        spans, score, _, _ = ctc_align(E, tokens, pron_override=overrides)
        words = word_table(spans, tokens)
        for li, para in enumerate(paras):
            ws = [w for w in words if w["li"] == li]
            item = dict(id=f"{ci:02d}.{li + 1}", chapter=f"{ci:02d}", text=para,
                        start=round(start + ws[0]["start"], 3), end=round(start + ws[-1]["end"], 3),
                        words=[dict(w=w["w"], start=round(start + w["start"], 3), end=round(start + w["end"], 3),
                                    conf=round(w["conf"], 3)) for w in ws])
            blocks.append(item)
            print(f"  {item['id']} {item['start']:8.3f} {item['end']:8.3f}  {para[:70]}", flush=True)
        chapters.append(dict(id=f"{ci:02d}", file=f"audio/letra-explicada-pt-br/{stem}.mp3", title=title,
                             start=round(start, 3), duration=round(dur, 3), sha256=sha256(path)))
        start += dur
    return chapters, blocks


def beats(args):
    """The mix's beat grid. The mix plays the track's intro once, then loops its steady part; the passes
    of the loop are measured by cross-correlating the mix with the track (low band, where the voice is
    weakest). The loop is a whole number of beats, so the grid runs on through the splices."""
    import librosa
    from scipy.signal import butter, sosfiltfilt
    sr = 4000
    track, _ = load(TRACK, sr)
    mix, _ = load(MIX, sr)
    sos = butter(4, 300, "low", fs=sr, output="sos")
    tl, ml = sosfiltfilt(sos, track), sosfiltfilt(sos, mix)
    cs = np.concatenate([[0.0], np.cumsum(tl ** 2)])
    win, hop = 8 * sr, 2 * sr
    rows = []
    for m0 in range(0, len(ml) - win, hop):
        seg = ml[m0:m0 + win]
        n = len(tl) + win
        c = np.fft.irfft(np.fft.rfft(tl, n) * np.conj(np.fft.rfft(seg, n)), n)[:len(tl) - win]
        e = np.sqrt(np.maximum(cs[win:win + len(c)] - cs[:len(c)], 1e-12))
        r = c / (np.linalg.norm(seg) * e + 1e-9)
        k = int(np.argmax(r))
        rows.append(((m0 + win / 2) / sr, (k - m0) / sr, float(r[k])))
    good = [(m, o) for m, o, r in rows if r > 0.15]
    levels = []
    for o in sorted(o for _, o in good):
        if levels and abs(o - levels[-1][-1]) < 0.02:
            levels[-1].append(o)
        else:
            levels.append([o])
    levels = sorted((float(np.median(l)) for l in levels if len(l) >= 3), reverse=True)
    loop = float(np.median(-np.diff(levels)))
    print("track - mix offset per pass:", [round(l, 4) for l in levels], f"loop {loop:.4f} s", flush=True)
    assert all(abs((levels[0] - l) / loop - round((levels[0] - l) / loop)) < 0.001 for l in levels), "passes are not whole loops"
    # the pass that owns each stretch of the mix, changing where the loop restarts
    owner = [(m, int(np.argmin([abs(o - l) for l in levels]))) for m, o in good]
    bounds, order = [0.0], [owner[0][1]]
    for (m0, p0), (m1, p1) in zip(owner, owner[1:]):
        if p1 != p0 and p1 != order[-1]:
            splice = STEADY_START - levels[p1]
            assert m0 - win / sr <= splice <= m1 + win / sr, f"pass change near {m0:.1f}-{m1:.1f} s, loop restart at {splice:.2f} s"
            bounds.append(splice)
            order.append(p1)
    bounds.append(len(mix) / sr)
    passes = [dict(start=round(a, 3), end=round(b, 3), trackMinusMix=round(levels[p], 4)) for (a, b), p in zip(zip(bounds, bounds[1:]), order)]
    print("passes (mix time):", passes, flush=True)

    # beats: tracked on the track's percussive part (the Suno track drifts by up to ~70 ms against a rigid
    # grid). The steady part holds BEATS_PER_LOOP of them (23 four-bar phrases), so the grid runs on
    # through the splices; its first beat starts a phrase (a downbeat).
    period = loop / BEATS_PER_LOOP
    y, ysr = load(TRACK, 22050)
    yp = librosa.effects.percussive(y)
    hl = 64
    env = librosa.onset.onset_strength(y=yp, sr=ysr, hop_length=hl, n_fft=1024)
    ft = librosa.frames_to_time(np.arange(len(env)), sr=ysr, hop_length=hl)
    _, bt = librosa.beat.beat_track(onset_envelope=env, sr=ysr, hop_length=hl, start_bpm=60 / period, tightness=300, units="time", trim=False)
    bt = np.asarray(bt, dtype=float)
    steady = bt[(bt >= STEADY_START - period / 2) & (bt < STEADY_END - period / 2)]
    assert len(steady) == BEATS_PER_LOOP, f"{len(steady)} tracked beats in the steady part, expected {BEATS_PER_LOOP}"
    k0 = int(np.argmin(np.abs(bt - STEADY_START)))
    print(f"tempo {60 / period:.3f} BPM; {len(bt)} tracked beats, phrase start {bt[k0]:.4f} s (loop point {STEADY_START:.3f} s)", flush=True)
    # strong percussive hits (0..1), for cuts that land on something audible
    on = librosa.onset.onset_detect(onset_envelope=env, sr=ysr, hop_length=hl, units="frames", delta=0.2, wait=int(0.1 * ysr / hl))
    strength = env[on] / np.percentile(env[on], 98)
    hits_track = [(float(ft[i]), float(min(1.0, s))) for i, s in zip(on, strength)]

    beats_m, down_m, hits_m = [], [], []
    for (a, b), p in zip(zip(bounds, bounds[1:]), order):
        off = levels[p]
        for k, t in enumerate(bt):
            m = t - off
            # (a pass after the first starts where the steady part restarts: skip the intro's beats)
            if a - period / 2 <= m < b - period / 2 and m >= 0 and (p == 0 or t >= STEADY_START - period / 2):
                beats_m.append(round(float(m), 4))
                if (k - k0) % 4 == 0:
                    down_m.append(round(float(m), 4))
        for t, s in hits_track:
            m = t - off
            if a <= m < b and s >= 0.35:
                hits_m.append([round(m, 4), round(s, 2)])
    gaps = np.diff(beats_m)
    assert gaps.min() > 0.6 * period and gaps.max() < 1.4 * period, f"beat gaps {gaps.min():.3f}-{gaps.max():.3f} s across the splices"
    return dict(bpm=round(60 / period, 3), beats=beats_m, downbeats=down_m, hits=hits_m,
                loop=dict(steadyStart=STEADY_START, length=round(loop, 4), passes=passes))


def envelope(args):
    """The voice's loudness at 50 fps (0..99), from the voice MP3s (no music), in mix time: for images that
    follow the voice itself (the waveform in 06.5)."""
    fps, parts = 50, []
    for stem, _ in CHAPTERS:
        y, sr = load(AUDIO_DIR / f"{stem}.mp3", 16000)
        hop = sr // fps
        n = len(y) // hop
        parts.append(np.sqrt(np.mean(y[:n * hop].reshape(n, hop) ** 2, axis=1)))
    v = np.concatenate(parts)
    v = np.clip(v / np.percentile(v, 99.5), 0, 1)
    # two digits per frame, one string (a list would put 29 000 lines in the JSON)
    return dict(fps=fps, voice=''.join(f'{int(round(x * 99)):02d}' for x in v))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("phase", choices=["align", "beats", "env", "all"])
    args = ap.parse_args()
    doc = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else {}
    if args.phase in ("align", "all"):
        chapters, blocks = align(args)
        doc.update(chapters=chapters, blocks=blocks)
    if args.phase in ("beats", "all"):
        doc.update(grid=beats(args))
    if args.phase in ("env", "all"):
        doc.update(env=envelope(args))
    import soundfile as sf
    info = sf.info(MIX)
    doc["mix"] = dict(file="audio/letra-explicada-pt-br/mixagem.mp3", duration=round(info.frames / info.samplerate, 4), sha256=sha256(MIX))
    doc["notes"] = ("Times in seconds of the gapless mixagem.mp3 decode. Words: MMS_FA CTC forced alignment of each chapter's "
                    "voice MP3 to its tts/ text (one block per paragraph), shifted by the chapter's start in the mix "
                    "(running sum of the voice durations, confirmed by cross-correlation). Grid: the background track's "
                    "beat grid mapped through the loop passes measured by cross-correlation. Env: the voice's loudness at 50 fps, two digits (00-99) per frame. "
                    "Regenerate with analysis/narracao.py.")
    order = ["mix", "chapters", "grid", "blocks", "env", "notes"]
    doc = {k: doc[k] for k in order if k in doc}
    OUT.write_text(json.dumps(doc, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"wrote {OUT}")


if __name__ == "__main__":
    main()
