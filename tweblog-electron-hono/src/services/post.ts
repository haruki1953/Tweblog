import { AppError } from '@/classes'
import {
  type PostUpdateJsonType,
  type PostSendJsonType,
  type PostGetByCursorQueryType,
  type PostGetByIdQueryType,
  type PostDeleteAllQueryType,
  type PostDeleteQueryType,
  type PostGetByCursorParamType
} from '@/schemas'
import { baseFindImageById, baseFindPostById, deleteImageByIdWhereNonePost } from './base'
import { postConfig } from '@/configs'
import { type PostInferSelect } from '@/types'

import { dataDQWPostBaseHandle, dataDQWPostGetByCursorHandle, dataDQWPostGetByIdHandle, dataDQWPostSendHandle, parseLikeInput, useLogUtil } from '@/utils'
import { drizzleDb, drizzleOrm, drizzleSchema } from '@/db'

const logUtil = useLogUtil()

export const dbQueryWithOnPost = {
  postsToImages: {
    with: {
      image: true
    }
  },
  replies: {
    where: drizzleOrm.eq(drizzleSchema.posts.isDeleted, false),
    columns: {
      id: true
    }
  }
} as const

// src\services\post.ts
// 帖子创建
export const postSendService = async (postInfo: PostSendJsonType) => {
  // 确认图片存在
  if (postInfo.images != null) {
    await Promise.all(postInfo.images.map(async (imgId) => {
      const imgData = await baseFindImageById(imgId)
      if (imgData == null) {
        throw new AppError('图片不存在', 400)
      }
    }))
  }
  // 确认父帖存在
  if (postInfo.parentPostId != null) {
    const postData = await baseFindPostById(postInfo.parentPostId)
    if (postData == null) {
      throw new AppError('父帖不存在', 400)
    }
  }

  const newDate = new Date()

  // 事务
  let addedPost
  try {
    addedPost = drizzleDb.transaction((drizzleTx) => {
      // 添加帖子
      const insertedPosts = drizzleTx.insert(drizzleSchema.posts)
        .values({
          // 时间之类最好手动指定，因为默认值只以秒为精确度
          createdAt: postInfo.createdAt ?? newDate,
          addedAt: newDate,
          updatedAt: newDate,
          content: postInfo.content ?? '',
          imagesOrder: (() => {
            if (postInfo.images == null) {
              return undefined
            }
            return JSON.stringify(postInfo.images)
          })(),
          parentPostId: postInfo.parentPostId,
          isDeleted: postInfo.isDeleted
        })
        .returning()
        .all()

      if (insertedPosts.length === 0) {
        throw new AppError('帖子添加失败', 500)
      }
      const addedPost = insertedPosts[0]

      // 关联图片
      ;(() => {
        if (postInfo.images == null) {
          return
        }
        if (postInfo.images.length === 0) {
          return
        }
        drizzleTx.insert(drizzleSchema.postsToImages)
          .values((() => {
            return postInfo.images.map((imageId) => {
              return {
                postId: addedPost.id,
                imageId
              }
            })
          })())
          .run()
      })()

      return addedPost
    })
  } catch (error) {
    logUtil.info({
      title: '推文添加失败',
      content: String(error)
    })
    throw new AppError('推文添加失败')
  }

  // 最后再次查询帖子数据
  const post = await drizzleDb.query.posts.findFirst({
    where: drizzleOrm.eq(drizzleSchema.posts.id, addedPost.id),
    with: dbQueryWithOnPost
  })
  if (post == null) {
    throw new AppError('帖子添加失败', 500)
  }

  return dataDQWPostSendHandle(post)
}

