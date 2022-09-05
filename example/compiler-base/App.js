import { ref } from '../../lib/ai-vue-next.bundle.esm.js'

export const App = {
  name: 'App',
  template: '<div>hi,{{count}}</div>',
  setup() {
    const count = (window.count = ref(0))
    return {
      message: 'mini-vue123',
      count
    }
  }
}
