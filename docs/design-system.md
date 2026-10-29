# Moven — Design System

> Guia para manter o padrão visual em telas novas. Referência viva: **tela de login**
> (`src/app/login/page.tsx`). Para pedir a outra sessão: _"siga `docs/design-system.md`
> e use o login como referência visual"_.

---

## 1. Uma marca, duas intensidades

| Onde | Intensidade | Como |
|---|---|---|
| **Landing** (`/`) | Vitrine | Escuro, nuvens em blocos animadas, M em meio-tom, vidro líquido. |
| **Login** (`/login`) | Ponte | Painel de marca com as nuvens + formulário limpo. Claro e escuro. |
| **Sistema** (painel, portal do aluno) | Leve | Claro por padrão, foco em leitura. Pessoas de todas as idades usam. |

Regra de ouro: **o efeito nunca disputa com o dado**. Animação e vidro ficam em volta
do conteúdo (navegação, cabeçalhos, estados vazios), nunca atrás de tabela, lista ou formulário.

## 2. Tokens (`src/app/globals.css` → `.mv-app`)

Telas novas usam **só tokens**: nada de `slate-*`, `white` ou hex solto. É isso que faz o
tema escuro e a cor da academia funcionarem sozinhos.

| Token | Uso |
|---|---|
| `--mv-brand` | Cor principal (azul Moven; **cor da academia** depois do login) |
| `--mv-brand-50/100/200/700/light/deep` | Derivados automáticos (fundos de ícone, chips, texto sobre tom claro) |
| `--mv-accent` | Laranja: "lotado", "atenção". Uso raro |
| `--mv-bg` / `--mv-panel` | Fundo da página / painéis de marca |
| `--mv-surface` / `--mv-field` | Cards de dados / campos de formulário |
| `--mv-text` / `--mv-text-soft` | Texto principal / secundário |
| `--mv-line` | Bordas e divisórias |
| `--mv-cloud` | Cor dos blocos do `CloudField` |

Exceção: status (sucesso, erro, aviso) usam verde/vermelho/âmbar do Tailwind com a variante
`dark:` (ex.: `text-red-600 dark:text-red-400`).

## 3. Tipografia

- **Inter** para tudo. Corpo ≥ 15px no sistema; **campos com 16px** (`text-base`, evita o zoom do iOS).
- **Instrument Serif itálico** (`mv-serif`): **só na landing e no login** ("Bom te ver *de novo.*").
  No sistema o destaque do título é **só a cor da marca** (ex.: "Boa tarde, **Admin.**" em `--mv-brand`).
- **Mono maiúsculo** (`mv-mono` + `uppercase tracking-[0.18em]`): rótulos e "eyebrows"
  ("PAINEL DA ACADEMIA").

## 4. Cor sem deixar o sistema "morto"

- Fundo neutro + **um bloco sólido da marca por tela** (KPI principal, botão primário, item ativo do menu).
- Tons claros da marca (`brand-50/100`) para fundos de ícones e chips: colore sem pesar.
- Sombra **tingida pela marca** (`--mv-glass-shadow`), não cinza.
- Laranja só para atenção; vermelho só para erro.

## 5. Vidro (`mv-glass`, `mv-glass-strong`)

Navegação (sidebar, topbar, bottom nav), modais e cards de atalho. Dados ficam em
`--mv-surface` sólido. A sidebar e a bottom nav são **vidro claro** (o menu escuro foi testado e descartado).

- **Fundo do painel**: `.mv-canvas` (degradê diagonal suave da marca → ciano). Nada de animação no fundo
  (testado e descartado: ficou carregado) e nada de manchas redondas.
- **Diferencial na sidebar**: `CloudField ambient` na sidebar inteira, com máscara em degradê (forte na
  base, transparente no topo), sem o M e sem caixa; intensidade via `--mv-ambient-alpha` (0.55 na sidebar). O cartão do usuário (vidro forte, avatar na cor da
  marca, "Meu perfil" e "Sair") fica em destaque sobre a base das nuvens. É o único ponto animado do painel.

## 5.1 Cabeçalho das telas (`src/components/layout/PageHeader.tsx`)

- Rótulo mono (tela · contexto) + título com um destaque na cor da marca + ações à direita.
- **Dashboard sem descrição**. As demais telas têm uma frase curta explicando para que a tela serve.
- Sem enfeites (quadradinhos, ícones decorativos) ao lado do título.

## 6. Blocos / nuvens (`src/components/landing/CloudField.tsx`)

- Landing e login: versão completa (com o M).
- Sistema: no máximo em áreas sem dados (cabeçalho da dashboard, estado vazio), de preferência
  `ambient`. Nunca atrás de dados.
- Movimento no sistema: só micro-interações (hover, entrada ≤ 300ms). Sempre respeitar
  `prefers-reduced-motion`.

## 7. Acessibilidade (várias idades)

