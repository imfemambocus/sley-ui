import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { after, before, test } from 'node:test'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const cli = resolve(here, '..', 'dist', 'index.js')
const registry = resolve(here, '..', '..', 'registry', 'dist', 'r')

/* every temporary project is removed by the exact name that made it */
const made = []

before(() => {
  assert.ok(existsSync(cli), `No CLI at ${cli}. Run npm run build -w sley-ui first.`)
  assert.ok(existsSync(registry), `No registry at ${registry}. Run npm run build -w @sley-ui/registry first.`)
})

after(async () => {
  for (const path of made) {
    await rm(path, { recursive: true, force: true })
  }
})

function sley(cwd, args) {
  return execFileSync(process.execPath, [cli, ...args, '--registry', registry, '--no-install'], {
    cwd,
    encoding: 'utf8',
  })
}

async function project(files) {
  const cwd = await mkdtemp(join(tmpdir(), 'sley-cli-'))
  made.push(cwd)
  for (const [path, content] of Object.entries(files)) {
    const full = join(cwd, path)
    await mkdir(dirname(full), { recursive: true })
    await writeFile(full, content)
  }
  return cwd
}

const TAILWIND = '@import "tailwindcss";\n'

/* a fresh vite template splits its options out and holds comments in the file */
function viteProject(prefix = '@') {
  return project({
    'package.json': JSON.stringify({ name: 'trial', devDependencies: { vite: '^8.0.0' } }),
    'tsconfig.json': '{ "files": [], "references": [{ "path": "./tsconfig.app.json" }] }',
    'tsconfig.app.json': `{
  "compilerOptions": {
    /* Bundler mode */
    "strict": true,${prefix === '@' ? '' : `\n    "paths": { "${prefix}/*": ["./src/*"] },`}
  }
}`,
    'vite.config.ts': "import { defineConfig } from 'vite'\n\nexport default defineConfig({\n  plugins: [],\n})\n",
    'src/index.css': TAILWIND,
  })
}

function nextProject() {
  return project({
    'package.json': JSON.stringify({ name: 'trial', dependencies: { next: '^16.0.0' } }),
    'tsconfig.json': '{ "compilerOptions": { "paths": { "@/*": ["./*"] } } }',
    'app/globals.css': TAILWIND,
  })
}

test('init writes the alias into both files a vite project resolves through', async () => {
  const cwd = await viteProject()
  sley(cwd, ['init'])

  const tsconfig = await readFile(join(cwd, 'tsconfig.app.json'), 'utf8')
  assert.match(tsconfig, /"@\/\*": \["\.\/src\/\*"\]/)
  assert.match(tsconfig, /Bundler mode/, 'the comments survive the edit')

  const vite = await readFile(join(cwd, 'vite.config.ts'), 'utf8')
  assert.match(vite, /resolve: \{/)
  assert.match(vite, /'@': fileURLToPath/)
})

test('init puts the token block in its own file and imports it once', async () => {
  const cwd = await viteProject()
  sley(cwd, ['init'])
  sley(cwd, ['init'])

  const css = await readFile(join(cwd, 'src/index.css'), 'utf8')
  const imports = css.split('\n').filter((line) => line.includes('tokens.css'))
  assert.equal(imports.length, 1, 'a second run adds no second import')
  assert.match(css, /^@import "tailwindcss";/, 'the tailwind import stays first')
  assert.ok(existsSync(join(cwd, 'src/styles/tokens.css')))
})

test('init reads the framework and records it in the config', async () => {
  const vite = await viteProject()
  sley(vite, ['init'])
  const viteConfig = JSON.parse(await readFile(join(vite, 'components.json'), 'utf8'))
  assert.equal(viteConfig.rsc, false)
  assert.equal(viteConfig.tailwind.css, 'src/index.css')

  const next = await nextProject()
  sley(next, ['init'])
  const nextConfig = JSON.parse(await readFile(join(next, 'components.json'), 'utf8'))
  assert.equal(nextConfig.rsc, true)
  assert.equal(nextConfig.tailwind.css, 'app/globals.css')
})

test('add writes a dependency before the item that imports it', async () => {
  const cwd = await viteProject()
  sley(cwd, ['init'])
  const output = sley(cwd, ['add', 'table'])

  assert.ok(output.indexOf('cx') < output.indexOf('table'), 'cx comes first')
  assert.ok(existsSync(join(cwd, 'src/lib/cx.ts')))
  assert.ok(existsSync(join(cwd, 'src/components/ui/checkbox/Checkbox.tsx')))
  assert.ok(existsSync(join(cwd, 'src/components/ui/table/Table.tsx')))
})

test('a client directive goes to a next project, and only to the files that need one', async () => {
  const next = await nextProject()
  sley(next, ['init'])
  sley(next, ['add', 'table'])
  assert.match(await readFile(join(next, 'components/ui/table/Table.tsx'), 'utf8'), /^'use client'/)
  assert.doesNotMatch(await readFile(join(next, 'components/ui/icons/Icons.tsx'), 'utf8'), /use client/)

  const vite = await viteProject()
  sley(vite, ['init'])
  sley(vite, ['add', 'table'])
  assert.doesNotMatch(await readFile(join(vite, 'src/components/ui/table/Table.tsx'), 'utf8'), /use client/)
})

test('a project on another prefix gets its imports moved', async () => {
  const cwd = await viteProject('~')
  sley(cwd, ['init'])
  sley(cwd, ['add', 'table'])

  const table = await readFile(join(cwd, 'src/components/ui/table/Table.tsx'), 'utf8')
  assert.match(table, /from '~\/lib\/cx'/)
  assert.doesNotMatch(table, /from '@\//)

  const config = JSON.parse(await readFile(join(cwd, 'components.json'), 'utf8'))
  assert.equal(config.aliases.ui, '~/components/ui')
})

test('the lockfile hashes the file on disk, so a second run reports no drift', async () => {
  const next = await nextProject()
  sley(next, ['init'])
  sley(next, ['add', 'table'])

  const lock = JSON.parse(await readFile(join(next, 'sley.lock'), 'utf8'))
  const entry = lock.items.table.files[0]
  assert.equal(entry.path, 'components/ui/table/Table.tsx')

  const disk = await readFile(join(next, 'components/ui/table/Table.tsx'), 'utf8')
  const { createHash } = await import('node:crypto')
  assert.equal(entry.hash, `sha256-${createHash('sha256').update(disk).digest('base64')}`)

  assert.doesNotMatch(sley(next, ['add', 'table']), /!/, 'nothing is marked as edited')
})

test('an edited file is kept until overwrite is asked for', async () => {
  const cwd = await viteProject()
  sley(cwd, ['init'])
  sley(cwd, ['add', 'table'])

  const path = join(cwd, 'src/components/ui/table/Table.tsx')
  const mine = `${await readFile(path, 'utf8')}\n/* mine */\n`
  await writeFile(path, mine)

  const kept = sley(cwd, ['add', 'table'])
  assert.match(kept, /! src\/components\/ui\/table\/Table\.tsx/)
  assert.equal(await readFile(path, 'utf8'), mine, 'the edit survives')

  sley(cwd, ['add', 'table', '--overwrite'])
  assert.notEqual(await readFile(path, 'utf8'), mine, 'overwrite replaces it')
})

test('add refuses to run before init', async () => {
  const cwd = await viteProject()
  assert.throws(() => sley(cwd, ['add', 'table']), /components\.json/)
})
