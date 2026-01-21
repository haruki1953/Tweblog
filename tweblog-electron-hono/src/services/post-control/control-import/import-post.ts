import { type PostControlImportJsonType } from '@/schemas'
import { useForwardSystem, useTaskSystem } from '@/systems'
import {
  imageSendByUrlService, imageUpdateService,
  postSendService, postUpdateService,
  postControlForwardManualLinkingService,
  postControlForwardManualLinkingImageService
} from './dependencies'
import { type ImageInferSelect, type PostInferSelect } from '@/types'

import { useLogUtil } from '@/utils'
import { platformKeyMap } from '@/configs'
import { drizzleDb, drizzleOrm, drizzleSchema } from '@/db'

const taskSystem = useTaskSystem()

const logUtil = useLogUtil()

// 帖子导入服务
export const postControlImportService = async (json: PostControlImportJsonType) => {
  const { importPosts, advancedSettings } = json
  // 创建任务，用于保存导入进度
  const taskImport = taskSystem.taskImportCreate({
    totalCount: importPosts.length
  })
  ;(async () => {
    logUtil.info({
      content: `${importPosts.length} 条推文开始导入，任务 uuid: ${taskImport.uuid}`
    })
    // 已完成计数
    let completedCount = 0
    // 遍历，导入帖子。
    for (const post of importPosts) {
      if (!taskSystem.taskIsRunning(taskImport.uuid)) {
        // 如果任务非运行状态，则导入中止
        logUtil.info({
          content: `${importPosts.length} 条推文导入中止，任务 uuid: ${taskImport.uuid}`
        })
        return
      }
      await postControlImportServicePostImportPart({ post, advancedSettings }).catch((error) => {
        const content = (() => {
          if (post.platform == null || post.platformLink == null) {
            return String(error)
          }
          return `${
            platformKeyMap[post.platform].name +
            ' : ' +
            post.platformLink +
            '\n' +
            String(error)
          }`
        })()
        logUtil.warning({
          title: '帖子导入发生错误',
          content
        })
        return null
      })
      completedCount += 1
      // 更新任务信息
      taskSystem.taskImportUpdate(taskImport.uuid, {
        completedCount
      })
    }
    logUtil.success({
      content: `${importPosts.length} 条推文完成导入，任务 uuid: ${taskImport.uuid}`
    })
    // 任务完成
    // taskSystem.taskImportDelete(taskImport.uuid)
    taskSystem.taskComplete(taskImport.uuid)
  })().catch(() => {})
  return {
    taskImport,
    taskStore: taskSystem.taskStore()
  }
}

