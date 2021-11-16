'use strict'

Object.defineProperty(exports, '__esModule', { value: true })

function isObject(value) {
  return typeof value === 'object' && value !== null
}
var isFunction = function (val) {
  return typeof val === 'function'
}
var isArray = function (val) {
  return Array.isArray(val)
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

var publicPropertiesMap = {
  $el: function (i) {
    return i.vnode.el
  }
}
var PublicInstanceProxyHandlers = {
  get: function (_a, key) {
    var instance = _a._
    var setupState = instance.setupState
    if (key in setupState) {
      return setupState[key]
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
    setupState: {}
  }
  return component
}
function setupComponent(instance) {
  // TODO:
  // initProps()
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
    var setupResult = setup()
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
    if (Object.prototype.hasOwnProperty.call(props, key)) {
      var value = Array.isArray(props[key]) ? props[key].join(' ') : props[key]
      el.setAttribute(key, value)
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

exports.createApp = createApp
exports.h = h
