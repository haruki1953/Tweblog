// src/services/post-control/control-forward/forward-post/post-platform/pocket-chat/apis/pocket-images.ts

import { useFetchSystem } from '@/systems'
import { urlJoinUtil } from '@/utils'
import { z } from 'zod'
import { handlePocketChatRes } from './base'
import type { ProcessedImageGroup } from '../utils/image'
import FormData from 'form-data'

const fetchSystem = useFetchSystem()

export const pocketChatImageRecordSchema = z.object({
  id: z.string()
})

export const pocketChatUploadImageApi = async (parameter: {
  host: string
  token: string
  authorId: string
  alt?: string | null
  processed: ProcessedImageGroup
}) => {
  const { host, token, authorId, alt, processed } = parameter

  const form = new FormData()

  form.append('author', authorId)
  if (alt != null) {
    form.append('alt', alt)
  }

  // image（中图）
  // form.append('image', new Blob([processed.image.buffer]), 'image.jpeg')
  form.append('image', Buffer.from(processed.image.buffer), {
    filename: processed.image.filename,
    contentType: processed.image.contentType
  })
  form.append('imageWidth', String(processed.image.width))
  form.append('imageHeight', String(processed.image.height))
  form.append('imageFileSize', String(processed.image.fileSize))

  // small
  // form.append('imageSmall', new Blob([processed.imageSmall.buffer]), 'imageSmall.jpeg')
  form.append('imageSmall', Buffer.from(processed.imageSmall.buffer), {
    filename: processed.imageSmall.filename,
    contentType: processed.imageSmall.contentType
  })
  form.append('imageSmallWidth', String(processed.imageSmall.width))
  form.append('imageSmallHeight', String(processed.imageSmall.height))
  form.append('imageSmallFileSize', String(processed.imageSmall.fileSize))

  // tiny
  // form.append('imageTiny', new Blob([processed.imageTiny.buffer]), 'imageTiny.jpeg')
  form.append('imageTiny', Buffer.from(processed.imageTiny.buffer), {
    filename: processed.imageTiny.filename,
    contentType: processed.imageTiny.contentType
  })
  form.append('imageTinyWidth', String(processed.imageTiny.width))
  form.append('imageTinyHeight', String(processed.imageTiny.height))
  form.append('imageTinyFileSize', String(processed.imageTiny.fileSize))

  // big（可选）
  if (processed.imageBig != null) {
    // form.append('imageBig', new Blob([processed.imageBig.buffer]), 'imageBig.jpeg')
    form.append('imageBig', Buffer.from(processed.imageBig.buffer), {
      filename: processed.imageBig.filename,
      contentType: processed.imageBig.contentType
    })
    form.append('imageBigWidth', String(processed.imageBig.width))
    form.append('imageBigHeight', String(processed.imageBig.height))
    form.append('imageBigFileSize', String(processed.imageBig.fileSize))
  } else {
    form.append('imageBigWidth', '0')
    form.append('imageBigHeight', '0')
    form.append('imageBigFileSize', '0')
  }

  const res = await fetchSystem.fetchProxy(
    urlJoinUtil(host, 'api/collections/images/records'),
    {
      method: 'POST',
      headers: {
        Authorization: `${token}`
      },
      body: form
    }
  )

  return await handlePocketChatRes({
    res,
    resultSchema: pocketChatImageRecordSchema,
    apiName: 'UploadImage'
  })
}
