// src/services/post-control/control-forward/forward-post/post-platform/pocket-chat/services/pocket-session.ts

import { pocketChatConfig, pocketChatAuthApi } from './dependencies'
import { type PromiseReturnType } from '@/types'

interface PocketChatSessionCacheItem {
  host: string
  identity: string
  password: string

  // 登录响应
  session: PromiseReturnType<typeof pocketChatAuthApi>

  token: string
  authorId: string

  createAt: Date
  refreshAt: Date
}

// Session 缓存
let pocketChatSessionCache: PocketChatSessionCacheItem[] = []

/**
 * PocketChat 获取 Session（带缓存 + 自动刷新）
 */
export const pocketChatGetSessionService = async (data: {
  host: string
  identity: string
  password: string
}) => {
  const { host, identity, password } = data

  // 查找缓存
  const findSession = () => {
    return pocketChatSessionCache.find(
      (i) =>
        i.host === host &&
        i.identity === identity &&
        i.password === password
    )
  }

  // 删除缓存
  const deleteSession = () => {
    pocketChatSessionCache = pocketChatSessionCache.filter(
      (i) =>
        !(
          i.host === host &&
          i.identity === identity &&
          i.password === password
        )
    )
  }

  // 创建 Session（登录）
  const createSession = async () => {
    deleteSession()

    const session = await pocketChatAuthApi({
      host,
      identity,
      password
    })

    pocketChatSessionCache.push({
      host,
      identity,
      password,
      session,
      token: session.token,
      authorId: session.record.id,
      createAt: new Date(),
      refreshAt: new Date()
    })

    return session
  }

  // 刷新 Session（重新登录）
  const refreshSession = async () => {
    const sessionInfo = findSession()
    if (sessionInfo == null) {
      return await createSession()
    }

    const refreshed = await pocketChatAuthApi({
      host,
      identity,
      password
    })

    sessionInfo.session = refreshed
    sessionInfo.token = refreshed.token
    sessionInfo.authorId = refreshed.record.id
    sessionInfo.refreshAt = new Date()

    return refreshed
  }

  // 获取缓存
  const sessionInfo = findSession()

  // 不存在 → 登录
  if (sessionInfo == null) {
    return await createSession()
  }

  // refreshAt 超过 10 分钟 → 刷新
  const now = Date.now()
  const refreshExpiredSeconds = pocketChatConfig.sessionCacheRefreshExpiredSeconds
  const refreshExpiredMs = refreshExpiredSeconds * 1000

  if (now - sessionInfo.refreshAt.getTime() > refreshExpiredMs) {
    return await refreshSession()
  }

  // 返回缓存
  return sessionInfo.session
}
