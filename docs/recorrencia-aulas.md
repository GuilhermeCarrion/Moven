# Recorrência de aulas — grade, reservas e débito no prazo

> Substitui o desenho anterior ("lançamento com débito na materialização").
> Status: **desenho fechado**, implementação a seguir. Branch: `develop`.

---

## 1. Em uma frase

A academia publica a **grade** (aulas geradas 30 dias à frente); o aluno **reserva** — avulso ou
com **recorrência fixa**; o crédito só é **debitado no prazo de cancelamento**; e nenhuma reserva
existe sem **crédito que a cubra**.

```
Grade + template ──► Gerador de aulas (30 dias) ──► aulas na agenda
Recorrência do aluno ──► Gerador de reservas (só o que tem cobertura) ──► reservas
Portal / painel ──► reserva avulsa (com aviso se deslocar outra)
Worker (a cada minuto) ──► prazo chegou? debita  |  sem crédito? cancela
```

---

## 2. Conceitos

| Conceito | O que é |
|---|---|
| **Grade** | Horários fixos da academia: dia da semana + hora + professor + template. Ex.: seg–sex 6h/7h/8h. |
| **Template** | Padrão da aula: nome, duração, capacidade máx./mín. Ex.: 50 min, máx. 7, mín. 3. |
| **Aula** | Ocorrência concreta, gerada da grade. Pode ser **editada** ou **cancelada** antes de acontecer. |
| **Reserva** | Agendamento do aluno numa aula. **Reservar não debita crédito.** |
| **Recorrência** | Agenda fixa do aluno ("toda ter e qui às 7h"). Não é preferência: o sistema reserva por ele. |
| **Prazo** | `início da aula − janela de cancelamento` (configurável, padrão **4h**). Até o prazo, cancelar não custa nada; no prazo, o crédito é debitado. |
| **Cobertura** | Uma reserva está coberta se existe crédito livre **e** um pacote válido **na data da aula**. As reservas são cobertas **em ordem de data** (mais próximas primeiro). |

---

## 3. Os dois geradores (job diário no worker)

**3.1 Gerador de aulas (academia)** — garante as aulas da grade nos próximos **30 dias**. Não depende
de aluno nem de crédito: a academia não para. Aula cancelada (feriado) **não é recriada**.

**3.2 Gerador de reservas (recorrência)** — para cada recorrência ativa, percorre as datas dos próximos
30 dias **em ordem** e reserva **somente se**:
- a reserva estaria **coberta** (crédito livre + pacote válido na data);
- a aula tem **vaga**;
- o aluno não tem reserva nessa aula;
- essa data **não foi cancelada pelo aluno** (cancelar = pular; não recria).

Ele **para onde a cobertura acaba**. Nunca cria reserva sem crédito.

**Gatilhos extras** (além do diário), para o aluno afetado:
- recorrência criada ou alterada;
- **pacote atribuído** (renovação) → preenche na hora as datas que passaram a ter cobertura.

---

## 4. Crédito

1. **Reservar não debita.** O saldo só cai no prazo.
2. **Débito no prazo** — o worker varre a cada minuto: reserva ativa, ainda não debitada, cujo prazo
   passou → debita 1 crédito de um pacote **válido na data da aula** (transação).
3. **Rede de segurança:** se no prazo não houver crédito → a reserva é **cancelada** em vez de debitada.
   Ninguém faz aula sem pagar.
4. **O aluno vê:** **Saldo** (créditos ainda não debitados) · **Reservadas** (reservas pendentes) ·
   **Livres** (saldo − reservadas) · **"Recorrência garantida até DD/MM"** (onde a cobertura termina).

> Com mais de um pacote, cada reserva usa o pacote válido na data dela que **vence primeiro** — assim
> nenhum crédito vence sem uso por causa de uma escolha ruim. A varredura de débito segue a mesma regra.

---

## 5. Cancelamentos — quem, quando e o que acontece

