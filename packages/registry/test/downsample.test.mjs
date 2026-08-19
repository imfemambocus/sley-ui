import assert from 'node:assert/strict'
import { test } from 'node:test'
import { downsample } from '../src/components/ui/chart/downsample.ts'

const X = (point) => point.x
const Y = (point) => point.y

/* a smooth ramp with one spike, so a run that drops the spike is visible in the result */
function trace(count, spikeAt) {
  return Array.from({ length: count }, (_, i) => ({
    x: i,
    y: i === spikeAt ? 1000 : Math.sin(i / 40) * 10 + 50,
  }))
}

test('it returns exactly the target count', () => {
  assert.equal(downsample(trace(50_000, -1), X, Y, 1000).length, 1000)
  assert.equal(downsample(trace(9_137, -1), X, Y, 733).length, 733)
})

test('it keeps the first and the last point', () => {
  const rows = trace(50_000, -1)
  const kept = downsample(rows, X, Y, 1000)
  assert.equal(kept[0], rows[0])
  assert.equal(kept.at(-1), rows.at(-1))
})

test('it keeps the points in the order they arrived', () => {
  const kept = downsample(trace(20_000, -1), X, Y, 500)
  for (let i = 1; i < kept.length; i++) assert.ok(kept[i].x > kept[i - 1].x, `point ${i} went backwards`)
})

test('a lone spike survives the cut', () => {
  const spikeAt = 17_431
  const kept = downsample(trace(50_000, spikeAt), X, Y, 1000)
  assert.ok(
    kept.some((point) => point.x === spikeAt),
    'the widest triangle in its bucket is the spike, so it has to be chosen',
  )
})

test('every nth point would have missed that spike', () => {
  const spikeAt = 17_431
  const rows = trace(50_000, spikeAt)
  const nth = rows.filter((_, i) => i % 50 === 0)
  assert.ok(!nth.some((point) => point.x === spikeAt), 'the fixture puts the spike between two samples')
})

test('a series already under the target comes back untouched', () => {
  const rows = trace(400, -1)
  assert.equal(downsample(rows, X, Y, 1000), rows)
  assert.equal(downsample(rows, X, Y, 400), rows)
})

test('a target below three is refused rather than guessed at', () => {
  const rows = trace(400, -1)
  assert.equal(downsample(rows, X, Y, 2), rows)
})
