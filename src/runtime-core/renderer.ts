import { createComponentInstance, setupComponent } from './component'

export function render(vnode, container) {
  patch(vnode, container)
}

function patch(vnode, container) {
  // 处理组件
  processComponent(vnode, container)
  // TODO: element
}

function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container)
}

function mountComponent(vnode: any, container) {
  const instance = createComponentInstance(vnode)

  setupComponent(instance)
  setupRenderEffect(instance, container)
}

function setupRenderEffect(instance, container) {
  const subTree = instance.render()
  patch(subTree, container)
}
