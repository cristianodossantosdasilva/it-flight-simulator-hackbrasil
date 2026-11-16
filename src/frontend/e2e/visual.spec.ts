import { expect, test, type Page, type TestInfo } from '@playwright/test'
import { TEXTOS_WORKSTATION as T } from '../src/textos/workstation'

/**
 * Captura uma imagem por visão e por largura em test-results/visual/.
 * Cada projeto (mobile-375, tablet-768, desktop-1280, desktop-1440) executa esta spec com o
 * próprio viewport. Nome do arquivo: <projeto>__<tema>__<visão>.png.
 * A spec não valida aparência. Ela só falha se a visão não abrir ou se houver rolagem horizontal.
 */

const PASTA = 'test-results/visual'
const TEMAS = ['tactical', 'corporate'] as const
type Tema = (typeof TEMAS)[number]

const LARGURA_MINIMA_DESKTOP = 768

async function preparar(page: Page, tema: Tema) {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.addInitScript((valor) => window.localStorage.setItem('itfs_theme', valor), tema)
  // As capturas de estudo e laboratório partem da Tela Inicial. A home vocacional é capturada em home.visual.spec.ts.
  await page.addInitScript(() => window.localStorage.setItem('itfs_home_vista', '1'))
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'IT Flight Simulator', level: 1 })).toBeVisible()
}

/**
 * Higiene de captura (ciclo 2, E1): evita artefatos que não pertencem ao produto.
 * - mouse fora da janela e foco removido, para não deixar hover, tooltip ou anel de foco na imagem;
 * - reducedMotion já é aplicado em preparar();
 * - na página longa, elementos fixos viram absolutos (sem repetição no meio da imagem), os sticky
 *   voltam ao fluxo e os tooltips ficam ocultos. A folha de estilo existe só durante a captura.
 */
const CSS_CAPTURA = `
  [data-captura-fixo] { position: absolute !important; }
  [data-captura-sticky] { position: static !important; }
  .nav-item-rotulo, .dica, [role="tooltip"] { display: none !important; }
`

async function higienizarEntrada(page: Page) {
  await page.mouse.move(-10, -10)
  await page.evaluate(() => {
    const ativo = document.activeElement
    if (ativo instanceof HTMLElement) ativo.blur()
    window.scrollTo(0, 0)
  })
}

async function neutralizarFixos(page: Page) {
  await page.evaluate(() => {
    for (const el of Array.from(document.querySelectorAll('body *'))) {
      const posicao = getComputedStyle(el).position
      if (posicao === 'fixed') el.setAttribute('data-captura-fixo', '')
      else if (posicao === 'sticky') el.setAttribute('data-captura-sticky', '')
    }
  })
  return page.addStyleTag({ content: CSS_CAPTURA })
}

async function restaurarFixos(page: Page, estilo: Awaited<ReturnType<typeof neutralizarFixos>>) {
  await estilo.evaluate((no) => no.remove())
  await page.evaluate(() => {
    for (const el of Array.from(document.querySelectorAll('[data-captura-fixo], [data-captura-sticky]'))) {
      el.removeAttribute('data-captura-fixo')
      el.removeAttribute('data-captura-sticky')
    }
  })
}

async function capturar(page: Page, testInfo: TestInfo, tema: Tema, visao: string) {
  await page.evaluate(() => document.fonts.ready)
  await expect(page.locator('html')).toHaveAttribute('data-theme', tema)
  await higienizarEntrada(page)
  const estilo = await neutralizarFixos(page)
  await page.screenshot({
    path: `${PASTA}/${testInfo.project.name}__${tema}__${visao}.png`,
    fullPage: true,
    animations: 'disabled',
  })
  await restaurarFixos(page, estilo)
  const semRolagemHorizontal = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
  expect.soft(semRolagemHorizontal, `rolagem horizontal em ${visao} (${testInfo.project.name}, ${tema})`).toBe(true)
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

for (const tema of TEMAS) {
  test.describe(`Capturas visuais, tema ${tema}`, () => {
    test.setTimeout(120_000)

    test('estudo: missões, aulas, caderno e mentor', async ({ page }, testInfo) => {
      await preparar(page, tema)
      await capturar(page, testInfo, tema, 'missoes')

      await irPara(page, 'Aulas')
      await expect(page.locator('h1').first()).toBeVisible()
      await capturar(page, testInfo, tema, 'aulas')

      await irPara(page, 'Caderno')
      await expect(page.getByRole('heading', { name: 'Caderno de estudos', level: 1 })).toBeVisible()
      await capturar(page, testInfo, tema, 'caderno')

      await irPara(page, 'Mentor')
      await expect(page.getByRole('heading', { name: 'Mentor', level: 1 })).toBeVisible()
      await capturar(page, testInfo, tema, 'mentor')
    })

    test('laboratório: ITSM, comunicador, SimuDesk, base de conhecimento, replay e credencial', async ({ page }, testInfo) => {
      await preparar(page, tema)
      await page.getByRole('radio', { name: /N[ií]vel 1: Estagi[aá]rio/i }).click()
      await page.getByRole('button', { name: /Decolar no Simulador/i }).click()
      await expect(page.getByRole('heading', { name: /CH-0001/i })).toBeVisible()
      await capturar(page, testInfo, tema, 'laboratorio-itsm')

      await page.getByRole('button', { name: /Comunicador IA/i }).click()
      await expect(page.getByRole('region', { name: 'Comunicador Corporativo' })).toBeVisible()
      await capturar(page, testInfo, tema, 'laboratorio-chat')

      await page.getByRole('button', { name: /SimuDesk Remoto/i }).click()
      await expect(page.getByPlaceholder(T.simudesk.placeholderId)).toBeVisible()
      await capturar(page, testInfo, tema, 'laboratorio-simudesk')

      await page.getByRole('button', { name: /Intranet \/ KB/i }).click()
      await expect(page.getByRole('region', { name: 'Intranet e Base de Conhecimento' })).toBeVisible()
      await capturar(page, testInfo, tema, 'laboratorio-kb')

      // Conclui o turno do Nível 1 para que o replay traga critérios atendidos e o selo do Currículo Vivo.
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

      await page.getByRole('button', { name: /Juiz 360º e Replay/i }).click()
      await expect(page.getByText(T.replay.concluida, { exact: true })).toBeVisible()
      await capturar(page, testInfo, tema, 'replay')

      await page.getByRole('button', { name: /Tela Inicial/i }).click()
      await abrirCredencial(page)
      await capturar(page, testInfo, tema, 'credencial')
    })
  })
}
