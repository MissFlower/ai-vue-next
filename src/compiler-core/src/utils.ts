import { NodeTypes } from './ast'

export function isText(node: any) {
  return node.type === NodeTypes.TEXT || node.type === NodeTypes.INTERPOLATION
}
