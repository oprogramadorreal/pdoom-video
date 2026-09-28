# Portuguese audio alignment

The Portuguese track is **170.000 seconds**, decoded to exactly 8,160,000 stereo
samples at 48 kHz. Its timing is independent of the 156.651-second English track.
The first lyric begins at **3.500 s** and the last supplied line spans
**135.960–138.760 s**. The remaining 31.24 seconds remain in the video.

Source audio SHA-256:
`9a4a9e2f3f6b8dfc4e56039d10a10460c22aef378b07aef25c15ce66a2c17330`.

## Source preservation

All 46 supplied lines and their 222 space-delimited display words are preserved.
The sole spelling change is `cdr` → `CDR`, matching the acronym's technical use.
The source JavaScript and generated JSON carry the same corrected line times.
Each generated line retains the original English line as `sourceText` so existing
scene identifiers continue to resolve without substituting English display text.

## Measurement and review

1. Decode the Portuguese MP3 without encoder-delay padding.
2. Separate vocals, drums, bass and other instruments with HTDemucs, using the
   decoded samples directly. No English stem offset is applied.
3. Transcribe the entire mix and the entire separated vocal with
   `faster-whisper` / `large-v3-turbo`, explicitly selecting Portuguese.
4. Force-align the supplied words with multilingual MMS_FA at 20 ms resolution,
   using accent normalization and pronunciation expansions for acronyms. A
   global CTC path preserves line order; a wildcard absorbs unlisted vocalizations.
5. Review vocal-envelope plots for every line alongside the independent Whisper
   words. Correct the quiet starts of “Vejo”, “ChatGPT”, “O treino” and “tese”.
   Constrain the estopim/tese and Pós-Chinchilla/quebra transitions and the final
   two lines, which otherwise drift into adjacent phrases or the long outro.
6. Cross-check with a second CTC model,
   [wav2vec2-large-xlsr-53-portuguese](https://huggingface.co/jonatasgrosman/wav2vec2-large-xlsr-53-portuguese).
   Across all 222 words, independent CTC starts differ by a median **20 ms**;
   **86.9%** are within 100 ms. This is model agreement, not a guaranteed error bound.

The primary output remains the reviewed MMS alignment. The Portuguese-specific
model and its probability mixture were diagnostic comparisons; they sometimes
attach “MLP” to an earlier background vocal and disagree in the dense final chorus.

## Remaining uncertainty

This is a full-track computational and waveform review, **not a human listening
pass or a claim of frame-perfect phonetic synchronization**. Whisper's text is
never used to rewrite the supplied lyrics. Singing, layered vocals and invented
technical pronunciations can confuse both recognition and forced alignment.

Passages needing particular attention in a listening review:

| Interval | Reason |
| --- | --- |
| 18.42–23.76 s | ChatGPT pronunciation and held final “não”; the acronym pickup was corrected visually. |
| 35.28–37.20 s | “olhos de shinigami” is poorly recognized. |
| 54.38–60.18 s | Sydney and the held “ir”; ASR misses the early pickup. |
| 75.98–78.92 s | MLP letters; the alternate CTC model catches background singing too early. |
| 87–89 s | CDR letter boundaries inside a sustained vocal. |
| 110.78–122.04 s | Fast bridge, especially “Pós-Chinchilla, superdenso”; acoustic posterior is low. |
| 123.60–131.64 s | RLHF and the final chorus; word starts can differ by several tenths of a second between models. |
| 135.96–138.76 s | Final held word; model end estimates differ by roughly 0.2 s. |

The `conf` values in the lyric JSON are raw CTC acoustic posteriors. They are not
calibrated correctness probabilities, and manually corrected starts do not raise
those values artificially.

For 139–170 s, mix recognition yields repeated non-lexical “ah/oh” sounds while
vocal-only recognition produces no reliable words. Both hallucinate an isolated
“Amém” at different late times. No new lyric has been invented for that result.
The recording remains active through 169.9 s; it does **not** contain a clean
fade to silence. The player/renderer applies the documented output-only ending
fade while the source MP3 stays unchanged.

## Audio features

`data/audio.pt-br.json` contains actual Portuguese-track features: 17,000 samples
per 100 fps envelope, stem/frequency-band RMS, drum and vocal onsets, 381 detected
or extrapolated beat times, and section boundaries tied to the corrected lyrics.
The median detected pulse is approximately 134.233 BPM. The beat list preserves
measured local timing; it is not replaced by an English constant-tempo grid.
Downbeat phase is anchored to the first chorus P(doom) hit and remains an automatic
estimate rather than a verified bar transcription.

`pitchMidi` uses YIN on the separated Portuguese vocal at 100 fps. Low-energy
frames are zero. It drives the orthogonality/blues diagram; it is an approximate
pitch contour rather than a scored melody or phonetic voice-activity detector.

## Regeneration (Windows / CPU)

Run from the repository root. Use an isolated environment rather than the original
macOS-specific MLX analysis project:

```powershell
uv --cache-dir analysis/.cache/uv venv analysis/.venv --python 3.12
uv --cache-dir analysis/.cache/uv pip install --python analysis/.venv/Scripts/python.exe -r analysis/requirements.pt-br.txt
analysis/.venv/Scripts/python.exe analysis/pt_br.py all
```

On macOS/Linux, replace `analysis/.venv/Scripts/python.exe` with
`analysis/.venv/bin/python`. The CPU pipeline downloads model weights on its first
run. Weights, audio stems, raw transcriptions and plots remain in ignored
`analysis/.cache`, `analysis/work/pt-br` and `analysis/qa/pt-br` directories.

To reproduce the optional Portuguese-specific comparison:

```powershell
analysis/.venv/Scripts/python.exe analysis/pt_br.py portuguese
analysis/.venv/Scripts/python.exe analysis/pt_br.py align --vocals --acoustic portuguese --check-only
analysis/.venv/Scripts/python.exe analysis/pt_br.py align --vocals --acoustic fused --check-only
```

The optional checks do not replace published lyric data. `all` runs separation,
both transcriptions, primary emissions, alignment, audio features, QA plots and
structural validation. The script refuses to apply this recording's manual
anchors to an audio file with a different hash.

Data verification additionally passed `bun run check:pt-br` from `app`: source
wording and aliases, all timestamps and non-overlap, beat grid, full-length
envelopes, source duration and word/subword containment. Rendering/layout
validation is documented separately in `PT-BR-VALIDATION.md`.
