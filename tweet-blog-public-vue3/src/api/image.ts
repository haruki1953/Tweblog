import type { ImageGetByCursorQueryType, ImageGetByCursorRes } from '@/types'
import { http } from '@/utils'

export const imageGetByCursorApi = (
  cursorId: string,
  query?: ImageGetByCursorQueryType
): ImageGetByCursorRes => {
  const slash = cursorId === '' ? '' : '/'
  return http.get(`/image/cursor${slash}${cursorId}`, {
    params: query
  })
}
