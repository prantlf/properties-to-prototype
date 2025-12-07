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

const defaultPrototypeProperties = {
  model: [
    'cidPrefix', 'defaults', 'idAttribute', 'url', 'urlRoot'
  ],
  collection: [
    'cidPrefix', 'model', 'comparator'
  ],
  view: [
    'cidPrefix', 'options', 'tagName', 'className', 'attributes', 'template',
    'el', 'ui', 'regions', 'behaviors', 'templateContext', 'templateHelpers',
    'events', 'modelEvents', 'collectionEvents', 'triggers',
    'childViewContainer', 'childView', 'childViewOptions',
    'childViewEventPrefix', 'childViewEvents', 'childViewTriggers',
    'emptyView', 'emptyViewOptions',
    'viewComparator', 'sortWithCollection', 'reorderOnSort', 'viewFilter'
  ],
  behavior: [
    'options', 'behaviors', 'ui', 'childViewEvents', 'childViewTriggers',
    'events', 'modelEvents', 'collectionEvents', 'triggers'
  ],
  router: [
    'routes', 'appRoutes', 'controller'
  ],
  controller: [
    'cidPrefix', 'options', 'channelName', 'radioEvents', 'radioRequests'
  ],
  application: [
    'cidPrefix', 'region', 'regionClass'
  ]
}

export function updateClassDeclarations(program, options) {
  let {
    prototypeProperties = defaultPrototypeProperties,
    alternativePrototypeProperties,
    additionalPrototypeProperties = {},
    classDecorator = 'propertiesToPrototype',
    removeClassDecorator = true,
    prototypeDecorator = 'prototype',
    removePrototypeDecorator = true,
    instanceDecorator = 'instance',
    removeInstanceDecorator = true,
    convertToPropertyGetters = false,
    classifyClass,
    shouldMoveProperty,
    ensureConstructorName = true,
    replaceConstructorName = false
  } = options ?? {}
  prototypeProperties = {
    ...prototypeProperties,
    ...alternativePrototypeProperties
  }
  for (const classType in additionalPrototypeProperties) {
    const sourceProperties = additionalPrototypeProperties[classType]
    const targetProperties = prototypeProperties[classType]
    if (targetProperties) {
      prototypeProperties[classType] = targetProperties.concat(sourceProperties)
    } else {
      prototypeProperties[classType] = sourceProperties
    }
  }
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

  function handleClassDeclaration(declaration) {
    const [classUpdated, originalClassType] = processClassDecorator(declaration, classDecorator, removeClassDecorator)
    const originalPrototypePropertyNames = prototypeProperties[originalClassType] ?? []
    let classType = originalClassType
    let prototypePropertyNames = originalPrototypePropertyNames
    if (classifyClass) {
      ({ classType, prototypePropertyNames } = classifyClass({
        classDeclaration: declaration,
        classType,
        prototypeProperties,
        prototypePropertyNames,
        programScope: program
      }))
      if (!classType) {
        classType = originalClassType
      }
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

  function insertStatement(statement) {
    ++length
    ++i
    body.splice(i, 0, statement)
  }
}
