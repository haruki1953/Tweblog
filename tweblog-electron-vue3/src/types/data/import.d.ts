import type { PlatformKeyEnumValues } from '@/config'

export type ImportPostItem = {
  // 帖子内容
  content: string
  // 帖子时间
  createdAt: string
  // 帖子所属平台
  platform: PlatformKeyEnumValues
  // 帖子在所属平台的id
  platformId: string
  // 帖子在所属平台的链接
  platformLink: string
  // 帖子在所属平台的父帖id
  platformParentId: string | null
  // 帖子的图片
  importImages: {
    // 图片时间
    createdAt: string
    // 图片链接，后端将请求此url来获取图片
    link: string
    // 图片描述
    alt: string
    // 图片所属平台
    platform: PlatformKeyEnumValues
    // 图片在所属平台的id
    platformId: string
  }[]
}

export type ImportPostList = ImportPostItem[]

// 将在接口中使用
export type ImportPostItemForApi = {
  importImages: {
    // createdAt?: Date | undefined
    createdAt?: string | undefined
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
}

export type ImportPostListForApi = ImportPostItemForApi[]
