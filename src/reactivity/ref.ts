import { hasChanged, isObject } from '../shared'
import { isTracking, trackEffects, triggerEffects } from './effect'
import { reactive } from './reactive'

class RefImpl {
  public dep
  private _value: any
  private _rawValue: any
  private readonly __v_isRef: Boolean = true
  constructor(value) {
    this._value = isObject(value) ? reactive(value) : value
    // 存一下原生的值 有可能是被代理过得对象 用于下面set的时候看是否变化
    this._rawValue = value
    this.dep = new Set()
  }

  get value() {
    trackRefValue(this)
    return this._value
  }

  set value(newVal) {
    if (hasChanged(newVal, this._rawValue)) {
      this._rawValue = newVal
      this._value = isObject(newVal) ? reactive(newVal) : newVal
      triggerRefValue(this)
    }
  }
}

function trackRefValue(ref) {
  if (isTracking()) {
    trackEffects(ref.dep)
  }
}

function triggerRefValue(ref) {
  triggerEffects(ref.dep)
}

export function isRef(r) {
  return Boolean(r && r.__v_isRef)
}

export function unref(r) {
  return isRef(r) ? r.value : r
}

export function ref(value) {
  return new RefImpl(value)
}
