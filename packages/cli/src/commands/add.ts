import { join, resolve } from 'node:path'
import { applyItem, type AppliedFile } from '../lib/apply.js'
import { CONFIG, readConfig } from '../lib/config.js'
import { installPackages } from '../lib/install.js'
import { readLockfile, writeLockfile } from '../lib/lockfile.js'
import { detectLibrary, resolveProject } from '../lib/project.js'
import { libraryRegistry, resolveItems } from '../lib/registry.js'
import { byCodeUnit } from '../lib/sort.js'

export interface AddOptions {
  readonly cwd: string
  readonly registry: string
  readonly overwrite: boolean
  readonly install: boolean
  readonly framework?: string
}

export interface AddedItem {
  readonly name: string
  readonly files: readonly AppliedFile[]
}

export async function add(names: readonly string[], options: AddOptions) {
  if (names.length === 0) throw new Error('Name at least one component.')

  const cwd = resolve(options.cwd)
  const config = await readConfig(cwd)
  if (!config) throw new Error(`No ${CONFIG} here. Run sley init first.`)

  const library = await detectLibrary(cwd, options.framework)
  const project = await resolveProject({ cwd, cssEntry: join(cwd, config.tailwind.css), rsc: config.rsc, library })
  const lock = await readLockfile(cwd, options.registry)
  lock.library = library
  const items = await resolveItems(libraryRegistry(options.registry, library), names)

  const added: AddedItem[] = []
  for (const item of items) {
    added.push({ name: item.name, files: await applyItem(project, item, lock, options.overwrite) })
  }
  await writeLockfile(cwd, lock)

  const packages = [...new Set(items.flatMap((item) => item.dependencies))].sort(byCodeUnit)
  const installed = options.install && installPackages(cwd, project.packageManager, packages)

  return { added, packages, installed, manager: project.packageManager, library }
}
