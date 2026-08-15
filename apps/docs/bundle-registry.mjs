import { cp, stat } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/* the site and the registry are one deployment, and `/r/` is the path BASE names */
const root = dirname(fileURLToPath(import.meta.url))
const source = join(root, '..', '..', 'packages', 'registry', 'dist', 'r')
const target = join(root, 'dist', 'r')

try {
  await stat(source)
} catch {
  throw new Error(`No registry at ${source}. Run npm run build -w @sley-ui/registry first.`)
}

await cp(source, target, { recursive: true })
console.log(`copied the registry to ${target}`)
