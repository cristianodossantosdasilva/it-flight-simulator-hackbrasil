# Consolidado: Consultor Vocacional do IT Flight Simulator

Data: 16/11/2026. Orquestrador: Kiro. Fontes: `../kiro/01_RELATORIO_KIRO_CONSULTOR_VOCACIONAL.md`, `../codex/01_ANALISE_CODEX.md`, `../copilot/01_ANALISE_COPILOT.md`, `../copilot/02_EVIDENCIAS_COPILOT.md`, consulta ao DevLedger e ao Git.

Estado: **proposta para aprovação humana. Nenhum código foi alterado.**

## 1. Decisão

**APROVAR COM ESCOPO REDUZIDO.** Os três agentes chegaram à mesma conclusão de forma independente.

Resposta à pergunta central: a menor versão é uma home sem login, com a jornada em cinco passos, cartões de áreas (só Suporte Técnico em TI, nível Estagiário/N1, disponível), uma ou duas perguntas guiadas por respostas escritas e um botão que abre o fluxo atual. Não usa backend novo, IA real nem os portais Vitru.

## 2. Resultado das três decisões

| Pergunta | Kiro | Codex | Copilot | Resultado |
|---|---|---|---|---|
| P1, escopo | A | A, simplificado | A, simplificado | **A com simplificação, 3 a 0** |
| P2, entrada | C | C | C | **C, 3 a 0** |
| P3, ordem | A | A, condicionado | A, condicionado | **Já cumprida, ver abaixo** |

### P1: o que mudou em relação à proposta do Kiro

Kiro propôs quatro ou cinco perguntas. Codex e Copilot pediram uma ou duas, e Codex duvidou que mais perguntas melhorem o pitch. O Kiro aceita a simplificação, porque cinco passos de conversa pesam no vídeo de 3 minutos e se aproximam de um chat generativo, que a v1 não é. Escopo final: **duas perguntas de múltipla escolha, sem campo livre**.

### P2: entrada

Todos votaram C: a home aparece para quem não tem sessão anterior. Quem já tem sessão salva entra direto na `TelaInicial`. Os três aceitam A (home sempre padrão, com atalho visível) como plano B se a detecção aumentar o risco.

Sinal técnico de "tem sessão anterior": a chave `itfs_jornada_sessoes` no `localStorage`, que o `App.tsx` já grava (`STORAGE_SESSOES_KEY`). É hipótese de implementação, ainda não testada.

### P3: ordem em relação ao `redesign-ui-ux`

A pergunta perdeu o objeto. Verificado no Git agora:

- `main` e `redesign-ui-ux` apontam para o mesmo commit `a88988c` ("redesign UI/UX com tokens, shell, Split-Screen Lab e validacao visual").
- `main` está sincronizada com `origin/main`.
- A execução de CI desse commit terminou com sucesso no GitHub Actions.

Logo, o redesign já está em `main`. Os votos A dos três agentes ficam atendidos sem ação. A implementação da home deve sair de um branch novo a partir de `main`.

## 3. Onde os agentes divergiram e como foi resolvido

| Ponto | Divergência | Resolução proposta |
|---|---|---|
| Número de perguntas | Kiro 4 a 5, Codex e Copilot 1 a 2 | 2 perguntas |
| Cartões de outras áreas | Kiro: mostrar como roteiro. Codex: "se exibidos". Copilot: "se exibidos" | Mostrar, desabilitados, com selo "Roteiro futuro" e sem detalhes inventados (ver pergunta Q2) |
| Bloco "Próximos passos" pós-experiência | Kiro: opcional. Codex: só se couber no tempo. Copilot: apontar para resultados existentes | Fora da v1. A home só nomeia, no passo 4 da jornada, o Replay e o Currículo Vivo que já existem |
| Divergência de estado | Codex viu 12 entradas sujas, DevLedger registrou 52. Hoje há 5 | Não é problema do produto. O DevLedger precisa de reconciliação |
| Repositório extra | Codex e Copilot citaram `iaton-landing-page` | Descartado pelos dois e por mim. Sem relação com a jornada |

## 4. Os três repositórios Vitru

Os três agentes concordam. Nenhum entra no produto.

| Repositório | O que aproveitar | O que não usar |
|---|---|---|
| `portal-do-candidato-demo` | Guardrails: não inventar, não prometer emprego, não diagnosticar vocação. Rótulo de modo offline | Fechamento de matrícula, prompt, identidade, gateway |
| `portal-aluno-demo` | Roteamento por intenção, como ideia | Lógica de retenção e tom de urgência |
| `hackathon-vitru-agents` | Adapter entre UI e agente, com mock padrão. Origem declarada de cada dado do aluno | Gateway OpenAI, dados UniCesumar, código |

Fato relevante do DevLedger: o gateway Vitru está suspenso desde 15/11 por decisão registrada, para poupar as horas gratuitas da API do simulador. Qualquer ligação a ele falharia na banca.

## 5. Escopo final da v1

1. Home pública, sem login, com título "Descubra uma profissão fazendo o trabalho".
2. Jornada em cinco passos: Descobrir, Escolher, Experimentar, Receber orientação, Decidir.
3. Cartões de áreas e níveis. Só Suporte Técnico em TI, Estagiário/N1, fica ativo. Os demais aparecem desabilitados, com selo "Roteiro futuro".
4. Duas perguntas de múltipla escolha, com respostas escritas. Rótulo visível: "Respostas escritas para esta plataforma. Não é um chat de IA nem um teste vocacional."
5. Botão "Começar a experiência de Suporte Técnico" que abre a `TelaInicial` atual. Nenhuma sessão é criada antes do clique final existente.
6. Atalho sempre visível "Ir direto ao laboratório".
7. Para quem tem sessão anterior, entrada direta na `TelaInicial`, com link "Rever a apresentação".

