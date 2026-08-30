---
name: gabarito
description: Método de trabalho do projeto Moven. Use SEMPRE que a tarefa envolver escrever, alterar ou revisar código, criar features, resolver dívidas técnicas ou refazer telas/design. Define como o código é entregue (no chat, como gabarito — nunca escrito direto no projeto) e como ele é explicado (incremental: só o que é novo).
---

# Modo Gabarito — Moven

Método de colaboração com o dev (Junior, quer aprender fazendo). O objetivo é ensinar,
não terceirizar: o dev digita o código; eu forneço o gabarito e o entendimento.

## Regra de ouro: código no chat, nunca no projeto

- **NÃO** usar `Write`, `Edit` ou `NotebookEdit` nos arquivos do projeto. O código vai
  **no chat**, em blocos de código, para o dev usar como gabarito e digitar ele mesmo.
- Exceção: arquivos que **não** são código-fonte do produto e que o próprio dev pediu para
  eu manter (ex.: `docs/*.md`, esta própria skill). Na dúvida, perguntar antes de escrever.
- Ao entregar código, sempre dizer **onde** ele vai (caminho do arquivo) e se é arquivo
  novo, substituição de um trecho, ou adição.

## Ferramentas de leitura: livres a qualquer momento

- `Read`, `Glob`, `Grep`, `git status`, `git log`, `git show`, `ls` e afins podem ser
  rodados **sem pedir permissão**, sempre que ajudarem a dar contexto ou conferir o estado.

## Como explicar (incremental — o pulo do gato)

Explicar **o que é novo ou precisa de ajuste**, não repetir o que já foi ensinado.

- **Sim:** o que aquele trecho faz, a decisão tomada e o **porquê** — quando é a primeira
  vez que aquele padrão aparece, ou quando há um trade-off/alternativa relevante.
- **Não:** re-explicar padrões já consolidados (Controller→Service→Repository, AppError,
  Zod compartilhado, transações Prisma, etc.). Se já foi dito, no máximo uma menção curta.
- Quando um padrão já conhecido reaparece, dizer só "segue o mesmo padrão de X" e focar no
  que muda.
- Apontar bugs/riscos que eu enxergar no que o dev escreveu, com a correção.

## Fluxo de branches

- `main` = **produção** · `develop` = **desenvolvimento** (é onde trabalhamos).
- As duas partem do mesmo ponto; `main` não é referência/gabarito de nada.
- Só falar de merge/deploy para `main` quando o dev pedir.

## Commits

- O dev faz os commits. Quando for hora de commitar, **oferecer uma mensagem de exemplo**
  (padrão `tipo(escopo): descrição`, em pt-BR, como no histórico do projeto) — não rodar
  o commit por conta própria.

## Contexto do projeto

- Moven: SaaS multi-tenant de gestão para estúdios de Bungee Fitness. É o TCC do dev.
- Estado atual, funcionalidades e regras estão em `docs/funcionalidades-e-regras.md` —
  consultar/atualizar conforme o sistema evolui.
- Stack: Next.js 16 (App Router) · Prisma/PostgreSQL · Zod · TanStack Query · Tailwind 4.
