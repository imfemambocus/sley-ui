import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname } from 'node:path'

/*
 * a tsconfig from a fresh vite template holds comments, and JSON.parse refuses
 * them. the scanner tracks whether it is inside a string, so a `//` in a url
 * survives.
 */
function stripComments(text: string) {
  let out = ''
  let inString = false
  let inLine = false
  let inBlock = false

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    const next = text[i + 1]

    if (inLine) {
      if (char === '\n') {
        inLine = false
        out += char
      }
      continue
    }
    if (inBlock) {
      if (char === '*' && next === '/') {
        inBlock = false
        i += 1
      }
      continue
    }
    if (inString) {
      out += char
      if (char === '\\') {
        out += next ?? ''
        i += 1
      } else if (char === '"') {
        inString = false
      }
      continue
    }
    if (char === '"') {
      inString = true
      out += char
      continue
    }
    if (char === '/' && next === '/') {
      inLine = true
      i += 1
      continue
    }
    if (char === '/' && next === '*') {
      inBlock = true
      i += 1
      continue
    }
    out += char
  }

  return out
}

function stripTrailingCommas(text: string) {
  let out = ''
  let inString = false

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]

    if (inString) {
      out += char
      if (char === '\\') {
        out += text[i + 1] ?? ''
        i += 1
      } else if (char === '"') {
        inString = false
      }
      continue
    }
    if (char === '"') {
      inString = true
      out += char
      continue
    }
    if (char === ',') {
      const rest = text.slice(i + 1)
      const nextChar = rest.trimStart()[0]
      if (nextChar === '}' || nextChar === ']') continue
    }
    out += char
  }

  return out
}

/*
 * a parse cannot know the shape of what it reads, so the claim stays here and the
 * callers own it. every file this reads belongs to the user's project.
 */
// oxlint-disable-next-line typescript/no-unnecessary-type-parameters
export function parseJsonc<T>(text: string): T {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  return JSON.parse(stripTrailingCommas(stripComments(text))) as T
}

export async function readJsonc<T>(path: string): Promise<T> {
  return parseJsonc<T>(await readFile(path, 'utf8'))
}

export async function writeJson(path: string, value: unknown) {
  await write(path, `${JSON.stringify(value, null, 2)}\n`)
}

export async function write(path: string, content: string) {
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, content)
}

export function exists(path: string) {
  return existsSync(path)
}

/* the same shape the registry build writes, so the two can be compared directly */
export function hash(content: string) {
  return `sha256-${createHash('sha256').update(content).digest('base64')}`
}
