import { h } from '../../lib/ai-vue-next.bundle.esm.js'
import ArrayToText from './ArrayToText.js'
import TextToArray from './TextToArray.js'
import TextToText from './TextToText.js'

export default {
  name: 'App',
  setup() {},
  render() {
    return h('div', { id: 'root' }, [
      h('p', {}, '主页'),
      // 老的是array 新的text
      // h(ArrayToText)

      // 老的是text 新的text
      // h(TextToText)

      // 老的是text 新的是Array
      h(TextToArray)
    ])
  }
}
