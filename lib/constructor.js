import {
  literal,
  identifier,
  property,
  memberExpression,
  objectExpression,
  callExpression,
  expressionStatement
} from './factories.js'

export function findConstructorNameAssignment(body, className) {
  for (const statement of body) {
    if (statement.type === 'ExpressionStatement') {
      const { expression } = statement
      if (expression.type === 'CallExpression') {
        const { callee, arguments: args } = expression
        if (callee.type === 'MemberExpression') {
          const { object, property } = callee
          if (object.type === 'Identifier' && object.name === 'Object' &&
              property.type === 'Identifier' && property.name === 'defineProperty') {
            if (args.length === 3) {
              const [target, name, descriptor] = args
              if (target.type === 'MemberExpression') {
                const { object: targetObject, property: targetProperty } = target
                if (targetObject.type === 'MemberExpression' &&
                    targetProperty.type === 'Identifier' &&
                    targetProperty.name === 'constructor') {
                  const { object, property } = targetObject
                  if (object.type === 'Identifier' &&
                    object.name === className &&
                    property.type === 'Identifier' &&
                    property.name === 'prototype') {
                    if (name.type === 'Literal' && name.value === 'name') {
                      if (descriptor.type === 'ObjectExpression') {
                        const { properties } = descriptor
                        for (const property of properties) {
                          if (property.type === 'Property') {
                            const { key, value } = property
                            if (key.type === 'Identifier' && key.name === 'value' &&
                              value.type === 'Literal' && value.value === className) {
                              return { equal: true }
                            }
                          }
                        }
                      }
                      return { equal: false, statement }
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
  return {}
}

export function createConstructorName(className) {
  const constructorName = objectExpression([
    property(identifier('value'), literal(className))
  ])
  return constructorName
}

export function createConstructorNameAssignment(className) {
  const constructorNameAssignment = expressionStatement(
    callExpression(
      memberExpression(
        identifier('Object'),
        identifier('defineProperty')
      ),
      [
        memberExpression(
          memberExpression(
            identifier(className),
            identifier('prototype')
          ),
          identifier('constructor')
        ),
        literal('name'),
        createConstructorName(className)
      ]
    )
  )
  return constructorNameAssignment
}
