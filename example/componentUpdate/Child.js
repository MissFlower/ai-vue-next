import { h } from '../../lib/ai-vue-next.bundle.esm.js'

export default {
  name: 'Child',
  setup() {},
  render() {
    return h('div', {}, [
      h('div', {}, 'child - props -msg: ' + this.$props.msg)
    ])
  }
}
