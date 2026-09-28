# Versão brasileira — Aumento meu P(doom)

## Prévia e renderização

Os comandos abaixo partem da pasta `app`. É preciso ter Bun, Google Chrome e ffmpeg no PATH.

```sh
bun install
bun run dev
```

Abra `http://localhost:5173/?lang=pt-BR`. Para começar em outro ponto, acrescente `&t=80`.
A URL sem `lang` continua usando o áudio, as letras e as imagens em inglês.
Espaço reproduz/pausa; setas navegam; `[` e `]` mudam de cena; `h` oculta os controles.

Vídeo completo, 1920 × 1080, 60 fps, áudio AAC e desfoque de movimento adaptativo:

```sh
bun scripts/render.ts video --lang pt-BR --samples auto --shutter 0.2 --out ../out/pdoom-pt-BR.mp4
```

Prévia mais rápida, com o áudio completo e uma amostra por quadro:

```sh
bun scripts/render.ts video --lang pt-BR --fps 24 --samples 1 --preset veryfast --crf 22 --out ../out/pdoom-pt-BR-preview.mp4
```

Use `--scale 2` para 4K. Para um trecho, acrescente `--from 60 --to 70`.
Se Bun não estiver no PATH do PowerShell, invoque-o pelo caminho da instalação, por exemplo
`& "$env:USERPROFILE/.bun/bin/bun.exe" scripts/render.ts ...`.

## Arquivos e convenções

- `lyrics/lyrics.src.pt-br.js`: as 46 linhas fornecidas, com os intervalos corrigidos para este áudio.
- `audio/pdoom-pt-BR.mp3`: nova gravação fornecida, preservada; duração de 155,6 segundos.
- `data/lyrics.pt-br.json`: palavras e intervalos da versão brasileira. `sourceText` é um identificador de autoria em inglês, invisível ao público, que mantém as consultas semânticas das cenas.
- `data/audio.pt-br.json`: análise própria de batidas, seções, envelopes, ataques e altura vocal.
- `app/src/locale.ts`: seleção única de idioma, arquivos e nomes das cenas.
- `app/public/plates/pt-br/`: 14 imagens geradas das cenas brasileiras para a montagem de retorno do final. As imagens em inglês ficam no diretório original.

Os cortes acompanham as novas palavras. Quando uma nota atravessa a batida escolhida para o corte,
o final da frase é preservado. O desfecho é ajustado ao intervalo restante até o fim do MP3.
A nova gravação já reduz o volume no final, mas conserva uma cauda audível até o limite
do arquivo. A prévia e o render mantêm a redução linear de volume nos últimos 1,25 segundos
para encerrar essa cauda. O MP3 fornecido não é modificado.
As fontes de traço compõem acentos e cedilha; os layouts acomodam a nova ordem e quantidade de palavras.
Legendas técnicas, diagramas, respostas de chat, adesivos do laptop e textos do final também são localizados.

Os termos `P(doom)`, `FOOM`, `AGI`, `loss`, `MLP`, `FLOPs`, `GPU`, `RLHF`, `CDR`, `transformers`,
`auto-upgrade`, `blues`, `shoggoth` e `shinigami` seguem a letra fornecida. Nomes próprios como
ChatGPT, Sydney, Gato, NVIDIA, Chinchilla, Loom, Ilya e von Neumann são preservados.
Identificadores de código, notação matemática e referências técnicas reconhecíveis, como TikZ e top-p,
permanecem quando fazem parte da representação técnica. A grafia `cdr` é normalizada para `CDR`.
Os créditos de autoria da música original continuam documentados no README; não se presume autoria
adicional para os novos arquivos fornecidos.

## Verificação e imagens do final

```sh
bun run check
bun run check:pt-br
bun run plates:pt-br
bun scripts/render.ts verify --lang pt-BR --out ../out/verify-pt-BR.json
bun scripts/render.ts verify --lang en --out ../out/verify-en.json
bun scripts/render.ts sheet --lang pt-BR --cuts --out ../out/pt-br-cuts.png
```

`check:pt-br` confere a integridade das 46 linhas e 226 palavras, os intervalos de palavras
e sílabas, os quatro refrões, os dados musicais, a duração real do MP3 e o SHA-256 do áudio
nos dois JSONs. Isso detecta inconsistências estruturais e dados de uma gravação antiga; a evidência
de sincronização vem do alinhamento do áudio descrito abaixo.
`verify` renderiza o início, o fim, os limites das cenas, as transições e os centros das palavras,
além de amostras regulares durante pausas. Erros de cena, carregamento ou duração fazem o comando falhar.

As imagens brasileiras devem ser regeneradas depois de alterar as cenas ou os timestamps.
O comando `plates:pt-br` carrega apenas as 14 cenas de origem, evitando depender das próprias
imagens que ainda está gerando. Não sobrescreve as imagens inglesas.

## Regeneração da análise

O renderizador usa os JSONs versionados e não precisa dos modelos de análise.
O fluxo brasileiro está em `analysis/pt_br.py` e as dependências em
`analysis/requirements.pt-br.txt`; os modelos, stems e intermediários ficam nas pastas ignoradas
`analysis/.cache` e `analysis/work/pt-br/<prefixo SHA-256>`; os gráficos ficam em `analysis/qa/pt-br`.
Os intermediários desta gravação usam o prefixo `bab524ed0335`, separado dos arquivos antigos.
Consulte as opções de `python analysis/pt_br.py --help` e o procedimento completo,
com instalação, comandos e limites da sincronização, em
[PT-BR-ALIGNMENT.md](PT-BR-ALIGNMENT.md).

## Registro de validação

O resultado da validação desta adaptação é registrado em `docs/PT-BR-VALIDATION.md`.
Renders e relatórios detalhados ficam em `out/`, que não é versionado.
