# Análise do Codex: Consultor Vocacional do IT Flight Simulator

Data: 16/11/2026. Autor: Codex. Prompt de origem: `docs/rfc/PROMPT_ORQUESTRACAO_CONSULTOR_VOCACIONAL.md`.

Modo: análise somente leitura. Nenhum código do produto foi alterado.

**Recomendação: APROVAR COM ESCOPO REDUZIDO.** Recomendo uma home informativa, escolhas simples guiadas por regras, uma única experiência disponível nesta edição e passagem para a entrada existente da Workstation. Nenhum agente remoto ou integração aos portais Vitru é necessário para esta primeira versão.

## 1. Fatos observados

### Repositório principal

- A raiz atual é `D:\Projetos\Ativos\it-flight-simulator-hackbrasil`, no branch `redesign-ui-ux`, HEAD `3576792` observado nesta análise.
- O grafo existente em `graphify-out/graph.json` foi consultado antes de examinar dependências e fluxo.
- A entrada da aplicação e a transição para sessão estão em `src/frontend/src/App.tsx`. `TelaInicial` recebe `visaoInicial` e `onIniciar`; a criação da sessão chama `apiClient.criarSessao` dentro de `iniciarSessao`.
- A tela inicial já reúne vistas da academia; a visão inicial é `home`, e o início do laboratório ocorre por ação explícita. Portanto, a home vocacional proposta deve preceder ou compor essa entrada com cuidado, sem criar uma segunda implementação de início de sessão.
- IDs de sessão e estado educacional já usam `localStorage`. `App.tsx` consulta `obterResumoCarreira` e mantém `CarreiraResumoResponse`; esse resumo vem da API. Isto pode embasar uma orientação pós-experiência, sem avaliação adicional no cliente.
- O repositório estabelece que motor determinístico e Juiz 360º são autoridades para estado e avaliação técnica. A home não deve chamar comandos, criar eventos ou recalcular competências.
- Há arquivos modificados e não rastreados no worktree. A contagem observada é 12 entradas; alterações preexistentes foram preservadas.

### DevLedger e estado operacional

- O banco DevLedger respondeu `integrity_check = ok` e não retornou violações na verificação de chaves estrangeiras.
- O projeto `simulador-carreira-ti` associa o caminho deste repositório ao IT Flight Simulator. Decisões aceitas registram o motor como autoridade, avaliação baseada em critérios observáveis e escopo restrito do MVP.
- A fotografia do DevLedger foi registrada em 16/11/2026 e indica 52 entradas Git sujas, enquanto a leitura local nesta análise encontrou 12. O estado registrado e o estado observado divergem; não usei a fotografia como substituto do Git atual.
- O registro do DevLedger para `hackathon-vitru-agents` informa que o gateway Render foi suspenso preventivamente em 15/11/2026. A home não deve depender desse serviço.

### Repositórios de referência

