import { existsSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/*
 * the page reads what the registry actually serves. `versions.json` decides the order and the
 * membership, so a version the host does not answer for cannot appear here, and the frozen
 * bundles decide what moved in each one.
 */

const root = dirname(fileURLToPath(import.meta.url))
const registry = join(root, '..', '..', 'packages', 'registry')
const servedPath = join(registry, 'dist', 'r', 'versions.json')
const notesPath = join(root, 'src', 'content', 'releases.ts')
const outPath = join(root, 'src', 'content', 'releases.generated.ts')

if (!existsSync(servedPath)) {
  throw new Error('releases: no versions.json. run `npm run build -w @sley-ui/registry` first')
}

const notesSource = await readFile(notesPath, 'utf8')
const written = new Set([...notesSource.matchAll(/^ {2}'([^']+)': \{/gm)].map(([, version]) => version))

async function bundle(version) {
  const path = join(registry, 'releases', `${version}.json`)
  if (!existsSync(path)) return undefined
  return JSON.parse(await readFile(path, 'utf8'))
}

function fileMap(items) {
  const files = new Map()
  for (const item of items) {
    for (const file of item.files) files.set(file.path, { item: item.name, content: file.content })
  }
  return files
}

const { versions } = JSON.parse(await readFile(servedPath, 'utf8'))

const releases = []
let previous
/* oldest first, so each release can be compared with the one below it */
for (const version of versions.toReversed()) {
  const frozen = await bundle(version)
  if (!frozen) {
    console.log(`releases: ${version} is served but not frozen, so it has no entry yet`)
    continue
  }
  if (!written.has(version)) {
    throw new Error(`releases: ${version} is served with no note in src/content/releases.ts`)
  }

  const files = fileMap(frozen.items)
  const moved = { added: [], changed: [], removed: [] }
  if (previous) {
    for (const [path, file] of files) {
      if (!previous.has(path)) moved.added.push({ item: file.item, path })
      else if (previous.get(path).content !== file.content) moved.changed.push({ item: file.item, path })
    }
    for (const [path, file] of previous) {
      if (!files.has(path)) moved.removed.push({ item: file.item, path })
    }
  }

  releases.push({
    version,
    items: frozen.items.length,
    files: files.size,
    first: previous === undefined,
    ...moved,
  })
  previous = files
}

releases.reverse()

const quote = (value) => `'${value}'`
const fileLine = (file) => `      { item: ${quote(file.item)}, path: ${quote(file.path)} },`
const list = (name, files) =>
  files.length === 0 ? `    ${name}: [],` : `    ${name}: [\n${files.map(fileLine).join('\n')}\n    ],`

const block = (release) =>
  [
    '  {',
    `    version: ${quote(release.version)},`,
    `    items: ${release.items},`,
    `    files: ${release.files},`,
    `    first: ${release.first},`,
    list('added', release.added),
    list('changed', release.changed),
    list('removed', release.removed),
    '  },',
  ].join('\n')

await writeFile(
  outPath,
  `/* written by releases.mjs from the frozen bundles. do not edit. */
import type { ReleaseEntry } from './types'

export const LATEST = ${quote(releases[0]?.version)}

export const RELEASES: readonly ReleaseEntry[] = [
${releases.map(block).join('\n')}
]
`,
)
console.log(`wrote notes for ${releases.length} release(s), newest ${releases[0]?.version}`)
