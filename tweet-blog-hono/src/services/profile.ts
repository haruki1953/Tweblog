import { AppError } from '@/classes'
import { drizzleDb, drizzleSchema } from '@/db'
import { type ProfileUpdateExternalLinksJsonType, type ProfileUpdateSocialMediasJsonType } from '@/schemas'
import { useProfileSystem } from '@/systems'
import { useLogUtil } from '@/utils'

const profileSystem = useProfileSystem()

const logUtil = useLogUtil()

// src\services\profile.ts
// 计数
export const profileGetDataService = async () => {
  // 这里没有where，回收站的帖子也会计数。会被访客调用，所以想这样节省性能
  const post = await drizzleDb.$count(drizzleSchema.posts).catch((error) => {
    logUtil.info({
      title: '推文数量统计失败',
      content: String(error)
    })
    throw new AppError('推文数量统计失败')
  })
  const image = await drizzleDb.$count(drizzleSchema.images).catch((error) => {
    logUtil.info({
      title: '图片数量统计失败',
      content: String(error)
    })
    throw new AppError('图片数量统计失败')
  })

  return {
    post,
    image
  }
}

export const profileGetStoreService = async () => {
  return profileSystem.store
}

export const profileUpdateNameBioService = (
  name: string,
  bio: string
) => {
  profileSystem.setNameBio(name, bio)
  return {
    store: profileSystem.store
  }
}

export const profileUpdateAboutMdService = (
  aboutMarkdown: string
) => {
  profileSystem.setAboutMarkdown(aboutMarkdown)
  return {
    store: profileSystem.store
  }
}

export const profileUpdateSocialMediasService = (
  socialMedias: ProfileUpdateSocialMediasJsonType['socialMedias']
) => {
  profileSystem.setSocialMedias(socialMedias)
  return {
    store: profileSystem.store
  }
}

export const profileAddAvatarService = async (
  imageFile: File
) => {
  const newAvatar = await profileSystem.addAvatar(imageFile)
  return {
    newAvatar,
    store: profileSystem.store
  }
}

export const profileDeleteAvatarByUuidService = (
  uuid: string
) => {
  const delAvatar = profileSystem.delAvatar(uuid)
  return {
    delAvatar,
    store: profileSystem.store
  }
}

export const profileDeleteAvatarNotUsedService = () => {
  const delAvatarList = profileSystem.delNotUsedAvatars()
  return {
    delAvatarList,
    store: profileSystem.store
  }
}

export const profileUpdateAvatarService = (
  uuid: string
) => {
  profileSystem.setAvatar(uuid)
  return {
    store: profileSystem.store
  }
}

export const profileAddExternalIconService = async (
  imageFile: File
) => {
  const newExternalIcon = await profileSystem.addExternalIcon(imageFile)
  return {
    newExternalIcon,
    store: profileSystem.store
  }
}

export const profileDeleteExternalIconByUuidService = (
  uuid: string
) => {
  const delExternalIcon = profileSystem.delExternalIcon(uuid)
  return {
    delExternalIcon,
    store: profileSystem.store
  }
}

export const profileDeleteExternalIconNotUsedService = () => {
  const delExternalIconList = profileSystem.delNotUsedExternalIcon()
  return {
    delExternalIconList,
    store: profileSystem.store
  }
}

export const profileUpdateExternalLinksService = (
  externalLinks: ProfileUpdateExternalLinksJsonType['externalLinks']
) => {
  profileSystem.setExternalLinks(externalLinks)
  return {
    store: profileSystem.store
  }
}
