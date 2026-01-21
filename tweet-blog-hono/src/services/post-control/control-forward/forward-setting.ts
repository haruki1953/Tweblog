import { drizzleDb, drizzleOrm, drizzleSchema } from '@/db'
import { type PostControlForwardSettingSetJsonType } from '@/schemas'
import { useForwardSystem } from '@/systems'

const forwardSystem = useForwardSystem()

export const postControlForwardGetService = () => {
  const forwardStore = forwardSystem.forwardStore()
  return {
    forwardStore
  }
}

export const postControlForwardSettingSetService = (json: PostControlForwardSettingSetJsonType) => {
  const { forwardSettingList } = json
  forwardSystem.forwardSettingSet(forwardSettingList)
  return postControlForwardGetService()
}

// src\services\post-control\control-forward\forward-setting.ts
// 转发帖子统计
export const postControlForwardSettingPostCountService = async () => {
  // 帖子总数
  const totalPostCount = await drizzleDb.$count(
    drizzleSchema.posts,
    drizzleOrm.eq(drizzleSchema.posts.isDeleted, false)
  )
  // 遍历转发配置，统计转发的贴子数
  const { forwardSettingList } = forwardSystem.forwardStore()
  const forwardSettingPostList = await Promise.all(
    forwardSettingList.map(async (forwardSettingItem) => {
      const uuid = forwardSettingItem.uuid
      const count = await drizzleDb.$count(
        drizzleSchema.posts,
        drizzleOrm.and(
          drizzleOrm.eq(drizzleSchema.posts.isDeleted, false),
          drizzleOrm.exists(
            drizzleDb.select().from(drizzleSchema.postForwards)
              .where(drizzleOrm.and(
                drizzleOrm.eq(drizzleSchema.postForwards.postId, drizzleSchema.posts.id),
                drizzleOrm.eq(drizzleSchema.postForwards.forwardConfigId, uuid)
              ))
          )
        )
      )
      return {
        uuid,
        count
      }
    })
  )
  return {
    totalPostCount,
    forwardSettingPostList
  }
}
