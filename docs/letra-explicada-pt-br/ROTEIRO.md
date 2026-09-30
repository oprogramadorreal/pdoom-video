# A letra explicada — roteiro

Extensão do vídeo em português, para o YouTube ("Opus 5.5 criou este vídeo"). Depois da música, o vídeo
volta ao começo e passa pela música de novo, verso por verso: mostra o verso na tela e o explica com as cenas do clipe,
reaproveitadas ou remontadas, e com animações novas. No final, mostra como o clipe foi feito.

O texto falado está em [`tts/`](tts/). Este roteiro liga cada parágrafo desses arquivos a um verso
da música e a uma imagem, e é a referência para montar o vídeo.

O som da explicação já está pronto: é a [`mixagem.mp3`](../../audio/letra-explicada-pt-br/mixagem.mp3), a narração
inteira sobre a trilha de fundo. O vídeo usa esse arquivo como ele é, sem cortar, remontar nem mixar de novo,
e a imagem é montada sobre ele. Por isso, a música não toca durante a explicação: os versos aparecem só na tela.
A música volta apenas no fim, depois da mixagem (ver "Como a explicação termina").

## A ideia

O clipe termina rebobinando: as cenas passam de trás para frente e param no primeiro quadro.
A explicação começa ali mesmo, sem corte: uma régua de player aparece no pé da tela, e a narração percorre
a música de novo. O rebobinamento só avisa que vamos voltar ao clipe. Daí em diante, a imagem é livre: reaproveita
quadros do clipe quando eles já mostram o que a narração diz, e remonta, desmonta ou troca por animação nova quando
não mostram (ver "A segunda passada"). No fim, a régua dá play e a música recomeça.

Três promessas, todas feitas nos primeiros 45 segundos:

1. **"Tudo que você viu no vídeo é código… No final, eu te mostro melhor."** A promessa do título. Volta em 02.5
   (o monstro é uma fórmula) e se cumpre em `06-bastidores`.
2. **"Tem coisa na imagem que quase ninguém percebe."** Detalhes das cenas apontados pela narração e por legendas:
   "Claude, 0,12" entre as candidatas, as etiquetas nos olhos do shoggoth, a frase que vira clipe, o ponto laranja.
3. **Quatro iscas**: a IA que se declarou (Sydney), o monstro com sorriso (shoggoth), a demissão que virou
   mistério (Ilya) e a fábrica de clipes. Cada uma é paga num capítulo.

O contador de P(doom) é o esqueleto: cada capítulo abre com o refrão que sobe o número
(0,02 → 0,15 → 0,42 → 0,81 → 0,99 → NaN). A régua no pé da tela mostra quanto falta.

A virada de capítulo é feita só pela imagem. A voz não anuncia o capítulo, e a mixagem não tem pausa extra entre
capítulos. Nas primeiras palavras do capítulo, a cena `hook` rola o número novo em tela cheia com o verso do refrão,
"Aumento meu P(doom)", e o valor acende na régua. A narração começa direto no assunto, sem repetir o número.

### O que fica na voz e o que vai para a legenda

A voz fica com as ideias que ensinam algo e com os ganchos: como um modelo de linguagem escreve,
interpretabilidade, loss e retropropagação, quarto chinês, alinhamento, ortogonalidade, o botão de desligar,
RLHF e bajulação, pré-treino, a virada do Ilya, e as duas piadas duplas que o público de programação aproveita:
von Neumann e CDR. Referências menores passam só como legenda na tela: Ponto Ômega, Nvidia,
Chinchilla, as cercas, as cem mil GPUs e os adesivos do laptop. Como a voz não para, cada legenda é curta e entra
junto com o verso que abre o bloco, antes de a voz chegar ao assunto principal. A que não couber sem disputar com a voz
sai da tela e vai para a descrição do vídeo. Nada que o público brasileiro já sabe ("pra inglês ver") ou que o programador já entende (NaN)
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
| a própria voz que narra, desde 00.1 | 06.5 "E esta voz… Também é I-Á." |
| 00.1 "uma música de amor sobre o fim do mundo" | 06.6 "Talvez o fim do mundo que a música canta nunca aconteça." |
| 04.5 o T do GPT | 05.2 o P do GPT |

### Ritmo

- A voz não para. A mixagem tem os 42 blocos em sequência, só com a pausa natural entre parágrafos (0,24 a 0,8 s,
  mediana 0,28 s), sem pausa extra entre blocos nem entre capítulos. O ritmo vem da imagem.
- Cada bloco abre com o seu verso na tela: é a volta à música, a cada 5 a 25 s de voz.
- Sem trechos só com música, o respiro também vem da imagem: em cada capítulo, pelo menos um plano longo e calmo,
  sem anotação nova, que só acompanha a voz (o vórtice de 02.6, o teatro vazio de 05.5).
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

Tempos a partir do fim da música (155,6 s). A mixagem começa com a voz já no primeiro instante, junto com
a trilha, então ela entra 0,6 s depois do fim da música, em 156,2 s do vídeo.

| Tempo | Imagem | Som | Voz |
|---|---|---|---|
| 0,0–0,35 s | O primeiro quadro, parado: preto, com as marcas de corte. | Silêncio: a cauda da música já sumiu no fade. | — |
| 0,35–4,1 s | A faísca acende no centro e, na primeira palavra, desenha um coração num traço só. Em "amor", ele se enche de laranja e bate duas vezes; na batida seguinte, arredonda-se na Terra: um globo pontilhado, só os continentes, com o Atlântico de frente (o Brasil à esquerda, a África à direita). Em "fim do mundo", a Terra racha a partir de um ponto e esquenta, tremendo. | A mixagem começa: a trilha entra baixa, sob a voz. | 00.1 "Você acabou de ouvir uma música de amor sobre o fim do mundo." |
| 4,1 s | No tempo forte depois de "mundo" (o corte para 00.2), a Terra explode: um clarão de um quadro, um anel de choque, os continentes arremessados em faíscas que esfriam. | Trilha. | — |
| 4,5 s | Os destroços ainda voam quando, em "tudo", o clipe volta em flashes; em "é código", a faixa de raio X atravessa o quadro e o transforma em código. | Trilha sob a voz. | 00.2 "E tudo que você viu no vídeo é código…" |

Por que assim:

- **Sem corte.** O clipe completa o próprio gesto (clica, rebobina, para no começo) e a explicação parte do ponto
  em que ele parou.
- **Nada de tela preta.** A primeira frase ganha imagem desde a primeira palavra: o coração é o "amor", a Terra que
  explode é o "fim do mundo". A explosão cai no corte e emenda nos flashes do clipe.
- **A régua espera.** Ela só entra no fim de 00.2, em "inteligência artificial" (~23,7 s), pouco antes de ser usada:
  em "No final", a faísca corre até a ponta dela, e em 00.3 ela varre a letra inteira. Antes disso, o assunto é o vídeo
  ser código, não a letra, e a régua só disputaria espaço com os flashes e o código.
- **A primeira frase não depende da tela.** Ela resume o que a pessoa acabou de ver, com ironia, e funciona até
  para quem está só ouvindo. O gancho do título vem logo depois, uns 4 s mais tarde.
- **Nada de "Espera".** No YouTube, a barra de progresso e os capítulos já mostram que o vídeo continua.
  A interrupção era para segurar quem ia sair; aqui ela só quebraria o ritmo.
- **Nada a refazer no clipe.** O `outro` fica como está. A explicação é uma linha do tempo nova que começa em 155,6 s.

### Como a explicação termina

Em 06.7, "E agora, ouve de novo", a régua volta (ela sai no começo do capítulo 06) e a faísca volta a 0:00. A mixagem termina ~2 s depois da última palavra,
com a trilha sumindo. Quando ela acaba, o símbolo de pausa vira play, a régua se apaga e a música recomeça
com o clipe, do primeiro quadro, o mesmo em que a explicação começou. Ela toca sob a tela final do YouTube,
que ocupa os últimos 5 a 20 s. A música entra depois da mixagem, emendada, sem sobreposição: é o único som
da explicação que não vem da mixagem.

*Como ficou:* o recomeço dura 20 s (o máximo da tela final do YouTube): o `open` do clipe, de 0:00 a 0:20,
com a música; a imagem e o som somem juntos nos últimos 2,5 s. O vídeo termina em 757,7 s.

## A segunda passada

Na primeira vez, o espectador viu o clipe. Na segunda, a música é a mesma, mas a imagem serve à explicação.
O que liga as duas é pouco e fixo: a régua (em que ponto da música estamos), o verso com a letra na tela,
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
- **Cortes na batida.** Cortes e mudanças grandes caem nas batidas da trilha de fundo (ver "Batidas" em "Como foi montado").
- **Variar.** Dois blocos seguidos não têm a mesma cara: alternar escala (macro de um detalhe, plano aberto,
  tela cheia de tipografia), fundo (tinta, papel osso) e velocidade (câmera lenta, whip, time-lapse).

### Cada verso

1. **O verso.** No silêncio antes do bloco, o verso aparece na tela, no estilo da cena, para o espectador saber
   onde estamos na música. A música não toca: a letra entra inteira ou depressa (em até ~0,5 s), sem esperar o tempo
   do canto, com a palavra que a narração vai explicar em destaque. Quase todo bloco começa nomeando essa palavra
   ("O faiscar…", "Circuitos…", "E a loss…"), e a voz a encontra já na tela. A imagem pode ser a cena original
   no tempo do verso (a tipografia do clipe já mostra a letra), uma versão remontada (outro ângulo, já indo para
   o detalhe que o bloco vai explicar) ou uma animação nova.
