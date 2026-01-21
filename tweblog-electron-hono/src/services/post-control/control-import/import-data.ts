import { AppError } from '@/classes'
import { drizzleDb, drizzleOrm, drizzleSchema } from '@/db'
import { useLogUtil } from '@/utils'

const logUtil = useLogUtil()

// src\services\post-control\control-import\import-data.ts
// 删除导入记录
export const postControlDeleteImportDataService = async (id: string) => {
  const deletedPostImports = await drizzleDb.delete(drizzleSchema.postImports)
    .where(drizzleOrm.eq(
      drizzleSchema.postImports.id, id
    ))
    .returning()
    .catch((error) => {
      logUtil.info({
        title: '导入记录删除失败',
        content: `postImport id: ${id}\n${String(error)}`
      })
      throw new AppError('导入记录删除失败')
    })
  if (deletedPostImports.length === 0) {
    throw new AppError('导入记录删除失败')
  }
  return deletedPostImports[0]
}

interface QueriedPostImport {
  id: string
  postId: string
  platformPostId: string
  importedAt: Date
}
const getMaxPostImportedAtIds = (data: QueriedPostImport[]): string[] => {
  // 按 postId 和 platformPostId 分组
  const grouped: Record<string, QueriedPostImport[]> = {}
  for (const item of data) {
    const key = `${item.postId}-${item.platformPostId}`
    if (grouped[key] == null) {
      grouped[key] = []
    }
    grouped[key].push(item)
  }
  // 在每个分组中找到 importedAt 最大的对象
  const maxImportedAtIds: string[] = []
  for (const key in grouped) {
    if (Object.prototype.hasOwnProperty.call(grouped, key)) {
      let maxItem = grouped[key][0]
      for (const item of grouped[key]) {
        if (item.importedAt > maxItem.importedAt) {
          maxItem = item
        }
      }
      maxImportedAtIds.push(maxItem.id)
    }
  }
  return maxImportedAtIds
}

interface QueriedImageImport {
  id: string
  imageId: string
  platformImageId: string
  importedAt: Date
}
const getMaxImageImportedAtIds = (data: QueriedImageImport[]): string[] => {
  // 按 imageId 和 platformImageId 分组
  const grouped: Record<string, QueriedImageImport[]> = {}
  for (const item of data) {
    const key = `${item.imageId}-${item.platformImageId}`
    if (grouped[key] == null) {
      grouped[key] = []
    }
    grouped[key].push(item)
  }
  // 在每个分组中找到 importedAt 最大的对象
  const maxImportedAtIds: string[] = []
  for (const key in grouped) {
    if (Object.prototype.hasOwnProperty.call(grouped, key)) {
      let maxItem = grouped[key][0]
      for (const item of grouped[key]) {
        if (item.importedAt > maxItem.importedAt) {
          maxItem = item
        }
      }
      maxImportedAtIds.push(maxItem.id)
    }
  }
  return maxImportedAtIds
}

// 多余的导入记录删除
export const postControlDeleteImportExcessService = async () => {
  try {
    // 帖子和图片，找到全部非多余的导入记录
    const queriedPostImports = await drizzleDb.query.postImports.findMany({
      columns: {
        id: true,
        postId: true,
        platformPostId: true,
        importedAt: true
      }
    })
    const maxPostImportedAtIds = getMaxPostImportedAtIds(queriedPostImports)

    const queriedImageImports = await drizzleDb.query.imageImports.findMany({
      columns: {
        id: true,
        imageId: true,
        platformImageId: true,
        importedAt: true
      }
    })
    const maxImageImportedAtIds = getMaxImageImportedAtIds(queriedImageImports)

    // 帖子和图片，删除多余的导入记录，事务
    const deletedInfo = drizzleDb.transaction((drizzleTx) => {
      const deletedPostImports = drizzleTx.delete(drizzleSchema.postImports)
        .where(drizzleOrm.notInArray(
          drizzleSchema.postImports.id, maxPostImportedAtIds
        ))
        .returning({ id: drizzleSchema.postImports.id })
        .all()
      const deletedImageImports = drizzleTx.delete(drizzleSchema.imageImports)
        .where(drizzleOrm.notInArray(
          drizzleSchema.imageImports.id, maxImageImportedAtIds
        ))
        .returning({ id: drizzleSchema.imageImports.id })
        .all()
      return {
        deletedPostImports,
        deletedImageImports
      }
    })

    return {
      postImport: {
        count: deletedInfo.deletedPostImports.length
      },
      imageImport: {
        count: deletedInfo.deletedImageImports.length
      }
    }
  } catch (error) {
    logUtil.info({
      title: '多余的导入记录删除失败',
      content: String(error)
    })
    throw error
  }
}

// 删除所有帖子导入记录
export const postControlDeleteImportAllPostService = async () => {
  // eslint-disable-next-line drizzle/enforce-delete-with-where
  const deletedPostImports = await drizzleDb.delete(drizzleSchema.postImports)
    .returning({ id: drizzleSchema.postImports.id })
  return {
    postImport: {
      count: deletedPostImports.length
    },
    imageImport: {
      count: 0
    }
  }
}

// 删除所有图片导入记录
export const postControlDeleteImportAllImageService = async () => {
  // eslint-disable-next-line drizzle/enforce-delete-with-where
  const deleteImageImports = await drizzleDb.delete(drizzleSchema.imageImports)
    .returning({ id: drizzleSchema.imageImports.id })
  return {
    postImport: {
      count: 0
    },
    imageImport: {
      count: deleteImageImports.length
    }
  }
}
