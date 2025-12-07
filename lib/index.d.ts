interface UpdateClassDeclarationsOptions {
  /**
   * Names of properties to move from the class body to a prototype assignment
   * object by default according to the class type.
   * Default: {
   *   model: [
   *     'cidPrefix', 'defaults', 'idAttribute', 'url', 'urlRoot'
   *   ],
   *   collection: [
   *     'cidPrefix', 'model', 'comparator'
   *   ],
   *   router: [
   *     'cidPrefix', 'routes', 'appRoutes', 'controller'
   *   ],
   *   controller: [
   *     'cidPrefix', 'options', 'channelName', 'radioEvents', 'radioRequests'
   *   ],
   *   view: [
   *     'cidPrefix', 'options', 'tagName', 'className', 'attributes', 'template',
   *     'el', 'ui', 'regions', 'behaviors', 'templateContext', 'templateHelpers',
   *     'events', 'modelEvents', 'collectionEvents', 'triggers',
   *     'childViewContainer', 'childView', 'childViewOptions',
   *     'childViewEventPrefix', 'childViewEvents', 'childViewTriggers',
   *     'emptyView', 'emptyViewOptions',
   *     'viewComparator', 'sortWithCollection', 'reorderOnSort', 'viewFilter'
   *   ],
   *   behavior: [
   *     'options', 'behaviors', 'ui', 'childViewEvents', 'childViewTriggers',
   *     'events', 'modelEvents', 'collectionEvents', 'triggers'
   *   ],
   *   application: [
   *     'cidPrefix', 'region', 'regionClass'
   *   ]
   * }
   */
  prototypeProperties?: Record<string, string[]>

  /**
   * Alternative names of properties to move from the class body to a prototype
   * assignment object by default according to the class type. This object will
   * be merged to the `prototypeProperties` option and it's expected to have
   * the same structure. If the same key is defined in both objects, the values
   * (arrays of property names) from the `alternativePrototypeProperties` option
   * will replace the original values from the `prototypeProperties` option.
   * Default: {}
   */
  alternativePrototypeProperties?: Record<string, string[]>

  /**
   * Additional names of properties to move from the class body to a prototype
   * assignment object by default according to the class type. This object will
   * be merged to the `prototypeProperties` option and it's expected to have
   * the same structure. If the same key is defined in both objects, the values
   * (arrays of property names) will be concatenated.
   * Default: {}
   */
  additionalPrototypeProperties?: Record<string, string[]>

  /**
   * Identifier of the decorator for marking a class for property processing.
   * Default: 'propertiesToPrototype'
   */
  classDecorator?: string

  /**
   * Whether to remove the class decorator after processing.
   * Default: true
   */
  removeClassDecorator?: boolean

  /**
   * Identifier of the decorator for marking a class field as a prototype property.
   * Default: 'prototype'
   */
  prototypeDecorator?: string

  /**
   * Whether to remove the prototype decorator after processing.
   * Default: true
   */
  removePrototypeDecorator?: boolean

  /**
   * Identifier of the decorator for forcing a class field to remain as a class
   * field.
   * Default: 'instance'
   */
  instanceDecorator?: string

  /**
   * Whether to remove the instance decorator after processing.
   * Default: true
   */
  removeInstanceDecorator?: boolean

  /**
   * Whether to replace property values with property getters instead of moving
   * the properties to a prototype object assignment statement.
   */
  convertToPropertyGetters?: boolean

  /**
   * Function to determine whether a property should be moved from the class body
   * to the prototype assignment object. If the other checks using decorators
   * and `prototypeProperties` are exhausted, this function will be called
   * and can decide the move as the last check.
   */
  shouldMoveProperty?: (options: {
    propertyDefinition: Record<string, unknown>,
    classDeclaration: Record<string, unknown>
  }) => boolean

  /**
   * Whether to set the name of the class constructor to the class name
   * to preserve it after minification.
   * Default: true
   */
  ensureConstructorNames?: boolean

  /**
  * Whether to replace the constructor name even if it already exists but has
  * a different value.
   * Default: true
  */
  replaceConstructorName?: boolean
}

interface UpdateClassDeclarationsResult {
  /**
   * Whether any class declarations were updated.
   * Default: false
   */
  updated: boolean
}

export function updateClassDeclarations(
  program: Record<string, unknown>,
  options?: UpdateClassDeclarationsOptions
): UpdateClassDeclarationsResult
