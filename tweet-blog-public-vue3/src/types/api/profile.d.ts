import type { ResData, BackendProfileStore } from './base'

// 获取全部信息
export type ProfileGetAllData = {
  data: {
    post: number
    image: number
  }
  store: BackendProfileStore
}
export type ProfileGetAllRes = ResData<ProfileGetAllData>

export type ProfileResData = {
  store: BackendProfileStore
}

// 修改名称简介
export type ProfileUpdateNameBioJsonType = {
  name: string
  bio: string
}
export type ProfileUpdateNameBioData = ProfileResData
export type ProfileUpdateNameBioRes = ResData<ProfileUpdateNameBioData>

// 添加头像
export type ProfileAddAvatarData = ProfileResData & {
  newAvatar: BackendProfileStore['avatarArray'][number]
}
export type ProfileAddAvatarRes = ResData<ProfileAddAvatarData>

// 设置头像
export type ProfileUpdateAvatarData = ProfileResData
export type ProfileUpdateAvatarRes = ResData<ProfileUpdateAvatarData>

// 删除头像
export type ProfileDeleteAvatarData = ProfileResData & {
  delAvatar: BackendProfileStore['avatarArray'][number]
}
export type ProfileDeleteAvatarRes = ResData<ProfileDeleteAvatarData>

// 删除全部未使用头像
export type ProfileDeleteAvatarNotUsedData = ProfileResData & {
  delAvatarList: BackendProfileStore['avatarArray']
}
export type ProfileDeleteAvatarNotUsedRes =
  ResData<ProfileDeleteAvatarNotUsedData>

// 修改社交媒体信息
export type ProfileUpdateSocialMediasJsonType = {
  socialMedias: BackendProfileStore['socialMedias']
}
export type ProfileUpdateSocialMediasData = ProfileResData
export type ProfileUpdateSocialMediasRes =
  ResData<ProfileUpdateSocialMediasData>

// 添加图标
export type ProfileAddIconData = ProfileResData & {
  newExternalIcon: BackendProfileStore['externalIcons'][number]
}
export type ProfileAddIconRes = ResData<ProfileAddIconData>

// 删除图标
export type ProfileDeleteIconData = ProfileResData & {
  delExternalIcon: BackendProfileStore['externalIcons'][number]
}
export type ProfileDeleteIconRes = ResData<ProfileDeleteIconData>

// 删除全部未使用图标
export type ProfileDeleteIconNotUsedData = ProfileResData & {
  delExternalIconList: BackendProfileStore['externalIcons']
}
export type ProfileDeleteIconNotUsedRes = ResData<ProfileDeleteIconNotUsedData>

// 设置外部链接
export type ProfileUpdateExternalLinksJsonType = {
  externalLinks: BackendProfileStore['externalLinks']
}
export type ProfileUpdateExternalLinksData = ProfileResData
export type ProfileUpdateExternalLinksRes =
  ResData<ProfileUpdateExternalLinksData>

// 修改关于文档
export type profileUpdateAboutMdJsonType = {
  aboutMarkdown: string
}
export type profileUpdateAboutMdData = ProfileResData
export type profileUpdateAboutMdRes = ResData<profileUpdateAboutMdData>
