import { hasOwn } from './../shared/index'
import { ShapeFlags } from '../shared/shapeFlags'
import { createComponentInstance, setupComponent } from './component'
import { Fragment, Text } from './vnode'
import { createAppAPI } from './createApp'
import { effect } from '../reactivity/effect'

export function createRenderer(options) {
  const { createElement, patchProp, insert } = options
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
        if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent)
        } else if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent)
        }
        break
    }
  }

  function processFragment(n1, n2, container: any, parentComponent) {
    mountChildren(n2.children, container, parentComponent)
  }

  function processText(n1, n2, container: any) {
    const text = (n2.el = document.createTextNode(n2.children))
    container.append(text)
  }

  function processComponent(n1, n2, container: any, parentComponent) {
    mountComponent(n2, container, parentComponent)
  }

  function processElement(n1, n2, container: any, parentComponent) {
    if (!n1) {
      mountElement(null, n2, container, parentComponent)
    } else {
      patchElement(n1, n2, container)
    }
  }

  // mount
  function mountComponent(initialVNode: any, container, parentComponent) {
    const instance = createComponentInstance(initialVNode, parentComponent)

    setupComponent(instance)
    setupRenderEffect(instance, initialVNode, container)
  }

  function mountElement(n1, n2, container: any, parentComponent) {
    const { type, props, children, shapeFlag } = n2
    // 生成标签
    // const el = (vnode.el = document.createElement(type))
    const el = (n2.el = createElement(type))
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
        patchProp(el, key, value)
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
      patch(null, vnode, el, parentComponent)
    })
  }

  // patch
  function patchElement(n1, n2, container) {
    console.log('patchElement')
    console.log('n1', n1)
    console.log('n2', n2)
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
