'use strict'

Object.defineProperty(exports, '__esModule', { value: true })

const extend = Object.assign
const isObject = value => typeof value === 'object' && value !== null
const hasChanged = (value, oldValue) => !Object.is(value, oldValue)
const isFunction = val => typeof val === 'function'
const isArray = Array.isArray
const isOn = val => /^on[A-Z]/.test(val)
const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key)
// add => Add
const capitalize = val => val.charAt(0).toUpperCase() + val.slice(1)
// add-foo => addFoo
const camelize = val =>
  val.replace(/-(\w)/g, (_, c) => {
    return c ? c.toUpperCase() : ''
  })
const toHandlerKey = val => 'on' + val

const Fragment = Symbol('Fragment')
const Text = Symbol('Text')
function createVNode(type, props, children) {
  const vnode = {
    type,
    props,
    children,
    el: null,
    shapeFlag: getShapeFlag(type)
  }
  if (typeof children === 'string') {
    vnode.shapeFlag |= 4 /* TEXT_CHILDREN */
  } else if (isArray(children)) {
    vnode.shapeFlag |= 8 /* ARRAY_CHILDREN */
  }
  if (vnode.shapeFlag & 2 /* STATEFUL_COMPONENT */ && isObject(children)) {
    vnode.shapeFlag |= 16 /* SLOT_CHILDREN */
  }
  return vnode
}
function createTextVNode(text) {
  return createVNode(Text, {}, text)
}
function getShapeFlag(type) {
  if (isObject(type)) {
    return 2 /* STATEFUL_COMPONENT */
  } else {
    return 1 /* ELEMENT */
  }
}

function h(type, props, children) {
  return createVNode(type, props, children)
}

function renderSlots(slots, name, props) {
  const slot = slots[name]
  if (slot) {
    if (isFunction(slot)) {
      return slot ? createVNode(Fragment, {}, slot(props)) : ''
    }
  }
}

const targetMap = new WeakMap()
let activeEffect
class ReactiveEffect {
  constructor(fn, scheduler = null) {
    this.fn = fn
    this.scheduler = scheduler
    this.deps = []
    this.active = true
    this.fn = fn
  }
  run() {
    if (!this.active) {
      // 当使用stop(effect)后，我们在去执行runner就是执行run方法，因为进行了stop所以要在这里返回this.fn() 不能让activeEffect在赋值，不然会继续收集依赖
      return this.fn()
    }
    try {
      activeEffect = this
      return this.fn()
    } finally {
      // 当fn执行完之后要把activeEffect清空 如果不清除下次访问属性的时候会把之前的fn收集进去
      activeEffect = undefined
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
function cleanupEffect(effect) {
  const { deps } = effect
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
function track(target, key) {
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  trackEffects(dep)
}
function trackEffects(dep) {
  // 这里的判断 activeEffect存在时才会收集依赖 因为每次属性被访问都会出发track函数 比如 a=obj.b也会触发
  if (isTracking()) {
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
function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    // never been tracked
    return
  }
  const dep = depsMap.get(key)
  triggerEffects(dep)
}
function triggerEffects(dep) {
  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }
}
function isTracking() {
  return activeEffect !== undefined
}
function effect(fn, options) {
  const _effect = new ReactiveEffect(fn)
  options && extend(_effect, options)
  _effect.run()
  const runner = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner
}

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)
function createGetter(isReadonly = false, shallow = false) {
  return function get(target, key) {
    if (key === '__v_isReactive' /* IS_REACTIVE */) {
      // 注意：这里返回的是!isReadonly而不是true的原因是
      // 当对象是readonly的时候就不是reactive
      return !isReadonly
    } else if (key === '__v_isReadonly' /* IS_READONLY */) {
      // 注意：这里返回的是isReadonly而不是true的原因是
      // 当对象是reactive的时候就不是readonly
      return isReadonly
    }
    const res = Reflect.get(target, key)
    if (!isReadonly) {
      track(target, key)
    }
    if (shallow) {
      return res
    }
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res)
    }
    console.log('触发了getter', key, res)
    return res
  }
}
function createSetter() {
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value)
    trigger(target, key)
    return res
  }
}
const mutableHandlers = {
  get,
  set
}
const readonlyHandlers = {
  get: readonlyGet,
  set(target, key) {
    console.warn(
      `Set operation on key "${String(key)}" failed: target is readonly.`,
      target
    )
    return true
  }
}
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
  get: shallowReadonlyGet
})

