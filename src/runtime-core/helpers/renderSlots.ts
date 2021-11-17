import { isFunction } from '../../shared'
import { createVNode } from '../createVNode'

export function renderSlots(slots, name, props) {
  const slot = slots[name]
  if (slot) {
    if (isFunction(slot)) {
      return slot ? createVNode('div', {}, slot(props)) : ''
    }
  }
}
