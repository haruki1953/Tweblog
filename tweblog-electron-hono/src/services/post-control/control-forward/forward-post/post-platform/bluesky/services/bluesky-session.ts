import { blueskyConfig, isDateExpired, blueskyRefreshSessionApi, blueskyCreateSessionApi } from './dependencies'
import { type PromiseReturnType } from '@/types'

interface BlueskySessionCacheItem {
  pdsHost: string
  identifier: string
  password: string
  session: PromiseReturnType<typeof blueskyCreateSessionApi>
  createAt: Date
  refreshAt: Date
}

// Session 缓存，避免多次登录，实现令牌刷新
let blueskySessionCache: BlueskySessionCacheItem[] = []

// bluesky获取Session
export const blueskyGetSessionService = async (data: {
  pdsHost: string
  identifier: string
  password: string
}) => {
  const {
    pdsHost,
    identifier,
    password
  } = data

  // 查找方法
  const findSession = () => {
    return blueskySessionCache.find((i) => (
      i.pdsHost === pdsHost &&
      i.identifier === identifier &&
      i.password === password
    ))
  }

  // 删除方法
  const deleteSession = () => {
    blueskySessionCache = blueskySessionCache.filter((i) => !(
      i.pdsHost === pdsHost &&
      i.identifier === identifier &&
      i.password === password
    ))
  }

  // 创建方法（创建前删除）
  const createSession = async () => {
    deleteSession()
    const createdSession = await blueskyCreateSessionApi({
      pdsHost,
      identifier,
      password
    })
    blueskySessionCache.push({
      pdsHost,
      identifier,
      password,
      createAt: new Date(),
      refreshAt: new Date(),
      session: createdSession
    })
    return createdSession
  }

  // 刷新方法
  const refreshSession = async () => {
    const sessionInfo = findSession()
    if (sessionInfo == null) {
      return await createSession()
    }
    const refreshedSession = await blueskyRefreshSessionApi({
      pdsHost,
      refreshJwt: sessionInfo.session.refreshJwt
    })
    sessionInfo.session = refreshedSession
    sessionInfo.refreshAt = new Date()
    return refreshedSession
  }

  // 获取当前Session
  const sessionInfo = findSession()

  // 不存在，请求并创建
  if (sessionInfo == null) {
    return await createSession()
  }

  // createAt过期，重新创建
  if (isDateExpired(
    sessionInfo.createAt,
    blueskyConfig.sessionCacheCreateExpiredSeconds
  )) {
    return await createSession()
  }

  // refreshAt过期，刷新
  if (isDateExpired(
    sessionInfo.refreshAt,
    blueskyConfig.sessionCacheRefreshExpiredSeconds
  )) {
    return await refreshSession()
  }

  // 以上条件全没问题，返回缓存的session
  return sessionInfo.session
}
