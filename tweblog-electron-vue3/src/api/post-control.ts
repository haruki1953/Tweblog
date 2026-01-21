import { platformKeyMap } from '@/config'
import type {
  ForwardSettingListInForm,
  PostControlDeleteForwardAllImageRes,
  PostControlDeleteForwardAllPostRes,
  PostControlDeleteForwardDataRes,
  PostControlDeleteForwardNotSettingRes,
  PostControlDeleteImportAllImageRes,
  PostControlDeleteImportAllPostRes,
  PostControlDeleteImportDataRes,
  PostControlDeleteImportExcessRes,
  PostControlForwardAutoJsonType,
  PostControlForwardAutoRes,
  PostControlForwardManualLinkingJsonType,
  PostControlForwardManualLinkingRes,
  PostControlForwardPostJsonType,
  PostControlForwardPostRes,
  PostControlForwardSettingPostCountRes,
  PostControlGetForwardRes,
  PostControlImportJsonType,
  PostControlImportRes
} from '@/types'
import { http } from '@/utils'
import { cloneDeep } from 'lodash'

export const postControlImportApi = (
  json: PostControlImportJsonType
): PostControlImportRes => {
  return http.post('/post-control/import', json)
}

export const postControlDeleteImportDataApi = (
  id: string
): PostControlDeleteImportDataRes => {
  return http.delete(`/post-control/import-data/id/${id}`)
}

export const postControlDeleteImportExcessApi =
  (): PostControlDeleteImportExcessRes => {
    return http.delete('/post-control/import-data/excess')
  }

export const postControlDeleteImportAllPostApi =
  (): PostControlDeleteImportAllPostRes => {
    return http.delete('/post-control/import-data/all/post')
  }

export const postControlDeleteImportAllImageApi =
  (): PostControlDeleteImportAllImageRes => {
    return http.delete('/post-control/import-data/all/image')
  }

export const postControlGetForwardApi = (): PostControlGetForwardRes => {
  return http.get('/post-control/forward')
}

export const postControlForwardSettingPostCountApi =
  (): PostControlForwardSettingPostCountRes => {
    return http.get('/post-control/forward-setting/post-count')
  }

export const postControlForwardSettingSetApi = (
  forwardSettingListInForm: ForwardSettingListInForm
): PostControlGetForwardRes => {
  // 使用类型体操将 'data' | 'isDeleted' 设置为可选
  type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
  type ItemInForm = (typeof forwardSettingListInForm)[number]
  type ItemForJson = MakeOptional<ItemInForm, 'data' | 'isDeleted'>
  // 对数据进行处理
  const forwardSettingList = []
  for (const item of forwardSettingListInForm) {
    // 已删除则忽略
    if (item.isDeleted) {
      continue
    }

    // 准备要发送的item
    const itemForJson: ItemForJson = cloneDeep(item)
    itemForJson.isDeleted = undefined
    itemForJson.data = undefined

    // data中应有的数据不都为空，则使用data
    let hasData = false
    for (const key in platformKeyMap[item.platform].forwardSettingDataDefault) {
      if ((item.data as any)[key] !== '') {
        hasData = true
      }
    }
    if (hasData) {
      itemForJson.data = item.data
    }

    forwardSettingList.push(itemForJson)
  }

  return http.put('/post-control/forward-setting', { forwardSettingList })
}

export const postControlDeleteForwardDataApi = (
  id: string
): PostControlDeleteForwardDataRes => {
  return http.delete(`/post-control/forward-data/id/${id}`)
}

export const postControlForwardManualLinkingApi = (
  json: PostControlForwardManualLinkingJsonType
): PostControlForwardManualLinkingRes => {
  return http.post(`/post-control/forward-data/manual-linking`, json)
}

export const postControlForwardPostApi = (
  json: PostControlForwardPostJsonType
): PostControlForwardPostRes => {
  return http.post(`/post-control/forward-post`, json)
}

export const postControlForwardAutoApi = (
  json: PostControlForwardAutoJsonType
): PostControlForwardAutoRes => {
  return http.post(`/post-control/forward-auto`, json)
}

export const postControlDeleteForwardNotSettingApi =
  (): PostControlDeleteForwardNotSettingRes => {
    return http.delete('/post-control/forward-data/not-setting')
  }

export const postControlDeleteForwardAllPostApi =
  (): PostControlDeleteForwardAllPostRes => {
    return http.delete('/post-control/forward-data/all/post')
  }

export const postControlDeleteForwardAllImageApi =
  (): PostControlDeleteForwardAllImageRes => {
    return http.delete('/post-control/forward-data/all/image')
  }
