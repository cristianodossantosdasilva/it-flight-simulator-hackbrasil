# Relatório Kiro: Consultor Vocacional do IT Flight Simulator

Data: 16/11/2026. Autor: Kiro CLI. Prompt de origem: `docs/rfc/PROMPT_ORQUESTRACAO_CONSULTOR_VOCACIONAL.md`.

Modo: somente leitura. Nada foi clonado, editado fora desta pasta, commitado ou publicado.

**Decisão: APROVAR COM ESCOPO REDUZIDO.**

## 0. Limites desta análise

- Esta é a análise do Kiro. As análises de Codex e Copilot descritas na seção 4 são hipóteses minhas sobre o ponto de vista de cada um e precisam ser substituídas pelas análises reais deles em `../codex/` e `../copilot/`.
- O DevLedger foi consultado em somente leitura com `sqlite3 -readonly` sobre `d:\github\cristianodossantosdasilva\devledger\data\devledger.db`. Foram lidos `project`, `v_project_state_current`, `decision`, `note`, `checkpoint`, `state_item` e `v_sovereign_rule_active`.
- A tabela `artifact_ref` (catálogo de mais de 3.600 artefatos) não foi consultada. Pode haver mais detalhe sobre os agentes Agentforce ali.
- A versão anterior deste relatório (entregue no chat) foi produzida sem o DevLedger. Esta substitui aquela.

## 1. Fatos observados

### 1.1 DevLedger: estado e decisões relevantes

| Fato | Fonte no DevLedger |
|---|---|
| O projeto `simulador-carreira-ti` ("IT Flight Simulator") tem `root_path` em `D:\Projetos\Ativos\it-flight-simulator-hackbrasil`. Ou seja, o DevLedger trata este repositório como a versão atual desse projeto. | `v_project_state_current` |
| O repositório GitHub privado `simulador-carreira-ti` foi criado em 11/11/2026 e está em fase de concepção. O prompt o declara fora da discussão. Não há conflito, mas o nome do projeto no DevLedger é o mesmo. | notas do projeto |
| Estado em 16/11/2026 01:44: UI Prototype v3 em produção na Vercel. Próxima ação registrada: Kiro consolida a auditoria UI/UX e implementa o redesign. O branch local `redesign-ui-ux` já tem esse trabalho. O DevLedger está defasado em relação ao Git. | `state_item` |
| Prazo: publicar a URL no painel do Hack Brasil 2026, confirmar 3 integrantes e gravar vídeo de até 3 minutos antes de 30/nov/2026. | `next_action 2` |
| Decisão 1 (aceita): o MVP cobre apenas Estagiário/N1, uma empresa fictícia. | `decision` |
| Decisão 2 (aceita): Coordenador e Gerente ficam fora do MVP. | `decision` |
| Decisão 3 (aceita): o motor determinístico é a autoridade. O LLM só conduz o diálogo. | `decision` |
| Decisão 5 (aceita): avaliação por critérios observáveis com replay, sem nota dada por IA. | `decision` |
| Portão permanente: IA real, rede externa e consumo de créditos pagos exigem autorização humana explícita prévia. | `sovereign_rule` |
| Hierarquia de autoridade: regras do DevLedger, depois estado dos projetos, depois documentos dos repositórios, depois memória de chats. | `sovereign_rule` |

### 1.2 DevLedger: projeto `hackathon-vitru-agents`

| Fato | Fonte |
|---|---|
| Descrição: portais do candidato e do aluno, gateway OpenAI, base de conhecimento, RAG e documentação técnica para apresentação AWS. | `project` |
| Checkpoint `cd9d249`: documentação AWS, matriz de evidências, pitch, arquitetura, RAG e roadmap publicados. Portais e `/health` verificados com HTTP 200 em 08/11/2026. | `checkpoint` |
| Checkpoint `d0c6abc`: gateway com CORS por allowlist e limites por IP e por conversa. 9 de 9 testes em modo fallback. | `checkpoint` |
| **O gateway Render `vitru-agent-gateway` está suspenso desde 15/11/2026**, para concentrar as horas gratuitas da Render no `it-flight-simulator-api` durante a avaliação do Hack Brasil. Backup sem segredos em `docs/auditoria-independente/consolidado/BACKUP_RENDER_VITRU_GATEWAY.json`. | `note`, `state_item` |
| Reativar exige `Resume` na Render e validar `OPENAI_API_KEY`, `AGENT_KNOWLEDGE_FILE` e `OPENAI_MODEL`. | `next_action` |
| O encerramento da última sessão não foi executado por haver alteração local não registrada no DevLedger. | `note` |
| O caminho local registrado do Vitru é `C:\Users\Black\Documents\Codex\2026-10-29\ten\work\hackathon-vitru-agents`, fora das pastas que varri antes. | `project_state` |

