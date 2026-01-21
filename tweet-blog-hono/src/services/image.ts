import { AppError } from '@/classes'
import { type ImageGetByCursorParamType, type ImageGetByCursorQueryType, type ImageUpdateConfigJsonType, type ImageUpdateJsonType } from '@/schemas'
import { useFetchSystem, useImageSystem } from '@/systems'
import { baseFindImageById, deleteImageByIdWhereNonePost } from './base'
import { postConfig } from '@/configs'
import { type ImageInferSelect } from '@/types'
import { dataDQWImageGetByCursorHandle, dataDQWImageGetByIdHandle, useLogUtil } from '@/utils'
import { drizzleDb, drizzleOrm, drizzleSchema } from '@/db'

const imageSystem = useImageSystem()
const fetchSystem = useFetchSystem()
const logUtil = useLogUtil()

// src\services\image.ts
// 图片添加接口
export const imageSendService = async (
  imageFile: File | Blob,
  imageInfo?: Omit<ImageUpdateJsonType, 'id'>
) => {
  // 处理图片
  const {
    path,
    originalPath,
    smallSize,
    largeSize,
    originalSize
  } = await imageSystem.processImage(imageFile).catch((error) => {
    logUtil.info({
      title: '图片添加失败 | 图片处理失败',
      content: String(error)
    })
    throw new AppError('图片处理失败')
  })

  const newDate = new Date()

  // 数据库添加图片
  const addedImages = await drizzleDb
    .insert(drizzleSchema.images)
    .values({
      path,
      originalPath,
      smallSize,
      largeSize,
      originalSize,
      alt: imageInfo?.alt,
      // 时间之类最好手动指定，因为默认值只以秒为精确度
      createdAt: imageInfo?.createdAt ?? newDate,
      addedAt: newDate,
      updatedAt: newDate
    })
    .returning()
    .catch((error) => {
      logUtil.info({
        title: '图片添加失败 | 数据库记录失败',
        content: String(error)
      })
      throw new AppError('数据库记录失败')
    })
  if (addedImages.length === 0) {
    throw new AppError('数据库记录失败')
  }
  return addedImages[0]
}

export const imageSendByUrlService = async (
  imageUrl: string
) => {
  const imageBlob = await fetchSystem.baseBlobApi(imageUrl) as Blob
  return await imageSendService(imageBlob)
}

// src\services\image.ts
// 更新
export const imageUpdateService = async (
  imageInfo: ImageUpdateJsonType
) => {
  // 查找图片
  const targetImage = await baseFindImageById(imageInfo.id)
  if (targetImage == null) {
    throw new AppError('图片不存在')
  }

  const newDate = new Date()

  // 修改信息
  const updatedImages = await drizzleDb.update(drizzleSchema.images)
    .set({
      alt: imageInfo.alt,
      createdAt: imageInfo.createdAt,
      updatedAt: newDate
    })
    .where(drizzleOrm.eq(drizzleSchema.images.id, targetImage.id))
    .returning()
    .catch((error) => {
      if (error.code === 'P2025') {
        throw new AppError('imageId不存在')
      }
      logUtil.info({
        title: '图片修改失败',
        content: `image id: ${imageInfo.id}\n` + String(error)
      })
      throw new AppError('图片修改失败')
    })
  if (updatedImages.length === 0) {
    throw new AppError('图片修改失败')
  }
  return updatedImages[0]
}

export const imageGetConfigService = () => {
  return imageSystem.getImageConfig()
}

export const imageUpdateConfigService = (
  configInfo: ImageUpdateConfigJsonType
) => {
  imageSystem.updateImageConfig(configInfo)
}

export const imageDeleteService = async (id: ImageInferSelect['id']) => {
  return await deleteImageByIdWhereNonePost(id)
}

// src\services\image.ts
// 查询关系
export const imageDeleteAllService = async () => {
  // // drizzle好像不支持直接查询“没有帖子的图片”，需要自己过滤
  // const images = (await drizzleDb.query.images.findMany({
  //   with: {
  //     postsToImages: true
  //   }
  // })).filter(i => i.postsToImages.length === 0)
  // 好像是可以的
  const images = await drizzleDb.query.images.findMany({
    where: drizzleOrm.notExists(
      drizzleDb.select().from(drizzleSchema.postsToImages)
        .where(drizzleOrm.eq(
          drizzleSchema.postsToImages.imageId,
          drizzleSchema.images.id
        ))
    ),
    columns: {
      id: true
    }
  })

  const imgDelPromises = images.map(async (img) => {
    return await deleteImageByIdWhereNonePost(img.id).catch(() => null)
  })

  return await Promise.all(imgDelPromises)
}

