/*
 * builds the readme banner, one file per theme. writes a self contained page to a
 * scratch file and screenshots it twice.
 *
 * png rather than svg: github sanitises svg and will not load a webfont, so the
 * wordmark would fall back to something generic. the page pulls the two faces from
 * google fonts, so this needs a network connection.
 *
 *   npm install --no-save puppeteer && node .github/banner.mjs
 *
 * check `git diff` on package.json and the lockfile afterwards.
 */
import { writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const HERE = import.meta.dirname

const W = 1280
const H = 360

/* the warp on the loom, above the cloth that the reed has already beaten down */
const LOOSE = [
  [196, 0.08],
  [252, 0.1],
  [174, 0.13],
  [288, 0.16],
  [226, 0.2],
]
const WOVEN = [0.34, 0.44, 0.54, 0.66, 0.8]

const loose = LOOSE.map(([width, opacity]) => `<span class="pick" style="width:${width}px;opacity:${opacity}"></span>`).join('')
const woven = WOVEN.map((opacity) => `<span class="pick" style="width:430px;opacity:${opacity}"></span>`).join('')

const page = `<!doctype html>
<html data-theme="dark"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap" rel="stylesheet">
<style>
  /* the library's own tokens: the banner cannot drift from the components */
  html[data-theme='dark'] {
    --bg: #0b0d14;
    --fg: #e9e5db;
    --muted: #9b9789;
    --accent: #5f72ef;
    --reed: #2b3145;
  }

  html[data-theme='light'] {
    --bg: #f2f1ec;
    --fg: #14161d;
    --muted: #5c594f;
    --accent: #3a49c4;
    --reed: #c2beb2;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    width: ${W}px;
    height: ${H}px;
    background: var(--bg);
    color: var(--fg);
    font-family: 'Archivo', ui-sans-serif, system-ui, sans-serif;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 76px;
    overflow: hidden;
    -webkit-font-smoothing: antialiased;
  }

  .left { display: flex; flex-direction: column; gap: 22px; }
  .brand { display: flex; align-items: center; gap: 13px; }
  .brand svg { width: 30px; height: 30px; color: var(--accent); }
  .brand span { font-size: 37px; font-weight: 600; letter-spacing: -0.035em; }
  .tagline { font-size: 17px; line-height: 1.5; color: var(--muted); max-width: 23ch; }
  .eyebrow {
    font-family: 'IBM Plex Mono', ui-monospace, monospace;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    color: var(--muted);
  }

  /* the reed holds the warp, and the weft is beaten down into cloth at the bottom */
  .motif { width: 430px; height: 232px; flex: none; position: relative; }
  .warp {
    position: absolute;
    inset: 0;
    background-image: repeating-linear-gradient(90deg, var(--reed) 0 1px, transparent 1px 7px);
  }
  .cloth { position: absolute; inset: auto 0 0 0; display: flex; flex-direction: column; align-items: flex-start; }
  .loose { display: flex; flex-direction: column; align-items: flex-start; gap: 13px; margin-bottom: 13px; }
  .beaten { display: flex; flex-direction: column; gap: 4px; }
  .pick { height: 3px; border-radius: 999px; background: var(--fg); }
  .pick.beat { background: var(--accent); opacity: 1; margin-bottom: 9px; }
</style></head><body>
  <div class="left">
    <div class="brand">
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <g stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
          <line x1="5" y1="4" x2="5" y2="28"/><line x1="12" y1="4" x2="12" y2="28"/>
          <line x1="19" y1="4" x2="19" y2="28"/><line x1="26" y1="4" x2="26" y2="28"/>
          <line x1="3" y1="21.5" x2="29" y2="21.5"/>
        </g>
      </svg>
      <span>sley</span>
    </div>
    <p class="tagline">Components for interfaces that hold a lot of data.</p>
    <p class="eyebrow">React &nbsp;&middot;&nbsp; Vue</p>
  </div>
  <div class="motif">
    <div class="warp"></div>
    <div class="cloth">
      <div class="loose">${loose}</div>
      <span class="pick beat" style="width:430px"></span>
      <div class="beaten">${woven}</div>
    </div>
  </div>
</body></html>`

const scratch = join(tmpdir(), 'sley-banner.html')
writeFileSync(scratch, page)

const require = createRequire(join(process.cwd(), '/'))
let puppeteer
try {
  puppeteer = require('puppeteer')
} catch {
  console.log('puppeteer is not installed. run:')
  console.log('  npm install --no-save puppeteer && node .github/banner.mjs')
  process.exit(0)
}

const browser = await puppeteer.launch({ headless: true })
const tab = await browser.newPage()
await tab.setViewport({ width: W, height: H, deviceScaleFactor: 2 })
await tab.goto(`file://${scratch}`, { waitUntil: 'networkidle0' })

for (const theme of ['dark', 'light']) {
  await tab.evaluate((value) => {
    document.documentElement.dataset.theme = value
  }, theme)
  await tab.evaluate(() => document.fonts.ready)
  await tab.screenshot({ path: resolve(HERE, `banner-${theme}.png`) })
  console.log(`wrote .github/banner-${theme}.png`)
}

await browser.close()
