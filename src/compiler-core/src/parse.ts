import { NodeTypes } from './ast'

const enum TagType {
  Start,
  End
}

export function baseParse(content: string) {
  const context = createParserContext(content)
  return createRoot(parseChildren(context))
}

function parseChildren(context) {
  const nodes: any = []
  let node
  const s = context.source
  if (s.startsWith('{{')) {
    node = parseinterpolation(context)
  } else if (s[0] === '<') {
    if (/[a-z]/g.test(s[1])) {
      node = parseElement(context)
    }
  }

  if (!node) {
    node = parseText(context)
  }

  nodes.push(node)
  return nodes
}

function parseinterpolation(context) {
  const openDelimiter = '{{'
  const closeDelimiter = '}}'

  const closeIndex = context.source.indexOf(
    closeDelimiter,
    openDelimiter.length
  )
  advanceBy(context, openDelimiter.length)

  const rawContentLength = closeIndex - openDelimiter.length
  const rawContent = parseTextData(context, rawContentLength)
  const content = rawContent.trim()

  advanceBy(context, rawContentLength + closeDelimiter.length)

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content
    }
  }
}

function advanceBy(context: any, length: number) {
  context.source = context.source.slice(length)
}

function createRoot(children) {
  return {
    children
  }
}

function createParserContext(content: string) {
  return {
    source: content
  }
}

function parseElement(context: any): any {
  // 1.解析tag
  const element = parseTag(context, TagType.Start)
  parseTag(context, TagType.End)
  // 2.删除解析过的字符串
  return element
}

function parseTag(context: any, type) {
  const match: any = /^<\/?([a-z]*)/i.exec(context.source)
  const tag = match[1]
  advanceBy(context, match[0].length)
  advanceBy(context, 1)

  if (type === TagType.End) {
    return
  }

  return {
    type: NodeTypes.ELEMENT,
    tag
  }
}

function parseText(context: any): any {
  // 1. 获取context
  const content = parseTextData(context, context.source.length)

  return {
    type: NodeTypes.TEXT,
    content
  }
}

function parseTextData(context: any, length) {
  const content = context.source.slice(0, length)
  // 2. 推进
  advanceBy(context, content.length)

  return content
}
