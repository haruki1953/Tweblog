/* eslint-disable @typescript-eslint/naming-convention */
import { type PostControlForwardAutoJsonType } from '@/schemas'
import { useForwardSystem, useTaskSystem } from '@/systems'
import { delayWithInterrupt, useLogUtil } from '@/utils'
import { postControlForwardPostService } from './forward-post'
import { forwardingConfig } from '@/configs'
import { drizzleDb, drizzleOrm, drizzleSchema } from '@/db'

const taskSystem = useTaskSystem()
const logUtil = useLogUtil()
const forwardSystem = useForwardSystem()

// 自动转发服务
export const postControlForwardAutoService = async (json: PostControlForwardAutoJsonType) => {
  const {
    forwardConfigId,
    forwardingOrder,
    forwardingNumber,
    forwardingIntervalSeconds
  } = json
  // 获取要转发的帖子id列表
  const forwardingPostIdList = await postControlForwardAutoService_GetForwardingPostIdList(json)

  // 创建任务，用于保存导入进度
  const taskForward = taskSystem.taskForwardCreate({
    totalCount: forwardingPostIdList.length,
    forwardConfigId,
    forwardingOrder,
    forwardingNumber,
    forwardingIntervalSeconds,
    lastForwardedPostId: null
  })

  // 任务状态判断与处理函数
  const forwardingCheckInterruptCondition = () => {
    // 检查转发配置是否还存在
    const findForwardSetting = forwardSystem.forwardSettingFind(forwardConfigId)
    if (findForwardSetting == null) {
      // 转发配置不存在，中止本任务
      taskSystem.taskAbort(taskForward.uuid)
    }
    // 返回任务是否应中止，也就是任务是否不在运行
    return !taskSystem.taskIsRunning(taskForward.uuid)
  }

  // 异步处理
  ;(async () => {
    logUtil.info({
      content: `${forwardingPostIdList.length} 条推文开始转发，任务 uuid: ${taskForward.uuid}`
    })
    // 已完成计数
    let completedCount = 0
    // 遍历，转发，控制任务
    for (const postId of forwardingPostIdList) {
      // 任务状态判断与处理
      if (forwardingCheckInterruptCondition()) {
        // 如果任务非运行状态，则导入中止
        logUtil.info({
          content: `${forwardingPostIdList.length} 条推文转发中止，任务 uuid: ${taskForward.uuid}`
        })
        return
      }
      // // 先打印来测试
      // console.log(postId)
      // 调用转发服务
      await postControlForwardPostService({
        postId,
        forwardConfigId
      }).catch(() => {})

      completedCount += 1
      // 更新任务信息
      taskSystem.taskForwardUpdate(taskForward.uuid, {
        completedCount,
        lastForwardedPostId: postId
      })
      // 延迟指定间隔，并有持续的中断判断
      // 这里if一下是为了在最后一个时不用再延时
      if (completedCount < forwardingPostIdList.length) {
        await delayWithInterrupt({
          // 延迟持续时间
          durationMs: forwardingIntervalSeconds * 1000, // 从秒转为毫秒
          // 中断判断间隔时间
          interruptCheckInterval: forwardingConfig.interruptCheckInterval,
          // 中断判断函数
          interruptCondition: forwardingCheckInterruptCondition
        })
      }
    }
    logUtil.success({
      content: `${forwardingPostIdList.length} 条推文完成转发，任务 uuid: ${taskForward.uuid}`
    })
    // 任务完成
    taskSystem.taskComplete(taskForward.uuid)
  })().catch(() => {})

  // 返回刚添加的任务和全部任务信息
  return {
    taskForward,
    taskStore: taskSystem.taskStore()
  }
}

// 获取要转发的帖子id列表
const postControlForwardAutoService_GetForwardingPostIdList = async (data: PostControlForwardAutoJsonType) => {
  const {
    forwardingOrder
  } = data
  if (forwardingOrder === 'old-to-new') {
    // 从旧到新，选择未转发的
    return await p_GetForwardingPostIdList_OldToNew(data)
  } else { // 'new-to-old'
    // 从新到旧，需要进行一些处理
    return await p_GetForwardingPostIdList_NewToOld(data)
  }
}

