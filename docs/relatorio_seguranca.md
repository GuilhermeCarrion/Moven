# Relatório de Segurança — CRM Moven (login + RBAC)

> Varredura executada pela skill `docs/skill-seguranca-crm-rbac.md`.
> Escopo: CRM com login/sessão e RBAC (`ADMIN`, `GESTOR`, `PROFESSOR`), isolamento por `academyId`. WhatsApp fora do escopo da skill (achado relacionado marcado como extra).
> Método: leitura de `prisma/schema.prisma`, `src/lib/auth/*`, `src/server/middleware/AuthMiddleware.ts`, `src/server/services/AuthService.ts`, `src/server/controllers/AuthController.ts`, `src/lib/rateLimit.ts`, `src/lib/prisma.ts`, `src/app/api/**/*`, `repositories/*`, `seed.ts`, `next.config.ts`. Sem segredos exibidos.

## Resumo executivo

| Severidade | Qtd |
|---|---|
| CRÍTICA (quebra explorável hoje) | 5 |
| ALTA | 8 |
| MÉDIA | 5 |
| BAIXA / endurecimento | 4 |

O essencial da arquitetura está certo (access curto + refresh hasheado com rotação, RBAC com checagem no banco, `academyId` vindo do JWT na maioria das rotas). Mas há **quebras reais**: rate-limit que nunca bloqueia, logout que não limpa flags, fallback `Bearer` que anula o `httpOnly`, rota `dev/enqueue` sem auth e busca global de aluno por telefone.

## Quebras de segurança (corrigir primeiro)

### [CRÍTICA-01] Rate limit do login nunca bloqueia — brute-force livre
- **Onde:** `src/lib/rateLimit.ts:30-34` + `src/server/controllers/AuthController.ts:19-28`
- **Falha:** quando `bucket.count > limit`, retorna `{ allowed: true, ... }`. O correto seria `allowed: false`. O `if (!rl.allowed)` no controller nunca dispara.
- **Impacto:** as 10 req/min por IP não existem. Restou só o lockout por conta (5 tentativas/15min), que é burlável pulverizando e-mails e não protege contra credential stuffing distribuído.
- **Reprodução:** 20x `POST /api/auth/login` com senha errada do mesmo IP → nunca recebe 429 do rate limiter.
- **Correção:** retornar `allowed: false` ao exceder; adicionar `Retry-After`; trocar mapa em memória por Redis/DB em prod (serverless perde o `Map` a cada instância/cold start).

### [CRÍTICA-02] `clearAuthCookies` perde as flags — logout não invalida no navegador
- **Onde:** `src/lib/auth/cookies.ts:42` — `...baseCookie` sem `()`.
- **Falha:** espalha o objeto-função em vez de `{ httpOnly, secure, sameSite }`. Os cookies de limpeza saem sem `httpOnly/secure/sameSite` e podem não sobrescrever os originais (path/flags divergentes = cookie duplicado no browser).
- **Impacto:** sessão "encerrada" no banco mas `moven_access` vivo no navegador até expirar; em HTTP o cookie pode trafegar sem `secure`.
- **Correção:** `...baseCookie()` nos dois `set` do `clearAuthCookies`, com mesmos `path` do `setAuthCookies`; testar logout verificando `Set-Cookie` com `Max-Age=0` + flags.

### [CRÍTICA-03] Fallback `Authorization: Bearer` anula o `httpOnly`
- **Onde:** `src/server/middleware/AuthMiddleware.ts:12-17`
- **Falha:** se não há cookie, aceita token do header. O doc `docs/autenticacao-sessao.md` migrou para cookie justamente para XSS não roubar token — o fallback reabre a porta: qualquer XSS que leia um token (log, erro, outra aba) reutiliza via `curl -H "Authorization: Bearer ..."`.
- **Correção:** remover o fallback; aceitar **só** `moven_access` via cookie. Se precisar de Bearer para app nativo futuro, isolar em rota/escopo próprio com token distinto e curto.

