import type { platformKeyMap } from '@/config'

// BackendForwardStore ForwardSetting 转发配置
export type ForwardSettingBase = {
  uuid: string
  name: string
}

export type ForwardSettingX = {
  platform: typeof platformKeyMap.X.key
  data: typeof platformKeyMap.X.forwardSettingDataDefault
} & ForwardSettingBase
export type ForwardSettingT = {
  platform: typeof platformKeyMap.T.key
  data: typeof platformKeyMap.T.forwardSettingDataDefault
} & ForwardSettingBase

export type ForwardSettingItem = ForwardSettingX | ForwardSettingT
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
