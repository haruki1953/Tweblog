import { AppError } from '@/classes'
import { drizzleDb, drizzleOrm, drizzleSchema } from '@/db'
import { type PostControlForwardManualLinkingImageJsonType, type PostControlForwardManualLinkingJsonType } from '@/schemas'
import { useForwardSystem } from '@/systems'

import { useLogUtil } from '@/utils'

const forwardSystem = useForwardSystem()

const logUtil = useLogUtil()

// src\services\post-control\control-forward\forward-data.ts
// 删除转发记录
export const postControlDeleteForwardDataService = async (id: string) => {
  const dataList = await drizzleDb.delete(drizzleSchema.postForwards)
    .where(drizzleOrm.eq(drizzleSchema.postForwards.id, id))
    .returning()
    .catch((error) => {
      logUtil.info({
        title: '转发记录删除失败',
        content: `postForward id: ${id}\n${String(error)}`
      })
      throw new AppError('转发记录删除失败')
    })
  if (dataList.length === 0) {
    throw new AppError('转发记录不存在', 400)
  }
  return dataList[0]
}

// src\services\post-control\control-forward\forward-data.ts
// 关联帖子
export const postControlForwardManualLinkingService = async (
  json: PostControlForwardManualLinkingJsonType
) => {
  const {
    postId,
    forwardConfigId,
    platformPostId,
    platformPostLink,
    forwardAt
  } = json

  const findForwardSetting = forwardSystem.forwardSettingFind(forwardConfigId)
  if (findForwardSetting == null) {
    throw new AppError('转发配置不存在', 400)
  }

  // 如果平台中的帖子id已存在，则无需再关联
  let postForward = await drizzleDb.query.postForwards.findFirst({
    where: drizzleOrm.and(
      drizzleOrm.eq(drizzleSchema.postForwards.postId, postId),
      drizzleOrm.eq(drizzleSchema.postForwards.forwardConfigId, forwardConfigId),
      drizzleOrm.eq(drizzleSchema.postForwards.platformPostId, platformPostId)
    )
  })
  // 存在则更新，否则创建
  if (postForward != null) {
    const updatedPostForwards = await drizzleDb.update(drizzleSchema.postForwards)
      .set({
        link: platformPostLink,
        forwardAt,
        platform: findForwardSetting.platform
      })
      .where(drizzleOrm.eq(
        drizzleSchema.postForwards.id, postForward.id
      ))
      .returning()
      .catch((error) => {
        logUtil.info({
          title: '转发记录更新失败',
          content: `postId: ${
            postId
          }\nforwardConfigId: ${
            forwardConfigId
          }\n${String(error)}`
        })
        throw new AppError('转发记录更新失败')
      })
    if (updatedPostForwards.length === 0) {
      throw new AppError('转发记录更新失败')
    }
    postForward = updatedPostForwards[0]
  } else {
    const insertedPostForwards = await drizzleDb.insert(drizzleSchema.postForwards)
      .values({
        postId,
        forwardConfigId,
        platformPostId,
        link: platformPostLink,
        forwardAt: forwardAt ?? new Date(),
        platform: findForwardSetting.platform
      })
      .returning()
      .catch((error) => {
        logUtil.info({
          title: '转发记录创建失败',
          content: `postId: ${
            postId
          }\nforwardConfigId: ${
            forwardConfigId
          }\n${String(error)}`
        })
        throw new AppError('转发记录创建失败')
      })
    if (insertedPostForwards.length === 0) {
      throw new AppError('转发记录创建失败')
    }
    postForward = insertedPostForwards[0]
  }

  return postForward
}