- Alvos de toque ≥ 44px (`h-11`/`h-12`).
- Rótulo sempre visível (nunca só placeholder), `label htmlFor`, erros com `aria-invalid`
  + `aria-describedby` e `role="alert"` na mensagem geral.
- Botões principais com texto + ícone; linguagem direta ("Entrar", "Agendar", "Confirmar").
- Contraste AA nos dois temas.

## 8. Responsivo (mobile-first)

- Desenhar em **375px primeiro**, depois `lg` (≥ 1024px).
- Painel lateral vira faixa no topo (como o login); sidebar vira bottom nav; tabela vira lista de cards.
- Conferir sempre: sem rolagem lateral (`scrollWidth === clientWidth`).

## 9. Tema claro / escuro

- `next-themes` no layout raiz (`src/app/layout.tsx`), chave `mv-theme`, padrão = tema do aparelho.
- Botão: `src/components/ui/theme-toggle.tsx`.
- **Hoje o escuro só está liberado em `/login`** (`forcedTheme` no layout). Para liberar uma tela:
  ela precisa usar só tokens; depois inclua a rota na condição do `forcedTheme`.

## 10. Cor da academia

Depois do login, defina `--mv-brand` com a cor da academia no container `.mv-app` do painel.
Os derivados se recalculam sozinhos. Landing e login usam sempre o azul Moven.

## 11. Componentes compartilhados e telas

- `Button`, `Input`, `PasswordInput`, `Label` e `Modal` já usam os tokens (altura 44px, campos 16px).
  Dentro do `.mv-app`, o `--primary` antigo aponta para `--mv-brand`.
- O `Modal` é renderizado dentro do `.mv-app` (não no `body`) para herdar tokens, cor da academia e tema.
  Celular: gaveta que sobe de baixo. Desktop: **janela central larga** (`max-w-3xl`, até 88% da altura), com
  `title` + `description`. O painel lateral foi testado e descartado. A janela é de **vidro** (superfície a 70%
  + desfoque) sobre um escurecimento leve; os campos dentro dela continuam sólidos para leitura.
  Formulários: seções com legenda mono. As ações vão na prop `footer` do `Modal` (fora da rolagem, no mesmo
  vidro): "Cancelar" (só desktop) + ação principal com `type="submit" form="<id do form>"` (ver alunos).
- Totalizadores de tela: **use sempre `StatTile`** (`src/components/ui/stat-tile.tsx`) — **vidro**, rótulo em cima, número grande à esquerda e o
  **ícone como marca d'água**: grande, uma cor só (azul da marca, ciano, âmbar), ~14% de opacidade, cortado
  pela borda só embaixo (não na lateral), com uma "fumaça" atrás (mesma cor, ~22%, bem desfocada).
  Sem degradê nem brilho no traço (testado e descartado).
- Listas: tabela só a partir de `xl` (1280px); abaixo disso, lista em cards (ver `src/app/(painel)/alunos/page.tsx`).
- Ações por linha: botões-ícone de 40px com `aria-label`; a ação principal da linha leva o tom claro da marca.
- Telas já no padrão (com tema escuro liberado): `/login`, `/dashboard`, `/alunos`, `/professores`, `/planos`, `/agendamentos`, `/mensagens`, `/usuarios`, `/perfil`, `/configuracoes`.
- Configurações: prazo e templates numa coluna (380px), grade semanal ao lado. Cada horário é uma linha
  em `brand-50` (desativado = tracejado e apagado); no celular, horário + botão em cima e os selects embaixo.
