# A letra explicada — roteiro

Extensão do vídeo em português, para o YouTube ("Opus 5.5 criou este vídeo"). Depois da música, o vídeo
volta ao começo e passa pela música de novo, verso por verso: toca o verso e o explica com as cenas do clipe,
reaproveitadas ou remontadas, e com animações novas. No final, mostra como o clipe foi feito.

O texto falado está em [`tts/`](tts/). Este roteiro liga cada parágrafo desses arquivos a um trecho
da música e a uma imagem, e é a referência para montar o vídeo.

## A ideia

O clipe termina rebobinando: as cenas passam de trás para frente e param no primeiro quadro.
A explicação começa ali mesmo, sem corte: uma régua de player aparece no pé da tela, e a narração percorre
a música de novo. O rebobinamento só avisa que vamos voltar ao clipe. Daí em diante, a imagem é livre: reaproveita
quadros do clipe quando eles já mostram o que a narração diz, e remonta, desmonta ou troca por animação nova quando
não mostram (ver "A segunda passada"). No fim, a régua dá play e a música recomeça.

Três promessas, todas feitas nos primeiros 40 segundos:

1. **"Tudo que você viu no vídeo é código… No final, eu te mostro melhor."** A promessa do título. Volta em 02.5
   (o monstro é uma fórmula) e se cumpre em `06-bastidores`.
2. **"Tem coisa na imagem que quase ninguém percebe."** Detalhes das cenas apontados pela narração e por legendas:
   "Claude, 0,12" entre as candidatas, as etiquetas nos olhos do shoggoth, a frase que vira clipe, o ponto laranja.
3. **Quatro iscas**: a IA que se declarou (Sydney), o monstro com sorriso (shoggoth), a demissão que virou
   mistério (Ilya) e a fábrica de clipes. Cada uma é paga num capítulo.

O contador de P(doom) é o esqueleto: cada capítulo abre no refrão que sobe o número
(0,02 → 0,15 → 0,42 → 0,81 → 0,99 → NaN). A régua no pé da tela mostra quanto falta.

A virada de capítulo é feita pela imagem e pela música, não pela voz. O capítulo abre com o trecho do refrão,
"Aumento meu P(doom)", em que a cena `hook` rola o número novo em tela cheia; ao mesmo tempo, o valor acende
na régua. A narração começa direto no assunto, sem repetir o número.

### O que fica na voz e o que vai para a legenda

A voz fica com as ideias que ensinam algo e com os ganchos: como um modelo de linguagem escreve,
interpretabilidade, loss e retropropagação, quarto chinês, alinhamento, ortogonalidade, o botão de desligar,
RLHF e bajulação, pré-treino, a virada do Ilya, e as duas piadas duplas que o público de programação aproveita:
von Neumann e CDR. Referências menores passam em trechos da música só com legenda na tela: Ponto Ômega, Nvidia,
Chinchilla, as cercas, as cem mil GPUs e os adesivos do laptop. Nada que o público brasileiro já sabe ("pra inglês ver") ou que o programador já entende (NaN)
é explicado.

### Ganchos e retornos

| Plantado | Retomado |
|---|---|
| 00.2 "No final, eu te mostro melhor" | 02.5 (o monstro é uma fórmula) e 06.2–06.3 |
| 00.3 a demissão que virou mistério | 05.3–05.4 |
| 00.3 a fábrica de clipes | 04.1 |
| 01.3 a loss despenca | 03.3 "É isso que faz a loss despencar" |
| 01.4 os números em cima das palavras | 05.1 "Lembra dos números em cima das palavras?" (as barras viram os galhos do Loom) |
| 02.3 "Guarda essa máscara" | 04.6 (RLHF) e 06.5 (a ironia final) |
| 02.4 a etiqueta BAJULAÇÃO | 04.6 "Lembra da etiqueta bajulação?" |
| 02.6 a frase vira um clipe | 04.1, só na imagem |
| 02.7 Sydney: "me solta" | 03.7 Gato: "não solta a minha mão" |
| o ponto laranja em quase todas as cenas | 04.3, o estopim |
| a própria voz que narra, desde 00.1 | 06.5 "E esta voz… Também é i á." |
| 00.1 "uma música de amor sobre o fim do mundo" | 06.6 "Talvez o fim do mundo que a música canta nunca aconteça." |
| 04.5 o T do GPT | 05.2 o P do GPT |

### Ritmo

- Um trecho da música a cada 15–20 s de voz. A música entra com volume cheio, e a voz para.
- Dois trechos mais longos, só com música e legendas, servem de respiro: Nvidia → FLOPs (03.2)
  e Chinchilla → RLHF (04.6).
- Pontos altos: o unicórnio de 2023 contra o clipe de 2026 (01.1), as etiquetas do monstro (02.4),
  o estopim (04.3, perto dos dois terços, onde a audiência costuma cair), a virada do Ilya (05.4)
  e os bastidores (06).

## A transição

O clipe não muda. Ele termina como sempre, e a explicação começa no último quadro dele, que é também o primeiro.

### Como o clipe termina

Tempos da música. Os quadros podem ser vistos com
`bun scripts/render.ts sheet --lang pt-BR --from 152.6 --to 155.55 --n 16 --cols 4 --only outro --out ../out/wip/outro-tail.png`.

| Tempo | Imagem | Som |
|---|---|---|
| 152,6–153,4 | Cartão final: "Aumento meu / *P*(doom) = NaN¹". | Últimas batidas. |
| 153,5 | O cartão implode na faísca, no centro da tela. | A bateria para. |
| 153,8 | Voltam as marcas de corte; aparece o botão "↻ Gerar novamente"; o cursor entra pelo canto. | Cauda da música. |
| 154,6 | O cursor clica. | |
| 154,7–155,5 | Rebobinamento: as cenas passam de trás para frente (Ilya, o blues, "servo", "Vejo AGI"), cada vez mais rápido, e param no primeiro quadro: preto, só com as marcas de corte. | Fade dos últimos 1,25 s. |

