import { createHash } from 'node:crypto'
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const src = join(root, 'src')
const out = join(root, 'dist', 'r')

const SCHEMA = 'https://ui.shadcn.com/schema/registry-item.json'
const STYLE_ITEM = 'tokens'

/*
 * the lockfile records where a file came from, so the base has to be settled before
 * the first release writes one. the shadcn cli installs from a full url, which is
 * what carries this registry to their users.
 */
const BASE = 'https://sley-ui.dev/r'

/* `import x from 'y'`, `import 'y'` and `export { x } from 'y'` all end in the same shape */
const SPECIFIER = /\b(?:from|import)\s+'([^']+)'/g

/* the runtime supplies these, so no user installs them because of a component */
const PROVIDED = new Set(['react', 'react-dom'])

/* code unit order, so the output does not follow the locale of the machine that built it */
function byCodeUnit(a, b) {
  if (a < b) return -1
  return a > b ? 1 : 0
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walk(path)))
    } else {
      files.push(path)
    }
  }
  return files.sort(byCodeUnit)
}

function packageOf(specifier) {
  const parts = specifier.split('/')
  return specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0]
}

/*
 * an import inside the registry becomes a registry dependency, and an import from
 * outside becomes an npm one. the source is the only declaration, because a header
 * a person maintains by hand goes out of date.
 */
function classify(specifier) {
  if (specifier.startsWith('@/components/ui/')) return { registry: specifier.split('/')[3] }
  if (specifier.startsWith('@/lib/')) return { registry: specifier.split('/')[2].replace(/\.ts$/, '') }
  if (specifier.startsWith('@/') || specifier.startsWith('.')) return {}
  if (PROVIDED.has(specifier)) return {}
  return { npm: packageOf(specifier) }
}

function hash(content) {
  return `sha256-${createHash('sha256').update(content).digest('base64')}`
}

async function readItemFiles(paths, targetOf) {
  const files = []
  for (const path of paths) {
    const content = await readFile(path, 'utf8')
    const target = targetOf(path)
    files.push({ target, content, type: target.endsWith('.tsx') || target.endsWith('.ts') ? null : 'registry:file' })
  }
  return files
}

function collectDependencies(files, self) {
  const npm = new Set()
  const registry = new Set()
  for (const file of files) {
    for (const match of file.content.matchAll(SPECIFIER)) {
      const { npm: pkg, registry: item } = classify(match[1])
      if (pkg) npm.add(pkg)
      if (item && item !== self) registry.add(item)
    }
  }
  return { npm: [...npm].sort(byCodeUnit), registry: [...registry].sort(byCodeUnit) }
}

function title(name) {
  return name
    .split('-')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ')
}

function buildItem({ name, type, files, fileType, version, extraRegistry = [] }) {
  const { npm, registry } = collectDependencies(files, name)
  const registryDependencies = [...new Set([...registry, ...extraRegistry])].sort(byCodeUnit)

  return {
    $schema: SCHEMA,
    name,
    type,
    title: title(name),
    dependencies: npm,
    registryDependencies,
    files: files.map((file) => ({
      path: file.target,
      target: file.target,
      type: file.type ?? fileType,
      content: file.content,
    })),
    /*
     * one version covers the whole registry, and a hash answers whether a single
     * file moved. twelve version numbers kept by hand would answer neither well.
     */
    sley: {
      version,
      url: `${BASE}/${name}.json`,
      files: files.map((file) => ({ path: file.target, hash: hash(file.content) })),
    },
  }
}

async function main() {
  await rm(join(root, 'dist'), { recursive: true, force: true })
  await mkdir(out, { recursive: true })

  const { version } = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'))
  const items = []

  const styleFiles = await readItemFiles([join(src, 'styles', 'tokens.css')], () => 'styles/tokens.css')
  items.push(
    buildItem({ name: STYLE_ITEM, type: 'registry:style', files: styleFiles, fileType: 'registry:file', version }),
  )

  for (const path of await walk(join(src, 'lib'))) {
    const name = path.split('/').pop().replace(/\.ts$/, '')
    const files = await readItemFiles([path], (file) => `lib/${file.split('/').pop()}`)
    items.push(buildItem({ name, type: 'registry:lib', files, fileType: 'registry:lib', version }))
  }

  const uiRoot = join(src, 'components', 'ui')
  for (const entry of await readdir(uiRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const paths = await walk(join(uiRoot, entry.name))
    const files = await readItemFiles(paths, (file) => `components/ui/${entry.name}/${file.split('/').pop()}`)
    items.push(
      buildItem({
        name: entry.name,
        type: 'registry:ui',
        files,
        fileType: 'registry:ui',
        version,
        extraRegistry: [STYLE_ITEM],
      }),
    )
  }

  for (const item of items) {
    await writeFile(join(out, `${item.name}.json`), `${JSON.stringify(item, null, 2)}\n`)
  }

  const index = items.map(({ name, type, title: label, dependencies, registryDependencies, sley }) => ({
    name,
    type,
    title: label,
    dependencies,
    registryDependencies,
    url: sley.url,
  }))
  const manifest = { $schema: SCHEMA, name: 'sley-ui', version, homepage: BASE, items: index }
  await writeFile(join(out, 'index.json'), `${JSON.stringify(manifest, null, 2)}\n`)

  console.log(`wrote ${items.length} registry items at version ${version} to ${out}`)
}

await main()
