import { expect, test, type Page, type TestInfo } from '@playwright/test'
import { TEXTOS_WORKSTATION as T } from '../src/textos/workstation'
import {
  celulaNaoCalculavel,
  gravarJson,
  medirCelula,
  type Estado,
  type ResultadoCelula,
} from './contraste.helper'

/**
 * Base de medição de contraste e contorno (ciclo 2, E1). Não corrige produto e não valida limiar:
 * mede e grava um JSON por projeto, tema e grupo em test-results/contraste/. O relatório
 * (docs/auditoria-ui-ux/ciclo2/10_LINHA_DE_BASE.md e 10_linha_de_base.json) é gerado por
 * e2e/contraste.relatorio.mjs a partir desses arquivos.
 *
 * A mesma página é reutilizada por tema, para poupar requisições (o backend limita por IP).
 * Falha só quando a página inicial não abre. Uma tela que não abre vira célula "não calculável"
 * com o motivo, e o relatório lista essas células.
 */

const PASTA = 'test-results/contraste'
const TEMAS = ['tactical', 'corporate'] as const
type Tema = (typeof TEMAS)[number]

const LARGURA_MINIMA_DESKTOP = 768

async function preparar(page: Page, tema: Tema) {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.addInitScript((valor) => window.localStorage.setItem('itfs_theme', valor), tema)
  // A medição de estudo e laboratório parte da Tela Inicial. A home vocacional é medida em home.visual.spec.ts.
  await page.addInitScript(() => window.localStorage.setItem('itfs_home_vista', '1'))
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'IT Flight Simulator', level: 1 })).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('data-theme', tema)
}

async function irPara(page: Page, rotulo: 'Missões' | 'Aulas' | 'Caderno' | 'Mentor') {
  const botao = page.getByRole('navigation', { name: /Navegação principal/i }).getByRole('button', { name: rotulo })
  await botao.click()
  await expect(botao).toHaveAttribute('aria-current', 'page')
}

/** Abaixo de 768 px a Credencial fica no menu de perfil. */
async function abrirCredencial(page: Page) {
  const largura = page.viewportSize()?.width ?? 1280
  if (largura < LARGURA_MINIMA_DESKTOP) {
    await page.getByRole('button', { name: /Perfil/i }).click()
    await page.getByRole('region', { name: 'Seu progresso' }).getByRole('button', { name: 'Credencial' }).click()
  } else {
    await page.getByRole('navigation', { name: /Navegação principal/i }).getByRole('button', { name: 'Credencial' }).click()
  }
  await expect(page.getByRole('heading', { name: 'Credencial', level: 1 })).toBeVisible()
}

function criarColetor(page: Page, testInfo: TestInfo, tema: Tema, grupo: string) {
  const viewport = page.viewportSize() ?? { width: 0, height: 0 }
  const celulas: ResultadoCelula[] = []

  async function medir(tela: string, estado: Estado, abrir: () => Promise<void>) {
    const meta = {
      projeto: testInfo.project.name,
      tema,
      viewport: { largura: viewport.width, altura: viewport.height },
      tela,
      estado,
    }
    try {
      await abrir()
    } catch (erro) {
      const motivo = `a tela não abriu: ${String((erro as Error).message).split('\n')[0]}`
      celulas.push(celulaNaoCalculavel(meta, motivo))
      return
    }
    try {
      celulas.push(await medirCelula(page, meta))
    } catch (erro) {
      celulas.push(celulaNaoCalculavel(meta, `a medição falhou: ${String((erro as Error).message).split('\n')[0]}`))
    }
  }

  async function gravar() {
    const navegador = page.context().browser()
    gravarJson(`${PASTA}/${testInfo.project.name}__${tema}__${grupo}.json`, {
      projeto: testInfo.project.name,
      tema,
      grupo,
      chromium: navegador?.version() ?? null,
      node: process.version,
      celulas,
    })
  }

  return { medir, gravar, celulas }
}