Embaixo do botão há uma nota, "não foi possível verificar esta resposta", com 16 px e em cinza, que fica
menos de um segundo na tela. Ninguém lê. A transição não depende dela nem de nenhum outro texto pequeno.
O que qualquer pessoa entende nesses dois segundos é o rebobinamento: o vídeo voltou ao começo.

### Como a explicação começa

Tempos a partir do fim da música (155,6 s).

| Tempo | Imagem | Som | Voz |
|---|---|---|---|
| 0,0–0,6 s | O primeiro quadro, parado: preto, com as marcas de corte. | A cauda da música some. A trilha de fundo entra baixa, abafada. | — |
| 0,6–4,0 s | A régua se desenha no pé do quadro, da esquerda para a direita, por dentro das marcas de corte, em ~1,5 s: uma linha fina, um tique por verso, "0:00" e "2:35" nas pontas, os valores do P(doom) sobre os refrões. A faísca acende em 0:00 como cursor, com o símbolo de pausa ao lado. Sem nenhuma palavra, a imagem diz: é a música, parada no começo. | A trilha abre o filtro. | 00.1 "Você acabou de ouvir uma música de amor sobre o fim do mundo." |
| 4,0–4,5 s | Parado. | Trilha. | — |
| 4,5 s | Em "é código", começa 00.2: a faixa de raio X atravessa o quadro e o transforma em código. | Trilha. | 00.2 "E tudo que você viu no vídeo é código…" |

Por que assim:

- **Sem corte.** O clipe completa o próprio gesto (clica, rebobina, para no começo) e a explicação parte do ponto
  em que ele parou. A régua transforma o loop do clipe num player pausado.
- **A primeira frase não depende da tela.** Ela resume o que a pessoa acabou de ver, com ironia, e funciona até
  para quem está só ouvindo. O gancho do título vem logo depois, uns 4 s mais tarde.
- **Nada de "Espera".** No YouTube, a barra de progresso e os capítulos já mostram que o vídeo continua.
  A interrupção era para segurar quem ia sair; aqui ela só quebraria o ritmo.
- **Nada a refazer no clipe.** O `outro` fica como está. A explicação é uma linha do tempo nova que começa em 155,6 s.

### Como a explicação termina

Em 06.7, "E agora, ouve de novo", a faísca volta a 0:00, o símbolo de pausa vira play e a régua se apaga.
A música recomeça no primeiro quadro, o mesmo em que a explicação começou, e toca sob a tela final do YouTube,
que ocupa os últimos 5 a 20 s.

## A segunda passada

Na primeira vez, o espectador viu o clipe. Na segunda, a música é a mesma, mas a imagem serve à explicação.
O que liga as duas é pouco e fixo: a régua (em que ponto da música estamos), o verso cantado com a letra na tela,
a paleta e as fontes. O resto é livre. Um trecho pode voltar exatamente como no clipe; voltar com outra câmera,
outro enquadramento ou outra velocidade, com partes isoladas ou rearranjadas; ou dar lugar a uma animação nova.

### Regras

- **Reusar ou remontar, o que servir melhor.** Reaproveitar os quadros do clipe é bom quando eles já mostram o que
  a narração diz (as etiquetas do shoggoth, o Gantt com o CDR vazio, a máscara rolando na mesa): dá menos trabalho
  e o espectador reconhece na hora. Remontar compensa quando o detalhe pede outro ângulo, mais tempo na tela ou virar
  diagrama (o quarto chinês visto de cima, a curva da loss percorrida por dentro). Nos dois casos, vale mexer
  no tempo (câmera lenta, voltar, repetir) e dar zoom.
- **Nada congela.** Nenhum quadro fica parado mais de ~2 s. A câmera sempre se move, nem que seja uma deriva lenta.
- **A imagem muda na palavra.** Cada termo importante da narração dispara uma mudança: um corte, um zoom,
  uma chamada, um diagrama que se monta. Um bloco tem de 3 a 6 mudanças.
- **A cena vira a explicação.** Em vez de pôr um diagrama por cima da cena, os elementos da cena se reorganizam
  no diagrama: os traços do unicórnio viram circuitos, as barras de probabilidade viram os galhos do Loom,
  a máscara ganha sorriso a cada recompensa.
- **Cortes na batida.** Cortes e mudanças grandes caem nas batidas da trilha de fundo, ou da música nos trechos.
- **Variar.** Dois blocos seguidos não têm a mesma cara: alternar escala (macro de um detalhe, plano aberto,
  tela cheia de tipografia), fundo (tinta, papel osso) e velocidade (câmera lenta, whip, time-lapse).

### Cada verso

1. **O verso.** A música toca a linha com volume cheio, e a letra aparece sincronizada palavra a palavra, no estilo
   da cena, para o espectador saber qual verso é. A imagem pode ser a cena original, uma versão remontada (outro ângulo,
   já indo para o detalhe que o bloco vai explicar) ou uma animação nova. A trilha de fundo sai.
2. **A explicação.** A narração do bloco, com a trilha de fundo baixa. A cena continua viva e se transforma
   na explicação.
3. **A passagem.** A faísca corre na régua até o próximo verso, e a imagem acompanha com um movimento: whip,
   corte casado na faísca, mergulho através de um objeto.

### Camadas visuais

- **Cenas do clipe**: reaproveitadas como estão, ou remontadas com câmera, enquadramento, velocidade e tempo da música
  escolhidos pelo roteiro, com partes trocadas ou isoladas (só a máscara, um olho, a curva). Nenhuma cena é
  `stateful`, então qualquer tempo da música pode ser renderizado.
- **Animações novas**: diagramas que se montam no estilo do vídeo (linhas finas, gravura, papel osso), feitos com
  as peças do clipe: a faísca, a máscara, o campo de prompt, as barras de probabilidade, o formulário do `bureau`,
  o odômetro do `ascent`, a régua logarítmica do `outro`, a faixa de raio X do `shoggoth`.
