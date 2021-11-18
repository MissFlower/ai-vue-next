import { createVNode } from './vnode'

export function createAppAPI(render) {
  return function createApp(rootComponent) {
    return {
      mount(rootContainer) {
        // 生成vnode
        const vnode = createVNode(rootComponent)
        // 渲染vnode
        render(vnode, rootContainer)
      }
    }
  }
}
