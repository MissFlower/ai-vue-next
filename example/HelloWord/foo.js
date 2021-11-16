import { h } from '../../lib/ai-vue-next.bundle.esm.js'

export default {
  name: 'Foo',
  setup(props) {
    props.count++
    console.log(props)
  },
  render() {
    return h('div', { class: 'foo' }, `foo: ${this.count}`)
  }
}
