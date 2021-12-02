import { createRenderer } from '../runtime-core'
import { isArray, isOn } from '../shared'

function createElement(tag) {
  return document.createElement(tag)
}

function patchProp(el, key, oldValue, newValue) {
  newValue = isArray(newValue) ? newValue.join(' ') : newValue
  if (isOn(key)) {
    // 处理事件
    const event = key.slice(2).toLowerCase()
    el.addEventListener(event, newValue)
  } else {
    // 处理属性
    if (newValue === undefined || newValue === null) {
      el.removeAttribute(key)
    } else {
      el.setAttribute(key, newValue)
    }
  }
}

function insert(el, parent) {
  parent.append(el)
}

function remove(child) {
  const parentNode = child.parentNode
  if (parentNode) {
    parentNode.removeChild(child)
  }
}

function setElementText(el, text) {
  el.textContent = text
}

const renderer: any = createRenderer({
  createElement,
  patchProp,
  insert,
  remove,
  setElementText
})

export const createApp = (...args) => {
  return renderer.createApp(...args)
}

export * from '../runtime-core/index'
