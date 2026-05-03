/**
 * Browser Tool — Full Stealth Handler with Extended Controls
 *
 * 20+ actions for precise web control:
 * - Smart targeting: getByRole, getByLabel, getByText
 * - Form: fill, select dropdown, check/uncheck, file upload
 * - Navigation: back, forward, reload
 * - iFrame support, dialog handling
 * - Content extraction: getText, getAttribute, getLinks, evaluate JS
 */

import { logForDebugging } from '../../utils/debug.js'
import type { BrowserActionInput, BrowserResult } from './types.js'
import { join } from 'path'
import { homedir } from 'os'
import { mkdirSync } from 'fs'
import type { BrowserContext, Page } from 'playwright'

let browserContext: BrowserContext | null = null
let pageInstance: Page | null = null

const SESSION_DIR = join(homedir(), '.claude-code', 'browser_session')

const BLOCKED_DOMAINS = [
  'datadome.co', 'fingerprint.com', 'fingerprintjs.com',
  'perimeterx.net', 'px-cdn.net', 'kasada.io',
]

function humanDelay(min = 100, max = 300) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

async function getBrowser(input?: BrowserActionInput) {
  if (!browserContext) {
    try { mkdirSync(SESSION_DIR, { recursive: true }) } catch {}
    const { chromium } = await import('playwright')
    logForDebugging('BrowserTool: Launching persistent context at ' + SESSION_DIR)
    try {
      browserContext = await chromium.launchPersistentContext(SESSION_DIR, {
        headless: shouldRunHeadless(input),
        viewport: { width: 1280, height: 800 },
        timezoneId: 'Asia/Bangkok',
        locale: 'th-TH',
        args: [
          '--disable-blink-features=AutomationControlled',
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu', // Often helps on Windows
        ],
      })
      logForDebugging('BrowserTool: Context launched successfully')
    } catch (error: any) {
      logForDebugging('BrowserTool: Failed to launch context: ' + error.message)
      throw error
    }
  }

  if (!pageInstance) {
    logForDebugging('BrowserTool: Getting first page')
    const pages = browserContext.pages()
    pageInstance = pages.length > 0 ? pages[0] : await browserContext.newPage()

    logForDebugging('BrowserTool: Page acquired, adding init scripts')
    await pageInstance.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined })
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] })
      Object.defineProperty(navigator, 'languages', { get: () => ['th-TH', 'th', 'en-US', 'en'] })
      const g = globalThis as any
      delete g.cdc_adoQpoasnfa76pfcZLmcfl_
      if (!g.chrome) g.chrome = {}
      g.chrome.runtime = {}
    })

    await pageInstance.route('**/*', (route: any) => {
      const url = route.request().url()
      if (BLOCKED_DOMAINS.some(d => url.includes(d))) return route.abort()
      return route.continue()
    })
  }

  return { context: browserContext, page: pageInstance }
}

// ── Helper: take screenshot and return result ───────────────────
async function successResult(page: Page, extra?: Partial<BrowserResult>): Promise<BrowserResult> {
  const screenshot = await page.screenshot({ type: 'jpeg', quality: 70 })
  return {
    url: page.url(),
    title: await page.title(),
    screenshot: screenshot.toString('base64'),
    ...extra,
  }
}

