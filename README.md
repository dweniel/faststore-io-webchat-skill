# faststore-v4-copilot

Skill que instala o copiloto WebChat da Weni numa loja FastStore v4, ou monta
uma demonstração só da página inicial de uma loja que não é FastStore (Wake,
VTEX IO, Shopify, loja própria). As instruções que o agente segue estão em
`SKILL.md`; o código do painel está em `vendor/webchat/` e o servidor da demo
em `scripts/homepage-plugin.mjs`.

## Instalar no Claude Code (plugin)

Este repositório é um marketplace de plugin. Dentro de uma sessão do Claude
Code:

```
/plugin marketplace add dweniel/faststore-io-webchat-skill
/plugin install faststore-v4-copilot@dweniel-skills
```

O repositório é privado: o `git` da máquina precisa ter acesso a ele (login do
GitHub com permissão de leitura).

Para testar uma cópia local sem instalar:

```
claude --plugin-dir /caminho/para/faststore-io-webchat-skill
```

## Instalar no Cursor

Copiar a pasta inteira para `~/.cursor/skills/faststore-v4-copilot`. O Cursor
aplica a skill sozinho quando o pedido combina com a descrição do `SKILL.md`.

## O que a máquina precisa ter

A skill monta e publica a demo com ferramentas comuns: Node 18+, `git` e, para
publicar, o login da Vercel (`npx vercel`). O trilho de loja FastStore real
também pede acesso de leitura ao repositório privado
`weni-ai/webchat-faststore`.
