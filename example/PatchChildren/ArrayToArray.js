// 新老节点都是 array

import { h, ref, proxyRefs } from '../../lib/ai-vue-next.bundle.esm.js'

// 1. 左侧的对比
// (a b) c
// (a b) d e
// const prevChildren = [
//   h('p', {key: 'A'}, 'A'),
//   h('p', {key: 'B'}, 'B'),
//   h('p', {key: 'C'}, 'C')
// ]
// const nextChildren = [
//   h('p', {key: 'A'}, 'A'),
//   h('p', {key: 'B'}, 'B'),
//   h('p', {key: 'D'}, 'D'),
//   h('p', {key: 'E'}, 'E')
// ]

// 2. 右侧的对比
// a (b c)
// d e (b c)
// const prevChildren = [
//   h('p', {key: 'A'}, 'A'),
//   h('p', {key: 'B'}, 'B'),
//   h('p', {key: 'C'}, 'C')
// ]
// const nextChildren = [
//   h('p', {key: 'D'}, 'D'),
//   h('p', {key: 'E'}, 'E'),
//   h('p', {key: 'B'}, 'B'),
//   h('p', {key: 'C'}, 'C')
// ]

// 3. 普通序列+挂载
// (a b)
// (a b) c d e
// const prevChildren = [
//   h('p', {key: 'A'}, 'A'),
//   h('p', {key: 'B'}, 'B')
// ]
// const nextChildren = [
//   h('p', {key: 'A'}, 'A'),
//   h('p', {key: 'B'}, 'B'),
//   h('p', {key: 'C'}, 'C'),
//   h('p', {key: 'D'}, 'D'),
//   h('p', {key: 'E'}, 'E'),
// ]
// (a b)
// c d e (a b)
// const prevChildren = [
//   h('p', {key: 'A'}, 'A'),
//   h('p', {key: 'B'}, 'B')
// ]
// const nextChildren = [
//   h('p', {key: 'C'}, 'C'),
//   h('p', {key: 'D'}, 'D'),
//   h('p', {key: 'E'}, 'E'),
//   h('p', {key: 'A'}, 'A'),
//   h('p', {key: 'B'}, 'B'),
// ]

// 3. 普通序列+卸载
// (a b) c d e
// (a b)
// const prevChildren = [
//   h('p', {key: 'A'}, 'A'),
//   h('p', {key: 'B'}, 'B'),
//   h('p', {key: 'C'}, 'C'),
//   h('p', {key: 'D'}, 'D'),
//   h('p', {key: 'E'}, 'E'),
// ]
// const nextChildren = [
//   h('p', {key: 'A'}, 'A'),
//   h('p', {key: 'B'}, 'B'),
// ]

// a d e (b c)
// (b c)
// const prevChildren = [
//   h('p', {key: 'A'}, 'A'),
//   h('p', {key: 'D'}, 'D'),
//   h('p', {key: 'E'}, 'E'),
//   h('p', {key: 'B'}, 'B'),
//   h('p', {key: 'C'}, 'C'),
// ]
// const nextChildren = [
//   h('p', {key: 'B'}, 'B'),
//   h('p', {key: 'C'}, 'C'),
// ]

// 5. 未知序列
// [i ... e1 + 1]: a b [c d e] f g
// [i ... e2 + 1]: a b [e c h] f g
// D 在新节点中是没有的 会被卸载
// C 节点的props会发生变化
// const prevChildren = [
//   h('p', {key: 'A'}, 'A'),
//   h('p', {key: 'B'}, 'B'),
//   h('p', {key: 'C'}, 'C'),
//   h('p', {key: 'D'}, 'D'),
//   h('p', {key: 'E'}, 'E'),
//   h('p', {key: 'F'}, 'F'),
//   h('p', {key: 'G'}, 'G'),
// ]
// const nextChildren = [
//   h('p', {key: 'A'}, 'A'),
//   h('p', {key: 'B'}, 'B'),
//   h('p', {key: 'E'}, 'E'),
//   h('p', {key: 'C', id: 'c-id'}, 'C'),
//   h('p', {key: 'H'}, 'H'),
//   h('p', {key: 'F'}, 'F'),
//   h('p', {key: 'G'}, 'G'),
// ]

