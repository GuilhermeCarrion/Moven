# Moven — Funcionalidades e Regras de Negócio

> Sistema de gestão para estúdios de Bungee Fitness. Documenta o que está implementado, as regras de negócio e o estado atual de cada parte.
> Branch de desenvolvimento: `develop` · Produção: `main`.

---

## 1. Visão geral

O Moven centraliza a operação de uma academia: **alunos, professores, planos/pacotes de crédito, aulas, agendamentos** e **automação de comunicação via WhatsApp**. É **multi-tenant** (várias academias no mesmo sistema, isoladas por `academyId`) e de uso **interno** — o aluno não acessa o sistema, apenas recebe mensagens.

Duas entregas:
- **Entrega 1 (base):** todo o núcleo funcional, pronto e em deploy. ✅
- **Entrega 2 (automação):** fila de Jobs + WhatsApp. Mecânica pronta e testada com **mocks**; integração real com a Meta pendente.

---

## 2. Stack e arquitetura

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 16 (App Router), React, Tailwind CSS 4, TanStack Query, React Hook Form |
| Backend | Next API Routes, arquitetura **Controller → Service → Repository** |
| Validação | Zod (compartilhado front/back) |
| Banco | PostgreSQL via Prisma ORM (dev: Supabase · prod: Neon) |
| Auth | JWT + bcrypt |
| Automação | node-cron + tabela `Job` (fila em banco) |

**Princípios:**
- **Controller** valida entrada e traduz erro → HTTP. **Service** contém as regras de negócio. **Repository** é o único que fala com o banco.
- **Erro central:** classe `AppError(mensagem, status)` + `handleError` — status HTTP corretos (404/409/500) num só lugar.
- **Multi-tenant:** todo dado é escopado por `academyId`.

---

## 3. Autenticação e controle de acesso (RBAC)

- **Login** (`POST /api/auth/login`): valida credenciais, retorna JWT (7 dias). Erros de credencial → **401** com mensagem unificada (não revela se o e-mail existe).
- **Perfil** (`GET /api/auth/me`): dados do usuário logado.
- **`authenticateRequest`** — valida o token (prova de identidade).
- **`authorizeRequest(req, [roles])`** — valida o token **e** o papel, lendo a role **do banco** (revogação vale na hora).

**Papéis:**
| Papel | Acesso |
|---|---|
| `ADMIN` / `GESTOR` | Gestão geral (alunos, professores, planos, aulas, agendamentos) |
| `PROFESSOR` | Aulas, agendamentos e presença |
| Qualquer logado | **Registrar presença** (atendente também pode) |

Distinção de erro: **401** = identidade inválida · **403** = logado, mas sem permissão.

---

## 4. Módulos

### 4.1 Alunos
CRUD completo: criar, listar, ver, editar, **inativar** (soft — preserva histórico).
- **CPF único por academia** (`@@unique([academyId, cpf])`).
- **Limites físicos (segurança do Bungee):** peso entre **42 e 107 kg**, altura ≥ **140 cm** — validados no Zod (front e back).
- Tela `/alunos`: lista com **busca** (nome/CPF), **toggle de inativos**, modal de criar/editar, e modal de **pacotes** do aluno.

### 4.2 Professores
CRUD completo com **soft-delete** (`deletedAt`/`active`).
- **CPF único por academia.**
- **Híbrido:** campo `userId?` opcional — o professor existe na agenda sem login, e ganha uma conta `User` (role PROFESSOR) quando precisar logar. *(A criação do login em si é futura.)*
- **Regra:** não é possível **inativar** um professor que tem **aula futura** marcada (bloqueia com 409).
- Tela `/professores`: lista + busca + modal.

### 4.3 Planos e Pacotes
Distinção central: **`Plan` = catálogo** (o produto que a academia vende) · **`StudentPackage` = a compra** de um aluno.