Consequência direta: o `script.js` do Portal do Candidato chama `https://vitru-agent-gateway.onrender.com`. Com o gateway suspenso, o chat ao vivo dos portais públicos não responde. Dependência desse gateway na demonstração da banca seria uma falha previsível.

### 1.3 Repositórios de referência (lidos pelo GitHub CLI)

| Repositório | Visibilidade | Papel | Lido | Recomendação |
|---|---|---|---|---|
| `cristianodossantosdasilva/portal-do-candidato-demo` | público | Consultor de Carreiras v7: pré-venda com 4 tópicos (roteador, quebra de objeções, fechamento de matrícula, foco na venda) | README, arquitetura, limitações, diagnóstico, `script.js` | Inspiração (guardrails e padrão de fallback) |
| `cristianodossantosdasilva/portal-aluno-demo` | público | Especialista de Sucesso do Aluno v9: retenção, suporte acadêmico e financeiro, guia do AVA | README, arquitetura, limitações, início do YAML | Inspiração só da estrutura de roteamento por intenção |
| `cristianodossantosdasilva/hackathon-vitru-agents` | privado | Jornada de Ingresso: dois agentes, `StudentEntryContext`, `AgentAdapter`, gateway OpenAI | README, arquitetura, decision-log, steering, `gateway.mjs` (trechos), prompt de pré-venda, contratos do adapter | Inspiração e adaptação conceitual |
| `02_AGENTFORCE_BACKUP`, `01_AGENT_PORTFOLIO` (locais, `D:\Projetos\Arquivados`) | local | Backups de `force-app` Agentforce | Apenas listados | Não usar. Não aparecem como projeto no DevLedger |

A busca no GitHub por `agentforce` e `vitru` só retornou `hackathon-vitru-agents`. Nenhum outro candidato confiável foi confirmado além dos três.

## 2. Análise dos repositórios

| Repositório | Função atual | Ideias aproveitáveis | Integração possível | Riscos | Recomendação |
|---|---|---|---|---|---|
| `portal-do-candidato-demo` | Chat de pré-venda em HTML, CSS e JS puros. Tenta o Agentforce e cai para uma simulação determinística rotulada | Lista de guardrails (não inventar preço, não prometer emprego, não diagnosticar vocação, não afirmar ação sem retorno real, encaminhar a humano). Rótulo explícito de modo offline | Nenhuma | Agente de venda com fechamento de matrícula. Org Salesforce temporária. Gateway suspenso | Inspirar guardrails e rótulo de modo |
| `portal-aluno-demo` | Chat de retenção pós-matrícula | Roteamento por intenção. Mensagem proativa por evento determinístico | Nenhuma | O YAML manda "garantir que o aluno continue matriculado", com urgência e gíria. Incompatível com orientação honesta | Não usar tom nem lógica de retenção |
| `hackathon-vitru-agents` | Monorepo React 19, TS e Vite. `AgentAdapter` com `MockAgentAdapter` padrão e gateway OpenAI | Regra "nenhum componente de UI fala direto com o motor". Contexto que atravessa etapas, com origem de cada campo (declarado, sistêmico, inferido). Proibição de inferir perfil psicológico. Orientação de carreira "sugestiva e opcional", nunca barreira | Só conceitual agora | Gateway com chave OpenAI, CORS e limites por IP. Domínio UniCesumar, com cursos, preços e dados de evasão | Adaptar o conceito sem copiar código |

**Conceito reutilizável:** adapter com mock padrão. Guardrails de honestidade. Rótulo de modo determinístico. Origem declarada de cada dado do aluno.

**Implementação a adaptar:** o contrato do adapter e o contexto do aluno, com campos e domínio próprios. O contexto do simulador hoje é só a sessão, o apelido e o estado da academia em `localStorage`.

**Não copiar:** prompts, YAMLs, identidade UniCesumar e Vitru, catálogo de cursos, dados e métricas de evasão, gateway Render.

**Integração a evitar:** Agentforce, Embedded Messaging e gateway OpenAI. Quebram o portão do DevLedger (IA real, rede externa, créditos pagos), dependem de org temporária e de um serviço suspenso para poupar horas do backend do simulador.

**Só no roadmap:** consultor generativo, handoff para orientador humano, contexto persistido da home para a sessão.

## 3. Estado atual do frontend (fato observado no código)

