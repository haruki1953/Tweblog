// src/services/post-control/control-forward/forward-post/post-platform/pocket-chat/apis/pocket-messages.ts

import { useFetchSystem } from '@/systems'
import { urlJoinUtil } from '@/utils'
import { z } from 'zod'
import { handlePocketChatRes } from './base'

const fetchSystem = useFetchSystem()

export const pocketChatMessageRecordSchema = z.object({
  id: z.string(),
  created: z.string()
})

/**
 * 发送文字消息
 */
export const pocketChatSendTextMessageApi = async (parameter: {
  host: string
  token: string
  authorId: string
  content: string
  replyMessage?: string
}) => {
  const { host, token, authorId, content, replyMessage } = parameter

  const body: any = {
    author: authorId,
    content
  }
  if (replyMessage != null) {
    body.replyMessage = replyMessage
  }

  const res = await fetchSystem.fetchProxy(
    urlJoinUtil(host, 'api/collections/messages/records'),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${token}`
      },
      body: JSON.stringify(body)
    }
  )

  return await handlePocketChatRes({
    res,
    resultSchema: pocketChatMessageRecordSchema,
    apiName: 'SendTextMessage'
  })
}

/**
 * 发送图片消息
 */
export const pocketChatSendImageMessageApi = async (parameter: {
  host: string
  token: string
  authorId: string
  imageIds: string[]
  replyMessage?: string
}) => {
  const { host, token, authorId, imageIds, replyMessage } = parameter

  const body: any = {
    author: authorId,
    images: imageIds
  }
  if (replyMessage != null) {
    body.replyMessage = replyMessage
  }

  const res = await fetchSystem.fetchProxy(
    urlJoinUtil(host, 'api/collections/messages/records'),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    }
  )

  return await handlePocketChatRes({
    res,
    resultSchema: pocketChatMessageRecordSchema,
    apiName: 'SendImageMessage'
  })
}
