# Demonstração — loja que não é FastStore

Cópia **só da página inicial** do site do cliente, com o painel de WebChat
por cima. Não é a loja de verdade: não publica, não faz `vtex link`, não
instala app e não replica as outras rotas. Para o painel na loja VTEX IO, num
workspace de desenvolvimento, seguir [io-link.md](io-link.md).

O painel é o componente em [vendor/webchat](vendor/webchat) (extraído do app
de pixel). Ele abre o próprio socket em `wss://websocket.weni.ai/ws`. Não é o
trilho da FastStore e não se faz com `customCss`.

## Perguntar

Se ainda não estiver na conversa:

1. URL da página inicial do cliente.
2. UUID do canal WebChat. Sem UUID, montar o visual mesmo assim: o pill fica
   **Sem canal** e enviar mostra um aviso. Não reutilizar o UUID de outra marca.
3. Onde criar o projeto. Sem pasta indicada, usar o workspace atual.

## Montar o projeto

App Vite + React 18 no workspace. Copiar para `src/webchat/`:

- tudo em `vendor/webchat/`, sem o `index.tsx` de pixel e sem
  `typings/dom-extras.d.ts` (o TypeScript atual já declara essas APIs; o
  arquivo antigo colide).

Entrada própria, `src/main.tsx`: injeta `STYLES` num `<style>` e monta
`<App config={resolveConfig()} />` com `createRoot` num container no `<body>`.
Não usar `ReactDOM.render` nem o entry de pixel. Esta regra vale só para a
cópia na Vercel, que é um app Vite com `createRoot`. No caminho de vtex link
([io-link.md](io-link.md)) o `ReactDOM.render` é necessário, porque o
render-runtime não monta o pixel; não copie a regra daqui para lá.

Copiar [scripts/homepage-plugin.mjs](scripts/homepage-plugin.mjs) para a raiz
do projeto e ligá-lo no `vite.config`. `origin` é a URL que o usuário passou.
`badge` identifica a página como demonstração, por exemplo
`Demonstração · só a página inicial`.

O plugin:

- responde só a home: `GET /` e, quando `origin` tem caminho, esse caminho
  também (ver "Loja sob um caminho" abaixo);
- busca o HTML da home e reescreve URL raiz (`/caminho`) para o domínio ao vivo,
  para CSS, imagem e link continuarem certos;
- não usa `<base href>` — isso mandaria `/src/main.tsx` para o site do cliente;
- tira meta de CSP da cópia;
- abre link externo em nova aba, para a demo não sair da home;
- injeta o badge, o preamble do React Refresh (`/@react-refresh`, senão o
  plugin do Vite recusa o JSX) e `<script type="module" src="/src/main.tsx">`.

Não espelhar `/produto`, `/categoria` nem checkout. Essas URLs não existem
neste servidor.

### Loja sob um caminho

Algumas contas VTEX IO são servidas numa pasta do domínio, não na raiz
(Angeloni Eletro: `https://www.angeloni.com.br/eletro/`, `rootPath` `/eletro`
no `__RUNTIME__`). As páginas ficam sob o caminho: `/checkout` é 404 e
`/eletro/checkout` abre o carrinho. `/api/...` na raiz só responde com os
cookies da loja; uma chamada de servidor, sem cookie, dá 404 e precisa de
`/eletro/api/...`.

- `origin` é a URL com o caminho (`https://www.angeloni.com.br/eletro`). O
  plugin busca o HTML e o catálogo nesse caminho e reescreve URL raiz só com o
  domínio.
- O router da loja troca o endereço para `/eletro/` depois de carregar. O
  plugin já responde nesse caminho; na Vercel, o `vercel.json` precisa da
  mesma regra, senão recarregar a página dá 404:

  ```json
  { "source": "/eletro", "destination": "/api/home" },
  { "source": "/eletro/", "destination": "/api/home" }
  ```

- O catálogo pode devolver o produto noutro host da loja
  (`eletro.angeloni.com.br/x/p`, que redireciona para
  `www.angeloni.com.br/eletro/x/p`). `lookupProductLink` põe o caminho do
  produto sob a loja; não afrouxar essa checagem para aceitar qualquer host.
