"""Portable pt-BR audio analysis (CPU; no Apple MLX dependency).

Install analysis/requirements.pt-br.txt in an isolated environment, then run:
  python analysis/pt_br.py separate
  python analysis/pt_br.py transcribe
  python analysis/pt_br.py transcribe --vocals
  python analysis/pt_br.py emissions --vocals
  python analysis/pt_br.py align --vocals
  python analysis/pt_br.py features
  python analysis/pt_br.py qa
Large model downloads and regenerable intermediates stay in ignored .cache/work.
"""
import common
import argparse
import hashlib
import json
import re
import unicodedata

import numpy as np

AUDIO = common.PROJECT / "audio/pdoom-pt-BR.mp3"
EXPECTED_AUDIO_SHA256 = "bab524ed03356d5576de04beaa6edb100f36efb591a620987a9426e9e4fc6bc8"
SOURCE = common.PROJECT / "lyrics/lyrics.src.pt-br.js"
# Isolate intermediates by recording so an old stem/emission cannot be reused
# accidentally after replacing the MP3 (even when both files have equal length).
WORK = common.WORK / "pt-br" / EXPECTED_AUDIO_SHA256[:12]
WORK.mkdir(parents=True, exist_ok=True)


def source():
    text = SOURCE.read_text(encoding="utf-8-sig")
    # Preserve quoted text while accepting editorial // comments after rows.
    body = text[text.index("["):text.rindex("]") + 1]
    body = re.sub(r'"(?:\\.|[^"\\])*"|//[^\n]*',
                  lambda m: "" if m[0].startswith("//") else m[0], body)
    return json.loads(body)


def save(path, doc):
    path.write_text(json.dumps(doc, ensure_ascii=False, indent=2), encoding="utf-8")


def decode(sr=16000):
    import soundfile as sf
    import soxr
    y, native_sr = sf.read(AUDIO, dtype="float32", always_2d=True)
    y = y.mean(axis=1)
    return soxr.resample(y, native_sr, sr) if sr != native_sr else y


def transcribe(args):
    from faster_whisper import WhisperModel
    model = WhisperModel(args.model, device="cpu", compute_type="int8", cpu_threads=8,
                         download_root=str(common.CACHE / "whisper"))
    prompt = "AGI, ChatGPT, P(doom), FOOM, shoggoth, shinigami, Sydney, NVIDIA, FLOPs, MLP, von Neumann, CDR, Gato, Chinchilla, GPU, RLHF, Loom, Ilya."
    input_audio = WORK / "vocals.wav" if args.vocals else AUDIO
    segs, info = model.transcribe(str(input_audio), language="pt", beam_size=5,
                                 word_timestamps=True, vad_filter=False,
                                 initial_prompt=prompt, condition_on_previous_text=False)
    rows = []
    for s in segs:
        print(f"{s.start:.2f} - {s.end:.2f} {s.text}", flush=True)
        rows.append(dict(start=s.start, end=s.end, text=s.text,
                         words=[dict(w=w.word.strip(), start=w.start, end=w.end,
                                     probability=w.probability) for w in (s.words or [])]))
        save(WORK / ("whisper-vocals.json" if args.vocals else "whisper.json"), dict(model=args.model, language=info.language,
                                          duration=info.duration, segments=rows))


