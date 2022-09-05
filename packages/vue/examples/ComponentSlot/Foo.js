import { h, renderSlots } from '../../lib/ai-vue-next.bundle.esm.js'

export default {
  name: 'Foo',
  setup() {},
  render() {
    const name = '作用域插槽'
    return h('div', {}, [
      renderSlots(this.$slots, 'header', {
        name
      }),
      h('p', {}, 'foo'),
      renderSlots(this.$slots, 'footer')
    ])
  }
}
