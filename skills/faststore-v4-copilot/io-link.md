# WebChat na loja VTEX IO, por workspace de desenvolvimento

O painel de [vendor/webchat](vendor/webchat) entra na loja de verdade, só no
workspace de desenvolvimento escolhido. O `master` e o domínio de produção
não recebem o app. Não é a cópia da home na Vercel
([demo-nao-faststore.md](demo-nao-faststore.md)) e não é o pixel
`vtex.agentic-cx`.

O app é um pixel VTEX IO no vendor da conta. O builder `pixel` sozinho não
desenha o painel: ele só publica `pixel/head.html` e `pixel/body.html`. O
slot `pixels > pixel` coloca o bundle na página, mas o `vtex.render-runtime`
8.136.3 não chama o componente. O `ExtensionPoint` de `$after_pixels` recebe
`treePath` da página (`store.home`) e procura `store.home/{interface}`,
enquanto o bloco está em `store.home/$after_pixels/{interface}`. Além disso,
`isDirectChild` só aceita o segmento `[a-zA-Z0-9-_#]+`, então um nome com
ponto (`pixel.webchat-panel`) nem vira filho. Quem pinta o painel é o
`react/index.tsx`, que monta o componente com `ReactDOM.render` quando o
chunk é avaliado.

## Perguntar

Se ainda não estiver na conversa:

1. Conta VTEX e o workspace de desenvolvimento. Sem workspace, criar um com
   `vtex use`. Nunca usar `master`.
2. UUID do canal WebChat. Sem UUID, montar mesmo assim: o pill fica
   **Sem canal**. Não reutilizar o UUID de outra marca.
3. Onde criar o app. Sem pasta, usar o workspace atual.

## Permissão

`vtex link` exige o papel **VTEX IO Admin** na conta (Account Settings >
User Roles). Os recursos que o link usa: **Workspace CRUD**, **Link App**,
**Install App**, **Read Workspace Apps** e **Vbase Read Write**.

Sem eles, o login entra na conta e a API de workspace responde 403
(`cannot perform action GET` em `vrn:kube-router`). `vtex whoami` pode dizer
"Not logged in" mesmo com token válido: ele só não conseguiu ler o workspace.

`vtex login {conta} --workspace {nome}` tenta criar o workspace. Se ele já
existe, usar `vtex use {nome}`.

## Montar o app

Na pasta do app:

```json
{
  "vendor": "{conta}",
  "name": "webchat-panel",
  "version": "0.1.0",
  "builders": { "react": "3.x", "store": "0.x", "pixel": "0.x" },
  "dependencies": { "vtex.pixel-interfaces": "1.x" },
  "registries": ["smartcheckout"]
}
```

`registries` faz o mesmo pixel aparecer no checkout. O vendor é a conta, nunca
`vtex`. Não copiar `"policies": [{ "name": "pixel" }]` do Google Tag Manager:
num app do vendor da loja o builder recusa com `pixel: not_found`.

`store/interfaces.json`:

```json
{ "webchat-panel": { "component": "index" } }
```

O nome da interface não leva ponto. `component` é `index`: o entry do react
builder é `react/index.tsx`, não um arquivo `Pixel`.

`store/plugins.json`:

```json
{ "pixels > pixel": "webchat-panel" }
```

`pixel/head.html` fica só com um comentário. Sem a pasta `pixel/`, o builder
`pixel` não sobe.

Copiar `vendor/webchat/` para `react/webchat/`, sem `typings/dom-extras.d.ts`
(o tipo antigo colide com o TypeScript do builder).

`react/index.tsx` importa o `Pixel` e, no escopo do módulo, faz
`ReactDOM.render` num host `#elux-webchat-host` preso em `document.body`.
Guardar com `typeof document` e com o id do host, para não montar duas vezes
e para o build no Node não quebrar. Sem esse render, o bundle carrega e o
launcher não aparece.

`react/Pixel.tsx` injeta `STYLES` num `<style>` no `head`, esconde `#wwc` e
monta `<App config={…} />` com `ReactDOM.createPortal` em `document.body`.
`position: fixed` dentro do container do pixel fica preso no pai; o portal
solta o painel na viewport.

Config nesse entry, não no vendor:

