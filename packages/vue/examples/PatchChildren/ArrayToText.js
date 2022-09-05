// 老节点 array

import { h, ref } from '../../lib/ai-vue-next.bundle.esm.js'

// 新节点 text
export default {
  name: 'ArrayToText',
  setup() {
    const isChange = ref(false)
    // @ts-ignore
    window.isChange = isChange

    const obj = ref({
      a: ref({
        b: ref({
          c: 1
        })
      })
    })
    console.log(obj.value.a.value)
    return {
      isChange
    }
  },
  render() {
    const nextChildren = 'newChildren'
    const prevChildren = [h('p', {}, 'A'), h('p', {}, 'B')]
    return h('div', {}, this.isChange ? nextChildren : prevChildren)
  }
}