2. **A explicação.** A narração do bloco, com a trilha baixa por baixo, como está na mixagem. A cena continua viva
   e se transforma na explicação.
3. **A passagem.** Nas últimas palavras do bloco, a faísca corre na régua até o próximo verso, e a imagem acompanha
   com um movimento (whip, corte casado na faísca, mergulho através de um objeto) que termina no silêncio entre
   os blocos.

### Camadas visuais

- **Cenas do clipe**: reaproveitadas como estão, ou remontadas com câmera, enquadramento, velocidade e tempo da música
  escolhidos pelo roteiro, com partes trocadas ou isoladas (só a máscara, um olho, a curva). Nenhuma cena é
  `stateful`, então qualquer tempo da música pode ser renderizado.
- **Animações novas**: diagramas que se montam no estilo do vídeo (linhas finas, gravura, papel osso), feitos com
  as peças do clipe: a faísca, a máscara, o campo de prompt, as barras de probabilidade, o formulário do `bureau`,
  o odômetro do `ascent`, a régua logarítmica do `outro`, a faixa de raio X do `shoggoth`.
- **Anotações**: linhas finas de chamada, rótulos em IBM Plex Mono, o termo em Archivo; círculos e sublinhados
  desenhados pela faísca, que vira a caneta do narrador. Cada anotação entra na palavra falada.
- **Legendas**: uma ou duas linhas curtas para as referências menores, integradas à cena como o clipe integra
  a letra (gravadas numa cédula, carimbadas num formulário, escritas no mapa). Entram com o verso que abre o bloco,
  antes de a voz chegar ao assunto principal, e ficam na tela tempo suficiente para ler (~250 ms por palavra,
  no mínimo 1,5 s). A que disputar com a voz sai (ver "O que fica na voz e o que vai para a legenda").
- **Cartões**: documentos em papel osso com tinta, no estilo do `bureau` (estudos, manchetes, o anúncio de vaga,
  o depoimento), e gráficos. Tipografia com a fonte na tela, não capturas de tela.
- **Régua**: faixa fina no pé da tela, como a de um player: a música de 0:00 a 2:35, um tique por verso e os refrões
  marcados com o valor do P(doom). O cursor é a faísca, com um símbolo de pausa ao lado enquanto a narração fala.
  Com tanta imagem nova, é a âncora: diz em que ponto da música estamos. Pode sair de cena em momentos de tela cheia
  e volta no verso seguinte. Em 04.3, a régua inteira acende como estopim.
  Entra no fim de 00.2, em "inteligência artificial", pouco antes do primeiro uso ("No final" e a varredura de 00.3).
  Sai no começo de 06.1, quando a letra já foi explicada, e volta só onde é o assunto: em 06.3, como o controle do
  tempo, e em 06.7, para voltar a 0:00 e dar play.
  *Como ficou:* a régua é desenhada na camada do HUD (a das marcas de corte), então o tremor, os zooms, a inversão e as
  franjas de cor das cenas não a atingem; um degradê de tinta suave por baixo a mantém legível sobre qualquer imagem.
  A parte já tocada da linha fica laranja. Embaixo da ponta esquerda, "▮▮ 0:23 / 2:35". Sobre o cursor pode aparecer
  uma etiqueta curta ("cap. 02 · Sydney") e uma posição pode piscar na régua (o fim, em 00.2; cada refrão, em 00.6).
- **Verso na régua**: em todo bloco que tem verso, o verso entra logo acima da régua, à esquerda, em Archivo, em até
  ~0,4 s, com a palavra explicada em laranja, e fica ali durante o bloco, como o "tocando agora" de um player. É a
  forma fixa de o verso estar sempre na tela; a cena, quando é a do clipe no tempo do verso, também o mostra no estilo dela.
- **Código**: em 00.2, 02.5 e 06.2–06.3, trechos reais de `app/src`, em Plex Mono, ligados à cena que desenham.

## Duração

Medida na `mixagem.mp3`: cada capítulo começa onde o anterior termina, e a duração é a do MP3 de voz.

| Arquivo | Capítulo | Blocos | Caracteres | Início na mixagem | Duração |
|---|---|---:|---:|---:|---:|
| `00-abertura` | Tudo é código | 6 | 1.165 | 0:00,0 | 72,7 s |
| `01-faiscas` | P(doom) 0,02 · Faíscas | 4 | 1.066 | 1:12,7 | 68,4 s |
| `02-o-que-tem-dentro` | 0,15 · O que tem lá dentro | 7 | 1.539 | 2:21,0 | 99,3 s |
| `03-poder-demais` | 0,42 · Poder demais | 7 | 1.502 | 4:00,4 | 95,3 s |
| `04-clipes-de-papel` | 0,81 · Clipes de papel | 6 | 1.557 | 5:35,7 | 99,3 s |
| `05-o-que-ilya-viu` | 0,99 · O que Ilya viu | 5 | 1.111 | 7:15,0 | 68,8 s |
| `06-bastidores` | Como uma IA fez este vídeo | 7 | 1.222 | 8:23,7 | 75,7 s |
| | **Total** | **42** | **9.162** | | **9:39,5** |

A mixagem tem 9:41,5: a voz, mais ~2 s de trilha sumindo depois da última palavra. O vídeo completo tem o clipe
(155,6 s), 0,6 s de quadro parado, a mixagem (581,5 s) e a música recomeçando sob a tela final (20 s):
**12:37,7** (757,7 s). A voz fala a 15,8 caracteres por segundo (159 a 181 palavras por minuto).

## Arquivos

- `tts/NN-nome.txt`: texto exato de uma geração no ElevenLabs. **Cada parágrafo é um bloco**:
  o parágrafo 4 de `02-o-que-tem-dentro.txt` é o bloco 02.4. O vídeo corta entre blocos, então não junte
  nem divida parágrafos sem atualizar as tabelas abaixo.
- `audio/letra-explicada-pt-br/mixagem.mp3`: **o som da explicação**, pronto: a narração inteira sobre a trilha,
  581,5 s. O vídeo usa o arquivo como ele é.
- `audio/letra-explicada-pt-br/NN-nome.mp3`: a voz de cada arquivo, com o mesmo nome, sem trilha. Já está dentro
  da mixagem; serve para achar os tempos das palavras (ver "Como foi montado").
- `audio/letra-explicada-pt-br/trilha-de-fundo.mp3`: trilha do Suno (204,8 s), em loop sob a voz. Também já está
  dentro da mixagem; serve para achar as batidas.
- `audio/pdoom-pt-BR.mp3`: a música, que toca no clipe e recomeça no fim da explicação.
- `data/narracao.pt-br.json`: blocos e palavras da narração, a grade de batidas da trilha e o volume da voz, em tempo
  da mixagem (ver "Como foi montado"). Gerado por `analysis/narracao.py`.
- `app/src/letra/`: o código da explicação.

**Estado atual:** o vídeo completo está montado, os 42 blocos (ver "Roteiro por bloco" e "Decisões de montagem").
Fica de fora só a figura do GPT-4 (ver "Imagens de fora"). Os sete MP3 de voz, `00-abertura` a `06-bastidores`, foram gerados a partir do texto atual,
conferidos por transcrição (todos batem com `tts/`) e aprovados na escuta. A `mixagem.mp3` foi refeita com eles
e é o som final da explicação: 9:41,5, os capítulos em sequência, sem pausas extras, começando em 0:00, 1:12,7,
2:21,0, 4:00,4, 5:35,7, 7:15,0 e 8:23,7. Não há outra mixagem a montar. Como a mixagem é fixa, o texto de `tts/`
também é: mudar uma palavra exige gerar a voz e a mixagem de novo.

## Geração no ElevenLabs

- Mesma voz e mesmas configurações em todos os arquivos. Aprove a voz com `00-abertura` antes de gerar o resto.
- O maior arquivo tem ~1.600 caracteres, abaixo dos limites do Eleven v3 (5.000) e do Multilingual v2 (10.000).
- O texto não tem marcações e funciona em qualquer modelo. Mantenha as linhas em branco entre parágrafos, mesmo que
  a voz não faça pausa maior neles: nas gravações atuais, a pausa entre parágrafos tem de 0,24 a 0,8 s (mediana
  0,28 s), igual à pausa entre frases. Há sempre um silêncio entre blocos, e é nele que a imagem troca de bloco.
- A primeira frase, "Você acabou de ouvir uma música de amor sobre o fim do mundo.", entra depois de um silêncio
  e dá o tom da explicação: calma, com um sorriso no fim. Gere algumas vezes e escolha a que soar mais natural.
- Em 06.5, "E esta voz, que você está ouvindo esse tempo todo? Também é I-Á. Loucura, né?" é a revelação do vídeo:
  a pergunta um pouco mais lenta, uma pausa curta antes de "Também é I-Á", e "Loucura, né?" rindo de leve.
  Vale gerar esse arquivo mais vezes que os outros até o final soar espontâneo.
- Ritmo: as gravações atuais saíram de 159 a 181 palavras por minuto, quase sem pausas, e foram aprovadas assim.
  A mixagem não acrescenta respiro entre blocos.

### Grafia para a voz

O texto escreve algumas palavras do jeito que devem soar. Na tela, use a grafia original.

