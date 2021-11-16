function createVNode(type, props, children) {
  return {
    type: type,
    props: props,
    children: children
  }
}

function isObject(value) {
  return typeof value === 'object' && value !== null
}
var isFunction = function (val) {
  return typeof val === 'function'
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
  instance.proxy = new Proxy(
    {},
    {
      get: function (target, key) {
        var setupState = instance.setupState
        if (key in setupState) {
          return setupState[key]
        }
      }
    }
  )
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
  if (isObject(vnode.type)) {
    processComponent(vnode, container)
  } else {
    // TODO: element
    processElement(vnode, container)
  }
}
function processComponent(vnode, container) {
  mountComponent(vnode, container)
}
function processElement(vnode, container) {
  mountElement(vnode, container)
}
function mountComponent(vnode, container) {
  var instance = createComponentInstance(vnode)
  setupComponent(instance)
  setupRenderEffect(instance, container)
}
function mountElement(vnode, container) {
  var type = vnode.type,
    props = vnode.props,
    children = vnode.children
  // 生成标签
  var el = document.createElement(type)
  // 生成属性
  for (var key in props) {
    if (Object.prototype.hasOwnProperty.call(props, key)) {
      var value = Array.isArray(props[key]) ? props[key].join(' ') : props[key]
      el.setAttribute(key, value)
    }
  }
  // 生成子节点
  if (typeof children === 'string') {
    // 文本节点
    el.textContent = children
  } else if (Array.isArray(children)) {
    mountChildren(children, el)
  }
  container.append(el)
}
function mountChildren(children, el) {
  children.forEach(function (vnode) {
    patch(vnode, el)
  })
}
function setupRenderEffect(instance, container) {
  var proxy = instance.proxy
  var subTree = instance.render.call(proxy)
  patch(subTree, container)
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
  return {
    type: type,
    props: props,
    children: children
  }
}

export { createApp, h }
