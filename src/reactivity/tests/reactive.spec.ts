import { isReactive, reactive, readonly } from '../reactive'

describe('happy path', () => {
  it('happy path', () => {
    const original = {
      foo: 1
    }
    const observed = reactive(original)

    expect(observed).not.toBe(original)
    expect(observed.foo).toBe(1)
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
  })
})
