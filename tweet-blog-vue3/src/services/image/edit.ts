import { imageDeleteApi, imageDeleteOriginalApi, imageUpdateApi } from '@/api'
import { useImageStore, useProfileStore } from '@/stores'
import type { ImageStoreData, ImageUpdateJsonType } from '@/types'
import {
  manageRefDataImageAfterDeleteImage,
  manageRefDataImageAfterUpdateImage,
  sakiMessage
} from '@/utils'
import { computed, type ComputedRef, type ModelRef } from 'vue'
import { ref } from 'vue'

export const useImageEditService = (dependencies: {
  selectedImages: ModelRef<ImageStoreData[], string>
  formModel: ModelRef<Omit<ImageUpdateJsonType, 'id'>, string>
  isIndexAble: ComputedRef<boolean>
  imageByIndex: ComputedRef<ImageStoreData>
}) => {
  const { selectedImages, formModel, isIndexAble, imageByIndex } = dependencies

  const imageStore = useImageStore()
  const profileStore = useProfileStore()

  // 修改图片信息
  const isSending = ref(false)
  const updateImage = async () => {
    if (!isIndexAble.value) {
      return
    }
    isSending.value = true
    try {
      const imgId = imageByIndex.value.id
      const res = await imageUpdateApi({
        ...formModel.value,
        id: imgId
      })
      const resImage = res.data.data
      // 修改图片后，利用返回的图片，管理store中的数据
      imageStore.manageAfterUpdateImage(resImage)
      // 还要修改selectedImages
      manageRefDataImageAfterUpdateImage(
        { imageList: selectedImages },
        resImage
      )

      sakiMessage({
        type: 'success',
        message: '修改成功'
      })
    } finally {
      isSending.value = false
    }
  }

  // 删除图片相关
  const disableDeleteImage = computed(() => {
    if (imageByIndex.value._count.posts > 0) {
      return true
    }
    return false
  })
  const disableDeleteOriginal = computed(() => {
    if (imageByIndex.value.originalSize === 0) {
      return true
    }
    return false
  })
  const isImageDeleting = ref(false)
  const deleteImage = async () => {
    if (!isIndexAble.value) {
      return
    }
    isImageDeleting.value = true
    try {
      const imgId = imageByIndex.value.id
      const res = await imageDeleteApi(imgId)
      // const resImgIndex = selectedImages.value.findIndex((i) => i.id === imgId)
      // if (resImgIndex >= 0) {
      //   selectedImages.value.splice(resImgIndex, 1)
      // }
      const resImage = res.data.data
      // 删除图片后，利用返回的图片，管理store中的数据
      imageStore.manageAfterDeleteImage(resImage)
      // 还要修改selectedImages
      manageRefDataImageAfterDeleteImage(
        { imageList: selectedImages },
        resImage
      )
      // 删除图片后，重新获取个人信息中的图片数量
      profileStore.loadAll()

      sakiMessage({
        type: 'success',
        message: '删除成功'
      })
      // await imageStore.reGetImages()
    } finally {
      isImageDeleting.value = false
    }
  }
  const isOriginalDeleting = ref(false)
  const deleteOriginal = async () => {
    if (!isIndexAble.value) {
      return
    }
    isOriginalDeleting.value = true
    try {
      const imgId = imageByIndex.value.id
      const res = await imageDeleteOriginalApi(imgId)
      const resImage = res.data.data
      // 删除原图其实也差不多是修改图片信息
      // 修改图片后，利用返回的图片，管理store中的数据
      imageStore.manageAfterUpdateImage(resImage)
      // 还要修改selectedImages
      manageRefDataImageAfterUpdateImage(
        { imageList: selectedImages },
        resImage
      )

      sakiMessage({
        type: 'success',
        message: '删除成功'
      })
    } finally {
      isOriginalDeleting.value = false
    }
  }

  return {
    isSending,
    updateImage,
    disableDeleteImage,
    disableDeleteOriginal,
    isImageDeleting,
    deleteImage,
    isOriginalDeleting,
    deleteOriginal
  }
}
