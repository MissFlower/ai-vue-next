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
const prevChildren = [
  h('p', { key: 'A' }, 'A'),
  h('p', { key: 'B' }, 'B'),
  h('p', { key: 'C' }, 'C'),
  h('p', { key: 'D' }, 'D'),
  h('p', { key: 'E' }, 'E'),
  h('p', { key: 'H' }, 'H'),
  h('p', { key: 'I' }, 'I'),
  h('p', { key: 'F' }, 'F'),
  h('p', { key: 'G' }, 'G')
]
const nextChildren = [
  h('p', { key: 'A' }, 'A'),
  h('p', { key: 'B' }, 'B'),
  h('p', { key: 'E' }, 'E'),
  h('p', { key: 'C', id: 'c-id' }, 'C'),
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