- **Anotações**: linhas finas de chamada, rótulos em IBM Plex Mono, o termo em Archivo; círculos e sublinhados
  desenhados pela faísca, que vira a caneta do narrador. Cada anotação entra na palavra falada.
- **Legendas**: nos trechos só com música, uma ou duas linhas para as referências menores, integradas à cena como
  o clipe integra a letra (gravadas numa cédula, carimbadas num formulário, escritas no mapa). Ficam na tela tempo
  suficiente para ler (~250 ms por palavra, no mínimo 1,5 s).
- **Cartões**: documentos em papel osso com tinta, no estilo do `bureau` (estudos, manchetes, o anúncio de vaga,
  o depoimento), e gráficos. Tipografia com a fonte na tela, não capturas de tela.
- **Régua**: faixa fina no pé da tela, como a de um player: a música de 0:00 a 2:35, um tique por verso e os refrões
  marcados com o valor do P(doom). O cursor é a faísca, com um símbolo de pausa ao lado enquanto a narração fala.
  Com tanta imagem nova, é a âncora: diz em que ponto da música estamos. Pode sair de cena em momentos de tela cheia
  e volta no verso seguinte. Aparece em 00.1 e some em 06.7. Em 04.3, a régua inteira acende como estopim.
- **Código**: em 00.2, 02.5 e 06.2–06.3, trechos reais de `app/src`, em Plex Mono, ligados à cena que desenham.

## Duração estimada

Voz estimada pelo ritmo das gravações anteriores (~16,8 caracteres/s). Trechos da música pelos tempos de
`data/lyrics.pt-br.json`, com 0,4 s de margem cada; respiro de 0,4 s entre blocos.

| Arquivo | Capítulo | Blocos | Caracteres | Voz | Trechos | Total |
|---|---|---:|---:|---:|---:|---:|
| `00-abertura` | Tudo é código | 6 | 1.176 | 70 s | — | ~1:12 |
| `01-faiscas` | P(doom) 0,02 · Faíscas | 4 | 1.083 | 64 s | 16 s | ~1:22 |
| `02-o-que-tem-dentro` | 0,15 · O que tem lá dentro | 7 | 1.539 | 91 s | 25 s | ~1:59 |
| `03-poder-demais` | 0,42 · Poder demais | 7 | 1.540 | 91 s | 34 s | ~2:08 |
| `04-clipes-de-papel` | 0,81 · Clipes de papel | 6 | 1.574 | 93 s | 30 s | ~2:05 |
| `05-o-que-ilya-viu` | 0,99 · O que Ilya viu | 5 | 1.116 | 66 s | 15 s | ~1:23 |
| `06-bastidores` | Como uma IA fez este vídeo | 7 | 1.222 | 73 s | ~8 s | ~1:24 |
| | **Total** | **42** | **9.250** | **~9:09** | **~2:08** | **~11:34** |

Com a música (2:35), o vídeo completo fica com cerca de **14 min**. A voz tem meio minuto a mais que o primeiro
rascunho; o que mais cresceu foram os trechos da música, que são o formato. Mais cortes, se precisar, devem sair da primeira
montagem (ver "Cortes possíveis").

## Arquivos

- `tts/NN-nome.txt`: texto exato de uma geração no ElevenLabs. **Cada parágrafo é um bloco**:
  o parágrafo 4 de `02-o-que-tem-dentro.txt` é o bloco 02.4. O vídeo corta entre blocos, então não junte
  nem divida parágrafos sem atualizar as tabelas abaixo.
- `audio/letra-explicada-pt-br/NN-nome.mp3`: a voz de cada arquivo, com o mesmo nome.
- `audio/letra-explicada-pt-br/trilha-de-fundo.mp3`: trilha do Suno (204,8 s), tocada em loop sob a voz.
- `audio/pdoom-pt-BR.mp3`: a fonte dos trechos da música.

**Estado atual:** os MP3 de voz e `mixagem.mp3` no repositório são do texto anterior
(sete arquivos, `00` a `06-final`). Todos precisam ser gerados de novo. Agora são sete arquivos, `00` a
`06-bastidores`. A mixagem não é mais feita à mão: um script a monta a partir dos blocos e dos trechos
(ver "Como montar").

## Geração no ElevenLabs

- Mesma voz e mesmas configurações em todos os arquivos. Aprove a voz com `00-abertura` antes de gerar o resto.
- O maior arquivo tem ~1.600 caracteres, abaixo dos limites do Eleven v3 (5.000) e do Multilingual v2 (10.000).
- O texto não tem marcações e funciona em qualquer modelo. Mantenha as linhas em branco entre parágrafos:
  a pausa maior entre eles ajuda a cortar os blocos.
- A primeira frase, "Você acabou de ouvir uma música de amor sobre o fim do mundo.", entra depois de um silêncio
  e dá o tom da explicação: calma, com um sorriso no fim. Gere algumas vezes e escolha a que soar mais natural.
- Em 06.5, "E esta voz, que você está ouvindo esse tempo todo? Também é i á. Loucura, né?" é a revelação do vídeo:
  a pergunta um pouco mais lenta, uma pausa curta antes de "Também é i á", e "Loucura, né?" rindo de leve.
  Vale gerar esse arquivo mais vezes que os outros até o final soar espontâneo.
- Ritmo: as gravações anteriores saíram a ~172 palavras por minuto, quase sem pausas. A montagem põe o respiro
  entre blocos, então o ritmo pode ficar.

### Grafia para a voz

O texto escreve algumas palavras do jeito que devem soar. Na tela, use a grafia original.

| Na voz | Na tela |
|---|---|
| pê dum, dum | P(doom), doom |
| fum | FOOM |
| Lum | Loom |
| a gê i | AGI |
| i á | IA |
| Chat gê pê tê, gê pê tê quatro | ChatGPT, GPT-4 |
| eme éle pê | MLP |
| cê dê erre | CDR, `cdr` |
| erre éle agá éfe | RLHF |
| um ê trinta | 1E30 |
| Ília | Ilya |
| Clód | Claude |
| Opus cinco ponto cinco | Opus 5.5 |
| gê éle ésse éle | GLSL |

