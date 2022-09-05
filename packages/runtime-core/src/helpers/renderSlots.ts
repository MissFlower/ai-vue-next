import { isFunction } from '@ai-vue-next/shared'
import { createVNode, Fragment } from '../vnode'

export function renderSlots(slots, name, props) {
  const slot = slots[name]
  if (slot) {
    if (isFunction(slot)) {
      return slot ? createVNode(Fragment, {}, slot(props)) : ''
    }
  }
}
