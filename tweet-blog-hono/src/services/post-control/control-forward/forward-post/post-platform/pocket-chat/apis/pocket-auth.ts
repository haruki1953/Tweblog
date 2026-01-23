// src/services/post-control/control-forward/forward-post/post-platform/pocket-chat/apis/pocket-auth.ts

import { useFetchSystem } from '@/systems'
import { urlJoinUtil } from '@/utils'
import { z } from 'zod'
import { handlePocketChatRes } from './base'

const fetchSystem = useFetchSystem()

// 登录响应结构
export const pocketChatAuthSchema = z.object({
  token: z.string(),
  record: z.object({
    id: z.string()
  })
})

// 登录 API
export const pocketChatAuthApi = async (parameter: {
  host: string
  identity: string // username or email
  password: string
}) => {
  const { host, identity, password } = parameter

  const res = await fetchSystem.fetchProxy(
    urlJoinUtil(host, 'api/collections/users/auth-with-password'),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        identity,
        password
      })
    }
  )

  return await handlePocketChatRes({
    res,
    resultSchema: pocketChatAuthSchema,
    apiName: 'AuthWithPassword'
  })
}
