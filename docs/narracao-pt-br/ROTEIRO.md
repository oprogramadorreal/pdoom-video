# Narração da letra — roteiro

Extensão do vídeo em português: depois da música, uma narração explica as referências da letra.
Os arquivos `.txt` desta pasta são o texto exato de cada geração no ElevenLabs, um arquivo por pedido.
Este roteiro liga cada parágrafo a um trecho da música e a uma imagem.

## Arquivos

| Arquivo | Capítulo | Palavras | Caracteres |
|---|---|---:|---:|
| `00-abertura.txt` | Espera | 170 | 978 |
| `01-faiscas.txt` | P(doom) 0,02 · Faíscas | 151 | 861 |
| `02-o-que-tem-dentro.txt` | 0,15 · O que tem lá dentro | 271 | 1.547 |
| `03-poder-demais.txt` | 0,42 · Poder demais | 301 | 1.672 |
| `04-clipes-de-papel.txt` | 0,81 · Clipes de papel | 281 | 1.615 |
| `05-o-que-ilya-viu.txt` | 0,99 · O que Ilya viu | 245 | 1.415 |
| `06-final.txt` | NaN · E o seu P(doom)? | 93 | 504 |

São cerca de 1.500 palavras, entre 9 e 10 minutos de voz, mais uns 90 segundos de trechos da música.

## Geração no ElevenLabs

- Gere um arquivo por vez. O maior tem menos de 1.700 caracteres, abaixo dos limites do Eleven v3
  (5.000 por pedido) e do Multilingual v2 (10.000).
- Use a mesma voz e as mesmas configurações em todos. Aprove a voz com `00-abertura.txt` antes de gerar o resto.
- O texto não tem marcações, então funciona em qualquer modelo. No v3, dá para acrescentar tags como
  `[excited]` ou `[pause]`; ele não aceita `<break>`. No Multilingual v2, `<break time="1.0s" />`
  (até 3 s) funciona, mas as tags do v3 não.
- Cada parágrafo é um bloco. Os trechos da música entram nas pausas entre parágrafos; corte o áudio da voz ali.
  No bloco rápido do capítulo 0,42, corte também entre as frases.

### Grafia para a voz

O texto escreve algumas palavras do jeito que devem soar. Na tela, use a grafia original.

| Na voz | Na tela |
|---|---|
| pê dum, dum | P(doom), doom |
| fum | FOOM |
| Lum | Loom |
| a gê i | AGI |
| gê pê tê quatro | GPT-4 |
| eme ele pê | MLP |
| cê dê erre | CDR |
| erre ele agá efe | RLHF |
| gê pê us | GPUs |
| um ê trinta | 1E30 |
| quê estrela | Q\* |
| Chinchila | Chinchilla |
| Nvidia | NVIDIA (em maiúsculas, a voz pode soletrar) |

Ouça estes nomes antes de aprovar cada arquivo: John Searle, Lovecraft, shoggoth (na música, "chógote"),
Death Note, Sydney (na música, "sídnei"), New York Times, Roko, von Neumann, Lisp, DeepMind, OpenAI,
Nick Bostrom, Janus, Ilya Sutskever (na música, "ília"), Sam Altman e NaN.
Se algum sair errado, reescreva no texto como deve soar ou crie uma regra de alias num dicionário de pronúncia.
Regras de fonema só funcionam nos modelos em inglês.

## Transição

O `outro` termina com o cursor clicando em "↻ Gerar novamente" e rebobinando todas as cenas.
Na versão estendida, o cursor para sobre o botão sem clicar, e a narração começa com "Espera".
O clique acontece em "Vamos rebobinar". O rebobinamento, a partir daí, é a passagem entre capítulos:
cada capítulo abre no refrão correspondente, com o contador saltando para o novo valor.
Na última frase de `06-final.txt`, o cursor clica e o vídeo volta ao primeiro quadro da música, como no loop original.

## Roteiro por bloco

