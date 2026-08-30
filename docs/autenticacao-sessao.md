# Moven — Autenticação e Sessão (cookies httpOnly + refresh token)

> Como o Moven mantém o usuário logado de forma segura. Cobre o desenho de
> **access token + refresh token**, o uso de **cookies httpOnly**, o armazenamento
> **hasheado** da sessão no banco e a **rotação** do refresh.
> Branch de trabalho: `develop`.

---

## 1. Por que mudamos

O modelo antigo guardava um **JWT de 7 dias no `localStorage`** e o enviava como header
`Bearer`. Dois problemas:

1. **`localStorage` é acessível por JavaScript.** Um XSS (script malicioso na página)
   consegue ler e roubar o token.
2. **JWT longo é *stateless* e não pode ser revogado.** Se vazar, vale 7 dias e não há
   como cancelar. A tabela `Session` existia mas era ignorada.

O modelo novo resolve os dois: o token sai do alcance do JavaScript (cookie `httpOnly`) e a
sessão passa a ser **revogável** (existe no banco).

---

## 2. Os dois tokens

O sistema usa **dois** tokens com papéis diferentes.

| | **Access token** | **Refresh token** |
|---|---|---|
| O que é | JWT assinado | String aleatória opaca (256 bits) |
| Validade | **Curta** (~15 min) | **Longa** (~7 dias) |
| Usado em | **Toda** requisição protegida | **Só** em `/api/auth/refresh` e `/logout` |
| Como é validado | Assinatura do JWT (**matemática**, sem banco) → *stateless* | Busca do hash na tabela `Session` (**banco**) → *stateful* |
| Pode ser revogado? | Não (só expira) | **Sim** (apagar a linha da `Session`) |
| Onde valida no código | `AuthMiddleware.authenticateRequest` | `AuthService.refresh` |

### Analogia
- **Refresh token = contrato de matrícula**, guardado no cofre da recepção (o banco). Dura
  muito; você não anda com ele.
- **Access token = pulseirinha do dia** (15 min). Você mostra na entrada de cada sala (cada
  requisição). O segurança **só olha a pulseira**, não liga pra recepção → *stateless*.
- Pulseira venceu? Passa na recepção, mostra o contrato (refresh, conferido no banco) e ganha
  **pulseira nova** — sem refazer a matrícula (sem relogar).

### Por que dois, e não um só?
- **Access curto (15 min):** é *stateless*, ninguém consegue cancelá-lo. Então tem que
  durar pouco — se vazar, a janela de estrago é mínima.
- **Refresh longo (7 dias):** pode ser cancelado (existe no banco). É ele que segura o
  "continuar logado".

> Regra: **curto pra quem não dá pra revogar; longo pra quem dá.**

---

## 3. O que fica no cookie e o que fica no banco

Princípio central: **o valor cru vai pro cookie; só o hash vai pro banco.**

```
                 valor CRU                          HASH (sha256)
                 ─────────                          ─────────────
access token  →  cookie moven_access               (não é guardado em lugar nenhum)
refresh token →  cookie moven_refresh   ───────►   coluna Session.token
```

- **`moven_access`** — contém o **JWT inteiro** (`header.payload.assinatura`), com
  `{ userId, academyId }` + validade. Não guardamos cópia: valida-se pela assinatura.
- **`moven_refresh`** — contém a **string crua** (64 caracteres hex). É a **única cópia
  utilizável**, e vive só no navegador do usuário.
- **`Session.token`** (banco) — guarda o **hash sha256** dessa string. O banco nunca vê o
  valor cru.

**Por que hashear o refresh?** Se o banco vazar, o atacante só tem hashes — e hash não
volta pro valor original. Ninguém forja um refresh válido a partir do banco.

> **Cookie = a chave (valor real). Banco = a impressão digital da chave (hash).**
> Na validação: tiro a impressão digital do que chegou e comparo com a guardada.

### bcrypt x sha256 — por que hashes diferentes?

| | **Senha** | **Refresh token** |
|---|---|---|
| Quem cria | Humano ("joao123") | Servidor (`crypto.randomBytes`) |
| Entropia | Baixa (adivinhável) | Altíssima (inadivinhável) |
| Hash ideal | **Lento** + salt → **bcrypt** | **Rápido** → **sha256** |

O **salt** protege senhas fracas/repetidas de rainbow tables. O refresh já é único e
aleatório por natureza → não precisa de salt, e o hash pode ser rápido (é consultado a cada
refresh). **A senha continua com bcrypt, sem mudança.**

