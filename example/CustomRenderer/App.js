import { h } from '../../lib/ai-vue-next.bundle.esm.js'

export default {
  name: 'App',
  setup() {
    const x = 100
    const y = 100

    return {
      x,
      y
    }
  },
  render() {
    return h('rect', { x: this.x, y: this.y })
  }
}
