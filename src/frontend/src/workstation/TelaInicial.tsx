import { useCallback, useEffect, useState } from 'react'
import type { CarreiraResumoResponse } from '../api/types'
import { AulasView } from '../educacao/AulasView'
import { BarraSuperior, type VisaoAcademia } from '../educacao/BarraSuperior'
import { CadernoView } from '../educacao/CadernoView'
import {
  GLOSSARIO_INICIANTE,
  type EstadoAcademia,
  type NivelEducacional,
  type NivelId,
  calcularProgressoNivel,
  nivelPorId,
  obterCardsParaHoje,
  obterProximaAcao,
  primeiraAulaNivel,
} from '../educacao/catalogoEducacional'
import { MentorView } from '../educacao/MentorView'
import { useShell } from '../shell/contextoShell'
import { CredencialView } from './CredencialView'
import { PainelPerfilExtra } from './PainelPerfilExtra'
import { PrimeiroVoo } from './PrimeiroVoo'
import { TabelaMissoes } from './TabelaMissoes'
import { usePomodoro } from './usePomodoro'

interface Props {
  onIniciar: (cenarioId: string, semente?: number, causaForcada?: string) => Promise<void>
  ocupado: boolean
  erro: string | null
  resumoCarreira?: CarreiraResumoResponse | null
  apelido?: string
  onApelidoChange?: (valor: string) => void
  onAtualizarCarreira?: (apelido?: string) => void
  estadoAcademia: EstadoAcademia
  onAtualizarAcademia: (updater: (prev: EstadoAcademia) => EstadoAcademia) => void
  /** Visao aberta ao montar (o shell usa ao voltar do laboratorio para Aulas, Caderno ou Mentor). */
  visaoInicial?: VisaoAcademia
  /** Reabre a apresentação (home vocacional). Sem esta função o atalho não aparece. */
  onRever?: () => void
}

const ETAPAS_MISSAO_ZERO = [
  {
    titulo: 'Leia o chamado no ITSM',
    texto: 'Clique em Assumir chamado e confira quem pediu ajuda e qual é a urgência (SLA).',
  },
  {
    titulo: 'Valide identidade no Chat',
    texto: 'Antes de mexer no computador ou resetar senha, confirme matrícula e ramal com segurança.',
  },
  {
    titulo: 'Investigue antes de alterar',
    texto: 'Use o SimuDesk para observar pistas reais antes de trocar qualquer configuração.',
  },
  {
    titulo: 'Registre nota e veja a Caixa-Preta',
    texto: 'Documente o que fez em linguagem clara e abra o Replay para conferir acertos e melhorias.',
  },
]