// src\services\post.ts
// 帖子更新
export const postUpdateService = async (postInfo: PostUpdateJsonType) => {
  // 父帖不能为当前推文
  if (postInfo.id === postInfo.parentPostId) {
    throw new AppError('父帖不能为当前推文', 400)
  }
  // 确认帖子存在
  const targetPost = baseFindPostById(postInfo.id)
  if (targetPost == null) {
    throw new AppError('帖子不存在', 400)
  }
  // 确认图片存在
  if (postInfo.images != null) {
    await Promise.all(postInfo.images.map(async (imgId) => {
      const imgData = await baseFindImageById(imgId)
      if (imgData == null) {
        throw new AppError('图片不存在', 400)
      }
    }))
  }
  // 确认父帖存在
  if (postInfo.parentPostId != null) {
    const postData = await baseFindPostById(postInfo.parentPostId)
    if (postData == null) {
      throw new AppError('父帖不存在', 400)
    }
  }

  const newDate = new Date()

  // 事务
  try {
    drizzleDb.transaction((drizzleTx) => {
      // 更新数据
      drizzleTx.update(drizzleSchema.posts)
        .set({
          // 时间之类最好手动指定，因为默认值只以秒为精确度
          createdAt: postInfo.createdAt,
          updatedAt: newDate,
          content: postInfo.content,
          imagesOrder: (() => {
            if (postInfo.images == null) {
              return undefined
            }
            return JSON.stringify(postInfo.images)
          })(),
          parentPostId: postInfo.parentPostId,
          isDeleted: postInfo.isDeleted
        })
        .where(drizzleOrm.eq(drizzleSchema.posts.id, postInfo.id))
        .run()

      // 更新图片
      ;(() => {
        if (postInfo.images == null) {
          return
        }
        // 首先清空本帖子与图片的关联
        drizzleTx.delete(drizzleSchema.postsToImages)
          .where(drizzleOrm.eq(drizzleSchema.postsToImages.postId, postInfo.id))
          .run()
        // 然后进行关联
        if (postInfo.images.length === 0) {
          return
        }
        drizzleTx.insert(drizzleSchema.postsToImages)
          .values((() => {
            return postInfo.images.map((imageId) => {
              return {
                postId: postInfo.id,
                imageId
              }
            })
          })())
          .run()
      })()
    })
  } catch (error) {
    logUtil.info({
      title: '推文修改失败',
      content: String(error)
    })
    throw new AppError('推文修改失败')
  }

  // 最后再次查询帖子数据
  const post = await drizzleDb.query.posts.findFirst({
    where: drizzleOrm.eq(drizzleSchema.posts.id, postInfo.id),
    with: dbQueryWithOnPost
  })
  if (post == null) {
    throw new AppError('帖子更新失败', 500)
  }
  return post
}

// src\services\post.ts
// 帖子删除
export const postDeleteService = async (id: PostInferSelect['id'], query: PostDeleteQueryType) => {
  // 查找帖子并包含需要的数据
  const targetPost = await drizzleDb.query.posts.findFirst({
    where: drizzleOrm.eq(drizzleSchema.posts.id, id),
    with: dbQueryWithOnPost
  })
  if (targetPost == null) {
    throw new AppError('帖子不存在', 400)
  }
  const post = dataDQWPostBaseHandle(targetPost)

  // 事务
  try {
    drizzleDb.transaction((drizzleTx) => {
      // 解除回复关联
      if (post._count.replies > 0) {
        drizzleTx.update(drizzleSchema.posts)
          .set({
            parentPostId: null
          })
          .where(drizzleOrm.eq(drizzleSchema.posts.parentPostId, id))
          .run()
      }
      // 解除图片关联
      drizzleTx.delete(drizzleSchema.postsToImages)
        .where(drizzleOrm.eq(drizzleSchema.postsToImages.postId, id))
        .run()
      // 删除帖子
      drizzleTx.delete(drizzleSchema.posts)
        .where(drizzleOrm.eq(drizzleSchema.posts.id, id))
        .run()
    })
  } catch (error) {
    logUtil.info({
      title: '推文删除失败',
      content: String(error)
    })
    throw new AppError('推文删除失败')
  }

  // 尝试删除图片
  const deletedImages = await (async () => {
    if (query.delateImage == null || query.delateImage === 'false') {
      return []
    }
    // else (query.delateImage === 'true')
    return await Promise.all(
      post.images.map(async (img) => {
        return await deleteImageByIdWhereNonePost(
          img.id
        ).catch(() => null)
      })
    )
  })()

  return {
    deletedPost: post,
    deletedImages
  }
}

export const postDeleteAllService = async (query: PostDeleteAllQueryType) => {
  // 找到
  const posts = await drizzleDb.query.posts.findMany({
    where: drizzleOrm.eq(drizzleSchema.posts.isDeleted, true),
    columns: { id: true }
  })

  // del one by one, to avert unexpected error
  const results = []
  for (const p of posts) {
    const result = await postDeleteService(p.id, query).catch(() => null)
    if (result == null) {
      continue
    }
    results.push(result)
  }
  return results
}

// src\services\post.ts
// 帖子id查询
export const postGetByIdService = async (
  id: PostInferSelect['id'], query?: PostGetByIdQueryType
) => {
  // 是否也查询被删除的
  const isKeepIsDetele = (() => {
    if (
      query?.keepIsDetele == null ||
        query.keepIsDetele === 'false'
    ) {
      return false
    }
    return true
  })()
  const ddWhereDel = (() => {
    if (isKeepIsDetele) {
      return undefined
    }
    return drizzleOrm.eq(drizzleSchema.posts.isDeleted, false)
  })()
  const ddWhereId = drizzleOrm.eq(drizzleSchema.posts.id, id)

  let post = await drizzleDb.query.posts.findFirst({
    where: drizzleOrm.and(ddWhereId, ddWhereDel),
    with: {
      ...dbQueryWithOnPost,
      postImports: true,
      postForwards: true,
      parentPost: {
        // 好像对一的关系无法where，后面自己判断吧
        with: {
          ...dbQueryWithOnPost,
          postImports: true,
          postForwards: true
        }
      },
      // 回复，回复的回复
      replies: {
        where: ddWhereDel,
        with: {
          ...dbQueryWithOnPost,
          replies: {
            where: ddWhereDel,
            with: {
              ...dbQueryWithOnPost
            }
          }
        }
      }
    }
  }).catch((error) => {
    logUtil.info({
      title: '推文获取失败',
      content: String(error)
    })
    throw new AppError('推文获取失败')
  })
  if (post == null) {
    throw new AppError('推文不存在', 400)
  }

  post = {
    ...post,
    // 根据条件控制是否获取parentPost
    parentPost: (() => {
      // isKeepIsDetele 意为是否也获取已删除的
      if (isKeepIsDetele) {
        return post.parentPost
      }
      if (post.parentPost == null) {
        return post.parentPost
      }
      // 排除isDeleted
      if (post.parentPost.isDeleted) {
        return null
      }
      return post.parentPost
    })()
  }

  return dataDQWPostGetByIdHandle(post)
}

