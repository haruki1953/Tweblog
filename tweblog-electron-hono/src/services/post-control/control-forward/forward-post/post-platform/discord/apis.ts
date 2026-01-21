import { AppError } from '@/classes'
import { useFetchSystem } from '@/systems'
import { useLogUtil } from '@/utils'
import FormData from 'form-data'
import { z } from 'zod'
import fs from 'fs'
import { discordConfig } from './configs'

const fetchSystem = useFetchSystem()
const logUtil = useLogUtil()

// 发送消息
// https://discord.com/developers/docs/resources/message#create-message
export const discordCreateMessageApi = async (parameter: {
  authorization: string
  channelId: string
  content: string
  referenceMessageId: string | undefined | null
  targetImageList: Array<{
    id: string
    alt: string | null
    localLargeImagePath: string
  }>
}) => {
  const {
    authorization,
    channelId,
    content,
    referenceMessageId,
    targetImageList
  } = parameter

  const messageReference = (() => {
    if (referenceMessageId == null) {
      return undefined
    }
    return {
      type: 0, // referenced_message
      message_id: referenceMessageId
    }
  })()

  const form = new FormData()
  const attachments: Array<{
    id: number
    description?: string
  }> = []
  targetImageList.forEach((item, index) => {
    form.append(`files[${index}]`, fs.createReadStream(item.localLargeImagePath))
    attachments.push({
      id: index,
      description: item.alt?.slice(0, discordConfig.maxAltCharactersOnSend) ?? undefined
    })
  })
  form.append('payload_json', JSON.stringify({
    content,
    message_reference: messageReference,
    attachments
  }))
  const res = await fetchSystem.fetchProxy(
    `https://discord.com/api/v10/channels/${channelId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: authorization
      },
      body: form
    }
  )

  const resJson = await res.json()
  if (!res.ok) {
    logUtil.info({
      title: '转发失败',
      content:
      'discord CreateMessage 请求失败\n' +
      `code: ${resJson?.code}\n` +
      `message: ${resJson?.message}\n`
    })
    throw new AppError('转发失败')
  }

  const resZod = zodDcMessageSchema.safeParse(resJson)
  if (!resZod.success) {
    logUtil.warning({
      title: '转发失败',
      content: 'discord CreateMessage 接口响应结构错误'
    })
    throw new AppError('转发失败')
  }

  return resZod.data
}

// DcMessage 类型
// https://discord.com/developers/docs/resources/message#message-object
const zodDcMessageSchema = z.object({
  id: z.string(),
  // 用不到的暂时不写
  // channel_id: z.string(),
  attachments: z.array(z.object({
    id: z.string(),
    url: z.string()
  }))
})
