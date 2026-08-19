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

/* the frame holds still when a series is hidden, so a brushed window stays where it was */
export const SPAN: readonly [Date, Date] = [quality[0].day, quality[quality.length - 1].day]

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function dayLabel(date: Date) {
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]}`
}

/*
 * an axis tick falls on midnight, and a key press lands the edge within a millisecond of
 * one, on either side of it. the second decides the day, so an edge a millisecond short
 * of a boundary reads as the day it was reaching for.
 */
function toSecond(date: Date) {
  return new Date(Math.round(date.getTime() / 1000) * 1000)
}

/*
 * a reading is a whole day, so a window that ends mid afternoon would drop runs the
 * label says it holds. both edges are pushed out to the day they land in.
 */
export function snapToDays(range: readonly [Date, Date]): readonly [Date, Date] {
  const from = toSecond(range[0])
  from.setUTCHours(0, 0, 0, 0)
  const to = toSecond(range[1])
  to.setUTCHours(23, 59, 59, 999)
  return [from, to]
}

/* the run stamps carry no zone, and the readings are UTC days, so both are read as UTC */
export function withinRange(started: string, range: readonly [Date, Date] | null) {
  if (!range) return true
  const at = Date.parse(`${started}Z`)
  return at >= range[0].getTime() && at <= range[1].getTime()
}
