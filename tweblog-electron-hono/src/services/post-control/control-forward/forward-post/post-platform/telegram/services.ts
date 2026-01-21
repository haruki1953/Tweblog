import { type platformKeyMap } from '@/configs'
import type { DataForForwardPostPlatform, ReturnForForwardPost } from './dependencies'
import { AppError } from '@/classes'
import { telegramSendMediaGroupApi, telegramSendMessageApi, telegramSendPhotoApi } from './apis'
import { telegramPostContentCheckUtil, telegramPostContentSplitUtil, tgImageListToMax10GroupList, tgMessageToPlatformPostIdUtil, tgPlatformPostIdParseUtil } from './utils'
import { useLogUtil } from '@/utils'
import { type PromiseReturnType } from '@/types'
import { telegramConfig } from './configs'

type DataForForwardPostTelegram = DataForForwardPostPlatform<typeof platformKeyMap.Telegram.key>

const logUtil = useLogUtil()

// 拼接 Telegram 的链接
export const joinWebUrlTelegram = (message: {
  message_id: number
  chat: {
    id: number
    username?: string | undefined
  }
}) => {
  const {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    message_id,
    chat
  } = message
  const messageId = message_id
  const username = (() => {
    if (chat.username != null) {
      return chat.username
    }
    return String(chat.id)
  })()
  // https://t.me/harukiOwO/16
  return `https://t.me/${username}/${messageId}`
}

// // 测试
// export const forwardPostTelegramService = async (
//   data: DataForForwardPostTelegram
// ): Promise<ReturnForForwardPost> => {
//   const {
//     targetForwardSetting,
//     targetPostData,
//     targetImageList
//   } = data

//   // 检查文字数量是否超过限制
//   const isContentExceedsLengthLimit = telegramPostContentCheckUtil(targetPostData.content).isExceedsLengthLimit
//   console.log(isContentExceedsLengthLimit)

//   // 将文字和图片分组
//   const postDataContentGroup = telegramPostContentSplitUtil(targetPostData.content)
//   const imageListGroup = tgImageListToMax10GroupList(targetImageList)
//   console.log(postDataContentGroup)
//   console.log(imageListGroup)

//   throw new AppError('测试')
// }

// 【转发方法】转发至tg
export const forwardPostTelegramService = async (
  data: DataForForwardPostTelegram
): Promise<ReturnForForwardPost> => {
  const {
    targetForwardSetting,
    targetPostData,
    targetImageList
  } = data

  const sendInfo = await (async () => {
    // 检查文字数量是否超过限制
    const isContentExceedsLengthLimit = telegramPostContentCheckUtil(targetPostData.content).isExceedsLengthLimit
    // 检查图片数量是否超过限制
    const isImageExceedsLengthLimit = targetImageList.length > telegramConfig.maxImageNumberOnSend
    // 图片或字数超过限制则使用多回复模式（通过多个回复来发送完整内容）
    if (isContentExceedsLengthLimit || isImageExceedsLengthLimit) {
      // 多回复发送
      return await sendTgMultiple(data)
    } else {
      // 普通发送
      return await sendTgNormal(data)
    }
  })()
  // 将得到的数据处理为指定格式
  const resPostInfo = {
    postId: targetPostData.id,
    // Telegram 的 PlatformPostId 格式为 @harukiOwO/45 (chatId/messageId)
    platformPostId: tgMessageToPlatformPostIdUtil(sendInfo.post),
    platformPostLink: joinWebUrlTelegram(sendInfo.post)
  }

  // 整理图片
  let resImageList: ReturnForForwardPost['resImageList'] = []
  // 发送的图片是否缺少
  const isSendImageLost = targetImageList.length !== sendInfo.image.length
  if (isSendImageLost) {
    // 数量不对，就不进行图片转发记录关联
    logUtil.info({
      title: '转发问题',
      content:
      'telegram 转发时出现图片丢失的问题\n' +
      `post id: ${targetPostData.id}\n` +
      `forwardSetting uuid: ${targetForwardSetting.uuid}\n`
    })
  } else {
    // 数量正确，处理为所需的数据
    resImageList = targetImageList.map((item, index) => {
      return {
        imageId: item.id,
        // Telegram 的 PlatformPostId 格式为 @harukiOwO/45 (chatId/messageId)
        platformImageId: tgMessageToPlatformPostIdUtil(sendInfo.image[index]),
        // Telegram接口好像没办法得到像前端中解析到的那样的图片真实链接
        // platformImageLink 就先暂且设置为推文的链接吧
        platformImageLink: joinWebUrlTelegram(sendInfo.image[index])
      }
    })
  }
  // console.log({
  //   resPostInfo,
  //   resImageList
  // })
  return {
    resPostInfo,
    resImageList
  }
}