- `App.tsx` não usa router. Decide entre `TelaInicial` e laboratório pelo estado `sessaoId`.
- `TelaInicial` já contém Aulas, Caderno, Mentor, credencial e `PrimeiroVoo`. Ela é a primeira tela e já age como "home do aluno".
- O `MentorView` declara que não é um chat de IA aberto e que as respostas vêm de uma base escrita para a trilha. É o padrão de transparência a repetir.
- Testes que assumem `TelaInicial` como entrada: `App.test.tsx`, `e2e/jornadas.spec.ts`, `e2e/visual.spec.ts`.
- Backend: projetos `Simulador.Api`, `Simulador.Avaliacao`, `Simulador.Cenarios`, `Simulador.Dialogo`, `Simulador.Dominio`, `Simulador.Infra`, `Simulador.Itsm`. Nada precisa mudar.

## 4. Análise por papel

**Codex (hipótese do Kiro, a validar):** menor mudança é uma etapa `home` antes de `TelaInicial` em `App.tsx`, sem tocar backend, autenticação ou persistência. O risco principal é regressão nos testes de entrada.

**Copilot (hipótese do Kiro, a validar):** a home resolve a narrativa da banca. O risco é parecer vaporware se os cartões de outras áreas parecerem prontos. Precisa de selo visível de disponibilidade.

**Kiro (arquitetura):** cinco camadas com donos distintos.

| Camada | Dono | Pode alterar estado técnico |
|---|---|---|
| Descobrir e escolher | Home e consultor guiado por regras | Não |
| Matrícula | Fora de escopo | Não |
| Experimentar | Laboratório e motor determinístico | Sim, só o motor |
| Avaliar | Juiz 360º | Sim, só ele |
| Orientar após a experiência | Texto estático derivado de dados já avaliados | Não |

## 5. Contrapontos (a refazer com os agentes reais)

1. A home melhora a nota da banca? É hipótese. Só vale se a entrega for pequena, reversível e com atalho ao laboratório.
2. Consultor só com botões parece menos "IA". Mas a Decisão 3 e o portão de IA real tornam a transparência uma vantagem, como o Mentor já faz.
3. Integrar os agentes existentes? Não. O gateway está suspenso por decisão registrada, e reativá-lo compete com as horas gratuitas do backend do simulador.
4. Níveis de atuação: a Decisão 2 deixa Coordenador e Gerente fora do MVP. Se a home mostrar níveis, eles precisam aparecer como roteiro futuro, sem sugerir que existem.
5. Login: não há login hoje. A home não deve criar cadastro nem estado no backend.
6. Pós-experiência: o consultor só reorganiza texto a partir do `resumoCarreira` e do Currículo Vivo que o Juiz 360º já produz. Não gera avaliação própria.

## 6. Decisão e justificativa

**APROVAR COM ESCOPO REDUZIDO.**

| Dimensão | Justificativa |
|---|---|
| Negócio | A banca vê o propósito completo (descobrir, experimentar, orientar) antes do laboratório. |
| UX | O aluno entende onde está antes de entrar no ambiente. |
| Técnica | Mudança só de frontend, em uma etapa nova. Backend e contratos intactos. |
| Risco | Baixo, com atalho direto ao laboratório e testes ajustados no mesmo commit. |
| Governança | Sem IA real, rede externa ou créditos, dentro dos portões permanentes do DevLedger. |

## 7. Escopo mínimo da v1

1. Home com a mensagem "Descubra uma profissão fazendo o trabalho" e os cinco passos da jornada.
2. Cartões de áreas e níveis com selo "Disponível nesta edição" ou "Roteiro futuro". Só Suporte Técnico em TI, nível Estagiário/N1, fica disponível.
3. Consultor guiado por regras: quatro ou cinco perguntas de múltipla escolha com respostas estáticas, e rótulo "Respostas escritas para esta plataforma, não é um chat de IA".
4. Botão "Começar a experiência de Suporte Técnico", que abre a `TelaInicial` atual.
5. Atalho "Ir direto ao laboratório".
6. Opcional, só se sobrar tempo: bloco "Próximos passos" derivado de dados já existentes.

## 8. Fluxo e estados

`Descobrir` (home) → `Escolher` (cartões e perguntas) → `Experimentar` (`TelaInicial` e laboratório, inalterados) → `Receber orientação` (Currículo Vivo e Replay existentes, mais o bloco opcional) → `Decidir`.

Estado novo no frontend: `etapa: 'home' | 'academia'` e `interesse?: string`. Nada vai ao backend. Se persistir, usar chave `itfs_*` em `localStorage`, como a lista de sessões já faz.

## 9. Arquivos

