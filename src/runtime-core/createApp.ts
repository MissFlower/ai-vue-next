import { createVNode } from './vnode'
import { render } from './renderer'

export function createApp(rootComponent) {
  return {
    mount(rootContainer) {
      // 生成vnode
      const vnode = createVNode(rootComponent)
      // 渲染vnode
      render(vnode, rootContainer)
    }
  }
}