## 6. Fora da v1

Consultor generativo. Agentforce, gateway OpenAI e rede externa. Login e cadastro. Persistência no backend. Mais de uma profissão jogável. Coordenador e Gerente. Handoff para orientador humano. Bloco novo de próximos passos. Qualquer fluxo de matrícula.

## 7. Arquivos

Novos:

- `src/frontend/src/home/HomeVocacional.tsx`
- `src/frontend/src/home/catalogoVocacional.ts`
- `src/frontend/src/home/HomeVocacional.test.tsx`

Alterados:

- `src/frontend/src/App.tsx`, só o ponto de entrada
- `src/frontend/src/App.test.tsx`
- `src/frontend/e2e/jornadas.spec.ts` (11 testes)
- `src/frontend/e2e/visual.spec.ts` (3 referências)

Intocados: backend, `Simulador.Dialogo`, `Simulador.Avaliacao`, vetores JCS.

## 8. Riscos específicos

| Risco | Evidência | Mitigação |
|---|---|---|
| Os 11 testes de `jornadas.spec.ts` começam com `page.goto('/')` e esperam a `TelaInicial` | Leitura do arquivo | Nos testes, semear a chave `itfs_jornada_sessoes` ou usar um parâmetro de entrada. Decidir na implementação |
| Home atrasa o vídeo de 3 minutos | Prazo 30/nov/2026 | Home com no máximo 20 a 30 segundos de narração. O atalho existe para pular |
| Parecer que há várias profissões prontas | Análise Copilot | Cartões desabilitados com selo. Sem rotinas ou competências inventadas para as áreas futuras |
| Banca em navegador novo nunca vê a entrada antiga | Efeito de P2 | Intencional. O atalho resolve |
| Promessa indevida em texto | Guardrails Vitru | Revisão de todos os textos contra a lista da seção 4 antes do commit |

## 9. Critérios de aceite

1. A primeira abertura sem sessão anterior mostra a home. Com sessão anterior, abre a `TelaInicial`.
2. Nenhuma sessão é criada antes da ação existente de iniciar.
3. O atalho direto ao laboratório está visível na home.
4. Só Suporte Técnico em TI, Estagiário/N1, é executável. Os demais cartões não têm ação.
5. O rótulo "Respostas escritas... Não é um chat de IA" aparece junto das perguntas.
6. Nenhum texto promete emprego, salário, diagnóstico, formação regulamentada ou resultado.
7. Nenhum componente novo chama o motor, o Event Store ou o Juiz 360º. Nenhuma chamada de rede nova.
8. Funciona em 375, 768 e 1280 px, com teclado e foco visível. Os testes axe-core seguem verdes.
9. `npm.cmd run lint`, `npm.cmd test -- --run`, `npm.cmd run build`, Playwright e `dotnet test src/backend/Simulador.slnx` passam. `scripts/check-bundle-secrets.mjs` passa.
10. Nenhum símbolo de e comercial. Dados sintéticos. Empresa Aurora Logística.

## 10. Demonstração para a banca (vídeo de até 3 minutos)

1. Home e a frase central (20 s).
2. Duas perguntas e a resposta que apresenta Suporte Técnico como primeira experiência (20 s).
3. Começar. Chamado na Aurora Logística, ITSM, chat, SimuDesk (90 s).
4. Juiz 360º, Replay e Currículo Vivo verificável (40 s).
5. Fechamento: esta é a primeira experiência, as demais áreas estão no roteiro (10 s).

## 11. Implementação em etapas (após aprovação)

1. Branch novo a partir de `main`. Reconciliar o DevLedger com o Git, com autorização.
2. Home estática, gate no `App.tsx`, atalho, testes unitários.
3. Duas perguntas guiadas.
4. Ajuste dos testes e2e e visuais.
5. Validação completa e revisão de texto.
6. Commit, push e merge são portões humanos.

## 12. Perguntas para provocar a decisão

Estas são as que ainda dependem de você. Cada uma tem recomendação do Kiro.

**Q1. As duas perguntas valem o tempo do vídeo?** Codex duvida que o consultor melhore o pitch em relação a um seletor simples. Recomendação: sim, mas só duas, porque o prompt original pede um consultor que "pergunta o que o aluno deseja conhecer". Se você preferir cortar, a v1 vira só cartões e botão, e o consultor vai para depois.

**Q2. Mostrar outras áreas, mesmo desabilitadas?** Mostra a visão de longo prazo, mas é o ponto de maior risco de parecer vaporware, e a Decisão 2 do DevLedger limita o MVP a Estagiário/N1. Recomendação: mostrar três ou quatro cartões desabilitados, só com nome da área e selo "Roteiro futuro", sem descrição de rotina.

**Q3. Qual nome para o consultor?** "Consultor" pode sugerir IA ou orientador humano. Recomendação: "Guia de orientação", com o rótulo de respostas escritas.

**Q4. Os alunos com sessão anterior podem ver a home depois?** Recomendação: sim, pelo link "Rever a apresentação".

**Q5. Commits.** Hoje há alterações sem commit: `README.md`, dois arquivos em `docs/` e o prompt `docs/rfc/PROMPT_ORQUESTRACAO_CONSULTOR_VOCACIONAL.md`, além desta pasta `docs/consultor-vocacional/`. Você quer commitar esta pasta de decisão em separado, antes da implementação?

## 13. Decisão final proposta

**APROVAR COM ESCOPO REDUZIDO**, nos termos das seções 5 a 9, sujeita às suas respostas à seção 12 e à sua aprovação humana. Nada será implementado antes disso.
