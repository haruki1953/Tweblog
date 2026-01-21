import { useAdminSystem, useFetchSystem, useImageSystem, useTaskSystem } from '@/systems'
import { type AdminLogGetByCursorParamType, type AdminLogGetByCursorQueryType, type AdminProxyTestJsonType, type AdminUpdateInfoJsonType, type AdminUpdateProxyJsonType } from '@/schemas'
import { AppError } from '@/classes'
import { useLogUtil } from '@/utils'
import { logConfig, logTypeMap, type LogTypeMapValues } from '@/configs'
import { sign } from 'hono/jwt'
import { drizzleDb, drizzleOrm, drizzleSchema } from '@/db'

const adminSystem = useAdminSystem()
const imageSystem = useImageSystem()
const fetchSystem = useFetchSystem()
const taskSystem = useTaskSystem()
const logUtil = useLogUtil()

export const generateTokenAdmin = async (
  payloadStr: string
) => {
  const payload = {
    payloadStr,
    exp: Math.floor(Date.now() / 1000) + adminSystem.getJwtAdminExpSeconds()
  }
  const token = await sign(payload, adminSystem.getJwtAdminSecretKey())
  return token
}

export const adminLoginService = async (
  username: string, password: string
) => {
  adminSystem.confirmAuth(username, password)
  const token = await generateTokenAdmin(username)
  return `Bearer ${token}`
}

export const adminUpdateAuthService = (
  username: string, password: string
) => {
  adminSystem.updateAuth(username, password)
  logUtil.info({
    content: '账号密码已更新'
  })
}

export const adminGetInfoService = () => {
  const isAuthDefault = adminSystem.isAuthDefault()
  const adminInfo = adminSystem.getAdminInfo()
  const proxyInfo = adminSystem.getProxyInfo()
  const imageConfig = imageSystem.getImageConfig()
  return {
    isAuthDefault,
    ...adminInfo,
    ...proxyInfo,
    ...imageConfig
  }
}

export const adminUpdateInfoService = (
  adminInfo: AdminUpdateInfoJsonType
) => {
  adminSystem.updateAdminInfo(adminInfo)
}

export const adminUpdateProxyService = (
  json: AdminUpdateProxyJsonType
) => {
  adminSystem.updateProxyInfo(json)
}

export const adminProxyTestService = async (
  json: AdminProxyTestJsonType
) => {
  return await fetchSystem.baseTestApi(json.testAddress).catch((error) => {
    logUtil.info({
      title: '网络测试失败',
      content: String(error)
    })
    throw new AppError('测试失败')
  })
}

// 对日志查询的排序，要复用
// createdAt降序 id升序
const dbLogsOrderBy = [
  drizzleOrm.desc(drizzleSchema.logs.createdAt),
  drizzleOrm.asc(drizzleSchema.logs.id)
]

// src\services\admin.ts
// 日志分页查询
export const adminLogGetByCursorService = async (
  cursorId: AdminLogGetByCursorParamType['id'], query: AdminLogGetByCursorQueryType
) => {
  // 在正式查询之前，首先要查询游标对应的log
  const cursorData = await (async () => {
    if (cursorId == null) {
      return undefined
    }
    const logsQuery = await drizzleDb.query.logs.findFirst({
      where: drizzleOrm.eq(drizzleSchema.logs.id, cursorId)
    })
    if (logsQuery == null) {
      throw new AppError('日志获取失败 | 游标无效')
    }
    return logsQuery
  })()

  // where类型查询
  const selectWhereType = (() => {
    const typeList: LogTypeMapValues[] = []
    if (query.error !== 'false') {
      typeList.push(logTypeMap.error.key)
    }
    if (query.warning !== 'false') {
      typeList.push(logTypeMap.warning.key)
    }
    if (query.success !== 'false') {
      typeList.push(logTypeMap.success.key)
    }
    if (query.info !== 'false') {
      typeList.push(logTypeMap.info.key)
    }
    return drizzleOrm.inArray(drizzleSchema.logs.type, typeList)
  })()

  // where使其从游标开始查询
  const selectWhereCursor = (() => {
    if (cursorData == null) {
      return undefined
    }
    return drizzleOrm.or(
      // 查询createdAt比游标所指的小的，因为是createdAt降序排序
      drizzleOrm.lt(drizzleSchema.logs.createdAt, cursorData.createdAt),
      // 需要考虑到createdAt相同的情况，所以需要借助id来确认createdAt相同时的顺序
      // 借助id升序降序随便，但要与orderBy相同
      drizzleOrm.and(
        drizzleOrm.eq(drizzleSchema.logs.createdAt, cursorData.createdAt),
        drizzleOrm.gt(drizzleSchema.logs.id, cursorData.id)
      )
    )
  })()

  const selectWhere = drizzleOrm.and(selectWhereType, selectWhereCursor)

  // orderBy
  const selectOrderBy = dbLogsOrderBy

  // selectLimit 分页个数
  const selectLimit = logConfig.logCursorTakeNum

  // select方式的查询，功能更多
  // const logsList = await drizzleDb
  //   .select()
  //   .from(drizzleSchema.logs)
  //   .where(selectWhere)
  //   .orderBy(...selectOrderBy)
  //   .limit(selectLimit)
  //   .catch((error) => {
  //     logUtil.info({
  //       title: '日志获取失败',
  //       content: String(error)
  //     })
  //     throw new AppError('日志获取失败')
  //   })
  // query方式的查询，关系查询方便
  const logsList = await drizzleDb.query.logs.findMany({
    where: selectWhere,
    orderBy: selectOrderBy,
    limit: selectLimit
  }).catch((error) => {
    logUtil.info({
      title: '日志获取失败',
      content: String(error)
    })
    throw new AppError('日志获取失败')
  })
  return logsList
}

// src\services\admin.ts
// 日志清理
export const adminLogDeleteService = async (num: number) => {
  // 查询前 num 条记录
  const topNumLogs = await (async () => {
    const selectOrderBy = dbLogsOrderBy
    const logsSelect = await drizzleDb
      .select()
      .from(drizzleSchema.logs)
      .orderBy(...selectOrderBy)
      .limit(num)
    return logsSelect
  })().catch((error) => {
    logUtil.info({
      title: '日志查询失败',
      content: String(error)
    })
    throw new AppError('日志查询失败')
  })

  // 删除不在前 num 条记录中的所有其他记录
  const deletedLogs = await (async () => {
    const deleteWhere = drizzleOrm.notInArray(
      drizzleSchema.logs.id, topNumLogs.map(i => i.id)
    )
    const logsDelete = await drizzleDb
      .delete(drizzleSchema.logs)
      .where(deleteWhere)
      .returning({
        id: drizzleSchema.logs.id
      })
    return logsDelete
  })().catch((error) => {
    logUtil.info({
      title: '日志删除失败',
      content: String(error)
    })
    throw new AppError('日志删除失败')
  })

  return {
    count: deletedLogs.length
  }
}

export const adminGetTaskService = () => {
  const taskStore = taskSystem.taskStore()
  return {
    taskStore
  }
}

export const adminTaskAbortService = (uuid: string) => {
  taskSystem.taskAbort(uuid)
  return adminGetTaskService()
}

export const adminTaskDeleteService = (uuid: string) => {
  taskSystem.taskDelete(uuid)
  return adminGetTaskService()
}