// 普通发送
const sendTgNormal = async (data: DataForForwardPostTelegram) => {
  const {
    targetForwardSetting,
    targetPostData,
    targetImageList
  } = data

  return await tgSendService({
    botToken: targetForwardSetting.data['Bot Token'],
    chatId: targetForwardSetting.data['Chat Id'],
    text: targetPostData.content,
    photoPathList: targetImageList.map(i => i.localLargeImagePath),
    parentPostSamePlatformPostId: targetPostData.parentPostSamePlatformPostId,
    targetData: data
  })
}

// 多回复发送
const sendTgMultiple = async (data: DataForForwardPostTelegram) => {
  const {
    targetForwardSetting,
    targetPostData,
    targetImageList
  } = data

  // 将文字和图片分组
  const postDataContentGroup = telegramPostContentSplitUtil(targetPostData.content)
  const imageListGroup = tgImageListToMax10GroupList(targetImageList)

  // 整理内容数组
  const tweetDataList = []
  let groupIndex = 0
  while (
    groupIndex < postDataContentGroup.length ||
      groupIndex < imageListGroup.length
  ) {
    const imageList = (() => {
      if (groupIndex < imageListGroup.length) {
        return imageListGroup[groupIndex]
      } else {
        return []
      }
    })()
    const postDataContent = (() => {
      if (groupIndex < postDataContentGroup.length) {
        return postDataContentGroup[groupIndex]
      } else {
        return ''
      }
    })()
    tweetDataList.push({
      imageList,
      postDataContent
    })
    groupIndex += 1
  }

  const sendInfoList: Array<PromiseReturnType<typeof tgSendService>> = []
  for (const tweetData of tweetDataList) {
    // 处理将传入推文发送的回复信息
    const parentPostSamePlatformPostId = (() => {
      if (sendInfoList.length === 0) {
        // 如果sendInfoList为空，即代表首次发送，以原本的父帖为准
        return targetPostData.parentPostSamePlatformPostId
      } else {
        // 将sendInfoList的最后一个的id，作为多回复发送的父帖
        return tgMessageToPlatformPostIdUtil(
          sendInfoList[sendInfoList.length - 1].post
        )
      }
    })()
    // 发送推文
    const sendInfo = await tgSendService({
      botToken: targetForwardSetting.data['Bot Token'],
      chatId: targetForwardSetting.data['Chat Id'],
      text: tweetData.postDataContent,
      photoPathList: tweetData.imageList.map(i => i.localLargeImagePath),
      parentPostSamePlatformPostId,
      targetData: data
    })
    sendInfoList.push(sendInfo)
  }

  if (sendInfoList.length === 0) {
    throw new AppError('推文转发失败', 500)
  }

  // 最后的数据处理
  const post = sendInfoList[0].post
  const image = []
  for (const sendInfo of sendInfoList) {
    image.push(...sendInfo.image)
  }
  return {
    post,
    image
  }
}

// 对tg基础api封装，自动适应图片数量
const tgSendService = async (data: {
  botToken: string
  chatId: string
  text: string
  photoPathList: string[]
  parentPostSamePlatformPostId?: string
  // 抛出错误时才会用到这里的数据
  targetData: DataForForwardPostTelegram
}) => {
  const {
    botToken,
    chatId,
    text,
    photoPathList,
    parentPostSamePlatformPostId,
    targetData
  } = data

  const replyParameters = (() => {
    if (parentPostSamePlatformPostId == null) {
      return undefined
    }
    const idInfo = tgPlatformPostIdParseUtil(parentPostSamePlatformPostId)
    if (idInfo == null) {
      logUtil.info({
        title: '转发失败',
        content:
        'telegram platformPostId 解析失败\n' +
        `post id: ${targetData.targetPostData.id}\n` +
        `forwardSetting uuid: ${targetData.targetForwardSetting.uuid}\n` +
        `platformPostId: ${parentPostSamePlatformPostId}\n`
      })
      throw new AppError('转发失败')
    }
    return idInfo
  })()

  const baseSendParameter = {
    botToken,
    chatId,
    text,
    replyParameters
  }

  if (photoPathList.length > 10) {
    throw new AppError('telegram 转发代码逻辑错误，不能一次发送十张以上图片')
  } else if (photoPathList.length === 0) {
    const message = await telegramSendMessageApi({
      ...baseSendParameter
    })
    return {
      post: message,
      image: []
    }
  } else if (photoPathList.length === 1) {
    const message = await telegramSendPhotoApi({
      ...baseSendParameter,
      photoPath: photoPathList[0]
    })
    return {
      post: message,
      image: [message]
    }
  } else {
    const messageList = await telegramSendMediaGroupApi({
      ...baseSendParameter,
      photoPathList
    })
    if (messageList.length === 0) {
      logUtil.info({
        title: '转发失败',
        content:
        'telegram telegramSendMediaGroupApi 返回数组为空\n' +
        `post id: ${targetData.targetPostData.id}\n` +
        `forwardSetting uuid: ${targetData.targetForwardSetting.uuid}\n`
      })
      throw new AppError('转发失败')
    }
    return {
      post: messageList[0],
      image: messageList
    }
  }
}
