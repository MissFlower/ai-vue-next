import { extend } from '../shared'
import { isObject } from '../shared/is'
import { track, trigger } from './effect'
import { reactive, ReactiveFlags, readonly } from './reactive'

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)

function createGetter(isReadonly = false, shallow = false) {
  return function get(target, key) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      // 注意：这里返回的是!isReadonly而不是true的原因是
      // 当对象是readonly的时候就不是reactive
      return !isReadonly
    } else if (key === ReactiveFlags.IS_READONLY) {
      // 注意：这里返回的是isReadonly而不是true的原因是
      // 当对象是reactive的时候就不是readonly
      return isReadonly
    }

    const res = Reflect.get(target, key)

    if (!isReadonly) {
      track(target, key)
    }

    if (shallow) {
      return res
    }

    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res)
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

export function shallowReadonlyHandlers() {
  return extend({}, readonlyHandlers, {
    get: shallowReadonlyGet
  })
}
