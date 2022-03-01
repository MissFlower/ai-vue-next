export const extend = Object.assign

export const EMPTY_OBJ = {}

export const isObject = value => typeof value === 'object' && value !== null

export const hasChanged = (value, oldValue) => !Object.is(value, oldValue)

export const isFunction = (val: unknown): val is Function =>
  typeof val === 'function'

export const isArray = Array.isArray

export const isOn = val => /^on[A-Z]/.test(val)

export const hasOwn = (obj, key) =>
  Object.prototype.hasOwnProperty.call(obj, key)

// add => Add
export const capitalize = (val: string) =>
  val.charAt(0).toUpperCase() + val.slice(1)

// add-foo => addFoo
export const camelize = (val: string) =>
  val.replace(/-(\w)/g, (_, c: string) => {
    return c ? c.toUpperCase() : ''
  })

export const toHandlerKey = (val: string) => 'on' + val
