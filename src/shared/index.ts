export const extend = Object.assign

export function isObject(value) {
  return typeof value === 'object' && value !== null
}

export function hasChanged(value, oldValue) {
  return !Object.is(value, oldValue)
}

export const isFunction = (val: unknown): val is Function =>
  typeof val === 'function'

export const isArray = val => Array.isArray(val)

export const isOn = val => /^on[A-Z]/.test(val)

export const hasOwn = (obj, key) =>
  Object.prototype.hasOwnProperty.call(obj, key)