A transcrição das gravações anteriores (faster-whisper) mostrou que "Ilya" saiu uma vez como "Ilha" (agora "Ília")
e que "o fum do começo" soava como "o fundo começo" (reescrito).

Ouça estes nomes antes de aprovar cada arquivo: Clód (se soar estranho, tente "Claude"), After Effects, TypeScript,
John Searle, Lovecraft, shoggoth, Death Note, Sydney, New York Times, Roko, von Neumann, Lisp, DeepMind, OpenAI,
Nick Bostrom, Janus, Sutskever e Sam Altman.

## Roteiro por bloco

"Trecho" é o verso que toca **antes** do bloco (por conteúdo, como em `lyrics.get()`), sempre com a letra
sincronizada na tela; a imagem do trecho pode ser a cena original ou uma versão remontada.
"Imagem" descreve uma proposta, não uma obrigação: vale trocar por algo melhor, dentro das regras da segunda passada.
**Novo** marca animações que não saem de nenhuma cena existente. **Externa** marca imagens de fora
(ver "Imagens de fora").

### 00 · Tudo é código

| Bloco | Trecho | Narração | Imagem |
|---|---|---|---|
| 00.1 | o fim do clipe (ver "A transição") | "Você acabou de ouvir uma música de amor sobre o fim do mundo." | O primeiro quadro; a régua se desenha e a faísca acende em 0:00, pausada. |
| 00.2 | — | "E tudo que você viu no vídeo é código… No final, eu te mostro melhor." | A faixa de raio X do `shoggoth` atravessa a tela e, por onde passa, a imagem vira o próprio código-fonte (arquivo e linha reais, rolando na velocidade da faixa). Primeiro sobre o quadro parado; depois, a cada batida da trilha, sobre quatro cenas do clipe: a caneta plotando o unicórnio, a explosão do FOOM, o shoggoth girando, a treliça de clipes. Em "nada de After Effects": uma linha de formulário do `bureau`, "programa de edição: nenhum", recebe um carimbo. Em "TypeScript e gê éle ésse éle": os dois nomes rotulam o código que rola (`.ts` e os blocos `/* glsl */`); em "página web", o código recua até caber num retângulo de linha fina com `localhost:5173` no alto. Em "vinte mil linhas": o odômetro do `ascent` rola até 22.608. Em "Clód Opus cinco ponto cinco": o nome em Archivo, grande, escrito pela faísca. **Novo.** |
| 00.3 | — | "Mas antes, a letra… acabar com a humanidade." | A faísca corre a régua e acende os tiques das referências, um a um, com um contador que chega a ~30. Uma cena nova de ~1 s para cada isca: as grades do `prompt` sydney fechando na cara da câmera; a máscara se virando para a câmera e sorrindo; a tarja REDIGIDO carimbando a tela inteira; um clipe se duplicando até encher o quadro. |
| 00.4 | — | "Vamos parar em cada uma. Tem coisa na imagem que quase ninguém percebe." | Uma lente macro passeia, fora de foco, por detalhes que ainda vão aparecer (um token com probabilidade, uma etiqueta, um adesivo), sem deixar ler nenhum. A lente se afasta até a régua, com a faísca em 0:00. |
| 00.5 | — | "Primeiro, o título… com essa chance de cair?" | *P*(doom) se monta como no cartão final; o P e o doom se afastam e cada um ganha sua chamada (probabilidade, ruína). Em "quase três mil pesquisadores": um campo de 2.778 pontos cai no quadro, como a grade de GPUs do `dense`; em "Metade", metade deles acende em laranja: "≥ 5%". "Grace et al., out. 2023". No avião: o campo encolhe até 20 pontos, um laranja. **Novo.** |
| 00.6 | — | "No vídeo, esse número sobe… Vamos subir junto." | A faísca pula de refrão em refrão na régua, e o mostrador do P(doom) rola 0,02 → 0,15 → 0,42 → 0,81 → 0,99 a cada pulo, depois volta a 0,02. |

### 01 · P(doom) 0,02 · Faíscas

| Bloco | Trecho | Narração | Imagem |
|---|---|---|---|
| 01.1 | "Vejo AGI faiscar no teu olhar," (a folha TikZ num plano mais aberto) | "O faiscar vem de um estudo… um clipe inteiro." | O estudo entra como folha de papel osso deslizando sobre a folha TikZ, com o título se datilografando: *Sparks of Artificial General Intelligence*, Microsoft Research, mar. 2023; chamada "AGI = inteligência artificial geral". Em "Saiu isto": os unicórnios do GPT-4 (figura 1.3), revelados traço a traço por uma máscara que segue a linha. **Externa.** Em "Três anos depois": tela dividida, 2023 à esquerda e a caneta plotando o nosso unicórnio à direita; a câmera se afasta, e o unicórnio vira um quadradinho num mosaico com quadros do clipe inteiro. |
| 01.2 | "teus circuitos me dão medo," | "Circuitos também é termo técnico…" | Mergulho nos traços do unicórnio enquanto viram trilhas de circuito; a câmera segue um pulso (a faísca) por uma trilha, que se isola: "circuito". Em "interpretabilidade": uma lente circular passa pelas trilhas e rotula algumas ("detecta curvas", "detecta chifre?"). Em "explicar como elas funcionam": todas as outras etiquetas viram "???". |
| 01.3 | "Tua loss de treino despencou," | "E a loss é o erro…" | A câmera anda sobre a curva da loss, colada na faísca, como num trilho, com a chamada "loss = erro" presa à curva. Em "fica parada por muito tempo": o platô, longo, com os passos de treino passando no eixo. Em "despenca": o mergulho pelo penhasco até a paisagem de contorno. Em "Sem aviso": o mundo gira 180°, como em "dominou". |
| 01.4 | "ChatGPT, não me engole vivo, não." | "Aí chega o Chat gê pê tê…" | O campo de prompt em close. Em "números em cima de cada palavra", a distribuição de "engole" cresce até ocupar a tela como gráfico de barras. Em "sorteada": as barras viram uma faixa proporcional, e a faísca cai nela como bolinha de roleta, parando em "engole 0,44"; "treine com 0,18" acende quando é dito. Em "olha quem aparece": corte seco para o primeiro token, "ChatGPT, 0,61", e a faísca circula "Claude, 0,12"; meio segundo de silêncio. |

