import { h } from '../../lib/ai-vue-next.bundle.esm.js'

export default {
  name: 'Foo',
  setup(props, { emit }) {
    const emitAdd = () => {
      console.log('emitAdd')
      emit('add', 1, 2)
      emit('add-foo', 3, 4)
    }

    return {
      emitAdd
    }
  },
  render() {
    const emitBtn = h(
      'button',
      { class: 'emit-btn', onClick: this.emitAdd },
      'emitBtn'
    )
    const foo = h('p', {}, 'foo组件')
    return h('div', { class: 'foo' }, [foo, emitBtn])
  }
}
