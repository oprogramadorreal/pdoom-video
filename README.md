# I'm Upping My P(doom) — music video

> **This is a copy of [mexicat/pdoom-video](https://github.com/mexicat/pdoom-video) by Giacomo Magnanini**, who made the original video and the code behind it. I cloned it into this account to add a Brazilian Portuguese edition and a narrated pt-BR explainer of the lyrics. It is not a GitHub fork, so GitHub does not show the link to the original. [About this copy](#about-this-copy) lists what is original and what was added.

A generative, code-rendered music video with word-synced karaoke typography. Every frame is a deterministic function of song time, so the live preview in the browser and the offline 1080p60 (or 4K60) export are identical.

**Watch the original video in 4K on YouTube:** https://www.youtube.com/watch?v=5EoO5413dBY

The YouTube upload is an earlier render: it averages only 4 sub-frames per frame for motion blur, so fast motion shows stepped copies, and YouTube's compression smears the film grain. For the best version, render it locally (see [Render the video](#render-the-video)): the current code picks up to 324 sub-frames per frame where the motion needs them.

The original video was made with Claude (Opus 5.5) in Claude Code: the concept and treatment, the lyric alignment and audio analysis, the renderer, every scene and the renders were all worked out in conversation with Claude.

The song is not ours: see [Credits](#credits) for who wrote and made it.

The concept, style bible and plate-by-plate treatment are in [`docs/TREATMENT.md`](docs/TREATMENT.md). The engine and scene API are documented in [`docs/ENGINE.md`](docs/ENGINE.md).

There is also a Brazilian Portuguese edition, with its own recording, timing data and translated artwork, and a narrated extension for it that explains the lyrics: see [Brazilian Portuguese](#brazilian-portuguese).

## About this copy

- **Original:** [mexicat/pdoom-video](https://github.com/mexicat/pdoom-video), by Giacomo Magnanini and contributors. Everything up to commit [`bdbad53`](https://github.com/mexicat/pdoom-video/commit/bdbad537a7b7af3213475651774030c47568c181) (28 September 2026) comes from there, with its git history: the English video, the renderer, the scenes, the analysis tools and the docs.
- **Added here:** the Brazilian Portuguese edition (recording, lyrics, timing data, translated scene artwork, and a `--lang pt-BR` option in the preview and the renderer) and the narrated pt-BR lyrics explainer. To switch languages, the scenes and the render script were changed; the English edit is still the default. `git log bdbad53..` lists every change.
- **This README** is the original one, extended to cover the additions.
- **Videos:** the YouTube video linked above is the original. My pt-BR video and its explainer will be posted on my own YouTube channel, with a link back to this repository.
- **License:** the original [MIT License](LICENSE) and its copyright notice are kept unchanged.

## Layout

- `audio/pdoom.mp3` — the song (the Claude-Pop version, see Credits).
- `audio/pdoom-pt-BR.mp3` — the Brazilian Portuguese recording (see Credits).
- `audio/letra-explicada-pt-br/` — the narration of the pt-BR lyrics explainer: one MP3 per chapter, the background track and the mix (`mixagem.mp3`).
- `lyrics/lyrics.src.js` — the original line-level lyrics (approximate timings).
- `analysis/` — Python (uv) tools that produced the timing data: Demucs stem separation, CTC forced alignment cross-checked with Whisper, beat/downbeat/onset analysis. See `analysis/align.py` and `analysis/analyze.py`.
- `data/lyrics.json` — word-level (and some syllable-level) lyric timings.
- `data/audio.json` — tempo (132.007 BPM), beats, downbeats, sections, drum/vocal onsets and loudness envelopes.
- `lyrics/lyrics.src.pt-br.js`, `data/lyrics.pt-br.json`, `data/audio.pt-br.json` — the same for the Brazilian Portuguese recording.
- `docs/letra-explicada-pt-br/` — the pt-BR lyrics explainer: lyrics guide, narration script and storyboard.
- `app/` — the renderer: TypeScript + three.js, bun + Vite.
  - `src/engine/` — renderer core: timeline playback, post-processing (bloom, halation, grain), typography (Archivo, IBM Plex Mono, Cormorant Garamond, single-stroke plotter fonts), GPU line batches, HUD.
  - `src/scenes/` — one module per plate (`open`, `loss`, `prompt`, `hook`, `room`, `shoggoth`, `spacetime`, `ascent`, `bureau`, `leftturn`, `paperclips`, `fuse`, `stack`, `dense`, `loom`, `ilya`, `outro`) plus shared motifs.
  - `src/timeline.ts` — the edit: scene windows anchored to lyric lines and snapped to the beat grid.
  - `scripts/render.ts` — offline renderer (headless Chrome → raw frames over WebSocket → ffmpeg).
- `out/` — renders (not in the repo).

## Requirements

[bun](https://bun.sh), Google Chrome (the offline renderer drives it headless through playwright-core) and ffmpeg with libx264. The analysis tools need [uv](https://docs.astral.sh/uv/); the renderer doesn't.

## Preview

```sh
cd app
bun install
bunx vite
```

Open http://localhost:5173 and use the keys below. `?t=23` starts at a given time.

### Brazilian Portuguese

The complete pt-BR edit uses `audio/pdoom-pt-BR.mp3`, the supplied Portuguese lyrics,
its own word alignment and audio analysis, translated scene artwork, and a 155.6-second timeline.
Open **http://localhost:5173/?lang=pt-BR**. The default URL still plays the original English edit.

```sh
cd app
bun run check
bun run check:pt-br
bun scripts/render.ts video --lang pt-BR --samples auto --shutter 0.2 --out ../out/pdoom-pt-BR.mp4
```

All rendering modes accept `--lang pt-BR`, including `stills`, `sheet`, `plates`, `perf`, and
`verify` (renders across the entire track at word transitions and scene cuts, checks errors and audio duration).
After changing translated scenes, run `bun run plates:pt-br` to regenerate the Portuguese rewind images.
See [the pt-BR guide](docs/PT-BR.md) for generation, validation, terminology and draft-render commands.

The pt-BR edition is getting a narrated extension that explains the lyrics. Its script, storyboard and audio
are described in [`docs/letra-explicada-pt-br/`](docs/letra-explicada-pt-br/); the narration mix is
`audio/letra-explicada-pt-br/mixagem.mp3`.

| Key | Action |
|---|---|
| space | play / pause |
| ← / → | seek ±1 s (±5 s with shift) |
| `,` / `.` | step one frame |
| `[` / `]` | previous / next scene |
| `l` | loop the current scene |
| `h` | hide the UI |

The preview renders in real time on a recent Mac. The export is not real time and is heavier.

## Render the video

```sh
cd app
bun scripts/render.ts video --samples auto --shutter 0.2 --out ../out/pdoom.mp4
```

- **Output:** 1920×1080 at 60 fps, x264 CRF 16, AAC audio.
- **Motion blur:** every frame is the average of many sub-frames spread over a short shutter (`--shutter 0.2`, a fifth of the frame time), so fast motion leaves a continuous streak instead of a few stepped copies. `--samples auto` picks the count per frame: 12 for a still frame, 36 for ordinary camera motion, 108 or 324 for whips, slams and fast zooms. It stops once more sub-frames would no longer change the image by more than `--tol` levels of 255 (default 3). `--samples N` takes a fixed N instead (`--samples 4` makes a quick draft). How it works: "Motion blur and sampling" in [`docs/ENGINE.md`](docs/ENGINE.md).
- **Other modes:** `stills`, `sheet` (contact sheets, `--cuts` for every scene boundary), `perf`, and `plates` (regenerates `public/plates/`, the stills used by the outro's rewind montage; rerun it after changing a scene).

### 4K

```sh
cd app
bun scripts/render.ts video --scale 2 --samples auto --shutter 0.2 --x264 aq-mode=3:rc-lookahead=30 --out ../out/pdoom-4k.mp4
```

- **Output:** a true 3840×2160 render (not an upscale): every layer, line and shader is rendered at the physical resolution. Scenes are laid out in 1920×1080 logical pixels, so the 4K frame looks like the 1080p one, only sharper.
- **Cost:** GPU-bound. A frame takes from about 40 ms (a still frame) to over 10 s (the ray-marched rooms at 108–324 sub-frames). The whole song took about 2.5 hours on an M5 Pro, rendered as segments in two parallel pipelines (`--from`/`--to`, then a lossless concat). Each pipeline uses about 5 GB for headless Chrome plus about 4 GB for ffmpeg; the shorter x264 lookahead above keeps ffmpeg's memory down.
- **Encoding:** the film grain is rendered per 4K pixel, which is expensive to encode: at the default CRF 16 the file runs at about 670 Mbit/s (13 GB for the song, 8× the 1080p file), `--crf 18` gives about 450 Mbit/s and `--crf 20` about 230 Mbit/s.
- `--scale 2` works with every mode. `stills` then saves full-resolution PNGs, and `perf` measures 4K frame times. In the browser preview, add `&scale=2` to the URL.

## Regenerate the timing data

The committed `data/*.json` files are all the renderer needs. Regenerating them needs the stems and intermediates, which are not in the repo:

- **Stems:** Demucs `htdemucs_ft` into `analysis/stems/htdemucs_ft/pdoom/` (`uv run python -m demucs -n htdemucs_ft -o stems ../audio/pdoom.mp3`), plus the lead vocal from a mel-band-roformer karaoke model (audio-separator) in `analysis/stems/karaoke/lead.wav`.
- **Intermediates:** `ctc_emissions.py`, `whisper_run.py` and `vocal_feats.py` write them to `analysis/work/`. The pipeline is described at the top of `analysis/align.py`.

```sh
cd analysis
uv run python align.py      # data/lyrics.json
uv run python analyze.py    # data/audio.json
```

The models download about 4 GB of weights into `analysis/.cache/`; delete that folder afterwards.

## Credits

- **Video and code:** Giacomo Magnanini ([mexicat/pdoom-video](https://github.com/mexicat/pdoom-video)), with fixes from Anwin Sharon and HEOJUNFO. See [About this copy](#about-this-copy).
- **Song:** "I'm Upping My P(doom)". The lyrics are by [osmarks](https://docs.osmarks.net/hypha/p%28doom%29_song_objectively_correct_interpretation), built on an opening verse and chorus by [MusicPerson](https://www.udio.com/creators/MusicPerson), with lines suggested on the EleutherAI Discord and help from Claude on the outro and final chorus. The original was generated with Udio and released in November 2024 ([YouTube](https://www.youtube.com/watch?v=uEB5E67vcPA)). This video uses the "Claude-Pop" version made with Suno, posted by [deckard (@slimer48484)](https://x.com/slimer48484/status/2097752569212756134) in September 2026.
- **Brazilian Portuguese edition:** a Portuguese version of the lyrics, recorded with Suno (`audio/pdoom-pt-BR.mp3`).
- **Lyrics explainer (pt-BR):** the narration script was written with Claude from the Portuguese lyrics guide, starting from a first draft generated with GPT-6 Astra. The voice was generated with ElevenLabs, and the background track was made with Suno.
- **Fonts:** Archivo, IBM Plex Mono and Cormorant Garamond (SIL Open Font License). Single-stroke EMS and Hershey fonts via the `hersheytext` package (OFL / public domain).

## License

The code is released under the [MIT License](LICENSE). The fonts in `app/public/fonts/` keep their own licenses (see Credits), and the songs, the narration and the lyrics (`audio/`, `lyrics/`, `data/lyrics.json`, `data/lyrics.pt-br.json`) are not covered by it: they belong to their authors (see Credits).
