import { ShapeFlags, hasOwn, isArray } from '@ai-vue-next/shared'
export function initSlots(instance, children) {
  const { shapeFlag } = instance.vnode
  if (shapeFlag & ShapeFlags.SLOT_CHILDREN) {
    normalizeObjectSlots(children, instance)
  }
}

function normalizeObjectSlots(children: any, instance: any) {
  const slots = {}
  for (const name in children) {
    if (hasOwn(children, name)) {
      const slot = children[name]
      slots[name] = props => normalizeSlotValue(slot(props))
    }
  }
  instance.slots = slots
}

function normalizeSlotValue(value) {
  return isArray(value) ? value : [value]
}
