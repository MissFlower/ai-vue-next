import typescript from '@rollup/plugin-typescript'
import pkg from './package.json'

export default {
  input: './src/index.ts',
  output: [
    {
      format: 'cjs',
      file: pkg.main
    },
    {
      format: 'esm',
      file: pkg.module
    }
  ],
  plugins: [typescript()],
  onwarn: (msg, warn) => {
    if (!/Circular/.test(msg)) {
      warn(msg)
    }
  }
}
