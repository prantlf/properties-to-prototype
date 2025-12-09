interface UpdateClassDeclarationsOptions {
  /**
   * Names of properties to move from the class body to a prototype assignment
   * object by default according to the class type. The structure is an object
   * with class types as keys and arrays of property names as values.
   * Default: {}
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
   * Class names or regular expressions to infer the class type from. The structure
   * is an object with class types as keys and arrays of strings or regular
   * expressions as values to match against the class declarations.
   * Default: {}
   */
  classTypes?: Record<string, (string | RegExp)[]>

  /**
   * Use the strings with class names as suffixes (endsWith) instead of full names (===).
   * Default: false
   */
  classTypesByEnds?: boolean

  /**
   * Alternative class names or regular expressions to infer the class type from.
   * This object will be merged to the `classTypes` option and it's expected
   * to have the same structure. If the same key is defined in both objects,
   * the values (arrays of strings or regular expressions) from the `alternativeClassTypes`
   * option will replace the original values from the `classTypes` option.
   * Default: {}
   */
  alternativeClassTypes?: Record<string, (string | RegExp)[]>

  /**
   * Additional class names or regular expressions to infer the class type from.
   * This object will be merged to the `classTypes` option and it's expected
   * to have the same structure. If the same key is defined in both objects,
   * the values (arrays of strings or regular expressions) will be concatenated.
   * Default: {}
   */
  additionalClassTypes?: Record<string, (string | RegExp)[]>

  /**
   * Function to compute the class type and optionally to customise the properties
   * for moving from the class declaration to the prototype.
   * Default: undefined
   */
  classifyClass?: (options: {
    classDeclaration: Record<string, unknown>,
    classType?: string,
    prototypeProperties: Record<string, string[]>,
    prototypePropertyNames: string[],
    programScope: Record<string, unknown>
  }) => {
    classType?: string,
    prototypePropertyNames?: string[]
  }

  /**
   * Function to determine whether a property should be moved from the class body
   * to the prototype assignment object. If the other checks using decorators
   * and `prototypeProperties` are exhausted, this function will be called
   * and can decide the move as the last check.
   * Default: undefined
   */
  shouldMoveProperty?: (options: {
    propertyDefinition: Record<string, unknown>,
    classDeclaration: Record<string, unknown>,
    programScope: Record<string, unknown>
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
