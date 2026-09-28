# Portuguese audio alignment

The replacement Portuguese recording is **155.600 seconds**, decoded without
encoder-delay padding to 7,468,800 stereo frames at 48 kHz. The first supplied
lyric starts at **1.720 s** and the last line spans **135.940–139.580 s**. The
remaining **16.020 seconds** are retained in the video. This timing is independent
of both the previous 170-second Portuguese recording and the English edition.

Source audio SHA-256:
`bab524ed03356d5576de04beaa6edb100f36efb591a620987a9426e9e4fc6bc8`.

## Source preservation

All **46 supplied lines and 226 space-delimited display words** are preserved,
including the revised wording introduced in commit `93ce419`. The earlier
Portuguese edition in `f203c10` used a different recording; its timing, manual
anchors and validation measurements do not apply to this master.

The source JavaScript and generated JSON carry the same corrected line times.
Each generated line retains its English `sourceText` authoring identifier so
existing scenes can find the translated line without displaying English text.
Recognition output is used as timing evidence, never to replace supplied lyrics.
The supplied MP3 is preserved without edits.

## Measurement and review

1. Decode the replacement MP3 on its gapless timeline.
2. Separate vocals, drums, bass and other instruments with HTDemucs, using the
   decoded samples directly. No English stem offset is applied.
3. Transcribe the entire mix and separated vocal with `faster-whisper` /
   `large-v3-turbo`, explicitly selecting Portuguese.
4. Force-align the supplied text with multilingual MMS_FA at 20 ms resolution,
   using accent normalization and pronunciation expansions for technical terms
   and acronyms. A global CTC path preserves line order; a wildcard can absorb
   vocalizations outside the supplied words.
5. Review vocal-envelope plots for every line alongside both Whisper outputs.
   Apply the recording-specific constraints and boundary corrections below.
