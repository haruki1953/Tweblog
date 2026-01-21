import { useStatesStore } from '@/stores'
import { computed, ref } from 'vue'
import { sakiMessage } from '@/utils'
import type { UploadFile } from 'element-plus'
import { imageRule } from '@/config'
import { imageUploadApi } from '@/api'
import type { useManageModule } from './manage'

export const useUploadModule = (dependencies: {
  manageAfterUploadImage: ReturnType<
    typeof useManageModule
  >['manageAfterUploadImage']
}) => {
  const { manageAfterUploadImage } = dependencies

  // data
  const uploadingImageCount = ref(0)
  const isImageUploading = computed(() => {
    return uploadingImageCount.value > 0 ? true : false
  })

  // useSomething
  const statesStore = useStatesStore()

  const setUploading = () => {
    uploadingImageCount.value += 1
    statesStore.setLoading(true)
    sakiMessage({
      type: 'info',
      message: '图片上传中'
    })
  }
  const setUploaded = (isSuccess: boolean = true) => {
    uploadingImageCount.value -= 1
    if (uploadingImageCount.value <= 0) {
      uploadingImageCount.value = 0
      statesStore.setLoading(false)
    }
    if (isSuccess) {
      sakiMessage({
        type: 'success',
        message: '图片上传成功'
      })
    }
  }

  const uploadImage = async (uploadFile: UploadFile) => {
    if (uploadFile.raw === undefined) {
      throw new Error('没有文件')
    }

    // check file type and size
    const { allowedTypes, typeError, maxSize, sizeError } = imageRule
    if (!allowedTypes.includes(uploadFile.raw.type)) {
      sakiMessage({
        type: 'error',
        message: typeError
      })
      throw new Error(typeError)
    }
    if (uploadFile.raw.size > maxSize) {
      sakiMessage({
        type: 'error',
        message: sizeError
      })
      throw new Error(sizeError)
    }

    // upload image
    setUploading()
    const res = await imageUploadApi(uploadFile.raw).catch((e) => {
      setUploaded(false)
      throw e
    })
    setUploaded()
    // reGetImages()
    const resImage = res.data.data
    manageAfterUploadImage(resImage)

    return resImage
  }

  return {
    isImageUploading,
    uploadImage
  }
}
