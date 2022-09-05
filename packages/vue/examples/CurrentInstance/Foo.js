import { h, getCurrentInstace } from '../../lib/ai-vue-next.bundle.esm.js'

export default {
  name: 'Foo',
  setup() {
    const instance = getCurrentInstace()
    console.log('Foo', instance)
  },
  render() {
    return h('div', {}, 'Foo')
  }
}
