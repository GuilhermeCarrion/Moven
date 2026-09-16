# Skill de Segurança — CRM com Login + RBAC (sem WhatsApp)

> Uso: auditoria de segurança em sistema estilo CRM (multi-academia/tenant) com login por sessão e permissões RBAC (ADMIN, GESTOR, PROFESSOR).
> Escopo desta skill: autenticação, sessão, autorização RBAC, isolamento por tenant (`academyId`), validação de entrada, segredos, headers/cookies e superfície de API. **WhatsApp/webhook está FORA do escopo desta skill** (se existir, auditar separadamente).

## 1. Quando acionar

- Antes de cada entrega / merge em `develop`/`main`.
- Ao alterar `auth`, `middleware`, `cookies`, `Session`, `User`, qualquer rota `/api/*` ou `prisma/schema.prisma`.
- Quando novo `Role` for criado ou rota mudar de `authenticate` para `authorize` (ou vice-versa).

## 2. Inventário obrigatório (mapear antes de julgar)

1. Listar todos os `Role` no `schema.prisma` e quem pode criar/alterar `User.role`.
2. Listar todas as rotas `/api/*` com matriz: `rota | método | authenticate? | authorize(roles)? | academyId de onde vem?`.
3. Listar fontes de identidade: `JWT access`, `Session/refresh hash`, `cookie flags`, `Bearer fallback?`.
4. Listar onde `academyId` é confiável (do JWT validado) vs. onde vem do `body/query` (nunca confiar).
5. Listar segredos: `JWT_SECRET`, `DATABASE_URL/DIRECT_URL`, seeds, `.env*`, logs.

## 3. Checklist de auditoria

### A. Autenticação e sessão
- [ ] Access token curto (≤15min), assinado, segredo forte (≥32 bytes aleatórios). Falhar *closed* se `JWT_SECRET` ausente/fraco — nunca `as string` sem validação.
- [ ] Refresh opaco (≥256 bits), **só hash no banco** (sha256 ok), rotação com uso único.
- [ ] **Reuso de refresh = incidente**: além de 401, revogar todas as sessões do usuário + logar alerta. Só deletar o token usado é insuficiente.
- [ ] Logout invalida no servidor (`deleteByToken`) + limpa cookies com as **mesmas flags** do `set` (`httpOnly`, `secure`, `sameSite`, `path`).
- [ ] Cookies: `httpOnly: true`, `secure: true` em prod, `sameSite: lax|strict`, `path` mínimo. Sem token em `localStorage` e **sem fallback `Authorization: Bearer`** (reabre vetor XSS que o httpOnly fechou).
- [ ] `getProfile`/`me` nega usuário `active=false`. Todo caminho `authenticate`-only precisa checar `active` — senão usuário desativado lê dados até o access expirar.
- [ ] JWT carrega o mínimo (`userId`, `academyId`); `role`/`active` sempre do banco na hora (fonte da verdade). Se `academyId` do token for usado, revalidar vínculo no banco em rotas sensíveis (evita token stale após troca de academia).
- [ ] Limite de sessões por usuário + limpeza de `Session` expirada (job). Sessão sem teto = crescimento infinito e janelas de abuso.

### B. RBAC (autorização)
- [ ] Regra padrão: **negar por padrão**. Toda rota chama `authorizeRequest(req, [...])`; `authenticateRequest` sozinho só para leitura explicitamente liberada a "qualquer autenticado".
- [ ] Nenhuma checagem só no frontend (`ProtectedRoute`, `AuthContext`, esconder botão). Frontend é UX, não barreira.
- [ ] `ADMIN > GESTOR > PROFESSOR` explícito por rota (criar/editar/deletar). Conferir em especial: `POST/PATCH/DELETE students, professors, plans, class-sessions, appointments, student-packages` e `attendance`.
- [ ] `GET [id]` e `PATCH/DELETE [id]` exigem `academyId` do token + `findFirst({id, academyId})`. `update/delete` com `where: {id}` puro = IDOR/TOCTOU — usar `updateMany/deleteMany({id, academyId})` ou `update` com where composto.
- [ ] Mudança de `role` e `active` restrita a `ADMIN` (+ trilha de auditoria). Não existe auto-elevação via body.
- [ ] Resposta 401 (não autenticado) vs. 403 (sem perfil) sem vazar existência de recurso.

