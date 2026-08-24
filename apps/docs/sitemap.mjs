import { execFileSync } from 'node:child_process'
import { access, readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const SITE = 'https://sley-ui.dev'

/* the pages that are not one component each, in the order the sidebar lists them */
const PAGES = [
  ['/', 'Home'],
  ['/docs/installation', 'Installation'],
  ['/docs/vue', 'Vue'],
  ['/docs/updates', 'Updates'],
  ['/docs/releases', 'Releases'],
  ['/docs/keyboard', 'Keyboard'],
  ['/docs/density', 'Density'],
  ['/docs/motion', 'Motion'],
  ['/docs/colour', 'Colour'],
  ['/docs/type', 'Type'],
]

const root = dirname(fileURLToPath(import.meta.url))

/* the notes come from the list the sidebar and the feed read, so a note cannot be left out */
const notesSource = await readFile(join(root, 'src', 'content', 'notes.ts'), 'utf8')
const noteSlugs = [...notesSource.matchAll(/\{\s*slug: '([^']*)'/g)].map(([, slug]) => slug)
if (noteSlugs.length === 0) throw new Error('sitemap: no note matched a slug in notes.ts')
const pascal = (slug) => slug.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join('')
const notes = noteSlugs.map((slug) => [`/notes/${slug}`, pascal(slug)])

/* the slugs come from the directory, so a new component page cannot be left out of the sitemap */
const entries = await readdir(join(root, 'src', 'content', 'components'))
const slugs = entries.filter((name) => name.endsWith('.tsx')).map((name) => name.replace(/\.tsx$/, ''))

const sources = [
  ...[...PAGES, ...notes].map(([path, page]) => [path, join('src', 'pages', `${page}.tsx`)]),
  ...slugs.map((slug) => [`/components/${slug}`, join('src', 'content', 'components', `${slug}.tsx`)]),
]

for (const [path, file] of sources) {
  await access(join(root, file)).catch(() => {
    throw new Error(`sitemap: ${path} names ${file}, which is not there`)
  })
}

/*
 * lastmod is a recrawl hint google reads only while it stays truthful, so the date is the
 * last commit that touched the page's own file. a shallow clone answers for a file it does
 * not carry, and that url goes out without the tag rather than with the build date.
 */
const changed = (file) => {
  try {
    return execFileSync('git', ['log', '-1', '--format=%cs', '--', file], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return ''
  }
}

const stamped = sources.map(([path, file]) => [path, changed(file)])
const paths = stamped.map(([path]) => path)
const urls = stamped
  .map(([path, date]) => {
    const lastmod = date === '' ? '' : `<lastmod>${date}</lastmod>`
    return `  <url><loc>${SITE}${path}</loc>${lastmod}</url>`
  })
  .join('\n')

await writeFile(
  join(root, 'dist', 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
)
const dated = stamped.filter(([, date]) => date !== '').length
console.log(`wrote a sitemap of ${paths.length} pages, ${dated} of them with a lastmod`)
