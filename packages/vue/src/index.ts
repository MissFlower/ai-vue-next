// 出口文件
export * from '@ai-vue-next/runtime-dom'
import { baseCompile } from '@ai-vue-next/compiler-core'
import * as runtimeDom from '@ai-vue-next/runtime-dom'
import { registerRuntimeCompiler } from '@ai-vue-next/runtime-dom'

function compileToFunction(template) {
  const { code } = baseCompile(template)
  const render = new Function('Vue', code)(runtimeDom)
  return render
}

registerRuntimeCompiler(compileToFunction)
