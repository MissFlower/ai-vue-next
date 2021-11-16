import { isObject } from '../shared'
import { createComponentInstance, setupComponent } from './component'

export function render(vnode, container) {
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
  const { type, props, children } = vnode
  // 生成标签
  const el = (vnode.el = document.createElement(type))
  // 生成属性
  for (const key in props) {
    if (Object.prototype.hasOwnProperty.call(props, key)) {
      const value = Array.isArray(props[key])
        ? props[key].join(' ')
        : props[key]

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