Os tempos dos trechos são de `lyrics/lyrics.src.pt-br.js`, em segundos de `audio/pdoom-pt-BR.mp3`.
Deixe uns 0,15 s de folga e fades de 80 ms. As cenas podem ser renderizadas nos mesmos intervalos
com `bun scripts/render.ts video --lang pt-BR --from <início> --to <fim>`.
"Novo" marca imagens que ainda não existem.

### 00 · Espera

| # | Trecho | Narração | Imagem |
|---|---|---|---|
| 1 | — | "Espera. Antes de gerar de novo." | `outro`: cursor parado sobre "↻ Gerar novamente". |
| 2 | — | "Você acabou de ouvir…" | Cortes rápidos de várias cenas; contador de referências até ~30. |
| 3 | — | "Uma inteligência artificial que se declarou…" | Um corte por frase: `prompt` sydney, máscara do `shoggoth`, tela REDIGIDA do `ilya`, treliça de `paperclips`. |
| 4 | — | "Vamos rebobinar…" | Clique; começa o rebobinamento do `outro`. |
| 5 | — | "Primeiro, o título…" | *P*(doom) no estilo do cartão final; "doom = ruína". Novo: distribuição das respostas da pesquisa em papel, mediana entre 5% e 10% marcada, com a fonte. |
| 6 | — | "No vídeo, esse número sobe…" | O rótulo "P(doom) 0,02" do mapa da `loss`, rolando para 0,15 · 0,42 · 0,81 · 0,99. |

### 01 · P(doom) 0,02 · Faíscas

| # | Trecho | Narração | Imagem |
|---|---|---|---|
| 1 | 1,72–4,92 "Vejo AGI faiscar no teu olhar," | "A gê i é…" | `open`: folha TikZ e "AGI". |
| 2 | — | "O faiscar vem de um estudo…" | `open`: prompt "Desenhe um unicórnio em TikZ." e o unicórnio sendo plotado; título do estudo como citação. |
| 3 | 5,00–6,70 "teus circuitos me dão medo," | "Circuitos também é termo técnico…" | `open`: traços do unicórnio virando trilhas de circuito. |
| 4 | 9,30–12,38 "Tua loss de treino despencou," | "E a loss é o erro…" | `loss`: platô, queda e mergulho no mapa de contorno. |

### 02 · 0,15 · O que tem lá dentro

| # | Trecho | Narração | Imagem |
|---|---|---|---|
| 1 | 22,42–23,68 "Aumento meu P(doom)," | "Primeiro refrão…" | `hook` 1: o número rola até 0,15. |
| 2 | 23,72–25,62 "pois o futuro faz FOOM." | "Fum é o som…" | `room`: explosão ramificada e as ondas de choque nos Os de FOOM. |
| 3 | 25,74–29,32 "Preso no quarto chinês, / cogumelos pra um mês." | "O quarto chinês…" | `room`: corredor da biblioteca, cartões 我不懂 saindo pela fresta; nos cogumelos, o micélio e o acento ácido. |
| 4 | 29,34–36,42 "Desmascara o shoggoth infame / com teus olhos de shinigami." | "O shoggoth é…" | `shoggoth`: varredura revelando a criatura; etiquetas de shinigami com cronômetro. |
| 5 | 40,78–43,96 "mas a singularidade começou." | "A singularidade é…" | `spacetime`: buraco negro no O; na frase dos átomos, a parte IV, em que a frase vira um clipe de papel. |
| 6 | 52,22–57,96 "Sydney, por favor, me solta." | "Sydney era…" | `prompt` sydney: grades fechando e a resposta "Você tem sido um bom usuário.". Novo: a frase real "I have been a good Bing." como texto, sem imitar a interface do Bing. |

### 03 · 0,42 · Poder demais

