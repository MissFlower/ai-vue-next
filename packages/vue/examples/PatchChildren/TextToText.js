// 老节点Text

import { h, ref } from '../../lib/ai-vue-next.bundle.esm.js'

// 新节点Text
export default {
  name: 'TextToText',
  setup() {
    const isChange = ref(false)

    // @ts-ignore
    window.isChange = isChange

    return {
      isChange
    }
  },
  render() {
    const oldChild = 'oldChild'
    const newChild = 'newChild'
    return h('div', {}, this.isChange ? newChild : oldChild)
  }
}
