import { isArray, hasOwn, isOn } from './../shared/index'
import { ShapeFlags } from '../shared/shapeFlags'
import { createComponentInstance, setupComponent } from './component'
import { Fragment, Text } from './vnode'
import { createAppAPI } from './createApp'

export function createRenderer(options) {
  const { createElement, patchProps, insert } = options
  function render(vnode, container) {
    patch(vnode, container, null)
  }

  function patch(vnode, container, parentComponent) {
    // 处理组件
    const { type, shapeFlag } = vnode
    switch (type) {
      case Fragment:
        processFragment(vnode, container, parentComponent)
        break
      case Text:
        processText(vnode, container)
        break

      default:
        if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(vnode, container, parentComponent)
        } else if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(vnode, container, parentComponent)
        }
        break
    }
  }

  function processFragment(vnode: any, container: any, parentComponent) {
    mountChildren(vnode.children, container, parentComponent)
  }

  function processText(vnode: any, container: any) {
    const text = (vnode.el = document.createTextNode(vnode.children))
    container.append(text)
  }

  function processComponent(vnode: any, container: any, parentComponent) {
    mountComponent(vnode, container, parentComponent)
  }

  function processElement(vnode: any, container: any, parentComponent) {
    mountElement(vnode, container, parentComponent)
  }

  function mountComponent(initialVNode: any, container, parentComponent) {
    const instance = createComponentInstance(initialVNode, parentComponent)

    setupComponent(instance)
    setupRenderEffect(instance, initialVNode, container)
  }

  function mountElement(vnode: any, container: any, parentComponent) {
    const { type, props, children, shapeFlag } = vnode
    // 生成标签
    // const el = (vnode.el = document.createElement(type))
    const el = (vnode.el = createElement(type))
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
        patchProps(el, key, value)
      }
    }
    // 生成子节点
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 文本节点
      el.textContent = children
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el, parentComponent)
    }

    // container.append(el)
    insert(el, container)
  }

  function mountChildren(children: any[], el: any, parentComponent) {
    children.forEach(vnode => {
      patch(vnode, el, parentComponent)
    })
  }

  function setupRenderEffect(instance, initialVNode, container) {
    const { proxy } = instance
    const subTree = instance.render.call(proxy)
    patch(subTree, container, instance)
    // patch之后将跟节点挂在到vnode上 就是createVNode创建出来的对象中的el
    initialVNode.el = subTree.el
  }

  return {
    createApp: createAppAPI(render)
  }
}