### C. Isolamento multi-tenant
- [ ] **Toda query tem `academyId` do token.** Grep por `findUnique({where:{id}`, `update({where:{id}`, `delete(`, `findFirst({where:{phone` sem `academyId` = suspeito.
- [ ] Buscas globais proibidas: `findByPhone`, `findByCpf`, `findByEmail` sem escopo de academia (colisão cross-tenant e spoofing).
- [ ] Prisma `update` usa filtro atômico com `academyId`; nunca "lê com academy, escreve sem academy".
- [ ] Seed não cria credencial fraca/default, não loga senha, usa `upsert(update:{})` sem sobrescrever `role/senha` existente por acidente.

### D. Brute-force e rate limit
- [ ] Rate limit por IP **e** por conta, fail-closed, estado compartilhado em prod (Redis/DB — mapa em memória não funciona em serverless/multi-instância).
- [ ] Testar o limitador: exceder o limite deve retornar `allowed:false` + 429 + `Retry-After`. Função que sempre retorna `allowed:true` = sem proteção.
- [ ] Lockout por conta (ex.: 5 tentativas → 15min) com mensagem genérica. Mensagem distinta de "bloqueado" para conta existente = enumeração de usuários.
- [ ] Não confiar cegamente em `x-forwarded-for` para segurança (spoofável); usar IP da plataforma quando disponível.
- [ ] `bcrypt` com custo ≥10; comparação em tempo constante; erro de login genérico ("credenciais inválidas") com tempo de resposta uniforme.

### E. Validação de entrada e lógica
- [ ] Todo `req.json()` validado com Zod antes do service (email, senha ≥mínimo, CPF/telefone normalizados). Sem `.trim()` que mude senha silenciosamente sem documentar.
- [ ] `academyId`, `userId`, `role` nunca vêm do body — só do token validado.
- [ ] Erros de negócio via `AppError` com status correto; 500 genérico sem vazar stack/SQL. `console.error` sem dados sensíveis (sem senha, token, CPF, telefone).
- [ ] Sem `eval`, `innerHTML` com dado de usuário, `dangerouslySetInnerHTML`, redirect aberto (`router.push(url)` com input), nem `prisma.$queryRaw` com interpolação.

### F. Segredos, config e headers
- [ ] `.env*` no `.gitignore`, nunca commitado; `JWT_SECRET` com validação de presença/tamanho no boot.
- [ ] `next.config` / middleware com headers: `HSTS`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, `CSP` mínima. Sem `poweredByHeader`.
- [ ] `prisma.ts` com singleton correto em dev **e** prod (evita exaustão de conexões). Lógica invertida (`if production → cache`) = bug.
- [ ] Rotas `/api/dev/*` inexistentes em prod ou atrás de auth+role+`devOnly()`. `devOnly()` só por `NODE_ENV` sem auth = bypass se env mal configurado.
- [ ] CORS restrito; `withCredentials` só para origem confiável.

## 4. Como executar a varredura (procedimento)

1. `grep` por `authenticateRequest|authorizeRequest` em `src/app/api` → montar matriz de rotas.
2. `grep` por `where: { id`, `findByPhone`, `findUnique`, `update(`, `delete` em `repositories/` → checar `academyId`.
3. Ler `tokens.ts`, `cookies.ts` (inclui `clearAuthCookies`), `AuthMiddleware.ts`, `AuthService.ts`, `AuthController.ts`, `rateLimit.ts`.
4. Ler `prisma/schema.prisma` (roles, uniques, `onDelete`) + `seed.ts` + `prisma.ts`.
5. Simular ataques: login com senha errada 6x (lockout?), 11 reqs/min no login (429?), acesso cross-tenant trocando `id`, `PROFESSOR` chamando `POST /students`, usuário `active=false` com access válido, reuso de refresh, `Bearer` com token roubado, `clear` sem flags.
6. Classificar cada achado: `CRÍTICA | ALTA | MÉDIA | BAIXA` + `arquivo:linha` + impacto + reprodução + correção.

## 5. Formato do relatório (`relatorio_seguranca.md`)

- Resumo executivo (nº de achados por severidade).
- Tabela: `Severidade | Título | Onde (arquivo:linha) | Impacto | Como reproduzir | Correção`.
- Seção "quebra de segurança" (explorável hoje) separada de "endurecimento" (melhoria).
- Sem despejar segredos/valores de `.env` no relatório.

## 6. Regras da skill

- Evidência antes de conclusão: citar `arquivo:linha` real inspecionado.
- `academyId` do JWT ≠ prova de vínculo atual — em dúvida, reconfirmar no banco.
- Frontend nunca é controle de segurança.
- Não criar/mostrar segredos reais; validar apenas presença/força/configuração.
