'use strict'

Object.defineProperty(exports, '__esModule', { value: true })

const extend = Object.assign
const EMPTY_OBJ = {}
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
    key: props === null || props === void 0 ? void 0 : props.key,
    props,
    children,
    component: null,
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
function isSameVNodeType(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key
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
      // ?????????stop(effect)????????????????????????runner????????????run????????????????????????stop????????????????????????this.fn() ?????????activeEffect???????????????????????????????????????
      return this.fn()
    }
    try {
      activeEffect = this
      return this.fn()
    } finally {
      // ???fn?????????????????????activeEffect?????? ?????????????????????????????????????????????????????????fn????????????
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
    // ?????????deps.length?????????0?????????
    // ?????????????????????????????????set???????????????,deps.length????????????
    // ???????????????????????????key???set????????????????????????effect?????? ??????????????????????????????effect??????
    // ???????????????key?????????effect??????????????? ???????????????????????????,??????????????????????????????
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
  // ??????????????? activeEffect??????????????????????????? ???????????????????????????????????????track?????? ?????? a=obj.b????????????
  if (isTracking()) {
    dep.add(activeEffect)
    // ?????????????????????effect????????????new????????????effect?????? ????????????????????????deps
    // dep???????????????????????????key???effect????????????fn
    // deps???????????????effect?????????????????????????????????key???????????????set??????(dep)?????????
    // egg??? effect(() => { sum = obj.a + user.name + foo.b})
    // ?????????????????????????????????effect?????????new??????effect?????? ????????????deps=[]?????????
    // ???????????????a???set?????????name???set?????????b???set??????????????????deps
    // ??????deps??????????????????????????????effect????????????????????????????????????????????????set??????
    // obj.a user.name foo.b?????????????????????????????????effect
    // ??????????????????set?????????????????????????????????effect????????????effect??????
    // ??????stop?????????????????????effect????????????????????????set?????????????????????effect ?????????obj.a user.name foo.b???????????????effect????????? ????????????????????????
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
      // ???????????????????????????!isReadonly?????????true????????????
      // ????????????readonly??????????????????reactive
      return !isReadonly
    } else if (key === '__v_isReadonly' /* IS_READONLY */) {
      // ???????????????????????????isReadonly?????????true????????????
      // ????????????reactive??????????????????readonly
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
    console.log('?????????getter', key, res)
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
    // ????????????????????? ????????????????????????????????? ????????????set????????????????????????
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
  $slots: i => i.slots,
  $props: i => i.props
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
    next: null,
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
  // ?????????proxy???setupState????????????????????????
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
  debugger
  if (currentInstance) {
    let { provides } = currentInstance
    const parentProvides = currentInstance.parent.provides
    // ??????????????????????????????provides????????????
    // ????????????provide??????????????????????????????????????????
    if (provides === parentProvides) {
      // ????????????provides????????????????????????provides????????????
      provides = currentInstance.provides = Object.create(parentProvides)
    }
    provides[key] = value
  }
}
function inject(key, defaultValue) {
  const currentInstance = getCurrentInstace()
  if (currentInstance) {
    // inject???????????????????????????provides?????? ?????????????????????????????????
    const { provides } = currentInstance.parent
    // ?????????????????????????????????key ?????????????????? ??????????????????????????????????????? ?????????
    if (key in provides) {
      return provides[key]
    } else if (defaultValue) {
      // ????????????????????????
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
        // ??????vnode
        const vnode = createVNode(rootComponent)
        // ??????vnode
        render(vnode, rootContainer)
      }
    }
  }
}

function shouldUpdateComponent(prevVNode, nextVNode) {
  const { props: prevProps } = prevVNode
  const { props: nextProps } = nextVNode
  for (const key in nextProps) {
    if (nextProps[key] !== prevProps[key]) {
      return true
    }
  }
  return false
}

const p = Promise.resolve()
const queue = []
let isFlushPending = false
function queueJobs(job) {
  if (!queue.includes(job)) {
    queue.push(job)
  }
  queueFlush()
}
function nextTick(fn) {
  typeof fn ? p.then(fn) : p
}
function queueFlush() {
  if (isFlushPending) {
    return
  }
  isFlushPending = true
  nextTick(flushJobs)
}
function flushJobs() {
  isFlushPending = false
  let job
  while ((job = queue.shift())) {
    job && job()
  }
}

