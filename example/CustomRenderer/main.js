import { createRenderer } from '../../lib/ai-vue-next.bundle.esm.js'
import App from './App.js'

// @ts-ignore
const game = new PIXI.Application({
  width: 500,
  height: 500
})
document.body.append(game.view)

const renderer = createRenderer({
  createElement: tag => {
    if (tag === 'rect') {
      // @ts-ignore
      const rect = new PIXI.Graphics()
      rect.beginFill(0xff0000)
      rect.drawRect(0, 0, 100, 100)
      rect.endFill()
      return rect
    }
  },
  patchProp: (el, key, value) => {
    el[key] = value
  },
  insert: (el, parent) => {
    parent.addChild(el)
  }
})

renderer.createApp(App).mount(game.stage)
