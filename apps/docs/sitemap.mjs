import { readdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const SITE = 'https://sley-ui.dev'

/* the pages that are not one component each, in the order the sidebar lists them */
const PAGES = ['/', '/docs/installation', '/docs/updates', '/docs/releases', '/docs/keyboard', '/docs/density', '/docs/motion', '/docs/colour', '/docs/type', '/notes/row-window']

const root = dirname(fileURLToPath(import.meta.url))

/* the slugs come from the directory, so a new component page cannot be left out of the sitemap */
const entries = await readdir(join(root, 'src', 'content', 'components'))
const slugs = entries.filter((name) => name.endsWith('.tsx')).map((name) => name.replace(/\.tsx$/, ''))

const paths = [...PAGES, ...slugs.map((slug) => `/components/${slug}`)]
const urls = paths.map((path) => `  <url><loc>${SITE}${path}</loc></url>`).join('\n')

await writeFile(
  join(root, 'dist', 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
)
console.log(`wrote a sitemap of ${paths.length} pages`)
