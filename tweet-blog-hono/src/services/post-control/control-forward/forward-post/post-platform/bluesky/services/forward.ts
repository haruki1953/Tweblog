import { type platformKeyMap } from '@/configs'
import { blueskyPostContentSplitUtil, blueskyUriToPostStrId, getFileExtensionName, blueskyImageListToMaxNumGroupList, blueskyPostContentCheckUtil, blueskyConfig } from './dependencies'
import type { DataForForwardPostPlatform, ReturnForForwardPost } from './dependencies'
import { AppError } from '@/classes'
import { urlJoinUtil } from '@/utils'
import { blueskySendPostService } from './bluesky-post'
import { type PromiseReturnType } from '@/types'

type DataForForwardPostBluesky = DataForForwardPostPlatform<typeof platformKeyMap.Bluesky.key>

// 拼接 Bluesky 的链接
export const joinWebUrlBluesky = (data: {
  // https://bsky.app
  webHost: string
  // harukiowo.bsky.social
  identifier: string
  // at://did:plc:fju6cv4shmqbymfqc7jvzkya/app.bsky.feed.post/3liisyclmrd2b
  uri: string
}) => {
  const {
    webHost,
    identifier,
    uri
  } = data
  // 3liisyclmrd2b
  const postStrId = blueskyUriToPostStrId(uri) ?? ''
  // https://bsky.app/profile/harukiowo.bsky.social/post/3liisyclmrd2b
  return urlJoinUtil(webHost, `profile/${identifier}/post/${postStrId}`)
}

// 拼接图片链接
export const joinImageUrlBluesky = (data: {
  // https://bsky.app
  cdnHost: string
  // did:plc:fju6cv4shmqbymfqc7jvzkya
  did: string
  // bafkreia2neu2ji3edzipbdex4ndmsej3bs5l4oeh7v36fx27inop5jymtm
  refLink: string
  // 获取后缀名
  localLargeImagePath: string
}) => {
  const {
    cdnHost,
    did,
    refLink,
    localLargeImagePath
  } = data
  const extensionName = getFileExtensionName(localLargeImagePath)

  // https://cdn.bsky.app/img/feed_fullsize/plain/did:plc:fju6cv4shmqbymfqc7jvzkya/bafkreia2neu2ji3edzipbdex4ndmsej3bs5l4oeh7v36fx27inop5jymtm@jpeg
  return urlJoinUtil(cdnHost, `img/feed_fullsize/plain/${did}/${refLink}@${extensionName}`)
}

// // 测试
// export const forwardPostBlueskyService = async (
//   data: DataForForwardPostBluesky
// ): Promise<ReturnForForwardPost> => {
//   const {
//     targetForwardSetting,
//     targetPostData,
//     targetImageList
//   } = data
// }

