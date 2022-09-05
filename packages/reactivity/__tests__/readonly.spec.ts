import {
  isProxy,
  isReactive,
  isReadonly,
  reactive,
  readonly
} from '../src/reactive'
import { vi } from 'vitest'

describe('readonly', () => {
  it('happy path', () => {
    const original = {
      foo: 1,
      bar: {
        baz: 2
      }
    }
    const wrap = readonly(original)
    expect(wrap).not.toBe(original)
    expect(wrap.foo).toBe(1)
  })

  it('warn then set called', () => {
    console.warn = vi.fn()
    const user = readonly({
      age: 10
    })

    user.age = 11
    expect(user.age).toBe(10)
    expect(console.warn).toBeCalled()
  })

  it('isReadonly', () => {
    const original = {
      name: 'july'
    }
    const reaciveObserved = reactive(original)
    const readonlyObserved = readonly(original)

    expect(isReadonly(readonlyObserved)).toBe(true)
    expect(isReadonly(reaciveObserved)).toBe(false)
    expect(isReadonly(original)).toBe(false)
  })
  it('should make nested values readonly', () => {
    const original = { foo: 1, bar: { baz: 2 } }
    const wrapped = readonly(original)
    expect(wrapped).not.toBe(original)
    expect(isProxy(wrapped)).toBe(true)
    expect(isReactive(wrapped)).toBe(false)
    expect(isReadonly(wrapped)).toBe(true)
    expect(isReactive(original)).toBe(false)
    expect(isReadonly(original)).toBe(false)
    expect(isReactive(wrapped.bar)).toBe(false)
    expect(isReadonly(wrapped.bar)).toBe(true)
    expect(isReactive(original.bar)).toBe(false)
    expect(isReadonly(original.bar)).toBe(false)
    // get
    expect(wrapped.foo).toBe(1)
    // has
    expect('foo' in wrapped).toBe(true)
    // ownKeys
    expect(Object.keys(wrapped)).toEqual(['foo', 'bar'])
  })
})
