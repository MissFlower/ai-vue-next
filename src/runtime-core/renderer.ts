import { EMPTY_OBJ, hasOwn } from '../shared/index'
import { ShapeFlags } from '../shared/shapeFlags'
import { createComponentInstance, setupComponent } from './component'
import { Fragment, isSameVNodeType, Text } from './vnode'
import { createAppAPI } from './createApp'
import { effect } from '../reactivity/effect'
import { shouldUpdateComponent } from './componentUpdateUtils'
import { queueJobs } from './scheduler'

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
    if (!n1) {
      mountComponent(n2, container, parentComponent, anchor)
    } else {
      updateComponent(n1, n2)
    }
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
    const instance = (initialVNode.component = createComponentInstance(
      initialVNode,
      parentComponent
    ))

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

  // update component
  function updateComponent(n1, n2) {
    // 每次属性更新 都会触发patch 如果不是props更新就没必要更新组件
    const instance = (n2.component = n1.component)
    if (shouldUpdateComponent(n1, n2)) {
      instance.next = n2
      instance.update()
    } else {
      // 不需要更新的时候 需要把n1.el 给到n2
      n2.el = n1.el
      n2.vnode = n2
    }
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
      const toBePatch = e2 - s2 + 1 // 将要被打补丁的总数
      let maxNewIndexSoFar = 0 // 用于跟踪是否有任何节点移动
      let move = false // 是否需要移动
      const newIndexToOldIndexMap = new Array(toBePatch) // 创建一个以新节点个数为长度的数组 数组中每一项存放老节点的下标
      // 初始化都为0 这里初始化不是设置0 不使用fill是性能问题
      for (let i = 0; i < toBePatch; i++) {
        newIndexToOldIndexMap[i] = 0
      }
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
          // 这个老节点在新节点中也存在 记录下新节点下标newIndex对应的老节点的下标i
          // 由于初始化为0 而0在后面会被处理为新增 所以这里进行了i+1
          // 解决下面的情况 会出现的问题
          // [c d e] f g
          // [e d c h] f g
          // 当处理c的时候发现c在新节点中也存在 走到这块如果设置为i就是0 那么后面处理新增的时候就会把c在创建一份 而c只是要移动位置
          newIndexToOldIndexMap[newIndex - s2] = i + 1
          // 判断是否需要移动
          // 解决一下情况
          // a b [d] f g
          // a b [c d e] f g
          // 上面的d不需要移动 只需要创建c e节点
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex
          } else {
            move = true
          }
          // 再次进行patch
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
      // 5.2 流程走完 卸载了新节点没有的老节点 新节点中有的老节点会再次打补丁 所以这个时候新节点中所有的老节点都是有el属性的

      // 5.3 移动和挂载
      // 仅在节点移动时生成最长稳定子序列
      const increasingNewIndexSequence = move
        ? getSequence(newIndexToOldIndexMap)
        : [] // 生成最长递增子序列的下标
      let j = increasingNewIndexSequence.length - 1 // 最长递增子序列数组的索引
      for (let i = toBePatch - 1; i >= 0; i--) {
        const nextIndex = s2 + i
        const nextChild = c2[nextIndex]
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : parentAnchor
        if (newIndexToOldIndexMap[i] === 0) {
          // 新增
          patch(null, nextChild, container, parentComponent, anchor)
        } else if (move) {
          if (increasingNewIndexSequence[j] !== i) {
            // 需要移动
            console.log('需要移动', j)
            hostInsert(nextChild.el, container, anchor)
          } else {
            // 不需要移动 最长递增子序列数组的索引前移
            j--
          }
        }
      }
    }
  }

  function setupRenderEffect(instance, initialVNode, container, anchor) {
    instance.update = effect(
      () => {
        if (!instance.isMounted) {
          console.log('init')
          const { proxy } = instance
          const subTree = (instance.subTree = instance.render.call(
            proxy,
            proxy
          ))
          patch(null, subTree, container, instance, anchor)
          // patch之后将跟节点挂在到vnode上 就是createVNode创建出来的对象中的el
          initialVNode.el = subTree.el
          instance.isMounted = true
        } else {
          console.log('update')
          // 找出下次更新的vnode(next) vnode是之前的
          // 先改props然后在进行patch更新
          const { next, vnode } = instance
          if (next) {
            next.el = vnode.el
            updateComponentPreRender(instance, next)
          }
          const { proxy } = instance
          const subTree = instance.render.call(proxy, proxy)
          const prevSubtree = instance.subTree
          instance.subTree = subTree

          console.log('current', subTree)
          console.log('prev', prevSubtree)
          patch(prevSubtree, subTree, container, instance, anchor)
        }
      },
      {
        scheduler: () => {
          console.log('update--scheduler')
          queueJobs(instance.update)
        }
      }
    )
  }

  return {
    createApp: createAppAPI(render)
  }
}

function updateComponentPreRender(instance, nextVNode) {
  instance.vnode = nextVNode
  instance.next = null
  instance.props = nextVNode.props
}

// https://en.wikipedia.org/wiki/Longest_increasing_subsequence
function getSequence(arr: number[]): number[] {
  const p = arr.slice()
  const result = [0]
  let i, j, u, v, c
  const len = arr.length
  for (i = 0; i < len; i++) {
    const arrI = arr[i]
    // 此算法中排除了等于0的情况，原因是0成为了diff算法中的占位符
    if (arrI !== 0) {
      // 用当前num与result中的最后一项对比
      j = result[result.length - 1]
      // 当前数值大于result子序列最后一项时，直接往后新增，并将当前数值的前一位result保存
      if (arr[j] < arrI) {
        p[i] = j // 最后一项与 p 对应的索引进行对应
        result.push(i)
        continue
      }
      u = 0
      v = result.length - 1
      // 当前数值小于result子序列最后一项时，使用二分法找到第一个大于当前数值的下标
      while (u < v) {
        // 除2 并向下取整
        c = (u + v) >> 1
        if (arr[result[c]] < arrI) {
          u = c + 1
        } else {
          v = c
        }
      }
      // 比较 => 替换
      if (arrI < arr[result[u]]) {
        // 找到下标，将当前下标对应的前一位result保存(如果找到的是第一位，不需要操作，第一位前面没有了)
        if (u > 0) {
          p[i] = result[u - 1] // 正确的结果
        }
        // 找到下标，直接替换result中的数值
        result[u] = i // 有可能替换会导致结果不正确，需要一个新数组 p 记录正确的结果
      }
    }
  }
  u = result.length
  v = result[u - 1]
  // 回溯，直接从最后一位开始，将前面的result全部覆盖，如果不需要修正，则p中记录的每一项都是对应的前一位，不会有任何影响
  while (u-- > 0) {
    result[u] = v
    v = p[v]
  }
  return result
}
