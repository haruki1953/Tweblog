import type {
  AdminDeleteAllOriginalImageRes,
  AdminDeleteNotUsedImageRes,
  AdminGatImageConfigRes,
  AdminGetInfoRes,
  AdminGetTaskRes,
  AdminLogDeleteRes,
  AdminLogGetByCursorQueryType,
  AdminLogGetByCursorRes,
  AdminProxyTestJsonType,
  AdminProxyTestRes,
  AdminUpdateImageConfigJsonType,
  AdminUpdateInfoJsonType,
  AdminUpdateProxyJsonType,
  ResData
} from '@/types'
import { http } from '@/utils'

type AdminLoginJsonType = {
  username: string
  password: string
}
export const adminLoginApi = ({
  username,
  password
}: AdminLoginJsonType): ResData<string> => {
  return http.post('/public/admin-login', { username, password })
}

export const adminUpdateAuthApi = ({
  username,
  password
}: AdminLoginJsonType) => {
  return http.put('/admin/auth', { username, password })
}

export const adminGetInfoApi = (): AdminGetInfoRes => {
  return http.get('/admin/info')
}

export const adminUpdateInfoApi = (
  json: AdminUpdateInfoJsonType
): AdminGetInfoRes => {
  return http.put('/admin/info', json)
}

export const adminUpdateProxyApi = (
  json: AdminUpdateProxyJsonType
): AdminGetInfoRes => {
  return http.put('/admin/proxy', json)
}

export const adminProxyTestApi = (
  json: AdminProxyTestJsonType
): AdminProxyTestRes => {
  return http.post('/admin/proxy-test', json)
}

export const adminUpdateImageConfigApi = (
  json: AdminUpdateImageConfigJsonType
): AdminGetInfoRes => {
  return http.put('/admin/image', json)
}

export const adminDeleteNotUsedImageApi = (): AdminDeleteNotUsedImageRes => {
  return http.delete('/image/all')
}

export const adminDeleteAllOriginalImageApi =
  (): AdminDeleteAllOriginalImageRes => {
    return http.delete('/image/original/all')
  }

export const adminLogGetByCursorApi = (
  cursorId: string,
  query: AdminLogGetByCursorQueryType
): AdminLogGetByCursorRes => {
  const slash = cursorId === '' ? '' : '/'
  return http.get(`/admin/log/cursor${slash}${cursorId}`, {
    params: query
  })
}

export const adminLogDeleteApi = (num: number): AdminLogDeleteRes => {
  return http.delete(`/admin/log/keep/${num}`)
}

export const adminGetTaskApi = (): AdminGetTaskRes => {
  return http.get('/admin/task')
}

export const adminTaskAbortApi = (uuid: string): AdminGetTaskRes => {
  return http.put(`/admin/task/abort/uuid/${uuid}`)
}

export const adminTaskDeleteApi = (uuid: string): AdminGetTaskRes => {
  return http.delete(`/admin/task/delete/uuid/${uuid}`)
}
