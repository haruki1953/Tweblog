import type { ImageStoreData } from '@/types'
import type { Ref } from 'vue'
import type { Image } from '@/types'
import { imageToImageStoreData } from '@/utils'

// manage ref data
// It can also be called outside of the store.
// The benefit of this is that, data in a Vue file can call this to make modifications.
export const manageRefDataImageAfterUploadImage = (
  refData: {
    imageList: Ref<ImageStoreData[]>
  },
  resImage: Image
) => {
  const { imageList } = refData
  const imageStoreDataByResImage = imageToImageStoreData(resImage)
  imageList.value.unshift(imageStoreDataByResImage)
  return imageStoreDataByResImage
}

export const manageRefDataImageAfterUpdateImage = (
  refData: {
    imageList: Ref<ImageStoreData[]>
  },
  resImage: Image
) => {
  const { imageList } = refData
  // find all image the id same as resImage
  const findImageIndexList = imageList.value
    .map((image, index) => (image.id === resImage.id ? index : null))
    .filter((i): i is number => i !== null)

  // record updated data
  const imageStoreDataListByResImage: ReturnType<
    typeof imageToImageStoreData
  >[] = []

  // update image by indexList
  findImageIndexList.forEach((i) => {
    const imageStoreDataByResImage = imageToImageStoreData(
      resImage,
      imageList.value[i]
    )
    imageStoreDataListByResImage.push(imageStoreDataByResImage)
    imageList.value[i] = imageStoreDataByResImage
  })

  return imageStoreDataListByResImage
}

export const manageRefDataImageAfterDeleteImage = (
  refData: {
    imageList: Ref<ImageStoreData[]>
  },
  resImage: Image
) => {
  const { imageList } = refData

  // imageList.value = imageList.value.filter((i) => i.id !== resImage.id)
  const findImageIndexList = imageList.value
    .map((image, index) => (image.id === resImage.id ? index : null))
    .filter((i): i is number => i !== null)
  findImageIndexList.forEach((i) => {
    imageList.value.splice(i, 1)
  })
}
