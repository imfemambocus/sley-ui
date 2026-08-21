#!/usr/bin/env node
import { readFile } from 'node:fs/promises'
import { parseArgs } from 'node:util'
import { add } from './commands/add.js'
import { init } from './commands/init.js'
import { update, type UpdateStatus, type UpdatedItem } from './commands/update.js'
import type { AppliedFile } from './lib/apply.js'
import { parseJsonc } from './lib/files.js'

const DEFAULT_REGISTRY = 'https://sley-ui.dev/r'

const HELP = `sley - add Sley UI components to your project

Usage
  sley init [options]
  sley add <component>... [options]
  sley update [component]... [options]

Options
  --cwd <dir>          the project directory. the default is the current one
  --framework <name>   react or vue. the default is read from your dependencies
  --registry <source>  a url or a directory. the default is ${DEFAULT_REGISTRY}
  --overwrite          replace a file that you edited
  --conflicts          on update, write the conflict markers into the file
  --dry-run            on update, report what would change and write nothing
  --no-install         do not install the npm dependencies
  --version            print the version
  --help               print this text
`

const MARK: Record<AppliedFile['status'], string> = {
  written: '  +',
  kept: '  =',
  edited: '  !',
}

function report(files: readonly AppliedFile[]) {
  for (const file of files) {
    console.log(`${MARK[file.status]} ${file.path}`)
  }
}

const UPDATE_MARK: Record<UpdateStatus, string> = {
  updated: '  +',
  merged: '  ~',
  conflicted: '  !',
  kept: '  =',
  added: '  +',
  missing: '  ?',
  dropped: '  -',
}

const pathsWhere = (items: readonly UpdatedItem[], status: UpdateStatus) =>
  items.flatMap((item) => item.files.filter((file) => file.status === status).map((file) => file.path))

function warnConflicted(items: readonly UpdatedItem[]) {
  const held = items.filter((item) => !item.applied)
  const marked = pathsWhere(items.filter((item) => item.applied), 'conflicted')

  if (marked.length > 0) {
    console.log(`\nThe conflict markers are in: ${marked.join(', ')}. Resolve them before you build.`)
  }
  if (held.length === 0) return

  const undecided = pathsWhere(held, 'conflicted')
  const missing = pathsWhere(held, 'missing')

  console.log(`\n${held.length} item(s) were not updated, and their lock entries did not move.`)
  if (undecided.length > 0) {
    console.log(`These files need a merge you have to decide: ${undecided.join(', ')}. Run sley update --conflicts to get the markers.`)
  }
  if (missing.length > 0) console.log(`These files are gone from the project: ${missing.join(', ')}.`)
}

function warnEdited(files: readonly AppliedFile[]) {
  const edited = files.filter((file) => file.status === 'edited')
  if (edited.length === 0) return
  console.log(`\n${edited.length} file(s) marked ! differ from the version you installed. Pass --overwrite to replace them.`)
}

async function version() {
  const text = await readFile(new URL('../package.json', import.meta.url), 'utf8')
  return parseJsonc<{ version: string }>(text).version
}

async function main() {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    allowPositionals: true,
    options: {
      cwd: { type: 'string' },
      framework: { type: 'string' },
      registry: { type: 'string' },
      overwrite: { type: 'boolean', default: false },
      conflicts: { type: 'boolean', default: false },
      'dry-run': { type: 'boolean', default: false },
      'no-install': { type: 'boolean', default: false },
      version: { type: 'boolean', default: false },
      help: { type: 'boolean', default: false },
    },
  })

  if (values.version) {
    console.log(await version())
    return
  }

  const [command, ...names] = positionals
  if (values.help || command === undefined) {
    console.log(HELP)
    return
  }

  const options = {
    cwd: values.cwd ?? process.cwd(),
    framework: values.framework,
    registry: values.registry ?? DEFAULT_REGISTRY,
    overwrite: values.overwrite,
    install: !values['no-install'],
    conflicts: values.conflicts,
    dryRun: values['dry-run'],
  }

  if (command === 'init') {
    const result = await init(options)
    console.log(`Found a ${result.project.framework} project on ${result.project.library}.`)
    for (const note of result.notes) {
      console.log(`  ${note}`)
    }
    report(result.applied)
    if (result.linked) console.log(`  ~ ${result.config.tailwind.css}`)
    console.log(`  + components.json\n  + sley.lock\n\nNow run: sley add table`)
    warnEdited(result.applied)
    return
  }

  if (command === 'add') {
    const result = await add(names, options)
    console.log(`Reading the ${result.library} components.`)
    for (const item of result.added) {
      console.log(item.name)
      report(item.files)
    }
    if (result.packages.length > 0) {
      const line = result.packages.join(' ')
      console.log(result.installed ? `\nInstalled ${line}.` : `\nInstall these yourself: ${line}`)
    }
    warnEdited(result.added.flatMap((item) => item.files))
    return
  }

  if (command === 'update') {
    const result = await update(names, options)
    for (const item of result.updated) {
      console.log(item.from === null ? `${item.name} ${item.to}, new` : `${item.name} ${item.from} to ${item.to}`)
      for (const file of item.files) {
        console.log(`${UPDATE_MARK[file.status]} ${file.path}`)
      }
    }
    if (result.updated.length === 0) console.log(`Everything is current. ${result.current} item(s) checked.`)
    if (result.packages.length > 0) {
      const line = result.packages.join(' ')
      console.log(result.installed ? `\nInstalled ${line}.` : `\nInstall these yourself: ${line}`)
    }
    warnConflicted(result.updated)
    if (options.dryRun) console.log('\nNothing was written, because of --dry-run.')
    return
  }

  throw new Error(`Unknown command: ${command}. Run sley --help.`)
}

try {
  await main()
} catch (error) {
  console.error(`sley: ${error instanceof Error ? error.message : String(error)}`)
  process.exitCode = 1
}
