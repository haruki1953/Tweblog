// src/services/post-control/control-forward/forward-post/post-platform/pocket-chat/services/pocket-post.ts

import {
  pocketChatSendTextMessageApi,
  pocketChatSendImageMessageApi
} from './dependencies'
import { AppError } from '@/classes'
import { useLogUtil } from '@/utils'

const logUtil = useLogUtil()

/**
 * 发送文字消息（content 非空，images 不设置）
 */
export const pocketChatSendTextMessageService = async (data: {
  host: string
  token: string
  authorId: string
  content: string
  replyMessage?: string
}) => {
  const { host, token, authorId, content, replyMessage } = data

  if (content.trim().length === 0) {
    logUtil.warning({
      title: 'PocketChat 发送文字消息失败',
      content: 'content 不能为空字符串'
    })
    throw new AppError('PocketChat 发送文字消息失败')
  }

  const res = await pocketChatSendTextMessageApi({
    host,
    token,
    authorId,
    content,
    replyMessage
  })

  return res
}

/**
 * 发送图片消息（images 数组 1–4，content 不设置）
 */
export const pocketChatSendImageMessageService = async (data: {
  host: string
  token: string
  authorId: string
  imageIds: string[]
  replyMessage?: string
}) => {
  const { host, token, authorId, imageIds, replyMessage } = data

  if (!Array.isArray(imageIds) || imageIds.length === 0) {
    logUtil.warning({
      title: 'PocketChat 发送图片消息失败',
      content: 'imageIds 不能为空'
    })
    throw new AppError('PocketChat 发送图片消息失败')
  }

  if (imageIds.length > 4) {
    logUtil.warning({
      title: 'PocketChat 发送图片消息失败',
      content: `单条消息最多 4 张图片，当前为 ${imageIds.length} 张`
    })
    throw new AppError('PocketChat 发送图片消息失败')
  }

  const res = await pocketChatSendImageMessageApi({
    host,
    token,
    authorId,
    imageIds,
    replyMessage
  })

  return res
}
