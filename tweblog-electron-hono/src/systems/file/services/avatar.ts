import { systemFileConfig } from '@/configs'
import { type ProfileStore } from '@/types'
import { deleteImageSimple, saveImageSimple } from './base'

export const saveAvatar = async (
  imageFile: File
): Promise<ProfileStore['avatarArray'][number]> => {
  return await saveImageSimple(imageFile, systemFileConfig.avatarSavePath)
}

export const deleteAvatar = (
  imgPath: string
) => {
  deleteImageSimple(imgPath, systemFileConfig.avatarSavePath)
}