Novos:

- `src/frontend/src/home/HomeVocacional.tsx`
- `src/frontend/src/home/catalogoVocacional.ts`
- `src/frontend/src/home/HomeVocacional.test.tsx`

Alterados:

- `src/frontend/src/App.tsx`
- `src/frontend/src/App.test.tsx`
- `src/frontend/e2e/jornadas.spec.ts`
- `src/frontend/e2e/visual.spec.ts`

Possível: texto em `src/frontend/src/textos/`.

Intocados: backend, `Simulador.Dialogo`, `Simulador.Avaliacao`, `docs/vetores-jcs-sha256.json`.

## 10. Critérios de aceite

1. A primeira abertura mostra a home. Um clique leva à `TelaInicial` atual sem alterar o fluxo de sessão.
2. Existe atalho direto ao laboratório. Os testes e2e passam, ajustados ao novo caminho de entrada.
3. Só Suporte Técnico em TI, nível Estagiário/N1, aparece como disponível. O resto traz o selo "Roteiro futuro".
4. Nenhum texto promete emprego, diagnóstico psicológico, formação regulamentada ou resultado.
5. O consultor não faz chamada de rede nem de IA e se declara guiado por regras.
6. Nenhum texto usa o símbolo de e comercial. `scripts/check-bundle-secrets.mjs` passa.
7. `npm.cmd run lint`, `npm.cmd test -- --run`, `npm.cmd run build` e `dotnet test src/backend/Simulador.slnx` passam.
8. A home funciona em 375 px, 768 px e 1280 px, com teclado e foco visível. Testes axe-core continuam verdes.
9. Nenhum dado real. A empresa continua Aurora Logística.

## 11. Demonstração para a banca (cerca de 3 minutos, dentro do vídeo de até 3 minutos)

1. Home: "Experimente antes de escolher" (20 s).
2. Pergunta ao consultor e resposta: "Neste primeiro percurso, Suporte Técnico em TI" (20 s).
3. Começar. Chamado na Aurora Logística, SimuDesk, nota (90 s).
4. Juiz 360º, Replay e Currículo Vivo verificável (40 s).
5. Fechamento: Suporte Técnico é a primeira experiência, as demais áreas estão no roteiro (10 s).

Se o vídeo precisar caber em 3 minutos, o passo 2 pode virar uma tela estática.

## 12. Riscos e mitigação

| Risco | Mitigação |
|---|---|
| Regressão nos testes de entrada | Atalho ao laboratório e specs atualizados no mesmo commit |
| Parecer vaporware | Selos de disponibilidade e texto "roteiro" |
| Promessas indevidas | Revisão dos textos contra os guardrails da seção 2 |
| Atrasar o MVP e o vídeo (prazo 30/nov/2026) | Etapas pequenas. A etapa 1 já é utilizável sozinha |
| Duplicar contexto e cadastro | Nenhum cadastro novo, nenhum estado no backend |
| Depender de serviço suspenso | Nenhuma chamada aos portais ou ao gateway Vitru |
| Estado do DevLedger defasado | Reconciliar o estado com o Git (branch `redesign-ui-ux`) antes de iniciar |

## 13. Plano em etapas

1. Reconciliar DevLedger com o Git e decidir se `redesign-ui-ux` entra em `main` antes ou junto.
2. Home estática, cartões, gate em `App.tsx`, atalho e testes.
3. Consultor guiado por regras.
4. Bloco "Próximos passos" derivado do `resumoCarreira`, se houver tempo.
5. Validação completa (lint, Vitest, build, Playwright 375/768/1280, `dotnet test`).

## 14. Adiado explicitamente

Consultor generativo. Agentforce e gateway Vitru. Login e cadastro. Persistência no backend. Outras áreas jogáveis. Níveis de Coordenador e Gerente. Handoff para orientador humano. Qualquer fluxo de matrícula.

## 15. Decisões humanas pendentes

1. Confirmar o escopo da seção 7.
2. A home será a tela padrão, ou a `TelaInicial` continua padrão e a home fica atrás de um link?
3. Antes de implementar: o `redesign-ui-ux` entra em `main` primeiro?
4. Autorizar o Codex e o Copilot a registrar suas análises em `../codex/` e `../copilot/`.

## 16. Resposta objetiva

A menor versão é uma home estática, com cartões de áreas (um disponível, os demais marcados como roteiro), um consultor guiado por regras com respostas escritas e um botão que abre o fluxo atual. Não usa backend, IA real, login nem os portais Vitru. Aproveita dos repositórios só os guardrails, o padrão adapter com mock e o rótulo de modo determinístico.