- Dentro da loja, o vendor chama `/api/...` e `/checkout` por `storeApi()`
  (em `vtexFields.ts`), que lê o `rootPath`. Loja na raiz não muda nada. Não
  trocar de volta por `/api/...` fixo.

Se o JavaScript da loja redirecionar para o domínio original ou apagar a
página, servir o HTML sem os scripts de terceiros (GTM, pixels, chat nativo)
e manter CSS e imagens. A home tem de continuar reconhecível.

`collectVtexFields: false` e `cartMode: 'link'` quando a página não for VTEX
(`__RUNTIME__` / checkout VTEX). O botão da peça abre a URL do produto no site
original. Não chamar `/api/checkout` de uma loja Wake, Shopify ou HTML.

O Send Catalog manda o SKU e muitas vezes não manda `product_url`. O botão
**Ver produto** chama `resolveProductUrl`. No vendor, essa função lê
`/api/catalog_system/pub/products/search` na mesma origem — isso só funciona
dentro da loja. Nesta demo a origem é o Vite ou a Vercel, e o catálogo da loja
não envia CORS. Troque o `fetch` de `src/webchat/product.ts` para
`/api/product-link?sku=`, que o `homepage-plugin.mjs` responde com
`lookupProductLink`. Esse `fetch` fica sem `storeApi()`: a cópia traz o
`__RUNTIME__` da loja, e numa loja sob caminho o prefixo mandaria a chamada
para `/eletro/api/product-link`, que a demo não tem. Em produção, `api/product-link.js` chama a mesma função.
Não aponte o `fetch` do browser para o domínio da loja.

## Marca, antes do primeiro `npm run dev`

O vendor chega com a cara da Kärcher: amarelo `#ffd200`, teal `#146570`, fonte
Klean e textos de lavadora. Nada disso pode aparecer.

`channelUuid` e `vtexAccount` começam vazios. Preencha com o canal e a conta
desta loja.

Ler a marca da home, não inventar:

- cor de ação, cor de destaque, fundo, texto, borda e a fonte carregada
  (`@font-face` ou `font-family` do CSS publicado);
- logo em SVG, de preferência a versão clara se o cabeçalho do painel for escuro;
- duração e easing já usados no site (`transition`, `cubic-bezier`).

Mapear por função, mesmo que o nome da variável diga a cor antiga:

| Token | Função |
|---|---|
| `--krc-teal` / `--krc-teal-hover` | botão, bolha do visitante, foco, link |
| `--krc-yellow` | destaque curto: avatar, timer, ponto da costura. Pode não ser amarelo |
| `--krc-ink`, `--krc-text`, `--krc-muted` | texto |
| `--krc-surface`, `--krc-card`, `--krc-line` | fundos e borda |
| `--krc-font` | a fonte da loja |

Também trocar os `rgba(20, 101, 112, …)` e o gradiente amarelo do `.krc-header`.
Eles não seguem a variável. Cabeçalho: cor sólida da navbar **ou** uma foto que
já está na home (URL absoluta do próprio site). Sem a foto da Kärcher.

Texto em `config.ts`, no idioma da loja: `title`, `subtitle`, `launcherLabel`,
`greeting`, `inputHints`, `quickActions`. `channelUuid` vazio se o usuário não
passou. `vtexAccount` vazio fora da VTEX. `logoUrl` aponta para o SVG da loja.

`suggestions.ts`: trocar as categorias de limpeza pelas do catálogo da home
(o que a vitrine realmente mostra). A frase do botão é a mensagem enviada.

`BrandLoader.tsx` é o thinking: o balão que a pessoa olha enquanto a resposta
não chega. Caprichar aqui é obrigatório. Círculo pontilhado, três pontinhos
ou a linha horizontal do template não passam.

- Caixa 160×48. O gesto usa a largura do balão. Um spinner pequeno no meio
  do espaço vazio não conta.
- Metáfora do segmento, em SVG e CSS. Moda: costura. Eletro: uma volta que
  se fecha em torno da marca (pista, traço que percorre, símbolo no centro).
  Outro segmento: outro gesto. Sem aspirador.
- Um ciclo só, que fecha. O traço sai, percorre a pista, cresce no meio da
  volta e o frame final desenha o mesmo que o inicial. O `stroke-dashoffset`
  final é um perímetro (`getTotalLength`); a soma do `stroke-dasharray`
  permanece esse perímetro. `linear infinite` que nunca pousa não é um ciclo.
