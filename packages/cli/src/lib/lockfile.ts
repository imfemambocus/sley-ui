import { join } from 'node:path'
import { exists, readJsonc, writeJson } from './files.js'

export const LOCKFILE = 'sley.lock'

export interface LockedFile {
  readonly path: string
  readonly hash: string
}

export interface LockedItem {
  readonly version: string
  readonly url: string
  readonly files: readonly LockedFile[]
}

export interface Lockfile {
  version: number
  registry: string
  items: Record<string, LockedItem>
}

/* the hash written here is the base of the three way merge in a later release */
export async function readLockfile(cwd: string, registry: string): Promise<Lockfile> {
  const path = join(cwd, LOCKFILE)
  if (!exists(path)) return { version: 1, registry, items: {} }
  return readJsonc<Lockfile>(path)
}

export async function writeLockfile(cwd: string, lock: Lockfile) {
  await writeJson(join(cwd, LOCKFILE), lock)
}