| Na voz | Na tela |
|---|---|
| pê dum, dum | P(doom), doom |
| fum | FOOM |
| Lum | Loom |
| I-Á | IA |
| um ê trinta | 1E30 |
| Ília | Ilya |
| Clód | Claude |
| Opus cinco ponto cinco | Opus 5.5 |

As outras siglas (AGI, GPT-4, ChatGPT, MLP, CDR, RLHF, GLSL) ficam escritas como na tela: o ElevenLabs as lê melhor assim
do que soletradas. "Um ê trinta" e "pê dum" continuam escritos como soam, porque "1E30" pode sair "mil e trinta"
e os parênteses de "P(doom)" atrapalham a leitura; "o tê do GPT" e "o pê do GPT" nomeiam letras soltas.

Ouça estes nomes antes de aprovar cada arquivo: Clód (se soar estranho, tente "Claude"), After Effects, TypeScript,
John Searle, Lovecraft, shoggoth, Death Note, Sydney, New York Times, Roko, von Neumann, Lisp, DeepMind, OpenAI,
Nick Bostrom, Janus, Sutskever e Sam Altman.

## Roteiro por bloco

"Verso" é o verso da música que aparece na tela no começo do bloco (por conteúdo, como em `lyrics.get()`),
sem o som da música (ver "Cada verso"); a imagem do verso pode ser a cena original, uma versão remontada ou uma
animação nova.
"Imagem" descreve uma proposta, não uma obrigação: vale trocar por algo melhor, dentro das regras da segunda passada.
**Novo** marca animações que não saem de nenhuma cena existente. **Externa** marca imagens de fora
(ver "Imagens de fora").

### 00 · Tudo é código

| Bloco | Verso | Narração | Imagem |
|---|---|---|---|
| 00.1 | o fim do clipe (ver "A transição") | "Você acabou de ouvir uma música de amor sobre o fim do mundo." | O primeiro quadro, com as marcas de corte. Em "Você", a faísca desenha um coração num traço só; em "amor", ele se enche de laranja e bate duas vezes; na batida seguinte, vira a Terra, um globo pontilhado com o Atlântico de frente. Em "fim do mundo", ela racha a partir de um ponto e esquenta; no corte para 00.2, explode (ver "Como a explicação começa"). Ainda sem régua. **Novo.** |
| 00.2 | — | "E tudo que você viu no vídeo é código… No final, eu te mostro melhor." | Em "tudo que você viu", o clipe passa em flashes, um quadro por batida (o unicórnio, o FOOM, os olhos do shoggoth, os clipes se multiplicando). Em "é código", a faixa de raio X do `shoggoth` atravessa o último e o deixa desenhado pelo próprio código-fonte (`paperclips-glsl.ts`, rolando), com a imagem acesa nos caracteres; as marcas de corte saem. Em "Nenhum quadro foi…", essa imagem feita de código recua (mais escura, desfocada) e uma **tira de filme** entra pela direita: quatro quadros vazios, com as perfurações, e a legenda "NENHUM QUADRO FOI…". Cada jeito de fazer imagem é desenhado pela faísca num quadro quando a voz o nomeia, com o nome embaixo: um lápis e o risco que acabou de fazer ("desenhado à mão"), uma claquete que bate ("filmado"), um vídeo com as três estrelinhas das ferramentas de IA ("gerado por IA de vídeo"), uma linha do tempo de edição com o cursor andando ("programa de edição"); e cada quadro é riscado com um X laranja, de lápis de cera, quando a voz o nega. Em "nada de After Effects", "After Effects" é digitado embaixo e riscado. Em "São mais de", a tira sai pela esquerda e começa um voo por toda a listagem do clipe, arquivo por arquivo, com um contador grande no meio ("LINHAS DE CÓDIGO", "app/src · 57 arquivos"): ele acelera, passa de 20.000 em "vinte mil" e desacelera até pousar na contagem real (medida no próprio código), que pisca em laranja e fica até "TypeScript". O voo pousa em `open.ts`: em "TypeScript" e "GLSL", chamadas saem do fim das linhas, com colchetes na margem (o TypeScript em osso, o bloco `/* glsl */` em laranja); em "shaders", a câmera se aproxima do bloco GLSL e, ao lado, abre-se uma janela com o que ele desenha (a folha quadriculada do começo). Em "página web", tudo encolhe numa janela com `localhost:5173/?lang=pt-BR` e o clipe rodando dentro. Em "Escritas por", a janela se afasta e `// escrito por` é digitado; em "Clód Opus cinco ponto cinco", a faísca traça "Claude Opus 5.5" em Archivo, e o nome se preenche. Em "No final", a faísca sai do nome e corre até o fim da régua, que pisca. |
| 00.3 | — | "Mas antes, a letra… acabar com a humanidade." | A letra inteira, os 46 versos em três colunas, com o tempo de cada um. Em "esconde umas trinta referências", a faísca corre a régua de 0:00 a 2:35; cada verso por que ela passa acende, com a referência sublinhada em laranja, e um contador chega a 30 (as referências do guia da letra). Depois, um trecho do clipe para cada isca, e o cursor pula para onde ela está na música, com a etiqueta do capítulo que a explica: as grades do `prompt` Sydney fechando ("cap. 02 · Sydney"); a máscara, e a faixa de raio X revelando o monstro atrás do sorriso ("cap. 02 · shoggoth"); o laptop com a tela CENSURADO ("cap. 05 · Ilya"); um clipe que se duplica e, em "que poderia acabar com a humanidade", a treliça fechando em "NÃO TEM PRA ONDE ESCAPAR" ("cap. 04 · clipes"). |
| 00.4 | — | "Vamos parar em cada uma. Tem coisa na imagem que quase ninguém percebe." | O cursor volta a 0:00. Uma lente macro passeia, fora de foco, por detalhes que ainda vão aparecer, um por batida: a distribuição com "Claude, 0,12", uma etiqueta dos olhos do shoggoth, os adesivos do laptop. Em "quase ninguém percebe", a imagem encolhe até sumir na faísca em 0:00. |
| 00.5 | — | "Primeiro, o título… com essa chance de cair?" | *P*(doom) composto como no cartão final do `outro` e traçado pela faísca; em "Pê" e "dum", cada parte acende; em "probabilidade" e "ruína", uma chamada sob cada parte. Em "A chance…", a equação sobe e o mostrador de P(doom) do clipe aparece embaixo, sem conseguir parar num valor ("?", os dígitos correndo em "catástrofe"). Em "dois mil e vinte e três": "PESQUISA · OUT. 2023"; em "quase três mil pesquisadores", 2.778 pontos caem na tela, fileira por fileira, com o contador; em "pergunta parecida", a pergunta, citada em Cormorant. Em "Metade", metade dos pontos acende em laranja: "≥ 5%". Em "avião", os pontos voam para os 20 assentos de um avião pequeno, visto de cima, um deles laranja: "1 em 20 · 5% de chance de cair". Fonte na tela: Grace et al., 2024. |
| 00.6 | — | "No vídeo, esse número sobe… Vamos subir junto." | O mostrador de P(doom) do clipe, grande, em 0,02. Em "sobe a cada refrão", a faísca pula de refrão em refrão na régua, um por batida, e cada pulo mostra o número como o clipe o exibe (0,15, 0,42, 0,81, 0,999…). Em "junto", de volta a 0,02 e a 0:00. |

### 01 · P(doom) 0,02 · Faíscas

| Bloco | Verso | Narração | Imagem |
|---|---|---|---|
| 01.1 | "Vejo AGI faiscar no teu olhar," (a folha TikZ num plano mais aberto) | "O faiscar vem de um estudo… um clipe inteiro." | A folha TikZ vista de longe, com a construção inteira em time-lapse (eixos, compasso, unicórnio, a letra na coluna) e depois quase parada. Em "Faíscas", a primeira página do estudo desliza sobre ela, em papel osso: "arXiv:2303.12712 · março de 2023", *Sparks of Artificial General Intelligence: Early experiments with GPT-4* datilografado, os autores (Microsoft Research) e, como nota, "→ Faíscas de Inteligência Artificial Geral". Em "A AGI", as iniciais do título ficam laranja e "AGI · inteligência artificial geral" aparece na margem; em "capaz de fazer", uma figura: a barra da máquina cresce até a da pessoa ("tão bem quanto uma pessoa"). Em "GPT-4", sublinhado laranja; em "primeiros sinais", o S de *Sparks* pega fogo. Em "Um dos testes", a listagem TikZ do clipe, com o prompt "Desenhe um unicórnio em TikZ." no alto. Em "Saiu isto", a figura 1.3 do estudo — **placeholder marcado** ("IMAGEM EXTERNA · A INSERIR"), em papel. Em "Três anos depois": 2023 à esquerda, 2026 à direita, a caneta plotando o nosso unicórnio; em "uma I-Á", 2026 toma o quadro; em "um clipe inteiro", a câmera recua e o unicórnio vira um quadradinho num mosaico de 49 quadros do clipe. **Externa.** |
| 01.2 | "teus circuitos me dão medo," | "Circuitos também é termo técnico…" | O verso como o clipe o toca (os traços do unicórnio se reorganizando em trilhas de circuito, o tremor em "medo"). Em "conexões dentro da rede", a câmera mergulha nas trilhas e segue um pulso pelo circuito do corpo (a rota tirada da geometria do próprio `open`); em "fazem uma tarefa", o resto escurece e o circuito se isola: "circuito · conexões que, juntas, fazem uma tarefa". Em "interpretabilidade", a câmera recua e uma lente passa pelo desenho, ampliando, e rotula três circuitos: "detecta curvas", "detecta pernas", "detecta chifre?". Em "a gente sabe treinar", o desenho volta aos checkpoints do clipe (o de cinco patas) e retreina; de "muito melhor" a "funcionam", todos os outros circuitos ganham a etiqueta "???". |
| 01.3 | "Tua loss de treino despencou," | "E a loss é o erro…" | O gráfico como o clipe o desenha, o verso correndo na curva; em "erro", "loss = erro" pendurado na faísca. Em "fica parada por muito tempo", a câmera anda num trilho ao lado da faísca, um pouco à frente, e o verso já escrito fica para trás; um contador de passos de treino corre (3.000 → 31.000, "loss ≈ 0,5 · parada") e a chamada "platô" acompanha a faísca. Em "despenca", o mergulho em tempo real, com a câmera do clipe caindo junto até a paisagem de curvas de nível (e a nota do próprio clipe, "grokking (?) Δloss −99,9999%"). Em "Sem aviso", o mundo gira 180°, como em "dominou". |
| 01.4 | "ChatGPT, não me engole vivo, não." | "Aí chega o ChatGPT…" | O campo de prompt do clipe digitando "ChatGPT," com a distribuição em cima; em "Repare nos números em cima de cada palavra", o resto da linha corre, uma distribuição sobre cada palavra. Em "é assim que um modelo de linguagem escreve", a de "engole" vira um gráfico de barras em tela cheia ("p( próximo \| ChatGPT, não me ▮ )"); em "Uma palavra por vez", as barras viram uma faixa proporcional; em "sorteada", a faísca cai nela como bolinha de roleta e para em "engole". "engole · 0,44" e "treine com · 0,18" acendem quando são ditos. Em "E olha quem aparece", de volta à primeira palavra, e a faísca circula "Claude, 0.12" em "segundo lugar". |

