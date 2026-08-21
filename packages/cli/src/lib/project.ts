import { readdir, readFile } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { exists, readJsonc, write } from './files.js'

export type Framework = 'next' | 'vite'
export type Library = 'react' | 'vue'
export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun'

export const LIBRARIES: readonly Library[] = ['react', 'vue']

export interface Project {
  readonly cwd: string
  readonly framework: Framework
  /* the registry serves one tree of components for each of these */
  readonly library: Library
  readonly tsconfigPath: string
  readonly aliasPrefix: string
  readonly sourceDir: string
  readonly cssEntry: string
  readonly packageManager: PackageManager
  /* a react server component takes no hook. the writer adds a directive. */
  readonly rsc: boolean
}

interface PackageJson {
  readonly dependencies?: Record<string, string>
  readonly devDependencies?: Record<string, string>
}

interface Tsconfig {
  readonly compilerOptions?: { readonly paths?: Record<string, string[]> }
}

const SKIP = new Set(['node_modules', 'dist', 'build', '.next', '.git', '.turbo'])

const LOCKFILES: readonly (readonly [string, PackageManager])[] = [
  ['pnpm-lock.yaml', 'pnpm'],
  ['yarn.lock', 'yarn'],
  ['bun.lockb', 'bun'],
  ['package-lock.json', 'npm'],
]

async function readDependencies(cwd: string) {
  const path = join(cwd, 'package.json')
  if (!exists(path)) throw new Error(`No package.json in ${cwd}. Run this in a project directory.`)

  const pkg = await readJsonc<PackageJson>(path)
  return { ...pkg.dependencies, ...pkg.devDependencies }
}

export async function detectFramework(cwd: string): Promise<Framework> {
  const deps = await readDependencies(cwd)
  if (deps.next) return 'next'
  if (deps.vite) return 'vite'
  throw new Error('No supported framework found. Sley UI knows Next and Vite.')
}

function isLibrary(name: string): name is Library {
  return name === 'react' || name === 'vue'
}

/* a project holding both has to say which tree it wants */
export async function detectLibrary(cwd: string, chosen?: string): Promise<Library> {
  if (chosen !== undefined) {
    if (isLibrary(chosen)) return chosen
    throw new Error(`Unknown framework: ${chosen}. Pass ${LIBRARIES.join(' or ')}.`)
  }

  const deps = await readDependencies(cwd)
  if (deps.react && deps.vue) {
    throw new Error('This project holds react and vue. Pass --framework react or --framework vue.')
  }
  if (deps.vue) return 'vue'
  if (deps.react) return 'react'
  throw new Error('No supported framework found. Sley UI knows React and Vue.')
}

export function detectPackageManager(cwd: string): PackageManager {
  const found = LOCKFILES.find(([file]) => exists(join(cwd, file)))
  return found ? found[1] : 'npm'
}

/*
 * a fresh vite template splits its options into tsconfig.app.json and leaves only
 * references in the root file. the alias belongs wherever compilerOptions is.
 */
export async function findTsconfig(cwd: string) {
  for (const name of ['tsconfig.app.json', 'tsconfig.json']) {
    const path = join(cwd, name)
    if (!exists(path)) continue
    const config = await readJsonc<Tsconfig>(path)
    if (config.compilerOptions) return path
  }
  throw new Error('No tsconfig.json with compilerOptions found.')
}

interface Alias {
  readonly prefix: string
  readonly dir: string
}

export async function readAlias(tsconfigPath: string): Promise<Alias | null> {
  const config = await readJsonc<Tsconfig>(tsconfigPath)
  const paths = config.compilerOptions?.paths
  if (!paths) return null

  for (const [key, targets] of Object.entries(paths)) {
    const target = targets[0]
    if (!key.endsWith('/*') || !target?.endsWith('/*')) continue
    return {
      prefix: key.slice(0, -2),
      dir: resolve(dirname(tsconfigPath), target.slice(0, -2)),
    }
  }
  return null
}

/* the file keeps its comments, so the key goes in as text */
export async function writeAlias(tsconfigPath: string, sourceDir: string) {
  const text = await readFile(tsconfigPath, 'utf8')
  const anchor = text.indexOf('"compilerOptions"')
  if (anchor === -1) throw new Error(`No compilerOptions in ${tsconfigPath}.`)

  const brace = text.indexOf('{', anchor)
  if (brace === -1) throw new Error(`No compilerOptions block in ${tsconfigPath}.`)

  const target = relative(dirname(tsconfigPath), sourceDir).split('\\').join('/')
  const block = `\n    "paths": {\n      "@/*": ["./${target}/*"]\n    },`
  await write(tsconfigPath, text.slice(0, brace + 1) + block + text.slice(brace + 1))
}

/* vite resolves an alias through its own config. the tsconfig alone fails at run time. */
export async function writeViteAlias(cwd: string, sourceDir: string, prefix: string) {
  const path = ['vite.config.ts', 'vite.config.js', 'vite.config.mts'].map((name) => join(cwd, name)).find(exists)
  if (!path) return { done: false, path: join(cwd, 'vite.config.ts') }

  const text = await readFile(path, 'utf8')
  if (text.includes('resolve:')) return { done: false, path }

  const anchor = text.indexOf('defineConfig({')
  if (anchor === -1) return { done: false, path }

  const brace = text.indexOf('{', anchor)
  const target = relative(cwd, sourceDir).split('\\').join('/')
  const block = `\n  resolve: {\n    alias: {\n      '${prefix}': fileURLToPath(new URL('./${target}', import.meta.url)),\n    },\n  },`
  const withAlias = text.slice(0, brace + 1) + block + text.slice(brace + 1)
  const withImport = `import { fileURLToPath } from 'node:url'\n${withAlias}`
  await write(path, withImport)
  return { done: true, path }
}

async function walkCss(dir: string, depth: number): Promise<string[]> {
  if (depth === 0) return []
  const entries = await readdir(dir, { withFileTypes: true })
  const found: string[] = []
  for (const entry of entries) {
    if (SKIP.has(entry.name)) continue
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      found.push(...(await walkCss(path, depth - 1)))
    } else if (entry.name.endsWith('.css')) {
      found.push(path)
    }
  }
  return found
}

interface ProjectInput {
  readonly cwd: string
  readonly cssEntry: string
  readonly rsc: boolean
  readonly library: Library
}

export async function resolveProject({ cwd, cssEntry, rsc, library }: ProjectInput): Promise<Project> {
  const tsconfigPath = await findTsconfig(cwd)
  const alias = await readAlias(tsconfigPath)
  if (!alias) throw new Error(`No path alias in ${tsconfigPath}. Run sley init first.`)

  return {
    cwd,
    framework: await detectFramework(cwd),
    library,
    tsconfigPath,
    aliasPrefix: alias.prefix,
    sourceDir: alias.dir,
    cssEntry,
    packageManager: detectPackageManager(cwd),
    rsc,
  }
}

export async function findCssEntry(cwd: string) {
  const candidates = await walkCss(cwd, 4)
  for (const path of candidates) {
    const text = await readFile(path, 'utf8')
    if (text.includes('tailwindcss')) return path
  }
  throw new Error('No stylesheet imports tailwindcss. Sley UI needs Tailwind CSS v4.')
}
