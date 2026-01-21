import type {
  PostDeleteAllQueryType,
  PostDeleteAllRes,
  PostDeleteQueryType,
  PostDeleteRes,
  PostGetByCursorQueryType,
  PostGetByCursorRes,
  PostGetByIdQueryType,
  PostGetByIdRes,
  PostSendJsonType,
  PostSendRes,
  PostUpdateJsonType,
  PostUpdateRes
} from '@/types'
import { http } from '@/utils'

export const postGetByCursorApi = (
  cursorId: string,
  query?: PostGetByCursorQueryType
): PostGetByCursorRes => {
  const slash = cursorId === '' ? '' : '/'
  return http.get(`/post/cursor${slash}${cursorId}`, {
    params: query
  })
}

export const postSendApi = (json: PostSendJsonType): PostSendRes => {
  return http.post('/post', json)
}

export const postUpdateApi = (json: PostUpdateJsonType): PostUpdateRes => {
  return http.put('/post', json)
}

export const postGetByIdApi = (
  postId: string,
  query?: PostGetByIdQueryType
): PostGetByIdRes => {
  return http.get(`/post/id/${postId}`, {
    params: query
  })
}

export const postDeleteApi = (
  postId: string,
  query?: PostDeleteQueryType
): PostDeleteRes => {
  return http.delete(`/post/id/${postId}`, {
    params: query
  })
}

export const postDeleteAllApi = (
  query?: PostDeleteAllQueryType
): PostDeleteAllRes => {
  return http.delete(`/post/all`, {
    params: query
  })
}
