import { type ProfileStore } from '@/types'
import { save, store } from '../init'
import { useAvatarSystem } from '@/systems/file'
import { AppError } from '@/classes'

const avatarSystem = useAvatarSystem()

export const addAvatar = async (imageFile: File) => {
  const avatarInfo = await avatarSystem.saveAvatar(imageFile)
  const newAvatarArray = [...store.avatarArray]
  newAvatarArray.push(avatarInfo)
  save({
    ...store,
    avatarArray: newAvatarArray
  })
  return avatarInfo
}

export const delAvatar = (imageUuid: string) => {
  // 确认头像存在
  const nowAvatarArray = [...store.avatarArray]
  const avatarInfo = nowAvatarArray.find(a => a.uuid === imageUuid)
  if (avatarInfo === undefined) {
    throw new AppError('头像不存在', 400)
  }
  // 删除头像文件
  avatarSystem.deleteAvatar(avatarInfo.path)
  // 删除头像json
  const newAvatarArray = nowAvatarArray.filter(a => a.uuid !== imageUuid)
  save({
    ...store,
    avatarArray: newAvatarArray
  })
  return avatarInfo
}

export const delNotUsedAvatars = () => {
  const nowAvatarArray = [...store.avatarArray]
  const usedAvatarUuid = store.avatar
  const avatarList = nowAvatarArray.filter(a => a.uuid !== usedAvatarUuid)
  avatarList.forEach((a) => {
    avatarSystem.deleteAvatar(a.path)
  })
  const newAvatarArray = nowAvatarArray.filter(a => a.uuid === usedAvatarUuid)
  save({
    ...store,
    avatarArray: newAvatarArray
  })
  return avatarList
}

export const setAvatar = (
  avatar: ProfileStore['avatar']
) => {
  save({
    ...store,
    avatar
  })
}