| # | Trecho | Narração | Imagem |
|---|---|---|---|
| 1 | 58,30–59,76 "Aumento meu P(doom)," | "Segundo refrão…" | `hook` 2: 0,42. |
| 2 | 59,86–61,64 "ouço o basilisco: BUM!" | "O basilisco de Roko…" | `ascent`: olho de serpente abrindo no BUM. |
| 3a | 61,76–63,24 "NVIDIA pra Lua: ZUM!" | "Agora, rapidinho. Nvidia pra Lua…" | `ascent`: gráfico de ações subindo até a lua. |
| 3b | 63,44–65,08 "Ponto Ômega em três, dois, um." | "Ponto Ômega…" | `ascent`: todas as linhas convergindo ao ponto branco. |
| 3c | 65,12–72,32 "Um E trinta FLOPs por segundo, / e a gente achou seguro pro mundo." | "E um ê trinta flops…" | `ascent`: odômetro de 31 dígitos. Novo: barras em escala log, "GPT-4, treino inteiro ≈ 2×10²⁵" contra "1 segundo = 10³⁰". |
| 4 | 73,82–76,88 "MLP: vai, volta, repetição," | "Eme ele pê…" | `bureau`, anexo B: pulso indo e voltando no diagrama; a gagueira do "repetição". |
| 5 | 77,10–80,52 "von Neumann já virou peça de coleção." | "John von Neumann…" | `bureau`, apêndice C: a arquitetura de von Neumann riscada de laranja. |
| 6 | 80,70–84,14 "Guinada à esquerda, já tá sem freio," | "A guinada à esquerda…" | `leftturn`: a faísca virando 90°; o mapa com a máscara como relevo. |
| 7 | 84,26–87,78 "sem um só CDR no meio." | "Cê dê erre…" | Novo: `(cdr '(a b c))` → `(b c)` em Plex Mono. Depois, o Gantt do `leftturn`: CDR vazio, "SITUAÇÃO: NÃO REALIZADA". |
| 8 | 88,10–95,64 "Gato, por favor, não solta a minha mão." | "E Gato…" | `prompt` gato: letras se afastando; "604 tarefas · depende do gato". |

### 04 · 0,81 · Clipes de papel

| # | Trecho | Narração | Imagem |
|---|---|---|---|
| 1 | 95,72–97,36 "Aumento meu P(doom)," | "Terceiro refrão…" | `hook` 3: 0,81. |
| 2 | 97,44–99,14 "tudo vira clipe, um a um." | "Imagine uma superinteligência…" | `paperclips`: o clipe se duplicando; lembrar o clipe da `spacetime`. |
| 3 | 99,24–100,96 "Quem desliga foi viajar," | "E o botão de desligar?…" | Novo: o anúncio satírico como formulário de vaga, sem logotipo. Depois, a resposta automática do `paperclips`. |
| 4 | 105,70–109,80 "tese da ortogonalidade: um blues sem fim." | "A tese da ortogonalidade…" | `fuse`: gráfico INTELIGÊNCIA × OBJETIVOS e a corda que dobra no blues. |
| 5 | 110,30–116,82 "“Só transformers, é simples assim!” / Até que aprendeu a dizer “não” pra mim." | "Só transformers?…" | `stack`: queda pela pilha e o bloco que sai do alinhamento. |
| 6 | 117,00–118,62 "Pós-Chinchilla, superdenso," e 120,50–121,78 "Cem mil GPU," | "Chinchila…" | `dense`: tipografia comprimida, TOKENS/PARAM, grade de 100.000 células. |
| 7 | 121,80–124,42 "RLHF deu chabu." | "E a máscara do shoggoth?…" | `dense`: a mesa inclinando, a máscara rolando e parando de ponta-cabeça, o REWARD MODEL caindo. |

### 05 · 0,99 · O que Ilya viu

| # | Trecho | Narração | Imagem |
|---|---|---|---|
| 1 | 124,46–125,76 "Aumento meu P(doom)," | "Último refrão…" | `hook` 4: 0,999… |
| 2 | 126,06–127,58 "como previu o Loom." | "Lum é uma ferramenta…" | `loom`: árvore de continuações até "Loom" ser amostrado. |
| 3 | 127,60–131,26 "Do pré-treino preditivo / ao auto-upgrade recursivo." | "No pré-treino…" | `loom`: blocos [MASK] e a recursão; um corte da explosão de FOOM da `room`. |
| 4 | 131,28–134,42 "O que Ilya viu? Nunca vamos saber." | "Ilya Sutskever…" | `ilya`: laptop de costas, tela REDIGIDA, tampa fechando. |
| 5 | — | "Ninguém sabe. Mas repare nos adesivos…" | `ilya`: câmera atrás da tampa; destacar SINTA A AGI, LEVEMENTE CONSCIENTE e Q\* quando citados. Novo: "Safe Superintelligence Inc." como texto. |
| 6 | 135,94–139,58 "Foi tudo só pra inglês ver?" | "E a última pergunta…" | `ilya`: teatro vazio e a pergunta no proscênio. Novo: a lei de 7 de novembro de 1831 como documento, sem imagens de pessoas escravizadas. |

