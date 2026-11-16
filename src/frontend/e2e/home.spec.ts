import { expect, test, type Page } from '@playwright/test'

/**
 * Home vocacional (entrada pública antes da Tela Inicial). Roda no projeto chromium com o backend de teste.
 * Cada teste usa um contexto novo, então o navegador começa sem a marca itfs_home_vista e sem sessão salva.
 * A captura visual e a medição de contraste da home ficam em home.visual.spec.ts.
 */

const TITULO_HOME = 'Descubra uma profissão fazendo o trabalho'

function monitorarCriacaoDeSessao(page: Page) {
  const criacoes: string[] = []
  page.on('request', (req) => {
    if (req.method() === 'POST' && /\/api\/sessoes/.test(req.url())) criacoes.push(req.url())
  })
  return criacoes
}

async function semRolagemHorizontal(page: Page) {
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
}

test.describe('Home vocacional', () => {
  test('visitante novo vê a home, sem sessão criada, e Começar leva às Missões', async ({ page }) => {
    const criacoes = monitorarCriacaoDeSessao(page)
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1, name: TITULO_HOME })).toBeVisible()
    await expect(page.getByRole('navigation', { name: /Navegação principal/i })).toHaveCount(0)
    await semRolagemHorizontal(page)
    expect(criacoes).toEqual([])

    await page.getByRole('button', { name: /Começar a experiência de Suporte Técnico/i }).click()
    await expect(page.getByRole('heading', { level: 1, name: 'IT Flight Simulator' })).toBeVisible()
    await expect(page.getByRole('navigation', { name: /Navegação principal/i })).toBeVisible()
    expect(criacoes).toEqual([])
  })

  test('depois de passar pela home, a próxima visita abre direto a Tela Inicial e dá para rever a apresentação', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /Começar a experiência de Suporte Técnico/i }).click()
    await expect(page.getByRole('heading', { level: 1, name: 'IT Flight Simulator' })).toBeVisible()

    await page.reload()
    await expect(page.getByRole('heading', { level: 1, name: 'IT Flight Simulator' })).toBeVisible()
    await expect(page.getByRole('heading', { level: 1, name: TITULO_HOME })).toHaveCount(0)

    await page.getByRole('button', { name: 'Rever a apresentação' }).click()
    await expect(page.getByRole('heading', { level: 1, name: TITULO_HOME })).toBeVisible()
  })

  test('o guia responde por escrito, com teclado, e a sugestão de praticar abre o laboratório', async ({ page }) => {
    await page.goto('/')
    const guia = page.getByRole('region', { name: 'Guia de orientação' })
    await expect(guia.getByText('Não é um chat de IA nem um teste vocacional.')).toBeVisible()

    await guia.getByRole('radio', { name: /Como é a rotina de quem trabalha com suporte técnico/i }).focus()
    await page.keyboard.press('Space')
    await expect(guia.getByRole('status')).toContainText('Em Suporte Técnico você recebe pedidos de usuários')

    await guia.getByRole('radio', { name: /Indo direto para o chamado/i }).check()
    await expect(guia.getByRole('status')).toContainText('O atalho abre o laboratório com o chamado do nível Estagiário')

    await guia.getByRole('button', { name: /Seguir a sugestão: abrir o laboratório/i }).click()
    await expect(page.getByRole('heading', { name: /CH-0001/i })).toBeVisible()
  })

  test('Ir direto ao laboratório cria uma única sessão e a próxima visita não mostra mais a home', async ({ page }) => {
    const criacoes = monitorarCriacaoDeSessao(page)
    await page.goto('/')
    await page.getByRole('button', { name: 'Ir direto ao laboratório' }).click()
    await expect(page.getByRole('heading', { name: /CH-0001/i })).toBeVisible()
    expect(criacoes).toHaveLength(1)

    await page.reload()
    await expect(page.getByRole('heading', { level: 1, name: 'IT Flight Simulator' })).toBeVisible()
    await expect(page.getByRole('heading', { level: 1, name: TITULO_HOME })).toHaveCount(0)
  })

  test('em 375, 768 e 1280 px a home não tem rolagem horizontal e os controles têm 44 px', async ({ page }) => {
    for (const width of [375, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/')
      await expect(page.getByRole('heading', { level: 1, name: TITULO_HOME })).toBeVisible()
      await semRolagemHorizontal(page)
      const pequenos = await page.evaluate(() => {
        const candidatos = Array.from(
          document.querySelectorAll<HTMLElement>('main button, main input[type="radio"], header button'),
        )
        return candidatos
          .map((el) => ({ rotulo: (el.textContent || el.getAttribute('aria-label') || el.tagName).trim().slice(0, 40), caixa: el.getBoundingClientRect() }))
          .filter(({ caixa }) => caixa.width > 0 && (caixa.height < 43.5 || caixa.width < 43.5))
          .map(({ rotulo, caixa }) => `${rotulo}: ${Math.round(caixa.width)}x${Math.round(caixa.height)}`)
      })
      expect(pequenos, `alvos abaixo de 44 px em ${width} px`).toEqual([])
    }
  })
})
