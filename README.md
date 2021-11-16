# ai-vue-next

实现 vue3 进行源码学习

#### 实现的模块

**reactivity 模块**

- [x] reactive
- [x] effect
- [x] track 依赖收集
- [x] trigger 依赖触发
- [x] ref
- [x] computed
- [x] readonly
- [x] 支持嵌套 reactive
- [x] 支持 effectScheduler
- [x] 支持 effect.stop
- [x] 支持 isReactive
- [x] 支持 isReadonly
- [x] 支持 isProxy
- [x] 支持 shallowReadonly
- [x] 支持 isref
- [x] 支持 unref
- [x] 支持 proxyRefs
- [ ] 支持 toRaw

**runtime-core 模块**

- [x] 支持 element 类型
- [x] 初始化 props
- [x] setup 收集 props 和 context
- [x] 支持 proxy 获取数据
- [x] 实现挂载 render 函数的返回对象
- [x] 实现$el