### 02 · 0,15 · O que tem lá dentro

| Bloco | Verso | Narração | Imagem |
|---|---|---|---|
| 02.1 | "Aumento meu P(doom), / pois o futuro faz FOOM." (o refrão rola até 0,15) | "Fum é o som de uma explosão…" | O refrão do clipe, depressa, parando um instante no 0.15; depois "pois o futuro faz FOOM", a explosão ramificada e o FOOM. Na batida de "e o apelido", um gráfico em tela cheia: "explosão de inteligência", TEMPO × CAPACIDADE. Cada versão (v1, v2, v3…) é um ponto com galhos saindo dele, e o intervalo até a seguinte está anotado embaixo (8 meses, 4 meses, 2 meses, 1 mês, 2 semanas…); em "que melhora a si mesma", "cada versão faz a próxima — cada vez mais rápido". A faísca traça a curva, que vira exponencial e sai pelo alto do quadro, mais rápido do que a câmera consegue subir. |
| 02.2 | "Preso no quarto chinês, / cogumelos pra um mês." | "O quarto chinês…" | O quarto do clipe, com "John Searle · 1980". Em "Alguém que não sabe chinês", a planta do quarto vista de cima: a mesa, o manual de regras, estantes e alguém sentado ("alguém que não sabe chinês"); em "trancado", a porta se fecha com um cadeado laranja: TRANCADO. Em "responde perguntas", um cartão 你好吗？ entra pela fresta; em "seguindo um manual de regras", o manual folheia e a regra aparece ("SE VIR 你好吗？ ESCREVA 我很好。"); a resposta sai. Em "parece fluente", o carimbo FLUENTE ("visto de fora"), do lado de fora; em "não entende nada", o cartão vira: 我不懂 = eu não entendo. Em "uma máquina", a pessoa vira um chip e os cartões passam em fila, todos respondidos com um visto; em "entende alguma coisa?", um ponto de interrogação enorme. Em "E os cogumelos?", os dois segundos de ácido do clipe, e o quarto derrete. |
| 02.3 | "Desmascara o shoggoth infame" | "O shoggoth…" | A máscara do clipe em close ("Shoggoth · H. P. Lovecraft"). Em "Por dentro", a faixa de raio X passa e a câmera é puxada para trás: a máscara é um disco pequeno, preso a uma massa colossal. Em "Por fora", o detector do clipe marca a máscara: ASSISTENTE · AMIGÁVEL · PRESTATIVO · OK. Em "Guarda essa máscara", ela sai da cena e voa até o canto direito da régua, onde fica até 04.6. **Novo** (o ícone). |
| 02.4 | "com teus olhos de shinigami." | "Os olhos de shinigami…" | Os olhos se abrindo como no clipe, com as etiquetas na margem ("Death Note · Tsugumi Ohba e Takeshi Obata · 2003"). Em "o nome e o tempo de vida", a câmera vai à etiqueta SHINIGAMI e duas chamadas marcam o nome e o contador de vida. Depois, corte seco de um olho para o outro, cada um quando é nomeado, com a etiqueta do clipe e uma linha de explicação: BAJULAÇÃO ("concorda pra agradar"), EXPLORA RECOMPENSAS ("cumpre a meta do jeito errado"), ALINHAMENTO ENGANOSO ("finge estar alinhado no treino"), BUSCA PODER ("acumula recursos: servem pra qualquer meta"). Em "Não são piadas", de volta ao plano geral. |
| 02.5 | — | "E esse monstro não foi desenhado…" | A faixa de raio X atravessa a criatura e a deixa desenhada pelo próprio código (`shoggoth-glsl.ts`), como em 00.2. Em "É uma fórmula matemática", um diagrama visto de lado: a câmera, a fileira de pixels, e um raio por pixel avançando em passos até tocar a criatura (cada passo do tamanho da distância que a fórmula diz ser segura; no raio que está sendo traçado, o círculo dessa distância). Em "a forma", a silhueta que a fórmula descreve; em "a luz", a lâmpada e as normais nos pontos de contato; em "cada risco de hachura", a hachura se deposita na forma, mais densa longe da luz. Em "pixel por pixel", ao lado, o quadro verdadeiro do clipe sendo calculado em blocos, linha por linha. Em "Escrita pela I-Á", o código rolando, com a contagem medida: "shoggoth.ts + shoggoth-glsl.ts · 1.303 linhas". |
| 02.6 | "mas a singularidade começou." | "A singularidade… De papel." | O clipe: o buraco negro nascendo no O de "começou"; em "o que vem depois", a câmera cai nele e sai no vórtice. Em "E a música leva isso pro corpo", o verso "sinto meus átomos se rearranjando" se desfaz em pontos; em "Inclusive a gente", os pontos giram e formam VOCÊ; em "Olha no que a frase vira", os pontos formam o clipe, como no próprio clipe; a imagem segura em "De papel". |
| 02.7 | "Sydney, por favor, me solta." | "Sydney era o codinome…" | O `prompt` Sydney: "Bing," corrigido para "Sydney,". Em "Em dois mil e vinte e três", atrás de grades que fecham um pouco a cada batida, um recorte de jornal em papel osso: "THE NEW YORK TIMES · 16 FEV. 2023", a manchete datilografada, *A Conversation With Bing's Chatbot Left Me Deeply Unsettled*, "Por Kevin Roose" (sublinhado em "jornalista do New York Times"). Em "Daí o pedido: me solta", o clipe: o pedido digitado, as grades batendo e a resposta com o sorriso ("Você tem sido um bom usuário."). |

### 03 · 0,42 · Poder demais

