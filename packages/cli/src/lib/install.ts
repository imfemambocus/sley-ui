import { spawnSync } from 'node:child_process'
import type { PackageManager } from './project.js'

const ADD: Record<PackageManager, readonly string[]> = {
  npm: ['install'],
  pnpm: ['add'],
  yarn: ['add'],
  bun: ['add'],
}

export function installPackages(cwd: string, manager: PackageManager, packages: readonly string[]) {
  if (packages.length === 0) return true

  const args = [...ADD[manager], ...packages]
  const result = spawnSync(manager, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' })
  return result.status === 0
}
