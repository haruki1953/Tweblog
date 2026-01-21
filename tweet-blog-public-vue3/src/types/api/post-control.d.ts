import type { PlatformKeyEnumValues } from '@/config'
import type {
  BackendForwardStore,
  BackendTaskCache,
  PostForwardData,
  PostImportData
} from '../data'
import type { ResData } from './base'

export type PostControlImportJsonType = {
  importPosts: {
    importImages: {
      link: string
      alt?: string | undefined
      platform?: PlatformKeyEnumValues | undefined
      platformId?: string | undefined
    }[]
    content?: string | undefined
    // createdAt?: Date | undefined
    createdAt?: string | undefined
    platform?: PlatformKeyEnumValues | undefined
    platformId?: string | undefined
    platformLink?: string | undefined
    platformParentId?: string | null | undefined
    isDeleted?: boolean | undefined
  }[]
}

export type PostControlImportJsonTypeOnDataProcess = {
  importPosts: {
    importImages: {
      link: string
      alt: string
      platform: PlatformKeyEnumValues
      platformId: string
    }[]
    content: string
    createdAt: string
    platform: PlatformKeyEnumValues
    platformId: string
    platformLink: string
    platformParentId: string | null
    isDeleted?: boolean | undefined
  }[]
}

export type PostControlImportData = {
  importTask: BackendTaskCache['importTaskList'][number]
  taskCache: BackendTaskCache
}
export type PostControlImportRes = ResData<PostControlImportData>

export type PostControlDeleteImportDataData = PostImportData

export type PostControlDeleteImportDataRes =
  ResData<PostControlDeleteImportDataData>

export type PostControlDeleteImportExcessData = {
  postImport: {
    count: number
  }
  imageImport: {
    count: number
  }
}
export type PostControlDeleteImportExcessRes =
  ResData<PostControlDeleteImportExcessData>

export type PostControlDeleteImportAllPostData =
  PostControlDeleteImportExcessData
export type PostControlDeleteImportAllPostRes =
  ResData<PostControlDeleteImportAllPostData>
export type PostControlDeleteImportAllImageData =
  PostControlDeleteImportExcessData
export type PostControlDeleteImportAllImageRes =
  ResData<PostControlDeleteImportAllImageData>

export type PostControlGetForwardData = {
  forwardStore: BackendForwardStore
}
export type PostControlGetForwardRes = ResData<PostControlGetForwardData>

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