6. Compare the acoustic alignment against
   [wav2vec2-large-xlsr-53-portuguese](https://huggingface.co/jonatasgrosman/wav2vec2-large-xlsr-53-portuguese).
   Across 226 words, raw CTC start estimates differ by a median **20 ms**;
   **207 of 226 starts (91.6%)** agree within 100 ms.

The comparison uses acoustic paths **before manual boundary corrections**. Both
models still share the supplied text, pronunciation expansions and line windows.
This measures model agreement, not a guaranteed timing error or independently
verified phonetic accuracy. The published result uses reviewed MMS alignment;
the Portuguese-specific model is a diagnostic comparison. Its final-word paths
can extend into a following phrase or the non-lexical outro.

## Recording-specific constraints and corrections

The following tables use **one-based source line numbers**. The script uses
zero-based indices internally. These constraints replace the old recording's
anchors; they must be reviewed again when the MP3 changes.

| Line | Alignment window | Purpose |
| --- | --- | --- |
| 33 — “Já acendemos o estopim” | 102.70–105.60 s | Prevent the held ending from attaching to the first syllable of “tese”. |
| 39 — “Cem mil GPU” | 120.30–121.78 s | Keep the GPU spelling out of the following acronym. |
| 40 — “RLHF deu chabu” | 121.78–124.44 s | Separate the acronym from GPU and contain the uncertain transition into the chorus. |

Fourteen word boundaries are then corrected from the waveform and recognition
review. Word text and raw acoustic confidence are preserved. Corresponding
subword boundaries are updated when present.

| Line / word | Published correction | Evidence and limit |
| --- | --- | --- |
| 1 — “Vejo” | Start 1.72 s | Quiet initial consonant precedes the CTC start at 1.84 s. |
| 13 — “O” | Start 37.64 s | Vocal onset precedes the 20 ms CTC token at 37.70 s. |
| 14 — “começou” | End 43.96 s | Stops the previous word before the next phrase's pickup. |
| 15 — “Você” | Start 44.00 s | Both recognition passes place the phrase earlier; the vocal onset precedes CTC's apparent final-syllable detection at 44.38 s. |
| 16 — “sinto” | Start 48.34 s | Includes the quiet consonant after “acelerando”; CTC starts at 48.62 s. |
| 18 — “Aumento” | Start 58.30 s | Includes the chorus pickup before the CTC start at 58.38 s. |
| 23 — “mundo” | Start 70.40 s | Both recognition passes and the vocal envelope identify an earlier onset; CTC attaches to later energy at 71.68 s. The held ending remains at 72.32 s. |
| 28 — “mão” | End 95.64 s | Keeps the decaying sustain clear of the next chorus pickup. |
| 29 — “Aumento” | Start 95.72 s | Quiet pickup precedes the strong burst and CTC start near 95.94 s. |
| 33 — “estopim” | End 105.52 s | Preserves the held vocal tail after constrained CTC ends early, while leaving the following pickup clear. The exact end remains an estimate. |
| 34 — “tese” | Start 105.70 s | Recognition and a distinct onset identify the first syllable before CTC's second burst at 106.12 s. |
| 40 — “RLHF” | Start 121.80 s | Vocal recognition and the alternate model support an earlier “R” than MMS's 122.40 s; letter timing remains uncertain. |
| 45 — “O” | Start 131.28 s | Both recognition passes identify the vowel before the brief CTC token at 131.64 s. |
| 46 — “Foi” | Start 135.94 s | Vocal recognition and earlier vocal energy support a pickup before CTC's 136.64 s burst. The mix recognizer begins too early, at 134.46 s. |

## Remaining uncertainty

This is a full-track computational and waveform review, **not a human listening
pass or a claim of frame-perfect phonetic synchronization**. Singing, consonants
under instruments, layered vocals, sustained notes and technical pronunciations
can confuse recognition and forced alignment. The 20 ms acoustic frame interval
does not imply 20 ms accuracy.

Passages needing particular attention in an auditory review:

| Passage | Remaining issue |
| --- | --- |
| “Um” at 65.12 s | Low acoustic confidence; the short pickup is less certain than surrounding words. |
| “mundo” at 70.40–72.32 s | Start corrected from earlier vocal/recognition evidence; both CTC models prefer later energy. |
| CDR around 85–87 s | Letter boundaries inside the sustained acronym remain approximate. |
| “Só” at 110.30 s and “Até” at 113.50 s | Recognition begins earlier than CTC. The envelope alone does not identify a reliable alternate boundary, so these starts remain model estimates. |
| GPU / RLHF around 121–124 s | The constrained boundary and restored “R” pickup improve separation, but sung letters differ between models. |
| “chabu” / “Aumento” around 124.2–124.8 s | Both recognizers omit or reinterpret “chabu”; CTC gives it a short, low-confidence interval. Supplied wording is preserved. |
| Final “Foi”, “só” and “pra” around 135.94–138.54 s | “Foi” receives the reviewed pickup correction. CTC's “só” and “pra” starts remain later than recognition; their exact consonant/vowel boundaries are unresolved. |

The final “ver” ends at 139.58 s in MMS, close to both recognition estimates at
139.54 s. The alternate model instead extends it into the outro; that extension
is not adopted. No extra lyric is inferred from the remaining vocalizations.

The `conf` values in the lyric JSON are raw CTC acoustic posteriors, not calibrated
correctness probabilities. Manual corrections do not artificially raise them.

## Audio features and ending

`data/audio.pt-br.json` contains **15,560 samples per 100 fps envelope**,
stem/frequency-band RMS, drum and vocal onsets, **350 detected or extrapolated
beat times**, and section boundaries tied to the corrected lyrics. The median
detected pulse is approximately **134.233 BPM**. Measured local beat timing is
preserved; only the quiet edges are extrapolated. Downbeat phase is anchored to
the first chorus P(doom) hit and remains an automatic estimate rather than a
verified bar transcription.

`pitchMidi` uses YIN on the separated Portuguese vocal at 100 fps. Low-energy
frames are zero. It drives the orthogonality/blues diagram and is an approximate
pitch contour, not a scored melody or phonetic voice-activity detector.

The new recording already decays after approximately 153.5 s: sampled mix RMS
falls from roughly −17 dBFS to −41 dBFS near 155.5 s. It does not reach digital
silence at its boundary. Preview and export retain the shared **1.25-second
output volume fade**, ending at 155.60 s. This fade does not alter the source MP3.

## Regeneration (Windows / CPU)

Run from the repository root. Use the portable environment rather than the
original macOS-specific MLX analysis project:

```powershell
uv --cache-dir analysis/.cache/uv venv analysis/.venv --python 3.12
uv --cache-dir analysis/.cache/uv pip install --python analysis/.venv/Scripts/python.exe -r analysis/requirements.pt-br.txt
analysis/.venv/Scripts/python.exe analysis/pt_br.py all
```

On macOS/Linux, replace `analysis/.venv/Scripts/python.exe` with
`analysis/.venv/bin/python`. `all` runs separation, both transcriptions, primary
emissions, reviewed alignment, audio features, QA plots and structural validation.
Optional comparison models are run separately:

```powershell
analysis/.venv/Scripts/python.exe analysis/pt_br.py portuguese
analysis/.venv/Scripts/python.exe analysis/pt_br.py align --vocals --acoustic mms --check-only
analysis/.venv/Scripts/python.exe analysis/pt_br.py align --vocals --acoustic portuguese --check-only
# Optional diagnostic probability mixture:
analysis/.venv/Scripts/python.exe analysis/pt_br.py align --vocals --acoustic fused --check-only
```

`--check-only` saves raw acoustic paths without the manual corrections and does
not replace published lyric data. The primary `raw-alignment.json` also records
the path before those corrections.

Models remain cached under ignored `analysis/.cache`. Recording-specific stems,
emissions, transcriptions and alignment reports now live under
`analysis/work/pt-br/bab524ed0335/`; plots are generated in `analysis/qa/pt-br/`.
Separating intermediates by audio hash prevents old stems from silently being
reused when a new MP3 has the same filename. Alignment refuses to apply the
configured windows and manual corrections when the actual audio hash differs.
The source reader accepts the editorial inline comments used while revising
lyrics, and generation replaces provisional source timestamps.

Run `python analysis/pt_br.py validate` in the analysis environment and
`bun run check:pt-br` from `app` after regeneration. The checks cover source text
and aliases, audio hashes, timestamps, word/subword containment, non-overlap,
feature coverage, beat/onset ranges, sections and measured duration. They detect
structural inconsistency, not phonetic synchronization. Rendering and layout
validation are recorded separately in [PT-BR-VALIDATION.md](PT-BR-VALIDATION.md).