| Situação | Quando | Resultado | A recorrência reserva de novo? |
|---|---|---|---|
| Aluno cancela | até o prazo | sem custo | **Não** — conta como "pular" |
| Aluno cancela | depois do prazo | não permitido no portal (crédito já saiu) | — |
| Aluno faz **aula extra** que tira a cobertura de outra reserva | **na hora**, após confirmar o aviso | a reserva **escolhida pelo aluno** (padrão: a mais distante) é cancelada: **"Cancelada · crédito usado em DD/MM"** | Sim, se renovar e houver vaga |
| Cobertura perdida por mudança externa (pacote cancelado/expirado) | **24h antes** da aula | **"Cancelada · crédito insuficiente"** | Sim, se renovar e houver vaga |
| Sem crédito no prazo (rede de segurança) | no prazo | **"Cancelada · crédito insuficiente"** | Sim |
| Academia cancela a aula (feriado) | quando a academia cancelar | todas as reservas canceladas, sem custo | Não (a aula não existe) |
| Aluno **altera a recorrência** | ao salvar | passado e já debitadas ficam; reservas futuras de dias que saíram do padrão são canceladas; o gerador reserva os dias novos | — |

O motivo do cancelamento fica gravado (`cancelReason`): é ele que decide se a recorrência pode
reservar aquela data de novo.

---

## 6. Reserva avulsa (portal e painel)

Ao reservar uma aula Y, o sistema recalcula a cobertura incluindo Y:
- **Y ficaria sem cobertura** → bloqueia: *"Sem crédito para esta data — renove seu pacote."*
- **Y coberta, mas outra reserva perde a cobertura** → aviso antes de confirmar, listando as reservas
  do aluno com a **mais distante pré-selecionada**: *"Esta aula vai usar o crédito de uma reserva sua.
  Escolha qual será cancelada."* O aluno pode trocar a escolha. Confirmou → reserva Y e cancela a escolhida
  na hora.
- **Y coberta sem afetar nada** → reserva direto.

---

## 7. Editar uma aula antes de acontecer

- **Pode:** duração, capacidade máx./mín., professor, nome.
- **Não pode:** reduzir a capacidade abaixo das reservas atuais; mudar o horário de uma aula que já
  tem reservas (cancele e use outra aula).
- **Cancelar a aula:** cancela todas as reservas, sem custo (ver tabela).

---

## 8. Avisos no front (portal)

Ícones/alertas explicando o efeito de cada ação, antes de acontecer:
- reserva extra que desloca outra (item 6);
- "Cancele sem custo até HH:MM" em cada reserva; após o prazo, "crédito debitado";
- "Recorrência garantida até DD/MM — renove para continuar";
- ao alterar a recorrência: "as reservas futuras de ter serão canceladas; qua será reservada a partir de DD/MM";
- reservas canceladas mostram o **motivo** (crédito usado em DD/MM, crédito insuficiente, aula cancelada).

---

## 9. Configurações da academia (primeira parte da área de configurações)

- **Grade:** dias + horários + professor + template de cada horário.
- **Templates:** padrões de aula (ex.: 50 min, máx. 7, mín. 3).
- **Janela de cancelamento:** horas (padrão 4).
- **Horizonte:** 30 dias (constante; vira configuração se precisar).

*(Credenciais do WhatsApp por academia continuam para depois.)*

---

## 10. Modelo de dados (resumo)

```
ClassTemplate   nome, duração, capacidade máx./mín.
ScheduleSlot    academia, dia da semana, hora, professor, template, ativo
ClassSession    + templateId?, + scheduleSlotId?
Recurrence      aluno + horário da grade (1 linha por horário: ter 7h e qui 7h = 2 linhas), ativa
Appointment     + recurrenceId?, + debitedAt?, + cancelReason?
Academy         + cancelWindowHours (padrão 4)
```

---

## 11. Fora do MVP

- Tela de pausar/pular datas (cancelar já faz esse papel).
- Automação de venda/renovação de pacote (continua manual pela academia — o gerador reage a ela).
- Regra automática para aula abaixo do mínimo (a academia decide manualmente).

---

## 12. Ordem de implementação

1. **Schema** + migração.
2. **Modelo de crédito:** reservar sem débito, varredura de débito no prazo, função de cobertura,
   validade na data da aula, `cancelReason`.
3. **Configurações:** grade, templates, janela de cancelamento.
4. **Geradores:** aulas e reservas (diário + gatilhos).
5. **Portal:** recorrência, avisos, Saldo · Reservadas · Livres.
6. **Painel:** editar/cancelar aula com as travas; recorrência na ficha do aluno.
