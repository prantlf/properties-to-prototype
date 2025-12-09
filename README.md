# properties-to-prototype

Moves properties out of classes to prototypes, ensures not minified class name.

Works together with JavaScript AST processor hooks in [requirejs-esm], [requirejs-esm-preprocessor] and [backbone-class-syntax], for example.

## Synopsis

Decorate a property to move it from the class instances to the class prototype:

```js
class Class {
  property1 = 42

  @prototype
  property2 = 42
}
```

The result:

```js
class Class {
  property1 = 42
}

Object.assign(Class.prototype, {
  property2 = 42
})
```

Decorate a descendant of `Backbone.Model` to move the well-known properties from the class instances to the class prototype:

```js
import { Model } from 'backbone'

@propertiesToPrototype('model')
class User extends Model {
  defaults: {
    name: 'unnamed'
  }
}
```

The result:

```js
import { Model } from 'backbone'

class User extends Model {}

Object.assign(Class.prototype, {
  defaults: {
    name: 'unnamed'
  }
})
```

The class name will be preserved in the name of the constructor and survive the minification:

```js
class Class {}
```

The result:

```js
class Class {}

Object.defineProperty(Class.prototype.constructor, 'name', {
  value: 'Class'
})
```

## Installation

This module can be installed using a `NPM` package manager:

```sh
npm i properties-to-prototype
```

## API

Call `updateClassDeclarations` to update an AST of a script:

```js
import { readFile } from 'node:fs/promises'
import { parse } from 'meriyah'
import { generate } from 'astring'
import { updateClassDeclarations } from 'properties-to-prototype'

const input = await readFile('index.js', 'utf8')
const program = parse(input, { sourceType: 'module', next: true })
const { updated } = updateClassDeclarations(program)
if (updated) {
  const output = generate(program)
}
```

| Option                         | Default                 | Description |
|:-------------------------------|-------------------------|:------------|
| prototypeProperties            |           {}            | Names of properties to move from the class body to a prototype assignment object by default according to the class type. |
| alternativePrototypeProperties |           {}            | Properties in this object will be merged to the `prototypeProperties` option, replacing the same class types. |
| additionalPrototypeProperties  |           {}            | Properties in this object will be merged to the `prototypeProperties` option, appending to the same class types. |
| classDecorator                 | `propertiesToPrototype` | Identifier of the decorator for marking a class for property processing. |
| removeClassDecorator           |         `true`          | Whether to remove the class decorator after processing. |
| prototypeDecorator             |       `prototype`       | Identifier of the decorator for marking a class field as a prototype property. |
| removePrototypeDecorator       |         `true`          | Whether to remove the prototype decorator after processing. |
| instanceDecorator              |       `instance`        | Identifier of the decorator for forcing a class field to remain as a class field. |
| removeInstanceDecorator        |         `true`          | Whether to remove the instance decorator after processing. |
| convertToPropertyGetters       |         `false`         | Whether to replace property values with property getters instead of moving the properties to a prototype object assignment statement. |
| classTypes                     |           {}            | Class names or regular expressions to infer the class type from. |
| alternativeClassTypes          |           {}            | Properties in this object will be merged to the `classTypes` option, replacing the same class types. |
| additionalClassTypes           |           {}            | Properties in this object will be merged to the `classTypes` option, appending to the same class types. |
| classifyClass                  |                         | Function to compute the class type and optionally to customise the properties for moving from the class declaration to the prototype. |
| shouldMoveProperty             |                         | Function to determine whether a property should be moved from the class body to the prototype assignment object. |
| ensureConstructorNames         |         `true`          | Whether to set the name of the class constructor to the class name to preserve it after minification. |
| replaceConstructorName         |         `false`         | Whether to replace the constructor name even if it already exists but has a different value. |

## Decorators

### prototype

Moves a class instance property to the class prototype.

```js
class Class {
  @prototype
  property = 42
}
```

### instance

Forces a class property, which would be otherwise moved to the class prototype, to stay in the class instances.

```js
@propertiesToPrototype
class Class {
  @instance
  property = 42
}
```

### propertiesToPrototype

Moves well-known class instance properties of a particular class type to the class prototype.

```js
@propertiesToPrototype('model')
class User extends Model {
  defaults: {
    name: 'unnamed'
  }
}
```

## Prototype Properties

Specific class types can have their well-know properties moved to prototype object assignment statement by default. The structure is an object with class types as keys and arrays of property names as values. For example, for Backbone and Marionette:

```js
{
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
```

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Lint and test your code.

## License

Copyright (c) 2025 Ferdinand Prantl

Licensed under the MIT license.

[requirejs-esm]: https://www.npmjs.com/package/requirejs-esm
[requirejs-esm-preprocessor]: https://www.npmjs.com/package/requirejs-esm-preprocessor
[backbone-class-syntax]: https://www.npmjs.com/package/backbone-class-syntax
