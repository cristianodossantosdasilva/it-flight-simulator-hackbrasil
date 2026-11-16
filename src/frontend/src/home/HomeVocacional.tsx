import { useState } from 'react'
import { AlternadorTema } from '../shell/AlternadorTema'
import { Icone } from '../ui/Icone'
import {
  AREAS,
  JORNADA,
  PERGUNTAS,
  RESPOSTAS_FOCO,
  RESPOSTAS_RITMO,
  TEXTOS_HOME as T,
} from './catalogoVocacional'

interface HomeVocacionalProps {
  /** Há uma chamada à API em andamento (início de sessão pelo atalho). */
  ocupado: boolean
  erro: string | null
  /** Abre a Tela Inicial (Missões). Não cria sessão. */
  onComecar: () => void
  /** Mesmo efeito do Primeiro Voo: abre o laboratório do nível Estagiário ou retoma o turno em memória. */
  onIrDireto: () => void
}

type AbaCockpit = 'itsm' | 'terminal' | 'chat'

interface ComandoExecutado {
  comando: string
  saida: string
  status: 'ok' | 'alerta' | 'sucesso'
}

/**
 * Home Vocacional: O Consultor Vocacional Interativo e Simulador de TI.
 * Ocupa 100% da largura da tela, sem limites estreitos de coluna,
 * atuando como central de diagnóstico vocacional e rampa de decolagem.
 */
