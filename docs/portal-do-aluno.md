# Task — Portal do Aluno (área self-service do aluno)

> Spec da funcionalidade que dá acesso do aluno ao sistema. Nasce do alinhamento com a
> academia. Grande porque quebra a premissa "sistema 100% interno" — abre um **portal
> externo** e mexe em auth, autorização, modelo de dados e uma área de front nova.
> Status: **planejado** (sem código ainda). Branch de trabalho: `develop`.

---

## 1. Visão

Área **mobile-first** do aluno (caminho natural pra virar PWA/app no futuro), com **3 abas**
em barra inferior + um **auto-cadastro público**. O aluno navega a agenda, agenda/confirma/
cancela as próprias aulas, acompanha o histórico e ajusta poucos dados do perfil.

**Abas:** `Aulas` · `Minhas Aulas` · `Perfil` (+ página pública de auto-cadastro).

---

## 2. Login e identidade

- **Login:** **CPF + data de nascimento** (os dois pra entrar). Sem senha, sem cadastro
  extra — a academia já tem ambos, e é fácil pra alunos com mais idade. Evolução futura:
  **OTP via WhatsApp** (quando a Meta estiver ativa).
- **Modelo:** `Student` ganha `userId?` ligado a um `User` com **role nova `STUDENT`**
  (espelha o padrão do Professor). Reaproveita **toda** a sessão segura já pronta (JWT curto,
  refresh, cookies httpOnly, rate limit).
- **Autorização por propriedade:** o token do aluno carrega o `studentId`. Ele **lê** a agenda
  da **sua** academia, mas **agendar/confirmar/cancelar/editar** é sempre escopado no
  `studentId` dele. Nunca vê nem age no de outro aluno, nem de outra academia.
- **Segurança:** rate limit no login do aluno; isolamento total de dados; CPF+nascimento como
  fator leve. (Risco aceito no MVP: quem souber CPF+nascimento entra — o OTP WhatsApp fecha
  isso depois.)

---

## 3. Aba "Aulas" (navegar + agir)

Baseada na referência (souciclo). O aluno vê a agenda e age.

- **Topo:** faixa horizontal de dias (semana), com ‹ › pra passar semana.
- **Filtro:** `todos / Disponível / Indisponível` (disponível = tem vaga e ele não está;
  indisponível = lotada ou já passou). ✅ entra no MVP.
- **Lista:** aulas do dia selecionado. A **ação do card muda conforme o estado do aluno**:
  | Estado | Ação/rótulo |
  |---|---|
  | Não agendado + vaga | **Agendar** (debita crédito) |
  | Agendado (futura) | **Confirmar** / **Cancelar** |
  | Confirmado | badge "Confirmada" + **Cancelar** |
  | Lotada e não é dele | "Indisponível" |
  | Passada | status (Finalizada / Compareceu / Faltou / Não avisado) |
- **Regras reaproveitadas:** agendar debita crédito; cancelar **≥2h** estorna; lotação;
  pacote ativo com crédito. Mesmas do painel admin.

---

## 4. Aba "Minhas Aulas" (histórico + futuras)

Só as aulas **dele**.

- **Passadas:** Compareceu (`PRESENT`) / Faltou avisando (`ABSENT`) / **Não avisado**
  (`NO_SHOW`).
- **Futuras:** Confirmada (`CONFIRMED`) / Aguardando confirmação (`BOOKED`) / **Não
  respondido**.
- **Dado novo necessário:** "**Não respondido**" = confirmação **enviada** e sem resposta
  após a janela. Hoje não distinguimos "nunca pedimos" de "pedimos e não respondeu". Solução:
  o Job `PRESENCE_CONFIRMATION` grava no `Appointment` um **"confirmação enviada em X"**
  (ex.: `confirmationSentAt`). Passada a janela sem resposta → "não respondido".

---

## 5. Aba "Perfil" (edição controlada)

| Campo | Aluno pode alterar? |
|---|---|
| **E-mail** | ✅ Sim |
| **Celular** | ❌ Não (só a academia) |
| **Peso / Altura** | ✅ Sim, **com validação**: fora da regra (peso 42–107 kg, altura ≥140 cm) → **avisa e bloqueia salvar** |
| **Pacote / créditos** | ❌ Só leitura (financeiro) |
| Nome / CPF / nascimento | ❌ Só leitura |

> Peso/altura são **limite de segurança do Bungee** — por isso salvam só dentro da regra
> (reusa o mesmo Zod do cadastro). O aluno vê o pacote, mas quem mexe é a academia.

---

## 6. Auto-cadastro público (funil de entrada)

Antes o formulário "não levava a lugar nenhum". Agora ele **conclui com um encaminhamento**.

- **Formulário público** (reusa o schema do cadastro de aluno) → cria o `Student`.
- **Sem WhatsApp ativo (agora):** ao concluir, mostra uma **tela de sucesso** com mensagem
  orientando a voltar ao WhatsApp — porque **a aula experimental é marcada com um
  profissional**. Inclui um **texto pronto pra copiar** e colar no zap:

  > "Terminei meu cadastro! Vamos marcar minha aula experimental?"

- Conecta com a **aula experimental** (`isTrial`, 1x por aluno) que já existe → vira funil:
  lead se cadastra → volta pro WhatsApp → academia marca a experimental.
- **Aberto (a confirmar):** o auto-cadastrado entra **pendente** (academia aprova) ou
  **direto**? Recomendação: **pendente** (evita cadastro-lixo, casa com o card "Pendentes" do
  dashboard). O login por CPF+nascimento passa a valer quando o cadastro estiver ok.

---

## 7. Impactos técnicos (resumo)

- **Auth:** nova role `STUDENT`; `Student.userId?`; login por CPF+nascimento; sessão de aluno
  escopada (studentId + academyId).
- **Autorização:** eixo novo "por propriedade" (aluno só age no dele).
- **Modelo:** `Appointment.confirmationSentAt` (pro "não respondido"); role `STUDENT`.
- **Front:** área nova (ex.: `/aluno`) com layout + bottom-nav próprios (Aulas / Minhas Aulas
  / Perfil), reaproveitando o glass/mobile já feito. Página **pública** de auto-cadastro.
- **Reuso:** regras de crédito/cancelamento/lotação/limites físicos — sem reescrever.

---

## 8. Decisões (status)

| # | Decisão | Status |
|---|---|---|
| 1 | Login: **CPF + data de nascimento** | ✅ definido |
| 2 | Role **STUDENT** reusando a sessão segura | ✅ definido |
| 3 | 3 abas: Aulas · Minhas Aulas · Perfil | ✅ definido |
| 4 | Filtro disponível/indisponível no MVP | ✅ definido |
| 5 | Perfil: e-mail edita; celular não; peso/altura edita com validação; pacote só leitura | ✅ definido |
| 6 | Auto-cadastro → tela de sucesso + texto pra WhatsApp | ✅ definido |
| 7 | Portal com ações (agendar/confirmar/cancelar) | ✅ definido |
| 8 | Auto-cadastro entra **pendente** ou **direto** | 🟡 a confirmar (recomendo pendente) |
| 9 | Evolução: OTP WhatsApp / PWA | 🔵 futuro |
