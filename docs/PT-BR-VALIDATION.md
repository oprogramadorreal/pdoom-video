# Validação da nova gravação pt-BR

Verificada em 28/09/2026 na branch `codex/pt-br-video`, após os commits
`f203c10` (edição brasileira) e `93ce419` (revisão da letra).
Este registro substitui as medições da gravação anterior de 170 segundos.

## Fonte e sincronização

- MP3 fornecido preservado, com duração decodificada de **155,600 s**.
- SHA-256: `bab524ed03356d5576de04beaa6edb100f36efb591a620987a9426e9e4fc6bc8`.
- As **46 linhas e 226 palavras** foram comparadas ao texto revisado em `93ce419`:
  nenhuma mudança de redação; apenas os intervalos foram atualizados.
- Primeira palavra em **1,720 s**; última linha em **135,940–139,580 s**.
  O desfecho usa os 16,020 s restantes da composição.
- Separação de stems, duas transcrições, emissões de dois modelos acústicos,
  revisão de envelopes das 46 linhas, três janelas de alinhamento e 14 ajustes
  de limites. Os caminhos acústicos, antes dos ajustes manuais, concordam em
  até 100 ms para **207 de 226 inícios (91,6%)**, com mediana de 20 ms.
- Foram regenerados as batidas, os ataques, os envelopes, a altura vocal e as
  seções: 350 batidas, pulso mediano de 134,233 BPM e 15.560 amostras por envelope.

A concordância entre modelos não é um limite de erro garantido. Não houve escuta
humana integral nem se afirma precisão fonética quadro a quadro. As siglas,
“chabu” e alguns ataques curtos continuam incertos; as medições e correções estão
em [PT-BR-ALIGNMENT.md](PT-BR-ALIGNMENT.md).

## Verificações concluídas

- `python analysis/pt_br.py validate`: passou; texto, limites de palavras e
  sílabas, ordem, cobertura dos envelopes, seções, hash e duração decodificada.
- `bun run check`: passou para o aplicativo e os scripts.
- `bun run check:pt-br`: passou; agora também rejeita JSONs cujo hash não
  corresponde ao MP3 e verifica sílabas, faixas dos envelopes e ataques.
- `bun run plates:pt-br`: regenerou as 14 imagens com os novos tempos de captura.
- `bun run build`: passou, incluindo áudio, dados e imagens atualizados.
- `render.ts verify --lang pt-BR`: passou no build de produção, com **1.250
  quadros** distribuídos pela faixa inteira. As 22 cenas não apresentaram erros
  de cena, navegador ou recursos. Áudio e composição: ambos com 155,600 s.
- `render.ts verify --lang en`: passou em **1.260 quadros**, sem erros, mantendo
  a composição de 156,651 s e o áudio de 156,650667 s.
- As 22 cenas portuguesas têm intervalos ordenados; todos os cortes principais
  preservam o fim da frase anterior e o início da próxima. Os 14 tempos de
  captura das imagens pertencem às respectivas cenas no build de produção.
- `git diff --check`: passou.

Os arquivos ingleses de áudio, letra, dados e imagens não foram alterados.
Os avisos preexistentes do compilador de shaders Direct3D (`f_sampleAt` e
`f_shade`) aparecem nas duas línguas; não ocorreram erros de renderização.

## Prévia exportada

`out/pdoom-pt-BR-preview.mp4` foi regenerado integralmente em **1920 × 1080,
24 fps, 3.734 quadros**, H.264/AAC, CRF 22, preset `veryfast` e uma amostra por
quadro. O arquivo tem **338.950.641 bytes**, com matriz, transferência e primárias
BT.709. O fluxo de vídeo dura 155,583333 s e o de áudio 155,562667 s: a diferença
para os 155,600 s do master é inferior a um quadro da prévia de 24 fps.

O áudio exportado foi decodificado e comparado ao MP3 em oito janelas de oito
segundos, iniciadas em 0, 20, 40, 60, 80, 100, 120 e 140 s. Todas tiveram atraso
medido de **0 ms**, com correlação entre **0,999698 e 0,999976**. Isso confirma
qual áudio foi exportado e sua posição temporal; não mede a precisão das letras.

Nos últimos 100 ms disponíveis do áudio exportado, o RMS ficou em **7,02%** do
original no mesmo intervalo, confirmando a redução de saída de 1,25 s sobre a
cauda já decrescente da gravação. O MP3 permanece intacto.

Esta é uma prévia completa para revisão. O render final de 60 fps com desfoque
adaptativo, descrito em [PT-BR.md](PT-BR.md), não foi executado nesta atualização.

## Revisão visual

Foi inspecionada uma folha de contato com todas as 22 cenas, as imagens
regeneradas, os refrões, o desfecho e o quadro final codificado. Também foram
revisados quadros próximos das transições internas de Quarto chinês, Ascensão e
Loom. A animação cinética, os recortes extremos e as revelações progressivas de
texto continuam fazendo parte do tratamento original.

A nova distribuição de palavras revelou dois ajustes de cortes internos: o
Quarto chinês agora entra em 25,740 s e Loom troca as frases em 127,600 e
129,240 s, preservando “Do” e todo o “ao”. O olho do basilisco agora encontra
“basilisco” na letra, em vez de usar o primeiro token “ouço”. O último quadro
retorna ao fundo escuro com marcas de corte, como o início do vídeo.

Relatórios e imagens locais, ignorados pelo Git:

- `out/verify-pt-BR.json`, `out/verify-en.json`
- `out/pt-br-scene-boundary-audit.json`
- `out/audio-export-check.json`
- `out/pt-br-new-song-overview.png`
- `out/pt-br-internal-cuts.png`
- `out/pt-br-encoded-final.png`
- `out/render-pt-BR-preview.log`

Nenhuma etapa desta atualização ficou bloqueada.
