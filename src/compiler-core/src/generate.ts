export function generate(ast) {
  const context = createCodegenContext(ast)
  const { push } = context

  push('return ')
  const functionName = 'render'
  const args = ['_ctx', '_ceche']
  const signature = args.join(', ')
  push(`function ${functionName}(${signature}) {`)
  genNode(ast.codegenNode, context)
  push('}')

  return {
    code: context.code
  }
}

function createCodegenContext(ast: any) {
  const context = {
    code: '',
    push(source) {
      context.code += source
    }
  }

  return context
}

function genNode(node: any, context) {
  const { push } = context
  push(`return '${node.content}'`)
}
