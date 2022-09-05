import { h, ref } from '../../lib/ai-vue-next.bundle.esm.js'
import Child from './Child.js'

const App = {
  name: 'App',
  setup() {
    const msg = ref('123')
    const count = ref(1)

    // @ts-ignore
    window.msg = msg

    const changeChildProps = () => {
      msg.value = '456'
    }

    const changeCount = () => {
      count.value++
    }

    return {
      msg,
      count,
      changeChildProps,
      changeCount
    }
  },
  render() {
    return h('div', {}, [
      h('div', {}, '您好'),

      h(
        'button',
        {
          onClick: this.changeChildProps
        },
        'change child props'
      ),

      h(Child, {
        msg: this.msg
      }),

      h(
        'button',
        {
          onClick: this.changeCount
        },
        'change self count'
      ),

      h('p', {}, 'count: ' + this.count)
    ])
  }
}
export default App
