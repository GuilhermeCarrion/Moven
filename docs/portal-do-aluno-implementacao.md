# Portal do Aluno — Guia de Implementação

> Documento de **estudo**: explica as decisões, as funções/arquivos principais e como
> tudo se encaixa. Cobre desde o início do Portal do Aluno até a auditoria de agendamentos.
> Status: **entregue** · Branch: `develop`.

---

## 1. O que foi construído

Quatro pilares + refinamentos:

1. **Auth do aluno** — login por **CPF + data de nascimento**, sessão própria, isolada do staff.
2. **3 abas** (mobile-first + desktop): **Aulas** (agenda + agir), **Minhas Aulas**
   (histórico agrupado por aula com linha do tempo), **Perfil** (editar e-mail/peso/altura).
3. **Auto-cadastro público** — funil de entrada que termina com handoff pro WhatsApp.
4. **Auditoria + regras de tempo** — log imutável de eventos por agendamento (quem/quando/o quê)
   e a regra "aluno só mexe antes do início da aula".

Refinamentos: header fixo com **crédito + boas-vindas**, aviso ao **cancelar sem estorno**,
responsividade (top nav no desktop / bottom nav no mobile), correções de UX.

---

## 2. Decisões de arquitetura (e o porquê)

| Decisão | Por quê |
|---|---|
| **Sessão self-contained** (JWT de 7 dias com `{ studentId, academyId, kind: "student" }`), **sem** `User`, **sem** refresh | O login é CPF+nascimento (não e-mail/senha). Criar um `User` falso só pra reusar a sessão do staff era hacky. A revogação vem do **check de `active` a cada request** (inativou o aluno → token para de valer). Simples e seguro o bastante pro MVP. |
| **Cookie separado** `moven_aluno` | Não colide com os cookies do staff; um navegador pode ter os dois sem se atrapalhar. |
| **Autorização por propriedade** (eixo novo) | Além de RBAC (staff) e multi-tenant (`academyId`), o aluno só **lê/age no que é dele**: o `studentId` vem **sempre do token**, nunca do corpo; ações sobre agendamento checam dono antes de agir. |
| **URLs pt-BR (`/aluno`) + API en (`/api/student`)** | URLs amigáveis pro aluno; API segue o inglês do resto (`/api/students`). Route group `(portal)` agrupa o shell autenticado sem aparecer na URL. |
| **Dois contextos de auth independentes** | O `AuthProvider` (staff) e o `StudentAuthProvider` convivem; o interceptor do axios foi ajustado pra **não** redirecionar quem está em `/aluno` ou `/cadastro` pro login do staff. |
| **Casca fina sobre o core** | O portal **não reescreve** regra de crédito/lotação/estorno: ele chama o `AppointmentService` existente, só injetando o `studentId` e validando propriedade/tempo. |
| **Auto-cadastro entra direto** (não "pendente") | O gate real já existe: sem **pacote ativo com crédito**, o aluno não agenda nada. Aprovação formal ficou como refino futuro. |
| **Auditoria = log append-only** (`AppointmentEvent`) | Pra ser à prova de disputa, o registro é **imutável e desacoplado** do dado operacional. Gravado **dentro do core** → portal, painel e WhatsApp logam automaticamente, só mudando o `actor`. |
| **Regra de tempo em dois lugares** | "Não agendar aula que já começou" no **core** (vale pra todos). "Aluno só confirma/cancela antes do início" **só no portal** (a academia continua podendo ajustar depois). |

---

## 3. Modelo de dados (o que mudou)

- **`AppointmentEvent`** (tabela nova, append-only, sem relations — só IDs indexados):
  `type`, `actorType`, `actorId?`, `creditRefunded?`, `note?`, `appointmentId`,
  `classSessionId`, `studentId`, `academyId`, `createdAt`.
- **Enums novos:** `AppointmentEventType` (BOOKED/CONFIRMED/CANCELLED/RESCHEDULED/PRESENT/ABSENT/NO_SHOW)
  e `ActorType` (STUDENT/STAFF/SYSTEM).
- **`Appointment.confirmationSentAt`** — carimbado pelo job de confirmação; distingue
  "nunca pedimos" de "pedimos e não respondeu".
- **Sem role nova / sem `Student.userId`** — consequência da decisão de sessão self-contained.

---

## 4. Arquivos (resumo por área)

### Backend
- `middleware/StudentAuthMiddleware.ts` — `authenticateStudent`: valida o token do aluno + `active`.
- `services/StudentAuthService.ts` — login (CPF+nascimento) e perfil de sessão.
- `services/StudentAppointmentService.ts` — `listDay`, `book`, `confirm`, `cancel`, `history` + guards de propriedade/tempo.
- `services/StudentProfileService.ts` — `get` (perfil + pacote), `updateOwnProfile`, `getCredits`.
- `services/StudentPublicService.ts` — `academyInfo`, `signup` (reusa `StudentService.create`).
- `services/AppointmentService.ts` — **core instrumentado**: grava `AppointmentEvent` e recebe `actor`.
- `repositories/AppointmentEventRepository.ts` — `record`, `listByStudent`, `listByAppointment` + tipo `Actor`.
- `controllers/StudentAuth|StudentAppointment|StudentProfile|StudentPublic Controller.ts`.
- `app/api/student/*` — `login`, `logout`, `me`, `classes`, `appointments(/[id])`, `history`, `profile`, `credits`.
- `app/api/public/academies/[id](/students)` — rotas públicas do auto-cadastro.

