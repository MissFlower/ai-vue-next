// 老节点是text
// 新节点是array
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
    console.log(obj.value.a.b)
    return {
      isChange
    }
  },
  render() {
    const prevChildren = 'oldChildren'
    const nextChildren = [h('p', {}, 'A'), h('p', {}, 'B')]
    return h('div', {}, this.isChange ? nextChildren : prevChildren)
  }
}