def emissions(args):
    import torch
    import torchaudio
    torch.set_num_threads(8)
    bundle = torchaudio.pipelines.MMS_FA
    model = bundle.get_model(with_star=False).eval()
    if args.vocals:
        import soundfile as sf
        import soxr
        y, sr = sf.read(WORK / "vocals.wav", dtype="float32", always_2d=True)
        y = soxr.resample(y.mean(axis=1), sr, 16000)
    else:
        y = decode()
    hop, chunk, context = 320, 20 * 16000, 3 * 16000
    nframes = len(y) // hop
    result = None
    for start in range(0, len(y), chunk):
        a, b = max(0, start - context), min(len(y), start + chunk + context)
        with torch.inference_mode():
            emission, _ = model(torch.from_numpy(y[a:b])[None])
            emission = emission.log_softmax(-1)[0].numpy()
        if result is None:
            result = np.full((nframes, emission.shape[1]), np.nan, dtype=np.float32)
        lo, hi = start // hop, min(nframes, (start + chunk) // hop)
        part = emission[lo - a // hop:hi - a // hop]
        result[lo:lo + len(part)] = part
        print(f"MMS emission {start / 16000:.0f}s", flush=True)
    last = np.where(~np.isnan(result[:, 0]))[0].max()
    result[last + 1:] = result[last]
    np.save(WORK / ("mms-vocals.npy" if args.vocals else "mms.npy"), result)
    save(WORK / "mms-labels.json", list(bundle.get_labels(star=None)))


def portuguese(args):
    """Independent Portuguese-specific CTC cross-check, projected to common chars."""
    import torch
    import soundfile as sf
    import soxr
    from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
    from ctcalign import ALPHA
    torch.set_num_threads(8)
    model_id = "jonatasgrosman/wav2vec2-large-xlsr-53-portuguese"
    processor = Wav2Vec2Processor.from_pretrained(model_id)
    model = Wav2Vec2ForCTC.from_pretrained(model_id).eval()
    y, sr = sf.read(WORK / "vocals.wav", dtype="float32", always_2d=True)
    y = soxr.resample(y.mean(axis=1), sr, 16000)
    nframes, chunk, context = len(y) // 320, 20 * 16000, 3 * 16000
    labels = processor.tokenizer.get_vocab()
    mapping = {c: [] for c in ALPHA}
    for label, index in labels.items():
        c = "-" if label in ("<pad>", "|") else normalized(label)
        if c in mapping:
            mapping[c].append(index)
    result = np.full((nframes, len(ALPHA)), np.nan, dtype=np.float32)
    for start in range(0, len(y), chunk):
        a, b = max(0, start - context), min(len(y), start + chunk + context)
        x = processor(y[a:b], sampling_rate=16000, return_tensors="pt")
        with torch.inference_mode():
            e = model(**x).logits[0].log_softmax(-1).numpy()
        common_e = np.stack([np.logaddexp.reduce(e[:, mapping[c]], axis=1) if mapping[c] else np.full(len(e), -1e4)
                             for c in ALPHA], axis=1)
        lo, hi = start // 320, min(nframes, (start + chunk) // 320)
        part = common_e[lo-a//320:hi-a//320]
        result[lo:lo+len(part)] = part
        print(f"Portuguese CTC emission {start / 16000:.0f}s", flush=True)
    last = np.where(~np.isnan(result[:, 0]))[0].max()
    result[last+1:] = result[last]
    np.save(WORK / "portuguese.npy", result)


def normalized(text):
    return re.sub(r"[^a-z' ]", " ", unicodedata.normalize("NFKD", text.lower()).encode("ascii", "ignore").decode()).strip()


PRON = {
    "AGI": "a ge i", "ChatGPT,": "chat ge pe te", "P(doom),": "pe dum",
    "MLP:": "eme ele pe", "CDR": "ce de erre", "cdr": "ce de erre", "GPU,": "ge pe u",
    "RLHF": "erre ele aga efe", "FLOPs": "flops", "FOOM.": "fum",
    "Sydney,": "sidnei", "Loom.": "lum", "Ilya": "ilia",
    "shoggoth": "chogote", "shinigami.": "chinigami",
}


def separate(args):
    import soundfile as sf
    import soxr
    import torch
    from demucs.pretrained import get_model
    from demucs.apply import apply_model
    torch.set_num_threads(8)
    model = get_model("htdemucs").eval()
    y, sr = sf.read(AUDIO, dtype="float32", always_2d=True)
    y = torch.from_numpy(soxr.resample(y, sr, model.samplerate).T.copy())
    ref = y.mean(0)
    mean, std = ref.mean(), ref.std()
    with torch.inference_mode():
        separated = apply_model(model, ((y - mean) / std)[None], device="cpu",
                                shifts=0, split=True, overlap=0.25, progress=True)[0]
    separated = separated * std + mean
    for name, stem in zip(model.sources, separated):
        sf.write(WORK / f"{name}.wav", stem.numpy().T, model.samplerate)
    print("Saved gapless, sample-aligned htdemucs stems", flush=True)


def align(args):
    from ctcalign import ALPHA, align as ctc_align, word_table
    if hashlib.sha256(AUDIO.read_bytes()).hexdigest() != EXPECTED_AUDIO_SHA256:
        raise ValueError("The audio changed: re-review pt-Br line windows/corrections before aligning this recording.")
    E = np.load(WORK / ("mms-vocals.npy" if args.vocals else "mms.npy")).astype(np.float64)
    labels = json.loads((WORK / "mms-labels.json").read_text())
    E = E[:, [labels.index(c) for c in ALPHA]]
    if args.acoustic == "portuguese":
        E = np.load(WORK / "portuguese.npy").astype(np.float64)
    elif args.acoustic == "fused":
        E = np.logaddexp(E, np.load(WORK / "portuguese.npy")) - np.log(2)
    lines = source()
    tokens = [text.split() for _, _, text in lines]
    overrides = {(li, ti): PRON.get(w, normalized(w)).split()
                 for li, row in enumerate(tokens) for ti, w in enumerate(row)}
    # Recording-specific constraints, reviewed against independent recognition.
    # Never carry the earlier 170-second recording's windows into this master.
    windows = {32: (102.7, 105.6), 38: (120.3, 121.78), 39: (121.78, 124.44)}
    spans, score, _, _ = ctc_align(E, tokens, pron_override=overrides, line_windows=windows)
    words = word_table(spans, tokens)
    if args.check_only:
        # Compare independent acoustic paths before any shared manual fixes.
        save(WORK / f"alignment-{args.acoustic}.json", dict(score=score, words=words))
        return
    save(WORK / "raw-alignment.json", dict(score=score, words=words))
    # Recording-specific waveform/ASR-reviewed corrections.
    # See docs/PT-BR-ALIGNMENT.md for evidence and remaining ambiguous passages.
    fixes = {(0, 0): {"start": 1.72}, (12, 0): {"start": 37.64},
             (13, 3): {"end": 43.96}, (14, 0): {"start": 44.00},
             (15, 0): {"start": 48.34}, (17, 0): {"start": 58.30},
             (22, 6): {"start": 70.40}, (27, 7): {"end": 95.64},
             (28, 0): {"start": 95.72}, (32, 3): {"end": 105.52},
             (33, 0): {"start": 105.70}, (39, 0): {"start": 121.80},
             (44, 0): {"start": 131.28}, (45, 0): {"start": 135.94}}
    assert fixes.keys() <= {(word["li"], word["ti"]) for word in words}
    for word in words:
        fix = fixes.get((word["li"], word["ti"]), {})
        word.update(fix)
        if "start" in fix:
            word["subs"][0] = (fix["start"], word["subs"][0][1])
        if "end" in fix:
            word["subs"][-1] = (word["subs"][-1][0], fix["end"])
        if word["w"] == "cdr":
            word["w"] = "CDR"
    for li, row in enumerate(lines):
        ws = [w for w in words if w["li"] == li]
        print(f"{li:02d} {ws[0]['start']:7.2f} {ws[-1]['end']:7.2f} {row[2]}", flush=True)
    english = json.loads((common.DATA / "lyrics.json").read_text(encoding="utf-8"))["lines"]
    result = []
    for li, (_, _, text) in enumerate(lines):
        ws = []
        for word in [w for w in words if w["li"] == li]:
            item = dict(w=word["w"], start=round(word["start"], 3), end=round(word["end"], 3), conf=round(word["conf"], 3))
            if len(word["subs"]) > 1:
                item["syl"] = [[round(a, 3), round(b, 3)] for a, b in word["subs"]]
            ws.append(item)
        text = text.replace(" cdr ", " CDR ")
        result.append(dict(i=li, text=text, sourceText=english[li]["text"], start=ws[0]["start"], end=ws[-1]["end"], words=ws))
    save(common.DATA / "lyrics.pt-br.json", dict(lines=result, extras=[], audioSha256=EXPECTED_AUDIO_SHA256, notes="Portuguese source wording; gapless pdoom-pt-BR.mp3 time. MMS_FA multilingual forced alignment at 20 ms on HTDemucs vocals; independent Whisper large-v3-turbo recognition of the mix and vocals and Portuguese CTC comparison. conf = raw CTC acoustic posterior, not a calibrated accuracy probability. Singing and technical acronyms remain uncertain; no human listening pass is claimed. See docs/PT-BR-ALIGNMENT.md for this recording's review and corrections."))
    SOURCE.write_text("// Times measured against audio/pdoom-pt-BR.mp3; regenerate with analysis/pt_br.py.\nconst LY = [\n" + ",\n".join("  " + json.dumps([line["start"], line["end"], line["text"]], ensure_ascii=False) for line in result) + "\n];\n", encoding="utf-8")


def qa(args):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    import soundfile as sf
    from analyze import frame_rms
    voice, sr = sf.read(WORK / "vocals.wav", dtype="float32", always_2d=True)
    voice = voice.mean(axis=1)
    energy = frame_rms(voice, sr, fps=100, win=512)
    lines = json.loads((common.DATA / "lyrics.pt-br.json").read_text(encoding="utf-8"))["lines"]
    qadir = common.QA / "pt-br"
    qadir.mkdir(exist_ok=True)
    asr = json.loads((WORK / "whisper-vocals.json").read_text(encoding="utf-8"))
    asrwords = [w for s in asr["segments"] for w in s["words"]]
    for first in range(0, len(lines), 4):
        fig, axes = plt.subplots(4, 1, figsize=(17, 11), squeeze=False)
        for ax, line in zip(axes[:, 0], lines[first:first+4]):
            a, b = max(0, line["start"] - 1), min(len(voice) / sr, line["end"] + .6)
            ai, bi = int(a * 100), int(b * 100)
            ax.plot(np.arange(ai, bi) / 100, energy[ai:bi], color="#737373", lw=.8)
            top = max(energy[ai:bi]) * 1.45
            ax.set_ylim(-top * .55, top)
            for wi, word in enumerate(line["words"]):
                ax.axvspan(word["start"], word["end"], alpha=.12, color="#1478d3" if wi % 2 else "#28a870")
                ax.axvline(word["start"], color="#1478d3", alpha=.6, lw=.7)
                ax.text(word["start"], top * (.88 if wi % 2 else .65), word["w"], fontsize=9)
            for word in asrwords:
                if a <= word["start"] <= b:
                    ax.text(word["start"], -top * (.22 if int(word["start"] * 100) % 2 else .4), word["w"], fontsize=8, color="#a05b18")
            ax.set_xlim(a, b)
            ax.set_title(f"{line['i']:02d} {line['text']}", loc="left", fontsize=11)
            ax.set_xticks(np.arange(np.ceil(a * 2) / 2, b, .5))
            ax.grid(alpha=.2)
        fig.tight_layout()
        fig.savefig(qadir / f"lines-{first:02d}.png", dpi=110)
        plt.close(fig)
    print(f"QA plots: {qadir}")


def features(args):
    import librosa
    import soundfile as sf
    from scipy.signal import sosfiltfilt
    from analyze import frame_rms, smooth_env, norm01, band_sos, drum_onsets, strength01
    sr, fps = 44100, 100
    mix = decode(sr)
    duration = len(mix) / sr
    stems = {name: sf.read(WORK / f"{name}.wav", dtype="float32", always_2d=True)[0].mean(axis=1)
             for name in ("vocals", "drums", "bass", "other")}
    onset = librosa.onset.onset_strength(y=stems["drums"], sr=sr, hop_length=256)
    tempo, beats = librosa.beat.beat_track(onset_envelope=onset, sr=sr, hop_length=256,
                                          start_bpm=130, tightness=100, units="time")
    period = float(np.median(np.diff(beats)))
    # Extend the measured pulse across quiet intro/fade; keep detected pulse times.
    while beats[0] - period >= 0:
        beats = np.r_[beats[0] - period, beats]
    while beats[-1] + period < duration:
        beats = np.r_[beats, beats[-1] + period]
    envelopes = {"rms": frame_rms(mix, sr)}
    for name, (lo, hi) in {"low": (None, 150), "mid": (150, 2000), "high": (4000, None)}.items():
        envelopes[name] = frame_rms(sosfiltfilt(band_sos(lo, hi, sr), mix), sr)
    for name, stem in stems.items():
        assert len(stem) == len(mix), f"{name} stem does not match the decoded recording"
        envelopes["vocal" if name == "vocals" else name] = frame_rms(stem, sr)
    envelopes = {name: np.round(norm01(smooth_env(values)), 3).tolist() for name, values in envelopes.items()}
    f0 = librosa.yin(stems["vocals"], fmin=65, fmax=1050, sr=sr, frame_length=2048, hop_length=441)
    vocal_rms = frame_rms(stems["vocals"], sr)
    pitch = librosa.hz_to_midi(f0[:len(vocal_rms)])
    pitch[vocal_rms < max(np.percentile(vocal_rms, 95) * .06, .002)] = 0
    envelopes["pitchMidi"] = np.round(pitch, 3).tolist()
    kick, snare, hat, _ = drum_onsets(stems["drums"], sr, period, beats[0])
    events = {name: [[round(float(t), 3), round(float(s), 3)] for t, s in zip(ts, strength01(db))]
              for name, (ts, db) in zip(("kick", "snare", "hat"), (kick, snare, hat))}
    vo = librosa.onset.onset_strength(y=stems["vocals"], sr=sr, hop_length=220)
    vf = librosa.onset.onset_detect(onset_envelope=vo, sr=sr, hop_length=220)
    events["vocal"] = [[round(float(f * 220 / sr), 3), round(float(min(1, vo[f] / max(np.percentile(vo, 99), 1e-9))), 3)] for f in vf]
    # Pick one of the two kick/snare bar phases using the first chorus DOOM hit.
    lyrics = json.loads((common.DATA / "lyrics.pt-br.json").read_text(encoding="utf-8"))["lines"]
    doom = lyrics[6]["words"][-1]
    doom_onset = doom.get("syl", [[doom["start"]]])[-1][0]
    phase = int(np.argmin(abs(beats - doom_onset))) % 4
    downbeats = beats[phase::4]
    boundaries = [("intro", 0), ("verse1", lyrics[0]["start"]), ("pre1", lyrics[5]["start"]),
                  ("chorus1", lyrics[6]["start"]), ("break1", lyrics[11]["end"]),
                  ("verse2", lyrics[12]["start"]), ("pre2", lyrics[16]["start"]),
                  ("chorus2", lyrics[17]["start"]), ("verse3", lyrics[23]["start"]),
                  ("pre3", lyrics[27]["start"]), ("chorus3", lyrics[28]["start"]),
                  ("bridge", lyrics[34]["start"]), ("chorus4", lyrics[40]["start"]),
                  ("outro", lyrics[45]["end"])]
    sections = [dict(name=name, start=round(start, 3), end=round(boundaries[i+1][1] if i+1<len(boundaries) else duration, 3))
                for i, (name, start) in enumerate(boundaries)]
    doc = dict(duration=round(duration, 3), bpm=round(60 / period, 3), beat_period=round(period, 5),
               time_signature=4, beats=np.round(beats, 3).tolist(), downbeats=np.round(downbeats, 3).tolist(),
               sections=sections, fps=fps, **envelopes, onsets=events,
               audioSha256=EXPECTED_AUDIO_SHA256,
               notes=f"All features measured from pdoom-pt-BR.mp3 (gapless decode), {duration:.3f} s. HTDemucs stems generated directly from that decode, no inherited EN offset. 100 fps normalized stem/band RMS; pitchMidi = vocal YIN estimate, 0 for low-energy frames (not a note transcription). beat_track measured pulse times, extrapolated only outside detected pulse interval. Downbeat phase anchored at first chorus P(doom); sections follow pt-BR lyric boundaries. Kick/snare/hat extracted from drums; vocal events from vocal spectral flux. Beat/downbeat detection is automatic, not a musicological bar transcription.")
    (common.DATA / "audio.pt-br.json").write_text(json.dumps(doc, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    save(WORK / "features-summary.json", {k: doc[k] for k in ("duration", "bpm", "beat_period", "sections", "notes")})
    print(f"Audio: {duration:.3f}s, median pulse {60/period:.3f} BPM, {len(beats)} beats", flush=True)


def validate(args):
    audio = json.loads((common.DATA / "audio.pt-br.json").read_text(encoding="utf-8"))
    lyrics = json.loads((common.DATA / "lyrics.pt-br.json").read_text(encoding="utf-8"))
    lines = lyrics["lines"]
    assert len(lines) == len(source()) == 46
    words = [w for line in lines for w in line["words"]]
    assert len(words) == sum(len(text.split()) for _, _, text in source())
    digest = hashlib.sha256(AUDIO.read_bytes()).hexdigest()
    assert audio["audioSha256"] == lyrics["audioSha256"] == digest == EXPECTED_AUDIO_SHA256
    for line, (start, end, text) in zip(lines, source()):
        assert (line["start"], line["end"], line["text"]) == (start, end, text)
        assert " ".join(w["w"] for w in line["words"]) == text
        assert (start, end) == (line["words"][0]["start"], line["words"][-1]["end"])
        for word in line["words"]:
            assert start <= word["start"] < word["end"] <= end
            for a, b in word.get("syl", []):
                assert word["start"] <= a < b <= word["end"]
    assert all(a["end"] <= b["start"] for a, b in zip(words, words[1:]))
    for name in ("rms", "low", "mid", "high", "vocal", "drums", "bass", "other", "pitchMidi"):
        values = np.asarray(audio[name])
        assert len(values) == round(audio["duration"] * audio["fps"]) and np.isfinite(values).all()
        assert values.min() >= 0 and values.max() <= (128 if name == "pitchMidi" else 1)
    assert abs(audio["duration"] - len(decode(16000)) / 16000) < .001
    sections = {s["name"]: s for s in audio["sections"]}
    assert sections["verse1"]["start"] == lines[0]["start"]
    assert sections["chorus2"]["start"] == lines[17]["start"]
    assert sections["chorus3"]["start"] == lines[28]["start"]
    assert sections["outro"]["start"] == lines[-1]["end"]
    report = dict(duration=audio["duration"], lines=len(lines), words=len(words), firstLyric=lines[0]["start"],
                  lastLyric=lines[-1]["end"], beats=len(audio["beats"]),
                  audioSha256=hashlib.sha256(AUDIO.read_bytes()).hexdigest(),
                  checks="Source wording/timestamps, word/subword/line containment, non-overlap, full feature arrays and actual decoded duration passed.")
    save(WORK / "validation.json", report)
    print(json.dumps(report, ensure_ascii=False, indent=2))


def all_phases(args):
    separate(args)
    args.vocals = False
    transcribe(args)
    args.vocals = True
    transcribe(args)
    emissions(args)
    align(args)
    features(args)
    qa(args)
    validate(args)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("phase", choices=["all", "transcribe", "emissions", "portuguese", "align", "separate", "features", "qa", "validate"])
    parser.add_argument("--model", default="large-v3-turbo")
    parser.add_argument("--vocals", action="store_true")
    parser.add_argument("--acoustic", choices=["mms", "portuguese", "fused"], default="mms")
    parser.add_argument("--check-only", action="store_true")
    args = parser.parse_args()
    if hashlib.sha256(AUDIO.read_bytes()).hexdigest() != EXPECTED_AUDIO_SHA256:
        parser.error("The MP3 changed: review this recording's hash, pronunciations and alignment constraints first.")
    (all_phases if args.phase == "all" else globals()[args.phase])(args)