// 关联图片
export const postControlForwardManualLinkingImageService = async (
  json: PostControlForwardManualLinkingImageJsonType
) => {
  const {
    imageId,
    forwardConfigId,
    platformImageId,
    platformImageLink,
    forwardAt
  } = json

  const findForwardSetting = forwardSystem.forwardSettingFind(forwardConfigId)
  if (findForwardSetting == null) {
    throw new AppError('转发配置不存在', 400)
  }

  // 如果平台中的图片id已存在，则无需再关联
  let imageForward = await drizzleDb.query.imageForwards.findFirst({
    where: drizzleOrm.and(
      drizzleOrm.eq(drizzleSchema.imageForwards.imageId, imageId),
      drizzleOrm.eq(drizzleSchema.imageForwards.forwardConfigId, forwardConfigId),
      drizzleOrm.eq(drizzleSchema.imageForwards.platformImageId, platformImageId)
    )
  })
  if (imageForward != null) {
    const updatedImageForwards = await drizzleDb.update(drizzleSchema.imageForwards)
      .set({
        link: platformImageLink,
        forwardAt,
        platform: findForwardSetting.platform
      })
      .where(drizzleOrm.eq(
        drizzleSchema.imageForwards.id, imageForward.id
      ))
      .returning()
    if (updatedImageForwards.length === 0) {
      throw new AppError('转发记录更新失败')
    }
    imageForward = updatedImageForwards[0]
  } else {
    const insertedImageForwards = await drizzleDb.insert(drizzleSchema.imageForwards)
      .values({
        imageId,
        forwardConfigId,
        platformImageId,
        link: platformImageLink,
        forwardAt: forwardAt ?? new Date(),
        platform: findForwardSetting.platform
      })
      .returning()
      .catch((error) => {
        logUtil.info({
          title: '转发记录创建失败',
          content: `imageId: ${
          imageId
        }\nforwardConfigId: ${
          forwardConfigId
        }\n${String(error)}`
        })
        throw new AppError('转发记录创建失败')
      })
    if (insertedImageForwards.length === 0) {
      throw new AppError('转发记录创建失败')
    }
    imageForward = insertedImageForwards[0]
  }

  return imageForward
}

// 删除无对应转发配置的记录
export const postControlDeleteForwardNotSettingService = async () => {
  // 获取现在的转发记录
  const forwardSettingIdList = forwardSystem.forwardSettingGet().map(i => i.uuid)

  // 删除 forwardConfigId 不在 forwardSettingIdList 中的转发记录
  const deletedPostForwards = await drizzleDb.delete(drizzleSchema.postForwards)
    .where(drizzleOrm.notInArray(
      drizzleSchema.postForwards.forwardConfigId,
      forwardSettingIdList
    ))
    .returning({
      id: drizzleSchema.postForwards.id
    })
  const deletedImageForwards = await drizzleDb.delete(drizzleSchema.imageForwards)
    .where(drizzleOrm.notInArray(
      drizzleSchema.imageForwards.forwardConfigId,
      forwardSettingIdList
    ))
    .returning({
      id: drizzleSchema.imageForwards.id
    })
  return {
    postForward: {
      count: deletedPostForwards.length
    },
    imageForward: {
      count: deletedImageForwards.length
    }
  }
}

// 全部推文转发记录删除
export const postControlDeleteForwardAllPostService = async () => {
  // eslint-disable-next-line drizzle/enforce-delete-with-where
  const deletedPostForwards = await drizzleDb.delete(drizzleSchema.postForwards)
    .returning({
      id: drizzleSchema.postForwards.id
    })
  return {
    postForward: {
      count: deletedPostForwards.length
    },
    imageForward: {
      count: 0
    }
  }
}

// 全部图片转发记录删除
export const postControlDeleteForwardAllImageService = async () => {
  // eslint-disable-next-line drizzle/enforce-delete-with-where
  const deletedImageForwards = await drizzleDb.delete(drizzleSchema.imageForwards)
    .returning({
      id: drizzleSchema.imageForwards.id
    })
  return {
    postForward: {
      count: 0
    },
    imageForward: {
      count: deletedImageForwards.length
    }
  }
}