| Repositório | Confirmação observada | Uso recomendado |
|---|---|---|
| [portal-do-candidato-demo](https://github.com/cristianodossantosdasilva/portal-do-candidato-demo) | README, estrutura, histórico e documentação de arquitetura consultados pelo GitHub CLI. Demonstra pré-venda e Consultor de Carreiras, com fallback offline documentado. | Inspirar acolhimento, encaminhamento e transparência do modo. Adaptar o propósito, sem copiar prompt, identidade, dados ou fluxo de matrícula. |
| [portal-aluno-demo](https://github.com/cristianodossantosdasilva/portal-aluno-demo) | README, estrutura e histórico consultados pelo GitHub CLI. Demonstra suporte e onboarding pós-matrícula. | Inspirar continuidade pós-experiência em nível conceitual. Não integrar estado ou agente, pois público e domínio são diferentes. |
| [hackathon-vitru-agents](https://github.com/cristianodossantosdasilva/hackathon-vitru-agents) | README, arquitetura, árvore de arquivos e histórico consultados pelo GitHub CLI. Documenta agentes, contratos de adapter, portal, gateway e modo mock. | Inspirar separação entre interface e agente e clareza de modo. Não integrar gateway nem compartilhar contexto do estudante. |
| [iaton-landing-page](https://github.com/cristianodossantosdasilva/iaton-landing-page) | Identificado na listagem autenticada e README consultado. A descrição encontrada é landing institucional do IÁTON. | Descartar para esta discussão: não há evidência de jornada vocacional ou de aluno. |

Os três repositórios obrigatórios foram consultados diretamente pelo GitHub, sem clone. A busca adicional no GitHub, nas pastas locais de projetos e no DevLedger não confirmou outro candidato confiável. O histórico do GitHub Desktop não foi localizado nos arquivos de dados esperados, então ele não forneceu confirmação adicional de repositórios locais. `simulador-carreira-ti` foi excluído da análise dos repositórios de referência conforme instrução explícita.

## 2. Recomendação técnica

### Menor implementação viável

1. Criar uma home vocacional pública, sem login, com uma explicação curta da jornada.
2. Oferecer escolhas de interesse com respostas escritas e finitas, sem campo livre, diagnóstico de aptidão ou inferência psicológica.
3. Apresentar Suporte Técnico em TI como a única experiência executável nesta edição. Outras áreas, caso exibidas, devem ser identificadas como futuras.
4. Encaminhar a chamada principal à `TelaInicial` existente ou ao seu fluxo atual, sem duplicar `iniciarSessao` nem criar estado paralelo no backend.
5. Após a experiência, encaminhar ao Juiz 360º, Replay e Currículo Vivo existentes. Um bloco de orientação só deve reorganizar dados já disponíveis no resultado.
6. Manter um atalho direto ao fluxo existente durante a validação da nova entrada.

Eu não recomendo transformar quatro ou cinco perguntas em um chat de aparência generativa. Para o propósito da banca, uma ou duas escolhas claras e respostas curtas bastam. Se “consultor” for apresentado como personagem, a tela deve dizer que as respostas são guiadas por conteúdo escrito, sem sugerir IA ao vivo.

### Arquivos candidatos

Estimativa, não autorização para implementar:

- Novo componente `src/frontend/src/home/HomeVocacional.tsx` e conteúdo fixo associado, se a organização atual do frontend comportar esse módulo.
- `src/frontend/src/App.tsx` para coordenar a etapa inicial e encaminhar à `TelaInicial` existente.
- Testes unitários de navegação e conteúdo; testes E2E que assumem a entrada atual também podem precisar de ajuste.
- Sem mudança prevista em backend, `Simulador.Dominio`, `Simulador.Avaliacao`, `Simulador.Dialogo`, eventos ou vetores JCS.

A escolha entre substituir a entrada padrão ou oferecer a home por rota/atalho depende de validar o impacto nos testes e na demonstração. Não é necessário introduzir autenticação, persistência nova ou serviço externo.

### Testes necessários na implementação aprovada

- Verificar que a nova home encaminha ao mesmo fluxo existente e não cria uma sessão até a ação explícita de iniciar.
- Verificar o atalho para a entrada atual e os cenários que retomam sessões salvas.
- Verificar que a orientação pós-experiência apresenta somente resultados da API e não calcula uma nota própria.
- Atualizar testes de frontend/E2E afetados pelo ponto de entrada.
- Executar os comandos de lint, testes e build documentados em `AGENTS.md`; confirmar que a checagem de segredos do bundle segue no build.
- Validar teclado, foco e larguras de 375 px, 768 px e 1280 px se a home virar a entrada principal.

Esses testes são recomendação para a fase de implementação. Não foram executados nesta análise.

## 3. Riscos e contrapontos

| Risco | Mitigação |
|---|---|
| A home competir com a demonstração prática | Limitar a introdução a uma tela e incluir entrada direta para a experiência atual. |
| Parecer que existem várias profissões jogáveis | Mostrar distintivo de disponibilidade: somente Suporte Técnico em TI está disponível. |
| Consultor ser confundido com IA ou diagnóstico | Usar respostas finitas, conteúdo revisado e declaração clara sobre orientação informativa. |
| Divergência entre consultor e Juiz 360º | Consultor não pontua nem avalia; apenas apresenta resultados já existentes. |
| Regressão nos testes e na navegação atual | Fazer a transição em um componente de entrada, testar o atalho e preservar fluxo de sessão. |
| Dependência de agente ou gateway remoto | Não conectar os portais Vitru ou o gateway suspenso nesta fase. |

Contrapontos que Copilot e Kiro devem responder na rodada real:

- O consultor guiado por regras realmente melhora o pitch em relação a uma home informativa com um seletor simples? Se não, remover as perguntas.
- Tornar a home a entrada padrão ajuda a banca mais do que preservar `TelaInicial` como padrão e abrir a home por link? A resposta precisa considerar testes e vídeo.
- Os repositórios Vitru acrescentam valor concreto além de inspiração de fluxo e transparência? Sem caso de uso que atravesse contratos e estado, a integração só acrescenta risco.
- A orientação pós-experiência pode ser demonstrada no tempo disponível sem atrasar a experiência principal? Se não, deve ficar no roteiro futuro.

## 4. Votos do Codex

Os votos também foram registrados na seção do Codex em `../consolidado/00_DECISOES_EM_CONJUNTO.md`.

| Pergunta | Voto | Motivo resumido |
|---|---|---|
| P1 — escopo | **A, com simplificação** | A home deve ter respostas guiadas finitas para materializar o papel de orientação, mas limitar a uma ou duas escolhas e conteúdo curto. Sem chat livre ou cinco etapas conversacionais. |
| P2 — entrada | **C** | Home para visitantes novos; se houver sinal local confiável de sessão anterior, manter atalho direto à `TelaInicial`. Evita surpresa para retorno sem exigir cadastro. Se essa distinção ampliar risco ou prazo, usar A com atalho visível. |
| P3 — ordem | **A, condicionado à validação** | Validar e estabilizar o redesign já no branch antes de uma mudança separada da home. Não misturar dois objetivos sem confirmar primeiro o estado testado do branch; não fazer merge automaticamente. |

## 5. Resposta objetiva

A menor versão é uma home sem login, com explicação da jornada, uma ou duas escolhas guiadas por conteúdo estático, Suporte Técnico em TI como experiência disponível e uma chamada que abre o fluxo atual. Os resultados pós-experiência continuam sendo os do backend e do Juiz 360º. Os repositórios de candidato e aluno inspiram os momentos pré e pós-experiência; `hackathon-vitru-agents` inspira separação de adaptadores e transparência. Nenhum deles precisa ser integrado para a submissão.

Esta análise não autoriza implementação. A decisão e os critérios devem receber aprovação humana antes de qualquer alteração no produto.
