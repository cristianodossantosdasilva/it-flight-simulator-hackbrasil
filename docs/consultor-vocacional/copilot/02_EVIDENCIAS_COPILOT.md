# Evidências da análise do GitHub Copilot

Data: 16/11/2026  
Escopo: somente leitura

## Fontes do repositório principal

| Fonte | Evidência usada |
|---|---|
| `AGENTS.md:7-9` | Motor determinístico como autoridade, Event Sourcing append-only, diálogo sem avaliação técnica e proibição do símbolo de e comercial |
| `src/frontend/src/App.tsx:110` | Identificador das sessões persistido em `localStorage` |
| `src/frontend/src/App.tsx:134` | Componente que concentra o estado da academia e do laboratório |
| `src/frontend/src/App.tsx:214` | Recuperação do resumo de carreira pela API |
| `src/frontend/src/App.tsx:238-264` | Criação da sessão e abertura do laboratório após a resposta da API |
| `src/frontend/src/App.tsx:365` | Renderização da `TelaInicial` enquanto não há sessão ativa ou laboratório aberto |
| `src/frontend/src/educacao/MentorView.tsx:32` | Respostas baseadas no conteúdo da trilha |
| `src/frontend/src/educacao/MentorView.tsx:179` | Declaração de que o Mentor não é um chat aberto de inteligência artificial |
| `src/backend/src/Simulador.Api/Program.cs:173-212` | Criação de sessão, cenário, semente e persistência |
| `src/backend/src/Simulador.Api/Program.cs:229-264` | Aplicação de ações pelo motor determinístico |
| `src/backend/src/Simulador.Api/Program.cs:304-330` | Avaliação e Replay pelo Juiz 360º |
| `src/backend/src/Simulador.Api/Program.cs:372-398` | Resumo de carreira derivado das sessões avaliadas |

## Fontes dos repositórios externos

### Portal do Candidato

- URL: `https://github.com/cristianodossantosdasilva/portal-do-candidato-demo`
- README consultado diretamente pelo GitHub CLI.
- `docs/ARQUITETURA_DO_AGENTE.md` descreve o Consultor de Carreiras v7,
  roteamento comercial, quebra de objeções, fechamento de matrícula e uso de
  base de conhecimento.
- `assets/js/script.js` mostra uma sessão remota por gateway e um fluxo de
  abertura de conversa dependente de rede.
- O `README` documenta um fallback determinístico quando o ambiente Agentforce
  não está disponível.

**Leitura para o IT Flight Simulator:** o fallback rotulado e os guardrails são
úteis. A conversão de matrícula e o domínio comercial não são adequados para o
MVP.

### Portal do Aluno

- URL: `https://github.com/cristianodossantosdasilva/portal-aluno-demo`
- README consultado diretamente pelo GitHub CLI.
- `docs/ARQUITETURA_DO_AGENTE.md` descreve o Especialista de Sucesso do Aluno
  v9, com retenção, suporte acadêmico, suporte administrativo e guia do AVA.
- `assets/js/script.js` usa o mesmo padrão de sessão remota do portal de
  candidato, com papel `student_onboarding`.

**Leitura para o IT Flight Simulator:** a abertura contextual e o roteamento por
intenção são referências úteis para uma orientação posterior. Retenção,
matrícula e suporte acadêmico não devem ser incorporados à primeira versão.

### Hackathon Vitru Agents

- URL: `https://github.com/cristianodossantosdasilva/hackathon-vitru-agents`
- README e `docs/architecture.md` consultados diretamente pelo GitHub CLI.
- `apps/web/src/services/agent/AgentAdapter.ts` define uma fronteira entre UI e
  mecanismo conversacional.
- `MockAgentAdapter.ts` mantém a demonstração offline e explicita que o mock
  não deve inventar fatos institucionais.
- A arquitetura registra contexto com origem do campo, separando declaração do
  participante de inferência.
- A arquitetura também descreve gatilhos determinísticos para proatividade,
  sem transformar score em decisão de produto.

**Leitura para o IT Flight Simulator:** adapter, mock offline, origem do dado e
transparência são bons padrões conceituais. Não copiar código, prompts,
identidade, catálogo ou gateway.

## Busca de repositórios

### GitHub

Foi executado o inventário autenticado de repositórios do proprietário. Foram
confirmados:

- `portal-do-candidato-demo`;
- `portal-aluno-demo`;
- `hackathon-vitru-agents`;
- `simulador-carreira-ti`, identificado pelo RFC como versão anterior e fora
  desta discussão.

Também foi listado `iaton-landing-page`, mas a descrição disponível não
confirmou relação com a jornada vocacional, candidatura ou aprendizagem deste
projeto.

### Sistema de arquivos

Na pasta `D:\Projetos\Ativos` foram encontradas pastas de projetos, incluindo o
repositório atual e `simulador-carreira-ti`. Não foi identificado outro clone
local confiável dos três repositórios obrigatórios.

### DevLedger

A consulta de sessões local encontrou a sessão atual de revisão do RFC. A
consulta cloud usando sintaxe DuckDB não retornou resultados e registrou erro
de sintaxe; por isso, nenhuma afirmação de DevLedger foi usada como fato
independente neste relatório. O conteúdo dos repositórios e do código local foi
priorizado.

## Limitações

- Não foi aberto o GitHub Desktop, pois o GitHub CLI e o sistema de arquivos
  forneceram as fontes disponíveis sem iniciar fluxos de publicação.
- A análise dos repositórios externos foi feita por conteúdo remoto, sem clone.
- Não foram executados lint, testes ou build, porque a solicitação foi de
  análise e geração de relatório, não de implementação.
- Os arquivos já existentes em `docs/consultor-vocacional/` não foram
  sobrescritos.

## Estado do worktree

O worktree já possuía alterações anteriores e a pasta
`docs/consultor-vocacional/` já existia antes desta escrita. Os relatórios
adicionados por esta análise ficam isolados em:

```text
docs/consultor-vocacional/copilot/
```

Nenhum arquivo fora dessa pasta foi alterado.
