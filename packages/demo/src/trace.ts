export interface Sample {
  readonly at: Date
  readonly celsius: number
}

/* a fourteen hour run logging the flow cell once a second */
export const READINGS = 50_400
const START = Date.UTC(2026, 7, 6, 6, 0, 0)
const SETPOINT = 30

/* the same fixed wobble the quality fixture uses, so every render draws one shape */
function wobble(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43_758.5453
  return x - Math.floor(x)
}

/*
 * the cooler stalled for forty seconds and the flow cell came four degrees off its
 * setpoint. that is the same event as the methyl dip on 6 august and the R-4795 row in
 * the table, so the excursion is what the chart exists to show and not a shape.
 */
const STALL_AT = 26_000
const STALL_FOR = 40
const STALL_RISE = 4.1

function excursion(second: number) {
  const into = second - STALL_AT
  if (into < 0 || into > STALL_FOR) return 0
  /* up over the first quarter and down over the rest, so one second holds the peak */
  const climb = into / (STALL_FOR / 4)
  const fall = 1 - (into - STALL_FOR / 4) / (STALL_FOR * 0.75)
  return STALL_RISE * Math.min(climb, fall)
}

let built: readonly Sample[] | undefined

/*
 * the site ships one bundle, so a fixture built at module scope is built on every page.
 * fifty thousand dates cost about four milliseconds and one page in twenty six wants them.
 */
export function trace(): readonly Sample[] {
  built ??= Array.from({ length: READINGS }, (_, second) => {
    /* fifteen minutes of ramp before the run holds at the setpoint */
    const ramp = Math.min(1, second / 900)
    const ripple = Math.sin(second / 300) * 0.06
    const noise = (wobble(second) - 0.5) * 0.04
    const celsius = 21 + (SETPOINT - 21) * ramp + ripple + noise + excursion(second)
    return { at: new Date(START + second * 1000), celsius: Math.round(celsius * 100) / 100 }
  })
  return built
}
