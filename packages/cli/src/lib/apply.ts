import { readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { exists, hash, write } from './files.js'
import type { Lockfile, LockedFile } from './lockfile.js'
import type { Project } from './project.js'
import type { RegistryItem } from './registry.js'

export type FileStatus = 'written' | 'kept' | 'edited'

export interface AppliedFile {
  readonly path: string
  readonly status: FileStatus
}

const CLIENT_DIRECTIVE = "'use client'\n\n"

/* the source ships with `@`. a project on another prefix has its imports moved. */
function retarget(content: string, prefix: string) {
  if (prefix === '@') return content
  return content.replaceAll(/(['"])@\//g, `$1${prefix}/`)
}

/*
 * the lock hashes what was written, not what the registry sent. an alias of its own
 * and the client directive both change the file.
 */
function transform(content: string, prefix: string, client: boolean) {
  const retargeted = retarget(content, prefix)
  if (!client || retargeted.startsWith("'use") || retargeted.startsWith('"use')) return retargeted
  return CLIENT_DIRECTIVE + retargeted
}

async function statusOf(path: string, base: string | undefined, overwrite: boolean): Promise<FileStatus> {
  if (overwrite || !exists(path)) return 'written'
  if (base === undefined) return 'kept'

  const current = hash(await readFile(path, 'utf8'))
  return current === base ? 'written' : 'edited'
}

/*
 * a partial write would record a base that no file on disk came from, and the three
 * way merge reads that base as its truth.
 */
export async function applyItem(
  project: Project,
  item: RegistryItem,
  lock: Lockfile,
  overwrite: boolean,
): Promise<readonly AppliedFile[]> {
  const base = new Map(lock.items[item.name]?.files.map((file) => [file.path, file.hash]) ?? [])
  const client = new Map(item.sley.files.map((file) => [file.path, file.client === true]))
  const applied: AppliedFile[] = []
  const recorded: LockedFile[] = []

  for (const file of item.files) {
    const path = join(project.sourceDir, file.target)
    const shortPath = relative(project.cwd, path)
    const content = transform(file.content, project.aliasPrefix, project.rsc && client.get(file.target) === true)
    const status = await statusOf(path, base.get(shortPath), overwrite)

    if (status === 'written') {
      await write(path, content)
    }
    applied.push({ path: shortPath, status })
    recorded.push({ path: shortPath, hash: hash(content) })
  }

  if (applied.every((file) => file.status === 'written')) {
    lock.items[item.name] = { version: item.sley.version, url: item.sley.url, files: recorded }
  }
  return applied
}
