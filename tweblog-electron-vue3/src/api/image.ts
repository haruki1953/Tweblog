import type {
  ImageGetByCursorQueryType,
  ImageGetByCursorRes,
  ImageUploadRes,
  ImageUpdateJsonType,
  ImageUpdateRes,
  ImageDeleteRes,
  ImageDeleteOriginalRes
} from '@/types'
import { http } from '@/utils'
import type { UploadRawFile } from 'element-plus'

export const imageUploadApi = (imageRawFile: UploadRawFile): ImageUploadRes => {
  const fd = new FormData()
  fd.append('image', imageRawFile)
  return http.post('/image', fd)
}

export const imageGetByCursorApi = (
  cursorId: string,
  query?: ImageGetByCursorQueryType
): ImageGetByCursorRes => {
  const slash = cursorId === '' ? '' : '/'
  return http.get(`/image/cursor${slash}${cursorId}`, {
    params: query
  })
}

export const imageUpdateApi = (json: ImageUpdateJsonType): ImageUpdateRes => {
  return http.patch('/image', json)
}

export const imageDeleteApi = (imageId: string): ImageDeleteRes => {
  return http.delete(`/image/id/${imageId}`)
}

export const imageDeleteOriginalApi = (
  imageId: string
): ImageDeleteOriginalRes => {
  return http.delete(`/image/original/id/${imageId}`)
}