- **Plan:** `name`, `credits` (nº de aulas), `validityDays`, `price`, `active`, `isTrial`. Nome único por academia. "Deletar" = **desativar** (preserva pacotes vendidos).
- **StudentPackage:** ao **atribuir** um plano a um aluno, o servidor **deriva** `creditsTotal`/`creditsRemaining` (= `plan.credits`) e `expiresAt` (= `startedAt + validityDays`). O gestor só escolhe aluno + plano.
- **Status do pacote:** `ACTIVE` → `DEPLETED` (créditos zeraram) / `EXPIRED` (venceu) / `CANCELLED` (manual).
- **Renovação:** é simplesmente atribuir um novo pacote (sem código extra).
- **Aula experimental:** um plano com `isTrial = true` (é cobrada, ex.: R$50). Limitada a **1x por aluno** — o `assign` bloqueia a segunda atribuição de plano experimental. Depois disso o aluno usa planos comuns (avulsa/pacote).
- **Pagamento NÃO é processado pelo sistema** — o gestor registra o pacote manualmente.
- Tela `/planos` (catálogo) + atribuição/listagem de pacotes na ficha do aluno.

### 4.4 Aulas e Agendamentos
**Aula (`ClassSession`):** `name`, `professorId`, `startAt`, `durationMin` (padrão 60), `capacity`, `minCapacity` (padrão 3), `status` (OPEN/CANCELLED/COMPLETED). Não há duas aulas no mesmo horário por academia.

**Agendamento (`Appointment`)** — dois eixos de estado independentes:
- `status` (ciclo): `BOOKED` → `CONFIRMED` / `CANCELLED` / `RESCHEDULED`.
- `attendance` (presença): `PENDING` → `PRESENT` / `ABSENT` / `NO_SHOW`.

**Regras do ciclo:**
- **Agendar:** exige aluno **ativo**, aula **aberta**, **vaga** e **pacote ativo com crédito**. Cria o agendamento **e debita 1 crédito** na **mesma transação** (`createWithDebit`). Sem pacote → 409.
- **Lotação:** conta só agendamentos **ativos** (BOOKED/CONFIRMED) — cancelar **libera a vaga**.
- **Confirmar:** `BOOKED → CONFIRMED`.
- **Cancelar:** estorna o crédito **só se** cancelou com **≥ 2h** de antecedência; em cima da hora, perde o crédito. (Transação: cancela + devolve crédito + reativa pacote se estava DEPLETED.)
- **Remarcar:** fecha o antigo (`RESCHEDULED`) e cria um novo na aula de destino **sem novo débito** (carrega o mesmo pacote). Guarda `rescheduleFromId`.
- **Presença:** só na **janela ±30min** em torno da aula. **Qualquer usuário logado** registra; grava `checkedInById` (auditoria).
- Tela `/agendamentos`: **agenda do dia** com navegação por botões (‹ ›), cards de aula com ocupação, e modal pra agendar aluno + marcar presença.

### 4.5 Automação (fila de Jobs + WhatsApp)
Padrão **Produtor-Consumidor / Fila de Jobs persistida em banco**, com **worker de polling** (node-cron) e **despacho por handlers**.

- **`Job`:** `type`, `status` (PENDING/PROCESSING/SENT/FAILED), `relatedId`, `payload` (JSON), `scheduledFor`, `attempts`/`maxAttempts`, `lastError`.
- **Fila** (`JobService`/`JobRepository`): `enqueue` (com **dedup** por `type + relatedId`), `claimDue` (pega e trava jobs prontos), `markSent`, `markFailed` (**retry**: 3 tentativas, 1h de intervalo).
- **Worker** (`src/worker/`): cron a cada minuto → `processor` orquestra a rodada → `handlers` (um por tipo) fazem o trabalho.
- **Cliente WhatsApp** (`src/server/whatsapp/`): interface `WhatsAppClient` com `sendTemplate`/`sendText`. Implementações **mock** (loga) e **cloud** (Graph API), selecionadas por `WHATSAPP_MODE`. Padrão = **mock** (seguro).
- **Produtores:** agendar aula → enfileira `PRESENCE_CONFIRMATION` (`scheduledFor = startAt - 12h`); cadastrar aluno → `WELCOME`. Enfileiramento é **fire-and-forget** (protegido por try/catch pra não quebrar a ação principal).
- **Webhook** (`/api/webhooks/whatsapp`): `GET` (verificação — ecoa o `hub.challenge`) + `POST` (recebe, **sempre responde 200**). Interpreta a resposta do aluno (`confirmar`/`cancelar`) → acha o aluno pelo telefone → confirma/cancela o próximo agendamento ativo.
- **Ferramentas de dev** (`/api/dev/*`, bloqueadas em produção): enfileirar job, rodar o worker on-demand, simular resposta inbound.

