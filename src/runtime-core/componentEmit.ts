import { camelize, toHandlerKey } from '../shared/index'
import { capitalize } from '../shared'

export function emit(instance, event, ...args) {
  const { props } = instance
  event = toHandlerKey(camelize(capitalize(event)))
  const handle = props[event]
  handle && handle(...args)
}