function reactive(raw) {
  return createReactiveObject(raw, mutableHandlers)
}
function readonly(raw) {
  return createReactiveObject(raw, readonlyHandlers)
}
function shallowReadonly(raw) {
  return createReactiveObject(raw, shallowReadonlyHandlers)
}
function createReactiveObject(target, baseHandles) {
  if (!isObject(target)) {
    console.warn(`target ${target} must be is Object`)
    return
  }
  return new Proxy(target, baseHandles)
}

class RefImpl {
  constructor(value) {
    this.__v_isRef = true
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
function ref(value) {
  return new RefImpl(value)
}
function isRef(r) {
  return Boolean(r && r.__v_isRef)
}
function unref(r) {
  return isRef(r) ? r.value : r
}
function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, {
    get(target, key) {
      return unref(Reflect.get(target, key))
    },
    set(target, key, value) {
      const oldValue = target[key]
      if (isRef(oldValue) && !isRef(value)) {
        oldValue.value = value
        return true
      } else {
        return Reflect.set(target, key, value)
      }
    }
  })
}

function emit(instance, event, ...args) {
  const { props } = instance
  event = toHandlerKey(camelize(capitalize(event)))
  const handle = props[event]
  handle && handle(...args)
}

function initProps(instance, rawProps) {
  instance.props = rawProps || {}
}

const publicPropertiesMap = {
  $el: i => i.vnode.el,
  $slots: i => i.slots
}
const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    const { setupState, props } = instance
    if (hasOwn(setupState, key)) {
      return setupState[key]
    } else if (hasOwn(props, key)) {
      return props[key]
    }
    const publicGetter = publicPropertiesMap[key]
    if (publicGetter) {
      return publicGetter(instance)
    }
  }
}

function initSlots(instance, children) {
  const { shapeFlag } = instance.vnode
  if (shapeFlag & 16 /* SLOT_CHILDREN */) {
    normalizeObjectSlots(children, instance)
  }
}
function normalizeObjectSlots(children, instance) {
  const slots = {}
  for (const name in children) {
    if (hasOwn(children, name)) {
      const slot = children[name]
      slots[name] = props => normalizeSlotValue(slot(props))
    }
  }
  instance.slots = slots
}
function normalizeSlotValue(value) {
  return isArray(value) ? value : [value]
}

let currentInstance = null
function createComponentInstance(vnode, parent) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    slots: {},
    provides: parent ? parent.provides : {},
    parent,
    isMounted: false,
    subTree: {},
    emit: () => {}
  }
  component.emit = emit.bind(null, component)
  // console.log('createComponentInstance', parent, component)
  return component
}
function setupComponent(instance) {
  // TODO:
  initProps(instance, instance.vnode.props)
  initSlots(instance, instance.vnode.children)
  setupStatefulComponent(instance)
}
function setupStatefulComponent(instance) {
  const Component = instance.type
  // 声依永proxy将setupState挂在到组建实例上
  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers)
  // call setup()
  const { setup } = Component
  if (setup) {
    setCurrentInstance(instance)
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit
    })
    setCurrentInstance(null)
    handleSetupResult(instance, setupResult)
  }
}
function handleSetupResult(instance, setupResult) {
  if (isFunction(setupResult));
  else if (isObject(setupResult)) {
    instance.setupState = proxyRefs(setupResult)
  }
  finishComponentSetup(instance)
}
function finishComponentSetup(instance) {
  const Component = instance.type
  if (Component.render) {
    instance.render = Component.render
  }
}
function setCurrentInstance(instance) {
  currentInstance = instance
}
function getCurrentInstace() {
  return currentInstance
}

