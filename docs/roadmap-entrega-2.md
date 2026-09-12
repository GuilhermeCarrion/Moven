# Moven — Roadmap Entrega 2 (WhatsApp real) + dívidas restantes

> Planejamento dos próximos passos após a verificação de negócio na Meta.
> Branch de trabalho: `develop` · Produção: `main` (deploy Vercel em `appmoven.com.br`).

Estado atual: mecânica de automação **100% pronta e testada com mocks**. Falta a
**ativação real** na Meta (bloqueada por verificação de negócio, em análise) e rodar o
**worker** em produção. Além disso, sobraram 2 dívidas técnicas de auth (Parte 3 e 4).

---

## EPIC A — Ativar o WhatsApp real (pós-verificação)

| Task | Descrição | Depende de | Prioridade |
|---|---|---|---|
| A1 | **Validar envio de teste**: reenviar `hello_world` e confirmar `delivered` (prova que o 130497 caiu) | verificação aprovada | Alta |
| A2 | **Definir o número**: seguir no número sandbox p/ dev, ou registrar um **número de produção** na WABA (display name + PIN de 2 etapas) | A1 | Alta |
| A3 | **Templates**: escrever e submeter `WELCOME`, `PRESENCE_CONFIRMATION`, `PLAN_EXPIRY` p/ aprovação (com variáveis `{{1}}`…) | verificação aprovada | Alta |
| A4 | **Token permanente**: gerar via System User no Business Manager (o do painel expira em 24h) | — | Média |
| A5 | **Revisar `cloud.ts`**: garantir que envia o template no formato exato aprovado (nome + variáveis + `language`) e trata erros (ex.: 130497) | A3 | Média |
| A6 | **Env de produção**: `WHATSAPP_MODE=cloud`, `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN` | A2, A4 | Média |
| A7 | **Webhook em produção**: configurar callback `https://appmoven.com.br/api/webhooks/whatsapp` + verify token; HMAC passa a validar de verdade (app secret setado) | A6 | Média |

---

## EPIC B — Migrar TODO o sistema para uma VPS (Hostinger)

**Decidido:** o sistema inteiro sai da Vercel e vai pra uma VPS (Hostinger). Isso resolve o
worker (processo longo com `node-cron` roda nativo) e coloca app + worker no mesmo lugar.

