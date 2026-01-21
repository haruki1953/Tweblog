import type { ImportPostList } from '@/types'
import { platformKeyMap } from '@/config'
import { z } from 'zod'
import { sakiNotification } from '@/utils'

const platform = platformKeyMap.Discord.key

export const dataProcessDiscordService = (
  jsonData: string,
  jsonOption: string
): ImportPostList | null => {
  // 解析 jsonOption
  const optionInfo = discordJsonOptionProcess(jsonOption)
  if (optionInfo == null) {
    return null
  }
  // 解析 jsonData
  const dataInfo = discordJsonDataProcess(jsonData)
  if (dataInfo == null) {
    return null
  }

  // 准备ImportPostList
  const importPostList: ImportPostList = []
  for (const message of dataInfo) {
    // 根据optionInfo排除
    if (
      optionInfo.usernameIncludeList != null &&
      !optionInfo.usernameIncludeList.includes(message.author.username)
    ) {
      // 不在usernameIncludeList，跳过
      continue
    }
    if (
      optionInfo.usernameExcludeList != null &&
      optionInfo.usernameExcludeList.includes(message.author.username)
    ) {
      // 包含在usernameExcludeList，跳过
      continue
    }

    // content
    const content = message.content

    // createdAt
    const createdAt = (() => {
      const valResult = z.coerce.date().safeParse(message.timestamp)
      if (!valResult.success) {
        return null
      }
      return valResult.data.toISOString()
    })()
    if (createdAt == null) {
      // 值不正确时跳过此message
      continue
    }

    // platformId
    const platformId = message.id

    // platformLink
    const platformLink = joinWebUrlDiscord(
      optionInfo.guildId,
      message.channel_id,
      message.id
    )

    // platformParentId 帖子在所属平台的父帖id
    const platformParentId = message.referenced_message?.id || null

    // 准备importImages
    const importImages: ImportPostList[number]['importImages'] = []
    for (const attachment of message.attachments) {
      if (
        attachment.content_type == null ||
        !attachment.content_type.startsWith('image')
      ) {
        // 不是图片，跳过
        continue
      }
      const link = attachment.url
      const platformId = attachment.id
      const alt = attachment.description || ''
      importImages.push({
        createdAt,
        link,
        alt,
        platform,
        platformId
      })
    }

    // 没有内容就忽略
    if (content === '' && importImages.length === 0) {
      continue
    }

    importPostList.push({
      content,
      createdAt,
      platform,
      platformId,
      platformLink,
      platformParentId,
      importImages
    })
  }
  // 原始的importPostList是时间降序的，将其反转，为时间升序，以此来保证回复生效
  importPostList.reverse()
  return importPostList
}

// 解析 jsonData
const discordJsonDataProcess = (jsonData: string) => {
  let dataInfo
  try {
    dataInfo = z.array(discordMessageSchema).parse(JSON.parse(jsonData))
  } catch (error) {
    return null
  }
  return dataInfo
}

// 解析 jsonOption
const discordJsonOptionProcess = (jsonOption: string) => {
  let optionInfo
  try {
    optionInfo = jsonOptionSchema.parse(JSON.parse(jsonOption))
  } catch (error) {
    // console.log(error)
    // sakiMessage({
    //   type: 'error',
    //   message: 'json选项错误'
    // })
    sakiNotification({
      type: 'error',
      title: 'json选项错误',
      message: String(error)
    })
    return null
  }
  return optionInfo
}

// discordMessageSchema
const discordMessageSchema = z.object({
  id: z.string(),
  channel_id: z.string(),
  content: z.string(),
  timestamp: z.string(),
  attachments: z.array(
    z.object({
      id: z.string(),
      url: z.string(),
      content_type: z.string().optional(),
      description: z.string().optional()
    })
  ),
  author: z.object({
    username: z.string()
  }),
  referenced_message: z
    .object({
      id: z.string()
    })
    .optional()
})

// {
//   "guildId": "1334824296647753832",
//   "usernameIncludeList": ["haruki0_o"]
// }
const jsonOptionSchema = z.object({
  guildId: z.string(),
  usernameIncludeList: z.array(z.string()).optional(),
  usernameExcludeList: z.array(z.string()).optional()
})
type JsonOptionType = z.infer<typeof jsonOptionSchema>

// 拼接 Discord 的链接
const joinWebUrlDiscord = (
  guildId: string,
  channelId: string,
  messageId: string
) => {
  // https://discord.com/channels/1334824296647753832/1339729617937891328/1339905738172268689
  return `https://discord.com/channels/${guildId}/${channelId}/${messageId}`
}
