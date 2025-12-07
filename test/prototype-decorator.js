import { ok, strictEqual } from 'node:assert'
import tehanu from 'tehanu'
import { parse } from 'meriyah'
import { generate } from 'astring'
import { updateClassDeclarations } from '../lib/index.js'

const test = tehanu(import.meta.filename)

test('does not move property by default', () => {
  const input = `
class Test {
  local = []
}
`
  const program = parse(input, { next: true })
  const { updated } = updateClassDeclarations(program, {
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

test('does not move static property', () => {
  const input = `
class Test {
  @prototype
  static local = []
}
`
  const program = parse(input, { next: true })
  const { updated } = updateClassDeclarations(program, {
    ensureConstructorName: false
  })
  ok(!updated)
  var actual = generate(program)
  const expected = `
class Test {
  static local = [];
}
`
  strictEqual(actual.trim(), expected.trim())
})

test('moves property by decorator', () => {
  const input = `
export class Test {
  @prototype
  shared = []
}
`
  const program = parse(input, { sourceType: 'module', next: true })
  const { updated } = updateClassDeclarations(program, {
    ensureConstructorName: false
  })
  ok(updated)
  var actual = generate(program)
  const expected = `
export class Test {}
Object.assign(Test.prototype, {
  shared: []
});
`
  strictEqual(actual.trim(), expected.trim())
})

test('replaces property by getter instead of moving it', () => {
  const input = `
export class Test {
  @prototype
  shared = []
}
`
  const program = parse(input, { sourceType: 'module', next: true })
  const { updated } = updateClassDeclarations(program, {
    convertToPropertyGetters: true,
    ensureConstructorName: false
  })
  ok(updated)
  var actual = generate(program)
  const expected = `
export class Test {
  get shared() {
    return [];
  }
}
`
  strictEqual(actual.trim(), expected.trim())
})

test('moves property to existing prototype assignment', () => {
  const input = `
export default class Test {
  @prototype
  shared = []
}
Object.assign(Test.prototype, {
  existing: {}
})
`
  const program = parse(input, { sourceType: 'module', next: true })
  const { updated } = updateClassDeclarations(program, {
    ensureConstructorName: false
  })
  ok(updated)
  var actual = generate(program)
  const expected = `
export default class Test {}
Object.assign(Test.prototype, {
  existing: {},
  shared: []
});
`
  strictEqual(actual.trim(), expected.trim())
})

test('does not remove prototype decorator if requested', () => {
  const input = `
class Test {
  @prototype
  shared = []
}
`
  const program = parse(input, { next: true })
  const { updated } = updateClassDeclarations(program, {
    removePrototypeDecorator: false,
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

test('moves property by custom decorator', () => {
  const input = `
class Test {
  @move
  shared = []
}
`
  const program = parse(input, { next: true })
  const { updated } = updateClassDeclarations(program, {
    prototypeDecorator: 'move',
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

test('moves property by recognition function', () => {
  const input = `
class Test {
  shared = []
}
`
  const program = parse(input, { next: true })
  const { updated } = updateClassDeclarations(program, {
    shouldMoveProperty({ propertyDefinition }) {
      return propertyDefinition.key.name === 'shared'
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