| Task | Descrição | Prioridade |
|---|---|---|
| B1 | **Provisionar a VPS**: Node, git, pm2; clonar o repo | Alta |
| B2 | **App Next em produção**: `next build` + `next start` sob **pm2** (restart automático) | Alta |
| B3 | **Worker sob pm2**: `npm run worker` como processo separado (cron nativo) | Alta |
| B4 | **Reverse proxy + HTTPS**: **Caddy** (Let's Encrypt automático) servindo `appmoven.com.br` | Alta |
| B5 | **DNS**: repontar `appmoven.com.br` do IP da Vercel para o **IP da VPS** | Alta |
| B6 | **Banco**: manter no **Neon** (simples) ou migrar Postgres p/ Docker na VPS (futuro) | Média |
| B7 | **Teste ponta-a-ponta**: agendamento → job enfileira → worker processa → WhatsApp envia → webhook confirma | Alta |

Trade-off: mais controle e worker nativo, mas você passa a gerenciar deploy/HTTPS/updates
(a Vercel fazia sozinha). A lógica (`processor`/`handlers`) **não muda**. O `baseURL: "/api"`
relativo e os cookies `secure` continuam funcionando (Caddy garante o HTTPS).

---

## EPIC C — Dívidas técnicas de auth restantes

Da lista original de qualidade, fizemos **Parte 1** (cookies httpOnly + refresh) e
**Parte 2** (rate limiting). Ajustes:

- **Recuperação de senha: NÃO haverá** (autoatendimento). No lugar, gestão de credenciais
  feita por ADMIN/GESTOR (ver C1).

| Task | Descrição | Prioridade |
|---|---|---|
| C1 | **Gestão de usuários e credenciais**: ADMIN gerencia todos (inclusive gestores) e GESTOR gerencia os usuários da sua academia — criar usuário, resetar/definir senha, ativar/inativar, papel. (Substitui a recuperação de senha) | Média |
| C2 | **Testes automatizados** (Parte 4): Vitest — auth (login, lockout, refresh, rotação) + automações (dedup, retry do JobService) | Média |

---

## EPIC E — Inbox de mensagens (WhatsApp dentro do sistema)

Como o número vai ser **API-only** (sem coexistência), a academia precisa de uma interface
própria pra conversar — um inbox estilo "WhatsApp Web" no Moven, na página `/mensagens`
(ainda sem rotas). A Cloud API **não guarda histórico**: nós persistimos tudo.

**Limitação central (molda a UX):** janela de **24h**. Dentro de 24h da última mensagem do
cliente → texto livre. Fora → **só template aprovado**.

**MVP = só texto, com vínculo ao aluno.** Mídia (áudio) fica pra fase 2.

| Task | Descrição | Depende de | Prioridade |
|---|---|---|---|
| E1 | **Schema**: modelos `Conversation` (`contactPhone`, `contactName?`, `studentId?`, `lastInboundAt`, `lastMessageAt`, `unreadCount`) + `Message` (`direction`, `type`, `text`, `waMessageId`, `status`, `timestamp`, `payload`) + migration | — | Alta |
| E2 | **Repositories**: `ConversationRepository` (upsert por telefone, list, findById) + `MessageRepository` (create, listByConversation) | E1 | Alta |
| E3 | **Refatorar webhook/inbound**: persistir **toda** mensagem recebida + upsert da conversa (`lastInboundAt`) + tratar `statuses` (delivered/read/failed); vincular ao aluno via `findByPhone`; a automação confirm/cancel roda **por cima** | E2 | Alta |
| E4 | **Service**: listar conversas, thread; **enviar** (texto se dentro de 24h; senão exigir template) — regra da janela centralizada aqui | E2 | Alta |
| E5 | **Rotas**: `GET /api/conversations`, `GET /api/conversations/:id/messages`, `POST /api/conversations/:id/messages` | E4 | Alta |
| E6 | **UI `/mensagens`**: lista de conversas + thread + composer + banner "fora da janela 24h"; **polling** via React Query (`refetchInterval` ~5–10s) | E5 | Alta |
| E7 | **Fase 2 — mídia (áudio)**: bucket de storage + download (media id → URL → binário) + upload + player/gravador + transcodificação se preciso | E6 | Baixa |

> **Dá pra construir E1–E6 já com mocks/dev tools** (o `/api/dev/inbound` simula recebimento).
> Só a **entrega real** de saída depende do Epic A (WhatsApp ativo).

---

## EPIC D — Redesign do sistema (track separado)

Linguagem visual: **em definição** (claymorphism descartado no sistema; o dev vai buscar
referência). A landing pública fica no claymorphism, isolada (`.clay-scope`), só p/ a Meta.

| Task | Descrição | Prioridade |
|---|---|---|
| D1 | Redesenhar login + telas novas (design system, tokens de cor já existem) | A definir |

**Notas de tela (aplicar quando refatorar):**
- Alunos: adicionar **coluna própria de Créditos** (número), separada do badge de status.

---

## Decisões (atualizadas)

1. **Infra:** ✅ **decidido** — TODO o sistema vai pra **VPS (Hostinger)**: app + worker + Caddy. Fim do serverless/Vercel.
2. **Recuperação de senha:** ✅ **decidido** — **não existirá**. Credenciais controladas por ADMIN/GESTOR (C1).
3. **Número (A2):** ✅ usar o **número sandbox/teste** para dev até ter o **MVP do chat**; número de produção depois.
4. **Identidade Meta:** 🟡 **indefinida** — segue no **CNPJ do parente** (bootstrap) até decidir. Questão é a burocracia administrativa, não recusa de ter um próprio pra Moven.
5. **Storage de mídia (E7):** 🟡 futuro — não domina imagem/storage ainda; preocupação com volume de histórico. Avaliar com calma na fase 2.

---

## Ordem sugerida

1. **D1** (redesign) — o dev já tem um system design feito no Claude Design; próximo foco.
2. **A3** (templates) — pode adiantar em paralelo; não depende da aprovação da Meta.
3. **E1–E6** (inbox só texto) — dá pra construir com mocks; só a entrega real depende do Epic A.
4. **A1** (validar envio) assim que a Meta aprovar.
5. **B** (migração pra VPS) — destrava o worker de verdade + tira da Vercel.
6. **A5/A6/A7** (virar a chave cloud + webhook prod).
7. **C1/C2** (gestão de usuários + testes) — fecham a dívida de qualidade.
8. **E7** (mídia/áudio) — fase 2, depois do texto refinado.
