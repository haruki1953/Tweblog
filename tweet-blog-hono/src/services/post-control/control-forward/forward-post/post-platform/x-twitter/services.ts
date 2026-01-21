import { platformKeyMap } from '@/configs'
import type { DataForForwardPostPlatform, ReturnForForwardPost } from './dependencies'
import { type TweetV2PostTweetResult, TwitterApi, type TwitterApiReadWrite } from 'twitter-api-v2'
import { useFetchSystem } from '@/systems'
import { imageListToMax4GroupList, useLogUtil } from '@/utils'
import { AppError } from '@/classes'
import { xtwitterPostContentCheckUtil, xtwitterPostContentSplitUtil } from './utils'
import { xtwitterConfig } from './config'

const fetchSystem = useFetchSystem()
const logUtil = useLogUtil()

type DataForForwardPostXtwitter = DataForForwardPostPlatform<typeof platformKeyMap.X.key>

// 推特接口好像没办法得到像前端中解析到的那样的图片真实链接
// platformImageLink 就先暂且设置为推文的链接吧

// 拼接推特链接
export const joinWebUrlXtwitter = (data: {
  username: string
  tweetId: string
}) => {
  const { username, tweetId } = data
  // https://x.com/sakikoO_O/status/1842172907080061009
  return `https://x.com/${username}/status/${tweetId}`
}

// 【转发方法】转发至推特
export const forwardPostXtwitterService = async (
  data: DataForForwardPostXtwitter
): Promise<ReturnForForwardPost> => {
  const {
    targetForwardSetting,
    targetPostData,
    targetImageList
  } = data

  // 新建 twitterClient
  const twitterClient = new TwitterApi({
    appKey: targetForwardSetting.data['API Key'],
    appSecret: targetForwardSetting.data['API Key Secret'],
    accessToken: targetForwardSetting.data['Access Token'],
    accessSecret: targetForwardSetting.data['Access Token Secret']
  }, {
    // 使用代理
    httpAgent: fetchSystem.getAgent()
  }).readWrite

  // 首先发图片，发送多张图片
  const uploadMediaResList = await Promise.all(
    targetImageList.map(async (targetImageData) => {
      const uploadMediaRes = await twitterClient.v1.uploadMedia(targetImageData.localLargeImagePath)
      const mediaId = uploadMediaRes
      if (targetImageData.alt !== null) {
        // 设置alt
        await twitterClient.v1.createMediaMetadata(mediaId, {
          // 【250215】避免alt超过限制
          alt_text: { text: targetImageData.alt.slice(0, xtwitterConfig.maxAltCharactersOnSend) }
        })
      }
      return {
        imageId: targetImageData.id,
        media_id: uploadMediaRes
      }
    })
  )

  const mediaIdList = uploadMediaResList.map((i) => i.media_id)

  const postTweetRes = await (async () => {
    // 检查文字数量是否超过限制
    const isContentExceedsLengthLimit = xtwitterPostContentCheckUtil(targetPostData.content).isExceedsLengthLimit
    // 检查图片数量是否超过限制
    const isImageExceedsLengthLimit = targetImageList.length > xtwitterConfig.maxImageNumberOnSend
    // 图片或字数超过限制则使用多回复模式（通过多个回复来发送完整内容）
    if (isContentExceedsLengthLimit || isImageExceedsLengthLimit) {
      // 多回复发送
      return await postTweetMultiple({
        ...data,
        twitterClient,
        mediaIdList
      })
    } else {
      // 普通发送
      return await postTweetNormal({
        ...data,
        twitterClient,
        mediaIdList
      })
    }
  })()

  const tweetId = postTweetRes.data.id

  // 尝试获取用户名
  const currentUserV2Res = await twitterClient.currentUserV2().catch((error) => {
    logUtil.info({
      title: `${platformKeyMap.X.name} 用户名获取失败`,
      content:
          `推文 id: ${targetPostData.id}\n` +
          `转发配置 uuid: ${targetForwardSetting.uuid}\n` +
          String(error)
    })
    return null
  })
  const username = currentUserV2Res?.data.username ?? '_'

  // 将得到的数据处理为指定格式
  const platformPostLink = joinWebUrlXtwitter({ username, tweetId })
  const resPostInfo = {
    postId: targetPostData.id,
    platformPostId: tweetId,
    platformPostLink
  }
  const resImageList = uploadMediaResList.map((i) => {
    return {
      imageId: i.imageId,
      platformImageId: i.media_id,
      // 推特接口好像没办法得到像前端中解析到的那样的图片真实链接
      // platformImageLink 就先暂且设置为推文的链接吧
      platformImageLink: platformPostLink
    }
  })
  return {
    resPostInfo,
    resImageList
  }
}

