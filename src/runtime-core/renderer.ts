import { isArray, hasOwn, isOn } from './../shared/index'
import { ShapeFlags } from '../shared/shapeFlags'
import { createComponentInstance, setupComponent } from './component'
import { Fragment, Text } from './vnode'

export function render(vnode, container) {
  patch(vnode, container)
}

function patch(vnode, container) {
  // 处理组件
  const { type, shapeFlag } = vnode
  switch (type) {
    case Fragment:
      processFragment(vnode, container)
      break
    case Text:
      processText(vnode, container)
      break

    default:
      if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container)
      } else if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container)
      }
      break
  }
}

function processFragment(vnode: any, container: any) {
  mountChildren(vnode.children, container)
}

function processText(vnode: any, container: any) {
  const text = (vnode.el = document.createTextNode(vnode.children))
  container.append(text)
}

function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container)
}

function processElement(vnode: any, container: any) {
  mountElement(vnode, container)
}

function mountComponent(initialVNode: any, container) {
  const instance = createComponentInstance(initialVNode)

  setupComponent(instance)
  setupRenderEffect(instance, initialVNode, container)
}

function mountElement(vnode: any, container: any) {
  const { type, props, children, shapeFlag } = vnode
  // 生成标签
  const el = (vnode.el = document.createElement(type))
  // 生成属性
  for (const key in props) {
    if (hasOwn(props, key)) {
      const value = isArray(props[key]) ? props[key].join(' ') : props[key]
      if (isOn(key)) {
        // 处理事件
        const event = key.slice(2).toLowerCase()
        el.addEventListener(event, value)
      } else {
        // 处理属性
        el.setAttribute(key, value)
      }
    }
  }
  // 生成子节点
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    // 文本节点
    el.textContent = children
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(children, el)
  }

  container.append(el)
}

function mountChildren(children: any[], el: any) {
  children.forEach(vnode => {
    patch(vnode, el)
  })
}

function setupRenderEffect(instance, initialVNode, container) {
  const { proxy } = instance
  const subTree = instance.render.call(proxy)
  patch(subTree, container)
  // patch之后将跟节点挂在到vnode上 就是createVNode创建出来的对象中的el
  initialVNode.el = subTree.el
}
