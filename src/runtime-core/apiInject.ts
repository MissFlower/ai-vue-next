import { isFunction } from '../shared'
import { getCurrentInstace } from './component'

export function provide(key, value) {
  const currentInstance: any = getCurrentInstace()
  if (currentInstance) {
    let { provides } = currentInstance
    const parentProvides = currentInstance.parent.provides
    // 只有初始化的时候才为provides改变原型
    // 否则每次provide执行的时候之前赋值全被清空了
    if (provides === parentProvides) {
      // 将自己的provides的原型改为父级的provides原型对象
      provides = currentInstance.provides = Object.create(parentProvides)
    }
    provides[key] = value
  }
}

export function inject(key, defaultValue) {
  const currentInstance: any = getCurrentInstace()
  if (currentInstance) {
    // inject每次都是去父级上的provides上找 如果找不到就接着向上找
    const { provides } = currentInstance.parent
    // 先去原型链上看看有没有key 有的滑直接取 没有的滑看看是否给有默认值 并返回
    if (key in provides) {
      return provides[key]
    } else if (defaultValue) {
      // 支持默认值是函数
      if (isFunction(defaultValue)) {
        return defaultValue()
      }
      return defaultValue
    }
  }
}
