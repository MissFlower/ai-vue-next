import { createApp } from '../../lib/ai-vue-next.bundle.esm.js'
import App from './App.js'

createApp(App).mount(document.querySelector('#app'))

function getSequence(arr) {
  const p = arr.slice()
  const result = [0]
  let i, j, u, v, c
  const len = arr.length
  // 遍历数组
  debugger
  for (i = 0; i < len; i++) {
    const arrI = arr[i]
    // 此算法中排除了等于0的情况，原因是0成为了diff算法中的占位符，在上面的流程图中已经忽略了，不影响对算法的了解
    if (arrI !== 0) {
      j = result[result.length - 1]
      // 用当前num与result中的最后一项对比
      if (arr[j] < arrI) {
        // 当前数值大于result子序列最后一项时，直接往后新增，并将当前数值的前一位result保存
        p[i] = j
        result.push(i)
        continue
      }
      u = 0
      v = result.length - 1
      // 当前数值小于result子序列最后一项时，使用二分法找到第一个大于当前数值的下标
      while (u < v) {
        c = ((u + v) / 2) | 0
        if (arr[result[c]] < arrI) {
          u = c + 1
        } else {
          v = c
        }
      }
      if (arrI < arr[result[u]]) {
        // 找到下标，将当前下标对应的前一位result保存(如果找到的是第一位，不需要操作，第一位前面没有了)
        if (u > 0) {
          p[i] = result[u - 1]
        }
        // 找到下标，直接替换result中的数值
        result[u] = i
      }
    }
  }
  u = result.length
  v = result[u - 1]
  // 回溯，直接从最后一位开始，将前面的result全部覆盖，如果不需要修正，则p中记录的每一项都是对应的前一位，不会有任何影响
  while (u-- > 0) {
    result[u] = v
    v = p[v]
  }
  return result
}

getSequence([10, 9, 2, 5, 3, 7, 101, 18, 1])
