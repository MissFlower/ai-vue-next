export const extend = Object.assign

export function isObject(value) {
  return typeof value === 'object' && value !== null
}

export function hasChanged(value, oldValue) {
  return !Object.is(value, oldValue)
}
