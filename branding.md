# Marca da loja no copiloto

O repositório `weni-ai/webchat-faststore` vem com a marca placeholder
**StoreName** (`/storename-logo.svg`, `StoreNameMark`), mas o visual ainda é o
da Agafarma, a implementação de referência: faixa amarela no cabeçalho, coração
no avatar, eletrocardiograma na espera e frases de farmácia no placeholder.
Nada disso pode chegar ao usuário. Este passo é obrigatório antes do
primeiro `yarn dev` e antes de qualquer push.

Os pacotes antigos (`webchat-copilot`, Ri Happy) traziam outra marca (caminhão,
emblema, slogans em inglês). As linhas da tabela abaixo sobre `.webp` e
`truck-loader` só valem se alguém tiver partido deles.

## De onde tirar a marca

Ler da própria loja, não inventar:

- `src/themes/custom-theme.scss`: `--fs-color-main-*`, `--fs-color-accent-*`, cor da navbar (`--fs-navbar-bkg-color`), fonte em `--fs-text-face-body`.
- Logo usado na navbar (normalmente em `public/`, referenciado no tema).
- Símbolo da marca dentro do logo SVG (selo, ícone, monograma), para o avatar.
- Segmento da loja (farmácia, moda, autopeças…), para escolher a metáfora da espera.

Se a loja não tiver logo em SVG nem cores no tema, pedir ao usuário antes de seguir.

## O que trocar

| Peça do template | Arquivo | Trocar por |
|---|---|---|
| Logo `/storename-logo.svg` e faixa amarela | `CopilotHero/CopilotHero.tsx`, `--agx-header` | Logo e cor da navbar da loja |
| `StoreNameMark` (coração no disco amarelo) | `CopilotAvatar.tsx` | `{Marca}Mark` com o símbolo da loja |
| Eletrocardiograma + coração | `CopilotThread/CopilotPulseLoader/` | Metáfora do segmento da loja (regras abaixo) |
| Frases de farmácia | `CopilotComposer/useTypedPlaceholder.ts`, placeholder fixo em `Copilot.tsx` | Exemplos do catálogo da loja, curtos (~241 px livres no campo) |
| Foto de caminhão, véus, slogan em versalete, wordmark | `CopilotHero/CopilotHero.tsx` e `styles.module.scss` | Faixa na cor da navbar (`--agx-header`) com o logo da loja, título e status na cor principal |
| Emblema em `assistant-avatar.webp` | `CopilotAvatar.tsx` | Símbolo da marca em SVG inline, exportado também como `{Marca}Mark` |
| Caminhão animado (`truck-loader*.webp`) | `CopilotThread/` | Loader próprio da marca (regras abaixo) |
| Navy do template nos botões, atalhos e bolhas | tokens no tema | `--agx-chat-navy` e `--agx-chat-selected` apontando para `--fs-color-main-*` |
| Textos em inglês | `CopilotThread.tsx` (`aria-live`), `CopilotComposer.tsx` (`STATUS_PLACEHOLDER`), `CopilotFleet.tsx` (`label`) | Idioma da loja |

Apagar do repositório `chat-header.webp`, `assistant-avatar.webp`,
`truck-loader.webp` e `truck-loader-still.webp` depois de remover os imports.
`fleet-*.webp` e `portal-*.webp` só aparecem se o agente mandar cards de
veículo; numa loja sem frota, deixar desligado e não citar no CMS.

Tokens novos ficam dentro de `.theme`, junto dos `--agx-*`:

```scss
--agx-header: <cor da navbar>;
--agx-chat-navy: var(--fs-color-main-2);
--agx-chat-selected: var(--fs-color-main-3);
```

## Loader da espera

O caminhão funcionava porque falava a língua da loja: "estou indo buscar". O
substituto precisa da mesma qualidade, não de três pontinhos.

Contrato:

- Mesmo lugar: na linha de espera do `CopilotThread`, ao lado do avatar, **sem balão**.
- Caixa fixa de 160 × 48 px, para a linha não mudar de altura quando a resposta chegar.
- SVG e CSS puros. Nada para baixar antes da primeira pergunta; remover `preloadTruckLoader`.
- Uma metáfora do segmento, com as cores da marca e um ciclo que se fecha (o movimento termina num gesto da marca e recomeça).
- `prefers-reduced-motion`: desenho parado, completo.
- O `aria-live` com o texto da espera continua no `CopilotThread`; o loader fica `aria-hidden`.

Exemplo validado (Agafarma, farmácia): `CopilotThread/CopilotPulseLoader/`. Um
eletrocardiograma em `pathLength=100` sobre um traçado claro; um segmento azul
de 28 (`stroke-dasharray: 28 128`) percorre a linha de `dashoffset: 28` até
`-100` em 1,8 s. A ponta chega ao fim em 100/128 do ciclo (~78%). Nesse ponto o
coração da marca, no disco amarelo, bate (escala 1 → 1,22 → 0,96 → 1,1) e um
halo amarelo cresce e some. Batimento e traço usam a mesma duração; mudar uma
exige recalcular os percentuais da outra.

Metáforas para outros segmentos: sacola enchendo (moda), cabide balançando,
carrinho andando (varejo), engrenagem com o selo (autopeças). Sempre terminar no
símbolo da marca.

## Portão antes de rodar ou publicar

Em `src/components/Copilot`, nenhum resultado visível pode sobrar:

```bash
rg -n -i "storename|agafarma|FFD600|007BB6|dor de cabeça|protetor solar|vitamina c|fralda" src/components/Copilot
rg -n "chat-header|assistant-avatar|truck-loader|volvo-wordmark|fleet moving|around people|The assistant is|Reconnecting|Channel unavailable|Assistant not configured|Your fleet" src/components/Copilot
```

Na própria Agafarma o primeiro comando devolve resultados por definição; nas
outras lojas, nenhum.

Comentários de código citando o template original não aparecem ao usuário e
podem ficar. Strings renderizadas, imports e assets não.

No browser, com o painel aberto:

- cabeçalho na cor da navbar, com o logo da loja;
- avatar com o símbolo da marca;
- mandar uma pergunta e ver o loader novo enquanto a resposta não chega;
- nenhum texto em inglês no painel.
