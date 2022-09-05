import { camelize, toHandlerKey, capitalize } from '@ai-vue-next/shared'

export function emit(instance, event, ...args) {
  const { props } = instance
  event = toHandlerKey(camelize(capitalize(event)))
  const handle = props[event]
  handle && handle(...args)
}
