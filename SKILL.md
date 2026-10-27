---
name: faststore-v4-copilot
description: >-
  Instala o copiloto numa loja FastStore v4 ou monta uma demonstração só da
  página inicial de uma loja que não é FastStore, com o painel de WebChat.
  Use quando o usuário pedir para onboardar, injetar ou replicar o webchat,
  copiloto, template da Ri Happy, pacote webchat-copilot ou
  weni-ai/webchat-faststore em FastStore v4, ou quando pedir uma demo,
  prova visual ou vitrine da home de uma loja que não é FastStore (Wake,
  VTEX IO, Shopify, loja própria). Não use para publicar pixel com vtex link,
  customCss do WWC, nem para a vitrine inteligente.
---

# FastStore v4 — copiloto

Trilho React fixo na borda direita. O painel abre o próprio WebSocket
(`wss://websocket.weni.ai/ws`). A loja cede o espaço com `padding-right` no
`body`. Não é o widget `#wwc` e não se faz com `customCss`.

Contratos de arquivo: [wiring.md](wiring.md). Marca da loja: [branding.md](branding.md).

**Obrigatório no caminho FastStore:** o template chega com a cara de outro cliente. Aplicar a marca
da loja ([branding.md](branding.md)) e passar no portão daquele arquivo
**antes** do primeiro `yarn dev` e antes de qualquer push. O usuário nunca deve
ver o template cru, nem localmente.

## Escolher o tipo de loja

Antes de ler código ou clonar repositório, pergunte com escolha estruturada:

- **Loja FastStore v4**
- **Loja que não é FastStore (demonstração da home)**

Não escolha pelo usuário. Se ele já tiver dito nesta conversa, não pergunte de novo.

### Loja que não é FastStore

Seguir só [demo-nao-faststore.md](demo-nao-faststore.md). Parar aqui. Não clonar
FastStore, não usar WebOps e não usar o trilho `weni-ai/webchat-faststore`.

### Loja FastStore v4

O restante deste arquivo.

## Escolher o modo de entrega

Antes de ler ou alterar código, pergunte com escolha estruturada:

- **Implementar na loja real (Necessario permissão do repositorio)**
- **Fazer uma demo independente (Homologação)**

Não escolha pelo usuário.

### Implementar na loja real

Exigir acesso de leitura ao repositório para inspecionar a implementação atual
e acesso de escrita para enviar branch e PR. Permissão no VTEX Admin não concede
permissão no GitHub.

Fluxo:

1. Clonar o repositório conectado ao WebOps.
2. Criar uma branch `feat/copilot-webchat`.
3. Instalar e validar o copiloto.
4. Com autorização do usuário, enviar a branch e abrir PR.
5. Entregar o preview de branch gerado pelo WebOps para aprovação.
6. Após aprovação, fazer merge na branch de produção. O domínio de produção
   permanece o mesmo; não há troca manual de link.

Sem acesso de leitura, não tente reconstruir a loja raspando o site publicado:
HTML e bundles não recuperam fielmente fontes, overrides, CMS e histórico. Peça
acesso temporário, um arquivo do repositório ou que alguém autorizado execute a
skill.

### Fazer uma demo independente (Homologação)

Dois caminhos. A cópia do commit de produção vem primeiro. O starter que lê o
CMS público só entra quando esse repositório não está disponível e a loja no ar
é Headless CMS.

#### Cópia do commit de produção

Quando houver acesso de leitura ao repositório do WebOps, ou um arquivo/espelho
entregue no commit de produção:

1. Confirmar o SHA no Dashboard do WebOps.
2. Clonar esse SHA para um repositório controlado pelo usuário. Não é
   necessário acesso de escrita ao repositório do cliente.
3. Não trocar esse commit por um starter genérico.

Pedir: account name VTEX, channel UUID, URL ou pacote e SHA, repositório de
destino, execução local ou hospedagem temporária.

A demo preserva o código, layout, CMS e catálogo daquele commit, acrescentando
apenas o copiloto.

#### Starter lendo o CMS público

Sem o repositório de produção, e com a loja no ar em Headless CMS
(`contentSource.type: "CMS"`, o mesmo tipo da conta):

1. Partir do starter FastStore v4. `api.storeId` é a conta no ar. Conteúdo e
   catálogo vêm da API pública
   (`https://{account}.myvtex.com/_v/cms/api/faststore/globalSections` e
   `home`).
