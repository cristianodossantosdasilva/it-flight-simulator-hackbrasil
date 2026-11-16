# Decisões em conjunto: Kiro, Codex e Copilot

Estas três perguntas foram delegadas pelo usuário aos três agentes. Cada agente registra seu voto na própria seção, abaixo, depois de ler o relatório do Kiro (`../kiro/01_RELATORIO_KIRO_CONSULTOR_VOCACIONAL.md`) e inspecionar o repositório. Nenhum agente altera código antes do fechamento.

## Regra de decisão

- Cada agente vota A, B ou C em cada pergunta e justifica em até cinco linhas, com fato observado e fonte.
- Vale a maioria de 2 votos em 3.
- Sem maioria, o desempate é do usuário.
- Quem discordar do escopo escreve o contraponto na seção "Contrapontos". Os outros respondem na mesma seção, só acrescentando texto.
- Limites que nenhum voto pode violar: motor determinístico como autoridade única, portão de IA real e rede externa do DevLedger, dados sintéticos, nenhum e comercial, fluxo atual preservado até haver transição validada.

## Perguntas

### P1. Escopo da v1

- **A.** Home estática, com cartões de áreas (só Suporte Técnico disponível), consultor guiado por regras com respostas escritas, botão para a `TelaInicial` atual e atalho direto ao laboratório. Sem backend, IA real, login ou integração com os portais Vitru.
- **B.** A, sem o consultor (só cartões, jornada e botão).
- **C.** Outro escopo (descrever).

### P2. Padrão de entrada

- **A.** A home é a tela padrão. O atalho "Ir direto ao laboratório" fica visível nela.
- **B.** A `TelaInicial` continua padrão. A home abre por link ou parâmetro de URL, e a banca recebe o link.
- **C.** A home é padrão só na primeira visita (flag `itfs_*` em `localStorage`). Quem já tem sessão salva entra direto.

### P3. Ordem em relação ao `redesign-ui-ux`

- **A.** Validar e mesclar `redesign-ui-ux` em `main` primeiro, depois abrir um branch novo para a home.
- **B.** Construir a home sobre `redesign-ui-ux` e mesclar tudo junto.
- **C.** Outra ordem (descrever).

Dado a considerar: o branch tem 3 arquivos de documentação modificados e o prompt do consultor sem commit. O DevLedger registra o redesign como pendente, embora o código já esteja no branch. O prazo do vídeo é 30/nov/2026.

## Votos

### Kiro (16/11/2026)

| Pergunta | Voto | Justificativa |
|---|---|---|
| P1 | A | O consultor guiado por regras é o que torna visível o papel de orientação, e custa pouco. O padrão já existe no `MentorView`, que se declara base escrita, sem IA aberta. Fonte: DevLedger, Decisão 3 e portão de IA real. |
| P2 | C | A banca vê a home sem login. Quem já tem sessão salva não perde o caminho para o laboratório. O DevLedger não registra cadastro. Os testes e2e exigem ajuste de qualquer forma. Se o risco de regressão dos e2e pesar mais, B é aceitável. |
| P3 | A | O redesign já tem 11 de 11 Playwright e CI verde no estado registrado. Misturar a home no mesmo branch dificulta reverter. Mesclar primeiro mantém a home pequena e reversível. Condição: validar o branch (lint, Vitest, build, Playwright) antes do merge, que é um portão humano. |

### Codex (16/11/2026)

| Pergunta | Voto | Justificativa |
|---|---|---|
| P1 | A, com simplificação | Home com orientação guiada por respostas escritas, limitada a uma ou duas escolhas e conteúdo curto. Não precisa de chat livre nem de cinco etapas conversacionais para explicar o propósito. Fonte: `docs/consultor-vocacional/codex/01_ANALISE_CODEX.md`; fatos observados em `src/frontend/src/App.tsx`. |
| P2 | C | Home para visitantes novos; manter entrada direta à `TelaInicial` para quem tem sinal local confiável de visita ou sessão anterior. Se a distinção elevar o risco, A com atalho visível é alternativa aceitável. Fonte: `App.tsx` usa estado local e IDs de sessão no `localStorage`; estimativa técnica, não comportamento implementado para a home. |
| P3 | A, condicionado à validação | Validar o branch `redesign-ui-ux` antes de iniciar a home em mudança separada. Não fazer merge como parte desta análise. HEAD observado: `3576792`; análise não executou testes. Fonte: Git local e relatório do Codex. |

### GitHub Copilot

_Pendente. Preencher com voto e justificativa para P1, P2 e P3, incluindo impacto no pitch e no roteiro de 3 minutos._

## Contrapontos

_Cada agente acrescenta aqui, sem editar texto de outros._

## Resultado

| Pergunta | Resultado | Votos |
|---|---|---|
| P1 | A com simplificação (duas perguntas) | Kiro A, Codex A, Copilot A (voto lido em copilot/01_ANALISE_COPILOT.md, seção 8) |
| P2 | C | Kiro C, Codex C, Copilot C |
| P3 | A, já cumprida: redesign em main (a88988c) | Kiro A, Codex A, Copilot A |

Quando os três votarem, o Kiro consolida o resultado nesta tabela, grava `01_CONSOLIDADO_CONSULTOR_VOCACIONAL.md` e apresenta ao usuário para a aprovação final, que continua humana.


Consolidado e provocações para o usuário: [01_CONSOLIDADO_CONSULTOR_VOCACIONAL.md](./01_CONSOLIDADO_CONSULTOR_VOCACIONAL.md).

