import { AppError } from '@/classes'
import { drizzleDb, drizzleOrm, drizzleSchema } from '@/db'
import { useImageSystem } from '@/systems'
import { type PostInferSelect, type ImageInferSelect } from '@/types'

export const baseFindPostById = async (id: PostInferSelect['id']) => {
  return await drizzleDb.query.posts.findFirst({
    where: drizzleOrm.eq(drizzleSchema.posts.id, id)
  })
}

const imageSystem = useImageSystem()

export const baseFindImageById = async (id: ImageInferSelect['id']) => {
  return await drizzleDb.query.images.findFirst({
    where: drizzleOrm.eq(drizzleSchema.images.id, id)
  })
}

export const baseFindImageByIdWithToPosts = async (id: ImageInferSelect['id']) => {
  return await drizzleDb.query.images.findFirst({
    where: drizzleOrm.eq(drizzleSchema.images.id, id),
    with: {
      postsToImages: true
    }
  })
}

// src\services\base.ts
// 尝试删除图片
export const deleteImageByIdWhereNonePost = async (id: ImageInferSelect['id']) => {
  // 查找图片
  const img = await baseFindImageByIdWithToPosts(id)
  if (img == null) {
    throw new AppError('图片不存在', 400)
  }

  // 确认其未被使用
  if (img.postsToImages.length !== 0) {
    throw new AppError('图片使用中', 400)
  }

  // 在表中删除
  await drizzleDb.delete(drizzleSchema.images)
    .where(drizzleOrm.eq(drizzleSchema.images.id, img.id))

  // 在文件中删除
  imageSystem.deleteImage(img.path, img.originalPath)
  return img
}