| Bloco | Verso | Narração | Imagem |
|---|---|---|---|
| 03.1 | "Aumento meu P(doom), / ouço o basilisco: BUM!" (o refrão rola até 0,42) | "O basilisco de Roko…" | O refrão até 0.42 e o olho da serpente abrindo em BUM!, como no clipe. Em "experimento mental da internet", "Basilisco de Roko · LessWrong · 2010". Em "uma superinteligência do futuro", a câmera avança até a pupila em fenda e, no escuro dela, uma lista se datilografa: "QUEM FICOU SABENDO: 01 Roko · julho de 2010, 02 os leitores do LessWrong, 03 quem leu os comentários…". Em "E você acabou de ouvir", a lista ganha a linha "07 você", em laranja, e a câmera dá um passo para dentro; em "Foi mal", uma nota de rodapé: "* foi mal.". |
| 03.2 | "NVIDIA pra Lua: ZUM! / Ponto Ômega em três, dois, um. / Um E trinta FLOPs por segundo," | "Um ê trinta flops…" | O verso em time-lapse do clipe (a cédula da NVIDIA, o Ponto Ômega) até o odômetro rolando até 1 seguido de trinta zeros, sob "um seguido de trinta zeros de contas". Em "Em um segundo", um voo por uma régua logarítmica, de 10⁰ a 10³⁰ em menos de um segundo, que pousa em "1 segundo · a 1E30 FLOP por segundo". Em "dezenas de milhares de vezes", um arco volta até 2 × 10²⁵: "× 50.000"; em "o treino inteiro do GPT-4", o marcador "GPT-4 · treino inteiro ≈ 2E25", com a fonte na tela (Epoch AI). **Novo.** |
| 03.3 | "MLP: vai, volta, repetição," | "MLP…" | O anexo B do `bureau`, com as palavras do verso acendendo junto com a voz ("vai", "volta", "repetição"). Depois, a rede em papel, maior: em "A informação vai", pulsos laranja atravessam as camadas; em "sai uma resposta", a saída acende: → resposta: "gato". Em "O erro volta", ← erro: era "cachorro", e pulsos escuros voltam camada por camada; em "ajustando cada conexão um pouquinho", as conexões engrossam ou afinam ("cada conexão: um pouquinho mais grossa ou mais fina"). Em "E repete", o ciclo de novo, com um contador de passos; em "milhões de vezes", cada vez mais rápido, até virar um borrão ("1.000.000+"). Uma curva de loss no canto cai um degrau por ciclo e despenca em "É isso que faz a loss despencar". |
| 03.4 | "von Neumann já virou peça de coleção." | "John von Neumann… risca de laranja." | O apêndice C do `bureau`, antes do risco ("John von Neumann · 1903–1957"). Em "Se até ele virou peça de coleção", a folha está atrás do vidro de uma vitrine de museu, desenhada em linha fina, com a etiqueta "JOHN VON NEUMANN · 1903–1957 · arquitetura de computador, 1945 · peça de coleção". Em "imagina o resto de nós", a câmera passa para a vitrine ao lado, vazia: "O RESTO DE NÓS · — · em breve". Em "E tem mais", o diagrama sai da vitrine; as caixas têm os nomes do relatório de 1945 (órgão de controle, órgão aritmético, memória, entrada, saída) e, em "o aparelho em que você vê este vídeo", ganham à mão, em laranja, os nomes de hoje: processador, memória RAM, toque e câmera, tela e som. Em "É ela que o vídeo risca de laranja", o X laranja do clipe. |
| 03.5 | "Guinada à esquerda, já tá sem freio," | "A guinada à esquerda…" | A guinada do clipe, sincronizada com "esquerda". Depois, um mapa visto de cima: uma estrada reta, "COMPORTAMENTO DESEJADO", a faísca andando nela; ao lado, um medidor de CAPACIDADE, baixo ("fraca · bem-comportada"). Em "num salto de capacidade", o medidor salta; em "o bom comportamento fique pra trás", a faísca vira 90° à esquerda e sai da estrada, e a câmera gira junto (whip). Em "Evitar isso é o trabalho do alinhamento", de volta à estrada, que ganha guard-rails laranja, ALINHAMENTO; em "fazer a I-Á querer o que a gente quer", eles acabam logo adiante: "FIM DA PROTEÇÃO". |
| 03.6 | "sem um só CDR no meio." | "CDR é piada dupla…" | O Gantt do clipe, com o CDR piscando vazio. Em "No Lisp", uma sessão de Lisp digita `(cdr '(a b c))` e a lista aparece em células (a → b → c), com "cabeça (car)" e "resto (cdr)"; "Lisp · John McCarthy · 1958". Em "pega o resto de uma lista", a célula "a" cai e sai `(B C)`. Em "Na engenharia", o Gantt de volta; a nota do próprio clipe, "* CDR: revisão crítica de projeto", entra em "revisão", e o carimbo "SITUAÇÃO: NÃO REALIZADA" em "No vídeo". **Novo** (o Lisp). |
| 03.7 | "Gato, por favor, não solta a minha mão." | "E Gato, sim, esse é o nome…" | O `prompt` Gato digitando "Gato," com as candidatas. Em "é um modelo da DeepMind", uma grade de 604 células, uma por tarefa, com os nomes em Plex Mono minúsculo ("Gato · DeepMind · 2022"); acendem as conversas em "conversava", os jogos de Atari em "jogava videogame", o braço robótico em "mexia um braço robótico", e depois todas: "604 tarefas · uma rede". Em "Com Sydney, o pedido era me solta", a tela se divide: à esquerda, o pedido de Sydney atrás das grades ("SYDNEY · 2023"); em "Agora é: não solta a minha mão", à direita, o de Gato com as letras se afastando ("GATO · 2022"), que toma o quadro. |

### 04 · 0,81 · Clipes de papel

| Bloco | Verso | Narração | Imagem |
|---|---|---|---|
| 04.1 | "Aumento meu P(doom), / tudo vira clipe, um a um." (o refrão rola até 0,81) | "Chegamos à fábrica de clipes do começo…" | O refrão até 0.81 e a faísca dobrando no primeiro clipe, como no clipe. Em "Imagine uma superinteligência com uma única meta", `meta: maximizar(clipes)` digitado no alto; em "fazer o máximo de clipes", um clipe vira dois, quatro, oito… a cada batida, a câmera recuando e um contador subindo; "constrói fábricas, busca metal, energia" viram três linhas do plano. Em "Até perceber", um planeta feito de clipes, girando: "planeta: 6 × 10^24 kg de átomos"; em "e a gente", "você: ~7 × 10^27 átomos", em laranja; em "poderiam virar clipe", o planeta fica laranja de um lado ao outro. Em "Ela não precisa odiar ninguém", um clipe só, parado; em "Basta que a gente não esteja entre as coisas que ela quer preservar", a lista "COISAS A PRESERVAR: 01 clipes". "Nick Bostrom · 2003". |
| 04.2 | "Quem desliga foi viajar, / não tem pra onde escapar." | "E o botão de desligar?…" | O verso do clipe (a resposta automática, NÃO TEM PRA ONDE ESCAPAR). Em "Tem um meme", um anúncio de vaga em papel osso, sem logotipo: VAGA · "Engenheiro(a) do botão de desligar", "US$ 300–500 mil por ano"; em "vaga falsa", o carimbo "SÁTIRA · 2023"; em "Requisito", "• ter paciência • saber tirar coisas da tomada • bônus: jogar um balde d'água nos servidores" e a nota "Anúncio satírico que circulou em 2023. A OpenAI não publicou esta vaga.". Em "Mas a pergunta é séria", um interruptor grande, LIGADO; o cursor do fim do clipe vai até ele e, a cada tentativa, o interruptor escorrega para o lado. Em "desligada", "desligada → meta: 0 clipes / logo: continuar ligada". Em "Na música, o engenheiro foi viajar", a resposta automática do clipe, de perto. **Novo.** |
| 04.3 | "Já acendemos o estopim," | "Agora, repara no ponto laranja…" | O estopim do clipe queimando; em "repara no ponto laranja", a câmera se aproxima e um círculo envolve a faísca. Depois, corte casado na faísca: ela fica parada no centro do quadro, dentro do círculo, enquanto o mundo em volta troca a cada frase, com o tempo da música ao lado — o unicórnio ("desenhou", 0:04), a curva da loss ("traçou", 0:10), o preço da NVIDIA ("virou o preço na bolsa", 1:02), o primeiro clipe ("dobrou", 1:37), o estopim ("É a faísca de um estopim", 1:44) e, em "Aceso desde o primeiro segundo", a ignição no começo do clipe (0:01), enquanto a régua inteira acende como estopim. |
| 04.4 | "tese da ortogonalidade: um blues sem fim." | "A tese da ortogonalidade…" | O verso como o clipe o canta. Em "diz que", um gráfico em papel quadriculado: INTELIGÊNCIA → e OBJETIVOS ↑ (fazer clipes, ajudar pessoas, ganhar no xadrez, maximizar ações, contar grãos de areia, ???), com mentes espalhadas por todo ele — qualquer objetivo em qualquer nível. Em "Ser genial não garante boas intenções", a faixa da direita acende, com todos os objetivos dentro dela. Em "brilhante", a faísca marca "muito inteligente · só quer clipes" e depois "pouco inteligente · quer ajudar". Em "O blues", a corda do clipe se dobrando com a afinação real da voz, com a legenda "a corda segue a afinação real da voz". |
| 04.5 | "“Só transformers, é simples assim!” / Até que aprendeu a dizer “não” pra mim." | "Só transformers?…" | A queda pela pilha do clipe, parando num bloco. Em "É a arquitetura", o bloco se abre em vista explodida, com as partes rotuladas (atenção multi-cabeça, soma e normaliza, rede feed-forward) e as conexões residuais ("UM BLOCO TRANSFORMER · × DEZENAS, EMPILHADOS"). Em "o tê do GPT": GPT, com o T laranja, e "Generative Pre-trained **Transformer**". Em "Mas conhecer a arquitetura não é saber o que ela vai aprender", as partes se enchem de números ilegíveis: "o que ela aprende: bilhões de números". Em "Nem se vai obedecer", o clipe: o bloco gira e sai do alinhamento, NÃO PRA MIM. |
| 04.6 | "Pós-Chinchilla, superdenso, / pula a cerca sem bom senso. / Cem mil GPU, / RLHF deu chabu." | "E a máscara do shoggoth?…" | O verso remontado em ~2 s (a letra comprimindo, a cerca quebrando, a grade de GPUs). Em "E a máscara do shoggoth?", a máscara sai do canto da régua e volta, grande. "RLHF · aprendizado por reforço com feedback humano". Em "pessoas avaliam as respostas", respostas entram e recebem carimbos +1 e −1; a cada +1 o sorriso da máscara se abre mais, e a RECOMPENSA sobe. Em "Lembra da etiqueta bajulação?", a etiqueta de 02.4 volta, BAJULAÇÃO 0.91, em volta da máscara. Em "o modelo aprende a agradar, não a acertar", a resposta verdadeira ("Seu código tem um bug na linha 12.") leva −1 e a bajuladora ("Seu código está perfeito!") leva +1 ("Sharma et al. · 2023"). Em "Se isso dá chabu, a máscara escorrega", o clipe: a mesa inclina, a máscara rola e para de ponta-cabeça. |

