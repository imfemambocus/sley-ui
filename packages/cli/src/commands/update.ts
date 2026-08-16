import { readFile } from 'node:fs/promises'
import { join, relative, resolve } from 'node:path'
import { applyItem, transform } from '../lib/apply.js'
import { CONFIG, readConfig } from '../lib/config.js'
import { exists, hash, write } from '../lib/files.js'
import { installPackages } from '../lib/install.js'
import { readLockfile, writeLockfile, type Lockfile, type LockedFile } from '../lib/lockfile.js'
import { merge } from '../lib/merge.js'
import { resolveProject, type Project } from '../lib/project.js'
import { loadItem, resolveItems, type RegistryItem } from '../lib/registry.js'
import { byCodeUnit } from '../lib/sort.js'

export type UpdateStatus = 'updated' | 'merged' | 'conflicted' | 'kept' | 'added' | 'missing' | 'dropped'

export interface UpdatedFile {
  readonly path: string
  readonly status: UpdateStatus
}

export interface UpdatedItem {
  readonly name: string
  readonly from: string | null
  readonly to: string
  readonly files: readonly UpdatedFile[]
  readonly applied: boolean
}

export interface UpdateOptions {
  readonly cwd: string
  readonly registry: string
  readonly install: boolean
  readonly conflicts: boolean
  readonly dryRun: boolean
}

interface Planned {
  readonly file: UpdatedFile
  readonly path: string
  readonly content: string | null
  readonly recorded: LockedFile | null
}

/*
 * the base comes from the registry in use, at the version the lock names, so a directory
 * registry answers it offline. `locked.url` stays the record of where the file came from.
 */
function versionSource(registry: string, version: string) {
  return `${registry.replace(/\/$/, '')}/${version}`
}

function plan(project: Project, item: RegistryItem, base: RegistryItem, conflicts: boolean) {
  const client = new Map(item.sley.files.map((file) => [file.path, file.client === true]))
  const baseOf = new Map(base.files.map((file) => [file.target, file.content]))
  const label = `sley-ui ${item.sley.version}`

  return Promise.all(
    item.files.map(async (file): Promise<Planned> => {
      const path = join(project.sourceDir, file.target)
      const shortPath = relative(project.cwd, path)
      const theirs = transform(file.content, project.aliasPrefix, project.rsc && client.get(file.target) === true)
      const recorded = { path: shortPath, hash: hash(theirs) }
      const baseSource = baseOf.get(file.target)

      if (baseSource === undefined) {
        return { file: { path: shortPath, status: 'added' }, path, content: theirs, recorded }
      }
      if (!exists(path)) {
        return { file: { path: shortPath, status: 'missing' }, path, content: null, recorded: null }
      }

      const original = transform(baseSource, project.aliasPrefix, project.rsc && client.get(file.target) === true)
      const mine = await readFile(path, 'utf8')

      if (hash(mine) === hash(original)) {
        return { file: { path: shortPath, status: 'updated' }, path, content: theirs, recorded }
      }
      if (hash(original) === hash(theirs)) {
        return { file: { path: shortPath, status: 'kept' }, path, content: null, recorded }
      }

      const merged = merge(original, mine, theirs, label)
      if (merged.clean) {
        return { file: { path: shortPath, status: 'merged' }, path, content: merged.content, recorded }
      }
      /*
       * the markers are written, so the item did move, and the lock moves with it. holding it
       * back leaves the base at the old version, and a hand resolved file then conflicts forever.
       */
      return {
        file: { path: shortPath, status: 'conflicted' },
        path,
        content: conflicts ? merged.content : null,
        recorded: conflicts ? recorded : null,
      }
    }),
  )
}

/* a file the new version dropped is reported and never deleted, because the project may still import it */
function dropped(item: RegistryItem, project: Project, lock: Lockfile): UpdatedFile[] {
  const shipped = new Set(item.files.map((file) => relative(project.cwd, join(project.sourceDir, file.target))))
  return (lock.items[item.name]?.files ?? [])
    .filter((file) => !shipped.has(file.path))
    .map((file) => ({ path: file.path, status: 'dropped' as const }))
}

async function updateItem(
  project: Project,
  item: RegistryItem,
  lock: Lockfile,
  options: UpdateOptions,
): Promise<UpdatedItem> {
  const locked = lock.items[item.name]
  if (!locked) {
    const applied = await applyItem(project, item, lock, false)
    return {
      name: item.name,
      from: null,
      to: item.sley.version,
      files: applied.map((file) => ({ path: file.path, status: 'added' as const })),
      applied: true,
    }
  }

  const base = await loadItem(versionSource(options.registry, locked.version), item.name)
  const planned = await plan(project, item, base, options.conflicts)
  const files = [...planned.map((entry) => entry.file), ...dropped(item, project, lock)]

  /* an item moves whole or not at all: a half written item records a base no file on disk came from */
  const blocked = planned.some((entry) => entry.recorded === null)
  if (blocked) {
    for (const entry of planned) {
      if (entry.file.status === 'conflicted' && entry.content !== null && !options.dryRun) {
        await write(entry.path, entry.content)
      }
    }
    return { name: item.name, from: locked.version, to: item.sley.version, files, applied: false }
  }

  const recorded: LockedFile[] = []
  for (const entry of planned) {
    if (entry.recorded) recorded.push(entry.recorded)
  }

  if (!options.dryRun) {
    for (const entry of planned) {
      if (entry.content !== null) await write(entry.path, entry.content)
    }
    lock.items[item.name] = { version: item.sley.version, url: item.sley.url, files: recorded }
  }
  return { name: item.name, from: locked.version, to: item.sley.version, files, applied: true }
}

export async function update(names: readonly string[], options: UpdateOptions) {
  const cwd = resolve(options.cwd)
  const config = await readConfig(cwd)
  if (!config) throw new Error(`No ${CONFIG} here. Run sley init first.`)

  const project = await resolveProject(cwd, join(cwd, config.tailwind.css), config.rsc)
  const lock = await readLockfile(cwd, options.registry)

  const wanted = names.length > 0 ? names : Object.keys(lock.items).sort(byCodeUnit)
  if (wanted.length === 0) throw new Error('Nothing to update. Run sley add first.')

  const unknown = names.filter((name) => !(name in lock.items))
  if (unknown.length > 0) throw new Error(`Not installed: ${unknown.join(', ')}.`)

  const items = await resolveItems(options.registry, wanted)
  const moved = items.filter((item) => lock.items[item.name]?.version !== item.sley.version)

  const updated: UpdatedItem[] = []
  for (const item of moved) {
    updated.push(await updateItem(project, item, lock, options))
  }
  if (!options.dryRun) await writeLockfile(cwd, lock)

  const done = new Set(updated.filter((entry) => entry.applied).map((entry) => entry.name))
  const packages = [...new Set(moved.filter((item) => done.has(item.name)).flatMap((item) => item.dependencies))].sort(byCodeUnit)
  const installed = options.install && !options.dryRun && packages.length > 0 && installPackages(cwd, project.packageManager, packages)

  return { updated, current: items.length - moved.length, packages, installed }
}
