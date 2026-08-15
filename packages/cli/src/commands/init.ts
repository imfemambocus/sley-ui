import { readFile } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { applyItem } from '../lib/apply.js'
import { writeConfig } from '../lib/config.js'
import { exists, write } from '../lib/files.js'
import { readLockfile, writeLockfile } from '../lib/lockfile.js'
import {
  detectFramework,
  detectPackageManager,
  findCssEntry,
  findTsconfig,
  readAlias,
  writeAlias,
  writeViteAlias,
  type Project,
} from '../lib/project.js'
import { loadItem, TOKENS_ITEM } from '../lib/registry.js'

export interface InitOptions {
  readonly cwd: string
  readonly registry: string
  readonly overwrite: boolean
}

const TOKENS_TARGET = 'styles/tokens.css'

function importPath(from: string, to: string) {
  const path = relative(dirname(from), to).split('\\').join('/')
  return path.startsWith('.') ? path : `./${path}`
}

/*
 * a later merge needs a whole file to compare, and a block pasted into a file the
 * user also edits has no stable position.
 */
async function linkTokens(cssEntry: string, tokensPath: string) {
  const text = await readFile(cssEntry, 'utf8')
  const line = `@import '${importPath(cssEntry, tokensPath)}';`
  if (text.includes(importPath(cssEntry, tokensPath))) return false

  const lines = text.split('\n')
  const last = lines.findLastIndex((entry) => entry.trimStart().startsWith('@import'))
  const at = last === -1 ? 0 : last + 1
  lines.splice(at, 0, line)
  await write(cssEntry, lines.join('\n'))
  return true
}

export async function init(options: InitOptions) {
  const cwd = resolve(options.cwd)
  const framework = await detectFramework(cwd)
  const tsconfigPath = await findTsconfig(cwd)
  const notes: string[] = []

  let alias = await readAlias(tsconfigPath)
  if (!alias) {
    const sourceDir = exists(join(cwd, 'src')) ? join(cwd, 'src') : cwd
    await writeAlias(tsconfigPath, sourceDir)
    alias = { prefix: '@', dir: sourceDir }
    notes.push(`added the @ alias to ${relative(cwd, tsconfigPath)}`)
  }

  if (framework === 'vite') {
    const result = await writeViteAlias(cwd, alias.dir, alias.prefix)
    const target = relative(cwd, result.path)
    notes.push(
      result.done
        ? `added the ${alias.prefix} alias to ${target}`
        : `add the ${alias.prefix} alias to ${target} yourself, because it already has a resolve block`,
    )
  }

  const cssEntry = await findCssEntry(cwd)
  const project: Project = {
    cwd,
    framework,
    tsconfigPath,
    aliasPrefix: alias.prefix,
    sourceDir: alias.dir,
    cssEntry,
    packageManager: detectPackageManager(cwd),
    rsc: framework === 'next',
  }

  const lock = await readLockfile(cwd, options.registry)
  lock.registry = options.registry

  const tokens = await loadItem(options.registry, TOKENS_ITEM)
  const applied = await applyItem(project, tokens, lock, options.overwrite)
  const linked = await linkTokens(cssEntry, join(alias.dir, TOKENS_TARGET))

  const config = await writeConfig({ cwd, prefix: alias.prefix, cssEntry, rsc: framework === 'next' })
  await writeLockfile(cwd, lock)

  return { project, config, applied, linked, notes }
}