function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText
  } = options
  function render(vnode, container) {
    patch(null, vnode, container, null, null)
  }
  function patch(n1, n2, container, parentComponent, anchor) {
    // ????????????
    const { type, shapeFlag } = n2
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor)
        break
      case Text:
        processText(n1, n2, container)
        break
      default:
        if (shapeFlag & 2 /* STATEFUL_COMPONENT */) {
          processComponent(n1, n2, container, parentComponent, anchor)
        } else if (shapeFlag & 1 /* ELEMENT */) {
          processElement(n1, n2, container, parentComponent, anchor)
        }
        break
    }
  }
  function processFragment(n1, n2, container, parentComponent, anchor) {
    mountChildren(n2.children, container, parentComponent, anchor)
  }
  function processText(n1, n2, container) {
    const text = (n2.el = document.createTextNode(n2.children))
    container.append(text)
  }
  function processComponent(n1, n2, container, parentComponent, anchor) {
    if (!n1) {
      mountComponent(n2, container, parentComponent, anchor)
    } else {
      updateComponent(n1, n2)
    }
  }
  function processElement(n1, n2, container, parentComponent, anchor) {
    if (!n1) {
      mountElement(n2, container, parentComponent, anchor)
    } else {
      patchElement(n1, n2, container, parentComponent, anchor)
    }
  }
  // mount
  function mountComponent(initialVNode, container, parentComponent, anchor) {
    const instance = (initialVNode.component = createComponentInstance(
      initialVNode,
      parentComponent
    ))
    setupComponent(instance)
    setupRenderEffect(instance, initialVNode, container, anchor)
  }
  function mountElement(n2, container, parentComponent, anchor) {
    const { type, props, children, shapeFlag } = n2
    // ????????????
    // const el = (vnode.el = document.createElement(type))
    const el = (n2.el = hostCreateElement(type))
    // ????????????
    for (const key in props) {
      if (hasOwn(props, key)) {
        const value = props[key]
        hostPatchProp(el, key, null, value)
      }
    }
    // ???????????????
    if (shapeFlag & 4 /* TEXT_CHILDREN */) {
      // ????????????
      el.textContent = children
    } else if (shapeFlag & 8 /* ARRAY_CHILDREN */) {
      mountChildren(children, el, parentComponent, anchor)
    }
    // container.append(el)
    hostInsert(el, container, anchor)
  }
  function mountChildren(children, container, parentComponent, anchor) {
    children.forEach(vnode => {
      patch(null, vnode, container, parentComponent, anchor)
    })
  }
  // update component
  function updateComponent(n1, n2) {
    // ?????????????????? ????????????patch ????????????props??????????????????????????????
    const instance = (n2.component = n1.component)
    if (shouldUpdateComponent(n1, n2)) {
      instance.next = n2
      instance.update()
    } else {
      // ???????????????????????? ?????????n1.el ??????n2
      n2.el = n1.el
      n2.vnode = n2
    }
  }
  // patch
  function patchElement(n1, n2, container, parentComponent, anchor) {
    console.log('patchElement')
    console.log('n1', n1)
    console.log('n2', n2)
    const el = (n2.el = n1.el)
    const prevProps = n1.props || EMPTY_OBJ
    const nextProps = n2.props || EMPTY_OBJ
    patchChildren(n1, n2, el, parentComponent, anchor)
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
      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          if (!(key in newProps)) {
            hostPatchProp(el, key, oldProps[key], null)
          }
        }
      }
    }
  }
  function patchChildren(n1, n2, container, parentComponent, anchor) {
    const prevShapeFlag = n1.shapeFlag
    const { shapeFlag } = n2
    const c1 = n1.children
    const c2 = n2.children
    // ????????????????????????????????? text array ???????????? null
    // ????????????????????????
    if (shapeFlag & 4 /* TEXT_CHILDREN */) {
      if (prevShapeFlag & 8 /* ARRAY_CHILDREN */) {
        // ?????????????????????????????? ???????????????????????? ???????????????
        unmountChildren(c1)
      }
      // ??????????????????
      if (c1 !== c2) {
        // ??????????????????????????????????????????????????????
        hostSetElementText(container, c2)
      }
    } else {
      if (prevShapeFlag & 8 /* ARRAY_CHILDREN */) {
        // ???????????? array | no children
        if (shapeFlag & 8 /* ARRAY_CHILDREN */) {
          // ???????????? array ??????????????????array ??????diff
          patchKeyedChildren(c1, c2, container, parentComponent, anchor)
        } else {
          // ?????????????????? ???????????????????????? ???????????????
          unmountChildren(c1)
        }
      } else {
        // ???????????????????????????
        // ???????????????????????????
        if (prevShapeFlag & 4 /* TEXT_CHILDREN */) {
          // ?????????????????????
          // ???????????????
          hostSetElementText(container, '')
        }
        if (shapeFlag & 8 /* ARRAY_CHILDREN */) {
          // ???????????????
          mountChildren(c2, container, parentComponent, anchor)
        }
      }
    }
  }
  function unmountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i].el
      hostRemove(el)
    }
  }
  function unmount(el) {
    hostRemove(el)
  }
  function patchKeyedChildren(
    c1,
    c2,
    container,
    parentComponent,
    parentAnchor
  ) {
    const l2 = c2.length
    let i = 0
    let e1 = c1.length - 1
    let e2 = l2 - 1
    // 1. ????????????
    // (a b) c
    // (a b) d e
    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor)
      } else {
        break
      }
      i++
    }
    // 2. ????????????
    // a (b c)
    // d e (b c)
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor)
      } else {
        break
      }
      e1--
      e2--
    }
    // 3. ????????????+??????
    // (a b)
    // (a b) c
    // i = 2, e1 = 1, e2 = 2
    // (a b)
    // c (a b)
    // i = 0, e1 = -1, e2 = 0
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1
        const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor
        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor)
          i++
        }
      }
    }
    // 4. ????????????+??????
    // (a b) c
    // (a b)
    // i = 2, e1 = 2, e2 = 1
    // a (b c)
    // (b c)
    // i = 0, e1 = 0, e2 = -1
    else if (i > e2) {
      while (i <= e1) {
        unmount(c1[i].el)
        i++
      }
    }
    // 5. ????????????
    // [i ... e1 + 1]: a b [c d e] f g
    // [i ... e2 + 1]: a b [e d c h] f g
    // i = 2, e1 = 4, e2 = 5
    else {
      debugger
      const s1 = i // ??????????????????
      const s2 = i // ??????????????????
      // 5.1 ??? newChildren ?????? key:index map
      const keyToNewIndexMap = new Map()
      for (let i = s2; i <= e2; i++) {
        const nextChild = c2[i]
        if (nextChild.key != null) {
          // != null ????????? null ??? undefined
          keyToNewIndexMap.set(nextChild.key, i)
        }
      }
      // 5.2 ????????????????????? ???????????????
      // ??????????????????????????????????????????
      let patched = 0 // ???????????????????????????
      const toBePatch = e2 - s2 + 1 // ???????????????????????????
      let maxNewIndexSoFar = 0 // ???????????????????????????????????????
      let move = false // ??????????????????
      const newIndexToOldIndexMap = new Array(toBePatch) // ???????????????????????????????????????????????? ??????????????????????????????????????????
      // ???????????????0 ???????????????????????????0 ?????????fill???????????????
      for (let i = 0; i < toBePatch; i++) {
        newIndexToOldIndexMap[i] = 0
      }
      for (let i = s1; i <= e1; i++) {
        const preChild = c1[i]
        if (patched >= toBePatch) {
          // [i ... e1 + 1]: a b [c d e h i] f g
          // [i ... e2 + 1]: a b [e c] f g
          // ??????????????????????????? >= ??????????????????????????? ???????????????????????????????????????
          // h i??????????????????
          unmount(preChild.el)
          continue
        }
        let newIndex
        if (preChild.key != null) {
          // ??????????????????key?????? ?????????map?????????
          newIndex = keyToNewIndexMap.get(preChild.key)
        } else {
          // ???????????????key ???????????????????????????????????????
          for (let j = 0; j <= e2; j++) {
            if (isSameVNodeType(preChild, c2[j])) {
              // ??????????????????????????? ???newIndex?????? ??????????????????
              newIndex = j
              break
            }
          }
        }
        if (newIndex === undefined) {
          // ???????????????????????????????????? ????????????
          unmount(preChild.el)
        } else {
          // ??????????????????????????????????????? ????????????????????????newIndex???????????????????????????i
          // ??????????????????0 ???0?????????????????????????????? ?????????????????????i+1
          // ????????????????????? ??????????????????
          // [c d e] f g
          // [e d c h] f g
          // ?????????c???????????????c???????????????????????? ???????????????????????????i??????0 ??????????????????????????????????????????c??????????????? ???c?????????????????????
          newIndexToOldIndexMap[newIndex - s2] = i + 1
          // ????????????????????????
          // ??????????????????
          // a b [d] f g
          // a b [c d e] f g
          // ?????????d??????????????? ???????????????c e??????
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex
          } else {
            move = true
          }
          // ????????????patch
          patch(
            preChild,
            c2[newIndex],
            container,
            parentComponent,
            parentAnchor
          )
          patched++
        }
      }
      // 5.2 ???????????? ???????????????????????????????????? ????????????????????????????????????????????? ?????????????????????????????????????????????????????????el?????????
      // 5.3 ???????????????
      // ????????????????????????????????????????????????
      const increasingNewIndexSequence = move
        ? getSequence(newIndexToOldIndexMap)
        : [] // ????????????????????????????????????
      let j = increasingNewIndexSequence.length - 1 // ????????????????????????????????????
      for (let i = toBePatch - 1; i >= 0; i--) {
        const nextIndex = s2 + i
        const nextChild = c2[nextIndex]
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : parentAnchor
        if (newIndexToOldIndexMap[i] === 0) {
          // ??????
          patch(null, nextChild, container, parentComponent, anchor)
        } else if (move) {
          if (increasingNewIndexSequence[j] !== i) {
            // ????????????
            console.log('????????????', j)
            hostInsert(nextChild.el, container, anchor)
          } else {
            // ??????????????? ??????????????????????????????????????????
            j--
          }
        }
      }
    }
  }
  function setupRenderEffect(instance, initialVNode, container, anchor) {
    instance.update = effect(
      () => {
        if (!instance.isMounted) {
          console.log('init')
          const { proxy } = instance
          const subTree = (instance.subTree = instance.render.call(proxy))
          patch(null, subTree, container, instance, anchor)
          // patch???????????????????????????vnode??? ??????createVNode???????????????????????????el
          initialVNode.el = subTree.el
          instance.isMounted = true
        } else {
          console.log('update')
          // ?????????????????????vnode(next) vnode????????????
          // ??????props???????????????patch??????
          const { next, vnode } = instance
          if (next) {
            next.el = vnode.el
            updateComponentPreRender(instance, next)
          }
          const { proxy } = instance
          const subTree = instance.render.call(proxy)
          const prevSubtree = instance.subTree
          instance.subTree = subTree
          console.log('current', subTree)
          console.log('prev', prevSubtree)
          patch(prevSubtree, subTree, container, instance, anchor)
        }
      },
      {
        scheduler: () => {
          console.log('update--scheduler')
          queueJobs(instance.update)
        }
      }
    )
  }
  return {
    createApp: createAppAPI(render)
  }
}
function updateComponentPreRender(instance, nextVNode) {
  instance.vnode = nextVNode
  instance.next = null
  instance.props = nextVNode.props
}
// https://en.wikipedia.org/wiki/Longest_increasing_subsequence
function getSequence(arr) {
  const p = arr.slice()
  const result = [0]
  let i, j, u, v, c
  const len = arr.length
  for (i = 0; i < len; i++) {
    const arrI = arr[i]
    // ???????????????????????????0?????????????????????0?????????diff?????????????????????
    if (arrI !== 0) {
      // ?????????num???result????????????????????????
      j = result[result.length - 1]
      // ??????????????????result??????????????????????????????????????????????????????????????????????????????result??????
      if (arr[j] < arrI) {
        p[i] = j // ??????????????? p ???????????????????????????
        result.push(i)
        continue
      }
      u = 0
      v = result.length - 1
      // ??????????????????result????????????????????????????????????????????????????????????????????????????????????
      while (u < v) {
        // ???2 ???????????????
        c = (u + v) >> 1
        if (arr[result[c]] < arrI) {
          u = c + 1
        } else {
          v = c
        }
      }
      // ?????? => ??????
      if (arrI < arr[result[u]]) {
        // ????????????????????????????????????????????????result??????(????????????????????????????????????????????????????????????????????????)
        if (u > 0) {
          p[i] = result[u - 1] // ???????????????
        }
        // ???????????????????????????result????????????
        result[u] = i // ??????????????????????????????????????????????????????????????? p ?????????????????????
      }
    }
  }
  u = result.length
  v = result[u - 1]
  // ???????????????????????????????????????????????????result??????????????????????????????????????????p?????????????????????????????????????????????????????????????????????
  while (u-- > 0) {
    result[u] = v
    v = p[v]
  }
  return result
}

function createElement(tag) {
  return document.createElement(tag)
}
function patchProp(el, key, oldValue, newValue) {
  newValue = isArray(newValue) ? newValue.join(' ') : newValue
  if (isOn(key)) {
    // ????????????
    const event = key.slice(2).toLowerCase()
    el.addEventListener(event, newValue)
  } else {
    // ????????????
    if (newValue === undefined || newValue === null) {
      el.removeAttribute(key)
    } else {
      el.setAttribute(key, newValue)
    }
  }
}
function insert(el, parent, anchor = null) {
  parent.insertBefore(el, anchor)
}
function remove(child) {
  const parentNode = child.parentNode
  if (parentNode) {
    parentNode.removeChild(child)
  }
}
function setElementText(el, text) {
  el.textContent = text
}
const renderer = createRenderer({
  createElement,
  patchProp,
  insert,
  remove,
  setElementText
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
exports.nextTick = nextTick
exports.provide = provide
exports.proxyRefs = proxyRefs
exports.reactive = reactive
exports.ref = ref
exports.renderSlots = renderSlots