### 05 · 0,99 · O que Ilya viu

| Bloco | Verso | Narração | Imagem |
|---|---|---|---|
| 05.1 | "Aumento meu P(doom), / como previu o Loom." (o refrão rola até 0,999…) | "Lembra dos números em cima das palavras?…" | O refrão até 0.999… e "como previu o Loom", como no clipe. Em "Lembra dos números em cima das palavras?", as barras de 01.4 voltam ("ChatGPT, não me" → engole 0,44, apague 0,21, treine com 0,18); em "mostra as outras escolhas", elas giram e viram galhos saindo da última palavra; em "várias continuações pro mesmo texto, como galhos de uma árvore", cada galho brota as suas continuações ("vivo, não.", "meus dados.", "os meus textos."…). Em "Com ela, alguém que assina como Janus", a árvore do `loom` do clipe, de perto, com "Loom · Janus · 2021". |
| 05.2 | "Do pré-treino preditivo / ao auto-upgrade recursivo." | "No pré-treino…" | O verso com as palavras saindo das tarjas [MASK], como no clipe. Em "o pê do GPT", GPT com o P laranja e "Generative **Pre-trained** Transformer". Em "o modelo só aprende a adivinhar a próxima palavra", frases com a última palavra sob um bloco [MASK] que se abre no palpite ("O gato subiu no telhado", "A capital do Brasil é Brasília"…), cada vez mais rápido; em "Bilhões de vezes", um fluxo borrado de frases e um contador. Em "O verso imagina o passo seguinte", a recursão do clipe (auto-upgrade); em "A explosão de inteligência, de volta", um segundo do FOOM de 02.1. |
| 05.3 | "O que Ilya viu? Nunca vamos saber." | "Ília Sutskever…" | O laptop do clipe visto por trás ("Ilya Sutskever · cofundador da OpenAI"). Em "demitir Sam Altman", a cena escurece e uma linha do tempo se datilografa por cima: "OPENAI · NOVEMBRO DE 2023", "17 nov. 2023 · Altman demitido"; em "Dias depois", "22 nov. · de volta". Em "E a internet perguntou", o clipe: a tela CENSURADO e "O que Ilya viu?". Em "Uma superinteligência escondida?", de volta para trás da tampa, e os adesivos ganham chamadas: SINTA A AGI ("o grito dele na festa da OpenAI, 2022"), Q* ("o boato de nov. de 2023"), LEVEMENTE CONSCIENTE ("um tuíte dele, fevereiro de 2022"). |
| 05.4 | — | "Mas nessa, a letra envelheceu…" | A tela CENSURADO de perto. Em "um depoimento do Ília", a tarja CENSURADO se descola e, por trás dela, há papel: a capa do depoimento em papel osso ("Elon Musk v. Samuel Altman et al.", "DEPOIMENTO DE ILYA SUTSKEVER", "tomado em 1º de outubro de 2025 · divulgado em novembro de 2025"). Em "não é uma máquina secreta", "P. O que você viu? R. —" e "uma máquina secreta", riscado em laranja. Em "É um memorando de cinquenta e duas páginas", a pilha de páginas se abre em leque: "MEMORANDO · CONFIDENCIAL · 52 PÁGINAS", "Para: conselheiros independentes · De: Ilya Sutskever · Assunto: a conduta de Sam Altman", com os itens quase todos tarjados. Em "Menos ficção científica", um carimbo FICÇÃO CIENTÍFICA, riscado; em "Mais novela corporativa", o carimbo laranja NOVELA CORPORATIVA. **Novo.** |
| 05.5 | "Foi tudo só pra inglês ver?" | "Quanto das promessas…" | O teatro vazio do clipe, o holofote sobre o nada, a pergunta no proscênio; as cortinas fecham na última palavra. |

Depois de 05.5, a mixagem passa direto para 06.1, sem pausa para o cartão final do `outro`. O contador quebra
no fim de 06.1 (abaixo).

### 06 · Como uma IA fez este vídeo

| Bloco | Verso | Narração | Imagem |
|---|---|---|---|
| 06.1 | — | "Máquinas que aprendem rápido…" | A régua se apaga no primeiro corte: a letra já foi explicada. Quatro planos remontados do clipe, um por trecho da frase: a loss despencando ("que aprendem rápido"), o quarto chinês com os cartões saindo da fresta ("que a gente mal entende"), a máscara sorrindo ("que sorriem por fora"), o clipe se duplicando ("cujos objetivos ninguém garante"). Em "É disso que a música fala", o cartão final do `outro`, de "= ∞" até "NaN¹ · estimativa não mais definida", comprimido em ~2 s. O contador quebra sem explicação. |
| 06.2 | — | "E a promessa do começo…" | Em "como uma I-Á fez este vídeo?", a pergunta em tipografia. Em "Não foi com um prompt só", um campo de prompt digita "faça um clipe pra essa música" e ele é riscado: "não foi assim". Em "O clipe original, em inglês", o repositório: "github.com/mexicat/pdoom-video · Giacomo Magnanini + Claude Opus 5.5 · setembro de 2026" e o primeiro commit (c4299a2 "I'm Upping My P(doom): code-rendered music video"). Em "cena por cena", um ciclo de quatro estações — descreve a ideia → a IA escreve o código → ele assiste → pede ajustes —, cada uma acendendo na sua palavra, a faísca correndo entre elas; ao lado, os ajustes que o `TREATMENT.md` registra (rev. 2: saiu o olho humano realista; rev. 4: marcas de corte só nas pontas; rev. 5: adesivos um terço mais escuros…), que acendem em "pedia ajustes". |
| 06.3 | — | "O truque é que cada quadro é uma função do tempo…" | `quadro = render(t)` em tipografia, com t correndo. Em "Você dá o segundo exato da música", a régua volta, desenhando-se, e vira o controle: a faísca arrasta t para a frente e para trás pelo clipe, e o quadro acima acompanha, com `render(47,99)` embaixo e uma linha ligando o quadro ao cursor. Em "Sempre a mesma", o mesmo t duas vezes, lado a lado, com um "=" laranja. Em "pausar", o símbolo vira pausa; em "voltar", a faísca recua; em "desenhar por cima", o quadro se separa em três folhas de vidro: o clipe, os desenhos da explicação, a régua. A régua se apaga com o fim do bloco. **Novo.** |
| 06.4 | — | "A letra, não…" | Créditos em tipografia: "A letra foi escrita por gente." — LETRA: osmarks, MusicPerson e o Discord da EleutherAI; + Claude (o final e o último refrão), em laranja, em "Com uma ajudinha do próprio Clód"; MÚSICA: Suno, versão "Claude-Pop" de deckard; VOZ: ElevenLabs; VERSÃO EM PORTUGUÊS: O Programador Real. |
| 06.5 | — | "E tem uma ironia aqui… Loucura, né?" | A máscara, grande, de frente, sorrindo e respirando. Em "Foi esse tipo de I-Á que escreveu o código deste vídeo", `// o assistente simpático escreveu este código`; em "inclusive o do monstro", ela gira e mostra, no verso, o código do shoggoth (`shoggoth-glsl.ts`). Em "E o roteiro", o texto deste bloco, de `tts/06-bastidores.txt`, em Plex Mono, com as palavras já ditas acesas; em "Inclusive esta frase", a frase acende em laranja palavra por palavra enquanto é dita. Em "E esta voz", a forma de onda desta própria fala (medida na gravação), desenhada pela faísca, com a etiqueta "VOZ SINTÉTICA · a forma de onda desta frase"; em "Loucura, né?", a onda se curva no sorriso da máscara. **Novo.** |
| 06.6 | — | "Talvez o fim do mundo que a música canta… E o porquê." | Um campo de prompt vazio ("PROMPT 04 · VOCÊ"), o cursor piscando. Em "Então me diz", digita-se "Meu P(doom) é "; em "subiu ou desceu?", uma distribuição de próximos tokens aparece sobre o cursor: depende 0,34, 5% 0,27, 50% 0,18, ??? 0,21. Em "Deixa o seu número nos comentários", "O SEU NÚMERO VAI NOS COMENTÁRIOS". |
| 06.7 | — | "E agora, ouve de novo…" | O primeiro quadro do clipe, com as marcas de corte, e a régua de volta, em 2:35; em "ouve de novo", a faísca volta de 2:35 a 0:00. Quando a mixagem acaba, a pausa vira play, a régua se apaga e o clipe recomeça com a música, sob a tela final do YouTube (ver "Como a explicação termina"). |

## Decisões de montagem

O que mudou em relação à proposta, e por quê (as tabelas acima já descrevem o vídeo montado).

**Geral**

- A régua é desenhada no HUD, não na cena: fica firme sob os tremores, zooms e franjas de cor das cenas do clipe.
- O tempo da música aparece como "▮▮ 0:00 / 2:35" embaixo da ponta esquerda, em vez de "0:00" e "2:35" nas pontas: na ponta esquerda, os dois rótulos e a pausa se amontoavam sobre o cursor.
- O verso de cada bloco fica acima da régua, à esquerda, durante o bloco inteiro: é a âncora fixa de "onde estamos na música", mesmo quando a imagem é nova.
- Os cortes entre blocos caem na primeira batida da trilha dentro do silêncio entre os parágrafos; sem batida no silêncio, num golpe forte da percussão; sem os dois, a 40% do silêncio.
- A grade de batidas vem das batidas rastreadas da trilha, não de um andamento fixo: a trilha do Suno oscila até ~70 ms contra uma grade rígida.