2. Registrar em `src/components/index.tsx` as seções que o CMS publica, com a
   mesma chave. `CartSidebar`, `RegionModal` e `Children` ficam no core.
3. Seção cujo conteúdo não traz o dado para renderizar (vitrine de terceiro,
   anúncio, widget externo) fica de fora. Não inventar lista de produtos nem
   criativo.
4. Não rodar `cms-sync` nem `upload-schema`. As seções já existem na conta.
   Publicar schema local pede `vtex login` nessa conta e substitui o contrato
   que o time deles usa.

Isso não é o commit de produção: fontes, overrides e histórico do repositório
deles não vêm junto. Não raspar o HTML público nem usar proxy reverso. Nenhum
dos dois recupera o storefront.

#### Nos dois caminhos

Não conectar esse repositório ao WebOps do cliente, não trocar o Git Provider e
não refazer o onboarding do CMS. Não copiar `vtex.env`, cookies, app keys ou
outros segredos.

Por usar outro domínio e outra infraestrutura, login, checkout, cookies,
políticas de domínio, variáveis privadas e integrações podem divergir de
produção. Uma réplica integral do ambiente só existe no preview de branch do
WebOps original.

Validar se o canal aceita a origem da demo; uma allowlist pode impedir o socket
fora do domínio aprovado.

Identificar visualmente a URL como demo/homologação. Aprovação da demo não
publica nada: depois dela, executar novamente no modo loja real para gerar o PR
e o preview oficial do WebOps.

## Escolher o caminho

| Alvo | Fazer |
|---|---|
| FastStore v4 (Next.js, `@faststore/cli`, `src/themes`, URL `.vtex.app`) | Esta skill. |
| VTEX IO (`__RUNTIME__`, `myvtex.com`, pixel `vtex.agentic-cx`) | Parar. Este template não entra por pixel. Não misturar os dois caminhos. |
| Vitrine em tela dividida, `product_list`, carrinho | Skill `weni-vitrine-inteligente`. |
| Só restilizar o balão nativo | `customCss` do WWC, skill `weni-dev-toolkit`. Isso não vira o trilho. |

Escrita na Weni (PATCH, POST, assign) exige a confirmação de Project UUID da
`weni-dev-toolkit`. Ler `script.js` para achar o canal é permitido.

## Antes de copiar

1. No `discovery.config.js`, `contentSource.type` é `CP` ou `CMS`. `CMS` vale
   quando é o tipo que a conta no ar publica (Headless CMS). Outro tipo: pare.
2. Editar só `src/`. Nunca `.faststore/`.
3. Não criar rota em `pages/api`. Não chamar `vtexcommercestable` no resolver.
4. Anotar `api.storeId`, locale, fuso e o **channel UUID**.

O channel UUID é o campo `channelUuid` dentro de `WebChat.default.init` no
`script.js` publicado do app. O UUID no caminho S3
(`apptypes/wwc/{id}/script.js`) é o app de integração. Usar esse id no socket
devolve `forbidden` e o painel fica em "Reconectando".

O UUID do canal não é segredo: vai no bundle de propósito. Não colocar em
`process.env` sem `NEXT_PUBLIC_` — fica `undefined`.

## Montar

