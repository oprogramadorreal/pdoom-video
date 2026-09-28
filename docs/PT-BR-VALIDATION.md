# Validação da versão pt-BR

Verificada em 28/09/2026, na branch `codex/pt-br-video`, criada diretamente de
`main` (`bdbad537a7b7af3213475651774030c47568c181`). As três alterações que já
estavam no índice foram preservadas: o ajuste de Chrome para Windows, o MP3 novo
e a letra fornecida. Nenhum arquivo da edição inglesa de áudio, letras, dados ou
imagens foi substituído.

## Resultado

- `bun run check`: passou para o aplicativo e os scripts de renderização.
- `bun run check:pt-br`: passou; 46 linhas, 222 palavras, intervalos ordenados,
  texto e identificadores completos, dados musicais e duração de 170,000 s.
- `bun run build`: passou. O build contém os arquivos de áudio e dados das duas
  línguas e as 14 imagens brasileiras da montagem final.
- `render.ts verify --lang pt-BR`: passou no build de produção servido pelo Vite
  preview, em 1.266 quadros distribuídos pelos inícios, centros e finais das
  palavras, limites das 22 cenas, pausas e último quadro. Nenhum erro de cena,
  navegador ou recurso ausente. Áudio e composição: ambos com 170 s.
- `render.ts verify --lang en`: passou em 1.260 quadros; duração original de
  156,651 s, sem erros de cena, navegador ou recursos.
- `git diff --check`: passou.

## Vídeo gerado e áudio exportado

`out/pdoom-pt-BR-preview.mp4` foi renderizado integralmente: **1920 × 1080,
24 fps, 4.080 quadros, H.264 e áudio AAC, ambos com 170,000 s**. Foi usada uma
amostra por quadro, CRF 22 e preset `veryfast`; o arquivo tem 346.030.596 bytes.
É uma prévia completa. O render final recomendado em 60 fps, com desfoque
adaptativo, está documentado em `PT-BR.md`; esse render integral de maior qualidade
não foi executado.

O áudio do MP4 foi decodificado e comparado ao MP3 português em nove janelas de
oito segundos, começando em 0, 20, 40, 60, 80, 100, 120, 140 e 160 s.
Todas tiveram atraso medido de **0 ms**, com correlação entre 0,99967 e 0,99995.
Isso verifica a escolha do áudio e sua posição no arquivo exportado; a precisão
fonética das letras é uma verificação separada.

Nos últimos 100 ms, a amplitude RMS exportada foi 4,79% da amplitude do original,
confirmando a redução de volume de 1,25 s aplicada à saída. O MP3 fornecido
permanece idêntico ao arquivo originalmente adicionado, verificado por hashes Git
e SHA-256. As 46 linhas foram também comparadas ao arquivo originalmente adicionado:
a única mudança de redação é `cdr` → `CDR`.

## Revisão visual

Foram inspecionados quadros de todas as cenas, legendas animadas, diagramas,
texturas com texto, alternativas de tokens, adesivos, transições e o desfecho.
Também foram revisadas sete imagens em 4K da primeira metade, amostras da versão
inglesa, folhas de contato com os dados finais e uma folha extraída do MP4
codificado a cada cinco segundos. O último quadro codificado foi conferido:
ele volta ao fundo escuro com marcas de corte do quadro inicial, conforme o loop
original. A montagem reversa usa as imagens pt-BR regeneradas.

A revisão detectou e corrigiu, entre outros problemas: letras faltantes em
NVIDIA, ordem da câmera na abertura, verbos escondidos pela câmera da
singularidade, corte tardio de “Você”, intervalos invertidos na cena de pressão,
frases maiores em diagramas e finais de linha que cruzavam cortes de cena.
Enquadramentos extremos, recortes cinéticos, flashes e texto que se revela
progressivamente continuam fazendo parte da linguagem visual original.

Relatórios e imagens locais (ignorados pelo Git):

- `out/verify-pt-BR.json`, `out/verify-en.json`
- `out/audio-export-check.json`
- `out/pt-br-encoded-overview.jpg`, `out/pt-br-encoded-final.png`
- `out/pt-br-ending.png`, `out/spacetime-pt-br-final.png`
- `out/qa-first/`, `out/qa-latter/`

O driver Direct3D/Chrome emite avisos de variáveis potencialmente não inicializadas
em shaders preexistentes, também na edição inglesa. Não ocorreram erros de shader
ou falhas de renderização nas verificações finais.

## Limite da sincronização verificada

O alinhamento usou o áudio completo, vocais separados, duas transcrições,
dois modelos acústicos e revisão de envelopes de todas as linhas. Não houve
escuta humana integral, e não se afirma precisão fonética quadro a quadro.
Os modelos concordam em até 100 ms para 86,9% dos inícios de palavras; isso é
concordância entre modelos, não um limite de erro garantido. Siglas e frases
rápidas, sobretudo entre 110 e 132 s, ainda merecem uma revisão auditiva.
Os intervalos exatos e a metodologia estão em [PT-BR-ALIGNMENT.md](PT-BR-ALIGNMENT.md).

Nenhuma etapa de renderização ficou bloqueada.
