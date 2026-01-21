import { useFetchSystem } from '@/systems'
import { urlJoinUtil } from '@/utils'
import { z } from 'zod'
import { handleBlueskyRes } from './base'
import { readFile } from 'fs/promises'
import { getFileMimeType } from './dependencies'

const fetchSystem = useFetchSystem()

export const blueskyBlobSchema = z.object({
  blob: z.object({
    $type: z.string(),
    ref: z.object({
      $link: z.string()
    }),
    mimeType: z.string(),
    size: z.number()
  })
})

// 上传文件（图片）
// https://docs.bsky.app/docs/api/com-atproto-repo-upload-blob
export const blueskyUploadBlobApi = async (parameter: {
  pdsHost: string
  accessJwt: string
  filePath: string
}) => {
  const {
    pdsHost,
    accessJwt,
    filePath
  } = parameter
  // 读取本地文件
  const fileBuffer = await readFile(filePath)
  // 获取文件类型
  const mimeType = getFileMimeType(filePath)

  const res = await fetchSystem.fetchProxy(
    urlJoinUtil(pdsHost, 'xrpc/com.atproto.repo.uploadBlob'),
    {
      method: 'POST',
      headers: {
        'Content-Type': mimeType,
        Authorization: `Bearer ${accessJwt}`
      },
      body: fileBuffer
    }
  )
  return await handleBlueskyRes({
    res,
    resultSchema: blueskyBlobSchema,
    apiName: 'UploadBlob'
  })
}