### Front
- `contexts/StudentAuthContext.tsx` — sessão do aluno (espelho do staff, com `apiPublic`).
- `components/student/*` — `ProtectedStudentRoute`, `StudentTopNav`, `StudentBottomNav`, `StudentHeader`, `StudentLoginForm`, `ConfirmDialog`.
- `app/aluno/layout.tsx` (provider) · `app/aluno/(portal)/layout.tsx` (shell) · `template.tsx`.
- `app/aluno/login` · `app/aluno/(portal)/{aulas,minhas-aulas,perfil}` · `app/cadastro/[academyId]`.
- `hooks/useStudentClasses.ts`, `useMyAppointments.ts`, `useStudentHistory.ts`, `useStudentProfile.ts`, `useStudentCredits.ts`.
- `lib/cancelWindow.ts` — `CANCEL_WINDOW_HOURS` + `willRefund` (espelha o back).

### Schemas (Zod)
`studentAuth`, `studentAppointment`, `studentProfile`, e reuso de `students.schema` (limites do Bungee) no auto-cadastro.

---

## 5. Funções principais

- **`authenticateStudent(req)`** — lê `moven_aluno`, valida o token (`kind: "student"`) e confere
  `active` no banco. É o eixo de "só o dono entra".
- **`StudentAppointmentService.book/confirm/cancel`** — injetam `{ type: "STUDENT", id: studentId }`
  e, antes de confirmar/cancelar, rodam `loadOwned` (propriedade) + `assertBeforeStart` (tempo).
- **`StudentAppointmentService.history`** — lê o log (`listByStudent`), busca as aulas e os
  agendamentos ativos, e **agrupa por aula** com a linha do tempo.
- **`AppointmentService.record(...)`** (privado) — grava o `AppointmentEvent` best-effort
  (se falhar, loga e **não** derruba a ação principal).
- **`StudentProfileService.updateOwnProfile`** — só email/peso/altura; os demais campos são
  impossíveis de alterar (nem no schema, nem no service).
- **`StudentPublicService.signup`** — valida a academia e reusa `StudentService.create`
  (CPF único + job WELCOME).

---

## 6. Como tudo trabalha junto (fluxos)

**Login:** `POST /api/student/login` (CPF+nascimento) → valida, emite JWT 7d no cookie
`moven_aluno`. O `StudentAuthContext` restaura via `GET /api/student/me`; `ProtectedStudentRoute`
barra quem não tem sessão.

**Agendar:** aba Aulas → `POST /api/student/appointments` → `StudentAppointmentService.book`
→ `AppointmentService.create` (checa aula aberta, **não passada**, vaga, pacote ativo) →
`createWithDebit` (cria + debita 1 crédito na mesma transação) → grava evento **BOOKED** →
enfileira o job de confirmação (12h antes). O header de crédito recalcula (invalidação da query).

**Cancelar:** o front calcula `willRefund` (≥2h?) e, se **não** estorna, abre o `ConfirmDialog`.
O back (`cancel`) recalcula de verdade, estorna só se ≥2h, e grava evento **CANCELLED** com
`creditRefunded`. Se a aula já começou, o portal bloqueia (`assertBeforeStart`).

**Histórico:** `GET /api/student/history` → um grupo por aula, com todos os eventos. A UI deriva
o "headline" (Confirmada/Cancelada/Compareceu...) e mostra a timeline no card expandível.

**Auditoria (a sacada):** como o `record` está **dentro do `AppointmentService`**, qualquer
canal que chama o core loga sozinho — **portal** (`STUDENT`), **painel** (`STAFF`, com `userId`)
e **webhook do WhatsApp** (`STUDENT`, nota "via WhatsApp"). Uma peça, três canais.

**Auto-cadastro:** `/cadastro/[academyId]` → `POST /api/public/academies/[id]/students` →
cria o `Student` (reuso total) → tela de sucesso com texto pronto pro WhatsApp (a academia
marca a aula experimental).

---

## 7. Segurança (resumo)

- `studentId` **sempre do token**; nunca do corpo.
- Checagem de **propriedade** antes de confirmar/cancelar.
- **Rate limit**: login do aluno e auto-cadastro público.
- **`active` por request** = revogação imediata.
- Mensagens **unificadas** no login (anti-enumeration).
- Perfil: campos sensíveis (celular, nome, CPF, nascimento, pacote) **impossíveis** de editar.

---

## 8. Pendências / próximos passos

- **Tela da academia** pra ver a linha do tempo do aluno (os dados já existem via `history`
  / `listByStudent`) — task futura.
- **Atomicidade total** do log (mover o insert do evento pra dentro da transação do repo) — opcional.
- **WhatsApp real** (Meta) — a auditoria já captura as confirmações/cancelamentos via webhook.
