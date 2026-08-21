import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const src = join(root, 'src')
const out = join(root, 'dist', 'r')
const releases = join(root, 'releases')

const SCHEMA = 'https://ui.shadcn.com/schema/registry-item.json'
const STYLE_ITEM = 'tokens'

/* the shadcn cli installs from a full url */
const BASE = 'https://sley-ui.dev/r'

/* `import x from 'y'`, `import 'y'` and `export { x } from 'y'` all end in the same shape */
const SPECIFIER = /\b(?:from|import)\s+'([^']+)'/g

/* the runtime supplies these */
const PROVIDED = new Set(['react', 'react-dom', 'vue'])

/*
 * one source tree serves both frameworks. a `.tsx` file is react's, a `.vue` file is
 * vue's, and everything beside them, the chart helpers and the token file included,
 * belongs to both. each framework gets a tree of its own under `dist/r`.
 */
const FRAMEWORKS = [
  { tree: '', extension: '.tsx' },
  { tree: 'vue', extension: '.vue' },
]

const FRAMEWORK_EXTENSIONS = FRAMEWORKS.map((framework) => framework.extension)

/*
 * a react server component runs no hook and holds no event handler. ark builds on
 * hooks, so its parts count too. only a next project needs the directive.
 */
const CLIENT = /\bfrom '@ark-ui\/|\buse(?:State|Effect|Ref|Memo|Callback|Reducer|Context)\b/

/* code unit order, to keep the output off the build machine's locale */
function byCodeUnit(a, b) {
  if (a < b) return -1
  return a > b ? 1 : 0
}

/* a prerelease ranks below the release whose numbers it shares */
function compareVersions(a, b) {
  const [aMain, aPre] = a.split('-')
  const [bMain, bPre] = b.split('-')
  const aParts = aMain.split('.').map(Number)
  const bParts = bMain.split('.').map(Number)

  for (let i = 0; i < 3; i += 1) {
    if (aParts[i] !== bParts[i]) return aParts[i] - bParts[i]
  }
  if (aPre === bPre) return 0
  if (aPre === undefined) return 1
  if (bPre === undefined) return -1
  return byCodeUnit(aPre, bPre)
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
 * an import inside the registry becomes a registry dependency, and one from outside
 * becomes an npm dependency. the source is the only declaration.
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
    const source = target.endsWith('.tsx') || target.endsWith('.ts') || target.endsWith('.vue')
    files.push({ target, content, type: source ? null : 'registry:file' })
  }
  return files
}

/*
 * the range comes from this package's own dependencies, so a user installs the version
 * the components were written against. a bare name takes the newest, and one of these
 * is on a 0.x line where a minor release may break a chart.
 */
function withRange(pkg, ranges) {
  const range = ranges[pkg]
  return range ? `${pkg}@${range}` : pkg
}

function collectDependencies(files, self, ranges) {
  const npm = new Set()
  const registry = new Set()
  for (const file of files) {
    for (const match of file.content.matchAll(SPECIFIER)) {
      const { npm: pkg, registry: item } = classify(match[1])
      if (pkg) npm.add(pkg)
      if (item && item !== self) registry.add(item)
    }
  }
  return { npm: [...npm].sort(byCodeUnit).map((pkg) => withRange(pkg, ranges)), registry: [...registry].sort(byCodeUnit) }
}

function title(name) {
  return name
    .split('-')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ')
}

function buildItem({ name, type, files, fileType, version, ranges, base = BASE, extraRegistry = [] }) {
  const { npm, registry } = collectDependencies(files, name, ranges)
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
    /* one version covers the whole registry, and a hash answers whether a single file moved */
    sley: {
      version,
      /*
       * the immutable copy of these exact bytes. the lockfile records it, and the three
       * way merge reads its base from there after the flat path has moved on.
       */
      url: `${base}/${version}/${name}.json`,
      files: files.map((file) => ({
        path: file.target,
        hash: hash(file.content),
        client: file.target.endsWith('.tsx') && CLIENT.test(file.content),
      })),
    },
  }
}

function buildIndex(items, version, base) {
  const index = items.map(({ name, type, title: label, dependencies, registryDependencies }) => ({
    name,
    type,
    title: label,
    dependencies,
    registryDependencies,
    url: `${base}/${name}.json`,
  }))
  return { $schema: SCHEMA, name: 'sley-ui', version, homepage: BASE, items: index }
}

async function writeTree(dir, items, version, base) {
  await mkdir(dir, { recursive: true })
  for (const item of items) {
    await writeFile(join(dir, `${item.name}.json`), `${JSON.stringify(item, null, 2)}\n`)
  }
  await writeFile(join(dir, 'index.json'), `${JSON.stringify(buildIndex(items, version, base), null, 2)}\n`)
}

async function frozenVersions() {
  if (!existsSync(releases)) return []
  const entries = await readdir(releases)
  return entries.filter((name) => name.endsWith('.json')).map((name) => name.replace(/\.json$/, ''))
}

