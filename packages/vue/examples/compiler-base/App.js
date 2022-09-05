import { ref } from '../../dist/ai-vue-next.esm.js'

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