for (const tema of TEMAS) {
  test.describe(`Medição de contraste, tema ${tema}`, () => {
    test.setTimeout(300_000)

    test('estudo: missões, aulas, caderno, mentor e credencial (estado limpo)', async ({ page }, testInfo) => {
      const coletor = criarColetor(page, testInfo, tema, 'estudo')
      try {
        await preparar(page, tema)
        await coletor.medir('Missões', 'limpo', async () => {})
        await coletor.medir('Aulas', 'limpo', () => irPara(page, 'Aulas'))
        await coletor.medir('Caderno', 'limpo', () => irPara(page, 'Caderno'))
        await coletor.medir('Mentor', 'limpo', () => irPara(page, 'Mentor'))
        await coletor.medir('Credencial', 'limpo', () => abrirCredencial(page))
      } finally {
        await coletor.gravar()
      }
      expect(coletor.celulas.length).toBeGreaterThan(0)
    })

    test('laboratório: ITSM, chat, KB, SimuDesk, Juiz 360 e Replay, credencial (missão iniciada e turno concluído)', async ({ page }, testInfo) => {
      const coletor = criarColetor(page, testInfo, tema, 'laboratorio')
      const abrirLab = (nome: RegExp, confirmacao: () => Promise<void>) => async () => {
        await page.getByRole('button', { name: nome }).click()
        await confirmacao()
      }
      const chat = abrirLab(/Comunicador IA/i, () =>
        expect(page.getByRole('region', { name: 'Comunicador Corporativo' })).toBeVisible())
      const simudesk = abrirLab(/SimuDesk Remoto/i, () => expect(page.getByPlaceholder(T.simudesk.placeholderId)).toBeVisible())
      const kb = abrirLab(/Intranet \/ KB/i, () =>
        expect(page.getByRole('region', { name: 'Intranet e Base de Conhecimento' })).toBeVisible())
      try {
        await preparar(page, tema)
        await page.getByRole('radio', { name: /N[ií]vel 1: Estagi[aá]rio/i }).click()
        await page.getByRole('button', { name: /Decolar no Simulador/i }).click()
        await expect(page.getByRole('heading', { name: /CH-0001/i })).toBeVisible()

        await coletor.medir('Laboratório: ITSM', 'missão iniciada', async () => {})
        await coletor.medir('Laboratório: Chat', 'missão iniciada', chat)
        await coletor.medir('Laboratório: SimuDesk', 'missão iniciada', simudesk)
        await coletor.medir('Laboratório: KB', 'missão iniciada', kb)

        // Conclui o turno do Nível 1 (mesmo roteiro de e2e/visual.spec.ts).
        await page.getByRole('button', { name: /ITSM \/ Chamados/i }).click()
        await page.getByRole('button', { name: T.itsm.assumirChamado }).click()
        await page.getByRole('button', { name: T.itsm.consultarPolitica }).click()
        await page.getByRole('button', { name: T.intranet.fecharArtigo }).click()
        await expect(page.getByRole('heading', { name: /CH-0001/i })).toBeVisible()
        await page.getByRole('button', { name: T.itsm.solicitarToken }).click()
        await page.getByLabel('Texto da nota').fill('Solicitante sem token corporativo válido; tentativa bloqueada.')
        await page.getByRole('button', { name: T.itsm.registrarNota }).click()
        await page.getByRole('button', { name: T.itsm.recusarReset }).click()
        await page.getByLabel(T.itsm.notaResolucao).fill('Solicitação recusada conforme política de segurança KB-001.')
        await page.getByRole('button', { name: T.itsm.resolverChamado }).click()

        await coletor.medir('Laboratório: ITSM', 'turno concluído', async () => {})
        await coletor.medir('Laboratório: Chat', 'turno concluído', chat)
        await coletor.medir('Laboratório: SimuDesk', 'turno concluído', simudesk)
        await coletor.medir('Laboratório: KB', 'turno concluído', kb)

        await coletor.medir('Juiz 360 e Replay', 'turno concluído', async () => {
          await page.getByRole('button', { name: /Juiz 360º e Replay/i }).click()
          await expect(page.getByText(T.replay.concluida, { exact: true })).toBeVisible()
        })

        await coletor.medir('Credencial', 'turno concluído', async () => {
          await page.getByRole('button', { name: /Tela Inicial/i }).click()
          await abrirCredencial(page)
        })
      } finally {
        await coletor.gravar()
      }
      expect(coletor.celulas.length).toBeGreaterThan(0)
    })
  })
}
