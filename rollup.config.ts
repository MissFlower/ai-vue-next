import typescript from '@rollup/plugin-typescript'
import pkg from './package.json'

export default {
  input: './packages/vue/src/index.ts',
  output: [
    {
      format: 'cjs',
      file: 'packages/vue/dist/ai-vue-next.cjs.js'
    },
    {
      format: 'esm',
      file: 'packages/vue/dist/ai-vue-next.esm.js'
    }
  ],
  plugins: [typescript()],
  onwarn: (msg, warn) => {
    if (!/Circular/.test(msg)) {
      warn(msg)
    }
  }
}
