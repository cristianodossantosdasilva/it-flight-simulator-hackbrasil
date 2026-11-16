# Análise do GitHub Copilot: Consultor Vocacional

Data: 16/11/2026  
Autor: GitHub Copilot  
RFC de origem: `docs/rfc/PROMPT_ORQUESTRACAO_CONSULTOR_VOCACIONAL.md`

## Conclusão

**Decisão recomendada: APROVAR COM ESCOPO REDUZIDO.**

A menor entrega convincente é uma home pública, sem login e sem dependência
externa, que explica a jornada **Descobrir → Escolher uma experiência →
Experimentar o trabalho → Receber orientação → Decidir o próximo passo**.
Nesta edição, somente Suporte Técnico em TI deve aparecer como experiência
disponível. A home pode oferecer orientação guiada por respostas escritas e
finitas, mas não deve se apresentar como diagnóstico psicológico, consultor
generativo ou avaliação técnica.

Os três repositórios Vitru devem ser tratados como referência de jornada e
guardrails. Não há justificativa técnica para integrá-los ao MVP do IT Flight
Simulator antes da submissão.

## 1. Escopo da investigação

Foram consultados:

- o RFC indicado pelo usuário;
- o grafo existente em `graphify-out/graph.json`;
- o código frontend e backend do repositório atual;
- o `AGENTS.md`;
- os repositórios GitHub:
  `portal-do-candidato-demo`,
  `portal-aluno-demo` e
  `hackathon-vitru-agents`;
- a listagem autenticada de repositórios do proprietário;
- as pastas locais disponíveis em `D:\Projetos\Ativos`.

Nenhum repositório foi clonado, editado, publicado, commitado ou sincronizado.
Nenhum código do produto foi alterado nesta análise.

## 2. Fatos observados no IT Flight Simulator

### Entrada e estado atual

O frontend ainda não usa um roteador para separar uma home pública do ambiente
de aprendizagem. `WorkstationInner` mantém o estado de sessão, a visão da
academia e o laboratório em `src/frontend/src/App.tsx:134`. A entrada atual
renderiza `TelaInicial` enquanto não há uma sessão ativa ou enquanto o
laboratório não foi aberto (`src/frontend/src/App.tsx:365`).

A criação de sessão está concentrada em `iniciarSessao`
(`src/frontend/src/App.tsx:238`). O fluxo cria a sessão pela API, recupera a
projeção, grava o identificador em `localStorage` e então abre o laboratório.
Isso indica que a home vocacional deve chamar o fluxo existente, sem duplicar
criação de sessão.

O frontend já recupera um resumo de carreira pela API
(`src/frontend/src/App.tsx:214`). Esse resumo pode sustentar uma orientação
pós-experiência somente se a home apresentar dados já produzidos pelo backend.
Ela não deve calcular competência, pontuação ou recomendação técnica própria.

### Autoridade do backend

O backend registra o `IEventStore`, cria sessões com `Motor.Iniciar`, aplica
ações com `Motor.Aplicar` e avalia resultados pelo `Juiz360`
(`src/backend/src/Simulador.Api/Program.cs:61`,
`src/backend/src/Simulador.Api/Program.cs:198`,
`src/backend/src/Simulador.Api/Program.cs:254`,
`src/backend/src/Simulador.Api/Program.cs:315`).

O `AGENTS.md` torna essa fronteira obrigatória: o motor determinístico é a
autoridade única sobre estado e execução, o Event Sourcing é append-only e o
diálogo não altera o estado técnico nem avalia o participante
(`AGENTS.md:7-9`).

Portanto, o consultor vocacional pode explicar, perguntar, encaminhar e
organizar conteúdo. Ele não pode criar eventos, liberar acessos, executar
comandos, calcular SLA ou substituir o Juiz 360º.

### Padrão conversacional já existente

O `MentorView` já declara que não é um chat aberto de inteligência artificial e
que suas respostas vêm de uma base escrita para a trilha
(`src/frontend/src/educacao/MentorView.tsx:32`,
`src/frontend/src/educacao/MentorView.tsx:179`). Esse é um precedente adequado
para a primeira versão do consultor: transparência explícita e comportamento
guiado por conteúdo conhecido.

