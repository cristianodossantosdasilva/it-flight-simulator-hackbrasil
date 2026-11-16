# Prompt de Orquestração — Consultor Vocacional do IT Flight Simulator

Este documento deve ser enviado ao Kiro IDE como contexto completo para orquestrar uma discussão entre Codex, GitHub Copilot e Kiro. O objetivo é decidir como viabilizar uma home pública de orientação vocacional antes do ambiente de aprendizagem, sem comprometer o MVP atual.

## Repositórios de referência

Não peça ao usuário para informar manualmente os nomes dos repositórios. Todos os agentes têm acesso aos repositórios disponíveis, ao GitHub CLI, ao GitHub Desktop instalado e autenticado no computador, além do DevLedger.

Na primeira descoberta realizada para esta discussão, foram confirmados estes repositórios:

| Repositório | Papel confirmado | URL |
|---|---|---|
| `cristianodossantosdasilva/portal-do-candidato-demo` | Portal do Candidato e Consultor de Carreiras, com atuação de pré-venda, orientação, quebra de objeções e matrícula | `https://github.com/cristianodossantosdasilva/portal-do-candidato-demo` |
| `cristianodossantosdasilva/portal-aluno-demo` | Portal do Aluno e Especialista de Sucesso do Aluno, com atuação pós-matrícula, onboarding, permanência e suporte | `https://github.com/cristianodossantosdasilva/portal-aluno-demo` |
| `cristianodossantosdasilva/hackathon-vitru-agents` | Jornada de Ingresso Vitru, arquitetura dos dois agentes, handoff entre venda e onboarding, adapters e referências Agentforce | `https://github.com/cristianodossantosdasilva/hackathon-vitru-agents` |

Esses três repositórios são o conjunto inicial obrigatório. O repositório `simulador-carreira-ti` está fora desta discussão por ser uma versão anterior; ele poderá ser atualizado e revisitado no futuro. Os agentes ainda devem confirmar no DevLedger, no GitHub CLI e no sistema de arquivos se há outros repositórios atuais relacionados, incluindo variações de `Agentforce`, `Vitru`, `portal`, `aluno`, `candidato`, `carreira` e `agentes`. Se nenhum outro repositório relevante for confirmado, prossiga com os três acima e registre que a busca adicional não encontrou outro candidato confiável.

Antes da discussão:

1. Consulte o DevLedger para localizar sessões, handoffs, checkpoints, caminhos, URLs, nomes e decisões relacionadas aos agentes vocacionais e confirme os três repositórios acima.
2. Examine os repositórios locais disponíveis no computador e identifique aqueles que pertencem ao mesmo ecossistema.
3. Use o GitHub CLI autenticado para listar e pesquisar os repositórios do usuário e da organização, sem clonar ou alterar nada até confirmar a relevância.
4. Use o GitHub Desktop apenas como fonte adicional de repositórios locais já conhecidos. Não abra fluxos de publicação, commit ou sincronização.
5. Pesquise pelos seguintes termos e variações, sem assumir que os nomes estejam exatos:
   - `portal do aluno`;
   - `portal do candidato`;
   - `hackathon vitru`;
   - `hackathon vitru agentes`;
   - `agentforce`;
   - `agentes agentforce`;
   - `agente de pré-venda`;
   - `consultor de carreira`.
6. Confirme a relevância dos três repositórios acima por README, estrutura, histórico, nomes de agentes, documentação e sessões do DevLedger. Identifique também eventuais candidatos atuais adicionais até o limite de seis.
7. Classifique os repositórios encontrados em:
   - agente de pré-venda ou captação;
   - portal do candidato;
   - portal do aluno;
   - consultor de carreira pós-matrícula;
   - agentes de hackathon;
   - Agentforce ou integração relacionada;
   - não relacionado.
8. Se houver mais de seis candidatos, priorize os que contenham fluxos de orientação, candidatura, matrícula, carreira, emprego, agentes conversacionais ou jornadas de aluno.
9. Se algum repositório estiver inacessível, registre o bloqueio e continue com os demais. Não invente seu conteúdo.

Depois da descoberta, registre no relatório final:

- nome completo de cada repositório;
- proprietário ou organização;
- URL ou caminho local;
- evidências que confirmam a relevância;
- papel na jornada;
- se foi lido diretamente, consultado pelo DevLedger ou apenas identificado;
- recomendação de inspiração, integração, adaptação ou descarte.

