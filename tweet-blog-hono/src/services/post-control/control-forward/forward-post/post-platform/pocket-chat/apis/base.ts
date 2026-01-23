// src/services/post-control/control-forward/forward-post/post-platform/pocket-chat/apis/base.ts

import { AppError } from '@/classes'
import { useLogUtil } from '@/utils'
import { type z } from 'zod'
import { type Response } from 'node-fetch'

const logUtil = useLogUtil()

export const handlePocketChatRes = async <
  ResultSchema extends z.ZodTypeAny
>(data: {
  res: Response
  resultSchema: ResultSchema
  apiName: string
}) => {
  const { res, resultSchema, apiName } = data

  let resJson: any
  try {
    resJson = await res.json()
  } catch (error) {
    logUtil.warning({
      title: 'PocketChat 请求失败',
      content:
        `pocketchat ${apiName} 响应解析失败\n` +
        `status: ${res.status}\n`
    })
    throw new AppError('PocketChat 请求失败')
  }

  if (!res.ok) {
    logUtil.info({
      title: 'PocketChat 请求失败',
      content:
        `pocketchat ${apiName} 请求失败\n` +
        `status: ${res.status}\n` +
        `error: ${resJson?.message ?? ''}\n`
    })
    throw new AppError('PocketChat 请求失败')
  }

  const resZod = resultSchema.safeParse(resJson)
  if (!resZod.success) {
    logUtil.warning({
      title: 'PocketChat 响应结构错误',
      content:
        `pocketchat ${apiName} 响应结构错误\n` +
        `error: ${resZod.error.message}\n`
    })
    throw new AppError('PocketChat 请求失败')
  }

  return resZod.data as z.infer<typeof resultSchema>
}