// 帖子导入服务：帖子导入部分
const postControlImportServicePostImportPart = async (data: {
  post: PostControlImportJsonType['importPosts'][number]
  advancedSettings: PostControlImportJsonType['advancedSettings']
}) => {
  const { post, advancedSettings } = data
  const { importImages } = post
  // 遍历，导入图片
  const targetImages = (await Promise.all(
    importImages.map(async (image) => {
      return await postControlImportServiceImageImportPart({ image, advancedSettings }).catch((error) => {
        const content = (() => {
          if (image.platform == null || image.link == null) {
            return String(error)
          }
          return `${
            platformKeyMap[image.platform].name +
            ' : ' +
            image.link +
            '\n' +
            String(error)
          }`
        })()
        logUtil.warning({
          title: '图片导入发生错误',
          content
        })
        // return null
        // 【250102】图片错误处理逻辑改变，之前是忽略错误图片，现在改为抛出错误
        throw error
      })
    })
  ))
  // .filter((i): i is ImageInferSelect => i != null)

  const {
    content,
    createdAt,
    platform,
    platformId,
    platformLink,
    platformParentId,
    isDeleted
  } = post

  let targetPost
  if (platform != null && platformId != null && platformLink != null) {
    // 包含platform与platformId，是从平台导入

    // 查询是否存在父贴（转发或导入记录中存在platformParentId）
    const parentPost = await (async () => {
      if (platformParentId == null) {
        return undefined
      }
      return await drizzleDb.query.posts.findFirst({
        where: drizzleOrm.or(
          drizzleOrm.exists(
            drizzleDb.select().from(drizzleSchema.postImports)
              .where(drizzleOrm.and(
                drizzleOrm.eq(drizzleSchema.postImports.postId, drizzleSchema.posts.id),
                drizzleOrm.eq(drizzleSchema.postImports.platform, platform),
                drizzleOrm.eq(drizzleSchema.postImports.platformPostId, platformParentId)
              ))
          ),
          drizzleOrm.exists(
            drizzleDb.select().from(drizzleSchema.postForwards)
              .where(drizzleOrm.and(
                drizzleOrm.eq(drizzleSchema.postForwards.postId, drizzleSchema.posts.id),
                drizzleOrm.eq(drizzleSchema.postForwards.platform, platform),
                drizzleOrm.eq(drizzleSchema.postForwards.platformPostId, platformParentId)
              ))
          )
        )
      })
    })()

    // 在 PostImport 中查询，是否已经被导入（转发或导入记录中存在platformId）
    targetPost = await drizzleDb.query.posts.findFirst({
      where: drizzleOrm.or(
        drizzleOrm.exists(
          drizzleDb.select().from(drizzleSchema.postImports)
            .where(drizzleOrm.and(
              drizzleOrm.eq(drizzleSchema.postImports.postId, drizzleSchema.posts.id),
              drizzleOrm.eq(drizzleSchema.postImports.platform, platform),
              drizzleOrm.eq(drizzleSchema.postImports.platformPostId, platformId)
            ))
        ),
        drizzleOrm.exists(
          drizzleDb.select().from(drizzleSchema.postForwards)
            .where(drizzleOrm.and(
              drizzleOrm.eq(drizzleSchema.postForwards.postId, drizzleSchema.posts.id),
              drizzleOrm.eq(drizzleSchema.postForwards.platform, platform),
              drizzleOrm.eq(drizzleSchema.postForwards.platformPostId, platformId)
            ))
        )
      )
    })
    if (targetPost == null) {
      // 帖子未被导入或转发，创建帖子
      targetPost = await postSendService({
        content,
        createdAt,
        isDeleted,
        images: targetImages.map(i => i.id),
        parentPostId: parentPost?.id
      })
    } else {
      // 帖子已被导入或转发，更新帖子
      targetPost = await postUpdateService({
        id: targetPost.id,
        content,
        createdAt,
        isDeleted,
        images: targetImages.map(i => i.id),
        parentPostId: parentPost?.id
      })
    }
    // 添加导入信息
    await drizzleDb.insert(drizzleSchema.postImports)
      .values({
        postId: targetPost.id,
        platform,
        platformPostId: platformId,
        link: platformLink,
        importedAt: new Date()
      })
  } else {
    // 不包含platform与platformId，是自定义导入
    targetPost = await postSendService({
      content, createdAt, isDeleted, images: targetImages.map(i => i.id)
    })
  }
  // 尝试关联转发记录
  await postControlImportServicePostImportPart_TryManualLinking({
    post,
    targetPost,
    advancedSettings
  })
  return targetPost
}

