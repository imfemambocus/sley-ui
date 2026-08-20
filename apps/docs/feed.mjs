import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/* an aggregator takes a feed as its source, so the notes need one to be picked up at all */

const SITE = 'https://sley-ui.dev'
const TITLE = 'Sley UI notes'
const DESCRIPTION = 'Measurements taken while building a component registry for data-dense interfaces.'

const root = dirname(fileURLToPath(import.meta.url))

const metaSource = await readFile(join(root, 'src', 'site', 'meta.ts'), 'utf8')
const pageBlock = /PAGE_META[^=]*= \{([\s\S]*?)\n\}/.exec(metaSource)
if (!pageBlock) throw new Error('feed: the PAGE_META object did not match')

const meta = new Map()
const pageEntry = /'(\/[^']*)':\s*\{\s*title:\s*'((?:[^'\\]|\\.)*)',\s*description:\s*'((?:[^'\\]|\\.)*)',?\s*\}/g
for (const [, path, title, description] of pageBlock[1].matchAll(pageEntry)) meta.set(path, { title, description })

const notesSource = await readFile(join(root, 'src', 'content', 'notes.ts'), 'utf8')
const noteEntry = /\{\s*slug: '([^']*)',\s*label: '[^']*',\s*date: '([^']*)'\s*\}/g
const notes = [...notesSource.matchAll(noteEntry)]
if (notes.length === 0) throw new Error('feed: no entry in notes.ts matched slug, label and date')

const escape = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

const items = notes
  .map(([, slug, date]) => {
    const path = `/notes/${slug}`
    const page = meta.get(path)
    if (!page) throw new Error(`feed: no title and description for ${path}`)

    const published = new Date(`${date}T09:00:00Z`)
    /* the loose parser reads "20 August" and guesses a year, so the shape is checked as well */
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(published.valueOf()))
      throw new Error(`feed: the note ${slug} carries the date ${date}`)

    return { title: page.title, description: page.description, url: `${SITE}${path}`, published }
  })
  .sort((a, b) => b.published.valueOf() - a.published.valueOf())

const entries = items
  .map(
    (item) => `    <item>
      <title>${escape(item.title)}</title>
      <link>${item.url}</link>
      <guid isPermaLink="true">${item.url}</guid>
      <pubDate>${item.published.toUTCString()}</pubDate>
      <description>${escape(item.description)}</description>
    </item>`,
  )
  .join('\n')

await writeFile(
  join(root, 'dist', 'rss.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${TITLE}</title>
    <link>${SITE}/</link>
    <description>${DESCRIPTION}</description>
    <language>en</language>
    <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${items[0].published.toUTCString()}</lastBuildDate>
${entries}
  </channel>
</rss>
`,
)
console.log(`wrote a feed of ${items.length} notes`)
