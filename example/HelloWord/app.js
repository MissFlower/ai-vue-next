import { h } from '../../lib/ai-vue-next.bundle.esm.js'
export default {
  render() {
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
