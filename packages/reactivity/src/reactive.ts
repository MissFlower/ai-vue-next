import { isObject } from '@ai-vue-next/shared'
import {
  mutableHandlers,
  readonlyHandlers,
  shallowReadonlyHandlers
} from './baseHandles'

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly'
}
export function reactive(raw) {
  return createReactiveObject(raw, mutableHandlers)
}

export function readonly(raw) {
  return createReactiveObject(raw, readonlyHandlers)
}

export function shallowReadonly(raw) {
  return createReactiveObject(raw, shallowReadonlyHandlers)
}

export function isReactive(value) {
  // 实现原理：
  // 如果value是一个reactive对象 那么访问其任意属性(不论属性是否存在)都会触发get函数
  // 在get函数中判断key值是否是当前访问的属性ReactiveFlags.IS_REACTIVE 如果触发了get并且key相等 那么就认为是reactive对象
  // 如果value本身不是一个reactive对象 那么访问其不存在的属性会返回undefined 使用!!对其进行boolean处理
  return !!value?.[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(value) {
  // 原理同isReactive
  return !!value?.[ReactiveFlags.IS_READONLY]
}

export function isProxy(value) {
  return isReactive(value) || isReadonly(value)
}

function createReactiveObject(target, baseHandles) {
  if (!isObject(target)) {
    console.warn(`target ${target} must be is Object`)
    return
  }
  return new Proxy(target, baseHandles)
}
