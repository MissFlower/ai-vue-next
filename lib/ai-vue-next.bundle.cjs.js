'use strict'

Object.defineProperty(exports, '__esModule', { value: true })

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
    type: vnode.type
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
  patch(vnode)
}
function patch(vnode, container) {
  // 处理组件
  processComponent(vnode)
  // TODO: element
}
function processComponent(vnode, container) {
  mountComponent(vnode)
}
function mountComponent(vnode, container) {
  var instance = createComponentInstance(vnode)
  setupComponent(instance)
  setupRenderEffect(instance)
}
function setupRenderEffect(instance, container) {
  var subTree = instance.render()
  patch(subTree)
}

function createApp(rootComponent) {
  return {
    mount: function (rootContainer) {
      // 生成vnode
      var vnode = createVNode(rootComponent)
      // 渲染vnode
      render(vnode)
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

exports.createApp = createApp
exports.h = h