- Portal do aluno (foco no celular): `/aluno/login` segue o login do painel com o texto do aluno ("Sua próxima
  aula *começa aqui.*"). Painel de marca mais baixo no celular (40svh, 250px em telas baixas) para o "Entrar"
  caber sem rolar até no iPhone SE. CPF com máscara e pulo automático para a data; data digitada (DD/MM/AAAA,
  teclado numérico) em vez do seletor nativo. Máscaras em `src/lib/format.ts` (`maskCpf`, `maskDate`).
  O form guarda o valor **antes** da máscara (colar/autocompletar chega sem barras): o schema reaplica a máscara.
- Portal por dentro: `.mv-app mv-canvas`, barra flutuante de vidro no celular (3 abas, ícones 22px) e barra de
  vidro no topo no desktop (com tema e sair) que mostra a **academia** (iniciais + nome + "Portal do aluno", via
  `GET /api/public/academies/{id}`), como o topo da sidebar do painel. Cabeçalho = saudação com o nome na cor da
  marca + **anel de créditos** (64px, menor que a saudação): número de livres no centro, arco = livres (marca),
  trilho = reservadas (marca a 35%); âmbar sem crédito livre. Legenda com bolinhas só quando há reserva ou falta
  crédito. No celular, a academia aparece no topo com o ícone da Moven (`useStudentAcademy`). Cartão de
  créditos grande e ingresso: testados e descartados. Aulas: semana em faixa (dia escolhido sólido, hoje com
  anel, pontinho por aula), filtro segmentado e a mesma linha do tempo da agenda do painel, com botões de 48px
  ("Agendar · 1 crédito", "Confirmar", "Cancelar"). Aviso de cancelamento: gaveta com botões empilhados no celular.
- Minhas aulas: abas Próximas / Histórico; cada aula com bloco de data (sólido nas próximas, claro no histórico),
  status em chip e, ao tocar, a linha do tempo de eventos (fundo cinza neutro, como o card aberto da agenda).
- Perfil do aluno: pacote como **carteirinha** (cartão na cor da marca com créditos e validade), agenda fixa em
  botões de 44px, "Meus dados", dados do cadastro (só leitura) e **Aparência** com o botão de tema (o celular não
  tem sidebar). Nascimento é só data: formatar com `timeZone: "UTC"`.
- Gaveta "Mais" do celular (`src/components/layout/BottomNav.tsx`): a sidebar do celular. Vidro, abre logo
  acima da barra (que continua visível; "Mais" vira "Fechar"), rótulo MENU + botão de tema, opções em blocos
  de 3 por linha (nova opção = mais um item em `extra`), nuvens subindo e o cartão do usuário embaixo.
- Perfil: o seu crachá à esquerda (nome da academia no topo, acompanha o que você digita, descrição do papel
  embaixo do tracejado) e os cards Dados / Senha / Sessões à direita. Erros de senha embaixo do campo,
  não em toast.
- Mensagens: sem `PageHeader` (o chat precisa da altura toda); o título fica no topo da lista. Conversa com fundo
  pontilhado estático, separador de dia fixo no topo ("Hoje", "Ontem", data), balão automático tracejado com
  rótulo mono, ponto verde no avatar quando a janela de 24h está aberta.
- Usuários: **quadro de crachás** numa grade única (você primeiro), cada crachá com furo do cordão, avatar
  mais forte quanto mais acesso, selo do papel e as ações embaixo do tracejado; um crachá tracejado
  "Adicionar à equipe" fecha a grade. Filtro Todos / Gestores / Professores (a aba de admin só aparece com
  mais de um); com um papel escolhido, mostra o que ele pode fazer. Testados e descartados no desktop: uma
  coluna por papel (admin é sempre uma pessoa só) e o mapa de acessos em tabela. No formulário, o papel é escolhido
  em cartões com a descrição (`allRoles` em `src/components/user/UserForm.tsx`), não em select.
- Agenda: calendário → dia (lado a lado só a partir de `xl`). O dia é uma **linha do tempo**
  (`src/components/schedule/DayAgenda.tsx`): bloco da data na cor da marca, trilho com ponto por aula
  (cheio = agora, vazado = próxima, cinza = encerrada, vermelho = cancelada), marca laranja de "agora"
  e nuvens no dia vazio. Fundo da tela: nuvens `ambient` em duas zonas (canto inferior direito e topo
  direito, duas elipses na mesma máscara), atrás dos cards, a partir de `xl`.
  Para replicar numa tela nova, copie a estrutura de `src/app/(painel)/professores/page.tsx` (a mais simples).
- Totalizador só quando o total ajuda a decidir algo. Planos não tem: são poucos e o preço de cada um importa
  mais; a lista é uma grade de "tickets" (preço grande, picote tracejado, aulas e validade embaixo).

## Pegadinhas do CSS (Tailwind 4 / Lightning CSS)

- `backdrop-filter` escrito à mão no `globals.css` é descartado: use `@apply backdrop-blur-[..] backdrop-saturate-[..]`.
- Comentário **na mesma linha** de uma variável CSS (`--x: #fff; /* ... */`) faz a variável sumir:
  comente na linha de cima.
- Fonte que precisa vencer o `* { font-family: Inter !important }` vai dentro do `@layer base`.
- `mask-image` num pai não apaga filho com `backdrop-filter` (`mv-glass`) no Chrome: o vidro fica por
  cima do degradê. Dentro de área com máscara, use `[backdrop-filter:none]` no filho.

## Arquivos de referência

- Dashboard: a tela inteira é `src/components/dashboard/DashboardOverview.tsx`, usada pelo painel
  (`src/app/(painel)/dashboard/page.tsx`, ainda zerado até ligar o `GET /api/dashboard`) e pela prévia
  da landing (`DashboardMock` em `src/components/landing/mocks.tsx`, com os dados fictícios de
  `src/components/landing/dashboardData.ts`). O formato dos dados está em `src/components/dashboard/types.ts`.
  Mudou a dashboard, a landing acompanha sozinha. A prévia é `inert` (sem clique/foco) e usa `zoom`
  (0.85 no celular, 0.8 no desktop) para caber como um "print" do painel. Fica cortada (saudação,
  totalizadores e o topo dos cards) com um degradê curto na base.

- Login: `src/app/login/page.tsx`, `src/components/forms/LoginForm.tsx`
- Tokens, vidro e fontes: `src/app/globals.css`
- Logo: `src/components/layout/MovenLogo.tsx`
- Nuvens em blocos: `src/components/landing/CloudField.tsx`