### [CRÍTICA-04] `POST /api/dev/enqueue` sem autenticação e com `academyId` do body
- **Onde:** `src/app/api/dev/enqueue/route.ts:7-19` (só `devOnly()` por `NODE_ENV`)
- **Falha:** aceita `academyId/type/relatedId/payload/scheduledFor` sem `authorizeRequest`. `devOnly()` não é controle de acesso — basta `NODE_ENV !== production` (preview, staging mal configurado, teste local exposto) para escrita arbitrária de `Job` em qualquer academia.
- **Correção:** exigir `authorizeRequest(req, [ADMIN])` + derivar `academyId` do token (nunca do body); em prod, remover ou bloquear rotas `/api/dev/*` no deploy, não só por env.

### [CRÍTICA-05] Busca de aluno por telefone sem `academyId` — quebra de tenant (extra-escopo WhatsApp, mas afeta CRM)
- **Onde:** `src/server/repositories/StudentRepository.ts:37-39` + `src/server/whatsapp/inbound.ts:38-40`
- **Falha:** `findByPhone(phone)` global + `phone.replace(/^55/,"")`. Telefone repetido em duas academias → `findFirst` devolve a errada; intenção (confirmar/cancelar) executa no `appointment` da academia errada.
- **Correção:** escopar por academia (ex.: resolver academia pelo número de destino do webhook/CNPJ da conta, ou exigir vínculo 1:1 verificado); nunca `findFirst` global em entidade tenant-scoped.

## Falhas altas

### [ALTA-01] Rotas `authenticate`-only não checam `active` — desativado lê até expirar
- **Onde:** `src/server/middleware/AuthMiddleware.ts:9-44` (sem DB), `src/app/api/auth/me/route.ts:9`, `src/server/services/AuthService.ts:121-127` (`getProfile` sem checar `active`), `GET students/professors/plans/appointments/class-sessions`.
- **Impacto:** usuário desativado (`active=false`) com access válido continua listando/detalhando por até 15 min.
- **Correção:** `getProfile` nega `!active`; ou trocar leituras sensíveis para `authorizeRequest` (que já checa `active`).

### [ALTA-02] `JWT_SECRET` sem validação (fail-open)
- **Onde:** `src/lib/auth/tokens.ts:15,22` (`as string`)
- **Impacto:** segredo ausente/curto → `jsonwebtoken` assina com `undefined`/string fraca; todos os access tornam-se forjáveis ou a app quebra em runtime.
- **Correção:** validar no boot (`>=32 bytes`, charset), `throw` se ausente; nunca cast sem check.

### [ALTA-03] Reuso de refresh gera só 401 — sem revogação de emergência
- **Onde:** `src/server/services/AuthService.ts:78-114`
- **Falha:** rotação deleta só o token usado. Reuso (sinal clássico de roubo/replay) não revoga as demais sessões do usuário nem alerta.
- **Correção:** ao detectar reuso/expirado de conta válida, `deleteAllForUser(userId)` + log/auditoria + (opcional) e-mail de segurança.

### [ALTA-04] Writes com `where: { id }` puro — IDOR/TOCTOU latente
- **Onde:** `src/server/repositories/PlanRepository.ts:34`, `StudentRepository.ts:41-46`, `ProfessorRepository.ts:30,37`, `ClassSessionRepository.ts:62`, `StudentPackageRepository.ts:54`, `AppointmentRepository.ts:80,89,95,102,124,144`
- **Falha:** padrão "lê com `{id, academyId}`, escreve com `{id}`". Hoje o service checa antes, mas entre check e write há janela + qualquer esquecimento futuro vira cross-tenant write.
- **Correção:** `updateMany/deleteMany({ id, academyId })` e checar `count===1`; ou where composto atômico.

### [ALTA-05] Enumeração de contas via lockout
- **Onde:** `src/server/services/AuthService.ts:36-48`
- **Falha:** e-mail inexistente → sempre 401 genérico; e-mail existente com 5 erros → 429 `"Muitas tentativas..."`. Atacante distingue conta válida.
- **Correção:** resposta e tempo uniformes; lockout silencioso (mesma mensagem 401 + atraso) ou 429 genérico também para inexistentes (com rate-limit por IP corrigido).

