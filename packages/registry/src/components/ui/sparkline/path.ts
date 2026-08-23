/*
 * the box the path is built in. the svg is stretched to whatever the cell is worth and
 * the ratio is not preserved, so this is a coordinate space rather than a size.
 */
const BOX = { width: 100, height: 24 }

export const SPARK_VIEWBOX = `0 0 ${BOX.width} ${BOX.height}`

/* half a stroke sits outside the path it belongs to, and the viewport clips it at the frame */
const INSET = 2

function extent(values: readonly number[]): readonly [number, number] {
  let low = values[0]
  let high = values[0]

  for (const value of values) {
    if (value < low) low = value
    if (value > high) high = value
  }

  return [low, high]
}

/* a single reading has no run to draw across, and it leaves the box empty */
export function sparkPath(values: readonly number[], domain?: readonly [number, number]) {
  if (values.length < 2) return ''

  const [low, high] = domain ?? extent(values)
  const span = high - low
  const step = BOX.width / (values.length - 1)
  const field = BOX.height - INSET * 2

  /* a series that never moves has no extent to scale against, so it holds the middle */
  const y = (value: number) =>
    span === 0 ? BOX.height / 2 : BOX.height - INSET - ((value - low) / span) * field

  return values
    .map((value, index) => `${index === 0 ? 'M' : 'L'}${(index * step).toFixed(2)} ${y(value).toFixed(2)}`)
    .join('')
}
