import { readonly } from '../reactive'

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
    console.warn = jest.fn()
    const user = readonly({
      age: 10
    })

    user.age = 11
    expect(user.age).toBe(10)
    expect(console.warn).toBeCalled()
  })
})
