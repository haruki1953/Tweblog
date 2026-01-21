import { type platformKeyMap } from '@/configs'
import type { DataForForwardPostPlatform, ReturnForForwardPost } from './dependencies'
import { AppError } from '@/classes'
import { discordCreateMessageApi } from './apis'
import { useLogUtil } from '@/utils'
import { discordImageListToMax10GroupList, discordPostContentCheckUtil, discordPostContentSplitUtil } from './utils'
import { discordConfig } from './configs'
import { type PromiseReturnType } from '@/types'

type DataForForwardPostDiscord = DataForForwardPostPlatform<typeof platformKeyMap.Discord.key>

const logUtil = useLogUtil()

// 拼接 Discord 的链接
export const joinWebUrlDiscord = (
  guildId: string,
  channelId: string,
  messageId: string
) => {
  // https://discord.com/channels/1334824296647753832/1339729617937891328/1339905738172268689
  return `https://discord.com/channels/${guildId}/${channelId}/${messageId}`
}

// // 测试
// export const forwardPostDiscordService = async (
//   data: DataForForwardPostDiscord
// ): Promise<ReturnForForwardPost> => {
//   const {
//     targetForwardSetting,
//     targetPostData,
//     targetImageList
//   } = data

//   // ...
//   throw new AppError('测试')
// }

// 【转发方法】转发至dc
export const forwardPostDiscordService = async (
  data: DataForForwardPostDiscord
): Promise<ReturnForForwardPost> => {
  const {
    targetForwardSetting,
    targetPostData,
    targetImageList
  } = data

  // 普通发送
  const sendInfo = await (async () => {
    // 检查文字数量是否超过限制
    const isContentExceedsLengthLimit = discordPostContentCheckUtil(targetPostData.content).isExceedsLengthLimit
    // 检查图片数量是否超过限制
    const isImageExceedsLengthLimit = targetImageList.length > discordConfig.maxImageNumberOnSend
    // 图片或字数超过限制则使用多回复模式（通过多个回复来发送完整内容）
    if (isContentExceedsLengthLimit || isImageExceedsLengthLimit) {
      // 多回复发送
      return await discordSendMultiple(data)
    } else {
      // 普通发送
      return await discordSendNormal(data)
    }
  })()

  // 将得到的数据处理为指定格式
  // 整理帖子
  const resPostInfo = {
    postId: targetPostData.id,
    platformPostId: sendInfo.id,
    platformPostLink: joinWebUrlDiscord(
      targetForwardSetting.data['Guild Id'],
      targetForwardSetting.data['Channel Id'],
      sendInfo.id
    )
  }
  // 整理图片
  let resImageList: ReturnForForwardPost['resImageList'] = []
  // 发送的图片是否缺少
  const isSendImageLost = targetImageList.length !== sendInfo.attachments.length
  if (isSendImageLost) {
    // 数量不对，就不进行图片转发记录关联
    logUtil.info({
      title: '转发问题',
      content:
      'discord 转发时出现图片丢失的问题\n' +
      `post id: ${targetPostData.id}\n` +
      `forwardSetting uuid: ${targetForwardSetting.uuid}\n`
    })
  } else {
    // 数量正确，处理为所需的数据
    resImageList = targetImageList.map((item, index) => {
      return {
        imageId: item.id,
        platformImageId: sendInfo.attachments[index].id,
        platformImageLink: sendInfo.attachments[index].url
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
const discordSendNormal = async (data: DataForForwardPostDiscord) => {
  const {
    targetForwardSetting,
    targetPostData,
    targetImageList
  } = data

  return await discordCreateMessageApi({
    authorization: targetForwardSetting.data.Authorization,
    channelId: targetForwardSetting.data['Channel Id'],
    content: targetPostData.content,
    referenceMessageId: targetPostData.parentPostSamePlatformPostId,
    targetImageList
  })
}

// 多回复发送
const discordSendMultiple = async (data: DataForForwardPostDiscord) => {
  const {
    targetForwardSetting,
    targetPostData,
    targetImageList
  } = data
  // 将文字和图片分组
  const postDataContentGroup = discordPostContentSplitUtil(targetPostData.content)
  const imageListGroup = discordImageListToMax10GroupList(targetImageList)
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
  // // 测试
  // console.log(tweetDataList)

  // 遍历，发送
  const sendInfoList: Array<PromiseReturnType<typeof discordCreateMessageApi>> = []
  for (const tweetData of tweetDataList) {
    // 回复处理
    const referenceMessageId = (() => {
      if (sendInfoList.length === 0) {
        // 如果sendInfoList为空，即代表首次发送，以原本的父帖为准
        return targetPostData.parentPostSamePlatformPostId
      } else {
        // 将sendInfoList的最后一个的id，作为多回复发送的父帖
        return sendInfoList[sendInfoList.length - 1].id
      }
    })()

    // 发送推文
    const sendInfo = await discordCreateMessageApi({
      authorization: targetForwardSetting.data.Authorization,
      channelId: targetForwardSetting.data['Channel Id'],
      content: tweetData.postDataContent,
      referenceMessageId,
      targetImageList: tweetData.imageList
    })
    sendInfoList.push(sendInfo)
  }

  // 处理 sendInfoList
  if (sendInfoList.length === 0) {
    throw new AppError('推文转发失败', 500)
  }
  const attachments = []
  for (const sendInfo of sendInfoList) {
    attachments.push(...sendInfo.attachments)
  }
  return {
    id: sendInfoList[0].id,
    attachments
  }
}
