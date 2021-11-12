import { isProxy, isReactive, reactive, readonly } from '../reactive'

describe('happy path', () => {
  it('happy path', () => {
    const original = {
      foo: 1
    }
    const observed = reactive(original)

    expect(observed).not.toBe(original)
    expect(observed.foo).toBe(1)
    observed.foo = 5
  })

  it('isReactive', () => {
    const original = {
      foo: 1
    }
    const observed = reactive(original)
    const readonlyObserved = readonly(original)
    expect(isReactive(observed)).toBe(true)
    expect(isReactive(readonlyObserved)).toBe(false)
    expect(isReactive(original)).toBe(false)
    expect(isProxy(original)).toBe(false)
    expect(isProxy(observed)).toBe(true)
    expect(isProxy(readonlyObserved)).toBe(true)
  })

  test('nested reactives', () => {
    // reactive嵌套
    const original = {
      nested: {
        foo: 1
      },
      array: [{ bar: 2 }]
    }
    const observed = reactive(original)
    expect(isReactive(observed.nested)).toBe(true)
    expect(isReactive(observed.array)).toBe(true)
    expect(isReactive(observed.array[0])).toBe(true)
  })
})
