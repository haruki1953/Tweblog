import { type ForwardSettingPlatform, type ForwardSettingItem } from '@/types'

export interface DataForForwardPost {
  targetForwardSetting: ForwardSettingItem
  targetPostData: {
    id: string
    content: string
    parentPostSamePlatformPostId: string | undefined
  }
  targetImageList: Array<{
    id: string
    alt: string | null
    localLargeImagePath: string
  }>
}

// 通过传入平台所代表字段类型，来获取对应的类型
export interface DataForForwardPostPlatform<
  Platform extends PlatformKeyEnumValues
> extends DataForForwardPost {
  targetForwardSetting: ForwardSettingPlatform<Platform>
}

export interface ReturnForForwardPost {
  resPostInfo: {
    postId: string
    platformPostId: string
    platformPostLink: string
  }
  resImageList: Array<{
    imageId: string
    platformImageId: string
    platformImageLink: string
  }>
}
