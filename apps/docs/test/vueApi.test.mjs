import assert from 'node:assert/strict'
import { test } from 'node:test'
import { toVueApi } from '../src/content/vueApi.ts'

const row = (name, type, detail = 'what it does') => ({ name, type, detail })

const names = (rows) => rows.map((entry) => entry.name)

test('className becomes class and nothing else moves', () => {
  const out = toVueApi([row('className', 'string'), row('variant', "'quiet'")])
  assert.deepEqual(names(out), ['class', 'variant'])
})

test('a spread of the native props becomes attribute fallthrough', () => {
  const out = toVueApi([row('...props', "ComponentPropsWithoutRef<'button'>")])
  assert.deepEqual(names(out), ['any native attribute'])
  assert.equal(out[0].type, 'fallthrough')
})

test('a controlled value and its callback collapse into one model', () => {
  const out = toVueApi([row('open', 'boolean'), row('onOpenChange', '(open: boolean) => void')])
  assert.deepEqual(names(out), ['v-model:open'])
  assert.match(out[0].detail, /separately/, 'the model row says how to split the pair')
})

/* the chart reports through onBrush, with no Change on the end of it */
test('a callback with no Change suffix still models its prop', () => {
  const out = toVueApi([row('brush', 'Range | null'), row('onBrush', '(range: Range | null) => void')])
  assert.deepEqual(names(out), ['v-model:brush'])
})

test('a callback with no matching prop stays an event', () => {
  const out = toVueApi([row('onSelectionChange', '(selected: ReadonlySet<string>) => void')])
  assert.deepEqual(names(out), ['@selection-change'])
})

test('a ReactNode is a slot, and children is the default one', () => {
  const out = toVueApi([row('children', 'ReactNode'), row('footer', 'ReactNode')])
  assert.deepEqual(names(out), ['default slot', '#footer'])
  assert.deepEqual(out.map((entry) => entry.type), ['slot', 'slot'])
})

test('required and detail survive every conversion', () => {
  const [converted] = toVueApi([{ name: 'children', type: 'ReactNode', required: true, detail: 'The body.' }])
  assert.equal(converted.required, true)
  assert.equal(converted.detail, 'The body.')
})
