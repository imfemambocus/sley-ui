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

const made = []

before(() => {
  assert.ok(existsSync(cli), `No CLI at ${cli}. Run npm run build -w sley-ui first.`)
})

after(async () => {
  for (const path of made) {
    await rm(path, { recursive: true, force: true })
  }
})

const TOKENS = '@theme {\n  --color-warp: #0b0b12;\n}\n'
const WIDGET_TARGET = 'components/ui/widget/Widget.tsx'

function widget(lines) {
  return `import { cx } from '@/lib/cx'\n\nexport const Widget = () => (\n${lines.map((line) => `  ${line}`).join('\n')}\n)\n`
}

function item(name, version, target, content, type = 'registry:ui') {
  return JSON.stringify({
    name,
    type,
    title: name,
    dependencies: [],
    registryDependencies: [],
    files: [{ path: target, target, type, content }],
    sley: { version, url: `https://example.test/r/${version}/${name}.json`, files: [{ path: target, client: false }] },
  })
}

/* a registry directory holds the newest item at its root and every release under its own version */
async function registry(versions) {
  const dir = await mkdtemp(join(tmpdir(), 'sley-reg-'))
  made.push(dir)
  const newest = versions.at(-1)

  for (const { version, widget: body } of versions) {
    await mkdir(join(dir, version), { recursive: true })
    await writeFile(join(dir, version, 'tokens.json'), item('tokens', version, 'styles/tokens.css', TOKENS, 'registry:file'))
    await writeFile(join(dir, version, 'widget.json'), item('widget', version, WIDGET_TARGET, body))
  }
  await writeFile(join(dir, 'tokens.json'), item('tokens', newest.version, 'styles/tokens.css', TOKENS, 'registry:file'))
  await writeFile(join(dir, 'widget.json'), item('widget', newest.version, WIDGET_TARGET, newest.widget))
  return dir
}

async function project() {
  const cwd = await mkdtemp(join(tmpdir(), 'sley-upd-'))
  made.push(cwd)
  await mkdir(join(cwd, 'src'), { recursive: true })
  await writeFile(
    join(cwd, 'package.json'),
    JSON.stringify({ name: 'trial', dependencies: { react: '^19.0.0' }, devDependencies: { vite: '^8.0.0' } }),
  )
  await writeFile(join(cwd, 'tsconfig.json'), '{ "files": [], "references": [{ "path": "./tsconfig.app.json" }] }')
  await writeFile(join(cwd, 'tsconfig.app.json'), '{ "compilerOptions": { "strict": true } }')
  await writeFile(join(cwd, 'vite.config.ts'), "import { defineConfig } from 'vite'\n\nexport default defineConfig({\n  plugins: [],\n})\n")
  await writeFile(join(cwd, 'src/index.css'), '@import "tailwindcss";\n')
  return cwd
}

function sley(cwd, args, source) {
  return execFileSync(process.execPath, [cli, ...args, '--registry', source, '--no-install'], { cwd, encoding: 'utf8' })
}

const ONE = ['<div>one</div>']
const TWO = ['<div>two</div>']

/* both releases stay in the new directory, because an installed project reads its base from the old one */
function releases(next) {
  return registry([
    { version: '0.1.0', widget: widget(ONE) },
    { version: '0.1.1', widget: widget(next) },
  ])
}

async function installed(next) {
  const older = await registry([{ version: '0.1.0', widget: widget(ONE) }])
  const cwd = await project()
  sley(cwd, ['init'], older)
  sley(cwd, ['add', 'widget'], older)
  return { cwd, newer: await releases(next), path: join(cwd, 'src', WIDGET_TARGET) }
}

const lockOf = async (cwd) => JSON.parse(await readFile(join(cwd, 'sley.lock'), 'utf8'))

test('a file nobody edited takes the new version outright', async () => {
  const { cwd, newer, path } = await installed(TWO)

  const out = sley(cwd, ['update'], newer)
  assert.match(out, /widget 0\.1\.0 to 0\.1\.1/)
  assert.match(await readFile(path, 'utf8'), /two/)
  assert.equal((await lockOf(cwd)).items.widget.version, '0.1.1')
})

test('an edit outside the changed lines survives the update', async () => {
  const { cwd, newer, path } = await installed(TWO)
  const mine = `${await readFile(path, 'utf8')}\n// mine\n`
  await writeFile(path, mine)

  sley(cwd, ['update'], newer)
  const merged = await readFile(path, 'utf8')
  assert.match(merged, /two/, 'the registry change landed')
  assert.match(merged, /\/\/ mine/, 'my line survived')
  assert.equal((await lockOf(cwd)).items.widget.version, '0.1.1')
})