**Fluxos previstos:** confirmação de presença (12h antes), boas-vindas, aviso de expiração de plano.

---

## 5. Regras de negócio (consolidado)

| # | Regra |
|---|---|
| 1 | CPF único **por academia** (aluno e professor). |
| 2 | Aluno: peso 42–107 kg, altura ≥ 140 cm (segurança). |
| 3 | Inativação preserva histórico (soft-delete). |
| 4 | Professor com aula futura **não pode** ser inativado. |
| 5 | Créditos e validade do pacote são **derivados do plano** no servidor. |
| 6 | Aula experimental (`isTrial`): **1x por aluno**. |
| 7 | Agendar exige **pacote ativo com crédito**; débito é **atômico** (transação). |
| 8 | Lotação conta só agendamentos ativos (cancelar libera vaga). |
| 9 | Cancelar **≥ 2h antes** estorna o crédito; depois, não. |
| 10 | Remarcar não cobra crédito novo. |
| 11 | Presença só na janela **±30min**; qualquer usuário logado registra. |
| 12 | Capacidade máx. por aula (config.) e mínimo de 3 alunos (`minCapacity`). |
| 13 | Automação: **dedup** (1 job por evento) + **retry** (3x, 1h). |
| 14 | Pagamento **não** é processado pelo sistema (registro manual). |

---

## 6. Modelo de dados (entidades principais)

```
Academy 1─* User        (login + role por academia)
Academy 1─* Student ─* StudentPackage *─1 Plan
Academy 1─* Professor   (userId? → User)
Academy 1─* ClassSession *─1 Professor
ClassSession 1─* Appointment *─1 Student
Appointment *─1 StudentPackage   (de qual pacote saiu o crédito)
Academy 1─* Job         (fila de automação)
```

Enums: `Role` · `AppointmentStatus` · `AttendanceStatus` · `ClassSessionStatus` · `StudentPackageStatus` · `JobType` · `JobStatus`.

---

## 7. Padrões e convenções

- **Rotas do painel:** URLs limpas via route group `(painel)` (`/alunos`, `/professores`, `/planos`, `/agendamentos`).
- **Tema:** tokens de cor no `globals.css` (marca: ciano `#0891B2` primária, amarelo `#FACC15` destaque). Re-tematizável trocando os tokens.
- **Validação compartilhada:** o mesmo schema Zod valida no front (UX) e no back (segurança).
- **Dinheiro/Decimal:** chega como string no JSON (formatado com `Intl.NumberFormat`).
- **Erro no front:** helper `apiError` lê o `{ error }` padronizado do backend.

---

## 8. Estado atual

| Área | Estado |
|---|---|
| Autenticação + RBAC | ✅ Pronto |
| Alunos / Professores | ✅ Pronto |
| Planos / Pacotes / Créditos | ✅ Pronto |
| Aulas / Agendamentos / Presença | ✅ Pronto |
| Deploy (Vercel) | ✅ Base no ar (prod → Neon) |
| Fila de Jobs + Worker | ✅ Pronto |
| Cliente WhatsApp | 🟡 **Mock** pronto; real (Cloud API) implementado mas **dormente** |
| Webhook | ✅ Pronto (testado com payload simulado) |
| Integração real Meta | 🔴 Pendente (número/WABA/verificação) |
| Deploy do worker (VPS + cron) | 🔴 Pendente |

### Pendências / futuro
- Ativar WhatsApp real (`WHATSAPP_MODE=cloud` + número + WABA + pagamento).
- Subir worker na **VPS** (persistente) com HTTPS pro webhook.
- **Recorrência de aulas** ("lançamento") com débito de crédito **tardio**.
- Reativar professor/aluno; ficha detalhada do aluno; relatórios; testes automatizados; cookies httpOnly + refresh + recuperação de senha; rate limiting.
