import { h } from '../../lib/ai-vue-next.bundle.esm.js'
// @ts-ignore
window.self = null
export default {
  render() {
    // @ts-ignore
    window.self = this
    return h(
      'div',
      {
        class: ['vue-next']
      },
      [
        h('p', { class: ['red', 'title'] }, 'hi'),
        h('p', { class: 'blue' }, this.msg)
      ]
    )
  },
  setup() {
    return {
      msg: 'ai-vue-next'
    }
  }
}
