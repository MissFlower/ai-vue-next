import { h } from '../../lib/ai-vue-next.bundle.esm.js'
import Foo from './Foo.js'

export default {
  name: 'App',
  setup() {},
  render() {
    return h(
      'div',
      {
        class: 'app'
      },
      [
        h('p', {}, 'App组件'),
        h(Foo, {
          onAdd: (...args) => {
            console.log('App组件调用了onAdd方法', ...args)
          },
          onAddFoo: (...args) => {
            console.log('App组件调用了onAddFoo方法', ...args)
          }
        })
      ]
    )
  }
}