function provide(key, value) {
  const currentInstance = getCurrentInstace()
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
function inject(key, defaultValue) {
  const currentInstance = getCurrentInstace()
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

function createAppAPI(render) {
  return function createApp(rootComponent) {
    return {
      mount(rootContainer) {
        // 生成vnode
        const vnode = createVNode(rootComponent)
        // 渲染vnode
        render(vnode, rootContainer)
      }
    }
  }
}

function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert
  } = options
  function render(vnode, container) {
    patch(null, vnode, container, null)
  }
  function patch(n1, n2, container, parentComponent) {
    // 处理组件
    const { type, shapeFlag } = n2
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent)
        break
      case Text:
        processText(n1, n2, container)
        break
      default:
        if (shapeFlag & 2 /* STATEFUL_COMPONENT */) {
          processComponent(n1, n2, container, parentComponent)
        } else if (shapeFlag & 1 /* ELEMENT */) {
          processElement(n1, n2, container, parentComponent)
        }
        break
    }
  }
  function processFragment(n1, n2, container, parentComponent) {
    mountChildren(n2.children, container, parentComponent)
  }
  function processText(n1, n2, container) {
    const text = (n2.el = document.createTextNode(n2.children))
    container.append(text)
  }
  function processComponent(n1, n2, container, parentComponent) {
    mountComponent(n2, container, parentComponent)
  }
  function processElement(n1, n2, container, parentComponent) {
    if (!n1) {
      mountElement(null, n2, container, parentComponent)
    } else {
      patchElement(n1, n2)
    }
  }
  // mount
  function mountComponent(initialVNode, container, parentComponent) {
    const instance = createComponentInstance(initialVNode, parentComponent)
    setupComponent(instance)
    setupRenderEffect(instance, initialVNode, container)
  }
  function mountElement(n1, n2, container, parentComponent) {
    const { type, props, children, shapeFlag } = n2
    // 生成标签
    // const el = (vnode.el = document.createElement(type))
    const el = (n2.el = hostCreateElement(type))
    // 生成属性
    for (const key in props) {
      if (hasOwn(props, key)) {
        const value = props[key]
        // value = isArray(value) ? value.join(' ') : value
        // if (isOn(key)) {
        //   // 处理事件
        //   const event = key.slice(2).toLowerCase()
        //   el.addEventListener(event, value)
        // } else {
        //   // 处理属性
        //   el.setAttribute(key, value)
        // }
        hostPatchProp(el, key, null, value)
      }
    }
    // 生成子节点
    if (shapeFlag & 4 /* TEXT_CHILDREN */) {
      // 文本节点
      el.textContent = children
    } else if (shapeFlag & 8 /* ARRAY_CHILDREN */) {
      mountChildren(children, el, parentComponent)
    }
    // container.append(el)
    hostInsert(el, container)
  }
  function mountChildren(children, el, parentComponent) {
    children.forEach(vnode => {
      patch(null, vnode, el, parentComponent)
    })
  }
  // patch
  function patchElement(n1, n2, container) {
    console.log('patchElement')
    console.log('n1', n1)
    console.log('n2', n2)
    const el = (n2.el = n1.el)
    const prevProps = n1.props || {}
    const nextProps = n2.props || {}
    patchProp(el, prevProps, nextProps)
  }
  function patchProp(el, oldProps, newProps) {
    if (oldProps !== newProps) {
      for (const key in newProps) {
        const next = newProps[key]
        const prev = oldProps[key]
        if (next !== prev) {
          hostPatchProp(el, key, prev, next)
        }
      }
    }
    if (oldProps !== {}) {
      for (const key in oldProps) {
        if (!(key in newProps)) {
          hostPatchProp(el, key, oldProps[key], null)
        }
      }
    }
  }
  function setupRenderEffect(instance, initialVNode, container) {
    effect(() => {
      if (!instance.isMounted) {
        console.log('init')
        const { proxy } = instance
        const subTree = (instance.subTree = instance.render.call(proxy))
        patch(null, subTree, container, instance)
        // patch之后将跟节点挂在到vnode上 就是createVNode创建出来的对象中的el
        initialVNode.el = subTree.el
        instance.isMounted = true
      } else {
        console.log('update')
        const { proxy } = instance
        const subTree = instance.render.call(proxy)
        const prevSubtree = instance.subTree
        instance.subTree = subTree
        console.log('current', subTree)
        console.log('prev', prevSubtree)
        patch(prevSubtree, subTree, container, instance)
      }
    })
  }
  return {
    createApp: createAppAPI(render)
  }
}

function createElement(tag) {
  return document.createElement(tag)
}
function patchProp(el, key, oldValue, newValue) {
  newValue = isArray(newValue) ? newValue.join(' ') : newValue
  if (isOn(key)) {
    // 处理事件
    const event = key.slice(2).toLowerCase()
    el.addEventListener(event, newValue)
  } else {
    // 处理属性
    if (newValue === undefined || newValue === null) {
      el.removeAttribute(key)
    } else {
      el.setAttribute(key, newValue)
    }
  }
}
function insert(el, parent) {
  parent.append(el)
}
const renderer = createRenderer({
  createElement,
  patchProp,
  insert
})
const createApp = (...args) => {
  return renderer.createApp(...args)
}

exports.createApp = createApp
exports.createRenderer = createRenderer
exports.createTextVNode = createTextVNode
exports.getCurrentInstace = getCurrentInstace
exports.h = h
exports.inject = inject
exports.provide = provide
exports.reactive = reactive
exports.ref = ref
exports.renderSlots = renderSlots
