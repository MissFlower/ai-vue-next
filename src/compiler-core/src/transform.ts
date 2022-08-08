import { NodeTypes } from './ast'

export function transform(root, options = {}) {
  const context = createTransformContext(root, options)
  traverseNode(root, context)

  createCodegenNode(root)
}

function createCodegenNode(root: any) {
  root.codegenNode = root.children[0]
}

function createTransformContext(root: any, options: any): any {
  const context = {
    root,
    nodeTransforms: options.nodeTransforms || []
  }

  return context
}

function traverseNode(node: any, context) {
  const { nodeTransforms } = context
  for (let i = 0; i < nodeTransforms.length; i++) {
    const transform = nodeTransforms[i]
    transform(node)
  }

  const { children } = node
  if (children) {
    for (let i = 0; i < children.length; i++) {
      const node = children[i]
      // 深度优先搜索
      traverseNode(node, context)
    }
  }
}
