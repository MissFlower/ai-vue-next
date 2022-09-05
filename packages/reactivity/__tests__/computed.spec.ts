import { computed } from '../src/computed'
import { reactive } from '../src/reactive'
import { vi } from 'vitest'

describe('reactivity/computed', () => {
  it('should return updated value', () => {
    const value = reactive({ foo: 1 })
    const cValue = computed(() => value.foo)
    expect(cValue.value).toBe(1)
    value.foo = 2
    expect(cValue.value).toBe(2)
  })

  it('should compute lazily', () => {
    const value = reactive({ foo: 0 })
    const getter = vi.fn(() => value.foo)
    const cValue = computed(getter)

    // lazy
    expect(getter).not.toHaveBeenCalled()

    expect(cValue.value).toBe(0)
    // 第一次访问 调用一次getter
    expect(getter).toHaveBeenCalledTimes(1)

    // should not compute again
    cValue.value
    // 再次访问获取缓存值 不被调用
    expect(getter).toHaveBeenCalledTimes(1)

    // should not compute until needed
    value.foo = 1
    // 响应式对象值改变了 只是触发trigger走schelder _dirty为true
    expect(getter).toHaveBeenCalledTimes(1)

    // now it should compute
    expect(cValue.value).toBe(1)
    // 再次访问 _dirty为true getter重新执行 并且_dirty为false
    expect(getter).toHaveBeenCalledTimes(2)

    // should not compute again
    cValue.value
    // 继续访问 依旧拿缓存
    expect(getter).toHaveBeenCalledTimes(2)
  })
})