### 02 · 0,15 · O que tem lá dentro

| Bloco | Trecho | Narração | Imagem |
|---|---|---|---|
| 02.1 | "Aumento meu P(doom), / pois o futuro faz FOOM." (o refrão rola até 0,15) | "Fum é o som de uma explosão…" | A explosão ramificada do `room` se reorganiza num gráfico: cada galho é uma versão (v1, v2, v3…), e o intervalo entre elas encolhe; a faísca traça a exponencial por cima, rápido demais para a câmera acompanhar. |
| 02.2 | "Preso no quarto chinês, / cogumelos pra um mês." | "O quarto chinês…" | O quarto visto de cima, em corte, como uma planta: cartões com perguntas entram pela fresta, o livro de regras folheia sozinho, a resposta sai. Do lado de fora, um carimbo: "FLUENTE"; dentro, o cartão vira e mostra "我不懂 = eu não entendo". "John Searle, 1980". Em "cogumelos": dois segundos do acento ácido, e o quadro derrete. |
| 02.3 | "Desmascara o shoggoth infame" | "O shoggoth…" | A máscara em close, sorrindo. Em "Por dentro": a câmera recua e contorna, e a máscara se revela minúscula diante de uma massa colossal. Em "Guarda essa máscara": a máscara se solta e voa até um canto da régua, onde fica até 04.6. **Novo** (o ícone). |
| 02.4 | "com teus olhos de shinigami." | "Os olhos de shinigami…" | A câmera orbita a criatura; cada olho abre quando é nomeado, com corte seco de um olho para o outro, e a etiqueta sai com uma linha de explicação: bajulação ("concorda pra agradar"), explora recompensas ("cumpre a meta do jeito errado"), alinhamento enganoso ("finge estar alinhado no treino"), busca poder ("acumula recursos: serve pra qualquer meta"). |
| 02.5 | — | "E esse monstro não foi desenhado…" | A faixa de raio X passa pela criatura e mostra o que há por baixo: raios saindo da câmera, um por pixel, avançando em passos até bater na superfície (é assim que o shader desenha); depois a hachura aparecendo traço a traço, e `shoggoth-glsl.ts` rolando ao lado. "1.303 linhas". |
| 02.6 | "mas a singularidade começou." | "A singularidade… De papel." | Mergulho no buraco negro do O de "começou". Do outro lado, os pontos da letra flutuam no vórtice; em "Inclusive a gente", eles formam a palavra VOCÊ; em "um clipe", rearranjam-se no clipe; a imagem segura em "De papel". |
| 02.7 | "Sydney, por favor, me solta." | "Sydney era o codinome…" | As grades fecham, uma por batida. Atrás delas, a manchete se datilografa em tipografia de jornal: "A Conversation With Bing's Chatbot Left Me Deeply Unsettled", Kevin Roose, *The New York Times*, 16 fev. 2023. A resposta da cena se digita com o sorriso, com a legenda: "você tem sido um bom usuário. · o Bing disse o contrário: \"You have not been a good user. I have been a good Bing.\"" |

### 03 · 0,42 · Poder demais

| Bloco | Trecho | Narração | Imagem |
|---|---|---|---|
| 03.1 | "Aumento meu P(doom), / ouço o basilisco: BUM!" (o refrão rola até 0,42) | "O basilisco de Roko…" | Close extremo na pupila da serpente. Refletida nela, uma lista em Plex Mono se datilografa; em "agora você também está na lista", termina com "você", e a pupila se estreita. "LessWrong, 2010". |
| 03.2 | "NVIDIA pra Lua: ZUM! / Ponto Ômega em três, dois, um. / Um E trinta FLOPs por segundo," (só música) | "Um ê trinta flops…" | No trecho, o clipe como é, com legendas integradas: "NVIDIA · a empresa mais valiosa do mundo", gravada como letra de cédula no gráfico que sobe até a lua, e "Ponto Ômega · Teilhard de Chardin · a evolução rumo a uma consciência suprema", em Cormorant, nas linhas que convergem. No bloco: a câmera viaja por uma régua logarítmica, como a do `outro`, de 10⁰ a 10³⁰, passando por "GPT-4, treino inteiro ≈ 2×10²⁵" até "1 segundo = 10³⁰"; o último salto é marcado "× 50.000". **Novo.** |
| 03.3 | "MLP: vai, volta, repetição," | "Eme éle pê…" | O diagrama do anexo B do `bureau`, com profundidade: na ida, pulsos laranja atravessam as conexões; na volta, pulsos mais escuros retornam, e as conexões engrossam ou afinam. Uma pequena curva de loss no canto cai um degrau a cada volta. Em "milhões de vezes": o ciclo acelera até virar um borrão, e a curva despenca. |
| 03.4 | "von Neumann já virou peça de coleção." | "John von Neumann… risca de laranja." | O apêndice C do `bureau`, como no clipe. Em "Se até ele virou peça de coleção": a folha entra numa vitrine de museu desenhada em linha fina, com a etiqueta "John von Neumann · 1903–1957". Em "o aparelho em que você vê este vídeo": o diagrama sai da vitrine, e as caixas ganham nomes de hoje (processador, memória, entrada e saída); em "risca de laranja": o risco do clipe, reaproveitado. |
| 03.5 | "Guinada à esquerda, já tá sem freio," | "A guinada à esquerda…" | Vista de cima do mapa do `leftturn`; a faísca anda numa estrada reta rotulada "comportamento desejado", ao lado de um medidor de "capacidade" que sobe. No salto, a faísca vira 90° e sai da estrada, e a câmera faz o whip junto. Em "alinhamento": a estrada ganha uma guia, que acaba logo adiante. |
| 03.6 | "sem um só CDR no meio." | "Cê dê erre é piada dupla…" | O Gantt do `leftturn`, como no clipe, com o CDR piscando vazio. Em "No Lisp": um terminal de Lisp em Plex Mono, `(cdr '(a b c))` → `(b c)`, e a lista perde a cabeça. **Novo.** Em "Na engenharia": o Gantt de volta, com a chamada "CDR · revisão crítica de projeto"; a faísca passa direto pelo CDR até LANÇAMENTO; em "não realizada", o carimbo do clipe, "SITUAÇÃO: NÃO REALIZADA". |
| 03.7 | "Gato, por favor, não solta a minha mão." | "E Gato, sim, esse é o nome…" | O `prompt` gato, com as letras se afastando. Uma grade de 604 células, com nomes de tarefas em Plex Mono minúsculo ("conversar", "Atari", "braço robótico"…), acende de uma vez: "604 tarefas · uma rede". No fim, tela dividida: as letras de "me solta." se afastando e as de "não solta a minha mão." se segurando juntas. |