const p_GetForwardingPostIdList_OldToNew = async (data: PostControlForwardAutoJsonType) => {
  // 从旧到新，选择未转发的，比较简单
  const forwardingPostList = await p_G_OldOrNew_PrismaPostFindManyByForwardingOrder(data)
  const forwardingPostIdList = forwardingPostList.map(i => i.id)
  return forwardingPostIdList
}
const p_GetForwardingPostIdList_NewToOld = async (data: PostControlForwardAutoJsonType) => {
  // 从新到旧，需要进行一些处理，因为需要先转发父帖再转发子贴
  // （从旧到新因为是旧的先发所以没有这个问题）
  // - 父帖需在子帖之前
  // - 不能重复

  // 首先在数据库中根据数据查找未转发的帖子
  const forwardingPostList = await p_G_OldOrNew_PrismaPostFindManyByForwardingOrder(data)

  // type ForwardingPostItem = PromiseReturnType<typeof p_G_OldOrNew_PrismaPostFindManyByForwardingOrder>[number]
  type ForwardingPostItem = typeof forwardingPostList[number]

  // 先准备处理后的帖子数据列表
  const processedForwardingPostList: ForwardingPostItem[] = []
  // 用于方便查找存在与否
  const processedFPL_Find = (postItem: ForwardingPostItem) => {
    const findItem = processedForwardingPostList.find((i) => i.id === postItem.id)
    return findItem
  }
  // 添加时应调用这个方法，避免重复
  const processedFPL_Add = (postItem: ForwardingPostItem) => {
    // 判断是否已存在
    if (processedFPL_Find(postItem) != null) {
      return
    }
    // 不存在再添加
    processedForwardingPostList.push(postItem)
  }

  // 开始处理，遍历
  for (const postItem of forwardingPostList) {
    if (processedFPL_Find(postItem) != null) {
      // 已存在则跳过
      continue
    }
    if (postItem.parentPostId == null) {
      // 没有父帖，添加即可
      processedFPL_Add(postItem)
      continue
    }
    // 存在父帖，查找父帖
    // 为避免无限递归，设置已访问列表
    const visitedIds: string[] = []
    // 在数据库中处理未被转帖的父帖，递归
    const parentPostItemProcess = async (postItemParentPostId: string) => {
      if (visitedIds.includes(postItemParentPostId)) {
        return
      }
      visitedIds.push(postItemParentPostId)
      // 在数据库中寻找父帖，且应未被转帖
      const parentPostItem = await p_G_NewToOld_PrismaPostFindUniqueByParentPostId({
        ...data,
        postItemParentPostId
      })
      if (parentPostItem == null) {
        // 无未被转帖的父帖，返回
        return
      }
      // 有未被转发的父帖
      if (parentPostItem.parentPostId != null) {
        // 父帖还有父帖，递归查询
        await parentPostItemProcess(parentPostItem.parentPostId)
      }
      // 在处理父帖后，添加此parentPostItem
      processedFPL_Add(parentPostItem)
    }
    // 开始递归处理
    await parentPostItemProcess(postItem.parentPostId)
    // 递归处理父帖后，最后添加此帖（父帖先转发）
    processedFPL_Add(postItem)
  }

  const forwardingPostIdList = processedForwardingPostList.map(i => i.id)
  return forwardingPostIdList
}

// src\services\post-control\control-forward\forward-auto.ts
// 在数据库中寻找父帖，且应未被转帖
const p_G_NewToOld_PrismaPostFindUniqueByParentPostId = async (
  data: PostControlForwardAutoJsonType & {
    postItemParentPostId: string
  }
) => {
  const {
    forwardConfigId,
    postItemParentPostId
  } = data
  // 应未被转帖，即代表其转发记录中应没有forwardConfigId相等的
  const parentPostItem = await drizzleDb.query.posts.findFirst({
    where: drizzleOrm.and(
      drizzleOrm.eq(drizzleSchema.posts.id, postItemParentPostId),
      drizzleOrm.eq(drizzleSchema.posts.isDeleted, false),
      drizzleOrm.notExists(
        drizzleDb.select().from(drizzleSchema.postForwards)
          .where(drizzleOrm.and(
            drizzleOrm.eq(drizzleSchema.postForwards.postId, drizzleSchema.posts.id),
            drizzleOrm.eq(drizzleSchema.postForwards.forwardConfigId, forwardConfigId)
          ))
      )
    ),
    columns: {
      id: true,
      parentPostId: true
    }
  })
  return parentPostItem
}

// src\services\post-control\control-forward\forward-auto.ts
// 在数据库中根据数据查找未转发的帖子
const p_G_OldOrNew_PrismaPostFindManyByForwardingOrder = async (
  data: PostControlForwardAutoJsonType
) => {
  const {
    forwardConfigId,
    forwardingOrder,
    forwardingNumber
  } = data

  const orderByCreatedAt = (() => {
    if (forwardingOrder === 'old-to-new') {
      // 从旧到新
      return drizzleOrm.asc(drizzleSchema.posts.createdAt)
    } else { // 'new-to-old'
      // 从新到旧
      return drizzleOrm.desc(drizzleSchema.posts.createdAt)
    }
  })()
  const orderBy = [
    orderByCreatedAt,
    drizzleOrm.asc(drizzleSchema.posts.id)
  ]

  const forwardingPostList = await drizzleDb.query.posts.findMany({
    where: drizzleOrm.and(
      drizzleOrm.eq(drizzleSchema.posts.isDeleted, false),
      // 未转发
      drizzleOrm.notExists(
        drizzleDb.select().from(drizzleSchema.postForwards)
          .where(drizzleOrm.and(
            drizzleOrm.eq(drizzleSchema.postForwards.postId, drizzleSchema.posts.id),
            drizzleOrm.eq(drizzleSchema.postForwards.forwardConfigId, forwardConfigId)
          ))
      )
    ),
    orderBy,
    limit: forwardingNumber,
    columns: {
      id: true,
      parentPostId: true
    }
  })
  return forwardingPostList
}
