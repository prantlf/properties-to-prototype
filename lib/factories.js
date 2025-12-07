export function literal(value) {
  return { type: 'Literal', value }
}

export function identifier(name) {
  return { type: 'Identifier', name }
}

export function property(key, value, kind = 'init') {
  return { type: 'Property', key, value, kind }
}

export function memberExpression(object, property) {
  return { type: 'MemberExpression', object, property }
}

export function objectExpression(properties) {
  return { type: 'ObjectExpression', properties }
}

export function callExpression(callee, args) {
  return { type: 'CallExpression', callee, arguments: args }
}

export function functionExpression(id, params, body) {
  return { type: 'FunctionExpression', id, params, body }
}

export function methodDefinition(key, value, kind = 'get') {
  return { type: 'MethodDefinition', key, value, kind }
}

export function expressionStatement(expression) {
  return { type: 'ExpressionStatement', expression }
}

export function blockStatement(body) {
  return { type: 'BlockStatement', body }
}

export function returnStatement(argument) {
  return { type: 'ReturnStatement', argument }
}
