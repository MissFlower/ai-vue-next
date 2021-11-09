import { track, trigger } from './effect'

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)

function createGetter(isReadonly = false) {
  return function get(target, key) {
    const res = Reflect.get(target, key)

    if (!isReadonly) {
      track(target, key)
    }
    return res
  }
}
function createSetter() {
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value)
    trigger(target, key)
    return res
  }
}

export function mutableHandlers() {
  return {
    get,
    set
  }
}

export function readonlyHandlers() {
  return {
    get: readonlyGet,
    set(target, key) {
      console.warn(
        `Set operation on key "${String(key)}" failed: target is readonly.`,
        target
      )
      return true
    }
  }
}
