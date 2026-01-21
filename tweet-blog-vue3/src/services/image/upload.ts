import { ref, type ComputedRef } from 'vue'
import type { Image } from '@/types'
import { useImageStore, useProfileStore } from '@/stores'
import type { UploadFile, UploadFiles, UploadUserFile } from 'element-plus'

export const useImageUploadService = (dependencies: {
  propsonUploaded: ComputedRef<(resImage: Image) => void>
}) => {
  const { propsonUploaded } = dependencies

  const imageStroe = useImageStore()
  const profileStore = useProfileStore()

  // help to mark uploading count
  const files = ref<UploadUserFile[]>([])

  const uploadImage = async (
    uploadFile: UploadFile,
    uploadFiles: UploadFiles
  ) => {
    // console.log('uploadFile', uploadFile)
    // console.log('uploadFiles', uploadFiles, uploadFiles.length)
    // if have images are uploading, wait a little
    if (uploadFiles.length > 1) {
      await new Promise((resolve) =>
        setTimeout(resolve, (uploadFiles.length - 1) * 500)
      )
    }
    const resImage = await imageStroe.uploadImage(uploadFile)
    propsonUploaded.value(resImage)
    files.value.shift()
    // load image namber
    profileStore.loadAll().catch(() => {})
  }

  return {
    files,
    uploadImage
  }
}
