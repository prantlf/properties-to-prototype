import { ok, strictEqual } from 'node:assert'
import tehanu from 'tehanu'
import { parse } from 'meriyah'
import { generate } from 'astring'
import { updateClassDeclarations } from '../lib/index.js'

const test = tehanu(import.meta.filename)

test('moves property by class decorator', () => {
  const input = `
@propertiesToPrototype('model')
class Test {
  defaults = {}
}
`
  const program = parse(input, { next: true })
  const { updated } = updateClassDeclarations(program, {
    prototypeProperties: {
      model: ['defaults']
    },
    ensureConstructorName: false
  })
  ok(updated)
  const actual = generate(program)
  const expected = `
class Test {}
Object.assign(Test.prototype, {
  defaults: {}
});
`
  strictEqual(actual.trim(), expected.trim())
})

test('moves property by class decorator', () => {
  const input = `
@moveProperties('model')
class Test {
  defaults = {}
}
`
  const program = parse(input, { next: true })
  const { updated } = updateClassDeclarations(program, {
    prototypeProperties: {
      model: ['defaults']
    },
    classDecorator: 'moveProperties',
    ensureConstructorName: false
  })
  ok(updated)
  const actual = generate(program)
  const expected = `
class Test {}
Object.assign(Test.prototype, {
  defaults: {}
});
`
  strictEqual(actual.trim(), expected.trim())
})

test('does not remove class decorator if requested', () => {
  const input = `
@propertiesToPrototype()
class Test {}
`
  const program = parse(input, { next: true })
  const { updated } = updateClassDeclarations(program, {
    removeClassDecorator: false,
    ensureConstructorName: false
  })
  ok(!updated)
  const actual = generate(program)
  const expected = `
class Test {}
`
  strictEqual(actual.trim(), expected.trim())
})

test('moves property by alternative class type', () => {
  const input = `
@propertiesToPrototype('model')
class Test {
  defaults = {}
  shared = []
}
`
  const program = parse(input, { next: true })
  const { updated } = updateClassDeclarations(program, {
    prototypeProperties: {
      model: ['defaults']
    },
    alternativePrototypeProperties: {
      model: ['shared']
    },
    ensureConstructorName: false
  })
  ok(updated)
  const actual = generate(program)
  const expected = `
class Test {
  defaults = {};
}
Object.assign(Test.prototype, {
  shared: []
});
`
  strictEqual(actual.trim(), expected.trim())
})

test('moves property by matching additional class type', () => {
  const input = `
@propertiesToPrototype('model')
class Test {
  defaults = {}
  shared = []
}
`
  const program = parse(input, { next: true })
  const { updated } = updateClassDeclarations(program, {
    prototypeProperties: {
      model: ['defaults']
    },
    additionalPrototypeProperties: {
      model: ['shared']
    },
    ensureConstructorName: false
  })
  ok(updated)
  const actual = generate(program)
  const expected = `
class Test {}
Object.assign(Test.prototype, {
  defaults: {},
  shared: []
});
`
  strictEqual(actual.trim(), expected.trim())
})

test('moves property by different additional class type', () => {
  const input = `
@propertiesToPrototype()
class Test {
  defaults = {}
  shared = []
}
`
  const program = parse(input, { next: true })
  const { updated } = updateClassDeclarations(program, {
    additionalPrototypeProperties: {
      other: ['shared']
    },
    ensureConstructorName: false
  })
  ok(updated)
  const actual = generate(program)
  const expected = `
class Test {
  defaults = {};
}
Object.assign(Test.prototype, {
  shared: []
});
`
  strictEqual(actual.trim(), expected.trim())
})

test('moves property by default class type', () => {
  const input = `
@propertiesToPrototype
class Test {
  shared = []
}
`
  const program = parse(input, { next: true })
  const { updated } = updateClassDeclarations(program, {
    prototypeProperties: {
      other: ['shared']
    },
    ensureConstructorName: false
  })
  ok(updated)
  const actual = generate(program)
  const expected = `
class Test {}
Object.assign(Test.prototype, {
  shared: []
});
`
  strictEqual(actual.trim(), expected.trim())
})
