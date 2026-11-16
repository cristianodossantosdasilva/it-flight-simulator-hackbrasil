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

/**
 * Entrada pública antes da Tela Inicial. Só texto estático e duas perguntas de múltipla escolha com
 * respostas escritas. Nenhuma sessão é criada aqui e nenhum estado técnico é lido ou alterado.
 */
export function HomeVocacional({ ocupado, erro, onComecar, onIrDireto }: HomeVocacionalProps) {
  const [respostas, setRespostas] = useState<Record<string, string>>({})

  const foco = respostas.foco ? RESPOSTAS_FOCO[respostas.foco] : undefined
  const ritmo = respostas.ritmo ? RESPOSTAS_RITMO[respostas.ritmo] : undefined

  return (
    <div className="home-voc">
      <a className="skip" href="#home-voc-conteudo">
        Pular para o conteúdo
      </a>

      <header className="home-voc-topo">
        <p className="home-voc-marca">
          <span className="home-voc-marca-icone" aria-hidden="true">
            <Icone nome="marca" />
          </span>
          {T.marca}
        </p>
        <AlternadorTema variante="completo" className="alternador-tema-linha" />
      </header>

      <main id="home-voc-conteudo" className="home-voc-main">
        <section className="home-voc-hero" aria-labelledby="home-voc-titulo">
          <p className="home-voc-contexto">
            <Icone nome="laboratorio" tamanho={16} />
            {T.contexto}
          </p>
          <h1 id="home-voc-titulo" className="home-voc-titulo">
            {T.titulo}
          </h1>
          <p className="home-voc-lead">{T.lead}</p>

          {erro && (
            <div className="alert-danger" role="alert">
              {erro}
            </div>
          )}

          <div className="home-voc-acoes">
            <button type="button" className="btn btn-primary btn-lg" disabled={ocupado} onClick={onComecar}>
              {T.comecar}
              <Icone nome="avancar" />
            </button>
            <button type="button" className="btn btn-secondary btn-lg" disabled={ocupado} onClick={onIrDireto}>
              {T.irDireto}
            </button>
          </div>
        </section>

        <section aria-labelledby="home-voc-jornada-titulo">
          <h2 id="home-voc-jornada-titulo" className="home-voc-secao-titulo">
            {T.jornadaTitulo}
          </h2>
          <ol className="home-voc-lista home-voc-jornada">
            {JORNADA.map((passo, indice) => (
              <li key={passo.id} className="panel home-voc-cartao">
                <span className="home-voc-numero dado-mono" aria-hidden="true">
                  {indice + 1}
                </span>
                <h3 className="home-voc-cartao-titulo">{passo.titulo}</h3>
                <p className="home-voc-cartao-texto">{passo.texto}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="home-voc-areas-titulo">
          <h2 id="home-voc-areas-titulo" className="home-voc-secao-titulo">
            {T.areasTitulo}
          </h2>
          <p className="home-voc-secao-texto">{T.areasTexto}</p>
          <ul className="home-voc-lista home-voc-areas">
            {AREAS.map((area) => (
              <li
                key={area.id}
                className={`panel home-voc-cartao home-voc-area ${area.disponivel ? 'disponivel' : 'futura'}`}
              >
                <h3 className="home-voc-cartao-titulo">{area.nome}</h3>
                {area.disponivel && area.descricao && <p className="home-voc-cartao-texto">{area.descricao}</p>}
                {area.disponivel && area.nivel && <p className="home-voc-cartao-texto">{area.nivel}</p>}
                <span className={`chip ${area.disponivel ? 'home-voc-selo-ativo' : ''}`}>
                  {area.disponivel ? 'Disponível nesta edição' : 'Roteiro futuro'}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel home-voc-guia" aria-labelledby="home-voc-guia-titulo">
          <h2 id="home-voc-guia-titulo" className="home-voc-secao-titulo">
            {T.guiaTitulo}
          </h2>
          <p className="home-voc-guia-rotulo">{T.guiaRotulo}</p>

          {PERGUNTAS.map((pergunta) => (
            <fieldset key={pergunta.id} className="home-voc-pergunta">
              <legend>{pergunta.enunciado}</legend>
              <div className="home-voc-opcoes">
                {pergunta.opcoes.map((opcao) => (
                  <label key={opcao.id} className="home-voc-opcao">
                    <input
                      type="radio"
                      name={`home-voc-${pergunta.id}`}
                      value={opcao.id}
                      checked={respostas[pergunta.id] === opcao.id}
                      onChange={() => setRespostas((anteriores) => ({ ...anteriores, [pergunta.id]: opcao.id }))}
                    />
                    <span>{opcao.rotulo}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}

          <div className="home-voc-resposta-area" role="status" aria-live="polite">
            {(foco || ritmo) && (
              <div className="home-voc-resposta">
                {foco && <p>{foco}</p>}
                {ritmo && <p>{ritmo.texto}</p>}
              </div>
            )}
          </div>
          {ritmo && (
            <button
              type="button"
              className="btn btn-secondary btn-sm home-voc-sugestao"
              disabled={ocupado}
              onClick={ritmo.encaminhamento === 'laboratorio' ? onIrDireto : onComecar}
            >
              {ritmo.botao}
            </button>
          )}
        </section>

        <section className="panel" aria-labelledby="home-voc-limites-titulo">
          <h2 id="home-voc-limites-titulo" className="home-voc-secao-titulo">
            {T.limitesTitulo}
          </h2>
          <ul className="home-voc-limites">
            {T.limites.map((linha) => (
              <li key={linha}>{linha}</li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  )
}
