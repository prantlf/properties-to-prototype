import { ok, strictEqual } from 'node:assert'
import tehanu from 'tehanu'
import { parse } from 'meriyah'
import { generate } from 'astring'
import { updateClassDeclarations } from '../lib/index.js'

const test = tehanu(import.meta.filename)

test('keeps property by instance decorator', () => {
  const input = `
@propertiesToPrototype('model')
class Test {
  @instance
  defaults = {}
}
`
  const program = parse(input, { next: true })
  const { updated } = updateClassDeclarations(program, {
    ensureConstructorName: false
  })
  ok(updated)
  var actual = generate(program)
  const expected = `
class Test {
  defaults = {};
}
`
  strictEqual(actual.trim(), expected.trim())
})

test('keeps property by custom instance decorator', () => {
  const input = `
@propertiesToPrototype('model')
class Test {
  @keep
  defaults = {}
}
`
  const program = parse(input, { next: true })
  const { updated } = updateClassDeclarations(program, {
    instanceDecorator: 'keep',
    ensureConstructorName: false
  })
  ok(updated)
  var actual = generate(program)
  const expected = `
class Test {
  defaults = {};
}
`
  strictEqual(actual.trim(), expected.trim())
})

test('does not remove instance decorator if requested', () => {
  const input = `
@propertiesToPrototype('model')
class Test {
  @instance
  defaults = {}
}
`
  const program = parse(input, { next: true })
  const { updated } = updateClassDeclarations(program, {
    removeInstanceDecorator: false,
    ensureConstructorName: false
  })
  ok(updated)
  var actual = generate(program)
  const expected = `
class Test {
  defaults = {};
}
`
  strictEqual(actual.trim(), expected.trim())
})
