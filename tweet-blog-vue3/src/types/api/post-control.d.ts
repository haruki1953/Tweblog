import type { ForwardingOrderEnumValues } from '@/config'
import type {
  BackendForwardStore,
  BackendTaskStore,
  ForwardSettingPostCount,
  ImageForwardData,
  ImportPostListForApi,
  PostForwardData,
  PostImportData
} from '../data'
import type { ResData } from './base'

export type PostControlImportJsonType = {
  importPosts: ImportPostListForApi
  advancedSettings?: {
    forwardConfigId?: string
  }
}

export type PostControlImportData = {
  taskImport: BackendTaskStore['taskImportList'][number]
  taskStore: BackendTaskStore
}
export type PostControlImportRes = ResData<PostControlImportData>

export type PostControlDeleteImportDataData = PostImportData

export type PostControlDeleteImportDataRes =
  ResData<PostControlDeleteImportDataData>

export type PostControlDeleteImportData = {
  postImport: {
    count: number
  }
  imageImport: {
    count: number
  }
}
export type PostControlDeleteImportExcessData = PostControlDeleteImportData
export type PostControlDeleteImportExcessRes =
  ResData<PostControlDeleteImportExcessData>

export type PostControlDeleteImportAllPostData = PostControlDeleteImportData
export type PostControlDeleteImportAllPostRes =
  ResData<PostControlDeleteImportAllPostData>

export type PostControlDeleteImportAllImageData = PostControlDeleteImportData
export type PostControlDeleteImportAllImageRes =
  ResData<PostControlDeleteImportAllImageData>

export type PostControlGetForwardData = {
  forwardStore: BackendForwardStore
}
export type PostControlGetForwardRes = ResData<PostControlGetForwardData>

export type PostControlForwardSettingPostCountData = ForwardSettingPostCount
export type PostControlForwardSettingPostCountRes =
  ResData<ForwardSettingPostCount>

export type PostControlDeleteForwardDataData = PostForwardData
export type PostControlDeleteForwardDataRes =
  ResData<PostControlDeleteForwardDataData>

export type PostControlForwardManualLinkingJsonType = {
  postId: string
  forwardConfigId: string
  platformPostId: string
  platformPostLink: string
  forwardAt?: string | undefined
}

export type PostControlForwardManualLinkingData = PostForwardData
export type PostControlForwardManualLinkingRes =
  ResData<PostControlForwardManualLinkingData>

export type PostControlForwardPostJsonType = {
  postId: string
  forwardConfigId: string
}
export type PostControlForwardPostData = {
  postForward: PostForwardData
  ImageForwardData: ImageForwardData
}
export type PostControlForwardPostRes = ResData<PostControlForwardPostData>

export type PostControlForwardAutoJsonType = {
  forwardConfigId: string
  forwardingOrder: ForwardingOrderEnumValues
  forwardingNumber: number
  forwardingIntervalSeconds: number
}
export type PostControlForwardAutoData = {
  taskForward: BackendTaskStore['taskForwardList'][number]
  taskStore: BackendTaskStore
}
export type PostControlForwardAutoRes = ResData<PostControlForwardAutoData>

export type PostControlDeleteForwardData = {
  postForward: {
    count: number
  }
  imageForward: {
    count: number
  }
}
export type PostControlDeleteForwardNotSettingData =
  PostControlDeleteForwardData
export type PostControlDeleteForwardNotSettingRes =
  ResData<PostControlDeleteForwardNotSettingData>

export type PostControlDeleteForwardAllPostData = PostControlDeleteForwardData
export type PostControlDeleteForwardAllPostRes =
  ResData<PostControlDeleteForwardAllPostData>

export type PostControlDeleteForwardAllImageData = PostControlDeleteForwardData
export type PostControlDeleteForwardAllImageRes =
  ResData<PostControlDeleteForwardAllImageData>
