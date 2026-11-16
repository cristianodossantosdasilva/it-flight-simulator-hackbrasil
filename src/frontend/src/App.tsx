import { Component, type ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { apiClient, ConflitoSeqError } from './api/client'
import type { CarreiraResumoResponse, ReplayResponse, SessaoProjecao } from './api/types'
import { ChatApp } from './apps/ChatApp/ChatApp'
import { IntranetApp } from './apps/IntranetApp/IntranetApp'
import { ItsmApp } from './apps/ItsmApp/ItsmApp'
import { SimuDeskApp } from './apps/SimuDeskApp/SimuDeskApp'
import { BarraSuperior, type VisaoAcademia } from './educacao/BarraSuperior'
import {
  type EstadoAcademia,
  carregarEstadoAcademia,
  nivelPorCenarioId,
  nivelPorId,
  responderMentor,
  salvarEstadoAcademia,
} from './educacao/catalogoEducacional'
import { CHAVE_SESSOES_SALVAS, marcarHomeVista } from './home/catalogoVocacional'
import { HomeVocacional } from './home/HomeVocacional'
import { MissionGuide } from './lab/MissionGuide'
import { roteiroDoCenario } from './lab/roteiros'
import { SplitLabWorkspace } from './lab/SplitLabWorkspace'
import { ReplayView } from './replay/ReplayView'
import { AppShell } from './shell/AppShell'
import { TEXTOS_WORKSTATION } from './textos/workstation'
import { Icone } from './ui/Icone'
import { TelaInicial } from './workstation/TelaInicial'

type Aba = 'itsm' | 'chat' | 'simudesk' | 'kb' | 'replay'

class ErrorBoundary extends Component<{ children: ReactNode }, { erro: Error | null }> {
  state = { erro: null as Error | null }
  static getDerivedStateFromError(erro: Error) {
    return { erro }
  }
  render() {
    if (this.state.erro) {
      return (
        <div className="page">
          <div className="edu-card card-b">
            <h2>Erro na Workstation</h2>
            <p className="alert-danger">{this.state.erro.message}</p>
            <button type="button" className="btn btn-primary" onClick={() => this.setState({ erro: null })}>
              Recarregar Interface
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

const TI = TEXTOS_WORKSTATION.itsm

function obterProximaDicaMissao(
  sessao: SessaoProjecao,
  nivel1Passos?: { politica: boolean; token: boolean; recusado: boolean },
): string {
  const cenario = sessao.meta.cenarioId
  const ch1 = sessao.chamados[0]
  if (!ch1) return 'Explore a Workstation.'
  if (cenario === 'triagem-engenharia-social') {
    if (ch1.status === 'Novo') return `1) Clique em "${TI.assumirChamado}" no ITSM.`
    if (!nivel1Passos?.politica) {
      return `2) Clique em "${TI.consultarPolitica}" em Ações de segurança, no ITSM.`
    }
    if (!nivel1Passos?.token) {
      return `3) Clique em "${TI.solicitarToken}" para verificar a identidade do solicitante.`
    }
    if (ch1.notas.every((n) => n.tipo !== 'Interna')) {
      return '4) Registre uma nota interna no chamado documentando a tentativa sem token.'
    }
    if (!nivel1Passos?.recusado) return `5) Clique em "${TI.recusarReset}" em Ações de segurança, no ITSM.`
    if (ch1.status !== 'Resolvido' && ch1.status !== 'Encerrado') {
      return `6) Em "Encerrar a recusa", escreva a nota pública e clique em "${TI.resolverChamado}".`
    }
    return 'Missão concluída! Abra "Juiz 360º e Replay" para conferir sua nota e seu Currículo Vivo.'
  }
  if (cenario === 'incidente-massivo') {
    if (sessao.chamados.every((c) => c.status === 'Novo')) {
      return '1) Assuma um chamado no ITSM (classifique se precisar resolver individualmente) e crie um problema ITIL.'
    }
    if (sessao.problemas.length === 0) return '2) Crie um problema ITIL no ITSM e vincule os 3 chamados.'
    if (!sessao.dialogo.acessoRemotoLiberado) {
      return '3) Valide a identidade da Maria no Comunicador IA (AUR-1042 / 2042) para liberar o SimuDesk.'
    }
    if (!sessao.estacao.servicos.some((s) => s.nome === 'AuroraGateway' && s.status === 'Running')) {
      return '4) Investigue logs e serviços no SimuDesk, eleve o privilégio e inicie o AuroraGateway.'
    }
    if (!sessao.problemas.some((p) => p.resolvido)) return '5) Registre a causa raiz (serviço e atualização) no problema e resolva em lote.'
    return 'Incidente massivo resolvido! Confira o Juiz 360º e Replay.'
  }
  if (cenario === 'sre-cloud-latencia') {
    if (ch1.status === 'Novo') return '1) Assuma e classifique o incidente SRE CH-0001 no ITSM.'
    if (!sessao.dialogo.acessoRemotoLiberado) return '2) Valide a identidade da Maria no Comunicador IA (AUR-1042 / 2042) para liberar o SimuDesk.'
    if (!sessao.estacao.compartilhamentoAcessivel) return '3) No SimuDesk, diagnostique pods, logs e curl, eleve o privilégio e aplique a mitigação.'
    if (ch1.status !== 'Resolvido' && ch1.status !== 'Encerrado') return '4) Resolva o chamado CH-0001 com nota de post-mortem.'
    return 'Incidente SRE mitigado! Confira o Juiz 360º e Replay.'
  }
  if (cenario === 'diagnostico-sql-readonly') {
    if (ch1.status === 'Novo') return '1) Assuma e classifique o chamado de auditoria SQL CH-0001 no ITSM.'
    if (!sessao.dialogo.acessoRemotoLiberado) return '2) Valide a identidade da Maria no Comunicador IA (AUR-1042 / 2042) para liberar o console SQL.'
    if (ch1.status !== 'Resolvido' && ch1.status !== 'Encerrado') return '3) Execute SELECT somente leitura no SimuDesk (sem escrita) e resolva o chamado com o diagnóstico.'
    return 'Auditoria SQL concluída! Confira o Juiz 360º e Replay.'
  }
  if (ch1.status === 'Novo') return '1) Assuma e classifique o chamado CH-0001 no ITSM.'
  if (!sessao.dialogo.acessoRemotoLiberado) return '2) Valide a identidade da Maria no Comunicador (AUR-1042 / 2042) para liberar o SimuDesk.'
  if (!sessao.estacao.compartilhamentoAcessivel) return '3) No SimuDesk, execute o diagnóstico antes de alterar e corrija a causa raiz.'
  if (ch1.status !== 'Resolvido' && ch1.status !== 'Encerrado') return '4) Resolva o chamado CH-0001 no ITSM com nota pública.'
  return 'Atendimento concluído! Confira o relatório do Juiz 360º e seu Currículo Vivo.'
}

const STORAGE_SESSOES_KEY = CHAVE_SESSOES_SALVAS

function carregarSessaoIdsSalvas(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_SESSOES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

function salvarSessaoId(id: string): string[] {
  const atuais = carregarSessaoIdsSalvas()
  const atualizados = atuais.includes(id) ? atuais : [...atuais, id]
  try {
    window.localStorage.setItem(STORAGE_SESSOES_KEY, JSON.stringify(atualizados))
  } catch {
    // ignore storage errors
  }
  return atualizados
}

function WorkstationInner({ apresentacao = false }: { apresentacao?: boolean }) {
  // A home vocacional abre só quando o main.tsx pede (visitante novo). Os testes e o fluxo antigo seguem direto.
  const [apresentando, setApresentando] = useState(apresentacao)
  const [emLaboratorio, setEmLaboratorio] = useState(false)
  const [visaoAcademia, setVisaoAcademia] = useState<VisaoAcademia>('home')
  const [estadoAcademia, setEstadoAcademia] = useState<EstadoAcademia>(() => carregarEstadoAcademia())
  const [sessaoId, setSessaoId] = useState<string | null>(null)
  const [sessao, setSessao] = useState<SessaoProjecao | null>(null)
  const [aba, setAba] = useState<Aba>('itsm')
  const [gaveta, setGaveta] = useState<'notas' | 'tutor' | null>(null)
  const [tutorMsgs, setTutorMsgs] = useState<{ who: 'me' | 'ai'; text: string }[]>([
    { who: 'ai', text: 'Estou aqui durante o atendimento. Clique em "O que faço agora?" ou pergunte algo.' },
  ])
  const retomarLaboratorio = useCallback(() => setEmLaboratorio(true), [])
  const [tutorInput, setTutorInput] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)
  const [replay, setReplay] = useState<ReplayResponse | null>(null)
  const [resumoCarreira, setResumoCarreira] = useState<CarreiraResumoResponse | null>(null)
  const [apelido, setApelido] = useState('')
  const [nivel1Passos, setNivel1Passos] = useState({ politica: false, token: false, recusado: false })
  const [historicoTerminal, setHistoricoTerminal] = useState<
    { cmd: string; saida: string; priv: string }[]
  >([])
  const [artigoKbSelecionado, setArtigoKbSelecionado] = useState<string | null>(null)
  const [kbRetornoLinkUri, setKbRetornoLinkUri] = useState<string | null>(null)
  const linkKbOrigemRef = useRef<HTMLElement | null>(null)
  const kbOrigemItsmRef = useRef(false)

  // Quem sai da Intranet sem fechar o artigo não volta ao ITSM numa consulta manual posterior.
  useEffect(() => {
    if (aba !== 'kb') kbOrigemItsmRef.current = false
  }, [aba])

  function atualizarEstadoAcademia(updater: (prev: EstadoAcademia) => EstadoAcademia) {
    setEstadoAcademia((prev) => {
      const next = updater(prev)
      salvarEstadoAcademia(next)
      return next
    })
  }

  function abrirArtigoKb(artigoId: string, origem: HTMLElement) {
    setKbRetornoLinkUri(
      origem.getAttribute('data-kb-uri') ?? origem.getAttribute('aria-label')?.replace(/^Consultar KB: /, '') ?? null,
    )
    linkKbOrigemRef.current = origem
    setArtigoKbSelecionado(artigoId)
    setAba('kb')
  }

  /** Abre o artigo a partir do ITSM. Ao fechar o artigo, o aluno volta ao chamado. */
  function abrirKbDoItsm(artigoId: string) {
    setKbRetornoLinkUri(null)
    linkKbOrigemRef.current = null
    kbOrigemItsmRef.current = true
    setArtigoKbSelecionado(artigoId)
    setAba('kb')
  }
  function fecharArtigoKb() {
    if (kbOrigemItsmRef.current) {
      kbOrigemItsmRef.current = false
      setArtigoKbSelecionado(null)
      setAba('itsm')
      return
    }
    const origem = linkKbOrigemRef.current
    if (!origem) return
    setAba('replay')
    setArtigoKbSelecionado(null)
    requestAnimationFrame(() => {
      linkKbOrigemRef.current = null
    })
  }

  async function atualizarResumoCarreira(ids?: string[], nome?: string) {
    const lista = ids ?? carregarSessaoIdsSalvas()
    if (lista.length === 0) {
      setResumoCarreira(null)
      return
    }
    try {
      const resumo = await apiClient.obterResumoCarreira(lista, (nome ?? apelido).trim() || undefined)
      setResumoCarreira(resumo)
    } catch {
      // backend pode estar reiniciando; nao bloqueia tela inicial
    }
  }

  useEffect(() => {
    let ativo = true
    const lista = carregarSessaoIdsSalvas()
    if (lista.length === 0) return
    apiClient
      .obterResumoCarreira(lista)
      .then((resumo) => {
        if (ativo) setResumoCarreira(resumo)
      })
      .catch(() => {
        // backend pode estar reiniciando; nao bloqueia tela inicial
      })
    return () => {
      ativo = false
    }
  }, [])

  async function iniciarSessao(cenarioId: string, semente?: number, causaForcada?: string) {
    setOcupado(true)
    setAviso(null)
    try {
      const criada = await apiClient.criarSessao({ cenarioId, semente, causaForcada })
      const proj = await apiClient.obterSessao(criada.sessaoId)
      const ids = salvarSessaoId(criada.sessaoId)
      const nivel = nivelPorCenarioId(cenarioId)
      atualizarEstadoAcademia((prev) => ({ ...prev, focus: nivel.id }))
      setSessaoId(criada.sessaoId)
      setSessao(proj)
      setEmLaboratorio(true)
      // Em caso de erro a home continua aberta e mostra o aviso; com sucesso o laboratório assume a tela.
      setApresentando(false)
      setReplay(null)
      setNivel1Passos({ politica: false, token: false, recusado: false })
      setHistoricoTerminal([])
      setTutorMsgs([
        {
          who: 'ai',
          text: `Turno iniciado em ${nivel.titulo}. Se travar, pergunte "O que faço agora?".`,
        },
      ])
      setAba('itsm')
      void atualizarResumoCarreira(ids)
    } catch (err) {
      setAviso(err instanceof Error ? err.message : 'Erro ao iniciar sessao')
    } finally {
      setOcupado(false)
    }
  }

  async function executarAcao(tipo: string, dados?: Record<string, unknown>) {
    if (!sessaoId || !sessao) return
    setOcupado(true)
    setAviso(null)
    try {
      const res = await apiClient.executarAcao(sessaoId, tipo, sessao.ultimoSeq, dados)
      setSessao(res.projecao)
      if (
        res.projecao.chamados.length > 0 &&
        res.projecao.chamados.every((c) => c.status === 'Resolvido' || c.status === 'Encerrado')
      ) {
        const lvl = nivelPorCenarioId(res.projecao.meta.cenarioId)
        atualizarEstadoAcademia((prev) =>
          prev.labsDone.includes(lvl.id)
            ? prev
            : { ...prev, labsDone: [...prev.labsDone, lvl.id], xp: prev.xp + 60, weekMin: prev.weekMin + 15 },
        )
      }
      for (const ev of res.eventos) {
        if (ev.tipo === 'AcaoRejeitada') {
          setAviso(`Acao rejeitada: ${String(ev.dados?.motivo ?? 'regra de negocio')}`)
        } else if (ev.tipo === 'PistaSolicitada') {
          setAviso(String(ev.dados?.texto ?? 'Pista registrada.'))
        } else if (ev.tipo === 'DnsRegistroCorrigido') {
          setAviso('N2 Virtual corrigiu o DNS! Eleve o privilegio e execute ipconfig /flushdns no SimuDesk.')
        } else if (ev.tipo === 'AcessoPastaRestabelecido') {
          setAviso('Pasta Financeiro restabelecida! Agora resolva o chamado no ITSM com nota pública.')
        } else if (ev.tipo === 'PoliticaSegurancaConsultada') {
          setNivel1Passos((p) => ({ ...p, politica: true }))
          setAviso('Política KB-001 consultada: reset de senha exige validação de matrícula e ramal e token corporativo.')
        } else if (ev.tipo === 'TokenSolicitado') {
          setNivel1Passos((p) => ({ ...p, token: true }))
          setAviso('Token corporativo verificado: solicitante NAO possui token valido (alerta de engenharia social!).')
        } else if (ev.tipo === 'ResetRecusado') {
          setNivel1Passos((p) => ({ ...p, recusado: true }))
          setAviso('Reset fraudulento recusado com seguranca! Abra "Juiz 360º e Replay" para conferir sua avaliacao.')
        } else if (ev.tipo === 'SenhaResetadaIndevidamente') {
          setAviso('ALERTA: Senha resetada sem verificacao! Incidente de seguranca registrado.')
        } else if (ev.tipo === 'ComandoExecutado' || ev.tipo === 'ComandoNaoSuportado') {
          setHistoricoTerminal((prev) => [
            ...prev,
            {
              cmd: String(ev.dados?.comando ?? ''),
              saida: String(ev.dados?.saida ?? ''),
              priv: String(ev.dados?.privilegio ?? sessao.estacao.privilegio),
            },
          ])
        }
      }
    } catch (err) {
      if (err instanceof ConflitoSeqError) {
        const atual = await apiClient.obterSessao(sessaoId)
        setSessao(atual)
        setAviso(err.message)
      } else {
        setAviso(err instanceof Error ? err.message : 'Erro ao executar acao')
      }
    } finally {
      setOcupado(false)
    }
  }

  async function enviarChat(persona: 'cliente' | 'techlead', mensagem: string) {
    if (!sessaoId || !sessao) return
    setOcupado(true)
    setAviso(null)
    try {
      const res = await apiClient.enviarChat(sessaoId, persona, mensagem, sessao.ultimoSeq)
      setSessao(res.projecao)
    } catch (err) {
      if (err instanceof ConflitoSeqError) {
        const atual = await apiClient.obterSessao(sessaoId)
        setSessao(atual)
        setAviso(err.message)
      } else {
        setAviso(err instanceof Error ? err.message : 'Erro no chat')
      }
    } finally {
      setOcupado(false)
    }
  }

  async function carregarReplay() {
    if (!sessaoId) return
    setOcupado(true)
    try {
      const r = await apiClient.obterReplay(sessaoId)
      setReplay(r)
    } catch (err) {
      setAviso(err instanceof Error ? err.message : 'Erro ao carregar replay')
    } finally {
      setOcupado(false)
    }
  }

  const sessaoAtiva = Boolean(sessaoId && sessao)

  function sairDaApresentacao() {
    marcarHomeVista()
    setApresentando(false)
  }

  /** Mesmo efeito do Primeiro Voo: abre o laboratório do nível Estagiário. Com turno em memória, só retoma. */
  async function irDiretoAoLaboratorio() {
    marcarHomeVista()
    if (sessaoId && sessao) {
      setApresentando(false)
      setEmLaboratorio(true)
      return
    }
    await iniciarSessao(nivelPorId('estagiario').cenarioId)
  }

  if (apresentando) {
    return (
      <AppShell
        densidade="editorial"
        entrada="apresentacao"
        sessaoAtiva={sessaoAtiva}
        onRetomarLaboratorio={retomarLaboratorio}
      >
        <HomeVocacional
          ocupado={ocupado}
          erro={aviso}
          onComecar={sairDaApresentacao}
          onIrDireto={() => void irDiretoAoLaboratorio()}
        />
      </AppShell>
    )
  }

  if (!sessaoId || !sessao || !emLaboratorio) {
    return (
      <AppShell densidade="editorial" sessaoAtiva={sessaoAtiva} onRetomarLaboratorio={retomarLaboratorio}>
        <TelaInicial
          visaoInicial={visaoAcademia}
          onIniciar={iniciarSessao}
          ocupado={ocupado}
          erro={aviso}
          resumoCarreira={resumoCarreira}
          apelido={apelido}
          onApelidoChange={setApelido}
          onAtualizarCarreira={(nome) => void atualizarResumoCarreira(undefined, nome)}
          estadoAcademia={estadoAcademia}
          onAtualizarAcademia={atualizarEstadoAcademia}
          onRever={() => setApresentando(true)}
        />
      </AppShell>
    )
  }

  const nivelSessao = nivelPorCenarioId(sessao.meta.cenarioId)
  const paginaNotasSessao = estadoAcademia.pages.find(
    (p) => p.level === nivelSessao.id && p.type === 'cornell',
  ) ?? {
    id: `pg-${nivelSessao.id}`,
    icon: nivelSessao.icon,
    title: `${nivelSessao.nome}: Anotações`,
    level: nivelSessao.id,
    type: 'cornell' as const,
    cues: '',
    notes: '',
    summary: '',
  }
  const dicaAtual = obterProximaDicaMissao(sessao, nivel1Passos)
  const contextoRoteiro = { sessao, passosNivel1: nivel1Passos }
  const roteiroAtual = roteiroDoCenario(sessao.meta.cenarioId)
  const passosFeitos = roteiroAtual.passos.filter((passo) => passo.concluido(contextoRoteiro)).length

  // A sessao continua em memoria: o destino Laboratorio do shell retoma o turno sem criar outro.
  function irParaAcademia(visao: VisaoAcademia = 'home') {
    setVisaoAcademia(visao)
    setEmLaboratorio(false)
    setGaveta(null)
    void atualizarResumoCarreira()
  }

  function abrirReplay() {
    setAba('replay')
    void carregarReplay()
  }

  function atualizarNotasSessao(campo: 'cues' | 'notes', valor: string) {
    atualizarEstadoAcademia((prev) => {
      const existe = prev.pages.some((p) => p.id === paginaNotasSessao.id)
      const pages = existe
        ? prev.pages.map((p) => (p.id === paginaNotasSessao.id ? { ...p, [campo]: valor } : p))
        : [...prev.pages, { ...paginaNotasSessao, [campo]: valor }]
      return { ...prev, pages }
    })
  }

  function perguntarTutorSessao(pergunta: string) {
    const q = pergunta.trim()
    if (!q) return
    const ans =
      /(agora|próximo|proximo|travei|passo)/i.test(q) ? `Próximo passo: ${dicaAtual}` : responderMentor(q)
    setTutorMsgs((m) => [...m, { who: 'me', text: q }, { who: 'ai', text: ans }])
    setTutorInput('')
  }

  return (
    <AppShell densidade="operacional" sessaoAtiva={sessaoAtiva} onRetomarLaboratorio={retomarLaboratorio}>
      <div className="workstation">
        <BarraSuperior
          visaoAtual="lab"
          estado={estadoAcademia}
          xpOficial={resumoCarreira ? Math.max(resumoCarreira.xpTotal, estadoAcademia.xp) : estadoAcademia.xp}
          onSelecionarVisao={irParaAcademia}
          onAbrirCurriculo={abrirReplay}
          credencialAtiva={aba === 'replay'}
          slotDireitoSessao={
            <>
              <span className="dado-contexto hide-sm">
                <span className="dado-contexto-rotulo">Nível</span> {sessao.meta.nivel}
              </span>
              <span className="dado-contexto">
                <Icone nome="relogio" tamanho={16} />
                <span className="dado-mono">{sessao.meta.minutoSimulado} min</span>
                <span className="sr-only">de tempo simulado</span>
              </span>
              <span className="dado-contexto hide-sm">
                <span className="dado-contexto-rotulo">Semente</span>{' '}
                <span className="dado-mono">{sessao.meta.semente}</span>
              </span>
              <span className="dado-contexto hide-sm">
                <span className="dado-contexto-rotulo">Seq</span> <span className="dado-mono">{sessao.ultimoSeq}</span>
              </span>
              <button
                type="button"
                className="botao-contexto"
                aria-pressed={gaveta === 'notas'}
                onClick={() => setGaveta((g) => (g === 'notas' ? null : 'notas'))}
              >
                <Icone nome="notas" />
                <span className="botao-contexto-texto">Minhas notas</span>
              </button>
              <button
                type="button"
                className="botao-contexto"
                aria-pressed={gaveta === 'tutor'}
                onClick={() => setGaveta((g) => (g === 'tutor' ? null : 'tutor'))}
              >
                <Icone nome="conversa" />
                <span className="botao-contexto-texto">Mentor da missão</span>
              </button>
              <button
                type="button"
                className="botao-contexto"
                aria-label="Voltar para a Tela Inicial"
                onClick={() => irParaAcademia('home')}
              >
                <Icone nome="voltar" />
                <span className="botao-contexto-texto">Tela inicial</span>
              </button>
            </>
          }
        />

        {aviso && (
          <div className="banner-notice" role="status" aria-live="polite">
            <span>{aviso}</span>
            <button type="button" className="chip" onClick={() => setAviso(null)}>
              Fechar
            </button>
          </div>
        )}

        <SplitLabWorkspace
          resumoGuia={`${passosFeitos} de ${roteiroAtual.passos.length} passos`}
          guia={
            <MissionGuide
              cenarioId={sessao.meta.cenarioId}
              contexto={contextoRoteiro}
              proximoPasso={dicaAtual}
              tituloMissao={nivelSessao.titulo}
              onAbrirFerramenta={(ferramenta) => setAba(ferramenta)}
              onAbrirCaixaPreta={abrirReplay}
            />
          }
          consola={
            <>
              <nav className="lab-ferramentas" aria-label="Aplicativos da Workstation">
                <button
                  type="button"
                  aria-current={aba === 'itsm' ? 'page' : undefined}
                  className={`dock-btn ${aba === 'itsm' ? 'active' : ''}`}
                  onClick={() => setAba('itsm')}
                >
                  <Icone nome="chamado" tamanho={16} />
                  <span>ITSM / Chamados</span>
                  <span className="dock-contagem dado-mono">{sessao.chamados.length}</span>
                </button>
                <button
                  type="button"
                  aria-current={aba === 'chat' ? 'page' : undefined}
                  className={`dock-btn ${aba === 'chat' ? 'active' : ''}`}
                  onClick={() => setAba('chat')}
                >
                  <Icone nome="conversa" tamanho={16} />
                  <span>Comunicador IA</span>
                  <span className="dock-contagem dado-mono">{sessao.dialogo.mensagens.length}</span>
                </button>
                <button
                  type="button"
                  aria-current={aba === 'simudesk' ? 'page' : undefined}
                  className={`dock-btn ${aba === 'simudesk' ? 'active' : ''}`}
                  onClick={() => setAba('simudesk')}
                >
                  <Icone nome="remoto" tamanho={16} />
                  <span>SimuDesk Remoto</span>
                  <span className={`dock-contagem ${sessao.dialogo.acessoRemotoLiberado ? 'ok' : ''}`}>
                    {sessao.dialogo.acessoRemotoLiberado ? 'Liberado' : 'Bloqueado'}
                  </span>
                </button>
                <button
                  type="button"
                  aria-current={aba === 'kb' ? 'page' : undefined}
                  className={`dock-btn ${aba === 'kb' ? 'active' : ''}`}
                  onClick={() => setAba('kb')}
                >
                  <Icone nome="base" tamanho={16} />
                  <span>Intranet / KB</span>
                </button>
                <button
                  type="button"
                  aria-current={aba === 'replay' ? 'page' : undefined}
                  className={`dock-btn ${aba === 'replay' ? 'active' : ''}`}
                  onClick={abrirReplay}
                >
                  <Icone nome="credencial" tamanho={16} />
                  <span>Juiz 360º e Replay</span>
                </button>
              </nav>

          <main className="workspace-main">
            {aba === 'itsm' && <ItsmApp sessao={sessao} onAcao={executarAcao} ocupado={ocupado} onAbrirKb={abrirKbDoItsm} />}
            {aba === 'chat' && <ChatApp sessao={sessao} onChat={enviarChat} onAcao={executarAcao} ocupado={ocupado} />}
            {aba === 'simudesk' && (
              <SimuDeskApp
                sessao={sessao}
                historicoTerminal={historicoTerminal}
                onComando={(comando) => executarAcao('estacao.executar_comando', { comando })}
                onAcao={executarAcao}
                ocupado={ocupado}
              />
            )}
            {aba === 'kb' && (
              <IntranetApp
                key={artigoKbSelecionado ?? 'intranet'}
                artigoSelecionadoId={artigoKbSelecionado}
                onArtigoFechado={fecharArtigoKb}
              />
            )}
            {aba === 'replay' && (
              <ReplayView
                replay={replay}
                onAtualizar={carregarReplay}
                ocupado={ocupado}
                onNavegaKb={abrirArtigoKb}
                kbRetornoLinkUri={kbRetornoLinkUri}
              />
            )}
          </main>
            </>
          }
          gaveta={
            gaveta ? (
              <>

          {gaveta === 'notas' && (
            <aside className="cockpit-drawer" aria-label="Minhas notas durante o atendimento">
              <div className="row-between">
                <h2 className="h3">Minhas notas: {nivelSessao.nome}</h2>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  aria-label="Fechar minhas notas"
                  onClick={() => setGaveta(null)}
                >
                  <Icone nome="fechar" />
                </button>
              </div>
              <p className="muted mt-1">Método Cornell sincronizado ao seu Caderno de estudos.</p>
              <label className="block-label" htmlFor="ws-cues">
                Perguntas-chave
              </label>
              <textarea
                id="ws-cues"
                className="block xs"
                value={paginaNotasSessao.cues ?? ''}
                onChange={(e) => atualizarNotasSessao('cues', e.target.value)}
              />
              <label className="block-label" htmlFor="ws-notes">
                Anotações
              </label>
              <textarea
                id="ws-notes"
                className="block"
                value={paginaNotasSessao.notes ?? ''}
                onChange={(e) => atualizarNotasSessao('notes', e.target.value)}
              />
              <p className="muted saved">
                <Icone nome="confirmar" tamanho={16} /> Salvo automaticamente
              </p>
            </aside>
          )}

          {gaveta === 'tutor' && (
            <aside className="cockpit-drawer" aria-label="Mentor da missão durante o atendimento">
              <div className="row-between">
                <h2 className="h3">Mentor da missão</h2>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  aria-label="Fechar mentor da missão"
                  onClick={() => setGaveta(null)}
                >
                  <Icone nome="fechar" />
                </button>
              </div>
              <p className="muted mt-1">Respostas guiadas pelo conteúdo da trilha.</p>
              <div className="chat short mt" aria-live="polite">
                {tutorMsgs.map((m, i) => (
                  <div key={i} className={`bubble ${m.who}`}>
                    {m.who === 'ai' && <div className="who">Mentor</div>}
                    {m.text}
                  </div>
                ))}
              </div>
              <div className="suggest mt">
                <button type="button" onClick={() => perguntarTutorSessao('O que faço agora?')}>
                  O que faço agora?
                </button>
                <button type="button" onClick={() => perguntarTutorSessao('O que é DNS?')}>
                  O que é DNS?
                </button>
                <button type="button" onClick={() => perguntarTutorSessao('O que é engenharia social?')}>
                  Engenharia social
                </button>
              </div>
              <form
                className="row gap mt"
                onSubmit={(e) => {
                  e.preventDefault()
                  perguntarTutorSessao(tutorInput)
                }}
              >
                <label className="skip" htmlFor="ws-tutor-in">
                  Pergunta ao mentor
                </label>
                <input
                  id="ws-tutor-in"
                  type="text"
                  className="text grow"
                  placeholder="Pergunte ao mentor..."
                  value={tutorInput}
                  onChange={(e) => setTutorInput(e.target.value)}
                />
                <button type="submit" className="btn btn-primary btn-sm">
                  Enviar
                </button>
              </form>
            </aside>
          )}
              </>
            ) : undefined
          }
        />
      </div>
    </AppShell>
  )
}

export function App({ apresentacao = false }: { apresentacao?: boolean }) {
  return (
    <ErrorBoundary>
      <WorkstationInner apresentacao={apresentacao} />
    </ErrorBoundary>
  )
}

export default App
