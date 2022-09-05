import {
  h,
  ref,
  getCurrentInstace,
  nextTick
} from '../../lib/ai-vue-next.bundle.esm.js'

export default {
  name: 'App',
  setup() {
    const count = ref(1)
    const instance = getCurrentInstace()
    async function onClick() {
      for (let i = 0; i < 10; i++) {
        console.log('update--' + i)
        count.value = i
      }
      debugger
      console.log(instance)
      // nextTick(() => {
      //   console.log(instance)
      // })
      await nextTick()
      console.log(instance)
    }

    return {
      count,
      onClick
    }
  },
  render() {
    const button = h('button', { onClick: this.onClick }, 'update')
    const p = h('p', {}, 'count:' + this.count)

    return h('div', {}, [button, p])
  }
}
