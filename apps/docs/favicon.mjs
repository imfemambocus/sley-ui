import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

/*
 * google reads one favicon per hostname and rasterises it on its own, so the search result
 * cannot take the colour from a prefers-color-scheme block or from currentColor. this bakes
 * the dark palette into a png beside the svg the browsers use.
 * regenerate with: npm install --no-save sharp && node apps/docs/favicon.mjs
 */

const GROUND = '#0b0d14'
const INDIGO = '#5f72ef'
const SIZE = 96

/* google masks a favicon to a circle on some surfaces, so the mark stands clear of the corners */
const INSET = 0.8

const root = dirname(fileURLToPath(import.meta.url))
const source = await readFile(join(root, 'public', 'favicon.svg'), 'utf8')

const mark = source
  .replace(/<style>[\s\S]*?<\/style>/, '')
  .replace('stroke="currentColor"', `stroke="${INDIGO}"`)
  .replace(/<svg[^>]*>/, '')
  .replace('</svg>', '')
  .trim()

const offset = (32 * (1 - INSET)) / 2
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 32 32">
  <rect width="32" height="32" fill="${GROUND}" />
  <g transform="translate(${offset} ${offset}) scale(${INSET})">${mark}</g>
</svg>`

const png = await sharp(Buffer.from(svg)).png().toBuffer()
await writeFile(join(root, 'public', 'favicon.png'), png)

const { width, height, channels } = await sharp(png).metadata()
console.log(`wrote a ${width}x${height} favicon of ${channels} channels, ${png.length} bytes`)
