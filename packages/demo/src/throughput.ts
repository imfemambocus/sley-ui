import { quality } from './quality'

export interface Output {
  readonly day: Date
  readonly assay: string
  readonly gb: number
}

/* the days come from the quality fixture, so the two charts cannot drift apart */
const DAYS: readonly Date[] = [...new Set(quality.map((reading) => reading.day.getTime()))]
  .sort((left, right) => left - right)
  .map((time) => new Date(time))

/* what each assay puts through on an ordinary day, in gigabases */
const BASE: Record<string, number> = { WGS: 42, Exome: 18, Methyl: 26 }

/* the same fixed wobble the other fixtures use, so every render draws one shape */
function wobble(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43_758.5453
  return x - Math.floor(x)
}

/* the run that failed on 6 august carried the day's methyl output down with it */
function stall(assay: string, offset: number) {
  return assay === 'Methyl' && offset === 6 ? 0.34 : 1
}

/* a working week, so the floor at the weekend is the shape and not the noise */
function week(day: Date) {
  const at = day.getUTCDay()
  return at === 0 || at === 6 ? 0.35 : 1
}

export const throughput: readonly Output[] = Object.keys(BASE).flatMap((assay, series) =>
  DAYS.map((day, index) => {
    const offset = DAYS.length - 1 - index
    const gb = BASE[assay] * week(day) * stall(assay, offset) * (0.82 + wobble(index + series * 40) * 0.36)
    return { day, assay, gb: Math.round(gb * 10) / 10 }
  }),
)
