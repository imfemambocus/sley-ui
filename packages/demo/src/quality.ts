export interface Reading {
  readonly day: Date
  readonly assay: string
  readonly q30: number
}

/* the same line the table draws its reed under */
export const Q30_THRESHOLD = 80

const DAYS = 30
const LAST = Date.UTC(2026, 7, 12)
const DAY_MS = 86_400_000

const BASE: Record<string, number> = { WGS: 94.1, Exome: 95.2, Methyl: 91.6 }

/* a fixed wobble, so the chart draws one shape in every render and every screenshot */
function wobble(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43_758.5453
  return x - Math.floor(x)
}

/*
 * one methyl run fell to 78.4 on 6 august and the table holds that row, so the dip
 * here is the same event and not decoration.
 */
function dip(assay: string, offset: number) {
  return assay === 'Methyl' && offset === 6 ? -13.2 : 0
}

export const quality: readonly Reading[] = Object.keys(BASE).flatMap((assay, series) =>
  Array.from({ length: DAYS }, (_, index) => {
    const offset = DAYS - 1 - index
    return {
      day: new Date(LAST - offset * DAY_MS),
      assay,
      q30: Math.round((BASE[assay] + (wobble(index + series * 100) - 0.5) * 2.4 + dip(assay, offset)) * 10) / 10,
    }
  }),
)