- `vtexAccount`: a conta
- `cartMode: 'vtex'` e `collectVtexFields: true`
- `channelUuid`: o UUID pedido, ou `''`

`react/package.json`, em `devDependencies`:

```json
{
  "react": "16.14.0",
  "react-dom": "16.14.0",
  "@types/react": "16.14.60",
  "@types/react-dom": "16.9.24",
  "@types/node": "^12.20.0",
  "typescript": "3.9.7"
}
```

A versão exata `12.20.55` o registry do builder não resolve. A faixa `^12.20.0`
resolve. Sem `@types/node`, o react builder 3.x falha com
`TS2688: Cannot find type definition file for 'node'`, mesmo com `"types": []`
no `tsconfig` — o builder reescreve o `jsx` para `preserve` e ainda pede esse
tipo.

`react/tsconfig.json`: `jsx: react`, `lib` com `dom`, `dom.iterable` e
`es2019`, `skipLibCheck: true`. `Object.fromEntries`, `flatMap` e
`ResizeObserver` / `MediaRecorder` precisam desse `lib` mais
`react/typings/dom-extras.d.ts` declarando as duas APIs que o TypeScript 3.9
não conhece.

## Marca, antes do `vtex link`

O vendor chega com a cara da Kärcher. Vale o mesmo
[portão](demo-nao-faststore.md#portão) e a mesma tabela de tokens de
[demo-nao-faststore.md](demo-nao-faststore.md). `branding.md` é o trilho da
FastStore; aqui não se usa.

Ler cor, fonte e logo da loja. Se a home estiver atrás de login, usar a marca
pública já confirmada com o operador e dizer isso.

O thinking segue o bloco de `BrandLoader.tsx` em
[demo-nao-faststore.md](demo-nao-faststore.md). Caprichar é obrigatório:
pista na largura do balão (160×48), a marca legível no centro, um traço que
completa uma volta e volta ao desenho inicial. Círculo pontilhado, três
pontinhos e a linha do template não passam. Sem `EXTRA` no pixel redefinindo
o `stroke-dasharray`. O balão mantém o mesmo tamanho a espera inteira
(regra e script de medição no mesmo bloco).

## Linkar

CLI em `~/.local/bin/vtex` (`npm install --prefix ~/.local vtex` se não
estiver no PATH). Node 24 sobe o CLI 4.x.

```bash
vtex login {conta}
vtex use {workspace}
vtex link
```

`vtex use` num workspace que já existe não cria outro. Conferir com a API que
`production` é `false` antes de linkar:

`GET https://platform.io.vtex.com/{conta}/{workspace}` com o token da sessão
(`~/.vtex/session/session.json`). `master` vem `production: true` e não recebe
link.

`vtex link` fica em primeiro plano e reenvia a cada arquivo salvo. Parar o
processo desliga o app do workspace.

Endereço para ver: `https://{workspace}--{conta}.myvtex.com`. Loja fechada
responde 302 para o login; o painel só aparece com a sessão desse workspace.

Não rodar `vtex publish` nem instalar o app no `master`.

## Verificar

No workspace, logado:

- `window.__RUNTIME__.extensions['store.home/$after_pixels/webchat-panel']`
  existe, e `#elux-webchat-host` está no `body`. Se o host não existir, o
  `react/index.tsx` não rodou: conferir o link e recarregar;
- o botão de launcher aparece no canto inferior direito, com o rótulo do
  `DEFAULT_CONFIG` (hoje “Assistente Electrolux”); clicar abre o painel;
- o launcher usa a cor de ação da loja;
- abrir o painel: título da loja, pill Sem canal ou Online;
- `#wwc` sem widget nativo visível;
- o thinking (`.krc-typing`) é o gesto da loja: pista na largura do balão,
  marca legível, traço que completa uma volta. Não é o loader do template;
- o balão do thinking tem um tamanho só durante a espera;
- o `master` (`https://{conta}.myvtex.com`) não carrega `webchat-panel`.

Origem do socket: `https://{workspace}--{conta}.myvtex.com` precisa estar na
allowlist do canal. Sem isso o pill fica Offline com `forbidden`. Dois sockets
no mesmo contact id se expulsam; por isso `#wwc` fica escondido.
