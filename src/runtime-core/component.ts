import { isFunction, isObject } from '../shared'

export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {}
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
  // 声依永proxy将setupState挂在到组建实例上
  instance.proxy = new Proxy(
    {},
    {
      get(target, key) {
        const { setupState } = instance
        if (key in setupState) {
          return setupState[key]
        }
      }
    }
  )

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
