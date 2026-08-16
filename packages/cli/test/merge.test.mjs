import assert from 'node:assert/strict'
import { dirname, resolve } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const { merge } = await import(resolve(here, '..', 'dist', 'lib', 'merge.js'))

const LABEL = 'sley-ui 0.1.1'
const lines = (...rows) => `${rows.join('\n')}\n`

test('a side that did not move takes the change of the side that did', () => {
  const base = lines('a', 'b', 'c')
  const theirs = lines('a', 'B', 'c')

  const mineUntouched = merge(base, base, theirs, LABEL)
  assert.equal(mineUntouched.clean, true)
  assert.equal(mineUntouched.content, theirs)

  const theirsUntouched = merge(base, lines('a', 'mine', 'c'), base, LABEL)
  assert.equal(theirsUntouched.clean, true)
  assert.equal(theirsUntouched.content, lines('a', 'mine', 'c'))
})

test('two edits in different places both survive', () => {
  const base = lines('one', 'two', 'three', 'four', 'five')
  const mine = lines('ONE', 'two', 'three', 'four', 'five')
  const theirs = lines('one', 'two', 'three', 'four', 'FIVE')

  const result = merge(base, mine, theirs, LABEL)
  assert.equal(result.clean, true)
  assert.equal(result.content, lines('ONE', 'two', 'three', 'four', 'FIVE'))
})

test('the same edit on both sides is not a conflict', () => {
  const base = lines('a', 'b', 'c')
  const both = lines('a', 'shared', 'c')

  const result = merge(base, both, both, LABEL)
  assert.equal(result.clean, true)
  assert.equal(result.content, both)
})

test('two edits to one line conflict, and both versions are kept', () => {
  const base = lines('a', 'b', 'c')
  const mine = lines('a', 'mine', 'c')
  const theirs = lines('a', 'theirs', 'c')

  const result = merge(base, mine, theirs, LABEL)
  assert.equal(result.clean, false)
  assert.equal(result.conflicts, 1)
  assert.equal(result.content, lines('a', '<<<<<<< yours', 'mine', '=======', 'theirs', `>>>>>>> ${LABEL}`, 'c'))
})

test('an insert from each side at the same point conflicts', () => {
  const base = lines('a', 'b')
  const result = merge(base, lines('a', 'mine', 'b'), lines('a', 'theirs', 'b'), LABEL)

  assert.equal(result.clean, false)
  assert.equal(result.conflicts, 1)
})

test('a line one side deleted and the other kept is taken as the delete', () => {
  const base = lines('a', 'b', 'c')
  const result = merge(base, lines('a', 'c'), base, LABEL)

  assert.equal(result.clean, true)
  assert.equal(result.content, lines('a', 'c'))
})

test('an append from each side conflicts rather than being dropped', () => {
  const base = lines('a')
  const result = merge(base, lines('a', 'mine'), lines('a', 'theirs'), LABEL)

  assert.equal(result.clean, false)
  assert.match(result.content, /mine/)
  assert.match(result.content, /theirs/)
})

test('an empty base takes both sides as one conflict', () => {
  const result = merge('', 'mine\n', 'theirs\n', LABEL)
  assert.equal(result.clean, false)
})

test('a file nobody changed comes back unchanged', () => {
  const base = lines('a', 'b', 'c')
  const result = merge(base, base, base, LABEL)

  assert.equal(result.clean, true)
  assert.equal(result.content, base)
})
