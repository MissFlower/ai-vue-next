import { isArray, isObject } from '../shared'
import { ShapeFlags } from '../shared/shapeFlags'

export function createVNode(type, props?, children?) {
  const vnode = {
    type,
    props,
    children,
    el: null,
    shapeFlag: getShapeFlag(type)
  }
  if (typeof children === 'string') {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
  } else if (isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
  }

  return vnode
}

function getShapeFlag(type: any) {
  if (isObject(type)) {
    return ShapeFlags.STATEFUL_COMPONENT
  } else {
    return ShapeFlags.ELEMENT
  }
}