// 帖子导入服务：图片导入部分
const postControlImportServiceImageImportPart = async (data: {
  image: PostControlImportJsonType['importPosts'][number]['importImages'][number]
  advancedSettings: PostControlImportJsonType['advancedSettings']
}): Promise<ImageInferSelect> => {
  const { image, advancedSettings } = data
  const { platform, platformId, link, alt, createdAt } = image
  let targetImage
  if (platform != null && platformId != null) {
    // 包含platform与platformId，是从平台导入
    // 在 imageImport imageForwards 中查询，是否已经被导入或转发（转发或导入记录中存在platformId）
    targetImage = await drizzleDb.query.images.findFirst({
      where: drizzleOrm.or(
        drizzleOrm.exists(
          drizzleDb.select().from(drizzleSchema.imageImports)
            .where(drizzleOrm.and(
              drizzleOrm.eq(drizzleSchema.imageImports.imageId, drizzleSchema.images.id),
              drizzleOrm.eq(drizzleSchema.imageImports.platform, platform),
              drizzleOrm.eq(drizzleSchema.imageImports.platformImageId, platformId)
            ))
        ),
        drizzleOrm.exists(
          drizzleDb.select().from(drizzleSchema.imageForwards)
            .where(drizzleOrm.and(
              drizzleOrm.eq(drizzleSchema.imageForwards.imageId, drizzleSchema.images.id),
              drizzleOrm.eq(drizzleSchema.imageForwards.platform, platform),
              drizzleOrm.eq(drizzleSchema.imageForwards.platformImageId, platformId)
            ))
        )
      )
    })
    if (targetImage == null) {
      // 图片未被导入，处理图片
      targetImage = await imageSendByUrlService(link)
    }
    // 数据库更新Image
    targetImage = await imageUpdateService({ id: targetImage.id, alt, createdAt })
    // 创建导入记录
    await drizzleDb.insert(drizzleSchema.imageImports)
      .values({
        imageId: targetImage.id,
        platform,
        platformImageId: platformId,
        link,
        importedAt: new Date()
      })
  } else {
    // 不包含platform与platformId，是自定义导入，则不用记录导入信息
    targetImage = await imageSendByUrlService(link)
    targetImage = await imageUpdateService({ id: targetImage.id, alt, createdAt })
  }
  // 尝试关联转发记录
  await postControlImportServiceImageImportPart_TryManualLinking({
    image,
    targetImage,
    advancedSettings
  })
  return targetImage
}

const forwardSystem = useForwardSystem()

// 帖子导入服务：尝试关联帖子转发记录
// eslint-disable-next-line @typescript-eslint/naming-convention
const postControlImportServicePostImportPart_TryManualLinking = async (data: {
  post: PostControlImportJsonType['importPosts'][number]
  targetPost: PostInferSelect
  advancedSettings: PostControlImportJsonType['advancedSettings']
}) => {
  const {
    post,
    targetPost,
    advancedSettings
  } = data
  const {
    createdAt,
    platform,
    platformId,
    platformLink
  } = post

  // 如果高级配置未开启，返回
  if (advancedSettings?.forwardConfigId == null) {
    return null
  }
  const { forwardConfigId } = advancedSettings

  const findForwardSetting = forwardSystem.forwardSettingFind(forwardConfigId)
  // 如果转发配置不存在，返回
  if (findForwardSetting == null) {
    return null
  }
  // 如果关键信息缺失，直接返回
  if (platform == null || platformId == null || platformLink == null) {
    return null
  }
  // 和转发配置中的平台字段对比，必须一致
  if (platform !== findForwardSetting.platform) {
    return null
  }
  // 关联
  return await postControlForwardManualLinkingService({
    forwardConfigId: findForwardSetting.uuid,
    postId: targetPost.id,
    platformPostId: platformId,
    platformPostLink: platformLink,
    forwardAt: createdAt
  }).catch(() => null)
}

// 帖子导入服务：尝试关联图片转发记录
// eslint-disable-next-line @typescript-eslint/naming-convention
const postControlImportServiceImageImportPart_TryManualLinking = async (data: {
  image: PostControlImportJsonType['importPosts'][number]['importImages'][number]
  targetImage: ImageInferSelect
  advancedSettings: PostControlImportJsonType['advancedSettings']
}) => {
  const {
    image,
    targetImage,
    advancedSettings
  } = data
  const {
    platform,
    platformId,
    link
  } = image

  // 如果高级配置未开启，返回
  if (advancedSettings?.forwardConfigId == null) {
    return null
  }
  const { forwardConfigId } = advancedSettings

  const findForwardSetting = forwardSystem.forwardSettingFind(forwardConfigId)
  // 如果转发配置不存在，返回
  if (findForwardSetting == null) {
    return null
  }
  // 如果关键信息缺失，直接返回
  if (platform == null || platformId == null || link == null) {
    return null
  }
  // 和转发配置中的平台字段对比，必须一致
  if (platform !== findForwardSetting.platform) {
    return null
  }
  // 关联
  return await postControlForwardManualLinkingImageService({
    forwardConfigId: findForwardSetting.uuid,
    imageId: targetImage.id,
    platformImageId: platformId,
    platformImageLink: link
  }).catch(() => null)
}
