import { AppError } from '@/classes'
import { useFetchSystem } from '@/systems'
import { useLogUtil } from '@/utils'
import FormData from 'form-data'
import { type Response } from 'node-fetch'
import { z } from 'zod'
import fs from 'fs'

const fetchSystem = useFetchSystem()
const logUtil = useLogUtil()

// 发送消息 https://core.telegram.org/bots/api#sendmessage
export const telegramSendMessageApi = async (parameter: {
  botToken: string
  chatId: string
  text: string
  replyParameters?: {
    messageId: number
    chatId: string
  }
}) => {
  const {
    botToken,
    chatId,
    text,
    replyParameters
  } = parameter
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const reply_parameters = (() => {
    if (replyParameters == null) {
      return undefined
    }
    return {
      message_id: replyParameters.messageId,
      chat_id: replyParameters.chatId
    }
  })()
  const res = await fetchSystem.fetchProxy(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        reply_parameters
      })
    }
  )
  return await handleTgRes({
    res,
    resultSchema: zodTgMessageSchema,
    apiName: 'sendMessage'
  })
}

// 发送图片 https://core.telegram.org/bots/api#sendphoto
export const telegramSendPhotoApi = async (parameter: {
  botToken: string
  chatId: string
  text: string
  photoPath: string
  replyParameters?: {
    messageId: number
    chatId: string
  }
}) => {
  const {
    botToken,
    chatId,
    text,
    photoPath,
    replyParameters
  } = parameter
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const reply_parameters = (() => {
    if (replyParameters == null) {
      return undefined
    }
    return {
      message_id: replyParameters.messageId,
      chat_id: replyParameters.chatId
    }
  })()
  const form = new FormData()
  form.append('chat_id', chatId)
  form.append('caption', text)
  form.append('photo', fs.createReadStream(photoPath)) // 读取本地文件
  if (reply_parameters != null) {
    form.append('reply_parameters', JSON.stringify(reply_parameters))
  }
  const res = await fetchSystem.fetchProxy(
    `https://api.telegram.org/bot${botToken}/sendPhoto`,
    {
      method: 'POST',
      body: form
    }
  )
  return await handleTgRes({
    res,
    resultSchema: zodTgMessageSchema,
    apiName: 'sendPhoto'
  })
}

// 发送多张图片 https://core.telegram.org/bots/api#sendmediagroup
export const telegramSendMediaGroupApi = async (parameter: {
  botToken: string
  chatId: string
  text: string
  photoPathList: string[]
  replyParameters?: {
    messageId: number
    chatId: string
  }
}) => {
  const {
    botToken,
    chatId,
    text,
    photoPathList,
    replyParameters
  } = parameter
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const reply_parameters = (() => {
    if (replyParameters == null) {
      return undefined
    }
    return {
      message_id: replyParameters.messageId,
      chat_id: replyParameters.chatId
    }
  })()
  // 组装 mediaGroup
  const mediaGroup = photoPathList.map((photoPath, index) => {
    // 只有第一张图片才有文字
    const caption = (() => {
      if (index === 0) {
        return text
      }
      return undefined
    })()
    return {
      type: 'photo',
      // 关键点，标识 FormData 里的文件
      media: `attach://photo${index}`,
      caption
    }
  })
  const form = new FormData()
  form.append('chat_id', chatId)
  if (reply_parameters != null) {
    form.append('reply_parameters', JSON.stringify(reply_parameters))
  }
  form.append('media', JSON.stringify(mediaGroup))
  // 添加多个文件
  photoPathList.forEach((photoPath, index) => {
    form.append(`photo${index}`, fs.createReadStream(photoPath))
  })

  const res = await fetchSystem.fetchProxy(
    `https://api.telegram.org/bot${botToken}/sendMediaGroup`,
    {
      method: 'POST',
      body: form
    }
  )
  return await handleTgRes({
    res,
    resultSchema: zodTgMessageSchema.array(),
    apiName: 'sendMediaGroup'
  })
}

const createTgResSchema = <ResultSchema extends z.ZodTypeAny> (resultSchema: ResultSchema) => {
  return z.object({
    ok: z.boolean(),
    error_code: z.number().optional(),
    description: z.string().optional(),
    result: resultSchema.optional()
  })
}

const handleTgRes = async <ResultSchema extends z.ZodTypeAny>(data: {
  res: Response
  resultSchema: ResultSchema
  apiName: string
}) => {
  const {
    res,
    resultSchema,
    apiName
  } = data

  const resJson = await res.json()
  const resZod = createTgResSchema(resultSchema).safeParse(resJson)
  if (!resZod.success) {
    logUtil.warning({
      title: '转发失败',
      content: `telegram ${apiName} 接口响应结构错误`
    })
    throw new AppError('转发失败')
  }
  const tgRes = resZod.data
  if (!tgRes.ok || tgRes.result == null) {
    logUtil.info({
      title: '转发失败',
      content:
      `telegram ${apiName} 请求失败\n` +
      `error_code: ${tgRes.error_code}\n` +
      `description: ${tgRes.description}\n`
    })
    throw new AppError('转发失败')
  }
  return tgRes.result
}

// TgMessage 类型
// 不需要的都先注释了
const zodTgMessageSchema = z.object({
  message_id: z.number(),
  // date: z.number(),
  // text: z.string().optional(),
  chat: z.object({
    id: z.number(),
    // type: z.string(),
    // title: z.string().optional(),
    username: z.string().optional()
  })
})