## 3. Repositórios de referência

| Repositório | Evidência consultada | Ideia aproveitável | Recomendação |
|---|---|---|---|
| `cristianodossantosdasilva/portal-do-candidato-demo` | README, árvore, arquitetura do agente, prompt de pré-venda e `assets/js/script.js` | Acolhimento por intenção, respostas rápidas, limites contra promessas, transferência quando falta fonte e separação entre modo online e demonstração | Usar como inspiração de guardrails. Não integrar venda, matrícula, prompt ou identidade |
| `cristianodossantosdasilva/portal-aluno-demo` | README, árvore, arquitetura do agente e `assets/js/script.js` | Roteamento por intenção, abertura contextual e encaminhamento pós-matrícula | Usar apenas como referência conceitual. O domínio é pós-matrícula e não deve compartilhar estado |
| `cristianodossantosdasilva/hackathon-vitru-agents` | README, `docs/architecture.md`, `AgentAdapter.ts`, `MockAgentAdapter.ts` e prompt de pré-venda | Adapter entre UI e agente, mock offline como padrão, contexto com origem do dado e handoff com resumo | Adaptar somente princípios. Não reutilizar gateway, dados, prompts, marcas ou código |

### Descoberta adicional

A listagem autenticada confirmou os três repositórios obrigatórios e também
mostrou `simulador-carreira-ti`, que o RFC explicitamente exclui por ser versão
anterior. Não foi confirmada outra opção atual com evidência suficiente de
jornada vocacional, candidatura ou acompanhamento de aluno.

`iaton-landing-page` apareceu na listagem, mas sua descrição é institucional e
não demonstra relação confiável com a jornada deste RFC. Recomendo não incluí-lo
na decisão.

## 4. Separação entre reutilizar, adaptar e adiar

### Pode ser reutilizado como conceito

- respostas guiadas e opções rápidas;
- rótulo explícito do modo de demonstração;
- guardrails contra invenção, promessa de emprego e diagnóstico;
- adapter que isola a interface do mecanismo conversacional;
- registro da origem do contexto declarado pelo participante;
- encaminhamento com contexto, sem obrigar a pessoa a repetir sua história.

### Precisa ser adaptado

- o vocabulário de carreira deve ser o do IT Flight Simulator;
- a experiência disponível deve ser Suporte Técnico em TI;
- os níveis devem respeitar o escopo do MVP, começando por Estagiário ou N1;
- qualquer orientação posterior deve consumir somente resultados do Juiz 360º,
  Replay e Currículo Vivo;
- o estado inicial deve continuar local e simples, sem criar cadastro.

### Não deve ser copiado

- prompts dos agentes Vitru;
- YAMLs, dados, métricas e catálogo UniCesumar;
- identidade visual, nomes de agentes e textos comerciais;
- gateway OpenAI, endpoints externos e configuração de Salesforce;
- código dos portais de demonstração.

### Deve ficar fora da primeira versão

- consultor generativo;
- Agentforce, gateway OpenAI e rede externa;
- login, matrícula e persistência de perfil no backend;
- múltiplas profissões executáveis;
- avaliação vocacional ou psicológica;
- handoff real para uma equipe humana;
- promessa de emprego, salário ou empregabilidade.

## 5. Proposta de experiência mínima

### Fluxo

1. **Descobrir:** mensagem curta explicando que a plataforma permite
   experimentar uma profissão antes de escolhê-la.
2. **Escolher:** cartões de áreas e níveis. Suporte Técnico em TI recebe o selo
   de disponibilidade; os demais itens, se exibidos, recebem o selo de roteiro
   futuro.
3. **Orientar:** uma ou duas perguntas de múltipla escolha com respostas
   escritas e curtas.
4. **Experimentar:** botão que abre a `TelaInicial` atual e preserva o fluxo
   de criação de sessão.
5. **Receber orientação:** depois do laboratório, exibir ou apontar para
   resultados já existentes, sem criar nota paralela.

### Estado mínimo

O estado novo pode ser exclusivamente frontend:

```text
etapa: "home" | "academia"
interesse: string opcional
```

