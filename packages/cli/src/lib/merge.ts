export interface MergeResult {
  readonly clean: boolean
  readonly content: string
  readonly conflicts: number
}

/*
 * the longest common subsequence of two line arrays, as matched index pairs.
 * the table is O(n*m), which a source file of a few hundred lines pays for once.
 */
function matches(a: readonly string[], b: readonly string[]): Map<number, number> {
  const table: number[][] = Array.from({ length: a.length + 1 }, () => Array.from<number>({ length: b.length + 1 }).fill(0))
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      table[i][j] = a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1])
    }
  }

  const pairs = new Map<number, number>()
  let i = 0
  let j = 0
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      pairs.set(i, j)
      i++
      j++
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      i++
    } else {
      j++
    }
  }
  return pairs
}

const same = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every((line, n) => line === b[n])

interface Chunk {
  readonly base: readonly string[]
  readonly mine: readonly string[]
  readonly theirs: readonly string[]
}

/* one side that did not move loses to the side that did. the same edit on both sides is not a conflict. */
function resolve(chunk: Chunk, label: string) {
  if (same(chunk.mine, chunk.base)) return { lines: chunk.theirs, conflict: false }
  if (same(chunk.theirs, chunk.base)) return { lines: chunk.mine, conflict: false }
  if (same(chunk.mine, chunk.theirs)) return { lines: chunk.mine, conflict: false }
  return {
    lines: ['<<<<<<< yours', ...chunk.mine, '=======', ...chunk.theirs, `>>>>>>> ${label}`],
    conflict: true,
  }
}

/*
 * diff3 over lines. a sync point is a base line that both sides kept and that both
 * have reached, so the run between two sync points is what each side did to the same text.
 */
export function merge(baseText: string, mineText: string, theirsText: string, label: string): MergeResult {
  const base = baseText.split('\n')
  const mine = mineText.split('\n')
  const theirs = theirsText.split('\n')

  const mineOf = matches(base, mine)
  const theirsOf = matches(base, theirs)

  const out: string[] = []
  let conflicts = 0
  let bi = 0
  let mi = 0
  let ti = 0

  while (bi < base.length || mi < mine.length || ti < theirs.length) {
    if (bi < base.length && mineOf.get(bi) === mi && theirsOf.get(bi) === ti) {
      out.push(base[bi])
      bi++
      mi++
      ti++
      continue
    }

    let nb = base.length
    let nm = mine.length
    let nt = theirs.length
    for (let k = bi; k < base.length; k++) {
      const km = mineOf.get(k)
      const kt = theirsOf.get(k)
      if (km !== undefined && kt !== undefined && km >= mi && kt >= ti) {
        nb = k
        nm = km
        nt = kt
        break
      }
    }

    const resolved = resolve({ base: base.slice(bi, nb), mine: mine.slice(mi, nm), theirs: theirs.slice(ti, nt) }, label)
    out.push(...resolved.lines)
    if (resolved.conflict) conflicts++
    bi = nb
    mi = nm
    ti = nt
  }

  return { clean: conflicts === 0, content: out.join('\n'), conflicts }
}
