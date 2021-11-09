import { reactive } from '../reactive'
import { effect, stop } from '../effect'

describe('effect', () => {
  it('happy path', () => {
    const user = reactive({
      age: 18
    })
  
    expect(user.age).toBe(18)
  
    let nextAge
    effect(() => {
      nextAge = user.age + 1
    })
    expect(nextAge).toBe(19)

    user.age++
    expect(nextAge).toBe(20)
  })
  it('effect should return runner function, call it again execute', () => {
    let foo = 1
    const runner = effect(() => {
      foo++
      return "foo"
    })
    expect(foo).toBe(2)

    const r = runner()
    expect(foo).toBe(3)
    expect(r).toBe("foo")
  })

  it('scheduler', () => {
    // scheduler使用和功能描述
    // 1. 通过effect的第二个参数传递 一个叫scheduler的函数
    // 2. effect初次执行的时候 仍然是执行fn 也就是第一个参数
    // 3. 当响应式对象 set函数被触发时 此时不会执行fn 而是会执行 scheduler函数
    // 4. 当执行effect的返回函数 runner时 会再次执行fn
    let dummy
    let run: any
    const scheduler = jest.fn(() => {
      run = runner
    })
    const obj = reactive({ foo: 1 })
    const runner = effect(
      () => {
        dummy = obj.foo
      },
      { scheduler }
    )
    expect(scheduler).not.toHaveBeenCalled()
    expect(dummy).toBe(1)
    // should be called on first trigger
    obj.foo++
    expect(scheduler).toHaveBeenCalledTimes(1)
    // should not run yet
    expect(dummy).toBe(1)
    // manually run
    run()
    // should have run
    expect(dummy).toBe(2)
  });

  it('stop', () => {
    let dummy
    const obj = reactive({ prop: 1 })
    const runner = effect(() => {
      dummy = obj.prop
    })
    obj.prop = 2
    expect(dummy).toBe(2)
    stop(runner)
    obj.prop = 3
    expect(dummy).toBe(2)

    // stopped effect should still be manually callable
    runner()
    expect(dummy).toBe(3)
  })

  it('events: onStop', () => {
    const onStop = jest.fn()
    const runner = effect(() => {}, {
      onStop
    })

    stop(runner)
    expect(onStop).toHaveBeenCalled()
  })
});