// 【转发方法】Bluesky
export const forwardPostBlueskyService = async (
  data: DataForForwardPostBluesky
): Promise<ReturnForForwardPost> => {
  const {
    targetForwardSetting,
    targetPostData,
    targetImageList
  } = data

  // const pdsHost = targetForwardSetting.data['PDS Host']
  const webHost = targetForwardSetting.data['Web Host']
  const cdnHost = targetForwardSetting.data['CDN Host']
  const identifier = targetForwardSetting.data.Identifier
  // const password = targetForwardSetting.data.Password
  // const text = targetPostData.content
  // const parentPostSamePlatformPostId = targetPostData.parentPostSamePlatformPostId

  const sendInfo = await (async () => {
    // 检查文字数量是否超过限制
    const isContentExceedsLengthLimit = blueskyPostContentCheckUtil(targetPostData.content).isExceedsLengthLimit
    // 检查图片数量是否超过限制
    const isImageExceedsLengthLimit = targetImageList.length > blueskyConfig.maxImageNumberOnSend
    // 图片或字数超过限制则使用多回复模式（通过多个回复来发送完整内容）
    if (isContentExceedsLengthLimit || isImageExceedsLengthLimit) {
      // 多回复发送
      return await blueskySendMultiple(data)
    } else {
      // 普通发送
      return await blueskySendNormal(data)
    }
  })()

  // 将得到的数据处理为指定格式
  // 整理帖子
  const resPostInfo: ReturnForForwardPost['resPostInfo'] = {
    postId: targetPostData.id,
    // platformPostId
    platformPostId: sendInfo.resCreateRecord.platformPostId,
    platformPostLink: joinWebUrlBluesky({
      webHost,
      identifier,
      uri: sendInfo.resCreateRecord.uri
    })
  }
  // 整理图片

  const resImageList: ReturnForForwardPost['resImageList'] = sendInfo.resUploadBlobInfoList.map((i) => {
    return {
      imageId: i.id,
      platformImageId: i.image.ref.$link,
      platformImageLink: joinImageUrlBluesky({
        cdnHost,
        did: i.did,
        refLink: i.image.ref.$link,
        localLargeImagePath: i.localLargeImagePath
      })
    }
  })
  // console.log(JSON.stringify({
  //   resPostInfo,
  //   resImageList
  // }, null, 2))

  return {
    resPostInfo,
    resImageList
  }
}

// 普通发送
const blueskySendNormal = async (data: DataForForwardPostBluesky) => {
  const {
    targetForwardSetting,
    targetPostData,
    targetImageList
  } = data

  const pdsHost = targetForwardSetting.data['PDS Host']
  const identifier = targetForwardSetting.data.Identifier
  const password = targetForwardSetting.data.Password
  const text = targetPostData.content
  const parentPostSamePlatformPostId = targetPostData.parentPostSamePlatformPostId

  return await blueskySendPostService({
    pdsHost,
    identifier,
    password,
    text,
    parentPostSamePlatformPostId,
    targetImageList
  })
}

// 多回复发送
const blueskySendMultiple = async (data: DataForForwardPostBluesky) => {
  const {
    targetForwardSetting,
    targetPostData,
    targetImageList
  } = data

  const pdsHost = targetForwardSetting.data['PDS Host']
  const identifier = targetForwardSetting.data.Identifier
  const password = targetForwardSetting.data.Password
  // const parentPostSamePlatformPostId = targetPostData.parentPostSamePlatformPostId

  // 将文字和图片分组
  const postDataContentGroup = blueskyPostContentSplitUtil(targetPostData.content)
  const imageListGroup = blueskyImageListToMaxNumGroupList(targetImageList)
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

  // 遍历，发送
  const sendInfoList: Array<PromiseReturnType<typeof blueskySendPostService>> = []
  for (const tweetData of tweetDataList) {
    // 回复处理
    const parentPostSamePlatformPostId = (() => {
      if (sendInfoList.length === 0) {
        // 如果sendInfoList为空，即代表首次发送，以原本的父帖为准
        return targetPostData.parentPostSamePlatformPostId
      } else {
        // 将sendInfoList的最后一个的id，作为多回复发送的父帖
        return sendInfoList[sendInfoList.length - 1].resCreateRecord.platformPostId
      }
    })()
    // 推文内容
    const text = tweetData.postDataContent
    // 发送推文
    const sendInfo = await blueskySendPostService({
      pdsHost,
      identifier,
      password,
      text,
      parentPostSamePlatformPostId,
      targetImageList: tweetData.imageList
    })
    sendInfoList.push(sendInfo)
  }
  // 处理 sendInfoList
  if (sendInfoList.length === 0) {
    throw new AppError('推文转发失败', 500)
  }
  const resUploadBlobInfoList = []
  for (const sendInfo of sendInfoList) {
    resUploadBlobInfoList.push(...sendInfo.resUploadBlobInfoList)
  }
  return {
    ...sendInfoList[0],
    resUploadBlobInfoList
  }
}
