import { systemFileConfig } from '@/configs'
import { type ProfileStore } from '@/types'
import { deleteImageSimple, saveImageSimple } from './base'

export const saveIcon = async (
  imageFile: File
): Promise<ProfileStore['externalIcons'][number]> => {
  return await saveImageSimple(imageFile, systemFileConfig.iconSavePath)
}

export const deleteIcon = (
  imgPath: string
) => {
  deleteImageSimple(imgPath, systemFileConfig.iconSavePath)
}