**00 · Tudo é código**

- 00.1: no lugar do quadro preto parado, a frase ganha imagem: o coração em "amor", a Terra que racha em "fim do mundo" e explode no corte para 00.2 — quase 4 s de preto a menos.
- 00.1–00.2: a régua não aparece no começo; ela entra em "inteligência artificial", pouco antes de ser usada ("No final", 00.3). Antes, ela só atrapalhava os flashes e o código.
- 00.2: em "tudo que você viu", flashes do clipe no lugar do quadro parado — ilustram a frase e evitam 2 s de preto.
- 00.2: o raio X deixa a imagem feita do próprio código (os caracteres acesos pela imagem), em vez de trocá-la pelo código — a cena continua reconhecível.
- 00.2: as negações ("desenhado à mão, filmado, gerado, programa de edição") viraram uma tira de filme com quatro quadros, um por jeito de fazer imagem, cada um desenhado pela faísca e riscado com um X quando a voz o nega. A primeira versão, uma ficha técnica em papel com zeros e um carimbo, ficava pequena e burocrática sobre o código; a tira é um "quadro" de verdade, e cada negação vira um gesto.
- 00.2: o contador conta todas as linhas do clipe (`app/src` sem a pasta da explicação), medidas no próprio código, em algarismos grandes que só sobem: acelera até 20.000 em "vinte mil" e desacelera até a contagem real. O odômetro do `ascent`, que estava ali antes, girava tão rápido que os dígitos pareciam aleatórios.
- 00.2: o GLSL aparece ao lado do que desenha (a folha quadriculada), e a "página web" é uma janela com o endereço do servidor de desenvolvimento e o clipe rodando dentro.
- 00.2: "No final, eu te mostro melhor": a faísca corre do nome até o fim da régua — o "final" é o fim da explicação.
- 00.3: as ~30 referências são as do guia da letra, sublinhadas numa folha com a letra inteira enquanto a faísca varre a régua; as iscas são trechos do clipe remontados, cada um com o cursor no seu verso e a etiqueta do capítulo — mostram onde cada isca vai ser paga.
- 00.4: sem a pausa de meio segundo depois de "Claude, 0,12" (fica para 01.4); a lente termina encolhendo a imagem até a faísca em 0:00.
- 00.5: em "A chance de a IA causar uma catástrofe", o mostrador de P(doom) do clipe sem conseguir parar num valor — a definição vira imagem, sem repetir a frase na tela.
- 00.5: o avião é um mapa de 20 assentos visto de cima, um laranja ("1 em 20") — 5% vira algo que se enxerga.
- 00.6: os números de cada refrão aparecem como o clipe os mostra (quadros das cenas `hook`), um por batida, com o cursor pulando.

**01 · Faíscas**

- 01.1: a folha TikZ abre em time-lapse de longe (câmera nova para o `open`, parâmetro opcional) — o verso inteiro se monta em menos de um segundo, sem cantar.
- 01.1: em "A AGI é uma máquina capaz de fazer quase qualquer tarefa…", uma figura no próprio estudo (a barra da máquina alcançando a da pessoa), no lugar de uma chamada que repetiria a frase.
- 01.1: o S de *Sparks* pega fogo em "primeiros sinais" — a faísca do clipe nasce do título do estudo.
- 01.1: a figura do GPT-4 é um placeholder marcado até a imagem entrar (ver "Imagens de fora").
- 01.1: o mosaico usa 49 quadros do clipe inteiro, renderizados uma vez; o unicórnio é o quadro do centro, ao vivo.
- 01.2: o pulso segue a rota real do circuito do corpo, calculada com a geometria do `open`, e a lente é uma segunda renderização do clipe, mais próxima, recortada num círculo.
- 01.2: em "a gente sabe treinar", o desenho volta aos checkpoints do clipe — "treinar" vira imagem.
- 01.3: o trilho vai um pouco à frente da faísca, olhando para trás: de trás para frente, as letras do verso escrito na curva enchiam o quadro.
- 01.4: sem o popup "crescendo": corte seco na batida para as barras em tela cheia, que a leitura pede grandes; os valores seguem o clipe (`prompt-data.ts`).
- 01.4: a faísca circula a linha inteira de "Claude, 0.12", com o número — é o que dá o "segundo lugar".

**02 · O que tem lá dentro**

- 02.1: o gráfico das versões usa intervalos que caem pela metade (8 meses, 4 meses, 2 meses…) — "cada vez mais rápido" sem precisar de número real; a curva escapa da câmera pelo alto do quadro.
- 02.2: a planta do quarto é um diagrama novo (em vez de remontar o `room` em 3D): a sequência pergunta → regra → resposta pede uma vista de cima, e a planta mostra ao mesmo tempo o dentro e o fora (FLUENTE).
- 02.2: em "uma máquina que responde tudo certo", a pessoa vira um chip na mesma planta — a pergunta do experimento vira imagem.
- 02.3: a máscara sai da cena com um parâmetro opcional do `shoggoth` (`remix.hideMask`) e voa até a régua como desenho 2D; fica lá como ícone até 04.6.
- 02.4: as etiquetas das explicações usam os olhos do próprio clipe e as etiquetas que ele já traz (BAJULAÇÃO, EXPLORA RECOMPENSAS, ALINHAMENTO ENGANOSO, BUSCA PODER); a cena fica parada antes de o clipe começar a fechar os olhos.
- 02.5: a fórmula é mostrada como um diagrama de *sphere tracing* em 2D, com uma forma que imita a criatura, e o quadro real é calculado em blocos ao lado — a explicação e a prova lado a lado.
- 02.6: sem o clipe se formando por conta própria em "Inclusive a gente": os pontos formam VOCÊ primeiro, e só depois o clipe — a piada da frase fica na imagem.
- 02.7: a legenda do "You have not been a good user" disputaria com a voz: fica só a resposta do próprio clipe, e a frase vai para a descrição.

**03 · Poder demais**

- 03.1: a lista de quem ficou sabendo está numa caixa escura dentro da pupila, e não refletida nela — sobre a íris laranja do clipe, só assim se lê.
- 03.2: as legendas da NVIDIA e do Ponto Ômega saíram: a voz fala de FLOPs desde a primeira palavra, e as duas disputariam com ela. Vão para a descrição do vídeo.
- 03.2: a régua logarítmica é nova (não a do `outro`): o voo de 10⁰ a 10³⁰ e o arco "× 50.000" pedem uma escala só de potências de dez.
- 03.3: a rede é redesenhada em papel, grande, no estilo do anexo B; a resposta errada ("gato" em vez de "cachorro") dá nome ao erro que volta.
- 03.4: uma segunda vitrine, vazia, para "imagina o resto de nós" — a piada da frase vira imagem.
- 03.4: os nomes de 1945 ("órgãos", como no relatório de von Neumann) recebem à mão os nomes de hoje, em vez de trocarem: fica claro que é a mesma arquitetura.
- 03.5: o mapa é novo, visto de cima, com a estrada vertical (em vez do mapa do `leftturn`): a guinada e o guard-rail que acaba pedem uma estrada reta e longa.
- 03.6: a chamada "CDR · revisão crítica de projeto" é a nota que o próprio clipe já traz, trazida para o momento da voz.
- 03.7: a grade tem 604 células com nomes ilustrativos (conversa, legenda, jogos de Atari, braço robótico, simulações); a proporção entre eles não é a do artigo.
- 03.7: na tela dividida, cada lado é o clipe como ele é (as grades de Sydney, as letras de Gato se afastando), com o ano de cada um.

**04 · Clipes de papel**

- 04.1: no lugar do voo pela treliça, um clipe que dobra a cada batida (1, 2, 4… 4.096) e um planeta feito de clipes — o "máximo de clipes" e o "planeta, e a gente" viram números e imagem.
- 04.1: "Basta que a gente não esteja entre as coisas que ela quer preservar" virou uma lista com uma linha só ("01 clipes").
- 04.2: o interruptor foge do cursor três vezes, uma a cada parte da frase; a meta aparece como raciocínio ("desligada → meta: 0 clipes / logo: continuar ligada").
- 04.3: o corte casado usa as posições da faísca medidas nos quadros do próprio clipe; cada plano mostra o tempo da música, e o último volta ao primeiro segundo.
- 04.4: o gráfico é novo, com objetivos nomeados no eixo, para que "inteligência e objetivos são independentes" se veja; a legenda da corda fica no plano do clipe.
- 04.5: em vez de o bloco "girar", o clipe segue do ponto em que o bloco sai do alinhamento ("NÃO PRA MIM"); a vista explodida mostra que conhecer as peças não diz nada sobre os números.
- 04.6: das três legendas do verso (Chinchilla, cercas, cem mil GPUs), nenhuma entrou: disputariam com a voz, que começa logo. Vão para a descrição do vídeo.
- 04.6: a bajulação é mostrada com um exemplo (a resposta verdadeira punida, a bajuladora premiada), com a fonte na tela.

**05 · O que Ilya viu**

- 05.1: as barras de 01.4 viram galhos desenhados, num diagrama novo, antes de a árvore do clipe aparecer: sem isso, a ligação "números em cima das palavras" → Loom ficava só na voz.
- 05.2: as frases mascaradas são exemplos em português, uma atrás da outra, acelerando; o "P" de GPT repete o gesto do "T" em 04.5.
- 05.3: a linha do tempo da demissão fica por cima do laptop escurecido, e as legendas dos adesivos entram só em "Uma superinteligência escondida?", em que a pergunta pede os boatos.
- 05.4: a tarja CENSURADO do clipe se descola e revela o depoimento — o mistério do clipe vira documento; os itens do memorando ficam tarjados porque o conteúdo não é público por inteiro.
- 05.5: o clipe como é, em câmera lenta, para as cortinas fecharem na última palavra.

