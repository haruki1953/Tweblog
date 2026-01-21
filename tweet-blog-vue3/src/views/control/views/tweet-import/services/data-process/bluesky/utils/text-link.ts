// 将 linkInfo 合并至 text 以此返回的是 content 字符串
export const blueskyTextAndLinkInfoToContent = (data: {
  // text的内容是这样的
  // 链接测试 bsky.app/profile/harukiowo.bsk... 链接测试
  text: string
  // linkInfo是这样的
  // [
  //   {
  //     link: 'https://bsky.app/profile/harukiowo.bsky.socia',
  //     byteStart: 13,
  //     byteEnd: 46
  //   }
  // ]
  linkInfo: {
    byteStart: number
    byteEnd: number
    link: string
  }[]
}) => {
  const { text, linkInfo } = data

  let content = text

  // 按 byteEnd 降序排序，这样先替换后面的就不会影响前面的
  const linkInfoSorted = linkInfo.slice().sort((a, b) => b.byteEnd - a.byteEnd)

  // 逐个替换
  for (const linkInfoItem of linkInfoSorted) {
    const { indexStart, indexEnd } = byteRangeToIndexRange({
      content,
      ...linkInfoItem
    })
    if (indexStart == null || indexEnd == null) {
      continue
    }
    content = replaceSubstringByIndex({
      content,
      indexStart,
      indexEnd,
      replacement: linkInfoItem.link
    })
  }

  return content
}

// 辅助函数：将 byte 范围，转为 index 范围
const byteRangeToIndexRange = (data: {
  content: string
  byteStart: number
  byteEnd: number
}) => {
  const { content, byteStart, byteEnd } = data
  let indexCount = 0
  let byteCount = 0
  let indexStart = null
  let indexEnd = null
  for (const char of content) {
    if (byteCount >= byteStart && indexStart == null) {
      indexStart = indexCount
    }
    indexCount += 1
    byteCount += getStringByteLength(char)
    if (byteCount >= byteEnd && indexEnd == null) {
      indexEnd = indexCount
    }
  }
  return {
    indexStart,
    indexEnd
  }
}

// 获取字符串字节数
const getStringByteLength = (str: string): number => {
  const encoder = new TextEncoder()
  const encodedStr = encoder.encode(str) // 将字符串编码为 Uint8Array
  return encodedStr.length // 返回字节数
}

/**
 * 替换字符串中指定索引区间的子字符串
 * @param data - 包含原始字符串、起始索引、结束索引和替换字符串的对象
 * @returns 替换后的新字符串
 */
const replaceSubstringByIndex = (data: {
  content: string
  indexStart: number
  indexEnd: number
  replacement: string
}): string => {
  const { content, indexStart, indexEnd, replacement } = data
  return (
    content.substring(0, indexStart) + replacement + content.substring(indexEnd)
  )
}
