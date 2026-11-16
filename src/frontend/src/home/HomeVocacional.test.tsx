import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import axe from 'axe-core'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { App } from '../App'
import { AppShell } from '../shell/AppShell'
import {
  AREAS,
  CHAVE_HOME_VISTA,
  CHAVE_SESSOES_SALVAS,
  JORNADA,
  PERGUNTAS,
  RESPOSTAS_FOCO,
  RESPOSTAS_RITMO,
  TEXTOS_HOME,
  deveMostrarHome,
  marcarHomeVista,
} from './catalogoVocacional'
import { HomeVocacional } from './HomeVocacional'

afterEach(() => {
  cleanup()
  window.localStorage.clear()
  vi.restoreAllMocks()
})

function armazenamento(valores: Record<string, string> = {}) {
  return { getItem: (chave: string) => (chave in valores ? valores[chave] : null) }
}

function renderHome(sobrescrever: Partial<Parameters<typeof HomeVocacional>[0]> = {}) {
  const props = { ocupado: false, erro: null, onComecar: vi.fn(), onIrDireto: vi.fn(), ...sobrescrever }
  const resultado = render(
    <AppShell entrada="apresentacao">
      <HomeVocacional {...props} />
    </AppShell>,
  )
  return { ...resultado, props }
}

describe('entrada: quando a home aparece', () => {
  it('aparece para visitante novo, sem marca e sem sessão salva', () => {
    expect(deveMostrarHome(armazenamento())).toBe(true)
  })

  it('não aparece depois que o visitante passou pela apresentação', () => {
    expect(deveMostrarHome(armazenamento({ [CHAVE_HOME_VISTA]: '1' }))).toBe(false)
  })

  it('não aparece para quem já tem sessão salva neste navegador', () => {
    expect(deveMostrarHome(armazenamento({ [CHAVE_SESSOES_SALVAS]: JSON.stringify(['sessao-1']) }))).toBe(false)
  })

  it('lista de sessões vazia ou inválida não conta como sessão anterior', () => {
    expect(deveMostrarHome(armazenamento({ [CHAVE_SESSOES_SALVAS]: '[]' }))).toBe(true)
    expect(deveMostrarHome(armazenamento({ [CHAVE_SESSOES_SALVAS]: 'não é json' }))).toBe(true)
  })

  it('armazenamento indisponível trata o navegador como novo, sem lançar erro', () => {
    const quebrado = {
      getItem: () => {
        throw new Error('bloqueado')
      },
    }
    expect(deveMostrarHome(quebrado)).toBe(true)
    expect(() => marcarHomeVista({ setItem: () => { throw new Error('bloqueado') } })).not.toThrow()
  })

  it('marcarHomeVista grava a marca que desliga a home', () => {
    marcarHomeVista()
    expect(window.localStorage.getItem(CHAVE_HOME_VISTA)).toBe('1')
    expect(deveMostrarHome()).toBe(false)
  })
})