### 06 · NaN · E o seu P(doom)?

| # | Trecho | Narração | Imagem |
|---|---|---|---|
| 1 | — | "E o contador?…" | `outro`: 1,00 → ∞ → 8 → 0/0 → NaN¹, "estimativa não mais definida". |
| 2 | — | "Máquinas que aprendem rápido…" | Quatro imagens, uma por trecho da frase: curva da `loss`, cartões do quarto chinês, máscara, clipe. |
| 3 | — | "Talvez nada disso aconteça…" | Novo: "P(doom) = ?" com cursor piscando. |
| 4 | — | "E agora, ouve de novo…" | Clique em "↻ Gerar novamente"; rebobinamento até o primeiro quadro da música. |

## Estilo

`docs/TREATMENT.md` não usa rostos humanos realistas, logotipos nem imitações de interfaces reais.
A narração cita pessoas reais (von Neumann, Searle, Bostrom, Altman, Sutskever, o jornalista do NYT),
mas nenhuma imagem depende de foto: nomes como tipografia, documentos e diagramas bastam.
Usar fotos seria uma exceção deliberada e exigiria imagens licenciadas.

## Capítulos do YouTube

Os tempos dependem da duração final do áudio. A música termina em 2:35,6.

```
0:00 Aumento meu P(doom)
2:36 Espera
     P(doom) 0,02 · Faíscas
     0,15 · O que tem lá dentro
     0,42 · Poder demais
     0,81 · Clipes de papel
     0,99 · O que Ilya viu
     NaN · E o seu P(doom)?
```

## Fontes dos fatos novos

Os demais fatos seguem o [guia da letra](../GUIA-DA-LETRA-PT-BR.md).

- Pesquisa com 2.778 pesquisadores, outubro de 2023; medianas de 5% ou 10% nas perguntas sobre extinção:
  [Grace et al., *Thousands of AI Authors on the Future of AI*](https://arxiv.org/abs/2401.02843).
- Unicórnio em TikZ: [*Sparks of Artificial General Intelligence*](https://arxiv.org/abs/2303.12712).
- GPT-4 treinado com cerca de 2×10²⁵ FLOP, estimativa com incerteza de 2 a 5 vezes:
  [Epoch AI](https://epoch.ai/data-insights/models-over-1e25-flop). 10³⁰ ÷ 2×10²⁵ = 50.000;
  "mais de dez mil vezes" cobre a incerteza.
- Gato e suas 604 tarefas: [DeepMind](https://deepmind.google/blog/a-generalist-agent/).
- Anúncio satírico do engenheiro do botão de desligar, 2023:
  [Dataconomy](https://dataconomy.com/2023/09/11/openai-killswitch-engineer/).
- Colossus, 100 mil GPUs H100 em julho de 2024:
  [Wikipedia](https://en.wikipedia.org/wiki/Colossus_(supercomputer)).
- Ilya Sutskever: "Feel the AGI" na festa de fim de ano de 2022, "slightly conscious" em fevereiro de 2022
  e a Safe Superintelligence em junho de 2024:
  [Wikipedia](https://en.wikipedia.org/wiki/Ilya_Sutskever),
  [Quote Investigator](https://quoteinvestigator.com/2022/10/05/ai-conscious/),
  [SSI](https://en.wikipedia.org/wiki/Safe_Superintelligence_Inc.).
- Lei Feijó, 7 de novembro de 1831: [Lei para inglês ver](https://pt.wikipedia.org/wiki/Lei_para_ingl%C3%AAs_ver).
- Confira a posição da Nvidia entre as empresas mais valiosas na data de publicação.