export function TelaInicial({
  onIniciar,
  ocupado,
  erro,
  resumoCarreira,
  apelido = '',
  onApelidoChange,
  onAtualizarCarreira,
  estadoAcademia,
  onAtualizarAcademia,
  visaoInicial = 'home',
  onRever,
}: Props) {
  const shell = useShell()
  const [visao, setVisao] = useState<VisaoAcademia>(visaoInicial)
  const [credencialAberta, setCredencialAberta] = useState(false)
  const [cenario, setCenario] = useState('')
  const [semente, setSemente] = useState('')
  const [aulaAlvo, setAulaAlvo] = useState<{
    nivel: NivelId
    modo: 'lesson' | 'cards'
    aulaId?: string
    chave: number
  } | null>(null)
  const [avisoColdStart, setAvisoColdStart] = useState(false)

  const creditarMinutos = useCallback(
    (minutos: number) => onAtualizarAcademia((st) => ({ ...st, weekMin: st.weekMin + minutos })),
    [onAtualizarAcademia],
  )
  const pomodoro = usePomodoro(creditarMinutos)

  useEffect(() => {
    if (!ocupado) return
    const timer = window.setTimeout(() => setAvisoColdStart(true), 2000)
    return () => {
      window.clearTimeout(timer)
      setAvisoColdStart(false)
    }
  }, [ocupado])

  const sementeNumero = semente ? Number(semente) : undefined

  function irParaVisao(destino: VisaoAcademia) {
    setCredencialAberta(false)
    setVisao(destino)
  }

  function abrirAula(nivelId: NivelId, aulaId?: string) {
    onAtualizarAcademia((prev) => ({ ...prev, focus: nivelId }))
    setCenario(nivelPorId(nivelId).cenarioId)
    setAulaAlvo((prev) => ({
      nivel: nivelId,
      modo: 'lesson',
      aulaId: aulaId ?? primeiraAulaNivel(estadoAcademia, nivelId),
      chave: (prev?.chave ?? 0) + 1,
    }))
    irParaVisao('aulas')
  }

  function abrirFlashcards(nivelId: NivelId) {
    onAtualizarAcademia((prev) => ({ ...prev, focus: nivelId }))
    setCenario(nivelPorId(nivelId).cenarioId)
    setAulaAlvo((prev) => ({
      nivel: nivelId,
      modo: 'cards',
      chave: (prev?.chave ?? 0) + 1,
    }))
    irParaVisao('aulas')
  }

  function abrirCaderno(paginaId: string) {
    onAtualizarAcademia((prev) => ({ ...prev, activePage: paginaId }))
    irParaVisao('caderno')
  }

  function alternarTodoPlano(idx: number) {
    onAtualizarAcademia((prev) => ({
      ...prev,
      pages: prev.pages.map((p) =>
        p.id === 'plano' && p.todos
          ? {
              ...p,
              todos: p.todos.map((td, i) => (i === idx ? { ...td, done: !td.done } : td)),
            }
          : p,
      ),
    }))
  }

  function selecionarNivel(nivel: NivelEducacional) {
    setCenario(nivel.cenarioId)
    onAtualizarAcademia((prev) => ({ ...prev, focus: nivel.id }))
  }

  function praticar(nivel: NivelEducacional) {
    selecionarNivel(nivel)
    void onIniciar(nivel.cenarioId, sementeNumero)
  }

  const xpExibido = resumoCarreira ? Math.max(resumoCarreira.xpTotal, estadoAcademia.xp) : estadoAcademia.xp
  const proximaAcao = obterProximaAcao(estadoAcademia)
  const cardsHoje = obterCardsParaHoje(estadoAcademia)
  const nivelDoPasso = nivelPorId(proximaAcao.level)
  const temProgresso =
    estadoAcademia.lessonsDone.length > 0 ||
    estadoAcademia.labsDone.length > 0 ||
    estadoAcademia.pitches.length > 0 ||
    xpExibido > 0
  const primeiroNivel = nivelPorId('estagiario')

  function executarProximaAcao() {
    if (proximaAcao.act === 'lesson') {
      abrirAula(proximaAcao.level, proximaAcao.lessonId)
    } else if (proximaAcao.act === 'cards') {
      abrirFlashcards(proximaAcao.level)
    } else if (proximaAcao.act === 'lab') {
      void onIniciar(nivelDoPasso.cenarioId, sementeNumero)
    } else {
      setCredencialAberta(true)
    }
  }

  const conteudoPerfil = ({ fechar }: { fechar: () => void }) => (
    <PainelPerfilExtra
      estado={estadoAcademia}
      cardsHoje={cardsHoje}
      pomodoro={pomodoro}
      onRevisar={() => {
        fechar()
        abrirFlashcards(cardsHoje[0]?.level ?? estadoAcademia.focus)
      }}
      onAlternarTarefa={alternarTodoPlano}
      onEditarPlano={() => {
        fechar()
        abrirCaderno('plano')
      }}
    />
  )

  return (
    <div className="academia-shell">
      <a className="skip" href="#app-main">
        Pular para o conteúdo
      </a>

      <BarraSuperior
        visaoAtual={visao}
        estado={estadoAcademia}
        xpOficial={xpExibido}
        credencialAtiva={credencialAberta}
        rotuloLocal={credencialAberta ? 'Credencial' : undefined}
        onSelecionarVisao={(v) => {
          irParaVisao(v)
          if (v === 'aulas' && (!aulaAlvo || aulaAlvo.nivel !== estadoAcademia.focus)) {
            setAulaAlvo((prev) => ({
              nivel: estadoAcademia.focus,
              modo: 'lesson',
              aulaId: primeiraAulaNivel(estadoAcademia, estadoAcademia.focus),
              chave: (prev?.chave ?? 0) + 1,
            }))
          }
        }}
        onEntrarLaboratorio={() =>
          void onIniciar(cenario || nivelPorId(estadoAcademia.focus).cenarioId, sementeNumero)
        }
        onMudarFoco={(nivelId) => {
          onAtualizarAcademia((prev) => ({ ...prev, focus: nivelId }))
          setCenario(nivelPorId(nivelId).cenarioId)
        }}
        onAbrirCurriculo={() => setCredencialAberta(true)}
        conteudoPerfil={conteudoPerfil}
      />

      <main id="app-main">
        {credencialAberta && (
          <CredencialView
            estado={estadoAcademia}
            xpTotal={xpExibido}
            resumoCarreira={resumoCarreira}
            apelido={apelido}
            onApelidoChange={onApelidoChange}
            onAtualizarCarreira={onAtualizarCarreira}
            onPraticar={praticar}
          />
        )}

        {!credencialAberta && visao === 'home' && (
          <div className="page home">
            <div className="page-head">
              <h1 className="h1">IT Flight Simulator</h1>
              <p className="lead">
                Academia de suporte de TI. Estude, pratique chamados simulados no laboratório e veja suas decisões na
                Caixa-Preta, com credencial assinada em ECDSA P-256.
              </p>
              {onRever && (
                <button type="button" className="btn btn-ghost btn-sm home-rever" onClick={onRever}>
                  Rever a apresentação
                </button>
              )}
            </div>

            {(erro || (ocupado && avisoColdStart)) && (
              <div className="page-avisos">
                {ocupado && avisoColdStart && (
                  <div className="banner-notice" aria-live="polite">
                    Acordando o servidor da API na nuvem. A primeira chamada após inatividade pode levar alguns
                    segundos.
                  </div>
                )}
                {erro && (
                  <div className="alert-danger" role="alert">
                    {erro}
                  </div>
                )}
              </div>
            )}

            <div className="stack">
              <PrimeiroVoo
                temProgresso={temProgresso}
                sessaoAtiva={shell.sessaoAtiva}
                proximaAcao={proximaAcao}
                nivelFoco={nivelDoPasso}
                progressoFoco={calcularProgressoNivel(estadoAcademia, nivelDoPasso.id)}
                ocupado={ocupado}
                onIniciarPrimeiroVoo={() => void onIniciar(primeiroNivel.cenarioId, sementeNumero)}
                onEstudarAntes={() => abrirAula(primeiroNivel.id)}
                onExecutarProximaAcao={executarProximaAcao}
                onRetomarLaboratorio={() => shell.retomarLaboratorio?.()}
              />

              {/* Nao persiste a escolha manual: a cada visita a abertura segue temProgresso. */}
              <details className="glossary-details" open={!temProgresso} aria-labelledby="missao-zero-titulo">
                <summary className="missao-zero-resumo">
                  <h2 id="missao-zero-titulo" className="h2">
                    Missão 0: o que fazer dentro do chamado
                  </h2>
                  <span className="muted">
                    O Primeiro Voo abre o chamado. Este roteiro mostra o que fazer depois que ele estiver aberto.
                  </span>
                </summary>
                <ol className="steps-grid">
                  {ETAPAS_MISSAO_ZERO.map((etapa, indice) => (
                    <li key={etapa.titulo} className="step-box">
                      <strong>
                        {indice + 1}. {etapa.titulo}
                      </strong>
                      {etapa.texto}
                    </li>
                  ))}
                </ol>
              </details>
              <TabelaMissoes
                estado={estadoAcademia}
                cenarioSelecionado={cenario}
                ocupado={ocupado}
                semente={semente}
                onSementeChange={setSemente}
                onSelecionar={selecionarNivel}
                onAbrirAulas={(nivel) => abrirAula(nivel.id)}
                onPraticar={praticar}
                onDecolar={() => {
                  if (!cenario) return
                  void onIniciar(cenario, sementeNumero)
                }}
                onDemoRapida={() => void onIniciar('pasta-rede-inacessivel', 42, 'C1')}
              />

              <details className="glossary-details">
                <summary>Glossário rápido para iniciantes (ITSM, SimuDesk, KB, Caixa-Preta e Semente)</summary>
                <div className="glossary-grid">
                  {GLOSSARIO_INICIANTE.map((item) => (
                    <div key={item.termo} className="glossary-item">
                      <strong>{item.termo}:</strong> {item.definicao}
                    </div>
                  ))}
                </div>
              </details>

              <section className="edu-card card-b" aria-labelledby="escopo-titulo">
                <h2 id="escopo-titulo" className="h2">
                  Transparência do escopo: demo do hackathon e roteiro do curso livre
                </h2>
                <div className="scope-grid">
                  <div className="scope-card">
                    <h3>Implementado nesta demo</h3>
                    <ul>
                      <li>
                        Academia completa: painel, aulas com recordação ativa e SM-2, caderno estilo Cornell e Mentor
                        com Feynman e STAR.
                      </li>
                      <li>
                        Workstation determinística com 5 cenários jogáveis, ITSM, Comunicador auditável e SimuDesk
                        (Terminal, AD, DNS, Logs, SRE e SQL somente leitura).
                      </li>
                      <li>
                        Base de Conhecimento (26 artigos), Caixa-Preta Replay e Juiz 360º com assinatura ECDSA P-256.
                      </li>
                    </ul>
                  </div>
                  <div className="scope-card">
                    <h3>Roteiro pós-hackathon (ondas 1 a 4)</h3>
                    <ul>
                      <li>
                        Trilha integral de 560h (UC1 a UC8), persistência multi-tenant em PostgreSQL e simulados PBQ
                        autorais.
                      </li>
                      <li>
                        8 laboratórios interativos dedicados (Hardware ESD, Multi-OS, Cabeamento e Wi-Fi RF, M365,
                        Servidores, Firewall, Data Center e Blue Team).
                      </li>
                      <li>Chamada por voz e vídeo com personas de IA sob teto orçamentário e certificado de curso livre.</li>
                    </ul>
                  </div>
                </div>
                <p className="muted mt">
                  <strong>Aviso de dados e natureza:</strong> simulador educacional gratuito de demonstração em curso
                  livre. Opera em sessão anônima, sem login, e usa apenas dados 100% sintéticos (empresa fictícia
                  Aurora Logística). Não emite diploma técnico oficial nem certificação de terceiros.
                </p>
              </section>
            </div>
          </div>
        )}

        {!credencialAberta && visao === 'aulas' && (
          <AulasView
            key={`${aulaAlvo?.nivel ?? estadoAcademia.focus}-${aulaAlvo?.chave ?? 0}`}
            estado={estadoAcademia}
            nivel={aulaAlvo?.nivel ?? estadoAcademia.focus}
            modoInicial={aulaAlvo?.modo ?? 'lesson'}
            aulaInicialId={aulaAlvo?.aulaId}
            onAtualizarEstado={onAtualizarAcademia}
            onIrParaCaderno={abrirCaderno}
            onIniciarLaboratorio={(cid) => void onIniciar(cid, sementeNumero)}
          />
        )}

        {!credencialAberta && visao === 'caderno' && (
          <CadernoView estado={estadoAcademia} onAtualizarEstado={onAtualizarAcademia} />
        )}

        {!credencialAberta && visao === 'mentor' && (
          <MentorView estado={estadoAcademia} onAtualizarEstado={onAtualizarAcademia} />
        )}
      </main>
    </div>
  )
}
