import type { ImageStoreData } from '@/types'
import type { Ref } from 'vue'
import type { Image } from '@/types'
import {
  manageRefDataImageAfterDeleteImage,
  manageRefDataImageAfterUpdateImage,
  manageRefDataImageAfterUploadImage
} from '@/utils'

export const useManageModule = (dependencies: {
  imageList: Ref<ImageStoreData[]>
}) => {
  // data
  const { imageList } = dependencies

  // manage image data in imageList
  const manageAfterUploadImage = (resImage: Image) => {
    return manageRefDataImageAfterUploadImage({ imageList }, resImage)
  }
  const manageAfterUpdateImage = (resImage: Image) => {
    return manageRefDataImageAfterUpdateImage({ imageList }, resImage)
  }
  const manageAfterDeleteImage = (resImage: Image) => {
    return manageRefDataImageAfterDeleteImage({ imageList }, resImage)
  }

  return {
    manageAfterUploadImage,
    manageAfterUpdateImage,
    manageAfterDeleteImage
  }
}
