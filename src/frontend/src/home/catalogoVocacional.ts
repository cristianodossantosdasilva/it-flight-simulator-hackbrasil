/**
 * Conteúdo e regras de entrada da home vocacional (entrada pública antes da Tela Inicial).
 *
 * Tudo aqui é texto escrito e estático. Não há chamada de rede, IA, motor, Event Store nem Juiz 360º.
 * O Guia de orientação explica e encaminha; quem avalia o aluno é o motor determinístico do backend.
 */

/** Marca que o visitante já passou pela apresentação (qualquer botão de saída grava este valor). */
export const CHAVE_HOME_VISTA = 'itfs_home_vista'

/** Mesma chave que o App usa para guardar os ids das sessões do navegador. Quem tem sessão salva não é visitante novo. */
export const CHAVE_SESSOES_SALVAS = 'itfs_jornada_sessoes'

type LeituraArmazenamento = Pick<Storage, 'getItem'>
type EscritaArmazenamento = Pick<Storage, 'setItem'>

/** A home aparece só para quem nunca passou por ela e não tem sessão anterior neste navegador. */
export function deveMostrarHome(armazenamento?: LeituraArmazenamento): boolean {
  try {
    const store = armazenamento ?? window.localStorage
    if (store.getItem(CHAVE_HOME_VISTA) === '1') return false
    const bruto = store.getItem(CHAVE_SESSOES_SALVAS)
    if (bruto) {
      const lista: unknown = JSON.parse(bruto)
      if (Array.isArray(lista) && lista.length > 0) return false
    }
    return true
  } catch {
    // Sem acesso ao armazenamento o navegador é tratado como novo; os botões levam ao fluxo de sempre.
    return true
  }
}

export function marcarHomeVista(armazenamento?: EscritaArmazenamento): void {
  try {
    ;(armazenamento ?? window.localStorage).setItem(CHAVE_HOME_VISTA, '1')
  } catch {
    // armazenamento indisponível: a home volta a aparecer na próxima visita, sem outro efeito
  }
}

export const TEXTOS_HOME = {
  marca: 'IT Flight Simulator',
  contexto: 'Aurora Logística, empresa fictícia com dados sintéticos',
  titulo: 'Descubra uma profissão fazendo o trabalho',
  lead:
    'Antes de escolher uma formação, experimente a rotina de uma profissão em um ambiente simulado, com chamados, ferramentas e decisões que você revê depois.',
  comecar: 'Começar a experiência de Suporte Técnico',
  irDireto: 'Ir direto ao laboratório',
  jornadaTitulo: 'Uma jornada em cinco passos',
  areasTitulo: 'Áreas e níveis',
  areasTexto: 'Nesta edição, o primeiro percurso disponível é Suporte Técnico em TI. As demais áreas ainda não estão disponíveis.',
  guiaTitulo: 'Guia de orientação',
  guiaRotulo: 'Respostas escritas para esta plataforma. Não é um chat de IA nem um teste vocacional.',
  limitesTitulo: 'O que este guia não faz',
  limites: [
    'Não faz diagnóstico psicológico nem indica uma carreira para você.',
    'Não promete emprego, salário nem resultado.',
    'Não avalia o seu desempenho. A avaliação técnica vem de critérios observáveis calculados pela plataforma.',
    'Não substitui um orientador humano.',
  ],
} as const

export interface PassoJornada {
  id: string
  titulo: string
  texto: string
}

export const JORNADA: readonly PassoJornada[] = [
  { id: 'descobrir', titulo: 'Descobrir', texto: 'Entenda o que a plataforma oferece e como a experiência funciona.' },
  {
    id: 'escolher',
    titulo: 'Escolher uma experiência',
    texto: 'Nesta edição, o primeiro percurso disponível é Suporte Técnico em TI.',
  },
  {
    id: 'experimentar',
    titulo: 'Experimentar o trabalho',
    texto: 'Atenda um chamado da Aurora Logística com ITSM, chat com usuários simulados e acesso remoto simulado.',
  },
  {
    id: 'orientacao',
    titulo: 'Receber orientação',
    texto:
      'Revise suas decisões na Caixa-Preta. O Juiz 360º avalia por critérios observáveis e a Credencial registra o que você fez.',
  },
  {
    id: 'decidir',
    titulo: 'Decidir o próximo passo',
    texto: 'Com o que você observou, escolha o que estudar a seguir. A decisão continua sendo sua.',
  },
]

export interface AreaVocacional {
  id: string
  nome: string
  descricao?: string
  nivel?: string
  disponivel: boolean
}

/** Só a primeira área tem conteúdo. As demais mostram apenas o nome e o selo de roteiro futuro. */
export const AREAS: readonly AreaVocacional[] = [
  {
    id: 'suporte-ti',
    nome: 'Suporte Técnico em TI',
    descricao: 'Atendimento de chamados, investigação de causa e comunicação com o usuário.',
    nivel: 'Começa no nível Estagiário',
    disponivel: true,
  },
  { id: 'desenvolvimento', nome: 'Desenvolvimento de software', disponivel: false },
  { id: 'dados', nome: 'Dados e análise', disponivel: false },
  { id: 'infraestrutura', nome: 'Infraestrutura e nuvem', disponivel: false },
]

export interface OpcaoGuia {
  id: string
  rotulo: string
}

export interface PerguntaGuia {
  id: 'foco' | 'ritmo'
  enunciado: string
  opcoes: readonly OpcaoGuia[]
}

export const PERGUNTAS: readonly PerguntaGuia[] = [
  {
    id: 'foco',
    enunciado: 'O que você quer entender primeiro?',
    opcoes: [
      { id: 'rotina', rotulo: 'Como é a rotina de quem trabalha com suporte técnico' },
      { id: 'competencias', rotulo: 'Quais competências a experiência exercita' },
      { id: 'avaliacao', rotulo: 'Como a plataforma mostra o que eu fiz' },
    ],
  },
  {
    id: 'ritmo',
    enunciado: 'Como você prefere começar?',
    opcoes: [
      { id: 'estudar', rotulo: 'Estudando um pouco antes' },
      { id: 'praticar', rotulo: 'Indo direto para o chamado' },
    ],
  },
]

export const RESPOSTAS_FOCO: Record<string, string> = {
  rotina:
    'Em Suporte Técnico você recebe pedidos de usuários, confere a política da empresa, investiga com cuidado e registra o que fez. No laboratório isso acontece em um chamado simulado da Aurora Logística.',
  competencias:
    'A experiência exercita a leitura do chamado, a comunicação com o usuário, a verificação de identidade, a investigação antes de alterar qualquer coisa e o registro claro do que foi feito.',
  avaliacao:
    'Ao final do turno você vê a linha do tempo das suas decisões e a avaliação por critérios. Quem avalia é o Juiz 360º da plataforma, não este guia.',
}

export type Encaminhamento = 'comecar' | 'laboratorio'

export const RESPOSTAS_RITMO: Record<string, { texto: string; encaminhamento: Encaminhamento; botao: string }> = {
  estudar: {
    texto:
      'Na tela de Missões, o destino Aulas reúne as aulas curtas de cada nível. Quando quiser, volte às Missões e escolha uma missão.',
    encaminhamento: 'comecar',
    botao: 'Seguir a sugestão: abrir as Missões',
  },
  praticar: {
    texto:
      'O atalho abre o laboratório com o chamado do nível Estagiário. Durante o turno você pode consultar o Mentor da missão.',
    encaminhamento: 'laboratorio',
    botao: 'Seguir a sugestão: abrir o laboratório',
  },
}