async function readRelease(version) {
  return JSON.parse(await readFile(join(releases, `${version}.json`), 'utf8'))
}

/*
 * a published version is immutable. a lockfile written against it names files by hash,
 * so replacing the bytes under one would report every file as edited.
 */
async function guardFrozen(version, trees) {
  const bundle = await readRelease(version)
  const same = FRAMEWORKS.every(
    (framework) => JSON.stringify(frozenTree(bundle, framework)) === JSON.stringify(trees[framework.tree]),
  )
  if (same) return
  throw new Error(`Version ${version} is frozen and the source has moved. Raise the version in package.json.`)
}

/* the first releases carried react alone, so a bundle with no vue key serves no vue tree */
function frozenTree(bundle, framework) {
  return framework.tree === '' ? bundle.items : (bundle[framework.tree] ?? [])
}

async function freeze(version, trees) {
  const path = join(releases, `${version}.json`)
  if (existsSync(path)) {
    console.log(`version ${version} is already frozen`)
    return
  }
  await mkdir(releases, { recursive: true })
  await writeFile(path, `${JSON.stringify({ version, items: trees[''], vue: trees.vue }, null, 2)}\n`)
  console.log(`froze ${trees[''].length} react and ${trees.vue.length} vue item(s) at version ${version}`)
}

const treeBase = (tree) => (tree === '' ? BASE : `${BASE}/${tree}`)
const treeDir = (tree) => (tree === '' ? out : join(out, tree))

/* a file belongs to one framework only when its extension names one */
function filesFor(paths, extension) {
  const foreign = FRAMEWORK_EXTENSIONS.filter((entry) => entry !== extension)
  return paths.filter((path) => !foreign.some((entry) => path.endsWith(entry)))
}

async function buildTree(framework, version, ranges) {
  const { tree, extension } = framework
  const base = treeBase(tree)
  const items = []

  const styleFiles = await readItemFiles([join(src, 'styles', 'tokens.css')], () => 'styles/tokens.css')
  items.push(
    buildItem({
      name: STYLE_ITEM,
      type: 'registry:style',
      files: styleFiles,
      fileType: 'registry:file',
      version,
      ranges,
      base,
    }),
  )

  for (const path of await walk(join(src, 'lib'))) {
    const name = path.split('/').pop().replace(/\.ts$/, '')
    const files = await readItemFiles([path], (file) => `lib/${file.split('/').pop()}`)
    items.push(buildItem({ name, type: 'registry:lib', files, fileType: 'registry:lib', version, ranges, base }))
  }

  const uiRoot = join(src, 'components', 'ui')
  for (const entry of await readdir(uiRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const paths = filesFor(await walk(join(uiRoot, entry.name)), extension)
    if (!paths.some((path) => path.endsWith(extension))) {
      throw new Error(`Item ${entry.name} has no ${extension} file, so it cannot be served to that framework.`)
    }
    const files = await readItemFiles(paths, (file) => `components/ui/${entry.name}/${file.split('/').pop()}`)
    items.push(
      buildItem({
        name: entry.name,
        type: 'registry:ui',
        files,
        fileType: 'registry:ui',
        version,
        ranges,
        base,
        extraRegistry: [STYLE_ITEM],
      }),
    )
  }

  return items
}

async function main() {
  await rm(join(root, 'dist'), { recursive: true, force: true })
  await mkdir(out, { recursive: true })

  const { version, dependencies: ranges } = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'))

  const trees = {}
  for (const framework of FRAMEWORKS) {
    trees[framework.tree] = await buildTree(framework, version, ranges)
  }

  const frozen = await frozenVersions()
  if (frozen.includes(version)) await guardFrozen(version, trees)

  for (const framework of FRAMEWORKS) {
    const dir = treeDir(framework.tree)
    const base = treeBase(framework.tree)
    /* the flat path is what a user installs from, and it only ever holds the newest */
    await writeTree(dir, trees[framework.tree], version, base)
    await writeTree(join(dir, version), trees[framework.tree], version, `${base}/${version}`)

    for (const past of frozen) {
      if (past === version) continue
      const bundle = await readRelease(past)
      const items = frozenTree(bundle, framework)
      if (items.length === 0) continue
      await writeTree(join(dir, past), items, past, `${base}/${past}`)
    }
  }

  const published = [...new Set([version, ...frozen])].sort((a, b) => compareVersions(b, a))
  await writeFile(join(out, 'versions.json'), `${JSON.stringify({ latest: version, versions: published }, null, 2)}\n`)

  const counts = FRAMEWORKS.map((framework) => `${trees[framework.tree].length} ${framework.tree || 'react'}`)
  console.log(`wrote ${counts.join(' and ')} registry item(s) at version ${version} to ${out}`)
  console.log(`serving ${published.length} version(s): ${published.join(', ')}`)

  if (process.argv.includes('--freeze')) await freeze(version, trees)
}

await main()
