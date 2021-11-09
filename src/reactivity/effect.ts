const targetMap = new WeakMap()
let activeEffect

class ReactiveEffect {
  public fn
  public scheduler
  public onStop
  deps = []
  active = true
  constructor(fn, options) {
    this.fn = fn
    this.scheduler = options?.scheduler
    this.onStop = options?.onStop
  }

  run() {
    try {
      activeEffect = this
      return this.fn()
    } finally {
      activeEffect = ''
    }
  }

  stop() {
    if (this.active) {
      cleanupEffect(this)
      if (this.onStop) {
        this.onStop()
      }
      this.active = false
    }
  }
}

export function stop(runner) {
  runner.effect.stop()
}

function cleanupEffect(effect) {
  const {deps} = effect
  if (deps.length) {
    for (let i = 0; i < deps.length; i++) {
      deps[i].delete(effect)    
    }
    // 这里将deps.length设置为0是优化
    // 原本删除数组下标每一个set集合的成员,deps.length长度不变
    // 这里作用是将每一个key的set集合中存放的当前effect删除 即属性值更新不会执行effect函数
    // 当把每一个key的当前effect删除掉之后 就认为依赖清除完了,下次没必要再执行一遍
    deps.length = 0
  }
}
// {
//   target: { // new WeakMap
//     key: { // new Map()
//       dep: new Set()
//     }
//   }
// }
export function track(target, key) {
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }

  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, dep = (new Set()))
  }

  // 这里的判断 activeEffect存在时才会收集依赖 因为每次属性被访问都会出发track函数 比如 a=obj.b也会触发
  if (activeEffect) {
    dep.add(activeEffect)
    // 用户写的每一个effect函数都会new一个新的effect对象 里面各自有自己的deps
    // dep里存放的是每个对象key的effect回调函数fn
    // deps里面是当前effect回调函数里面所有被访问key的回调函数set集合(dep)的数组
    // egg： effect(() => { sum = obj.a + user.name + foo.b})
    // 那么当执行用户写的这个effect时候会new一个effect对象 并有一个deps=[]的属性
    // 然后将关于a的set集合，name的set集合，b的set集合全部放入deps
    // 此时deps里面就包含了用户写的effect函数中所被访问到的所有对象属性的set集合
    // obj.a user.name foo.b每一个属性更新都会执行effect
    // 也就是他们的set集合中都会有一个相同的effect即当前的effect对象
    // 上面stop方法就是将当前effect中所有依赖属性的set集合中删除当前effect 这样当obj.a user.name foo.b更新时因为effect被删除 所以就不会执行了
    activeEffect.deps.push(dep)
  }
}

export function trigger(target, key) {
  const depsMap = targetMap.get(target)
  const dep = depsMap.get(key)

  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }
}

export function effect(fn, options?) {
  const _effect = new ReactiveEffect(fn, options)
  _effect.run()
  const runner:any = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner
}

