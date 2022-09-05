import { h, ref } from '../../lib/ai-vue-next.bundle.esm.js'

export default {
  name: 'App',
  setup() {
    const props = ref({
      foo: 'foo',
      bar: 'bar'
    })

    const onChangePropsDemo1 = () => {
      props.value.foo = 'new-foo'
    }

    const onChangePropsDemo2 = () => {
      props.value.foo = undefined
    }

    const onChangePropsDemo3 = () => {
      props.value = {
        foo: 'foo'
      }
    }

    return {
      props,
      onChangePropsDemo1,
      onChangePropsDemo2,
      onChangePropsDemo3
    }
  },
  render() {
    return h('div', { id: 'root', ...this.props }, [
      h(
        'button',
        { onClick: this.onChangePropsDemo1 },
        '改变props.foo为new-foo'
      ),
      h(
        'button',
        { onClick: this.onChangePropsDemo2 },
        '改变props.foo为undefined'
      ),
      h('button', { onClick: this.onChangePropsDemo3 }, '删除props.bar')
    ])
  }
}
