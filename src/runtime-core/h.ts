import { createVNode } from './createVNode'

export function h(type, props?, children?) {
  return createVNode(type, props, children)
}
