#!/usr/bin/env node
import { readFile } from 'node:fs/promises'
import { parseArgs } from 'node:util'
import { add } from './commands/add.js'
import { init } from './commands/init.js'
import type { AppliedFile } from './lib/apply.js'
import { parseJsonc } from './lib/files.js'

const DEFAULT_REGISTRY = 'https://sley-ui.dev/r'

const HELP = `sley - add Sley UI components to your project

Usage
  sley init [options]
  sley add <component>... [options]

Options
  --cwd <dir>          the project directory. the default is the current one
  --registry <source>  a url or a directory. the default is ${DEFAULT_REGISTRY}
  --overwrite          replace a file that you edited
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
      registry: { type: 'string' },
      overwrite: { type: 'boolean', default: false },
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
    registry: values.registry ?? DEFAULT_REGISTRY,
    overwrite: values.overwrite,
    install: !values['no-install'],
  }

  if (command === 'init') {
    const result = await init(options)
    console.log(`Found a ${result.project.framework} project.`)
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

  throw new Error(`Unknown command: ${command}. Run sley --help.`)
}

try {
  await main()
} catch (error) {
  console.error(`sley: ${error instanceof Error ? error.message : String(error)}`)
  process.exitCode = 1
}
