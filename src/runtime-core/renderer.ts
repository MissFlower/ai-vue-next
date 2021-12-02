import { hasOwn } from './../shared/index'
import { ShapeFlags } from '../shared/shapeFlags'
import { createComponentInstance, setupComponent } from './component'
import { Fragment, Text } from './vnode'
import { createAppAPI } from './createApp'
import { effect } from '../reactivity/effect'

export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText
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
      mountElement(n2, container, parentComponent)
    } else {
      patchElement(n1, n2, container, parentComponent)
    }
  }

  // mount
  function mountComponent(initialVNode: any, container, parentComponent) {
    const instance = createComponentInstance(initialVNode, parentComponent)

    setupComponent(instance)
    setupRenderEffect(instance, initialVNode, container)
  }

  function mountElement(n2, container: any, parentComponent) {
    const { type, props, children, shapeFlag } = n2
    // 生成标签
    // const el = (vnode.el = document.createElement(type))
    const el = (n2.el = hostCreateElement(type))
    // 生成属性
    for (const key in props) {
      if (hasOwn(props, key)) {
        const value = props[key]
        hostPatchProp(el, key, null, value)
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
    hostInsert(el, container)
  }

  function mountChildren(children: any[], container: any, parentComponent) {
    children.forEach(vnode => {
      patch(null, vnode, container, parentComponent)
    })
  }

  // patch
  function patchElement(n1, n2, container, parentComponent) {
    console.log('patchElement')
    console.log('n1', n1)
    console.log('n2', n2)
    const el = (n2.el = n1.el)
    const prevProps = n1.props || {}
    const nextProps = n2.props || {}

    patchChildren(n1, n2, el, parentComponent)
    patchProp(el, prevProps, nextProps)
  }

  function patchProp(el: any, oldProps: any, newProps: any) {
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

  function patchChildren(n1, n2, container, parentComponent) {
    const prevShapeFlag = n1.shapeFlag
    const { shapeFlag } = n2
    const c1 = n1.children
    const c2 = n2.children
    // 新节点为文本节点
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 如果老节点是数组节点 新节点是文本节点 卸载老节点
        unmountChildren(n1)
      }
      // 设置文本节点
      if (c1 !== c2) {
        // 新老节点不一样的时候触发设置文本节点
        hostSetElementText(container, c2)
      }
    } else {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // TODO:新老节点都是array
        }
      } else {
        // 老节点是text
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
          hostSetElementText(container, '')
        }

        // 新节点是array
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          mountChildren(c2, container, parentComponent)
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