describe('HomeVocacional', () => {
  it('mostra a frase central, o contexto fictício e os dois caminhos de saída', () => {
    renderHome()
    expect(screen.getByRole('heading', { level: 1, name: TEXTOS_HOME.titulo })).toBeInTheDocument()
    expect(screen.getByText(TEXTOS_HOME.contexto)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: new RegExp(TEXTOS_HOME.comecar) })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: TEXTOS_HOME.irDireto })).toBeInTheDocument()
  })

  it('não tem a navegação principal do laboratório nem o rail', () => {
    renderHome()
    expect(screen.queryByRole('navigation', { name: /Navegação principal/i })).not.toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Tema da interface' })).toBeInTheDocument()
  })

  it('mostra a jornada em cinco passos, na ordem Descobrir a Decidir', () => {
    renderHome()
    const secao = screen.getByRole('region', { name: TEXTOS_HOME.jornadaTitulo })
    const passos = within(secao).getAllByRole('listitem')
    expect(passos).toHaveLength(5)
    expect(JORNADA.map((p) => p.titulo)).toEqual([
      'Descobrir',
      'Escolher uma experiência',
      'Experimentar o trabalho',
      'Receber orientação',
      'Decidir o próximo passo',
    ])
    JORNADA.forEach((passo, i) => expect(passos[i]).toHaveTextContent(passo.titulo))
  })

  it('só Suporte Técnico em TI está disponível; as demais áreas são só texto, sem ação', () => {
    renderHome()
    const secao = screen.getByRole('region', { name: TEXTOS_HOME.areasTitulo })
    const cartoes = within(secao).getAllByRole('listitem')
    expect(cartoes).toHaveLength(AREAS.length)
    expect(AREAS.filter((a) => a.disponivel).map((a) => a.nome)).toEqual(['Suporte Técnico em TI'])
    expect(within(secao).queryAllByRole('button')).toHaveLength(0)
    expect(within(secao).queryAllByRole('link')).toHaveLength(0)
    expect(within(secao).getAllByText('Roteiro futuro')).toHaveLength(AREAS.length - 1)
    expect(within(secao).getByText('Disponível nesta edição')).toBeInTheDocument()
    // As áreas futuras mostram só o nome e o selo, sem rotina, competência ou descrição inventada.
    for (const futura of AREAS.filter((a) => !a.disponivel)) {
      expect(futura.descricao).toBeUndefined()
      expect(futura.nivel).toBeUndefined()
    }
  })

  it('o rótulo diz que as respostas são escritas e que não é chat de IA nem teste vocacional', () => {
    renderHome()
    const guia = screen.getByRole('region', { name: TEXTOS_HOME.guiaTitulo })
    expect(
      within(guia).getByText('Respostas escritas para esta plataforma. Não é um chat de IA nem um teste vocacional.'),
    ).toBeInTheDocument()
    expect(within(guia).queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('tem duas perguntas de múltipla escolha, sem campo livre', () => {
    renderHome()
    const guia = screen.getByRole('region', { name: TEXTOS_HOME.guiaTitulo })
    expect(PERGUNTAS).toHaveLength(2)
    for (const pergunta of PERGUNTAS) {
      const grupo = within(guia).getByRole('group', { name: pergunta.enunciado })
      expect(within(grupo).getAllByRole('radio')).toHaveLength(pergunta.opcoes.length)
    }
  })

  it('responder as duas perguntas mostra o texto escrito e a sugestão, sem chamar nenhuma saída', () => {
    const { props } = renderHome()
    const guia = screen.getByRole('region', { name: TEXTOS_HOME.guiaTitulo })
    expect(within(guia).queryByRole('button')).not.toBeInTheDocument()

    fireEvent.click(within(guia).getByRole('radio', { name: PERGUNTAS[0].opcoes[2].rotulo }))
    expect(within(guia).getByText(RESPOSTAS_FOCO.avaliacao)).toBeInTheDocument()

    fireEvent.click(within(guia).getByRole('radio', { name: PERGUNTAS[1].opcoes[1].rotulo }))
    expect(within(guia).getByText(RESPOSTAS_RITMO.praticar.texto)).toBeInTheDocument()
    expect(within(guia).getByRole('status')).toHaveTextContent(RESPOSTAS_FOCO.avaliacao)
    expect(props.onComecar).not.toHaveBeenCalled()
    expect(props.onIrDireto).not.toHaveBeenCalled()
  })

  it('a sugestão de estudar abre as Missões e a de praticar abre o laboratório', () => {
    const { props } = renderHome()
    const guia = screen.getByRole('region', { name: TEXTOS_HOME.guiaTitulo })

    fireEvent.click(within(guia).getByRole('radio', { name: PERGUNTAS[1].opcoes[0].rotulo }))
    fireEvent.click(within(guia).getByRole('button', { name: RESPOSTAS_RITMO.estudar.botao }))
    expect(props.onComecar).toHaveBeenCalledTimes(1)

    fireEvent.click(within(guia).getByRole('radio', { name: PERGUNTAS[1].opcoes[1].rotulo }))
    fireEvent.click(within(guia).getByRole('button', { name: RESPOSTAS_RITMO.praticar.botao }))
    expect(props.onIrDireto).toHaveBeenCalledTimes(1)
  })

  it('os botões principais chamam cada um a sua saída', () => {
    const { props } = renderHome()
    fireEvent.click(screen.getByRole('button', { name: new RegExp(TEXTOS_HOME.comecar) }))
    expect(props.onComecar).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole('button', { name: TEXTOS_HOME.irDireto }))
    expect(props.onIrDireto).toHaveBeenCalledTimes(1)
  })

  it('bloqueia as saídas enquanto a API responde e mostra o erro de início', () => {
    renderHome({ ocupado: true, erro: 'API indisponível' })
    expect(screen.getByRole('button', { name: new RegExp(TEXTOS_HOME.comecar) })).toBeDisabled()
    expect(screen.getByRole('button', { name: TEXTOS_HOME.irDireto })).toBeDisabled()
    expect(screen.getByRole('alert')).toHaveTextContent('API indisponível')
  })

  it('explica os limites: sem diagnóstico, sem promessa de emprego e sem avaliação própria', () => {
    renderHome()
    const limites = screen.getByRole('region', { name: TEXTOS_HOME.limitesTitulo })
    expect(limites).toHaveTextContent('Não faz diagnóstico psicológico')
    expect(limites).toHaveTextContent('Não promete emprego, salário nem resultado.')
    expect(limites).toHaveTextContent('Não avalia o seu desempenho.')
  })

  it('o texto da página não promete emprego, salário, diagnóstico ou aprovação, e não usa o E comercial', () => {
    const { container } = renderHome()
    const todos = [
      ...Object.values(RESPOSTAS_FOCO),
      ...Object.values(RESPOSTAS_RITMO).map((r) => r.texto),
      ...JORNADA.map((p) => `${p.titulo} ${p.texto}`),
      container.textContent ?? '',
    ].join(' ')
    expect(todos).not.toContain(String.fromCharCode(38))
    expect(todos).not.toMatch(/garant|aprovad[oa]|vaga garantida|você nasceu para|seu perfil é/i)
    expect(todos).not.toMatch(/\p{Extended_Pictographic}/u)
    // O texto cita as palavras só em frases negativas.
    expect(todos).not.toMatch(/(?<!não )(promete|faz) (emprego|diagnóstico)/i)
  })

  it('não tem violações de acessibilidade (axe)', async () => {
    const { container } = renderHome()
    expect((await axe.run(container)).violations).toEqual([])
    const guia = screen.getByRole('region', { name: TEXTOS_HOME.guiaTitulo })
    fireEvent.click(within(guia).getByRole('radio', { name: PERGUNTAS[0].opcoes[0].rotulo }))
    fireEvent.click(within(guia).getByRole('radio', { name: PERGUNTAS[1].opcoes[0].rotulo }))
    expect((await axe.run(container)).violations).toEqual([])
  })
})

