import { h } from '../../lib/ai-vue-next.bundle.esm.js'
export default {
  render() {
    return h('div', 'hello' + this.msg)
  },
  setup() {
    return {
      msg: 'ai-vue-next'
    }
  }
}
