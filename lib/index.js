import {
  processClassDecorator,
  removeClassProperties,
  findPrototypePropertyAssignmentObject,
  convertPrototypeProperties,
  createPrototypePropertyAssignment
} from './properties.js'
import {
  findConstructorNameAssignment,
  createConstructorName,
  createConstructorNameAssignment
} from './constructor.js'

export function updateClassDeclarations(program, options) {
  let {
    prototypeProperties,
    alternativePrototypeProperties,
    additionalPrototypeProperties = {},
    classDecorator = 'propertiesToPrototype',
    removeClassDecorator = true,
    prototypeDecorator = 'prototype',
    removePrototypeDecorator = true,
    instanceDecorator = 'instance',
    removeInstanceDecorator = true,
    convertToPropertyGetters = false,
    classTypes,
    alternativeClassTypes,
    additionalClassTypes = {},
    classifyClass,
    shouldMoveProperty,
    ensureConstructorName = true,
    replaceConstructorName = false
  } = options ?? {}
  prototypeProperties = {
    ...prototypeProperties,
    ...alternativePrototypeProperties
  }
  mergeConfiguration(prototypeProperties, additionalPrototypeProperties)
  classTypes = {
    ...classTypes,
    ...alternativeClassTypes
  }
  mergeConfiguration(classTypes, additionalClassTypes)
  let updated = false
  const { body } = program
  let { length } = body
  let i

  for (i = 0; i < length; ++i) {
    const statement = body[i]
    // class Test
    if (statement.type === 'ClassDeclaration') {
      handleClassDeclaration(statement)
    }
    // export default class Test
    else if (statement.type === 'ExportDefaultDeclaration') {
      const { declaration } = statement
      if (declaration.type === 'ClassDeclaration') {
        handleClassDeclaration(declaration)
      }
    }
    // export class Test
    else if (statement.type === 'ExportNamedDeclaration') {
      const { specifiers, declaration } = statement
      if (!specifiers.length && declaration.type === 'ClassDeclaration') {
        handleClassDeclaration(declaration)
      }
    }
  }

  return { updated }

  function mergeConfiguration(mainValues, additionalValues) {
    for (const value in additionalValues) {
      const sourceValues = additionalValues[value]
      const targetValues = mainValues[value]
      if (targetValues) {
        mainValues[value] = targetValues.concat(sourceValues)
      } else {
        mainValues[value] = sourceValues
      }
    }
  }

  function handleClassDeclaration(declaration) {
    let [classUpdated, classType] = processClassDecorator(declaration, classDecorator, removeClassDecorator)
    if (!classType) {
      classType = findClassType(declaration)
    }
    let prototypePropertyNames = prototypeProperties[classType] ?? []
    if (!(classType || prototypePropertyNames.length) && classifyClass) {
      ({ classType, prototypePropertyNames } = classifyClass({
        classDeclaration: declaration,
        classType,
        prototypeProperties,
        prototypePropertyNames,
        programScope: program
      }))
      if (!prototypePropertyNames) {
        prototypePropertyNames = prototypeProperties[classType] ?? []
      }
    }
    const [className, removedProperties, propertiesUpdated] = removeClassProperties(
      declaration, program, prototypePropertyNames, convertToPropertyGetters,
      prototypeDecorator, removePrototypeDecorator,
      instanceDecorator, removeInstanceDecorator, shouldMoveProperty)
    updated ||= classUpdated || propertiesUpdated
    if (removedProperties.length) {
      const propertiesObject = findPrototypePropertyAssignmentObject(body, className)
      if (propertiesObject) {
        const newProperties = convertPrototypeProperties(removedProperties)
        propertiesObject.properties.push(...newProperties)
      } else {
        const newStatement = createPrototypePropertyAssignment(className, removedProperties)
        insertStatement(newStatement)
      }
    }
    if (ensureConstructorName) {
      const { equal, statement } = findConstructorNameAssignment(body, className)
      if (!equal) {
        if (statement) {
          if (replaceConstructorName) {
            statement.expression.arguments[2] = createConstructorName(className)
            updated = true
          }
        } else {
          const newStatement = createConstructorNameAssignment(className)
          insertStatement(newStatement)
          updated = true
        }
      }
    }
  }

  function findClassType(declaration) {
    const { id } = declaration
    if (id?.type === 'Identifier') {
      const { name } = id
      for (const classType in classTypes) {
        for (const className of classTypes[classType]) {
          if (typeof className === 'string') {
            if (className === name) return classType
          } else {
            if (className.test(name)) return classType
          }
        }
      }
    }
  }

  function insertStatement(statement) {
    ++length
    ++i
    body.splice(i, 0, statement)
  }
}