---

## 4. Flags de segurança do cookie

Definidas em `src/lib/auth/cookies.ts`:

- **`httpOnly: true`** — o JavaScript da página **não lê** o cookie. Resolve o risco de XSS
  que o `localStorage` tinha.
- **`secure`** — só trafega em HTTPS. `false` em dev (localhost é http), `true` em produção.
- **`sameSite: "lax"`** — o cookie não é enviado em requisições vindas de **outro site** →
  protege contra CSRF, sem atrapalhar a navegação normal.
- **`path`** — `moven_access` usa `/` (acompanha toda a API); `moven_refresh` usa
  `/api/auth` (só as rotas de auth o recebem, reduzindo exposição).

### Produção (Vercel / VPS)
O Vercel serve tudo em **HTTPS por padrão**, então `secure: true` funciona sem ajuste. Na
VPS, basta garantir HTTPS no proxy (ex.: Caddy + Let's Encrypt). O `secure` só quebraria em
`http://` puro.

---

## 5. Ciclo de vida da sessão

```
login  → cria access(15min) + refresh(7d, hash no banco) → grava 2 cookies httpOnly
request→ middleware confere a ASSINATURA do access            → OK (sem tocar o banco)
 ...15 min depois, access expira...
request→ middleware devolve 401
axios  → chama POST /api/auth/refresh (envia o cookie refresh)
         service: hasheia o refresh → acha na Session → válido?
                  emite par novo + APAGA o refresh usado (rotação) → cookies novos
axios  → repete a requisição original                          → OK (usuário não percebe)
 ...
logout → apaga a Session do banco + limpa os dois cookies
```

**O refresh é sob demanda (lazy), não agendado.** Não há timer "a cada 15 min". O `/refresh`
só é chamado quando uma requisição falha com 401 por access expirado. Pode passar horas sem
nenhum refresh (se o usuário não usa), ou vários no mesmo dia (se usa muito).

---

## 6. Rotação do refresh (uso único)

A cada `/refresh`, o refresh usado é **apagado antes** de emitir o novo par
(`AuthService.refresh`). Efeito:

- Cada refresh é de **uso único**.
- Reusar um refresh já gasto → `findByToken` não acha → **401** (indício de roubo/replay).

Onde a sessão "mora": a **linha na tabela `Session` é a sessão**. Apagou a linha → sessão
morta (é assim que logout e revogação funcionam).

---

## 7. Onde cada peça vive no código

| Arquivo | Responsabilidade |
|---|---|
| `src/lib/auth/tokens.ts` | Assinar/verificar access (JWT); gerar refresh; `hashToken` (sha256) |
| `src/lib/auth/cookies.ts` | `setAuthCookies` / `clearAuthCookies` / `readCookie` + flags |
| `src/server/repositories/SessionRepository.ts` | CRUD da `Session` (create, findByToken, deleteByToken, deleteAllForUser) |
| `src/server/services/AuthService.ts` | Regra: `login`, `refresh` (rotação), `logout`, `getProfile` |
| `src/server/middleware/AuthMiddleware.ts` | Lê o access do cookie e valida a cada requisição |
| `src/app/api/auth/*` | Rotas HTTP: `login`, `refresh`, `logout`, `me` |
| `src/lib/axios.ts` + `src/contexts/AuthContext.tsx` | Front: `withCredentials` + refresh automático no 401 |

**Divisão de responsabilidade:** o `AuthService` **não sabe o que é cookie** — devolve
`accessToken` e `refreshToken` como strings. Quem os transforma em cookie `httpOnly` é o
**controller/rota**. Service cuida de regra; a camada HTTP cuida de HTTP.

---

## 8. Estado / pendências

- [x] Helpers de token e cookie (`tokens.ts`, `cookies.ts`)
- [x] `SessionRepository` + `AuthService` (login/refresh/logout com rotação)
- [ ] Middleware lendo o access do cookie + rotas `/refresh` e `/logout`
- [ ] Frontend: axios com `withCredentials` e refresh automático; `AuthContext` sem `localStorage`
- [ ] **Parte 2:** rate limiting no login (lockout por conta + throttle por IP)
- [ ] **Parte 3:** recuperação de senha (reusa `hashToken` para o token de reset)
- [ ] **Parte 4:** testes automatizados (auth + automações)
