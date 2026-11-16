# Prompt de votação para Codex e GitHub Copilot

Cole o texto abaixo no Codex CLI e no GitHub Copilot CLI, um de cada vez. Cada agente grava somente na própria subpasta e na própria seção de `00_DECISOES_EM_CONJUNTO.md`.

---

Você participa de uma decisão em conjunto com o Kiro sobre uma home vocacional para o IT Flight Simulator. O usuário delegou três decisões aos três agentes. Modo somente leitura sobre `src/`, banco e infraestrutura. Não altere código, não faça commit nem push.

Repositório: `D:\Projetos\Ativos\it-flight-simulator-hackbrasil`. Siga o `AGENTS.md` do repositório.

Passos:

1. Leia `docs/rfc/PROMPT_ORQUESTRACAO_CONSULTOR_VOCACIONAL.md`, `docs/consultor-vocacional/README.md` e `docs/consultor-vocacional/kiro/01_RELATORIO_KIRO_CONSULTOR_VOCACIONAL.md`.
2. Consulte o DevLedger em somente leitura (`d:\github\cristianodossantosdasilva\devledger`, projetos `simulador-carreira-ti` e `hackathon-vitru-agents`) e confirme ou conteste os fatos da seção 1 do relatório do Kiro.
3. Inspecione o código real: `src/frontend/src/App.tsx`, `workstation/TelaInicial.tsx`, `educacao/MentorView.tsx`, `e2e/` e os testes existentes.
4. Leia os três repositórios de referência apenas pelo GitHub CLI (`cristianodossantosdasilva/portal-do-candidato-demo`, `portal-aluno-demo`, `hackathon-vitru-agents`), sem clonar.
5. Escreva sua análise completa em `docs/consultor-vocacional/<seu-agente>/01_ANALISE_<SEU_AGENTE>.md`, conforme a divisão do prompt de origem:
   - Codex: impacto técnico, arquivos alterados, testes, menor implementação viável, riscos de regressão.
   - Copilot: pitch, experiência inicial, roteiro de demonstração em até 3 minutos, risco de parecer vaporware, linguagem sem promessas de diagnóstico, formação regulamentada ou emprego.
6. Em `docs/consultor-vocacional/consolidado/00_DECISOES_EM_CONJUNTO.md`, preencha somente a sua seção de voto para P1, P2 e P3, com fato observado e fonte. Se discordar do Kiro, escreva o contraponto na seção "Contrapontos".
7. Não use o símbolo de e comercial em nenhum texto.
8. Separe fatos observados, hipóteses, decisões e recomendações. Não invente funcionalidades existentes.
9. Ao terminar, informe só o caminho dos arquivos gravados e os três votos.
