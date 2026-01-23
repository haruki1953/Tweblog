import { AppError } from '@/classes'
import { type PostControlForwardPostJsonType } from '@/schemas'
import { useForwardSystem } from '@/systems'
import { type PlatformKeyEnumValues, platformKeyMap } from '@/configs'
import { forwardPostTelegramService, forwardPostXtwitterService, forwardPostDiscordService, forwardPostBlueskyService, forwardPostPocketChatService } from './post-platform'
import { dataImageBestLocalImagePath, dataPostHandleImagesOrder, useLogUtil } from '@/utils'
import {
  postControlForwardManualLinkingImageService,
  postControlForwardManualLinkingService,
  postGetByIdService
} from './dependencies'
import { type DataForForwardPostPlatform, type DataForForwardPost, type ReturnForForwardPost } from './type'
import { type PromiseReturnType, type ForwardSettingItem } from '@/types'

type PostGetByIdServicePromiseReturnType = PromiseReturnType<typeof postGetByIdService>

const forwardSystem = useForwardSystem()
const logUtil = useLogUtil()

// 按照平台对应字段，调用不同平台的转发方法
// eslint-disable-next-line @typescript-eslint/naming-convention
const postControlForwardPostService_SwitchPlatformPart = async (
  data: DataForForwardPost
): Promise<ReturnForForwardPost> => {
  if (isDataForPlatform(data, platformKeyMap.X.key)) {
    // 调用 X/Twitter 的转发方法
    return await forwardPostXtwitterService(data)
  }
  if (isDataForPlatform(data, platformKeyMap.Telegram.key)) {
    // 调用 Telegram 的转发方法
    return await forwardPostTelegramService(data)
  }
  if (isDataForPlatform(data, platformKeyMap.Discord.key)) {
    // 调用 Discord 的转发方法
    return await forwardPostDiscordService(data)
  }
  if (isDataForPlatform(data, platformKeyMap.Bluesky.key)) {
    // 调用 Bluesky 的转发方法
    return await forwardPostBlueskyService(data)
  }
  if (isDataForPlatform(data, platformKeyMap.PocketChat.key)) {
    // 调用 PocketChat 的转发方法
    return await forwardPostPocketChatService(data)
  }

  throw new AppError('当前平台暂不支持转发', 400)
}

// data 类型守卫（类型体操真是酣畅淋漓😇）
// 通过传入平台所代表字段，来判断对应的类型
const isDataForPlatform = <Platform extends PlatformKeyEnumValues>(
  data: DataForForwardPost, platform: Platform
): data is DataForForwardPostPlatform<Platform> => {
  return data.targetForwardSetting.platform === platform
}

export const postControlForwardPostService = async (json: PostControlForwardPostJsonType) => {
  const {
    postId,
    forwardConfigId
  } = json

  // 获取目标转发配置
  const targetForwardSetting = forwardSystem.forwardSettingFind(forwardConfigId)
  if (targetForwardSetting == null) {
    throw new AppError('转发配置不存在', 400)
  }
  // 获取目标帖子
  // 【250109】添加了query，也查询在回收站中的
  const targetPost = await postGetByIdService(postId, { keepIsDetele: 'true' })

  // 对数据预处理一下
  // 尝试获取父帖子在同平台的id
  const parentPostSamePlatformPostId = findParentPostSamePlatformPostId({
    targetForwardSetting, targetPost
  })
  // 预处理帖子数据
  const targetPostData = {
    id: targetPost.id,
    content: targetPost.content,
    parentPostSamePlatformPostId
  }
  // 预处理图片数据
  const targetImageList = (() => {
    // 利用 Post.imagesOrder 对 Post.images 排序
    return dataPostHandleImagesOrder(targetPost).images.map((i) => {
      return {
        id: i.id,
        alt: i.alt,
        localLargeImagePath: dataImageBestLocalImagePath(i)
      }
    })
  })()

  const dataForForwardPostPlatformd: DataForForwardPost = {
    targetForwardSetting,
    targetPostData,
    targetImageList
  }
  // 按照平台对应字段，调用不同平台的转发方法
  const returnForForwardPostPlatform: ReturnForForwardPost =
    await postControlForwardPostService_SwitchPlatformPart(
      dataForForwardPostPlatformd
    ).catch((error) => {
      // console.log(error)
      if (error instanceof AppError) {
        throw error
      }
      logUtil.warning({
        title: '转发失败',
        content:
          `推文 id: ${targetPost.id}\n` +
          `转发配置 uuid: ${targetForwardSetting.uuid}\n` +
          String(error)
      })
      throw new AppError('转发失败')
    })

  // 最后，将转发后得到的信息，关联至帖子，关联至图片
  const {
    resPostInfo,
    resImageList
  } = returnForForwardPostPlatform
  const postForward = await postControlForwardManualLinkingService({
    ...resPostInfo,
    forwardConfigId
  })
  const imageForwardList = await Promise.all(
    resImageList.map(async (resImageInfo) => {
      return await postControlForwardManualLinkingImageService({
        ...resImageInfo,
        forwardConfigId
      })
    })
  )

  logUtil.success({
    title: '转发成功',
    content:
      `推文 id: ${targetPost.id}\n` +
      `转发配置 uuid: ${targetForwardSetting.uuid}\n`
  })
  return {
    postForward,
    imageForwardList
  }
}

// 尝试获取父帖子在同平台的id
const findParentPostSamePlatformPostId = (data: {
  targetForwardSetting: ForwardSettingItem
  targetPost: PostGetByIdServicePromiseReturnType
}) => {
  const { targetForwardSetting, targetPost } = data
  // 没有父贴，直接返回
  if (targetPost.parentPost == null) {
    return undefined
  }
  // 首先尝试查找转发记录，不仅同平台 而且 forwardConfigId 相同
  const findPostForwardSameForwardConfigId = targetPost.parentPost.postForwards.slice().sort(
    // 从新到旧排序，也就是说优先找的是新的
    (a, b) => b.forwardAt.getTime() - a.forwardAt.getTime()
  ).find(
    (i) => {
      return (
        i.platform === targetForwardSetting?.platform &&
        i.forwardConfigId === targetForwardSetting?.uuid
      )
    }
  )
  if (findPostForwardSameForwardConfigId != null) {
    return findPostForwardSameForwardConfigId.platformPostId
  }
  // 没找到，退而求其次只找同平台的，也就是说可能是被别的账号（forwardConfigId）转发的
  const findPostForwardSamePlatform = targetPost.parentPost.postForwards.slice().sort(
    // 从新到旧排序，也就是说优先找的是新的
    (a, b) => b.forwardAt.getTime() - a.forwardAt.getTime()
  ).find(
    (i) => {
      return i.platform === targetForwardSetting?.platform
    }
  )
  if (findPostForwardSamePlatform != null) {
    return findPostForwardSamePlatform.platformPostId
  }
  // 转发记录中都没找到，再在导入记录中寻找
  const findPostImportSamePlatform = targetPost.parentPost.postImports.slice().sort(
    // 从新到旧排序，也就是说优先找的是新的
    (a, b) => b.importedAt.getTime() - a.importedAt.getTime()
  ).find(
    (i) => {
      return i.platform === targetForwardSetting?.platform
    }
  )
  if (findPostImportSamePlatform != null) {
    return findPostImportSamePlatform.platformPostId
  }
  // 都没找到
  return undefined
}
