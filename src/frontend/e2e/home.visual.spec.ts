import { expect, test, type Page, type TestInfo } from '@playwright/test'
import { celulaNaoCalculavel, gravarJson, medirCelula, type ResultadoCelula } from './contraste.helper'

/**
 * Captura e medição da home vocacional nos 4 viewports e nos 2 temas (projetos mobile-375, tablet-768,
 * desktop-1280 e desktop-1440). Grava test-results/visual/<projeto>__<tema>__home*.png e
 * test-results/contraste/<projeto>__<tema>__home.json. A spec não valida aparência: falha só se a home não abrir,
 * se houver rolagem horizontal ou se algum texto computado ficar abaixo de 12 px.
 */

const TEMAS = ['tactical', 'corporate'] as const
type Tema = (typeof TEMAS)[number]

async function abrirHome(page: Page, tema: Tema) {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.addInitScript((valor) => window.localStorage.setItem('itfs_theme', valor), tema)
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1, name: 'Descubra uma profissão fazendo o trabalho' })).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('data-theme', tema)
}

async function capturar(page: Page, testInfo: TestInfo, tema: Tema, nome: string) {
  await page.evaluate(() => document.fonts.ready)
  await page.mouse.move(-10, -10)
  await page.evaluate(() => {
    const ativo = document.activeElement
    if (ativo instanceof HTMLElement) ativo.blur()
    window.scrollTo(0, 0)
  })
  await page.screenshot({
    path: `test-results/visual/${testInfo.project.name}__${tema}__${nome}.png`,
    fullPage: true,
    animations: 'disabled',
  })
  const semRolagem = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
  expect.soft(semRolagem, `rolagem horizontal em ${nome} (${testInfo.project.name}, ${tema})`).toBe(true)
  const pequenos = await page.evaluate(() => {
    const achados: string[] = []
    for (const el of Array.from(document.querySelectorAll<HTMLElement>('body *'))) {
      const temTexto = Array.from(el.childNodes).some((n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? '').trim())
      if (!temTexto) continue
      const caixa = el.getBoundingClientRect()
      if (caixa.width === 0 || caixa.height === 0) continue
      const tamanho = parseFloat(getComputedStyle(el).fontSize)
      if (tamanho < 12) achados.push(`${el.tagName.toLowerCase()}.${el.className}: ${tamanho}px`)
    }
    return achados
  })
  expect.soft(pequenos, `texto abaixo de 12 px em ${nome} (${testInfo.project.name}, ${tema})`).toEqual([])
  // Nada pode vazar para fora do cartão que o contém (por exemplo, selo com white-space: nowrap em coluna estreita).
  const vazando = await page.evaluate(() => {
    const achados: string[] = []
    for (const cartao of Array.from(document.querySelectorAll<HTMLElement>('.home-voc-cartao, .home-voc-guia, .home-voc-resposta'))) {
      const c = cartao.getBoundingClientRect()
      for (const el of Array.from(cartao.querySelectorAll<HTMLElement>('*'))) {
        const r = el.getBoundingClientRect()
        if (r.width > 0 && (r.right > c.right + 0.5 || r.left < c.left - 0.5)) {
          achados.push(`${el.tagName.toLowerCase()}.${el.className} em ${cartao.className.split(' ').slice(-1)[0]}: ${Math.round(r.right - c.right)}px`)
        }
      }
    }
    return achados
  })
  expect.soft(vazando, `conteúdo fora do cartão em ${nome} (${testInfo.project.name}, ${tema})`).toEqual([])
}

for (const tema of TEMAS) {
  test.describe(`Home vocacional, tema ${tema}`, () => {
    test.setTimeout(180_000)

    test('captura e medição: estado inicial e guia respondido', async ({ page }, testInfo) => {
      const viewport = page.viewportSize() ?? { width: 0, height: 0 }
      const celulas: ResultadoCelula[] = []
      const meta = (tela: string) => ({
        projeto: testInfo.project.name,
        tema,
        viewport: { largura: viewport.width, altura: viewport.height },
        tela,
        estado: 'limpo' as const,
      })

      try {
        await abrirHome(page, tema)
        await capturar(page, testInfo, tema, 'home')
        celulas.push(await medirCelula(page, meta('Home vocacional')))

        const guia = page.getByRole('region', { name: 'Guia de orientação' })
        await guia.getByRole('radio', { name: /Quais competências a experiência exercita/i }).check()
        await guia.getByRole('radio', { name: /Estudando um pouco antes/i }).check()
        await expect(guia.getByRole('status')).toContainText('Na tela de Missões')
        await capturar(page, testInfo, tema, 'home-guia-respondido')
        celulas.push(await medirCelula(page, meta('Home vocacional: guia respondido')))
      } catch (erro) {
        celulas.push(celulaNaoCalculavel(meta('Home vocacional'), `a home não abriu ou a medição falhou: ${String((erro as Error).message).split('\n')[0]}`))
        throw erro
      } finally {
        const navegador = page.context().browser()
        gravarJson(`test-results/contraste/${testInfo.project.name}__${tema}__home.json`, {
          projeto: testInfo.project.name,
          tema,
          grupo: 'home',
          chromium: navegador?.version() ?? null,
          node: process.version,
          celulas,
        })
      }
    })
  })
}
