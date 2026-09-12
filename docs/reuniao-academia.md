# Reunião Fly Bungee × Moven — Planejamento

> Data: 12/09/2026 · Objetivo: alinhar o WhatsApp/Meta, definir regra de créditos das
> aulas especiais, colher feedback de uso e mostrar as próximas etapas.

---

## 0. O que precisamos DECIDIR nesta reunião (resumo)

- [ ] **CNPJ da Meta:** seguir com o CNPJ atual (RR Ribeiro, provisório) ou já entrar com o **CNPJ da Fly Bungee**? → ver seção 2.2
- [ ] **Cartão CNPJ + contato:** conseguir o Cartão CNPJ com **e-mail e telefone de acesso rápido** (a Meta manda código de confirmação).
- [ ] **Créditos de aula especial:** quanto vale uma aula de fim de semana / temática? → ver seção 3
- [ ] **Número de WhatsApp** que a academia vai usar em produção (vira "só API", sai do app comum) → ver seção 2.3
- [ ] **Feedback de uso:** dores, rotinas chatas e ideias de funcionalidade → ver seção 4

---

## 1. Onde o sistema está hoje

**Já pronto e no ar** (`appmoven.com.br`):
- Cadastro de **alunos**, **professores**, **planos/pacotes de crédito**.
- **Agenda** do dia, agendamento com débito de crédito e **registro de presença**.
- Login seguro e controle de acesso por perfil (admin/gestor/professor).

**Em desenvolvimento:**
- **Automação de WhatsApp** — o "motor" está pronto e testado (confirmação de presença, boas-vindas). Falta só a **liberação da Meta** para enviar de verdade.
- **Novo visual** do sistema (em andamento).

---

## 2. WhatsApp / Meta

### 2.1 Como vai funcionar (no começo)
- Mensagens **automáticas** via **templates aprovados** pela Meta (ex.: confirmação de presença 12h antes, boas-vindas).
- **Só texto** no início — áudio, imagem e figurinha ficam para uma fase futura.
- **Regra da janela de 24h:** fora de 24h desde a última mensagem do aluno, só dá para enviar **template**; dentro de 24h, texto livre. Isso molda o que dá para fazer.

### 2.2 Burocracia e requisitos (o que trava hoje)
Para a Meta **liberar envio para o Brasil**, ela exige **verificação da empresa**, que precisa de:
- **Cartão CNPJ** da empresa, com **e-mail e telefone acessíveis** (recebem código de confirmação).
- **Razão social + CNPJ visíveis no site** (já colocamos no rodapé do `appmoven.com.br`).

**Decisão pendente:** hoje estamos usando o CNPJ de um parente (RR Ribeiro) só para destravar os testes. O ideal, quando for "de verdade", é a **Fly Bungee** ser a dona da conta (CNPJ dela). Precisamos decidir se já entramos com o CNPJ da academia agora.

### 2.3 Depois que a empresa for verificada
1. **Teste de template** com o número de teste que a Meta fornece.
2. **Ajustes de desenvolvimento** (minha parte).
3. **Produção real:** registrar o **número WhatsApp** da academia na API (esse número passa a ser **só da API** — sai do app comum de WhatsApp).
4. **Relatório de uso** para estimar gasto.

### 2.4 Custos
- A Meta cobra **por conversa/mensagem** conforme a **tabela oficial** dela (muda por tipo e por país) e **debita do cartão** cadastrado na conta da Meta.
- Começamos com **volume baixo** (confirmações), então o custo inicial é pequeno; acompanhamos pelo relatório.
- **Futuro:** possibilidade de disparos híbridos (automáticos + manuais pelo chat interno).

---

## 3. Créditos de aula (definir regra)

| Tipo de aula | Créditos | Status |
|---|---|---|
| Dia a dia (comum) | **1 crédito** | definido |
| Especial (fim de semana, temática…) | **1? mais? varia?** | **decidir na reunião** |

Perguntas para a academia:
- Aula especial custa **o mesmo** (1) ou **mais** créditos?
- É **fixo** ou **depende** do tipo de aula especial?
- Aula especial pode usar o **mesmo pacote** do dia a dia, ou é **pacote/valor à parte**?

*(A resposta define se precisamos criar um tipo de aula/plano diferenciado no sistema.)*

---

## 4. Feedback de uso (a academia traz)

Peço para o pessoal relatar, com exemplos do dia a dia:
- **Dores e rotinas chatas:** o que dá trabalho, o que é confuso, o que toma tempo.
- **Insatisfações:** algo que não funciona como esperavam.
- **Informações que gostariam de ver** em número, gráfico, resumo ou estimativa.

### Ideias já mapeadas
- **"Aula-Rápida":** cadastrar um aluno para uma **aula experimental** no dia/horário de forma **express**, sem muito esforço (fluxo mais prático para o balcão).
- **"Totalizador de faturamento":** relatório financeiro mostrando **quanto a academia fatura por dia / mês / ano**, com base nos valores dos pacotes e nos agendamentos confirmados.

*(Toda ideia nova é bem-vinda — quanto mais concreta a dor, melhor o recurso que dá para construir.)*

---

## 5. Próximas etapas (nossa parte)

1. **Design novo** do sistema (visual em vidro / glassmorphism) — em andamento.
2. **Chat interno (inbox)** para conversar com alunos pelo WhatsApp dentro do sistema.
3. **Automações reais** assim que a Meta liberar (confirmação de presença, boas-vindas, aviso de plano expirando).

---

### Encaminhamentos (preencher no fim da reunião)
- CNPJ escolhido: ____________________
- Créditos aula especial: ____________________
- Número WhatsApp de produção: ____________________
- Principais pedidos da academia: ____________________
