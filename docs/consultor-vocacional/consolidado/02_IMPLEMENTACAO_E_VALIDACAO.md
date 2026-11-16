# Home vocacional: implementação e validação

Data: 2026-11-16. Branch: home-vocacional, criada a partir da main em 19bbb18. Autor: Kiro CLI, a pedido do usuário ("orquestre a mudança e a validação visual"). Base: `01_CONSOLIDADO_CONSULTOR_VOCACIONAL.md`, decisão APROVAR COM ESCOPO REDUZIDO.

## 1. Decisões em vigor

O usuário pediu a aplicação sem responder item a item às perguntas da seção 12 do consolidado. Foram adotadas as recomendações do consolidado:

| Pergunta | Decisão adotada |
|---|---|
| Q1, duas perguntas | Sim, duas perguntas de múltipla escolha, sem campo livre |
| Q2, outras áreas | Três cartões desabilitados, só com nome e o selo "Roteiro futuro" |
| Q3, nome | "Guia de orientação" |
| Q4, rever a home | Sim, pelo botão "Rever a apresentação" na tela de Missões |
| Q5, commit da pasta de decisão | Sim, em commit separado, antes do código |

Correção de leitura do consolidado: o consolidado diz "só o nível Estagiário fica ativo". O produto já tem 5 níveis jogáveis. A home só afirma que o percurso disponível é Suporte Técnico em TI e que ele começa no nível Estagiário.

## 2. O que foi implementado

- `src/frontend/src/home/catalogoVocacional.ts`: textos, jornada, áreas, perguntas e respostas escritas; `deveMostrarHome` e `marcarHomeVista`.
- `src/frontend/src/home/HomeVocacional.tsx`: a página. Sem rede, sem IA, sem chamada ao motor, ao Event Store ou ao Juiz 360º.
- `src/frontend/src/App.tsx`: o parâmetro `apresentacao` (padrão falso) abre a home. O botão "Ir direto ao laboratório" faz o mesmo que o Primeiro Voo (abre o nível Estagiário) ou retoma o turno em memória, sem criar segunda sessão.
- `src/frontend/src/main.tsx`: passa `deveMostrarHome()`. A home aparece só quando o navegador não tem a marca `itfs_home_vista` nem sessão em `itfs_jornada_sessoes` (decisão P2, opção C).
- `src/frontend/src/shell/AppShell.tsx`: atributo `data-entrada` para tirar o espaço do rail na home.
- `src/frontend/src/workstation/TelaInicial.tsx`: botão "Rever a apresentação".
- `src/frontend/src/index.css`: bloco "Home vocacional", só com tokens existentes.

Backend, `Simulador.Dialogo`, `Simulador.Avaliacao` e `src/frontend/src/api/**` não foram tocados. O fluxo antigo continua: sem o parâmetro, o App abre a Tela Inicial.

## 3. Evidências (executadas nesta sessão)

| Verificação | Resultado |
|---|---|
| `npm.cmd run lint` | 0 avisos, 0 erros |
| `npm.cmd test -- --run` | 132 de 132 em 14 arquivos (23 testes novos em HomeVocacional.test.tsx, incluindo axe) |
| `npm.cmd run build` | ok, verificação de segredos ok |
| Playwright, 5 projetos, uma rodada | 56 de 56 (43 anteriores, 5 de comportamento em home.spec.ts e 8 de captura em home.visual.spec.ts) |
| Contraste, todas as telas | 136 células medidas, 0 com falha de texto, container, divisor, controle, foco ou hover; 0 com rolagem horizontal; 0 com texto abaixo de 12 px |
| Alvos de 44 px na home | 0 abaixo de 44 px em 375, 768 e 1280 px |
| Sessão antes do clique final | Teste e2e confirma 0 chamadas POST de sessão ao abrir a home e ao usar Começar |

Defeito achado na inspeção visual e corrigido: em 768 px, o selo "Disponível nesta edição" ultrapassava a borda do cartão (PNG tablet-768 corporate e tactical). A causa era `white-space: nowrap` do `.chip` numa coluna de 168 px. Correção: o selo quebra linha dentro das áreas. Foi acrescentada uma checagem em home.visual.spec.ts (nenhum elemento ultrapassa o cartão que o contém). Controle negativo: com a correção removida, a checagem reprovou nos dois temas em tablet-768; com a correção, os 8 testes passam.

PNG abertos nesta sessão: desktop-1440 tactical home, desktop-1440 corporate home-guia-respondido, mobile-375 corporate home-guia-respondido, tablet-768 tactical home (antes e depois da correção) e tablet-768 corporate home (só antes da correção). O PNG corporate de tablet depois da correção não foi reaberto; a cobertura dele é a checagem automática, que passou nos dois temas.

## 4. Pendências do usuário

1. Conferir a home no preview da Vercel da branch home-vocacional, em 375 px e 1440 px, nos dois temas (a home e o guia respondido).
2. Zoom em 200 por cento e leitor de tela, na home.
3. Decidir o merge na main. A main publica a home em produção: quem abrir pela primeira vez verá a home antes das Missões.
4. Revisar os textos da home contra a lista de guardrails da seção 4 do consolidado.

## 5. Fora desta entrega

Consultor generativo, integração com os portais Vitru, login e cadastro, persistência no backend, mais de uma profissão jogável e bloco novo de próximos passos.
