# Contratos de fiação

Caminhos relativos à raiz do repositório FastStore. Tudo em `src/`.

## Copiar do repositório base

Origem: `weni-ai/webchat-faststore`, mesmos caminhos da loja.

Copiar:

- `src/components/Copilot/**` (componentes, SCSS e `assets/`)
- `src/components/StoreChrome/StoreChrome.tsx`
- `src/components/EmptyShoppingAssistant.tsx`
- `src/hooks/useAgentChat.ts`, `useAuthState.ts`, `useCarousel.ts`
- `src/utils/agentSocket.ts`, `agentCatalog.ts`, `fleetPhotos.ts`, `getSession.ts`, `portalFleet.ts`, `storeTime.ts`

Mesclar com o que a loja já tem:

- `src/components/index.tsx` (registry abaixo)
- `src/graphql/thirdParty/` (sessão abaixo)
- `src/styles/mixins.scss` (`$rail-width`, `$rail-width-expanded`, `$dock-min`, `$docked`, `store-below`)
- `snippets/custom-theme.copilot.scss` → `src/themes/custom-theme.scss`
- `snippets/WebFonts.copilot.tsx` → `src/fonts/WebFonts.tsx`

O `useAgentChat.ts` do repositório já tem a correção do stream: o
`onStreamDelta` lê e escreve o `streamRef` no corpo do handler, nunca no updater
do `setTurns`. Os deltas e o `stream_end` chegam no mesmo tick; lido no updater,
a resposta sai duplicada. Não regredir isso ao mexer no hook.

## Registry

`src/components/index.tsx` — só o default export registra override:

```tsx
import EmptyShoppingAssistant from './EmptyShoppingAssistant'
import StoreChrome from './StoreChrome/StoreChrome'

export default {
  Navbar: StoreChrome,
  ShoppingAssistant: EmptyShoppingAssistant,
}
```

`EmptyShoppingAssistant` retorna `null`.

`StoreChrome` renderiza `<NavbarSection {...props} />` de `@faststore/core` e, ao lado, `<Copilot />`.

## Sessão

`src/graphql/thirdParty/typeDefs/getSession.graphql`:

```graphql
scalar JSON

type Query {
  getSession: JSON
}
```

`src/graphql/thirdParty/resolvers/index.ts` espalha só `Query`.

O resolver lê `api.storeId` de `discovery.config` e faz GET em
`https://${storeId}.myvtex.com/api/sessions?items=*`, com o header `Cookie`
do contexto. Erro devolve `{ error: message }`. Não usar o host
`vtexcommercestable`.

`useAuthState` chama essa query. Sem o resolver, o codegen quebra ou a sessão
do painel fica vazia. Codegen roda no `yarn dev` / `yarn build`.

## Pré-pintura

Em `src/fonts/WebFonts.tsx`, manter o `<link>` de fonte da loja e acrescentar:

```js
const COPILOT_PREF = `try{var v=localStorage.getItem('agx-copilot');document.documentElement.setAttribute('data-agx-copilot',v==='collapsed'?'collapsed':'open')}catch(e){document.documentElement.setAttribute('data-agx-copilot','open')}`
```

Injetar com `<script dangerouslySetInnerHTML={{ __html: COPILOT_PREF }} />`.

## Tema

No topo de `src/themes/custom-theme.scss`:

```scss
@use "../styles/mixins.scss" as mixins;
```

Dentro de `.theme`, tokens `--agx-*`. A cor principal aponta para
`--fs-color-main-*` da loja. Larguras vêm dos mixins:

```scss
--agx-rail-width: #{mixins.$rail-width};
--agx-rail-width-expanded: #{mixins.$rail-width-expanded};
--agx-rail-breakpoint: #{mixins.$dock-min};
```

Depois do fechamento de `.theme`:

```scss
#wwc {
  display: none !important;
}

body:has([data-fs-slide-over]) [data-agx-copilot-panel] {
  z-index: 1;
}

@media (min-width: mixins.$dock-min) {
  body.theme {
    transition: padding-right var(--agx-duration) var(--agx-ease);
  }

  #{mixins.$docked} {
    padding-right: mixins.$rail-width;
  }

  #{mixins.$docked}:has([data-agx-copilot-expanded='true']) {
    padding-right: mixins.$rail-width-expanded;
  }
}
```

`$docked` é
`html[data-agx-copilot='open'] body:has([data-agx-copilot-panel][data-agx-copilot-open='true'])`.

Números que andam juntos: `$dock-min: 80rem` e
`window.matchMedia('(min-width: 80rem)')` no estado inicial de `Copilot.tsx`.
