/* the fragment lengths one library prep left behind, in base pairs */
export const FRAGMENTS = 40_000

/* the same fixed wobble the other fixtures use, so every render draws one shape */
function wobble(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43_758.5453
  return x - Math.floor(x)
}

/* box muller over that wobble, which gives the peaks a tail instead of an edge */
function normal(seed: number) {
  const u = Math.max(wobble(seed), 1e-9)
  const v = wobble(seed + 101)
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

const MAIN = { centre: 328, sd: 62 }

/*
 * an adapter dimer is two adapters ligated to each other with no fragment in between, so
 * every one of them comes out within a few bases of the same length. this is the run that
 * read 78.4 on 6 august, R-4795 in the table, and the spike is why that dip is there.
 */
export const DIMER = { centre: 132, sd: 9 }
const DIMER_SHARE = 0.18

/* the frame holds still whatever the bin width does, so the axis is declared and not derived */
export const SPAN: readonly [number, number] = [60, 600]

let built: readonly number[] | undefined

/* forty thousand fragments cost about a millisecond, and one page in twenty seven wants them */
export function inserts(): readonly number[] {
  built ??= Array.from({ length: FRAGMENTS }, (_, index) => {
    const peak = wobble(index * 3) < DIMER_SHARE ? DIMER : MAIN
    const bp = peak.centre + normal(index) * peak.sd
    return Math.max(SPAN[0], Math.min(SPAN[1], Math.round(bp)))
  })
  return built
}