describe('App com apresentação', () => {
  it('sem o parâmetro o fluxo antigo continua: abre a Tela Inicial, mas oferece rever a apresentação', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: 'IT Flight Simulator' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 1, name: TEXTOS_HOME.titulo })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Rever a apresentação' })).toBeInTheDocument()
  })

  it('com apresentação mostra a home e não cria sessão nem chama a API antes do clique final', () => {
    const rede = vi.spyOn(globalThis, 'fetch')
    render(<App apresentacao />)
    expect(screen.getByRole('heading', { level: 1, name: TEXTOS_HOME.titulo })).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: /Navegação principal/i })).not.toBeInTheDocument()
    expect(rede).not.toHaveBeenCalled()
    expect(window.localStorage.getItem(CHAVE_SESSOES_SALVAS)).toBeNull()
  })

  it('Começar abre a Tela Inicial, grava a marca e não cria sessão', () => {
    const rede = vi.spyOn(globalThis, 'fetch')
    render(<App apresentacao />)
    fireEvent.click(screen.getByRole('button', { name: new RegExp(TEXTOS_HOME.comecar) }))
    expect(screen.getByRole('heading', { level: 1, name: 'IT Flight Simulator' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: /Navegação principal/i })).toBeInTheDocument()
    expect(window.localStorage.getItem(CHAVE_HOME_VISTA)).toBe('1')
    expect(rede).not.toHaveBeenCalled()
  })

  it('Rever a apresentação volta à home e Começar volta às Missões', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Rever a apresentação' }))
    expect(screen.getByRole('heading', { level: 1, name: TEXTOS_HOME.titulo })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: new RegExp(TEXTOS_HOME.comecar) }))
    expect(screen.getByRole('heading', { level: 1, name: 'IT Flight Simulator' })).toBeInTheDocument()
  })
})