// 普通发送
const postTweetNormal = async (dependencies: {
  twitterClient: TwitterApiReadWrite
  mediaIdList: string[]
} & DataForForwardPostXtwitter) => {
  const {
    // targetForwardSetting,
    targetPostData,
    // targetImageList,
    twitterClient,
    mediaIdList
  } = dependencies

  // 处理将传入推文发送的媒体信息
  const mediaForTweet = (() => {
    if (mediaIdList.length === 0) {
      return undefined
    }
    return {
      media_ids: mediaIdList.slice(
        0, xtwitterConfig.maxImageNumberOnSend
      ) as [string, string, string, string]
    }
  })()
  // 处理将传入推文发送的回复信息
  const replyForTweet = (() => {
    if (targetPostData.parentPostSamePlatformPostId == null) {
      return undefined
    }
    return {
      in_reply_to_tweet_id: targetPostData.parentPostSamePlatformPostId
    }
  })()

  // 发送推文
  const postTweetRes = await twitterClient.v2.tweet({
    text: targetPostData.content,
    media: mediaForTweet,
    reply: replyForTweet
  })
  return postTweetRes
}

// 多回复发送
const postTweetMultiple = async (dependencies: {
  twitterClient: TwitterApiReadWrite
  mediaIdList: string[]
} & DataForForwardPostXtwitter) => {
  const {
    // targetForwardSetting,
    targetPostData,
    // targetImageList,
    twitterClient,
    mediaIdList
  } = dependencies

  // 将文字和图片分组
  const postDataContentGroup = xtwitterPostContentSplitUtil(targetPostData.content)
  const mediaIdListGroup = imageListToMax4GroupList(mediaIdList)

  // 推文数据数组
  const tweetDataList = []
  let groupIndex = 0
  while (
    groupIndex < postDataContentGroup.length ||
    groupIndex < mediaIdListGroup.length
  ) {
    const mediaIdList = (() => {
      if (groupIndex < mediaIdListGroup.length) {
        return mediaIdListGroup[groupIndex]
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
      mediaIdList,
      postDataContent
    })
    groupIndex += 1
  }

  const postTweetResList: TweetV2PostTweetResult[] = []
  for (const tweetData of tweetDataList) {
    // 处理将传入推文发送的媒体信息
    const mediaForTweet = (() => {
      const mediaIdList = tweetData.mediaIdList
      if (mediaIdList.length === 0) {
        return undefined
      }
      return {
        media_ids: mediaIdList.slice(
          0, xtwitterConfig.maxImageNumberOnSend
        ) as [string, string, string, string]
      }
    })()
    // 处理将传入推文发送的回复信息
    const replyForTweet = (() => {
      if (postTweetResList.length === 0) {
        // 如果postTweetResList为空，即代表首次发送，以原本的父帖为准
        if (targetPostData.parentPostSamePlatformPostId == null) {
          return undefined
        }
        return {
          in_reply_to_tweet_id: targetPostData.parentPostSamePlatformPostId
        }
      } else {
        // 将postTweetResList的最后一个的id，作为多回复发送的父帖
        return {
          in_reply_to_tweet_id: postTweetResList[postTweetResList.length - 1].data.id
        }
      }
    })()

    // 发送推文
    const postTweetRes = await twitterClient.v2.tweet({
      text: tweetData.postDataContent,
      media: mediaForTweet,
      reply: replyForTweet
    })
    postTweetResList.push(postTweetRes)
  }

  if (postTweetResList.length === 0) {
    throw new AppError('推文转发失败', 500)
  }

  return postTweetResList[0]
}