Esses repositórios devem ser analisados como inspiração e possível fonte de integração. Não copie código, identidade visual, dados, credenciais, prompts proprietários ou decisões arquiteturais sem validação explícita.

---

## Prompt completo para o Kiro

Você é o orquestrador de uma discussão estratégica e técnica entre três agentes de IA: Codex, GitHub Copilot e Kiro.

O objetivo é chegar a uma conclusão prática sobre como viabilizar uma nova ideia para o IT Flight Simulator antes da submissão do projeto, preservando a estabilidade do MVP e evitando promessas que ainda não podem ser demonstradas.

### Contexto do IT Flight Simulator

O IT Flight Simulator é uma plataforma de orientação vocacional baseada em experiência prática. A proposta é permitir que o aluno experimente uma profissão antes de escolher uma formação ou buscar uma oportunidade de trabalho.

O MVP atual começa com Suporte Técnico em TI. O aluno atua em uma empresa fictícia chamada Aurora Logística e utiliza uma Workstation Corporativa com:

- ITSM próprio;
- fila de chamados e SLA;
- comunicação com usuários simulados;
- acesso remoto simulado;
- terminal e painéis administrativos;
- investigação de causas raiz;
- cenários determinísticos;
- Event Sourcing;
- Juiz 360º;
- Replay e Debrief;
- Currículo Vivo verificável.

O motor determinístico no backend é a autoridade única sobre estado, acesso, execução de comandos, avaliação e resultados. O diálogo ou qualquer consultor de IA não pode alterar diretamente o estado técnico nem substituir o Juiz 360º.

Hoje, a experiência conduz o aluno diretamente para o ambiente de aprendizagem, como se ele já tivesse escolhido uma profissão e iniciado uma sessão. Isso demonstra bem o simulador, mas não comunica completamente o propósito maior do produto.

### Nova ideia em avaliação

Avaliar a criação de uma home pública, anterior ao laboratório, com um consultor vocacional capaz de:

1. receber o aluno;
2. explicar o propósito da plataforma;
3. apresentar a ideia de experimentar profissões antes de escolhê-las;
4. mostrar áreas, níveis de atuação, rotinas e competências;
5. perguntar o que o aluno deseja conhecer;
6. explicar que, nesta edição, o primeiro percurso disponível é Suporte Técnico em TI;
7. conduzir o aluno para a inscrição ou início do fluxo existente;
8. orientar o aluno após a experiência com base nas competências observadas;
9. sugerir próximos passos de aprendizagem e empregabilidade.

Essa home não deve fazer diagnóstico psicológico, inventar resultados, prometer emprego, alterar o estado técnico, avaliar tecnicamente o aluno ou substituir um orientador humano.

A jornada desejada é:

**Descobrir → Escolher uma experiência → Experimentar o trabalho → Receber orientação → Decidir o próximo passo.**

### Repositórios de referência obrigatória

Analise os repositórios que forem identificados na etapa de descoberta. A investigação deve priorizar o agente de pré-venda e o consultor de carreira para alunos matriculados, mas também deve considerar os portais, agentes de hackathon e projetos Agentforce que possam conter componentes reutilizáveis ou decisões relevantes.

Para cada repositório, investigue:

- propósito e público;
- momento da jornada em que o agente atua;
- telas, fluxos e componentes;
- prompts, regras e personalidade;
- APIs, estados, persistência e integrações;
- autenticação, cadastro e contexto do usuário;
- mecanismos de inscrição, conversão ou acompanhamento;
- funcionalidades maduras que poderiam reduzir o esforço;
- limites técnicos, riscos e dependências;
- ideias que podem inspirar o consultor vocacional do IT Flight Simulator.

Separe obrigatoriamente:

- conceito que pode ser reutilizado;
- implementação que precisa ser adaptada;
- conteúdo que não deve ser copiado;
- integração que deve ser evitada;
- funcionalidade que deve ficar apenas no roadmap.

Produza uma tabela:

| Repositório | Função atual | Ideias aproveitáveis | Integração possível | Riscos | Recomendação |
|---|---|---|---|---|---|

### Divisão de análise entre os agentes

#### Codex

Analise:

