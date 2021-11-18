import { h, provide, inject } from '../../lib/ai-vue-next.bundle.esm.js'

export default {
  name: 'App',
  setup() {},
  render() {
    return h('div', {}, [h('p', {}, 'ApiInject'), h(Provider)])
  }
}

const Provider = {
  name: 'Provider',
  setup() {
    provide('foo', 'fooVal')
    provide('bar', 'barVal')
    // provide('baz', 'bazVal')
  },
  render() {
    return h('div', {}, [h('p', {}, 'Provider'), h(ProviderTwo)])
  }
}

const ProviderTwo = {
  name: 'ProviderTwo',
  setup() {
    provide('foo', 'fooTwo')
    const foo = inject('foo')

    return {
      foo
    }
  },
  render() {
    return h('div', {}, [h('p', {}, `ProviderTwo: ${this.foo}`), h(Consumer)])
  }
}

const Consumer = {
  name: 'Consumer',
  setup() {
    // provide('foo', 'fooTwo1')
    const foo = inject('foo')
    const bar = inject('bar')
    // const baz = inject('baz', 'bazDefault')
    const baz = inject('baz', () => 'bazDefault')

    return {
      foo,
      bar,
      baz
    }
  },
  render() {
    return h('div', {}, `Consumer-${this.foo}-${this.bar}-${this.baz}`)
  }
}