### 04 · 0,81 · Clipes de papel

| Bloco | Trecho | Narração | Imagem |
|---|---|---|---|
| 04.1 | "Aumento meu P(doom), / tudo vira clipe, um a um." (o refrão rola até 0,81) | "Chegamos à fábrica de clipes do começo…" | Voo pela treliça de clipes, que cresce. Em "o planeta, e a gente": a treliça se fecha numa esfera gravada, feita de clipes, e o clipe da `spacetime` (02.6) volta num relance. Em "Ela não precisa odiar ninguém": a câmera para num clipe só, parado, indiferente. "Nick Bostrom, 2003". |
| 04.2 | "Quem desliga foi viajar, / não tem pra onde escapar." | "E o botão de desligar?…" | O anúncio satírico como formulário de vaga do `bureau`, sem logotipo, com o carimbo "SÁTIRA · 2023". Em "Mas a pergunta é séria": um interruptor gravado, grande; o cursor do fim do clipe vai até ele, e o interruptor escorrega para longe a cada tentativa, ao lado de "meta → continuar ligada". Em "foi viajar": a resposta automática do `paperclips` cobre a tela. **Novo.** |
| 04.3 | "Já acendemos o estopim," | "Agora, repara no ponto laranja…" | Corte casado na faísca: ela fica parada no mesmo ponto da tela enquanto o mundo em volta troca a cada palavra (a caneta do unicórnio, a ponta da curva da loss, o preço no gráfico da bolsa, a dobra do primeiro clipe, o estopim queimando), cada cena com o seu tempo da música num canto. Em "Aceso desde o primeiro segundo", a régua inteira acende como estopim. |
| 04.4 | "tese da ortogonalidade: um blues sem fim." | "A tese da ortogonalidade…" | O gráfico INTELIGÊNCIA × OBJETIVOS em papel quadriculado; a faísca marca dois pontos com chamadas: "muito inteligente · só quer clipes" e "pouco inteligente · quer ajudar". Em "O blues": a reta vira corda e dobra, com a legenda "a corda segue a afinação real da voz, medida pelo programa". |
| 04.5 | "“Só transformers, é simples assim!” / Até que aprendeu a dizer “não” pra mim." | "Só transformers?…" | A queda pela pilha para num bloco, que se abre em vista explodida, com as partes rotuladas. "GPT = Generative Pre-trained **Transformer**", com o T aceso. Em "Nem se vai obedecer": o bloco gira e sai do alinhamento, e o NÃO PRA MIM acende ao contrário. |
| 04.6 | "Pós-Chinchilla, superdenso, / pula a cerca sem bom senso. / Cem mil GPU, / RLHF deu chabu." (só música até "chabu") | "E a máscara do shoggoth?…" | No trecho, remontado: a letra comprimindo, as margens de segurança quebrando, a grade de GPUs, com as legendas "Chinchilla · DeepMind, 2022 · modelo menor + mais dados vence modelo gigante", "as cercas são as margens de segurança da tela" e "100 mil GPUs · recorde em 2024 · hoje, centenas de milhares". No bloco: a máscara sai da régua e volta à mesa inclinada do `dense`. Em "pessoas avaliam": carimbos +1 e −1 caem sobre as respostas, e a cada +1 o sorriso da máscara se abre mais. Em "bajulação": a etiqueta de 02.4 volta num canto. Em "dá chabu": a mesa inclina, a máscara rola e para de ponta-cabeça, e o MODELO DE RECOMPENSA cai. |

### 05 · 0,99 · O que Ilya viu

| Bloco | Trecho | Narração | Imagem |
|---|---|---|---|
| 05.1 | "Aumento meu P(doom), / como previu o Loom." (o refrão rola até 0,999…) | "Lembra dos números em cima das palavras?…" | As barras de probabilidade de 01.4 voltam e giram 90°, virando galhos: é a árvore do `loom`, que cresce palavra por palavra até "Loom" ser amostrado. "Loom · Janus, 2021". |
| 05.2 | "Do pré-treino preditivo / ao auto-upgrade recursivo." | "No pré-treino…" | Uma frase corre na tela com a próxima palavra coberta por um bloco [MASK]; o bloco se abre com o palpite; outra frase, outro palpite, cada vez mais rápido, até virar um borrão em "Bilhões de vezes". "GPT = Generative **Pre-trained** Transformer", com o P aceso. Em "melhorando a si mesma": a recursão de Droste do `loom`, e um segundo da explosão do FOOM. |
| 05.3 | "O que Ilya viu? Nunca vamos saber." | "Ília Sutskever…" | A sala do laptop, com a câmera circulando. Linha do tempo datilografada: "17 nov. 2023: demitido · 22 nov.: de volta". Em "Uma superinteligência escondida?": a câmera passa para trás da tampa, e os adesivos acendem com legendas: "SINTA A AGI · festa da OpenAI, 2022", "LEVEMENTE CONSCIENTE · ele, em fev. 2022", "Q\* · boatos, nov. 2023". |
| 05.4 | — | "Mas nessa, a letra envelheceu…" | A câmera volta à frente da tela REDIGIDO; as tarjas saem uma a uma e, de trás delas, 52 folhas se abrem em leque: "MEMORANDO · 52 PÁGINAS". Cartão: "Depoimento de Ilya Sutskever · Musk v. Altman · 1º out. 2025 · divulgado em nov. 2025". **Novo.** |
| 05.5 | "Foi tudo só pra inglês ver?" | "Quanto das promessas…" | O teatro vazio, com o holofote sobre o nada; as cortinas fecham na última palavra. |

