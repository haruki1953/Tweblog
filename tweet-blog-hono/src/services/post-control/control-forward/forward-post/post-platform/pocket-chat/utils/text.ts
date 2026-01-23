// src/services/post-control/control-forward/forward-post/post-platform/pocket-chat/utils/text.ts

import { pocketChatConfig } from '../configs'

/**
 * 计算文本长度（UTF-16）
 */
const textCalcCharNumber = (text: string): number => {
  return [...text].length
}

/**
 * 将文本裁剪到指定长度
 */
const truncateTextToFit = (text: string, maxLength: number): string => {
  if (maxLength <= 0) return ''
  let count = 0
  let result = ''
  for (const ch of text) {
    if (count + 1 > maxLength) break
    result += ch
    count += 1
  }
  return result
}

/**
 * PocketChat 文本拆分（带 (1/3) 尾巴）
 */
export const pocketChatPostContentSplitUtil = (content: string): string[] => {
  const maxLength = pocketChatConfig.maxPostCharactersOnSend
  if (maxLength < 20) {
    throw new Error('maxLength cannot be less than 20')
  }

  const maxLengthWithoutCount = maxLength - 10 // 留出 "(1/3)" 空间

  const result: string[] = []
  let remaining = content

  while (remaining.length > 0) {
    const chunk = truncateTextToFit(remaining, maxLengthWithoutCount)
    if (chunk.length === 0) break
    result.push(chunk)
    remaining = remaining.slice(chunk.length)
  }

  // 添加计数尾巴
  if (result.length > 1) {
    for (let i = 0; i < result.length; i++) {
      const countText = ` (${i + 1}/${result.length})`
      const chunk = result[i]
      const chunkLength = textCalcCharNumber(chunk)
      const countLength = textCalcCharNumber(countText)

      if (chunkLength + countLength <= maxLength) {
        result[i] = chunk + countText
      } else {
        // 裁剪末尾以腾出空间
        const truncated = truncateTextToFit(chunk, maxLength - countLength)
        result[i] = truncated + countText
      }
    }
  }

  return result
}
