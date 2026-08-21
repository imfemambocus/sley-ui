import { join, resolve } from 'node:path'
import { exists, parseJsonc, readJsonc } from './files.js'
import type { Library } from './project.js'

export interface RegistryFile {
  readonly path: string
  readonly target: string
  readonly type: string
  readonly content: string
}

export interface RegistryItem {
  readonly name: string
  readonly type: string
  readonly title: string
  readonly dependencies: readonly string[]
  readonly registryDependencies: readonly string[]
  readonly files: readonly RegistryFile[]
  readonly sley: {
    readonly version: string
    readonly url: string
    readonly files: readonly { readonly path: string; readonly hash: string; readonly client?: boolean }[]
  }
}

export const TOKENS_ITEM = 'tokens'

/*
 * react sits at the registry root and every other framework in a tree under it. a caller
 * who names the tree themselves gets it back unchanged.
 */
export function libraryRegistry(source: string, library: Library) {
  const trimmed = source.replace(/[\\/]$/, '')
  if (library === 'react') return trimmed
  return /[\\/]vue$/.test(trimmed) ? trimmed : `${trimmed}/vue`
}

function isUrl(source: string) {
  return source.startsWith('http://') || source.startsWith('https://')
}

export async function loadItem(source: string, name: string): Promise<RegistryItem> {
  if (!isUrl(source)) {
    const path = join(resolve(source), `${name}.json`)
    if (!exists(path)) throw new Error(`No item named ${name} in ${source}.`)
    return readJsonc<RegistryItem>(path)
  }

  const url = `${source.replace(/\/$/, '')}/${name}.json`
  const response = await fetch(url)
  if (!response.ok) throw new Error(`${url} answered ${response.status}.`)
  return parseJsonc<RegistryItem>(await response.text())
}

/* a dependency is written before the item that imports it */
export async function resolveItems(source: string, names: readonly string[]) {
  const ordered: RegistryItem[] = []
  const seen = new Set<string>()

  async function visit(name: string) {
    if (seen.has(name)) return
    seen.add(name)
    const item = await loadItem(source, name)
    for (const dependency of item.registryDependencies) {
      await visit(dependency)
    }
    ordered.push(item)
  }

  for (const name of names) {
    await visit(name)
  }
  return ordered
}