### [ALTA-06] Seed vaza senha do admin no log
- **Onde:** `prisma/seed.ts:41` — `console.log(email, password)`
- **Impacto:** credencial inicial em logs de CI/Vercel.
- **Correção:** logar só `email` + aviso de troca; nunca a senha.

### [ALTA-07] Singleton do Prisma invertido
- **Onde:** `src/lib/prisma.ts:14` — `if (production) cache`, quando o padrão é cachear em **dev**.
- **Impacto:** em dev cada HMR abre novo `PrismaClient` → exaustão de conexões (DoS local); em prod o comportamento depende de instância.
- **Correção:** `if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma`.

### [ALTA-08] Sem headers de segurança
- **Onde:** `next.config.ts:3-6`
- **Falta:** `HSTS`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, `CSP`, `poweredByHeader: false`.
- **Correção:** adicionar via `headers()` no Next + validar com observatory/curl.

## Médias (endurecer em seguida)

| # | Título | Onde | Correção |
|---|---|---|---|
| M-01 | IP via `x-forwarded-for` confiável cegamente (spoof) | `src/lib/rateLimit.ts:41-45`, `AuthController.ts:18` | usar IP da plataforma (`x-real-ip`/runtime) e tratar XFF como dica, não prova; rate-limit também por conta/dispositivo |
| M-02 | Política de senha fraca + `trim()` silencioso | `src/schemas/auth.schema.ts:5-8` | mínimo 8–12, checar vazadas (haveibeenpwned k-anon), não `trim` senha sem avisar; adicionar reset com token hasheado + expiração + logout-all |
| M-03 | Sessões ilimitadas e sem purga | `SessionRepository.ts`, `AuthService.ts:130-143` | teto por usuário (ex.: 5, evict oldest) + cron `deleteMany(expiresAt < now)` |
| M-04 | `academyId` do JWT sem reconfirmação (stale) | `AuthMiddleware.ts:27-33,56-60` | em rotas sensíveis reconfirmar `user.academyId === token.academyId`; incluir `roleVersion`/troca de academia invalida access no próximo `authorize` |
| M-05 | Sem CSRF além de `SameSite=Lax` | `cookies.ts:10-16` | `Lax` é base, não garantia: checar `Origin/Host` em mutações ou CSRF token para fluxos críticos |

## Baixas / higiene

- **Listagens sem paginação** (`StudentRepository.findAll`, demais `index`) → enumeração em massa + peso. Adicionar paginação/limite default.
- **PII em log** (`inbound.ts:35`, `mock.ts`) → logar IDs/hashes, não telefone/nome/conteúdo.
- **`ProtectedRoute` só client-side sem checar role** (`src/components/ProtectedRoute.tsx`) → ok como UX, mas documentar que barreira real é o backend; adicionar gate por role só para UX.
- **Check-then-act sem transação** (capacidade/duplicate em `AppointmentService`) → overbooking sob corrida; usar transação com lock/contagem atômica + unique onde couber.

## O que está bom (manter)

- Access 15min + refresh opaco hasheado com rotação; senha com `bcrypt`; mensagens de login genéricas (exceto enumeração acima).
- `authorizeRequest` consulta `role/active` no banco por request (role stale não persiste em writes).
- `academyId` do token na maioria das rotas (não do body), `findFirst({id, academyId})` nas leituras.
- Webhook com `timingSafeEqual` + fail-closed sem secret; `handleError` sem vazar stack; `.env*` no `.gitignore`.

## Plano de correção sugerido (ordem)

1. Rate limit (`allowed:false` + Redis), `clearAuthCookies()` com `()`, remover Bearer fallback.
2. Auth em `/api/dev/enqueue` (+ `academyId` do token), escopar `findByPhone`, validar `JWT_SECRET` no boot.
3. `getProfile` nega inativo, reuse-de-refresh revoga tudo, writes atômicos com `academyId`, remover log de senha, corrigir singleton Prisma, headers de segurança.
4. Endurecimento: anti-enumeração, política de senha + reset, teto/purga de sessões, Origin-check, paginação, menos PII em log, transação em booking.