**06 · Como uma IA fez este vídeo**

- 06.1: os quatro planos são trechos do clipe como ele é, só com o tempo remapeado; o cartão final é o do `outro`, acelerado.
- 06.1: a régua sai aqui: o capítulo 06 fala de como o vídeo foi feito, não da letra. Por isso o NaN não acende mais nela, e a ponta dela não pisca em 06.2. Ela volta só em 06.3 (o controle do tempo) e em 06.7 (voltar a 0:00 e dar play).
- 06.2: no lugar do `git log` rolando: o repositório original tem só 11 commits (o primeiro já é o clipe inteiro), então o processo "cena por cena" é mostrado como um ciclo, com os ajustes reais registrados nas revisões do `TREATMENT.md`.
- 06.3: sem as barras com as linhas de cada arquivo (a contagem já está em 00.2); a régua vira o controle do tempo, e as "camadas" são três folhas deslocadas em diagonal, sem perspectiva 3D.
- 06.4: os créditos seguem o README (letra, música, voz, versão em português); o Claude aparece em laranja na linha da letra, na palavra "Clód".
- 06.5: a forma de onda é a da própria gravação: o envelope da voz foi medido e salvo em `data/narracao.pt-br.json` (`env`).
- 06.6: o campo de prompt é desenhado de novo (não é a cena `prompt`, que digita a letra no tempo da música), com a mesma linguagem.
- 06.7: o quadro fica parado de propósito: é o primeiro quadro do clipe, o mesmo em que a explicação começou, e o que se move é a faísca voltando a 0:00.

## Cortes possíveis

A mixagem é fixa, então cortar um bloco exige refazê-la (e refazer os tempos da narração). Não é para a primeira
montagem. Se ainda assim for preciso encurtar, estes blocos saem sem quebrar nenhum gancho:

| Bloco | Observação |
|---|---|
| 02.5 o monstro é uma fórmula | 06.3 e 06.5 ainda cumprem a promessa. |
| 04.5 transformers | 05.2 funciona sozinho. |
| 03.2 FLOPs | Nvidia e Ômega vão para a descrição do vídeo. |
| 04.3 o ponto laranja | Último recurso: é o ponto alto da segunda metade. |

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
  **Ainda não está no repositório:** o vídeo mostra um placeholder marcado ("IMAGEM EXTERNA · A INSERIR"),
  desenhado por `drawFigurePlaceholder` em `app/src/letra/c01.ts`, em 01.1, de "Saiu isto" até "Três anos depois".

O resto é refeito em tipografia: primeiras páginas de estudos, a manchete do NYT, o anúncio satírico
e o depoimento.

## Como foi montado

O código da explicação está em `app/src/letra/`; o clipe continua em `app/src/scenes/` e só ganhou parâmetros
opcionais (abaixo). Para ver e renderizar, ver "Prévia e renderização".

- **Som.** O áudio do vídeo inteiro é uma emenda, sem mixagem nova (`soundtrack.ts`): a música do clipe (0–155,6 s,
  com o mesmo fade de 1,25 s do clipe), 0,6 s de silêncio, a `mixagem.mp3` como ela é, a partir de 156,2 s, e a música
  de novo do 0:00, por 20 s, sumindo nos últimos 2,5 s. A prévia toca os três trechos em sequência; o render monta a
  emenda com `atrim` e `concat` do ffmpeg (conferido: a mixagem começa em 156,2 s com erro de 0 ms).
- **Tempos da narração** (`analysis/narracao.py`, gravados em `data/narracao.pt-br.json`). Cada MP3 de voz foi alinhado
  ao texto de `tts/` com CTC `MMS_FA`, num único Viterbi por capítulo (o mesmo `ctcalign.py` da letra), com a pronúncia
  das siglas escrita como soa ("AGI" → "a ge i"). O início de cada capítulo na mixagem é a soma das durações dos MP3,
  e foi conferido por correlação da voz com a mixagem: diferença de 0,0 a 0,1 ms nos sete capítulos. Os blocos
  e as palavras estão em tempo da mixagem; `narration.ts` os converte para o tempo do vídeo. Os números por extenso
  ("dois mil e vinte e três") e "cinco ponto cinco" têm confiança baixa no CTC, mas caem no lugar certo na forma de
  onda; nenhuma mudança de imagem depende da sílaba exata deles. O arquivo guarda também o volume da voz a 50 quadros
  por segundo (`env`), usado em 06.5.
- **Batidas.** A correlação da mixagem com a trilha mostra a introdução uma vez e depois o laço da parte estável
  (12,427–174,880 s) a cada 162,453 s: as emendas estão em 174,88, 337,33 e 499,79 s da mixagem. O laço tem exatamente
  368 batidas (23 frases de 4 compassos) a 135,9 BPM. A trilha do Suno oscila até ~70 ms contra uma grade rígida,
  então as batidas vêm do rastreamento (librosa) da parte percussiva, repetido a cada passagem do laço; os golpes
  fortes (`hits`) também ficam no arquivo.
- **Lista de montagem** (`montage.ts`): um bloco por parágrafo, com o verso (por conteúdo, como `lyrics.get()`)
  e a palavra em destaque. A linha do tempo (`timeline.ts`) corta na primeira batida dentro do silêncio entre dois
  parágrafos. Cada bloco é uma classe nos módulos `c00.ts` … `c06.ts`, que acha as suas deixas pelas palavras da
  narração (`this.at('Bajulação')`) e recusa uma palavra ambígua sem dizer qual ocorrência é.
- **Cenas do clipe** (`clips.ts`): cada entrada da linha do tempo do clipe pode ser renderizada em qualquer tempo da
  música, com câmera 2D, zoom, desfoque ou recorte (`kit.ts`), e o tempo remapeado (câmera lenta, time-lapse, pausa).
  Parâmetros opcionais acrescentados às cenas (`Frame.remix`; sem eles, a cena é exatamente a do clipe): outra câmera
  para `open` e `loss` (`remix.cam`), a coluna da letra do `open` desligada (`remix.lyrics = false`) e a máscara do
  `shoggoth` tirada da cena (`remix.hideMask`). O clipe em inglês e em português foi conferido quadro a quadro contra
  as referências (`sheet --cuts` e um quadro a cada 0,5 s) depois de cada capítulo: diferença máxima de 7/255 em
  poucos pixels, a mesma de duas renderizações iguais.
- **Motor** (mudanças opcionais): uma duração maior que a da música (`Engine.durationOverride`), a régua desenhada na
  camada do HUD (`PostParams.hudDraw`) e o campo `Frame.remix`. Nada disso muda o clipe.
- **Peças novas**: o papel do `bureau` como folha reutilizável (`paper.ts`), o próprio código-fonte do vídeo como
  texto (`code.ts`, que lê `app/src` pelo Vite e conta as linhas), a faixa de raio X que deixa a imagem feita de código
  (`xray.ts`), chamadas, contornos traçados pela faísca e texto datilografado (`draw.ts`), e o mosaico do clipe inteiro
  (`mosaic.ts`).
- **Níveis da mixagem** (já aplicados; servem só de referência): voz a −21 LUFS; trilha 13,5 dB abaixo do arquivo
  original sob a fala, subindo 6 dB nas pausas; resultado de −17,9 LUFS, com pico de −2,2 dBFS.

## Prévia e renderização

Os comandos partem da pasta `app`.

```sh
bun run dev                     # prévia: http://localhost:5173/?lang=pt-BR&full=1  (&t=300 para começar em 5:00)
bun scripts/render.ts sheet --lang pt-BR --full --from 296 --to 306 --n 16      # folha de contato de um trecho
bun scripts/render.ts verify --lang pt-BR --full                                  # confere o vídeo inteiro
bun scripts/render.ts video --lang pt-BR --full --fps 30 --samples 1 --preset veryfast --crf 24   # rascunho
bun scripts/render.ts video --lang pt-BR --full --samples auto --shutter 0.2      # final
```

`--full` vale para todos os modos. Sem ele, `--lang pt-BR` continua sendo o clipe sozinho, e sem `--lang` o clipe
em inglês. A saída padrão do vídeo completo é `out/pdoom-pt-BR-letra-explicada.mp4`.

## Capítulos do YouTube

Tempos de corte da montagem (o início do primeiro bloco de cada capítulo, com a mixagem começando em 156,2 s);
não mudaram em relação à conta do roteiro.

```
0:00 Aumento meu P(doom)
2:35 Tudo que você viu é código
3:48 P(doom) 0,02 · Faíscas
4:57 0,15 · O que tem lá dentro
6:36 0,42 · Poder demais
8:11 0,81 · Clipes de papel
9:51 0,99 · O que Ilya viu
10:59 Como o Opus 5.5 fez este vídeo
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
- Linhas de código: medidas no próprio código pelo vídeo (o odômetro de 00.2 conta `app/src` sem a pasta `letra/`, a da explicação): hoje 57 arquivos `.ts` e 22.719 linhas; `shoggoth.ts` + `shoggoth-glsl.ts`, 1.303.
  Refaça a contagem antes de publicar.