- A marca da loja fica dentro do gesto, na cor do token, legível o tempo
  todo. O símbolo não esmaece até sumir.
- Cores só dos tokens: pista em `--krc-line` (ou o teal bem baixo), traço em
  `--krc-yellow`. Esse token é o destaque curto e pode não ser amarelo.
- Nenhum CSS posterior redefine o `stroke-dasharray` do traço. Um `EXTRA` no
  pixel com o traço antigo desfaz a animação.
- `prefers-reduced-motion` já zera animação em `.krc-assistant-root *`. O
  frame parado ainda mostra a marca e a pista: o keyframe `100%` coincide
  com o `0%`.
- O balão não muda de tamanho durante a espera. Largura e altura do
  `.krc-typing` são as mesmas em todos os frames do ciclo e em todas as frases.
  Nada anima `width`, `height`, `padding`, `margin`, `font-size`,
  `line-height` nem `content`: o movimento usa só `transform`, `opacity`,
  `clip-path` e `stroke-*`. O SVG fica sempre 160×48.
- Legenda de status embaixo do gesto (frases que giram) é opcional. Se usar,
  é `<span className="krc-loader-caption">` dentro de
  `.krc-typing.has-caption`, já prontos no `styles.ts`: uma linha, 200×18 px,
  reticências reveladas por `clip-path`. Não refazer as reticências com
  `width` animado num `inline-block`: os pontos quebram em duas ou três
  linhas e o balão cresce 15 px e volta, a cada volta. Toda frase cabe em
  200 px; frase que corta em reticências fica mais curta.
- Apagar o comentário `TODO_LOADER` quando a metáfora for a da loja.

Conferir com uma mensagem em voo (`.krc-typing`, aria-label "Digitando").
O balão some quando a resposta chega, então o print pega a espera. O
comprimento do path e o `dashoffset` de uma volta batem.

O tamanho do balão também se mede, não se olha. Com a mensagem em voo, no
console:

```js
const b = document.querySelector('.krc-typing');
const seen = new Set();
const id = setInterval(() => seen.add(`${b.offsetWidth}x${b.offsetHeight}`), 40);
setTimeout(() => { clearInterval(id); console.log([...seen]); }, 9000);
```

Um valor só. Dois ou mais é o balão pulsando: corrigir antes de publicar.

Movimento do painel, do launcher e do hint: a mesma ordem de tempo do site
(no varejo editorial, perto de 200–320 ms e `cubic-bezier(.4,0,.2,1)`, sem
quique).

## Portão

Na pasta do projeto, antes de subir o dev server:

```bash
rg -n -i "karcher|kärcher|klean|ffd200|146570|0f525b|lavadora|aspirador|robô|TODO_LOADER|TODO_MARCA" src
```

Nenhum resultado. Comentário que o usuário não vê pode citar o template;
string renderizada, cor e UUID não.

## Verificar no browser

`npm run dev` e abrir a origem que o Vite imprimir (em geral
`http://localhost:5173`).

- a home do cliente reconhece-se (header, vitrine, fonte, cor de fundo);
- o badge de demonstração está visível e não cobre o header;
- o launcher usa a cor de ação da loja, não o amarelo;
- abrir o painel: logo ou título da loja, pill Sem canal ou Online, sugestões no idioma da loja;
- o thinking (`.krc-typing`) é o gesto da loja na caixa 160×48: marca visível
  e um ciclo que fecha. Não é a linha do template, nem três pontos, nem um
  aspirador;
- o balão do thinking mantém um tamanho só durante a espera (script acima);
- um link da home abre o site original em outra aba e esta aba continua na home;
- abaixo de 520 px o painel ocupa a largura. Confirmar os dois largos se a mudança mexeu no breakpoint.

## Publicar na Vercel

Depois dessa verificação, publicar com `npx vercel` (a máquina precisa do login
da Vercel) e entregar a URL. O badge de demonstração permanece na página
publicada. Não fazer `vtex link` nem instalar app na conta.

Não fazer commit nem push sem o usuário pedir. Publicar na Vercel sobe o
diretório local; não substitui um commit.
