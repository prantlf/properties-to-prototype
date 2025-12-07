import {
  identifier,
  property,
  memberExpression,
  objectExpression,
  callExpression,
  functionExpression,
  methodDefinition,
  expressionStatement,
  blockStatement,
  returnStatement
} from './factories.js'

export function processClassDecorator(declaration, classDecorator, removeClassDecorator) {
  const { decorators } = declaration
  let updated = false
  if (decorators) {
    let { length } = decorators
    let i

    for (i = 0; i < length; ++i) {
      const decorator = decorators[i]
      const { expression } = decorator
      if (expression.type === 'Identifier') {
        const { name } = expression
        if (name === classDecorator) {
          if (removeClassDecorator) {
            removeDecorator()
            updated = true
          }
          return [updated, 'other']
        }
      } else if (expression.type === 'CallExpression') {
        const { callee, arguments: args } = expression
        if (callee.type === 'Identifier') {
          const { name } = callee
          if (name === classDecorator) {
            if (removeClassDecorator) {
              removeDecorator()
              updated = true
            }
            if (args.length === 1) {
              const [arg] = args
              if (arg.type === 'Literal') {
                return [updated, arg.value]
              }
            }
            return [updated, 'other']
          }
        }
      }
    }

    function removeDecorator() {
      decorators.splice(i, 1)
      --length
      --i
    }
  }

  return [updated]
}

function processKeepOrMoveDecorator(decorators,
  prototypeDecorator, removePrototypeDecorator,
  instanceDecorator, removeInstanceDecorator) {
  if (decorators) {
    let { length } = decorators
    let i

    for (i = 0; i < length; ++i) {
      const decorator = decorators[i]
      const { expression } = decorator
      if (expression.type === 'Identifier') {
        const { name } = expression
        if (name === prototypeDecorator) {
          if (removePrototypeDecorator) {
            removeDecorator()
          }
          return true
        }
        if (name === instanceDecorator) {
          if (removeInstanceDecorator) {
            removeDecorator()
          }
          return false
        }
      }
    }

    function removeDecorator() {
      decorators.splice(i, 1)
      --length
      --i
    }
  }
}

export function removeClassProperties(declaration, programScope,
  prototypePropertyNames, convertToPropertyGetters,
  prototypeDecorator, removePrototypeDecorator,
  instanceDecorator, removeInstanceDecorator, shouldMoveProperty) {
  const removedProperties = []
  let updated = false
  const { id, body: classBody } = declaration
  const { name: className } = id
  const { body } = classBody
  let { length } = body
  let i

  for (i = 0; i < length; ++i) {
    const statement = body[i]
    if (statement.type === 'PropertyDefinition') {
      const { key, decorators, static: staticProperty } = statement
      if (staticProperty) continue
      let keepOrMove = processKeepOrMoveDecorator(decorators,
        prototypeDecorator, removePrototypeDecorator,
        instanceDecorator, removeInstanceDecorator)
      if (keepOrMove === false) {
        updated = true
        continue
      }
      if (keepOrMove === undefined) {
        const { type, name } = key
        if (type === 'Identifier') {
          keepOrMove = prototypePropertyNames.includes(name) ||
            shouldMoveProperty?.({
              propertyDefinition: statement,
              classDeclaration: declaration,
              programScope
            })
        }
      }
      if (keepOrMove) {
        if (convertToPropertyGetters) {
          body[i] = methodDefinition(
            statement.key,
            functionExpression(
              null,
              [],
              blockStatement([
                returnStatement(statement.value)
              ])
            )
          )
        } else {
          removedProperties.push(statement)
          removeMember()
        }
        updated = true
      }
    }
  }

  return [className, removedProperties, updated]

  function removeMember() {
    body.splice(i, 1)
    --length
    --i
  }
}

export function findPrototypePropertyAssignmentObject(body, className) {
  const { length } = body
  let i
  for (i = 0; i < length; ++i) {
    const statement = body[i]
    if (statement.type === 'ExpressionStatement') {
      const { expression } = statement
      if (expression.type === 'CallExpression') {
        const { callee, arguments: args } = expression
        if (callee.type === 'MemberExpression') {
          const { object, property } = callee
          if (object.type === 'Identifier' && object.name === 'Object' &&
              property.type === 'Identifier' && property.name === 'assign') {
            if (args.length === 2) {
              const [target, source] = args
              if (target.type === 'MemberExpression') {
                const { object: targetObject, property: targetProperty } = target
                if (targetObject.type === 'Identifier' &&
                    targetObject.name === className &&
                    targetProperty.type === 'Identifier' &&
                    targetProperty.name === 'prototype') {
                  if (source.type === 'ObjectExpression') {
                    return source
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

export function convertPrototypeProperties(prototypeProperties) {
  const objectProperties = []
  for (const prototypeProperty of prototypeProperties) {
    const { key, value } = prototypeProperty
    const objectProperty = property(key, value)
    objectProperty.start = prototypeProperty.start
    objectProperty.end = prototypeProperty.end
    objectProperties.push(objectProperty)
  }
  return objectProperties
}

export function createPrototypePropertyAssignment(className, prototypeProperties) {
  const objectProperties = convertPrototypeProperties(prototypeProperties)
  const prototypePropertyAssignment = expressionStatement(
    callExpression(
      memberExpression(
        identifier('Object'),
        identifier('assign')
      ),
      [
        memberExpression(
          identifier(className),
          identifier('prototype')
        ),
        objectExpression(objectProperties)
      ]
    )
  )
  return prototypePropertyAssignment
}
