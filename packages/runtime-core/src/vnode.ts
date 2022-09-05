import { isArray, isObject, ShapeFlags } from '@ai-vue-next/shared'

export const Fragment = Symbol('Fragment')
export const Text = Symbol('Text')

export { createVNode as createElementVNode }
export function createVNode(type, props?, children?) {
  const vnode = {
    type,
    key: props?.key,
    props,
    children,
    component: null,
    el: null,
    shapeFlag: getShapeFlag(type)
  }
  if (typeof children === 'string') {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
  } else if (isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
  }

  if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT && isObject(children)) {
    vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN
  }

  return vnode
}

export function createTextVNode(text: string) {
  return createVNode(Text, {}, text)
}

export function isSameVNodeType(n1, n2): boolean {
  return n1.type === n2.type && n1.key === n2.key
}

function getShapeFlag(type: any) {
  if (isObject(type)) {
    return ShapeFlags.STATEFUL_COMPONENT
  } else {
    return ShapeFlags.ELEMENT
  }
}