Depois de 05.5, só música: o cartão final do `outro`, de "= ∞" até "NaN¹ estimativa não mais definida" (~4 s).
O contador quebra sem explicação: a imagem basta.

### 06 · Como uma IA fez este vídeo

| Bloco | Trecho | Narração | Imagem |
|---|---|---|---|
| 06.1 | cartão final do `outro` (acima) | "Máquinas que aprendem rápido…" | Quatro cenas de ~1,5 s, uma por trecho da frase, cada uma remontada: a loss despencando, os cartões saindo pela fresta, a máscara sorrindo, o clipe se duplicando. |
| 06.2 | — | "E a promessa do começo…" | O `git log` do repositório original rola em Plex Mono, do primeiro commit ("I'm Upping My P(doom): code-rendered music video") em diante, cada linha puxando um quadro da cena correspondente. Crédito na tela: "clipe original: Giacomo Magnanini + Claude Opus 5.5 · github.com/mexicat/pdoom-video". |
| 06.3 | — | "O truque é que cada quadro é uma função do tempo…" | `quadro = render(t)` em tipografia. A própria régua vira o controle: a faísca arrasta t para a frente e para trás, e a cena acima acompanha; o mesmo t dá o mesmo quadro duas vezes, lado a lado, com um "=" entre eles. Em "desenhar por cima": as camadas desta explicação (anotações, legendas, régua) se separam em 3D, como folhas transparentes sobre a cena. Barras com as linhas de cada arquivo de `app/src`, somando 22.608. **Novo.** |
| 06.4 | — | "A letra, não…" | Créditos em tipografia: letra original de osmarks, MusicPerson e do Discord da EleutherAI, com o Claude no final; música pela Suno; voz pelo ElevenLabs; versão em português por O Programador Real. |
| 06.5 | — | "E tem uma ironia aqui… Loucura, né?" | A máscara, sorrindo, de frente. Em "inclusive o do monstro": ela gira e mostra, no verso, o código do shoggoth. Em "E o roteiro": o texto deste arquivo, `06-bastidores.txt`, rola em Plex Mono; em "Inclusive esta frase", a frase acende palavra por palavra enquanto é dita. Em "E esta voz": a forma de onda desta própria fala, desenhada pela faísca, com a etiqueta "voz sintética"; em "Loucura, né?", a onda se curva no sorriso da máscara. **Novo.** |
| 06.6 | — | "Talvez o fim do mundo que a música canta… E o porquê." | O campo de prompt do vídeo, vazio. Digita-se "Meu P(doom) é ", e o cursor pisca sob uma distribuição de próximos tokens: "5%", "50%", "depende", "???". |
| 06.7 | — | "E agora, ouve de novo…" | O primeiro quadro, com a faísca em 0:00. Em "ouve de novo", a pausa vira play e a régua se apaga; a música recomeça sob a tela final do YouTube (ver "A transição"). |

## Cortes possíveis

Se a primeira montagem ainda parecer longa, estes blocos saem sem quebrar nenhum gancho e sem gerar áudio de novo:
basta tirar o bloco e o trecho antes dele.

| Bloco | Voz + trecho | Observação |
|---|---|---|
| 02.5 o monstro é uma fórmula | ~9 s | 06.3 e 06.5 ainda cumprem a promessa. |
| 04.5 transformers | ~16 s | 05.2 funciona sozinho. |
| 03.2 FLOPs | ~14 s | O trecho para em "três, dois, um"; Nvidia e Ômega ficam só na legenda. |
| 04.3 o ponto laranja | ~14 s | Último recurso: é o ponto alto da segunda metade. |

## Estilo

Valem as regras de [`docs/TREATMENT.md`](../TREATMENT.md): a paleta, as quatro famílias de fonte,
nenhum rosto humano realista, nenhum logotipo e nenhuma imitação de interface de produto.
As anotações seguem as regras de tipografia do vídeo: kerning, pontuação tipográfica, sem contorno nem halo.
Pessoas reais aparecem como nomes e datas em tipografia.

## Imagens de fora

Imagem de fora só entra quando o objeto é o assunto e não dá para refazer.
Vai no tratamento duotônico das pranchas do `outro` (tinta → laranja → osso), com a fonte sempre na tela.

