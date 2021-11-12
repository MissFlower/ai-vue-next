import { isFunction, isObject } from '../shared'

export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type
  }

  return component
}

export function setupComponent(instance) {
  // TODO:
  // initProps()
  // initSlots()
  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance: any) {
  const Component = instance.type

  // call setup()
  const { setup } = Component

  if (setup) {
    const setupResult = setup()
    handleSetupResult(instance, setupResult)
  }
}

function handleSetupResult(instance: any, setupResult: any) {
  if (isFunction(setupResult)) {
    // TODO:
  } else if (isObject(setupResult)) {
    instance.setupState = setupResult
  }

  finishComponentSetup(instance)
}

function finishComponentSetup(instance: any) {
  const Component = instance.type
  if (Component.render) {
    instance.render = Component.render
  }
}