Se for necessário lembrar a primeira visita, usar uma chave específica no
`localStorage`, sem alterar o contrato da API. Não criar uma segunda fonte de
verdade para sessões.

### Arquivos candidatos

Estimativa para uma implementação posterior, não autorização:

- `src/frontend/src/home/HomeVocacional.tsx`;
- `src/frontend/src/home/catalogoVocacional.ts`;
- `src/frontend/src/home/HomeVocacional.test.tsx`;
- `src/frontend/src/App.tsx`;
- testes de entrada e jornadas que assumem `TelaInicial` como primeiro destino.

Não há necessidade prevista de alteração no backend, no motor determinístico,
no Event Store, no Juiz 360º ou nos vetores de integridade.

## 6. Critérios de aceite

1. A home aparece sem login e possui uma ação clara para iniciar a experiência.
2. A ação principal abre o fluxo atual sem criar sessão antes do clique.
3. Existe um atalho visível para entrar diretamente no laboratório ou na
   `TelaInicial`.
4. Somente Suporte Técnico em TI, no recorte disponível, é apresentado como
   executável nesta edição.
5. O consultor informa que usa respostas guiadas por conteúdo escrito, quando
   essa for a implementação escolhida.
6. Nenhuma mensagem promete emprego, salário, diagnóstico ou resultado
   profissional.
7. Nenhum componente vocacional chama diretamente o motor, o Event Store ou o
   Juiz 360º para produzir avaliação própria.
8. A experiência funciona em 375 px, 768 px e 1280 px, com teclado e foco
   visível.
9. Os testes de frontend, o build, a checagem de segredos e os testes backend
   passam.
10. A documentação não usa o símbolo de e comercial e continua usando apenas
    dados sintéticos e a empresa fictícia Aurora Logística.

## 7. Contrapontos

### A home melhora a avaliação da banca?

Sim, se ela tornar visível o propósito maior sem consumir o tempo da
experiência prática. Uma home longa ou um chat genérico teria o efeito oposto:
pareceria produto paralelo e reduziria o tempo de demonstração do simulador.

### O consultor precisa ser IA?

Não para a primeira entrega. O valor demonstrável é a orientação honesta antes
da experiência. Uma interface guiada por regras é mais verificável, não exige
rede e respeita a autoridade do motor. O uso de IA pode ser roadmap, não
critério de aceitação.

### Os agentes Vitru devem ser integrados?

Não. Os repositórios têm outro domínio, dependem de serviços externos e
representam momentos diferentes da jornada. A integração acrescentaria
autenticação, contratos de contexto, risco de disponibilidade e possibilidade
de misturar venda educacional com avaliação técnica.

### A home deve substituir a entrada atual?

Para visitantes novos, sim, desde que exista um atalho direto para o fluxo
atual. Para usuários com sessão salva, a opção de retornar ao laboratório deve
ser preservada. Se detectar essa condição aumentar o escopo, manter o atalho
sempre visível é a alternativa segura.

## 8. Votos do Copilot

| Pergunta | Voto | Justificativa |
|---|---|---|
| P1, escopo | **A, com simplificação** | A home com orientação guiada torna o propósito completo visível. Limitar a uma ou duas perguntas evita criar um chatbot e reduz o risco de conteúdo não verificável |
| P2, entrada | **C** | A home pode ser padrão para primeira visita, mas quem já possui sessão salva deve receber acesso direto à experiência atual. O atalho precisa permanecer visível |
| P3, ordem | **A, condicionado à validação** | Validar o redesign existente antes de abrir uma mudança separada para a home. Não misturar duas mudanças de alto impacto sem testes e sem um ponto de reversão claro |

## 9. Resposta objetiva

A menor versão que comunica o propósito completo é uma home sem login, com
jornada explícita, uma orientação guiada curta e uma chamada para o fluxo atual.
Suporte Técnico em TI é a única experiência disponível. Os repositórios Vitru
contribuem com inspiração de guardrails e separação de responsabilidades, mas
não devem ser integrados antes da aprovação humana e de uma necessidade técnica
concreta.

Esta análise não autoriza implementação.
