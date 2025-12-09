import { ok, strictEqual } from 'node:assert'
import tehanu from 'tehanu'
import { parse } from 'meriyah'
import { generate } from 'astring'
import { updateClassDeclarations } from '../lib/index.js'

const test = tehanu(import.meta.filename)

test('moves property by string class type', () => {
  const input = `
class Test {
  defaults = {}
}
`
  const program = parse(input, { next: true })
  const { updated } = updateClassDeclarations(program, {
    prototypeProperties: {
      model: ['defaults']
    },
    classTypes: {
      model: [
        'Test'
      ]
    },
    ensureConstructorName: false
  })
  ok(updated)
  var actual = generate(program)
  const expected = `
class Test {}
Object.assign(Test.prototype, {
  defaults: {}
});
`
  strictEqual(actual.trim(), expected.trim())
})

test('does not move property by string class type', () => {
  const input = `
class Test {
  local = []
}
`
  const program = parse(input, { next: true })
  const { updated } = updateClassDeclarations(program, {
    prototypeProperties: {
      model: ['defaults']
    },
    classTypes: {
      model: [
        'Other'
      ]
    },
    ensureConstructorName: false
  })
  ok(!updated)
  var actual = generate(program)
  const expected = `
class Test {
  local = [];
}
`
  strictEqual(actual.trim(), expected.trim())
})

test('moves property by regexp class type', () => {
  const input = `
class Test {
  defaults = {}
}
`
  const program = parse(input, { next: true })
  const { updated } = updateClassDeclarations(program, {
    prototypeProperties: {
      model: ['defaults']
    },
    classTypes: {
      model: [
        /est$/
      ]
    },
    ensureConstructorName: false
  })
  ok(updated)
  var actual = generate(program)
  const expected = `
class Test {}
Object.assign(Test.prototype, {
  defaults: {}
});
`
  strictEqual(actual.trim(), expected.trim())
})

test('does not move property by regexp class type', () => {
  const input = `
class Test {
  local = []
}
`
  const program = parse(input, { next: true })
  const { updated } = updateClassDeclarations(program, {
    prototypeProperties: {
      model: ['defaults']
    },
    classTypes: {
      model: [
        /MyTest/
      ]
    },
    ensureConstructorName: false
  })
  ok(!updated)
  var actual = generate(program)
  const expected = `
class Test {
  local = [];
}
`
  strictEqual(actual.trim(), expected.trim())
})

test('moves property by class classification function', () => {
  const input = `
class Test {
  defaults = {}
}
`
  const program = parse(input, { next: true })
  const { updated } = updateClassDeclarations(program, {
    prototypeProperties: {
      model: ['defaults']
    },
    classifyClass({ classDeclaration }) {
      const classType = classDeclaration.id?.name === 'Test' && 'model'
      return { classType }
    },
    ensureConstructorName: false
  })
  ok(updated)
  var actual = generate(program)
  const expected = `
class Test {}
Object.assign(Test.prototype, {
  defaults: {}
});
`
  strictEqual(actual.trim(), expected.trim())
})

test('moves property by class classification function and custom properties', () => {
  const input = `
class Test {
  shared = []
}
`
  const program = parse(input, { next: true })
  const { updated } = updateClassDeclarations(program, {
    classifyClass({ classDeclaration }) {
      const prototypePropertyNames = classDeclaration.id?.name === 'Test' && ['shared']
      return { prototypePropertyNames }
    },
    ensureConstructorName: false
  })
  ok(updated)
  var actual = generate(program)
  const expected = `
class Test {}
Object.assign(Test.prototype, {
  shared: []
});
`
  strictEqual(actual.trim(), expected.trim())
})

test('does not move property by class classification function', () => {
  const input = `
class Test {
  local = []
}
`
  const program = parse(input, { next: true })
  const { updated } = updateClassDeclarations(program, {
    classifyClass() {
      return { classType: 'other' }
    },
    ensureConstructorName: false
  })
  ok(!updated)
  var actual = generate(program)
  const expected = `
class Test {
  local = [];
}
`
  strictEqual(actual.trim(), expected.trim())
})
