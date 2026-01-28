// src/services/post-control/control-forward/forward-post/post-platform/pocket-chat/services/forward.ts

import { type platformKeyMap } from '@/configs'
import {
  pocketChatConfig,
  processPocketChatImage,
  pocketChatUploadImageApi,
  pocketChatPostContentSplitUtil
} from './dependencies'
import {
  pocketChatGetSessionService
} from './pocket-session'
import {
  pocketChatSendTextMessageService,
  pocketChatSendImageMessageService
} from './pocket-post'
import type {
  DataForForwardPostPlatform,
  ReturnForForwardPost
} from './dependencies'
import { AppError } from '@/classes'
import { useLogUtil, urlJoinUtil, imageListToMaxNumGroupList } from '@/utils'
import { type PromiseReturnType } from '@/types'

const logUtil = useLogUtil()

type DataForForwardPostPocketChat =
  DataForForwardPostPlatform<typeof platformKeyMap.PocketChat.key>

type PocketChatSendTextResult = PromiseReturnType<
  typeof pocketChatSendTextMessageService
>
type PocketChatSendImageResult = PromiseReturnType<
  typeof pocketChatSendImageMessageService
>

interface UploadedImageInfo {
  id: string
  localLargeImagePath: string
  alt?: string | null
}

/**
 * 将数组按最大数量分组
 */
const groupListByMaxNum = <T>(list: T[], maxNum: number): T[][] => {
  // const result: T[][] = []
  // let index = 0
  // while (index < list.length) {
  //   result.push(list.slice(index, index + maxNum))
  //   index += maxNum
  // }
  // return result
  return imageListToMaxNumGroupList({
    imageList: list,
    maxNum
  })
}

/**
 * 拼接 PocketChat 消息链接
 * 形如：
 * http://127.0.0.1:58090/?id=ve0p4tl9f78veij&created=2026-01-18+09:29:29.827Z
 */
const joinPocketChatMessageUrl = (data: {
  host: string
  id: string
  created: string
}) => {
  const { host, id, created } = data
  const query = `?id=${encodeURIComponent(id)}&created=${encodeURIComponent(created)}`
  return urlJoinUtil(host, query)
}

/**
 * 【转发方法】PocketChat
 */
export const forwardPostPocketChatService = async (
  data: DataForForwardPostPocketChat
): Promise<ReturnForForwardPost> => {
  const {
    targetForwardSetting,
    targetPostData,
    targetImageList
  } = data

  const host = targetForwardSetting.data['PocketChat Host']
  const identity = targetForwardSetting.data['Username or Email']
  const password = targetForwardSetting.data.Password

  if (host === '' || identity === '' || password === '') {
    logUtil.info({
      title: '转发失败',
      content:
      'PocketChat 转发配置不完整\n' +
      "host === '' || identity === '' || password === ''\n" +
      `post id: ${targetPostData.id}\n` +
      `forwardSetting uuid: ${targetForwardSetting.uuid}\n`
    })
    throw new AppError('PocketChat 转发配置不完整')
  }

  // 1. 获取 Session（带缓存 + 自动刷新）
  const session = await pocketChatGetSessionService({
    host,
    identity,
    password
  })
  const token = session.token
  const authorId = session.record.id

  // 2. 处理并上传所有图片，得到 images 集合的 id
  const uploadedImageInfoList: UploadedImageInfo[] = []

  for (const img of targetImageList) {
    const processed = await processPocketChatImage(img.localLargeImagePath)

    const uploaded = await pocketChatUploadImageApi({
      host,
      token,
      authorId,
      alt: img.alt ?? undefined,
      processed
    })

    uploadedImageInfoList.push({
      id: uploaded.id,
      localLargeImagePath: img.localLargeImagePath,
      alt: img.alt
    })
  }

  // 3. 文本拆分（带 (1/3) 尾巴）
  const content = targetPostData.content ?? ''
  const textChunks = content.trim().length === 0
    ? []
    : pocketChatPostContentSplitUtil(content)

  // 4. 图片分组（每组最多 4 张）
  const imageGroups = groupListByMaxNum(
    uploadedImageInfoList,
    pocketChatConfig.maxImageNumberOnSend
  )

  // 5. 发送文字消息（如果有）
  const textSendResults: PocketChatSendTextResult[] = []
  let rootMessageId: string | undefined
  let rootMessageCreated: string | undefined

  if (textChunks.length > 0) {
    for (let i = 0; i < textChunks.length; i++) {
      const chunk = textChunks[i]
      // const replyMessage = i === 0 ? undefined : textSendResults[i - 1].id
      const replyMessage = (() => {
        if (i === 0) {
          return targetPostData.parentPostSamePlatformPostId
        }
        return textSendResults[i - 1].id
      })()

      const res = await pocketChatSendTextMessageService({
        host,
        token,
        authorId,
        content: chunk,
        replyMessage
      })

      textSendResults.push(res)

      if (i === 0) {
        rootMessageId = res.id
        rootMessageCreated = res.created
      }
    }
  }

  // 6. 发送图片消息
  const imageSendResults: PocketChatSendImageResult[] = []

  for (const group of imageGroups) {
    const imageIds = group.map((g) => g.id)

    const res = await pocketChatSendImageMessageService({
      host,
      token,
      authorId,
      imageIds,
      // 如果有文字消息，则所有图片消息都 reply 到 rootMessageId
      replyMessage: rootMessageId ?? targetPostData.parentPostSamePlatformPostId
    })

    imageSendResults.push(res)

    // 如果没有文字消息，则第一条图片消息可作为 root
    if (rootMessageId == null) {
      rootMessageId = res.id
      rootMessageCreated = res.created
    }
  }

  // 7. 结果整理
  if (rootMessageId == null || rootMessageCreated == null) {
    // 既没有文字消息，也没有图片消息
    logUtil.info({
      title: '转发失败',
      content:
      'PocketChat 转发失败\n' +
      'rootMessageId == null || rootMessageCreated == null\n' +
      `post id: ${targetPostData.id}\n` +
      `forwardSetting uuid: ${targetForwardSetting.uuid}\n`
    })
    throw new AppError('PocketChat 转发失败')
  }

  const resPostInfo: ReturnForForwardPost['resPostInfo'] = {
    postId: targetPostData.id,
    platformPostId: rootMessageId,
    platformPostLink: joinPocketChatMessageUrl({
      host,
      id: rootMessageId,
      created: rootMessageCreated
    })
  }

  const resImageList: ReturnForForwardPost['resImageList'] =
    uploadedImageInfoList.map((img) => {
      return {
        imageId: targetImageList.find((t) =>
          t.localLargeImagePath === img.localLargeImagePath
        )?.id ?? '',
        platformImageId: img.id,
        platformImageLink: '' // PocketChat 暂无单独图片链接规范，可后续扩展
      }
    })

  return {
    resPostInfo,
    resImageList
  }
}
