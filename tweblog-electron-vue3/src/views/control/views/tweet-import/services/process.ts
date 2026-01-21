import { platformKeyMap, type PlatformKeyEnumValues } from '@/config'
import {
  dataProcessBlueskyService,
  dataProcessDiscordService,
  dataProcessTelegramService,
  dataProcessXtwitterService
} from './data-process'
import type { ImportPostList } from '@/types'
import { z } from 'zod'

export const processJsonToImportPostsByPlatform = (data: {
  platform: PlatformKeyEnumValues
  jsonData: string
  jsonOption: string
}) => {
  const { jsonData, platform, jsonOption } = data
  let importPosts: ImportPostList | null = null
  if (platform === platformKeyMap.X.key) {
    importPosts = dataProcessXtwitterService(jsonData)
  }
  if (platform === platformKeyMap.Telegram.key) {
    importPosts = dataProcessTelegramService(jsonData)
  }
  if (platform === platformKeyMap.Discord.key) {
    importPosts = dataProcessDiscordService(jsonData, jsonOption)
  }
  if (platform === platformKeyMap.Bluesky.key) {
    importPosts = dataProcessBlueskyService(jsonData, jsonOption)
  }

  return importPosts
}

// “以 HAR 格式复制全部”
const devtoolsHarSchema = z.object({
  log: z.object({
    entries: z.array(
      z.object({
        response: z.object({
          content: z.object({
            text: z.string().optional()
          })
        })
      })
    )
  })
})
// 从 har 解析出每个响应的 json
// 返回null代表解析失败
export const processHarToJsonList = (data: { harData: string }) => {
  const { harData } = data
  let harObj
  try {
    harObj = JSON.parse(harData)
  } catch (error) {
    return null
  }

  // 尝试解析
  const harResult = devtoolsHarSchema.safeParse(harObj)
  if (!harResult.success) {
    return null
  }
  const entries = harResult.data.log.entries
  const jsonList = entries
    .map((i) => {
      return i.response.content.text
    })
    .filter((i): i is string => i != null)
  return jsonList
}
