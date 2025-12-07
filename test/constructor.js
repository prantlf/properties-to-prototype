import { ok, strictEqual } from 'node:assert'
import tehanu from 'tehanu'
import { parse } from 'meriyah'
import { generate } from 'astring'
import { updateClassDeclarations } from '../lib/index.js'

const test = tehanu(import.meta.filename)

test('sets constructor name by default', () => {
  const input = `
class Test {}
`
  const program = parse(input, { next: true })
  const { updated } = updateClassDeclarations(program)
  ok(updated)
  var actual = generate(program)
  const expected = `
class Test {}
Object.defineProperty(Test.prototype.constructor, "name", {
  value: "Test"
});
`
  strictEqual(actual.trim(), expected.trim())
})

test('does not set constructor name again', () => {
  const input = `
class Test {}
Object.defineProperty(Test.prototype.constructor, 'name', {
  value: 'Test'
})
`
  const program = parse(input, { next: true })
  const { updated } = updateClassDeclarations(program)
  ok(!updated)
  var actual = generate(program)
  const expected = `
class Test {}
Object.defineProperty(Test.prototype.constructor, "name", {
  value: "Test"
});
`
  strictEqual(actual.trim(), expected.trim())
})

test('does not set constructor name if requested', () => {
  const input = `
class Test {}
`
  const program = parse(input, { next: true })
  const { updated } = updateClassDeclarations(program, {
    ensureConstructorName: false
  })
  ok(!updated)
  var actual = generate(program)
  strictEqual(actual.trim(), input.trim())
})

test('replaces constructor name if requested', () => {
  const input = `
class Test {}
Object.defineProperty(Test.prototype.constructor, 'name', {
  value: 'OtherTest'
})
`
  const program = parse(input, { next: true })
  const { updated } = updateClassDeclarations(program, {
    replaceConstructorName: true
  })
  ok(updated)
  var actual = generate(program)
  const expected = `
class Test {}
Object.defineProperty(Test.prototype.constructor, "name", {
  value: "Test"
});
`
  strictEqual(actual.trim(), expected.trim())
})