// src\services\image.ts
// 删除原图
export const imageDeleteOriginalService = async (id: ImageInferSelect['id']) => {
  // get info before update
  // 在更新前查询图片
  const image = await baseFindImageById(id)
  if (image == null) {
    throw new AppError('imageId不存在')
  }
  // first update database
  // 首先更新数据库
  const updatedImage = await drizzleDb.update(drizzleSchema.images)
    .set({
      originalSize: 0,
      originalPath: null
    })
    .where(drizzleOrm.eq(drizzleSchema.images.id, image.id))
    .returning()
    .catch((error) => {
      logUtil.info({
        title: '删除原图 | 图片修改失败',
        content: `image id: ${id}\n` + String(error)
      })
      throw new AppError('图片修改失败')
    })
  // delete file
  // 然后再在文件中删除
  imageSystem.deleteOriginalImage(image.originalPath)
  return updatedImage
}

// src\services\image.ts
// 删除全部原图
export const imageDeleteAllOriginalService = async () => {
  // update database
  // 更新数据库
  const imgOriginalDelList = await drizzleDb.update(drizzleSchema.images)
    .set({
      originalSize: 0,
      originalPath: null
    })
    .where(drizzleOrm.not(
      drizzleOrm.eq(drizzleSchema.images.originalSize, 0)
    ))
    .returning()
    .catch((error) => {
      logUtil.info({
        title: '删除全部原图 | 数据库更新失败',
        content: String(error)
      })
      throw new AppError('数据库更新失败')
    })
  // del file
  // 删除文件
  await imageSystem.deleteAllOriginalImage().catch((error) => {
    logUtil.info({
      title: '删除全部原图 | 图片删除失败',
      content: String(error)
    })
    throw new AppError('图片删除失败')
  })
  return imgOriginalDelList.length
}

// 数据库图片查询时，会with的数据，是在id与游标查询是复用的
export const dbQueryWithOnImage = {
  postsToImages: {
    with: {
      post: {
        with: {
          postsToImages: true,
          replies: {
            columns: {
              id: true
            }
          }
        }
      }
    }
  }
} as const

// src\services\image.ts
// 通过id查询图片
export const imageGetByIdService = async (id: ImageInferSelect['id']) => {
  const image = await drizzleDb.query.images.findFirst({
    where: drizzleOrm.eq(drizzleSchema.images.id, id),
    with: dbQueryWithOnImage
  })
  if (image == null) {
    throw new AppError('图片不存在', 400)
  }
  // 数据整理，处理查询数据以符合换为drizzle之前的数据
  return dataDQWImageGetByIdHandle(image)
}

// src\services\image.ts
// 图片游标分页同时关系查询
export const imageGetByCursorService = async (
  cursorId: ImageGetByCursorParamType['id'], query: ImageGetByCursorQueryType
) => {
  // 在正式查询之前，首先要查询游标对应的数据
  const cursorData = await (async () => {
    if (cursorId == null) {
      return undefined
    }
    const data = await baseFindImageById(cursorId)
    if (data == null) {
      throw new AppError('图片游标无效')
    }
    return data
  })()

  // 弃用通过 ImageGetByCursorQueryType 来筛选图片（250126弃用）

  // where使其从游标开始查询
  const ddWhere = (() => {
    if (cursorData == null) {
      return undefined
    }
    return drizzleOrm.or(
      // 查询createdAt比游标所指的小的，因为是createdAt降序排序
      drizzleOrm.lt(drizzleSchema.images.createdAt, cursorData.createdAt),
      // 需要考虑到createdAt相同的情况，所以需要借助id来确认createdAt相同时的顺序
      // 借助id升序降序随便，但要与orderBy相同
      drizzleOrm.and(
        drizzleOrm.eq(drizzleSchema.images.createdAt, cursorData.createdAt),
        drizzleOrm.gt(drizzleSchema.images.id, cursorData.id)
      )
    )
  })()

  // orderBy
  const ddOrderBy = [
    drizzleOrm.desc(drizzleSchema.images.createdAt),
    drizzleOrm.asc(drizzleSchema.images.id)
  ]

  // Limit 分页个数
  const ddLimit = postConfig.imageNumInPage

  const images = await drizzleDb.query.images.findMany({
    where: ddWhere,
    orderBy: ddOrderBy,
    limit: ddLimit,
    with: dbQueryWithOnImage
  })

  return dataDQWImageGetByCursorHandle(images)
}
