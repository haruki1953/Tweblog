import { type PromiseReturnType } from './dependencies'
// 在类型声明文件（.d.ts）中导入的内容不会被编译
import { drizzleDb } from '@/db'
import { dbQueryWithOnImage, dbQueryWithOnPost } from '@/services'

// 帖子数据库查询的基本类型
export type DQWPostData = NonNullable<PromiseReturnType<typeof fnDQWPostData>>
// 帖子id查询的基本类型
export type DQWPostGetById = NonNullable<PromiseReturnType<typeof fnDQWPostGetById>>
export type DQWPostGetByCursor = PromiseReturnType<typeof fnDQWPostGetByCursor>

// 图片数据库查询的基本类型
export type DQWImageData = NonNullable<PromiseReturnType<typeof fnDQWImageData>>

// src\types\data\db-query-with.d.ts
// 为了推断类型而使用的临时函数
const fnDQWPostData = async () => {
  return await drizzleDb.query.posts.findFirst({
    with: dbQueryWithOnPost
  })
}
// 帖子id查询的类型
const fnDQWPostGetById = async () => {
  // postGetByIdService
  return await drizzleDb.query.posts.findFirst({
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
  })
}
// 帖子分页查询的类型
const fnDQWPostGetByCursor = async () => {
  return await drizzleDb.query.posts.findMany({
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
  })
}

const fnDQWImageData = async () => {
  return await drizzleDb.query.images.findFirst({
    with: dbQueryWithOnImage
  })
}
