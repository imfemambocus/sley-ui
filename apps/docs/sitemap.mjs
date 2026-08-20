import { readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const SITE = 'https://sley-ui.dev'

/* the pages that are not one component each, in the order the sidebar lists them */
const PAGES = ['/', '/docs/installation', '/docs/updates', '/docs/releases', '/docs/keyboard', '/docs/density', '/docs/motion', '/docs/colour', '/docs/type']

const root = dirname(fileURLToPath(import.meta.url))

/* the notes come from the list the sidebar and the feed read, so a note cannot be left out */
const notesSource = await readFile(join(root, 'src', 'content', 'notes.ts'), 'utf8')
const notes = [...notesSource.matchAll(/\{\s*slug: '([^']*)'/g)].map(([, slug]) => `/notes/${slug}`)
if (notes.length === 0) throw new Error('sitemap: no note matched a slug in notes.ts')

/* the slugs come from the directory, so a new component page cannot be left out of the sitemap */
const entries = await readdir(join(root, 'src', 'content', 'components'))
const slugs = entries.filter((name) => name.endsWith('.tsx')).map((name) => name.replace(/\.tsx$/, ''))

const paths = [...PAGES, ...notes, ...slugs.map((slug) => `/components/${slug}`)]
const urls = paths.map((path) => `  <url><loc>${SITE}${path}</loc></url>`).join('\n')

await writeFile(
  join(root, 'dist', 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
)
console.log(`wrote a sitemap of ${paths.length} pages`)