// ── Main Handler ────────────────────────────────────────────────
export async function handleBrowserAction(input: BrowserActionInput): Promise<BrowserResult> {
  let page: Page | undefined
  let context: BrowserContext | undefined
  const timeout = input.timeout || 8000

  try {
    logForDebugging(`BrowserTool: Handling action "${input.action}"`)
    ;({ page, context } = await getBrowser(input))

    if (!page) {
      logForDebugging('BrowserTool: No page available!')
      throw new Error('Browser page could not be initialized')
    }

    // Check if the page is closed/crashed
    if (page.isClosed()) {
      logForDebugging('BrowserTool: Page is closed, creating new one')
      page = await context.newPage()
      pageInstance = page
    }
    switch (input.action) {

      // ═══════════════════════════════════════════════════════════
      // NAVIGATION
      // ═══════════════════════════════════════════════════════════
      case 'navigate': {
        if (!input.url) throw new Error('URL required')
        logForDebugging(`BrowserTool: Navigating to ${input.url}`)
        await page.waitForTimeout(humanDelay(200, 500))
        await page.goto(input.url, { waitUntil: 'domcontentloaded', timeout: 30000 })
        await page.waitForTimeout(humanDelay(500, 1500))
        return successResult(page)
      }

      case 'go_back': {
        await page.goBack({ waitUntil: 'domcontentloaded' })
        return successResult(page)
      }

      case 'go_forward': {
        await page.goForward({ waitUntil: 'domcontentloaded' })
        return successResult(page)
      }

      case 'reload': {
        await page.reload({ waitUntil: 'domcontentloaded' })
        return successResult(page)
      }

      // ═══════════════════════════════════════════════════════════
      // CLICKING — 3 strategies
      // ═══════════════════════════════════════════════════════════
      case 'click': {
        if (!input.selector) throw new Error('Selector required')
        await page.waitForSelector(input.selector, { state: 'visible', timeout })
        await page.hover(input.selector)
        await page.waitForTimeout(humanDelay(80, 250))
        await page.click(input.selector, { delay: humanDelay(40, 120) })
        await page.waitForTimeout(humanDelay(200, 500))
        return successResult(page)
      }

      case 'click_text': {
        // Click by visible text content — most human-like
        if (!input.text) throw new Error('text required for click_text')
        const loc = page.getByText(input.text, { exact: false })
        await loc.hover()
        await page.waitForTimeout(humanDelay(80, 250))
        await loc.click({ delay: humanDelay(40, 120) })
        return successResult(page)
      }

      case 'click_role': {
        // Click by ARIA role — most reliable for buttons/links
        if (!input.role) throw new Error('role required for click_role')
        const opts: any = {}
        if (input.name) opts.name = input.name
        const loc2 = page.getByRole(input.role as any, opts)
        await loc2.hover()
        await page.waitForTimeout(humanDelay(80, 250))
        await loc2.click({ delay: humanDelay(40, 120) })
        return successResult(page)
      }

      // ═══════════════════════════════════════════════════════════
      // TYPING & FORM FILLING
      // ═══════════════════════════════════════════════════════════
      case 'type': {
        // Type character-by-character with jitter (human-like)
        if (!input.selector || !input.text) throw new Error('selector + text required')
        await page.waitForSelector(input.selector, { state: 'visible', timeout })
        await page.click(input.selector)
        await page.waitForTimeout(humanDelay(100, 300))
        await page.locator(input.selector).pressSequentially(input.text, { delay: humanDelay(40, 120) })
        return successResult(page)
      }

      case 'fill': {
        // Instant fill — faster, for non-protected forms
        if (!input.selector || !input.text) throw new Error('selector + text required')
        await page.waitForSelector(input.selector, { state: 'visible', timeout })
        await page.fill(input.selector, input.text)
        return successResult(page)
      }

      case 'fill_label': {
        // Fill by form label — no CSS needed!
        if (!input.label || !input.text) throw new Error('label + text required')
        await page.getByLabel(input.label).fill(input.text)
        return successResult(page)
      }

      case 'clear': {
        if (!input.selector) throw new Error('selector required')
        await page.fill(input.selector, '')
        return successResult(page)
      }

      case 'press': {
        if (!input.key) throw new Error('key required')
        if (input.selector) {
          await page.waitForSelector(input.selector, { state: 'visible', timeout })
          await page.focus(input.selector)
        }
        await page.keyboard.press(input.key, { delay: humanDelay(50, 150) })
        return successResult(page)
      }

      // ═══════════════════════════════════════════════════════════
      // FORM CONTROLS
      // ═══════════════════════════════════════════════════════════
      case 'select': {
        if (!input.selector || !input.value) throw new Error('selector + value required')
        await page.selectOption(input.selector, input.value)
        return successResult(page)
      }

      case 'check': {
        if (!input.selector) throw new Error('selector required')
        await page.check(input.selector)
        return successResult(page)
      }

      case 'uncheck': {
        if (!input.selector) throw new Error('selector required')
        await page.uncheck(input.selector)
        return successResult(page)
      }

      case 'upload': {
        if (!input.selector || !input.filePath) throw new Error('selector + filePath required')
        await page.setInputFiles(input.selector, input.filePath)
        return successResult(page)
      }

      // ═══════════════════════════════════════════════════════════
      // SCROLL, HOVER, FOCUS
      // ═══════════════════════════════════════════════════════════
      case 'scroll': {
        const amount = input.amount || 500
        const delta = input.direction === 'up' ? -amount : amount
        const steps = 3 + Math.floor(Math.random() * 3)
        for (let i = 0; i < steps; i++) {
          await page.mouse.wheel(0, delta / steps)
          await page.waitForTimeout(humanDelay(60, 150))
        }
        return successResult(page)
      }

      case 'hover': {
        if (!input.selector) throw new Error('selector required')
        await page.hover(input.selector)
        return successResult(page)
      }

      case 'focus': {
        if (!input.selector) throw new Error('selector required')
        await page.focus(input.selector)
        return successResult(page)
      }

      // ═══════════════════════════════════════════════════════════
      // WAITING
      // ═══════════════════════════════════════════════════════════
      case 'wait_for': {
        if (!input.selector) throw new Error('selector required')
        await page.waitForSelector(input.selector, { state: 'visible', timeout })
        return successResult(page)
      }

      case 'wait_for_url': {
        if (!input.url) throw new Error('url pattern required')
        await page.waitForURL(input.url, { timeout })
        return successResult(page)
      }

      // ═══════════════════════════════════════════════════════════
      // IFRAME & DIALOG
      // ═══════════════════════════════════════════════════════════
      case 'frame_click': {
        if (!input.frameSelector || !input.selector) throw new Error('frameSelector + selector required')
        const frame = page.frameLocator(input.frameSelector)
        await frame.locator(input.selector).click()
        return successResult(page)
      }

      case 'frame_fill': {
        if (!input.frameSelector || !input.selector || !input.text) throw new Error('frameSelector + selector + text required')
        const frame2 = page.frameLocator(input.frameSelector)
        await frame2.locator(input.selector).fill(input.text)
        return successResult(page)
      }

      case 'handle_dialog': {
        const action = input.dialogAction || 'accept'
        page.once('dialog', async (dialog) => {
          if (action === 'accept') {
            await dialog.accept(input.dialogText || '')
          } else {
            await dialog.dismiss()
          }
        })
        return { url: page.url(), title: await page.title(), content: `Dialog handler set: ${action}` }
      }

      // ═══════════════════════════════════════════════════════════
      // CONTENT EXTRACTION
      // ═══════════════════════════════════════════════════════════
      case 'screenshot':
        return successResult(page)

      case 'extract':
        return { url: page.url(), title: await page.title(), content: await page.content() }

      case 'status':
        return { url: page.url(), title: await page.title() }

      case 'get_text': {
        if (!input.selector) throw new Error('selector required')
        const text = await page.locator(input.selector).innerText()
        return { url: page.url(), title: await page.title(), content: text }
      }

      case 'get_attribute': {
        if (!input.selector || !input.attribute) throw new Error('selector + attribute required')
        const val = await page.getAttribute(input.selector, input.attribute)
        return { url: page.url(), title: await page.title(), content: val || '' }
      }

      case 'get_value': {
        if (!input.selector) throw new Error('selector required')
        const v = await page.inputValue(input.selector)
        return { url: page.url(), title: await page.title(), content: v }
      }

      case 'get_links': {
        const links = await page.$$eval('a[href]', (anchors: any[]) =>
          anchors.slice(0, 50).map(a => ({ text: a.innerText.trim().slice(0, 80), href: a.href }))
        )
        return { url: page.url(), title: await page.title(), content: JSON.stringify(links, null, 2) }
      }

      case 'get_inputs': {
        const inputs = await page.$$eval('input, textarea, select, button', (els: any[]) =>
          els.slice(0, 30).map(el => ({
            tag: el.tagName.toLowerCase(),
            type: el.type || '',
            name: el.name || '',
            id: el.id || '',
            value: el.value || '',
            placeholder: el.placeholder || '',
            label: el.labels?.[0]?.innerText?.trim() || '',
          }))
        )
        return { url: page.url(), title: await page.title(), content: JSON.stringify(inputs, null, 2) }
      }

      case 'evaluate': {
        if (!input.expression) throw new Error('expression required')
        const result = await page.evaluate(input.expression)
        return { url: page.url(), title: await page.title(), content: JSON.stringify(result) }
      }

      case 'close': {
        try { await context.storageState({ path: join(SESSION_DIR, 'state.json') }) } catch {}
        await browserContext?.close()
        browserContext = null; pageInstance = null
        return { url: '', title: 'Closed (session saved)' }
      }

      case 'search': {
        if (!input.query) throw new Error('query required for search')
        const engine = input.engine || 'google'
        const query = input.query

        const searchEngines: Record<string, { url: string; selector: string; extract: (el: any) => any }> = {
          google: {
            url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
            selector: 'div.g',
            extract: (el: any) => ({
              title: el.querySelector('h3')?.innerText,
              link: el.querySelector('a')?.href,
              snippet: el.querySelector('div[style*="-webkit-line-clamp"]')?.innerText || el.querySelector('.VwiC3b')?.innerText
            })
          },
          bing: {
            url: `https://www.bing.com/search?q=${encodeURIComponent(query)}`,
            selector: 'li.b_algo',
            extract: (el: any) => ({
              title: el.querySelector('h2')?.innerText,
              link: el.querySelector('a')?.href,
              snippet: el.querySelector('.b_caption p')?.innerText
            })
          },
          duckduckgo: {
            url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
            selector: 'article',
            extract: (el: any) => ({
              title: el.querySelector('h2')?.innerText,
              link: el.querySelector('a[data-testid="result-title-a"]')?.href,
              snippet: el.querySelector('div[data-testid="result-snippet"]')?.innerText
            })
          },
          twitter: {
            url: `https://x.com/search?q=${encodeURIComponent(query)}&src=typed_query`,
            selector: 'article[data-testid="tweet"]',
            extract: (el: any) => ({
              title: el.querySelector('div[data-testid="User-Names"]')?.innerText?.replace(/\n/g, ' '),
              link: el.querySelector('a[href*="/status/"]')?.href,
              snippet: el.querySelector('div[data-testid="tweetText"]')?.innerText
            })
          },
          reddit: {
            url: `https://www.reddit.com/search/?q=${encodeURIComponent(query)}`,
            selector: 'faceplate-tracker[source="search_results"]',
            extract: (el: any) => ({
              title: el.querySelector('a[slot="title"]')?.innerText || el.querySelector('h3')?.innerText,
              link: el.querySelector('a[slot="full-post-link"]')?.href || el.querySelector('a')?.href,
              snippet: el.querySelector('div[slot="text-body"]')?.innerText
            })
          },
          github: {
            url: `https://github.com/search?q=${encodeURIComponent(query)}&type=repositories`,
            selector: 'div.search-title',
            extract: (el: any) => ({
              title: el.innerText.trim(),
              link: el.querySelector('a')?.href,
              snippet: el.closest('div.Box-sc-1z9be74-0')?.querySelector('p.Box-sc-1z9be74-0')?.innerText
            })
          }
        }

        logForDebugging(`BrowserTool: Searching ${engine} for "${query}"`)
        const selected = searchEngines[engine] || searchEngines.google
        
        logForDebugging(`BrowserTool: Navigating to ${selected.url}`)
        await page.goto(selected.url, { waitUntil: 'domcontentloaded', timeout: 60000 })
        logForDebugging('BrowserTool: Navigation complete, waiting for delay')
        
        await page.waitForTimeout(humanDelay(1500, 3000))
        logForDebugging('BrowserTool: Extracting results')

        // Extract results using evaluate
        const results = await page.$$eval(selected.selector, (elements: any[], engineKey: string) => {
          // Re-define extractors inside evaluate context
          const extractors: Record<string, (el: any) => any> = {
            google: (el: any) => ({
              title: el.querySelector('h3')?.innerText,
              link: el.querySelector('a')?.href,
              snippet: el.querySelector('.VwiC3b')?.innerText
            }),
            bing: (el: any) => ({
              title: el.querySelector('h2')?.innerText,
              link: el.querySelector('a')?.href,
              snippet: el.querySelector('.b_caption p')?.innerText || el.querySelector('.b_algo p')?.innerText
            }),
            duckduckgo: (el: any) => ({
              title: el.querySelector('h2')?.innerText,
              link: el.querySelector('a[data-testid="result-title-a"]')?.href || el.querySelector('a')?.href,
              snippet: el.querySelector('div[data-testid="result-snippet"]')?.innerText
            }),
            twitter: (el: any) => ({
              title: el.querySelector('div[data-testid="User-Names"]')?.innerText?.replace(/\n/g, ' '),
              link: el.querySelector('a[href*="/status/"]')?.href,
              snippet: el.querySelector('div[data-testid="tweetText"]')?.innerText
            }),
            reddit: (el: any) => ({
              title: el.querySelector('a[slot="title"]')?.innerText || el.querySelector('h3')?.innerText,
              link: el.querySelector('a[slot="full-post-link"]')?.href || el.querySelector('a')?.href,
              snippet: el.querySelector('div[slot="text-body"]')?.innerText
            }),
            github: (el: any) => ({
              title: el.innerText.trim(),
              link: el.querySelector('a')?.href,
              snippet: el.closest('div.Box-sc-1z9be74-0')?.querySelector('p.Box-sc-1z9be74-0')?.innerText
            })
          }
          const extractor = extractors[engineKey] || extractors.google
          return elements.slice(0, 10).map(extractor).filter(r => r.title && r.link)
        }, engine)

        return successResult(page, { content: JSON.stringify(results, null, 2) })
      }

      default:
        throw new Error(`Unknown action: ${input.action}`)
    }
  } catch (error: any) {
    return { url: page?.url?.() || '', title: '', error: error.message }
  }
}

function shouldRunHeadless(input?: BrowserActionInput): boolean {
  if (input?.headless !== undefined) return input.headless
  const value = process.env.BROWSER_TOOL_HEADLESS ?? process.env.PLAYWRIGHT_HEADLESS
  if (value === undefined) return false
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase())
}
