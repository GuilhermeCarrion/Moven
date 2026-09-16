# Task — Recorrência de aulas ("lançamento" com débito tardio)

> Permite a academia definir os dias fixos que um aluno frequenta (ex.: terça-quinta) e o
> sistema **materializa os agendamentos sozinho**, debitando crédito na hora certa — sem
> lançar aula por aula. É ferramenta **da academia**; o aluno só vê o resultado no portal.
> Status: **planejado** (sem código). Branch: `develop`.

---

## 1. As 3 camadas

1. **`ClassTemplate` (modelo de aula):** config reutilizável — nome, nível/descrição,
   capacidade **máx/mín**, **duração**. Ex.: *Aula manhã (experientes): máx 10, mín 3, 50min*
   · *Aula tarde (novas): máx 7, mín 2, 50min*.
2. **`ClassSession` (aula concreta):** ocorrência num dia/hora, **criada a partir de um
   template** (herda cap/duração/nome). No cadastro de aula, o campo "nome" vira **dropdown**
   de templates + botão **"+ criar"**.
3. **`Recorrencia` (matrícula recorrente):** liga o **aluno** a um **slot semanal**
   (dia(s) + hora + template). É **ativada ("lançada") pela academia** — o aluno nunca cria.

---

## 2. O Lançador (Job de materialização)

Um novo **tipo de trabalho** no worker que já existe (reusa cron, retry, dedup). Roda ~1x/dia.

**Por recorrência ativa, para cada ocorrência dentro da janela (30 dias), em ordem
cronológica:**
1. **Garante a aula:** a `ClassSession` do dia/hora existe? Se não, cria do template.
2. **Valida** (regras que já temos): aluno ativo · pacote **ativo com crédito** · pacote
   **não vence antes** da aula · aula com **vaga**.
3. **Se ok:** transação → cria agendamento (`BOOKED`) **+ debita 1 crédito**. É o
   **mesmo `createWithDebit`** do painel — o Job só é um novo "chamador" agendado.
4. **Se falha** (sem crédito / vencido / lotada): **não cria** e marca como "sem crédito" +
   **avisa** ("verifique com a academia" / renove o pacote).

**Dedup:** o agendamento carrega `recorrenciaId`; antes de criar, checa se já existe
agendamento dessa recorrência para aquela aula. Mesmo princípio do dedup do WhatsApp.

**Dois Jobs, momentos diferentes:**
```
Lançador (diário)                 Confirmação (já existe)
cria agend. + debita   ─────────►  12h antes: template WhatsApp "confirma?"
  (até 30 dias antes)
```

---

## 3. Crédito e janela

- **Janela N = 30 dias** (configurável). Materializa até 1 mês à frente (bom p/ pacotes de
  60–90 dias).
- **Débito na materialização:** o crédito sai do saldo quando o agendamento é criado
  (~30 dias antes). Se não vai, o aluno **cancela**.
- **Cancelamento ≥ 4h** estorna o crédito (mudança de 2h → 4h: `CANCEL_WINDOW_HOURS = 4`).
  Menos que isso, perde.

---

## 4. Crédito curto / feriado / adiantar — reconciliação automática

Como o Lançador materializa **em ordem cronológica só enquanto há crédito**, o comportamento
que a academia quer **emerge sozinho**:

- **Adiantou 2 aulas avulsas** (gastou 2 créditos extras) → sobra menos → o Lançador **não
  materializa as 2 ocorrências mais futuras**. Garante sempre as aulas **mais próximas**.
- **Feriado / aula cancelada** → ocorrência não materializa (ou cancela com estorno) → crédito
  **volta ao saldo** → a próxima ocorrência "sem crédito" passa a ser materializada.
- **Adiantar via remarcar** (mover uma ocorrência futura p/ antes) → **não gasta crédito novo**
  (regra de remarcar já existente); só desloca.

**Visibilidade (mostrar a quem agenda):** as ocorrências aparecem em dois estados —
**Coberta** (agendamento real, com crédito) ou **Sem crédito** (projeção não coberta, em
amarelo: *"sem crédito — verifique com a academia"*), com um resumo do tipo *"crédito cobre
até 20/09; aulas de 25 e 27 ficam de fora."*

---

## 5. Impactos técnicos (resumo)

- **Modelo:** `ClassTemplate`; `Recorrencia` (student, academyId, dias, hora, template,
  início/fim, ativa, pacote); `Appointment.recorrenciaId?` (dedup) e um jeito de marcar
  **exceções** (pular ocorrência).
- **Job novo:** "Lançador" (materializa recorrências) — reusa worker/cron/dedup existentes.
- **Reuso:** `createWithDebit` (débito atômico) e as regras de cancelamento/lotação/validade
  — sem reescrever.
- **Ajuste:** `CANCEL_WINDOW_HOURS` de 2 → 4.
- **Front:** cadastro de aula com dropdown de template + "+ criar"; tela de recorrência
  (academia) com estados coberta/sem-crédito; o aluno **vê** as ocorrências no portal.
- **Dependência:** o Lançador **precisa do worker rodando** (VPS) p/ materializar sozinho —
  anda junto com a infra do WhatsApp. Dá p/ construir e testar com o worker de dev agora.

---

## 6. Decisões (status)

| # | Decisão | Status |
|---|---|---|
| 1 | Camada de **template de aula** (dropdown + "+ criar") | ✅ definido |
| 2 | Janela de lançamento **N = 30 dias** (configurável) | ✅ definido |
| 3 | **Débito na materialização** + cancelamento **≥ 4h** estorna | ✅ definido |
| 4 | Crédito curto → **materializa as mais próximas**, marca "sem crédito" nas futuras + avisa | ✅ definido |
| 5 | Recorrência **lançada/ativada pela academia** (aluno não cria) | ✅ definido |
| 6 | Reaproveita worker/Job/dedup + `createWithDebit` | ✅ definido |
| 7 | Exceções pontuais (pausar/pular ocorrência) no MVP vs v2 | 🟡 a definir |
