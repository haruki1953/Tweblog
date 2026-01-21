import { AppError } from '@/classes'
import { useLogUtil } from '@/utils'
import { type z } from 'zod'
import { type Response } from 'node-fetch'

const logUtil = useLogUtil()

export const handleBlueskyRes = async <ResultSchema extends z.ZodTypeAny>(data: {
  res: Response
  resultSchema: ResultSchema
  apiName: string
}) => {
  const {
    res,
    resultSchema,
    apiName
  } = data

  const resJson = await res.json()
  if (!res.ok) {
    logUtil.info({
      title: '转发失败',
      content:
      `bluesky ${apiName} 请求失败\n` +
      `error: ${resJson?.error}\n` +
      `message: ${resJson?.message}\n`
    })
    throw new AppError('转发失败')
  }

  const resZod = resultSchema.safeParse(resJson)
  if (!resZod.success) {
    logUtil.warning({
      title: '转发失败',
      content:
      `bluesky ${apiName} 接口响应结构错误\n` +
      `error: ${resZod.error.message}\n`
    })
    throw new AppError('转发失败')
  }

  const resData: z.infer<typeof resultSchema> = resZod.data

  return resData
}
