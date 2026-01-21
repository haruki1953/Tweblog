import type { ImageStoreData, ImageUpdateJsonType } from '@/types'
import { computed, type ComputedRef, type ModelRef, type Ref } from 'vue'

export const useImageEditCardController = (dependencies: {
  propsnotPreview: ComputedRef<boolean>
  propsimageSelect: ComputedRef<boolean>
  selectedImages: ModelRef<ImageStoreData[], string>
  formModel:
    | ModelRef<Omit<ImageUpdateJsonType, 'id'>, string>
    | Ref<Omit<ImageUpdateJsonType, 'id'>>
  imgIndex: ModelRef<number, string> | Ref<number>
}) => {
  const {
    // propsnotPreview,
    // propsimageSelect,
    selectedImages,
    formModel,
    imgIndex
  } = dependencies

  const handleIndex = () => {
    if (imgIndex.value < 0) {
      imgIndex.value = 0
    }
    if (imgIndex.value >= selectedImages.value.length) {
      imgIndex.value = Math.max(0, selectedImages.value.length - 1)
    }
  }

  const isIndexAble = computed(() => {
    if (imgIndex.value < 0) {
      return false
    }
    if (imgIndex.value >= selectedImages.value.length) {
      return false
    }
    return true
  })

  const imageByIndex = computed(() => {
    return selectedImages.value[imgIndex.value]
  })

  const initFormModel = () => {
    if (!isIndexAble.value) return
    formModel.value.alt = imageByIndex.value.alt
  }

  return {
    handleIndex,
    isIndexAble,
    imageByIndex,
    initFormModel
  }
}
