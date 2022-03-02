import { EMPTY_OBJ, hasOwn } from './../shared/index'
import { ShapeFlags } from '../shared/shapeFlags'
import { createComponentInstance, setupComponent } from './component'
import { Fragment, isSameVNodeType, Text } from './vnode'
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
    patch(null, vnode, container, null, null)
  }

  function patch(n1, n2, container, parentComponent, anchor) {
    // 处理组件
    const { type, shapeFlag } = n2
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor)
        break
      case Text:
        processText(n1, n2, container)
        break

      default:
        if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent, anchor)
        } else if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent, anchor)
        }
        break
    }
  }

  function processFragment(n1, n2, container: any, parentComponent, anchor) {
    mountChildren(n2.children, container, parentComponent, anchor)
  }

  function processText(n1, n2, container: any) {
    const text = (n2.el = document.createTextNode(n2.children))
    container.append(text)
  }

  function processComponent(n1, n2, container: any, parentComponent, anchor) {
    mountComponent(n2, container, parentComponent, anchor)
  }

  function processElement(n1, n2, container: any, parentComponent, anchor) {
    if (!n1) {
      mountElement(n2, container, parentComponent, anchor)
    } else {
      patchElement(n1, n2, container, parentComponent, anchor)
    }
  }

  // mount
  function mountComponent(
    initialVNode: any,
    container,
    parentComponent,
    anchor
  ) {
    const instance = createComponentInstance(initialVNode, parentComponent)

    setupComponent(instance)
    setupRenderEffect(instance, initialVNode, container, anchor)
  }

  function mountElement(n2, container: any, parentComponent, anchor) {
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
      mountChildren(children, el, parentComponent, anchor)
    }

    // container.append(el)
    hostInsert(el, container, anchor)
  }

  function mountChildren(
    children: any[],
    container: any,
    parentComponent,
    anchor
  ) {
    children.forEach(vnode => {
      patch(null, vnode, container, parentComponent, anchor)
    })
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

  function patchProp(el: any, oldProps: any, newProps: any) {
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
    // 自节点有三种可能情况： text array 没有节点 null
    // 新节点为文本节点
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 如果老节点是数组节点 新节点是文本节点 卸载老节点
        unmountChildren(c1)
      }
      // 设置文本节点
      if (c1 !== c2) {
        // 新老节点不一样的时候触发设置文本节点
        hostSetElementText(container, c2)
      }
    } else {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 新节点为 array | no children
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // 新节点为 array 新老节点都是array 进行diff
          patchKeyedChildren(c1, c2, container, parentComponent, anchor)
        } else {
          // 老节点是数组 没有新的孩子节点 卸载旧节点
          unmountChildren(c1)
        }
      } else {
        // 老的节点是文本或空
        // 新的节点是数组或空
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
          // 老的节点是文本
          // 删除老节点
          hostSetElementText(container, '')
        }
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // 添加新节点
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

    // 1. 从头同步
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
    // 2. 从尾同步
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
    // 3. 普通序列+挂载
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
    // 4. 常用序列+卸载
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
    // 5. 未知序列
    // [i ... e1 + 1]: a b [c d e] f g
    // [i ... e2 + 1]: a b [e d c h] f g
    // i = 2, e1 = 4, e2 = 5
    else {
      debugger
      const s1 = i // 老的起始下标
      const s2 = i // 新的起始下标

      // 5.1 为 newChildren 构建 key:index map
      const keyToNewIndexMap = new Map()
      for (let i = s2; i <= e2; i++) {
        const nextChild = c2[i]
        if (nextChild.key != null) {
          // != null 包含了 null 和 undefined
          keyToNewIndexMap.set(nextChild.key, i)
        }
      }

      // 5.2 循环遍历老节点 进行打补丁
      // 匹配节点并删除不再存在的节点
      let patched = 0 // 已经打过补丁的个数
      let toBePatch = e2 - s2 + 1 // 将要被打补丁的总数
      for (let i = s1; i <= e1; i++) {
        const preChild = c1[i]
        if (patched >= toBePatch) {
          // [i ... e1 + 1]: a b [c d e h i] f g
          // [i ... e2 + 1]: a b [e c] f g
          // 如果打过补丁的个数 >= 将要被打补丁的总数 说明剩下的老节点都要被卸载
          // h i将被直接卸载
          unmount(preChild.el)
          continue
        }
        let newIndex
        if (preChild.key != null) {
          // 如果老节点有key的话 直接在map中取值
          newIndex = keyToNewIndexMap.get(preChild.key)
        } else {
          // 老节点没有key 就尝试定位同类型的无键节点
          for (let j = 0; j <= e2; j++) {
            if (isSameVNodeType(preChild, c2[j])) {
              // 如果找到相同的节点 给newIndex赋值 直接跳出循环
              newIndex = j
              break
            }
          }
        }

        if (newIndex === undefined) {
          // 新的节点中没有这个老节点 进行卸载
          unmount(preChild.el)
        } else {
          // 新的节点中存在这个老节点 再次进行patch
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

      // 5.3 移动和挂载
      // 仅在节点移动时生成最长稳定子序列
    }
  }

  function setupRenderEffect(instance, initialVNode, container, anchor) {
    effect(() => {
      if (!instance.isMounted) {
        console.log('init')
        const { proxy } = instance
        const subTree = (instance.subTree = instance.render.call(proxy))
        patch(null, subTree, container, instance, anchor)
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
        patch(prevSubtree, subTree, container, instance, anchor)
      }
    })
  }

  return {
    createApp: createAppAPI(render)
  }
}

// https://en.wikipedia.org/wiki/Longest_increasing_subsequence
function getSequence(arr: number[]): number[] {
  const p = arr.slice()
  const result = [0]
  let i, j, u, v, c
  const len = arr.length
  for (i = 0; i < len; i++) {
    const arrI = arr[i]
    if (arrI !== 0) {
      j = result[result.length - 1]
      if (arr[j] < arrI) {
        p[i] = j
        result.push(i)
        continue
      }
      u = 0
      v = result.length - 1
      while (u < v) {
        c = (u + v) >> 1
        if (arr[result[c]] < arrI) {
          u = c + 1
        } else {
          v = c
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1]
        }
        result[u] = i
      }
    }
  }
  u = result.length
  v = result[u - 1]
  while (u-- > 0) {
    result[u] = v
    v = p[v]
  }
  return result
}