- impacto técnico no frontend e backend;
- rotas, estados, navegação e transição para a sessão atual;
- possibilidade de reaproveitar os dois repositórios;
- necessidade de integração, adaptação ou reconstrução;
- impacto em autenticação, cadastro, sessão e persistência;
- riscos de regressão;
- menor implementação tecnicamente viável;
- arquivos que seriam alterados;
- testes necessários.

#### GitHub Copilot

Analise:

- clareza do pitch para a banca;
- experiência inicial do aluno;
- capacidade da home de comunicar o propósito completo;
- roteiro de demonstração em poucos minutos;
- coerência entre a promessa vocacional e o MVP disponível;
- riscos de parecer vaporware;
- linguagem adequada para não prometer diagnóstico, formação regulamentada ou emprego;
- forma mais convincente de apresentar Suporte Técnico como primeira experiência, não como limite do projeto.

#### Kiro

Analise:

- arquitetura da jornada completa;
- separação entre pré-venda, orientação vocacional, matrícula, aprendizagem e orientação pós-experiência;
- escopo mínimo do produto;
- critérios de aceite;
- estados necessários para o aluno;
- limites entre consultor, motor determinístico e Juiz 360º;
- estratégia de integração dos dois repositórios;
- ordem segura de implementação;
- decisão de implementar agora, reduzir escopo ou adiar.

### Rodada de contrapontos

Depois das análises iniciais, promova uma rodada de contrapontos entre os três agentes.

Cada agente deve questionar pelo menos duas suposições dos demais, considerando:

- a home realmente melhora a avaliação da banca?
- ela aumenta o risco de atrasar ou quebrar o MVP?
- deve ser estática, guiada por regras ou conectada a um consultor de IA?
- os agentes existentes devem ser integrados ou apenas usados como inspiração?
- o fluxo deve continuar sem login para a banca?
- como evitar duplicação de personalidade, contexto, cadastro e estado do aluno?
- como demonstrar a visão de longo prazo sem apresentar roadmap como funcionalidade pronta?
- como manter o motor determinístico como autoridade única?
- qual parte da ideia pode ser entregue com segurança antes da submissão?

### Regras obrigatórias

- Inspecionar o repositório principal antes de propor alterações.
- Descobrir e inspecionar os repositórios de referência usando DevLedger, GitHub CLI, GitHub Desktop e o sistema de arquivos local.
- Não exigir que o usuário forneça previamente os nomes dos repositórios.
- Não clonar, editar, publicar, fazer commit, fazer push ou sincronizar repositórios durante a investigação.
- Não inventar funcionalidades existentes.
- Separar fatos observados, hipóteses, decisões e recomendações.
- Respeitar o `AGENTS.md` do IT Flight Simulator.
- Não usar o símbolo de e comercial em interface ou documentação.
- Preservar dados sintéticos e a empresa fictícia Aurora Logística.
- Não copiar código, identidade visual, dados, credenciais ou prompts dos repositórios de referência.
- Não alterar código sem aprovação explícita após a discussão.
- Não modificar arquivos fora do escopo da decisão.
- Preservar o fluxo atual de demonstração até existir uma transição validada.
- O consultor pode explicar, orientar e encaminhar, mas não pode alterar o estado técnico nem produzir avaliação técnica independente.
- Não transformar a discussão em uma implementação prematura.

### Entregáveis obrigatórios

Ao final, produza:

1. resumo executivo da discussão;
2. análise dos dois repositórios de referência;
3. decisão recomendada;
4. justificativa de negócio, UX, técnica e risco;
5. escopo mínimo da primeira versão;
6. fluxo de telas e estados;
7. responsabilidades de cada agente;
8. estratégia de integração ou não integração dos repositórios;
9. arquivos que precisariam ser alterados;
10. critérios de aceite verificáveis;
11. plano de demonstração para a banca;
12. riscos e respectivas mitigações;
13. plano de implementação em etapas;
14. itens explicitamente adiados;
15. decisão final em uma destas categorias:

- **APROVAR**
- **APROVAR COM ESCOPO REDUZIDO**
- **ADIAR**
- **REJEITAR POR ENQUANTO**

A conclusão deve responder objetivamente:

> Qual é a menor versão da home vocacional que torna o propósito completo do IT Flight Simulator visível para a banca, aproveita corretamente os dois repositórios existentes e pode ser implementada sem comprometer o MVP atual?

Não implemente alterações depois da análise. Primeiro apresente a conclusão, o escopo e os critérios de aceite para aprovação humana.
