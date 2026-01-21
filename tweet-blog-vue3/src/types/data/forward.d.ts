import type { platformKeyMap } from '@/config'

// 【已废弃】手动根据platformKeyMap设置了ForwardSettingItem的类型
// BackendForwardStore ForwardSetting 转发配置
// export type ForwardSettingX = {
//   uuid: string
//   name: string
//   platform: typeof platformKeyMap.X.key
//   data: typeof platformKeyMap.X.forwardSettingDataDefault
// }
// export type ForwardSettingT = {
//   uuid: string
//   name: string
//   platform: typeof platformKeyMap.T.key
//   data: typeof platformKeyMap.T.forwardSettingDataDefault
// }
// export type ForwardSettingItem = ForwardSettingX | ForwardSettingT

// 【241226】实现自动生成 类型体操自动生成ForwardSettingItem的类型
// BackendForwardStore ForwardSetting 转发配置
// 提取 platformKeyMap 的键
type PlatformKeys = keyof typeof platformKeyMap
// 动态生成 ForwardSetting 类型
type ForwardSettingPlatform<K extends PlatformKeys> = {
  uuid: string
  name: string
  platform: (typeof platformKeyMap)[K]['key']
  data: (typeof platformKeyMap)[K]['forwardSettingDataDefault']
}
// 生成所有可能的 ForwardSettingItem 类型
type ForwardSettingItem = {
  [K in PlatformKeys]: ForwardSettingPlatform<K>
}[PlatformKeys]

export type ForwardSettingList = ForwardSettingItem[]

// BackendForwardStore
export type BackendForwardStore = {
  forwardSettingList: ForwardSettingList
}

// 在转发配置设置页面的表单中，需要添加isDeleted
export type ForwardSettingItemInForm = ForwardSettingItem & {
  isDeleted: boolean
}
export type ForwardSettingListInForm = ForwardSettingItemInForm[]

// 转发帖子统计
export type ForwardSettingPostCount = {
  totalPostCount: number
  forwardSettingPostList: {
    uuid: string
    count: number
  }[]
}
