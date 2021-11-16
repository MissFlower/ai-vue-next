var extend = Object.assign
function isObject(value) {
  return typeof value === 'object' && value !== null
}
var isFunction = function (val) {
  return typeof val === 'function'
}
var isArray = function (val) {
  return Array.isArray(val)
}
var isOn = function (val) {
  return /^on[A-Z]/.test(val)
}
var hasOwn = function (obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

function createVNode(type, props, children) {
  var vnode = {
    type: type,
    props: props,
    children: children,
    el: null,
    shapeFlag: getShapeFlag(type)
  }
  if (typeof children === 'string') {
    vnode.shapeFlag |= 4 /* TEXT_CHILDREN */
  } else if (isArray(children)) {
    vnode.shapeFlag |= 8 /* ARRAY_CHILDREN */
  }
  return vnode
}
function getShapeFlag(type) {
  if (isObject(type)) {
    return 2 /* STATEFUL_COMPONENT */
  } else {
    return 1 /* ELEMENT */
  }
}

var targetMap = new WeakMap()
// {
//   target: { // new WeakMap
//     key: { // new Map()
//       dep: new Set()
//     }
//   }
// }
function track(target, key) {
  var depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  var dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
}
function trigger(target, key) {
  var depsMap = targetMap.get(target)
  var dep = depsMap.get(key)
  triggerEffects(dep)
}
function triggerEffects(dep) {
  for (var _i = 0, dep_1 = dep; _i < dep_1.length; _i++) {
    var effect_1 = dep_1[_i]
    if (effect_1.scheduler) {
      effect_1.scheduler()
    } else {
      effect_1.run()
    }
  }
}

var get = createGetter()
var set = createSetter()
var readonlyGet = createGetter(true)
var shallowReadonlyGet = createGetter(true, true)
function createGetter(isReadonly, shallow) {
  if (isReadonly === void 0) {
    isReadonly = false
  }
  if (shallow === void 0) {
    shallow = false
  }
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
    var res = Reflect.get(target, key)
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
    var res = Reflect.set(target, key, value)
    trigger(target, key)
    return res
  }
}
var mutableHandlers = {
  get: get,
  set: set
}
var readonlyHandlers = {
  get: readonlyGet,
  set: function (target, key) {
    console.warn(
      'Set operation on key "' + String(key) + '" failed: target is readonly.',
      target
    )
    return true
  }
}
var shallowReadonlyHandlers = extend({}, readonlyHandlers, {
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
    console.warn('target ' + target + ' must be is Object')
    return
  }
  return new Proxy(target, baseHandles)
}

function initProps(instance, rawProps) {
  instance.props = rawProps || {}
}

var publicPropertiesMap = {
  $el: function (i) {
    return i.vnode.el
  }
}
var PublicInstanceProxyHandlers = {
  get: function (_a, key) {
    var instance = _a._
    var setupState = instance.setupState,
      props = instance.props
    if (hasOwn(setupState, key)) {
      return setupState[key]
    } else if (hasOwn(props, key)) {
      return props[key]
    }
    var publicGetter = publicPropertiesMap[key]
    if (publicGetter) {
      return publicGetter(instance)
    }
  }
}

function createComponentInstance(vnode) {
  var component = {
    vnode: vnode,
    type: vnode.type,
    setupState: {},
    props: {}
  }
  return component
}
function setupComponent(instance) {
  // TODO:
  initProps(instance, instance.vnode.props)
  // initSlots()
  setupStatefulComponent(instance)
}
function setupStatefulComponent(instance) {
  var Component = instance.type
  // 声依永proxy将setupState挂在到组建实例上
  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers)
  // call setup()
  var setup = Component.setup
  if (setup) {
    var setupResult = setup(shallowReadonly(instance.props))
    handleSetupResult(instance, setupResult)
  }
}
function handleSetupResult(instance, setupResult) {
  if (isFunction(setupResult));
  else if (isObject(setupResult)) {
    instance.setupState = setupResult
  }
  finishComponentSetup(instance)
}
function finishComponentSetup(instance) {
  var Component = instance.type
  if (Component.render) {
    instance.render = Component.render
  }
}

function render(vnode, container) {
  patch(vnode, container)
}
function patch(vnode, container) {
  // 处理组件
  var shapeFlag = vnode.shapeFlag
  if (shapeFlag & 2 /* STATEFUL_COMPONENT */) {
    processComponent(vnode, container)
  } else if (shapeFlag & 1 /* ELEMENT */) {
    processElement(vnode, container)
  }
}
function processComponent(vnode, container) {
  mountComponent(vnode, container)
}
function processElement(vnode, container) {
  mountElement(vnode, container)
}
function mountComponent(initialVNode, container) {
  var instance = createComponentInstance(initialVNode)
  setupComponent(instance)
  setupRenderEffect(instance, initialVNode, container)
}
function mountElement(vnode, container) {
  var type = vnode.type,
    props = vnode.props,
    children = vnode.children,
    shapeFlag = vnode.shapeFlag
  // 生成标签
  var el = (vnode.el = document.createElement(type))
  // 生成属性
  for (var key in props) {
    if (hasOwn(props, key)) {
      var value = isArray(props[key]) ? props[key].join(' ') : props[key]
      if (isOn(key)) {
        // 处理事件
        var event_1 = key.slice(2).toLowerCase()
        el.addEventListener(event_1, value)
      } else {
        // 处理属性
        el.setAttribute(key, value)
      }
    }
  }
  // 生成子节点
  if (shapeFlag & 4 /* TEXT_CHILDREN */) {
    // 文本节点
    el.textContent = children
  } else if (shapeFlag & 8 /* ARRAY_CHILDREN */) {
    mountChildren(children, el)
  }
  container.append(el)
}
function mountChildren(children, el) {
  children.forEach(function (vnode) {
    patch(vnode, el)
  })
}
function setupRenderEffect(instance, initialVNode, container) {
  var proxy = instance.proxy
  var subTree = instance.render.call(proxy)
  patch(subTree, container)
  // patch之后将跟节点挂在到vnode上 就是createVNode创建出来的对象中的el
  initialVNode.el = subTree.el
}

function createApp(rootComponent) {
  return {
    mount: function (rootContainer) {
      // 生成vnode
      var vnode = createVNode(rootComponent)
      // 渲染vnode
      render(vnode, rootContainer)
    }
  }
}

function h(type, props, children) {
  return createVNode(type, props, children)
}

export { createApp, h }