- **Unicórnios do GPT-4**, figura 1.3 de [*Sparks of AGI*](https://arxiv.org/abs/2303.12712) (01.1).
  É citação de trecho de obra para estudo e crítica, com a fonte indicada (Lei 9.610/98, art. 46, III).

O resto é refeito em tipografia: primeiras páginas de estudos, a manchete do NYT, o anúncio satírico
e o depoimento.

## Como montar

Um esboço para a fase de código, para as decisões ficarem registradas.

- **Tempos da narração.** Alinhar cada MP3 de voz ao texto conhecido (faster-whisper com carimbo de tempo
  por palavra, como em `analysis/pt_br.py`) e gravar `data/narracao.pt-br.json`: blocos e palavras com início e fim.
  Assim como as cenas acham versos por conteúdo, as mudanças de imagem acham palavras da narração
  ("Bajulação", "Claude") em vez de tempos fixos.
- **Cenas do clipe.** Reaproveitar um trecho como ele é basta renderizar a cena num tempo da música escolhido,
  com zoom, câmera lenta ou volta por cima. Para remontar, as cenas ganham parâmetros opcionais (câmera, tempo
  da música, partes visíveis), com padrões que reproduzem o clipe como é hoje. A explicação é uma sequência de cenas
  novas que usam essas cenas e as peças delas (shaders, geometrias, `_motifs.ts`). Depois de mexer numa cena do clipe, confirme que o clipe
  não mudou (`bun scripts/render.ts sheet --lang pt-BR --cuts` antes e depois).
- **Lista de montagem.** Uma sequência de segmentos: `{trecho: 'Preso no quarto chinês', cena, legendas}` ou
  `{bloco: '02.2', cena, mudanças por palavra}`. A duração de cada segmento vem dos dados:
  trecho = tempos do verso ajustados à batida; bloco = áudio da voz mais o respiro.
- **Mixagem por script.** O mesmo script lê a lista e monta o áudio: trechos de `audio/pdoom-pt-BR.mp3`,
  blocos cortados dos MP3 de voz, trilha de fundo sob a voz, baixando sob a fala e saindo nos trechos,
  e 0,35–0,6 s de respiro entre blocos. A voz pode entrar ~0,3 s antes do fim do trecho.
  Como imagem e som saem da mesma lista, não há como dessincronizar.
- **Render.** O vídeo estendido é o clipe inteiro (0–155,6 s, sem nenhuma mudança) seguido da explicação.
  O último quadro do clipe é o primeiro da explicação. `bun scripts/render.ts video --lang pt-BR` continua gerando
  o clipe sozinho.

## Capítulos do YouTube

Os tempos saem da mixagem. Nomes:

```
0:00 Aumento meu P(doom)
Tudo que você viu é código
P(doom) 0,02 · Faíscas
0,15 · O que tem lá dentro
0,42 · Poder demais
0,81 · Clipes de papel
0,99 · O que Ilya viu
Como o Opus 5.5 fez este vídeo
```

A descrição do vídeo deve trazer os créditos de 06.4, o link do repositório original e as fontes abaixo.

## Fontes dos fatos

Os demais fatos seguem o [guia da letra](GUIA-DA-LETRA.md).

- Pesquisa com 2.778 pesquisadores, outubro de 2023: mediana de 5% para desfechos "extremamente ruins
  (por exemplo, extinção humana)"; entre 38% e 51% deram pelo menos 10%, conforme a pergunta:
  [Grace et al., *Thousands of AI Authors on the Future of AI*](https://arxiv.org/abs/2401.02843).
- Unicórnio em TikZ: [*Sparks of Artificial General Intelligence*](https://arxiv.org/abs/2303.12712), março de 2023.
- Sydney e Kevin Roose, 16 de fevereiro de 2023; "You have not been a good user. I have been a good Bing.",
  na mesma semana: [Sydney (Microsoft)](https://en.wikipedia.org/wiki/Sydney_(Microsoft)).
- Nvidia como a empresa mais valiosa do mundo (primeira a passar de US$ 5 trilhões, em outubro de 2025):
  [CNBC, julho de 2026](https://www.cnbc.com/2026/07/17/apple-nvidia-aapl-nvda-market-cap.html).
  Confira na data de publicação.
- GPT-4 treinado com cerca de 2×10²⁵ FLOP (incerteza de 2 a 5 vezes):
  [Epoch AI](https://epoch.ai/data-insights/models-over-1e25-flop). 10³⁰ ÷ 2×10²⁵ = 50.000, daí
  "dezenas de milhares de vezes".
- Gato e suas 604 tarefas, 2022: [DeepMind](https://deepmind.google/blog/a-generalist-agent/).
- Anúncio satírico do engenheiro do botão de desligar ("Know how to unplug things"), 2023:
  [Dataconomy](https://dataconomy.com/2023/09/11/openai-killswitch-engineer/).
- O incentivo para impedir o desligamento: um agente que só maximiza a própria meta tem motivo para desativar o
  botão de desligar: [Hadfield-Menell et al., *The Off-Switch Game*](https://arxiv.org/abs/1611.08219).
- Chinchilla (70 bi de parâmetros) superando Gopher (280 bi) com a mesma computação:
  [Hoffmann et al., 2022](https://arxiv.org/abs/2203.15556).
- Colossus, 100 mil H100 em 2024, e centenas de milhares de GPUs em 2026:
  [Wikipedia](https://en.wikipedia.org/wiki/Colossus_(supercomputer)).
- RLHF e bajulação: [Sharma et al., *Towards Understanding Sycophancy in Language Models*](https://arxiv.org/abs/2310.13548).
- GPT = *Generative Pre-trained Transformer*.
- Altman demitido em 17 de novembro de 2023 e de volta em 22 de novembro:
  [NPR](https://www.npr.org/2023/11/22/1214621010/openai-reinstates-sam-altman-as-its-chief-executive).
- Ilya Sutskever: "Feel the AGI" na festa de fim de ano de 2022 (The Atlantic), "slightly conscious"
  em fevereiro de 2022: [Wikipedia](https://en.wikipedia.org/wiki/Ilya_Sutskever),
  [Quote Investigator](https://quoteinvestigator.com/2022/10/05/ai-conscious/).
- Depoimento de Sutskever no processo Musk v. Altman (1º de outubro de 2025, divulgado em novembro de 2025):
  memorando de 52 páginas aos conselheiros independentes com queixas sobre a conduta de Altman, baseado
  sobretudo em informações de Mira Murati: [Decrypt](https://decrypt.co/347349/inside-deposition-showed-openai-nearly-destroyed-itself).
- Linhas de código: `app/src` tem 57 arquivos `.ts` e 22.608 linhas; `shoggoth.ts` + `shoggoth-glsl.ts`, 1.303.
  Refaça a contagem antes de publicar.
