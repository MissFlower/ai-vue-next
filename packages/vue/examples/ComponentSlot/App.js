import { h, createTextVNode } from '../../lib/ai-vue-next.bundle.esm.js'
import Foo from './Foo.js'

export default {
  name: 'App',
  setup() {},
  render() {
    return h('div', {}, [
      h('p', {}, 'App'),
      h(
        Foo,
        {},
        //  h('p', {class: 'custom-element1'}, 'slot-element'),
        {
          header: props => [
            h(
              'p',
              { class: 'custom-element1' },
              'slot-element-header' + props.name
            ),
            createTextVNode('我是textNode节点')
          ],
          footer: () =>
            h('p', { class: 'custom-element1' }, 'slot-element-footer')
        }
      )
    ])
  }
}
