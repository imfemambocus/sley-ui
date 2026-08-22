import { spawnSync } from 'node:child_process'
import type { PackageManager } from './project.js'

const ADD: Record<PackageManager, readonly string[]> = {
  npm: ['install'],
  pnpm: ['add'],
  yarn: ['add'],
  bun: ['add'],
}

/*
 * windows runs the manager through cmd.exe, npm and pnpm being batch files there,
 * and cmd reads a bare ^ as its escape character. an unquoted caret range then
 * reaches the manager as an exact version and installs the floor of the range.
 * a package spec carries no double quote, so wrapping it is safe.
 */
export function installPackages(cwd: string, manager: PackageManager, packages: readonly string[]) {
  if (packages.length === 0) return true

  const shell = process.platform === 'win32'
  const specs = shell ? packages.map((spec) => `"${spec}"`) : packages
  const result = spawnSync(manager, [...ADD[manager], ...specs], { cwd, stdio: 'inherit', shell })
  return result.status === 0
}
