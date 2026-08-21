import { join, relative } from 'node:path'
import { exists, readJsonc, writeJson } from './files.js'
import type { Library } from './project.js'

export const CONFIG = 'components.json'

export interface ComponentsConfig {
  readonly $schema: string
  readonly style: string
  readonly rsc: boolean
  readonly tsx: boolean
  readonly tailwind: {
    readonly config: string
    readonly css: string
    readonly baseColor: string
    readonly cssVariables: boolean
  }
  readonly aliases: {
    readonly components: string
    readonly ui: string
    readonly lib: string
    readonly utils: string
    readonly hooks: string
  }
}

export async function readConfig(cwd: string): Promise<ComponentsConfig | null> {
  const path = join(cwd, CONFIG)
  if (!exists(path)) return null
  return readJsonc<ComponentsConfig>(path)
}

interface ConfigInput {
  readonly cwd: string
  readonly prefix: string
  readonly cssEntry: string
  readonly rsc: boolean
  readonly library: Library
}

export async function writeConfig({ cwd, prefix, cssEntry, rsc, library }: ConfigInput) {
  const config: ComponentsConfig = {
    $schema: 'https://ui.shadcn.com/schema.json',
    /* shadcn's own cli validates this field against its list */
    style: 'new-york',
    rsc,
    tsx: library === 'react',
    tailwind: {
      config: '',
      css: relative(cwd, cssEntry).split('\\').join('/'),
      baseColor: 'neutral',
      cssVariables: true,
    },
    aliases: {
      components: `${prefix}/components`,
      ui: `${prefix}/components/ui`,
      lib: `${prefix}/lib`,
      utils: `${prefix}/lib/cx`,
      hooks: `${prefix}/hooks`,
    },
  }
  await writeJson(join(cwd, CONFIG), config)
  return config
}
