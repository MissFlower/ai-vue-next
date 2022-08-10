import { NodeTypes } from './ast'
import { helperMapName, TO_DISPLAY_STRING } from './runtimeHelpers'

export function generate(ast) {
  const context = createCodegenContext(ast)
  const { push } = context

  // import { toDisplayString as _toDisplayString } from "vue"
  genFunctionPreamble(ast, context)

  const functionName = 'render'
  const args = ['_ctx', '_ceche']
  const signature = args.join(', ')
  console.log(ast)

  push(`function ${functionName}(${signature}) {`)
  genNode(ast.codegenNode, context)
  push('}')

  return {
    code: context.code
  }
}

function genFunctionPreamble(ast, context) {
  const { push } = context
  const VueBinging = 'Vue'
  const aliasHelper = s => `${helperMapName[s]}:_${helperMapName[s]}`
  if (ast.helpers.length) {
    push(`const {${ast.helpers.map(aliasHelper).join(', ')}} = ${VueBinging}`)
  }
  push('\n')
  push('return ')
}

function createCodegenContext(ast: any) {
  const context = {
    code: '',
    push(source) {
      context.code += source
    },
    helper(key) {
      return `_${helperMapName[key]}`
    }
  }

  return context
}

function genNode(node: any, context) {
  switch (node.type) {
    case NodeTypes.TEXT:
      genText(node, context)

      break

    case NodeTypes.INTERPOLATION:
      genInterpolation(node, context)

      break

    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(node, context)

      break

    default:
      break
  }
}

function genExpression(node: any, context: any) {
  const { push } = context
  push(`${node.content}`)
}

function genInterpolation(node: any, context: any) {
  const { push, helper } = context
  push(`${helper(TO_DISPLAY_STRING)}(`)
  genNode(node.content, context)
  push(')')
}

function genText(node: any, context: any) {
  const { push } = context
  push(`return '${node.content}'`)
}
