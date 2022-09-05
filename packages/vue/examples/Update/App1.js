import { h, ref } from '../../lib/ai-vue-next.bundle.esm.js'

export default {
  name: 'App',
  setup() {
    const count = ref(0)
    const clickHandle = () => {
      count.value++
    }

    return {
      count,
      clickHandle
    }
  },
  render() {
    return h('div', { id: 'root' }, [
      h('p', {}, `count: ${this.count}`),
      h('button', { onClick: this.clickHandle }, '点击+1')
    ])
  }
}
