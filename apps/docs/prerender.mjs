import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/*
 * a single page app serves one built index.html at every path, so a crawler that does not
 * run the bundle reads the home page title, description and canonical on all 23 routes.
 * this stamps a copy of the shell per route, which the host serves before it reaches the
 * catch-all rewrite.
 */

const SITE = 'https://sley-ui.dev'
const NAME = 'Sley UI'

const root = dirname(fileURLToPath(import.meta.url))
const dist = join(root, 'dist')

function one(source, pattern, what) {
  const found = pattern.exec(source)
  if (!found) throw new Error(`prerender: ${what} did not match`)
  return found[1]
}

const metaSource = await readFile(join(root, 'src', 'site', 'meta.ts'), 'utf8')
const defaultTitle = one(metaSource, /DEFAULT_TITLE = '((?:[^'\\]|\\.)*)'/, 'DEFAULT_TITLE')
const defaultDescription = one(metaSource, /DEFAULT_DESCRIPTION =\s*'((?:[^'\\]|\\.)*)'/, 'DEFAULT_DESCRIPTION')

const meta = new Map([['/', { title: defaultTitle, description: defaultDescription }]])

const pageBlock = one(metaSource, /PAGE_META[^=]*= \{([\s\S]*?)\n\}/, 'the PAGE_META object')
const pageEntry = /'(\/[^']*)':\s*\{\s*title:\s*'((?:[^'\\]|\\.)*)',\s*description:\s*'((?:[^'\\]|\\.)*)',?\s*\}/g
for (const [, path, title, description] of pageBlock.matchAll(pageEntry)) {
  meta.set(path, { title: `${title}, ${NAME}`, description })
}

/* the component pages carry their own name and summary, so the doc literal is the source */
const docShape = /export const doc: ComponentDoc = \{\s*slug: '([^']*)',\s*name: '([^']*)',\s*summary: '((?:[^'\\]|\\.)*)',/
const componentDir = join(root, 'src', 'content', 'components')
const componentFiles = (await readdir(componentDir)).filter((name) => name.endsWith('.tsx'))
for (const file of componentFiles) {
  const source = await readFile(join(componentDir, file), 'utf8')
  const found = docShape.exec(source)
  if (!found) throw new Error(`prerender: ${file} does not open its doc with slug, name and summary`)
  const [, slug, name, summary] = found
  if (slug !== file.replace(/\.tsx$/, '')) throw new Error(`prerender: ${file} declares the slug ${slug}`)
  meta.set(`/components/${slug}`, { title: `${name}, ${NAME}`, description: summary })
}

const TAGS = {
  title: /(<title>)[^<]*(<\/title>)/,
  description: /(<meta\s+name="description"\s+content=")[^"]*(")/,
  canonical: /(<link\s+rel="canonical"\s+href=")[^"]*(")/,
  ogTitle: /(<meta\s+property="og:title"\s+content=")[^"]*(")/,
  ogDescription: /(<meta\s+property="og:description"\s+content=")[^"]*(")/,
  ogUrl: /(<meta\s+property="og:url"\s+content=")[^"]*(")/,
  twitterTitle: /(<meta\s+name="twitter:title"\s+content=")[^"]*(")/,
  twitterDescription: /(<meta\s+name="twitter:description"\s+content=")[^"]*(")/,
}

const attribute = (value) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;')

function stamp(html, key, value) {
  const pattern = TAGS[key]
  if (!pattern.test(html)) throw new Error(`prerender: the built shell holds no ${key} tag`)
  return html.replace(pattern, (_, before, after) => `${before}${attribute(value)}${after}`)
}

const shell = await readFile(join(dist, 'index.html'), 'utf8')
const sitemap = await readFile(join(dist, 'sitemap.xml'), 'utf8')
const paths = [...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map(([, url]) => url.slice(SITE.length) || '/')

for (const path of paths) {
  const page = meta.get(path)
  if (!page) throw new Error(`prerender: no title and description for ${path}`)

  const url = `${SITE}${path}`
  let html = shell
  html = stamp(html, 'title', page.title)
  html = stamp(html, 'description', page.description)
  html = stamp(html, 'canonical', url)
  html = stamp(html, 'ogTitle', page.title)
  html = stamp(html, 'ogDescription', page.description)
  html = stamp(html, 'ogUrl', url)
  html = stamp(html, 'twitterTitle', page.title)
  html = stamp(html, 'twitterDescription', page.description)

  const target = path === '/' ? dist : join(dist, path)
  await mkdir(target, { recursive: true })
  await writeFile(join(target, 'index.html'), html)
}

console.log(`prerendered the head of ${paths.length} pages`)