export function HomeVocacional({ ocupado, erro, onComecar, onIrDireto }: HomeVocacionalProps) {
  const [respostas, setRespostas] = useState<Record<string, string>>({})
  const [abaAtiva, setAbaAtiva] = useState<AbaCockpit>('itsm')
  const [historicoComandos, setHistoricoComandos] = useState<ComandoExecutado[]>([
    {
      comando: 'ping gateway-doca4.aurora.local',
      saida: '64 bytes de 192.168.10.1: icmp_seq=1 ttl=64 tempo=1.2ms (Online)',
      status: 'ok',
    },
  ])

  const foco = respostas.foco ? RESPOSTAS_FOCO[respostas.foco] : undefined
  const ritmo = respostas.ritmo ? RESPOSTAS_RITMO[respostas.ritmo] : undefined

  function executarComandoSimulado(tipo: 'status' | 'reiniciar') {
    if (tipo === 'status') {
      setHistoricoComandos((ant) => [
        ...ant,
        {
          comando: 'systemctl status zebra-spooler',
          saida: 'ALERTA: servico spooler parado. Erro no buffer de impressao da Doca 4.',
          status: 'alerta',
        },
      ])
    } else {
      setHistoricoComandos((ant) => [
        ...ant,
        {
          comando: 'sudo systemctl restart zebra-spooler',
          saida: 'SUCESSO: servico reiniciado. Fila liberada. Etiquetas imprimindo.',
          status: 'sucesso',
        },
      ])
    }
  }

  return (
    <div className="home-voc">
      <a className="skip" href="#home-voc-conteudo">
        Pular para o conteúdo
      </a>

      <header className="home-voc-topo">
        <div className="home-voc-marca-container">
          <p className="home-voc-marca">
            <span className="home-voc-marca-icone" aria-hidden="true">
              <Icone nome="marca" tamanho={16} />
            </span>
            <span className="home-voc-marca-nome">{T.marca}</span>
          </p>
          <span className="home-voc-badge-topo">Consultor Vocacional de TI</span>
        </div>
        <div className="home-voc-topo-acoes">
          <AlternadorTema variante="completo" className="alternador-tema-linha" />
        </div>
      </header>

      <main id="home-voc-conteudo" className="home-voc-main">
        {/* HERO EM LARGURA TOTAL COM SIMULADOR INTERATIVO */}
        <section className="home-voc-hero-grid" aria-labelledby="home-voc-titulo">
          <div className="home-voc-hero">
            <div className="home-voc-pill-tag">
              <span className="home-voc-pulse-dot" aria-hidden="true" />
              <span>Consultor Vocacional e Simulador Operacional</span>
            </div>

            <h1 id="home-voc-titulo" className="home-voc-titulo">
              {T.titulo}
            </h1>

            <p className="home-voc-contexto">
              <Icone nome="laboratorio" tamanho={16} />
              {T.contexto}
            </p>

            <p className="home-voc-lead">{T.lead}</p>

            {erro && (
              <div className="alert-danger" role="alert">
                {erro}
              </div>
            )}

            <div className="home-voc-acoes">
              <button
                type="button"
                className="btn btn-primary btn-lg"
                disabled={ocupado}
                onClick={onComecar}
              >
                {T.comecar}
                <Icone nome="avancar" tamanho={16} />
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-lg"
                disabled={ocupado}
                onClick={onIrDireto}
              >
                {T.irDireto}
              </button>
            </div>

            <div className="home-voc-telemetria-strip">
              <span className="home-voc-telemetria-item">
                <Icone nome="verificar" tamanho={16} />
                Triagem Vocacional
              </span>
              <span className="home-voc-telemetria-separador" aria-hidden="true">•</span>
              <span className="home-voc-telemetria-item">
                <Icone nome="terminal" tamanho={16} />
                Prática Corporativa Real
              </span>
              <span className="home-voc-telemetria-separador" aria-hidden="true">•</span>
              <span className="home-voc-telemetria-item">
                <Icone nome="relogio" tamanho={16} />
                SLA e Caixa-Preta
              </span>
            </div>
          </div>

          {/* MINI-COCKPIT INTERATIVO */}
          <div className="home-voc-cockpit-preview" aria-label="Prévia do simulador de suporte técnico">
            <div className="home-voc-cockpit-header">
              <div className="home-voc-cockpit-dots" aria-hidden="true">
                <span className="cockpit-dot red" />
                <span className="cockpit-dot yellow" />
                <span className="cockpit-dot green" />
              </div>
              <div className="home-voc-cockpit-status">
                <span className="home-voc-pulse-dot" aria-hidden="true" />
                <span>Console Operacional Aurora Logística</span>
              </div>
              <div className="home-voc-cockpit-sla">
                <Icone nome="relogio" tamanho={16} />
                <span>SLA: 08:42</span>
              </div>
            </div>

            <div className="home-voc-cockpit-tabs" role="tablist" aria-label="Ferramentas operacionais">
              <button
                type="button"
                role="tab"
                id="tab-itsm"
                aria-selected={abaAtiva === 'itsm'}
                aria-controls="tabpanel-itsm"
                className={`home-voc-cockpit-tab ${abaAtiva === 'itsm' ? 'ativa' : ''}`}
                onClick={() => setAbaAtiva('itsm')}
              >
                <Icone nome="chamado" tamanho={16} />
                <span>Chamado #001</span>
                <span className="tab-badge-alerta">P1</span>
              </button>
              <button
                type="button"
                role="tab"
                id="tab-terminal"
                aria-selected={abaAtiva === 'terminal'}
                aria-controls="tabpanel-terminal"
                className={`home-voc-cockpit-tab ${abaAtiva === 'terminal' ? 'ativa' : ''}`}
                onClick={() => setAbaAtiva('terminal')}
              >
                <Icone nome="terminal" tamanho={16} />
                <span>SimuDesk Shell</span>
              </button>
              <button
                type="button"
                role="tab"
                id="tab-chat"
                aria-selected={abaAtiva === 'chat'}
                aria-controls="tabpanel-chat"
                className={`home-voc-cockpit-tab ${abaAtiva === 'chat' ? 'ativa' : ''}`}
                onClick={() => setAbaAtiva('chat')}
              >
                <Icone nome="conversa" tamanho={16} />
                <span>Comunicador</span>
                <span className="tab-badge-novidade">1 nova</span>
              </button>
            </div>

            <div className="home-voc-cockpit-conteudo">
              {abaAtiva === 'itsm' && (
                <div id="tabpanel-itsm" role="tabpanel" aria-labelledby="tab-itsm" className="home-voc-tabpanel">
                  <div className="home-voc-cockpit-ticket">
                    <div className="home-voc-cockpit-meta">
                      <span className="chip chip-p1">Incidente P1</span>
                      <span className="home-voc-cockpit-local">Aurora Logística - Doca 4</span>
                    </div>
                    <p className="home-voc-cockpit-assunto">
                      Impressora térmica Zebra travando expedição de cargas
                    </p>
                    <p className="home-voc-cockpit-detalhe">
                      Solicitante: Roberto Dias (Pátio). Etiquetas acumuladas e caminhões parados na rampa.
                    </p>
                  </div>
                  <div className="home-voc-cockpit-acoes-inline">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setAbaAtiva('terminal')}
                    >
                      <Icone nome="terminal" tamanho={16} />
                      Abrir SimuDesk Shell
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setAbaAtiva('chat')}
                    >
                      <Icone nome="conversa" tamanho={16} />
                      Falar com Roberto
                    </button>
                  </div>
                </div>
              )}

              {abaAtiva === 'terminal' && (
                <div id="tabpanel-terminal" role="tabpanel" aria-labelledby="tab-terminal" className="home-voc-tabpanel">
                  <div className="home-voc-terminal-box">
                    <div className="home-voc-terminal-logs">
                      {historicoComandos.map((item, i) => (
                        <div key={i} className="home-voc-log-linha">
                          <p className="cmd-prompt">
                            <span className="prompt-simbolo">$ </span>
                            {item.comando}
                          </p>
                          <p className={`cmd-saida saida-${item.status}`}>{item.saida}</p>
                        </div>
                      ))}
                    </div>
                    <div className="home-voc-terminal-controles">
                      <span className="terminal-dica">Comandos de teste:</span>
                      <button
                        type="button"
                        className="btn btn-sm cmd-btn"
                        onClick={() => executarComandoSimulado('status')}
                      >
                        status spooler
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm cmd-btn"
                        onClick={() => executarComandoSimulado('reiniciar')}
                      >
                        reiniciar spooler
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {abaAtiva === 'chat' && (
                <div id="tabpanel-chat" role="tabpanel" aria-labelledby="tab-chat" className="home-voc-tabpanel">
                  <div className="home-voc-cockpit-chat-preview">
                    <div className="home-voc-chat-msg">
                      <div className="home-voc-chat-avatar" aria-hidden="true">RD</div>
                      <div className="home-voc-chat-corpo">
                        <div className="home-voc-chat-topo">
                          <strong>Roberto Dias</strong>
                          <span className="home-voc-chat-hora">14:22</span>
                        </div>
                        <p>
                          Operador, o caminhão da rota Sul precisa sair até 14:40! A Zebra da Doca 4 não imprime o manifesto. Consegue liberar com urgência?
                        </p>
                      </div>
                    </div>
                    <div className="home-voc-chat-msg">
                      <div className="home-voc-chat-avatar avatar-operador" aria-hidden="true">TI</div>
                      <div className="home-voc-chat-corpo">
                        <div className="home-voc-chat-topo">
                          <strong>Você (Suporte N1)</strong>
                          <span className="home-voc-chat-hora">14:23</span>
                        </div>
                        <p>
                          Chamado assumido, Roberto. Estou investigando os serviços da doca agora.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="home-voc-cockpit-footer">
              <span className="home-voc-cockpit-hint">
                Simulador com chamados, chat e terminal integrados.
              </span>
              <button
                type="button"
                className="btn btn-primary btn-sm home-voc-btn-assumir"
                disabled={ocupado}
                onClick={onIrDireto}
              >
                Assumir chamado
                <Icone nome="avancar" tamanho={16} />
              </button>
            </div>
          </div>
        </section>

        {/* GUIA DE ORIENTAÇÃO (O CONSULTOR VOCACIONAL) EM LARGURA TOTAL */}
        <section
          className="home-voc-guia home-voc-secao-largura-total"
          aria-labelledby="home-voc-guia-titulo"
          role="region"
        >
          <div className="home-voc-guia-topo">
            <p className="home-voc-guia-badge">
              <Icone nome="mentor" tamanho={16} />
              <span>Consultoria e Orientação Vocacional</span>
            </p>
            <h2 id="home-voc-guia-titulo" className="home-voc-secao-titulo">
              {T.guiaTitulo}
            </h2>
            <p className="home-voc-guia-rotulo">{T.guiaRotulo}</p>
          </div>

          <div className="home-voc-perguntas-grid">
            {PERGUNTAS.map((pergunta) => (
              <fieldset key={pergunta.id} className="home-voc-pergunta">
                <legend>{pergunta.enunciado}</legend>
                <div className="home-voc-opcoes">
                  {pergunta.opcoes.map((opcao) => (
                    <label key={opcao.id} className="home-voc-opcao">
                      <input
                        type="radio"
                        name={pergunta.id}
                        value={opcao.id}
                        checked={respostas[pergunta.id] === opcao.id}
                        onChange={() =>
                          setRespostas((prev) => ({ ...prev, [pergunta.id]: opcao.id }))
                        }
                      />
                      <span>{opcao.rotulo}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>

          <div className="home-voc-resposta-area">
            {foco && (
              <p className="home-voc-resposta" role="status">
                {foco}
              </p>
            )}

            {ritmo && (
              <div className="home-voc-resposta">
                <p>{ritmo.texto}</p>
                <button
                  type="button"
                  className="btn btn-primary btn-sm home-voc-sugestao"
                  disabled={ocupado}
                  onClick={ritmo.encaminhamento === 'comecar' ? onComecar : onIrDireto}
                >
                  {ritmo.botao}
                  <Icone nome="avancar" tamanho={16} />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ÁREAS E NÍVEIS MAPEADOS EM 4 COLUNAS DE LARGURA TOTAL */}
        <section
          className="home-voc-secao-largura-total"
          aria-labelledby="home-voc-areas-titulo"
          role="region"
        >
          <div className="home-voc-secao-cabecalho">
            <h2 id="home-voc-areas-titulo" className="home-voc-secao-titulo">
              {T.areasTitulo}
            </h2>
            <p className="home-voc-secao-texto">{T.areasTexto}</p>
          </div>

          <ul className="home-voc-lista home-voc-areas">
            {AREAS.map((area) => (
              <li
                key={area.id}
                className={`home-voc-cartao home-voc-area ${area.disponivel ? 'disponivel' : 'futura'}`}
              >
                <div className="home-voc-area-header">
                  <h3 className="home-voc-cartao-titulo">{area.nome}</h3>
                  {area.disponivel && (
                    <span className="home-voc-area-badge-ativo">Disponível nesta edição</span>
                  )}
                </div>

                {area.descricao && <p className="home-voc-cartao-texto">{area.descricao}</p>}
                {area.nivel && <p className="home-voc-area-nivel">{area.nivel}</p>}

                {!area.disponivel && (
                  <span className="chip home-voc-chip-futuro">Roteiro futuro</span>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* JORNADA EM CINCO PASSOS EM 5 COLUNAS DE LARGURA TOTAL */}
        <section
          className="home-voc-secao-largura-total"
          aria-labelledby="home-voc-jornada-titulo"
          role="region"
        >
          <div className="home-voc-secao-cabecalho">
            <h2 id="home-voc-jornada-titulo" className="home-voc-secao-titulo">
              {T.jornadaTitulo}
            </h2>
            <p className="home-voc-secao-subtitulo">
              Como você avança da orientação inicial até a decisão de carreira.
            </p>
          </div>

          <ol className="home-voc-lista home-voc-jornada">
            {JORNADA.map((passo, i) => (
              <li key={passo.id} className="home-voc-cartao home-voc-passo-card">
                <div className="home-voc-passo-topo">
                  <span className="home-voc-passo-fase">Fase {i + 1}</span>
                  <span className="home-voc-numero" aria-hidden="true">
                    {i + 1}
                  </span>
                </div>
                <h3 className="home-voc-cartao-titulo">{passo.titulo}</h3>
                <p className="home-voc-cartao-texto">{passo.texto}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* COMPROMISSO ÉTICO E TRANSPARÊNCIA */}
        <section
          className="home-voc-limites-painel home-voc-secao-largura-total"
          aria-labelledby="home-voc-limites-titulo"
          role="region"
        >
          <div className="home-voc-limites-header">
            <Icone nome="verificar" tamanho={20} />
            <h2 id="home-voc-limites-titulo" className="home-voc-secao-titulo">
              {T.limitesTitulo}
            </h2>
          </div>
          <ul className="home-voc-limites">
            {T.limites.map((limite, i) => (
              <li key={i}>{limite}</li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="home-voc-rodape">
        <p className="home-voc-rodape-texto">
          {T.marca} — Plataforma de voo e orientação vocacional em TI com dados e cenários sintéticos da Aurora Logística.
        </p>
      </footer>
    </div>
  )
}
