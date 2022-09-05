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

**runtime-core 模块**

- [x] 支持 element 类型
- [x] 初始化 props
- [x] setup 收集 props 和 context
- [x] 支持 proxy 获取数据
- [x] 实现挂载 rendecompiler 象
- [x] 实现$el

**runtime-dom 模块**

- [x] 实现自定义渲染器
- [x] 双端对比 diff 算法
- [x] 实现组件更新功能
- [x] 实现 nextTick 功能

**compiler-core 模块**

- [x] 实现解析插值功能
- [x] 实现解析 interpolation/element/text 三种类型
- [x] 实现 transform 功能
- [x] 实现代码生成 interpolation/element/text 三种类型
- [x] 实现 template 编译成 render 函数
- [x] 实现 monorepo 架构+vitest 替换 jest
