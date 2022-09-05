import { h, getCurrentInstace } from '../../lib/ai-vue-next.bundle.esm.js'
import Foo from './Foo.js'

export default {
  name: 'App',
  setup() {
    const instance = getCurrentInstace()
    console.log('App', instance)
  },
  render() {
    return h('div', {}, [h('p', {}, 'app'), h(Foo)])
  }
}