test('an edit to the same line refuses the item and leaves the file alone', async () => {
  const { cwd, newer, path } = await installed(TWO)
  const mine = widget(['<div>mine</div>'])
  await writeFile(path, mine)

  const out = sley(cwd, ['update'], newer)
  assert.match(out, /! src/)
  assert.match(out, /sley update --conflicts/)
  assert.equal(await readFile(path, 'utf8'), mine, 'the file is untouched')
  assert.equal((await lockOf(cwd)).items.widget.version, '0.1.0', 'the lock did not move')
})

test('--overwrite takes the release copy of a file you edited', async () => {
  const { cwd, newer, path } = await installed(TWO)
  await writeFile(path, widget(['<div>mine</div>']))

  const out = sley(cwd, ['update', '--overwrite'], newer)
  const written = await readFile(path, 'utf8')
  assert.match(written, /two/, 'the release landed')
  assert.doesNotMatch(written, /mine/, 'my edit was discarded, which is what the flag asks for')
  assert.doesNotMatch(written, /<<<<<<</, 'no markers, because nothing was merged')
  assert.match(out, /file\(s\) you had edited were replaced/)
  assert.equal((await lockOf(cwd)).items.widget.version, '0.1.1')
})

/* the flag discards an edit only where the release has something of its own to put there */
test('--overwrite leaves a file the release did not move alone', async () => {
  const { cwd, newer } = await installed(TWO)
  const tokens = join(cwd, 'src', 'styles', 'tokens.css')
  await writeFile(tokens, `${await readFile(tokens, 'utf8')}\n/* mine */\n`)

  sley(cwd, ['update', '--overwrite'], newer)
  assert.match(await readFile(tokens, 'utf8'), /\/\* mine \*\//, 'my edit survived')
  assert.equal((await lockOf(cwd)).items.widget.version, '0.1.1', 'the widget still moved')
})

test('--conflicts writes the markers and moves the lock with them', async () => {
  const { cwd, newer, path } = await installed(TWO)
  await writeFile(path, widget(['<div>mine</div>']))

  const out = sley(cwd, ['update', '--conflicts'], newer)
  const marked = await readFile(path, 'utf8')
  assert.match(marked, /<<<<<<< yours/)
  assert.match(marked, />>>>>>> sley-ui 0\.1\.1/)
  assert.match(out, /markers are in/)
  assert.equal((await lockOf(cwd)).items.widget.version, '0.1.1', 'the file was written, so the item moved')
})

/* the base has to advance with the markers, or a hand resolved file conflicts against 0.1.0 forever */
test('a conflict resolved by hand is current on the next run, and the edit survives', async () => {
  const { cwd, newer, path } = await installed(TWO)
  await writeFile(path, widget(['<div>mine</div>']))
  sley(cwd, ['update', '--conflicts'], newer)

  const marked = await readFile(path, 'utf8')
  await writeFile(path, marked.replace(/<<<<<<< yours\n|=======\n|>>>>>>> sley-ui 0\.1\.1\n/g, ''))

  const out = sley(cwd, ['update'], newer)
  assert.match(out, /Everything is current/)
  const resolved = await readFile(path, 'utf8')
  assert.match(resolved, /mine/, 'my line survived')
  assert.match(resolved, /two/, 'their line survived')
  assert.doesNotMatch(resolved, /<<<<<<</)
})

test('--dry-run reports the same work and writes nothing', async () => {
  const { cwd, newer, path } = await installed(TWO)
  const original = await readFile(path, 'utf8')

  const out = sley(cwd, ['update', '--dry-run'], newer)
  assert.match(out, /widget 0\.1\.0 to 0\.1\.1/)
  assert.match(out, /--dry-run/)
  assert.equal(await readFile(path, 'utf8'), original)
  assert.equal((await lockOf(cwd)).items.widget.version, '0.1.0')
})

test('a registry that did not move reports everything as current', async () => {
  const older = await registry([{ version: '0.1.0', widget: widget(ONE) }])
  const cwd = await project()
  sley(cwd, ['init'], older)
  sley(cwd, ['add', 'widget'], older)

  const out = sley(cwd, ['update'], older)
  assert.match(out, /Everything is current/)
})

test('update refuses a component that is not installed', async () => {
  const { cwd, newer } = await installed(TWO)
  assert.throws(() => sley(cwd, ['update', 'nothing'], newer), /Not installed/)
})

test('a second update after a clean merge has nothing left to do', async () => {
  const { cwd, newer, path } = await installed(TWO)
  await writeFile(path, `${await readFile(path, 'utf8')}\n// mine\n`)

  sley(cwd, ['update'], newer)
  const out = sley(cwd, ['update'], newer)
  assert.match(out, /Everything is current/)
})