A base é **sempre** o repositório
[weni-ai/webchat-faststore](https://github.com/weni-ai/webchat-faststore)
(privado), na `main`:

```bash
gh repo clone weni-ai/webchat-faststore /tmp/webchat-faststore -- --depth 1
```

Não copiar de `~/Downloads/webchat-copilot`, de outra loja nem do template da
Ri Happy: estão desatualizados (resposta duplicada no stream, marca de outro
cliente, sem placeholder dinâmico). Sem acesso ao repositório, parar e pedir
acesso à org `weni-ai`. Anotar o SHA usado no PR da loja.

Melhoria validada numa loja que sirva para todas (bug, comportamento novo) volta
para o `webchat-faststore` num PR próprio, sem a marca da loja.

O repositório espelha `src/` da loja. O que se copia e o que se mescla está no
README dele e em [wiring.md](wiring.md). `src/components/index.tsx`,
`src/graphql/thirdParty/`, `src/styles/mixins.scss` e os `snippets/` são
**mesclados** com o que a loja já tem, nunca sobrescritos.

Ligar nesta ordem:

1. `Navbar` → `StoreChrome` (navbar de core + `<Copilot />`).
2. `ShoppingAssistant` → componente que retorna `null`.
3. `getSession` em `src/graphql/thirdParty/` (typedef + resolver + index).
4. Script de pré-pintura em `src/fonts/WebFonts.tsx`, sem remover a fonte da loja.
5. Tokens `--agx-*` dentro de `.theme`. Regras de `#wwc` e do `padding-right` **depois** do bloco `.theme`.

A navbar é o lugar global que existe em toda página sem `ViewportObserver`,
quando o CMS a publica. No footer o painel só aparece depois do scroll. Se o
operador tirar a Navbar das seções globais, o copiloto sai junto.

Se `globalSections` não tiver `Navbar`, montar o `<Copilot />` na seção global
que a conta publica com `skipLazyLoadingSection` (na Americanas, `Header`).
Manter `Navbar: StoreChrome` no registry para o caso de a seção voltar. Não
montar o painel duas vezes.

Dois sockets no mesmo contact id se expulsam. Sintoma: "Reconectando" a cada
poucos segundos, sem erro útil no log. Por isso a seção nativa sai e `#wwc`
fica `display: none`.

## Localizar para a loja

- `POC_CHANNEL_UUID` no `Copilot.tsx` — vem vazio do repositório base.
- Textos, sugestões, placeholder, disclaimer e `STATUS_LABEL` no idioma da loja.
- `storeTime.ts`: fuso e saudações.
- `DEFAULT_FLEET = []`, a menos que a loja tenha frota no CMS. Sem frota, os prompts não usam `{vehicle}`.
- Cabeçalho, avatar, cores e loader da espera: seguir [branding.md](branding.md). Não é opcional.
- Campo vindo do CMS: usar `||`, não `??`. O CMS manda `''`, e string vazia não é nullish.

## Encaixe na página

O painel é sempre `position: fixed`. O empurro é o `padding-right` do `body`,
não o painel entrando no fluxo.

- A partir de `80rem` (1280 px): `body` cede `28rem` (448 px). Expandido cede `45rem` (720 px) no mesmo breakpoint. Abaixo disso o painel cobre a página.
- Abaixo de `80rem`: drawer por cima. É o comportamento do template. Não tratar como bug.
- `$dock-min` em `src/styles/mixins.scss` e o `matchMedia('(min-width: 80rem)')` em `Copilot.tsx` são o mesmo número. Mudou um, mude o outro.
- `html[data-agx-copilot]` vem do `localStorage['agx-copilot']` antes do primeiro paint. Sem o script, a loja pinta larga e depois encolhe.

Foto de hero cortada na borda do painel, com o cabeçalho terminando exatamente onde o painel começa, é a coluna reflowada — não é overlay.

## Verificar no browser

Só depois do portão de [branding.md](branding.md). Se o `rg` do portão devolver
string visível, import ou asset do template, corrigir antes de subir.

Subir com Yarn (`npx --yes yarn@1.22.22` se `yarn` não estiver no PATH).
`Can't resolve './discovery.config.local'` é aviso. Avisos de `loadingLabel` /
`searchHistoryTitle` / `searchTopTitle` vêm do SearchInput do core.

Abrir sempre em `http://localhost:3000`, nunca `127.0.0.1`. O Next 16 bloqueia o
`/_next/webpack-hmr` de outra origem (`Blocked cross-origin request` no log), o
socket cai em 1006 e, após ~25 tentativas (~40 s), o cliente de dev dá
`location.reload()` — o drawer volta fechado e parece que "o chat fechou
sozinho". Não dá para setar `allowedDevOrigins` sem editar `.faststore/`.

Na home, com a janela ≥ 1280 px:

- título da loja, status Online, sugestões no idioma certo;
- cabeçalho, avatar e loader com a marca da loja;
- `document.querySelector('#wwc')` sem widget nativo visível;
- `getComputedStyle(document.body).paddingRight` igual a `448px`;
- borda direita do `header` igual à borda esquerda de `[data-agx-copilot-panel]`;
- sem loop de "Reconectando".

Abaixo de 1280 px o painel cobre a página. Confirmar os dois largos se a mudança mexeu no breakpoint.

Não fazer commit nem push sem o usuário pedir.
