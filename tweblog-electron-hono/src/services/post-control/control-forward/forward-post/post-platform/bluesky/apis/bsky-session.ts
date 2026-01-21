import { useFetchSystem } from '@/systems'
import { urlJoinUtil } from '@/utils'
import { z } from 'zod'
import { handleBlueskyRes } from './base'

const fetchSystem = useFetchSystem()

const blueskySessionSchema = z.object({
  did: z.string(),
  accessJwt: z.string(),
  refreshJwt: z.string()
})

// 身份验证
// https://docs.bsky.app/docs/api/com-atproto-server-create-session
export const blueskyCreateSessionApi = async (parameter: {
  pdsHost: string
  identifier: string
  password: string
}) => {
  const {
    pdsHost,
    identifier,
    password
  } = parameter
  const res = await fetchSystem.fetchProxy(
    urlJoinUtil(pdsHost, 'xrpc/com.atproto.server.createSession'),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        identifier,
        password
      })
    }
  )

  return await handleBlueskyRes({
    res,
    resultSchema: blueskySessionSchema,
    apiName: 'CreateSession'
  })
}

// 刷新令牌
// https://docs.bsky.app/docs/api/com-atproto-server-refresh-session
export const blueskyRefreshSessionApi = async (parameter: {
  pdsHost: string
  refreshJwt: string
}) => {
  const {
    pdsHost,
    refreshJwt
  } = parameter

  const res = await fetchSystem.fetchProxy(
    urlJoinUtil(pdsHost, 'xrpc/com.atproto.server.refreshSession'),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${refreshJwt}`
      }
    }
  )

  return await handleBlueskyRes({
    res,
    resultSchema: blueskySessionSchema,
    apiName: 'RefreshSession'
  })
}
