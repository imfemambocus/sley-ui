/*
 * largest triangle three buckets. a line with more points than the frame has pixels
 * spends layout time on detail nobody can resolve, and taking every nth point flattens
 * a spike that falls in the gap. this keeps whichever point in a bucket makes the widest
 * triangle with the point already kept and the bucket ahead, which follows the shape of the
 * line. the extremes are not a guarantee: where a bucket boundary splits a peak, the peak
 * can lose to its own shoulder.
 */
export function downsample<T>(
  rows: readonly T[],
  x: (row: T) => number,
  y: (row: T) => number,
  target: number,
): readonly T[] {
  if (rows.length <= target || target < 3) return rows

  const last = rows.length - 1
  const every = (rows.length - 2) / (target - 2)
  const kept: T[] = [rows[0]]
  let anchor = 0

  for (let bucket = 0; bucket < target - 2; bucket++) {
    const start = Math.floor(bucket * every) + 1
    const end = Math.floor((bucket + 1) * every) + 1

    /* the bucket ahead stands in for its own points as one centre of mass */
    const aheadEnd = Math.min(Math.floor((bucket + 2) * every) + 1, rows.length)
    let aheadX = 0
    let aheadY = 0
    for (let i = end; i < aheadEnd; i++) {
      aheadX += x(rows[i])
      aheadY += y(rows[i])
    }
    aheadX /= aheadEnd - end
    aheadY /= aheadEnd - end

    const anchorX = x(rows[anchor])
    const anchorY = y(rows[anchor])
    let widest = -1
    let best = start

    for (let i = start; i < end; i++) {
      const area = Math.abs(
        (anchorX - aheadX) * (y(rows[i]) - anchorY) - (anchorX - x(rows[i])) * (aheadY - anchorY),
      )
      if (area > widest) {
        widest = area
        best = i
      }
    }
    kept.push(rows[best])
    anchor = best
  }

  kept.push(rows[last])
  return kept
}
