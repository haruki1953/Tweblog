import './init'
import {
  deleteAllOriginalImage,
  deleteAvatar,
  deleteIcon,
  deleteImage,
  deleteOriginalImage,
  getImageConfig,
  processImage,
  saveAvatar,
  saveIcon,
  updateImageConfig
} from './services'

export const useImageSystem = () => {
  return {
    getImageConfig,
    updateImageConfig,
    processImage,
    deleteImage,
    deleteOriginalImage,
    deleteAllOriginalImage
  }
}

export const useAvatarSystem = () => {
  return {
    saveAvatar,
    deleteAvatar
  }
}

export const useIconSystem = () => {
  return {
    saveIcon,
    deleteIcon
  }
}
