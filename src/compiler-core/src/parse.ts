import { NodeTypes } from './ast'

const enum TagType {
  Start,
  End
}

export function baseParse(content: string) {
  const context = createParserContext(content)
  return createRoot(parseChildren(context, []))
}

function parseChildren(context, ancestors) {
  const nodes: any = []

  while (!isEnd(context, ancestors)) {
    let node
    const s = context.source
    if (s.startsWith('{{')) {
      node = parseinterpolation(context)
    } else if (s[0] === '<') {
      if (/[a-z]/g.test(s[1])) {
        node = parseElement(context, ancestors)
      }
    }

    if (!node) {
      node = parseText(context)
    }

    nodes.push(node)
  }
  return nodes
}

function isEnd(context: any, ancestors) {
  const s = context.source
  // 1. 是不是结束标签
  if (s.startsWith('</')) {
    for (let i = ancestors.length - 1; i >= 0; i--) {
      const { tag } = ancestors[i]
      if (startsWithEndTagOpen(s, tag)) {
        return true
      }
    }
  }
  // 2. context.source是不是为空
  return !s
}

function startsWithEndTagOpen(s: any, tag: any) {
  return (
    s.startsWith('</') &&
    s.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase()
  )
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

  advanceBy(context, closeDelimiter.length)

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
    children,
    type: NodeTypes.ROOT
  }
}

function createParserContext(content: string) {
  return {
    source: content
  }
}

function parseElement(context: any, ancestors): any {
  // 1.解析tag
  const element: any = parseTag(context, TagType.Start)
  ancestors.push(element)
  element.children = parseChildren(context, ancestors)
  ancestors.pop()

  if (startsWithEndTagOpen(context.source, element.tag)) {
    parseTag(context, TagType.End)
  } else {
    throw new Error(`丢失结束标签：${element.tag}`)
  }
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
  let endIndex = context.source.length
  let endTokens = ['<', '{{']

  for (let i = 0; i < endTokens.length; i++) {
    const index = context.source.indexOf(endTokens[i])
    if (~index && endIndex > index) {
      endIndex = index
    }
  }
  // 1. 获取context
  const content = parseTextData(context, endIndex)

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