// [i ... e1 + 1]: a b [c d e h i] f g
// [i ... e2 + 1]: a b [e c] f g
// 中间部分 老的比心的多 那么多的部分会被直接卸载
// const prevChildren = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'C' }, 'C'),
//   h('p', { key: 'D' }, 'D'),
//   h('p', { key: 'E' }, 'E'),
//   h('p', { key: 'H' }, 'H'),
//   h('p', { key: 'I' }, 'I'),
//   h('p', { key: 'F' }, 'F'),
//   h('p', { key: 'G' }, 'G')
// ]
// const nextChildren = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'E' }, 'E'),
//   h('p', { key: 'C', id: 'c-id' }, 'C'),
//   h('p', { key: 'F' }, 'F'),
//   h('p', { key: 'G' }, 'G')
// ]

// [i ... e1 + 1]: a b [c d e] f g
// [i ... e2 + 1]: a b [e c d] f g
// 移动 节点存在于新旧节点中，但是位置变了
// 最长递增子序列为[1, 2] 即[e c d]中c d的下标 c d不要移动 只需将e插入到c前面即可 移动一次
// const prevChildren = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'C' }, 'C'),
//   h('p', { key: 'D' }, 'D'),
//   h('p', { key: 'E' }, 'E'),
//   h('p', { key: 'F' }, 'F'),
//   h('p', { key: 'G' }, 'G')
// ]
// const nextChildren = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'E' }, 'E'),
//   h('p', { key: 'C' }, 'C'),
//   h('p', { key: 'D' }, 'D'),
//   h('p', { key: 'F' }, 'F'),
//   h('p', { key: 'G' }, 'G')
// ]

// [i ... e1 + 1]: a b [d] f g
// [i ... e2 + 1]: a b [c d e] f g
// 新增 同时也体现了源码的move优化点
// const prevChildren = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'D' }, 'D'),
//   h('p', { key: 'F' }, 'F'),
//   h('p', { key: 'G' }, 'G')
// ]
// const nextChildren = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'C' }, 'C'),
//   h('p', { key: 'D' }, 'D'),
//   h('p', { key: 'E' }, 'E'),
//   h('p', { key: 'F' }, 'F'),
//   h('p', { key: 'G' }, 'G')
// ]

// 综合例子
// a b (c d e x) f g
// a b (d c y e) f g
const prevChildren = [
  h('p', { key: 'A' }, 'A'),
  h('p', { key: 'B' }, 'B'),
  h('p', { key: 'C' }, 'C'),
  h('p', { key: 'D' }, 'D'),
  h('p', { key: 'E' }, 'E'),
  h('p', { key: 'X' }, 'X'),
  h('p', { key: 'F' }, 'F'),
  h('p', { key: 'G' }, 'G')
]
const nextChildren = [
  h('p', { key: 'A' }, 'A'),
  h('p', { key: 'B' }, 'B'),
  h('p', { key: 'D' }, 'D'),
  h('p', { key: 'C' }, 'C'),
  h('p', { key: 'Y' }, 'Y'),
  h('p', { key: 'F' }, 'F'),
  h('p', { key: 'G' }, 'G')
]

// 新节点 text
export default {
  name: 'ArrayToArray',
  setup() {
    const isChange = ref(false)
    // @ts-ignore
    window.isChange = isChange

    const obj = proxyRefs({
      a: {
        b: {
          c: 1
        }
      }
    })
    console.log(obj.a.b.c)
    return {
      isChange
    }
  },
  render() {
    return h('div', {}, this.isChange ? nextChildren : prevChildren)
  }
}
