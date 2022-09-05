import { h } from '../../dist/ai-vue-next.esm.js'
import foo from './foo.js'
// @ts-ignore
window.self = null
export default {
  render() {
    // @ts-ignore
    window.self = this
    return h(
      'div',
      {
        class: ['vue-next'],
        onClick: () => {
          console.log('ai-vue-next')
        }
      },
      [
        h('p', { class: ['red', 'title'] }, 'hi'),
        h(
          'p',
          { class: 'blue', onMousedown: () => console.log('mousedown') },
          this.msg
        ),
        h(foo, { count: this.count })
      ]
    )
  },
  setup() {
    return {
      msg: 'ai-vue-next',
      count: 1
    }
  }
}