// src\services\post.ts
// 帖子分页查询
export const postGetByCursorService = async (
  cursorId: PostGetByCursorParamType['id'], query: PostGetByCursorQueryType
) => {
  // 在正式查询之前，首先要查询游标对应的数据
  const cursorData = await (async () => {
    if (cursorId == null) {
      return undefined
    }
    const data = await baseFindPostById(cursorId)
    if (data == null) {
      throw new AppError('推文游标无效')
    }
    return data
  })()

  // 游标条件
  const ddWhereCursor = (() => {
    if (cursorData == null) {
      return undefined
    }
    return drizzleOrm.or(
      // 查询createdAt比游标所指的小的，因为是createdAt降序排序
      drizzleOrm.lt(drizzleSchema.posts.createdAt, cursorData.createdAt),
      // 需要考虑到createdAt相同的情况，所以需要借助id来确认createdAt相同时的顺序
      // 借助id升序降序随便，但要与orderBy相同
      drizzleOrm.and(
        drizzleOrm.eq(drizzleSchema.posts.createdAt, cursorData.createdAt),
        drizzleOrm.gt(drizzleSchema.posts.id, cursorData.id)
      )
    )
  })()

  // orderBy
  const ddOrderBy = [
    drizzleOrm.desc(drizzleSchema.posts.createdAt),
    drizzleOrm.asc(drizzleSchema.posts.id)
  ]
  // Limit 分页个数
  const ddLimit = postConfig.postNumInPage

  // 查询条件，内容搜索
  const ddWhereContent = (() => {
    if (query.content == null) {
      return undefined
    }
    return drizzleOrm.or(
      // 和content对比
      drizzleOrm.like(
        drizzleSchema.posts.content,
        parseLikeInput(query.content).value
      ),
      // 还要和图片的alt对比
      // exists postsToImages
      drizzleOrm.exists(
        drizzleDb.select().from(drizzleSchema.postsToImages).where(
          drizzleOrm.and(
            drizzleOrm.eq(drizzleSchema.postsToImages.postId, drizzleSchema.posts.id),
            // exists images
            drizzleOrm.exists(
              drizzleDb.select().from(drizzleSchema.images).where(
                drizzleOrm.and(
                  drizzleOrm.eq(drizzleSchema.images.id, drizzleSchema.postsToImages.imageId),
                  // like images.alt
                  drizzleOrm.like(
                    drizzleSchema.images.alt,
                    parseLikeInput(query.content).value
                  )
                )
              )
            )
          )
        )
      )
    )
  })()

  const isDeleted = (() => {
    if (
      query.isDelete === 'false' ||
      query.isDelete === undefined
    ) {
      return false
    } else if (query.isDelete === 'true') {
      return true
    } else { // 'all'
      return undefined
    }
  })()
  // 查询条件，是否删除
  const ddWhereDel = (() => {
    if (isDeleted == null) {
      return undefined
    }
    return drizzleOrm.eq(drizzleSchema.posts.isDeleted, isDeleted)
  })()

  // 总查询条件
  const ddWhere = drizzleOrm.and(
    ddWhereCursor,
    ddWhereContent,
    ddWhereDel
  )

  // 数据库查询
  let posts = await drizzleDb.query.posts.findMany({
    where: ddWhere,
    orderBy: ddOrderBy,
    limit: ddLimit,
    with: {
      ...dbQueryWithOnPost,
      parentPost: {
        with: {
          ...dbQueryWithOnPost
        }
      }
    }
  }).catch((error) => {
    logUtil.info({
      title: '推文获取失败',
      content: String(error)
    })
    throw new AppError('推文获取失败')
  })
  // 查询后的处理
  posts = posts.map((post) => {
    return {
      ...post,
      // 根据条件控制是否获取parentPost
      parentPost: (() => {
        if (isDeleted == null) {
          // isDeleted为undefined即为不筛选
          return post.parentPost
        }
        if (post.parentPost == null) {
          return post.parentPost
        }
        // 获取对应isDeleted的
        if (post.parentPost.isDeleted === isDeleted) {
          return post.parentPost
        }
        // 否则返回null
        return null
      })()
    }
  })
  return dataDQWPostGetByCursorHandle(posts)
}
