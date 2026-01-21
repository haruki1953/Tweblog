import { postDeleteApi, postUpdateApi } from '@/api'
import { useImageStore, usePostStore, useProfileStore } from '@/stores'
import type { PostData } from '@/types'
import { sakiMessage } from '@/utils'
import { ref, type ComputedRef, type ModelRef, type Ref } from 'vue'

export const usePostDeleteService = (dependencies: {
  propsdata: ComputedRef<PostData>
}) => {
  const { propsdata } = dependencies

  const postStore = usePostStore()

  const isDeleting = ref(false)
  const deletePost = async () => {
    isDeleting.value = true
    try {
      await postUpdateApi({ id: propsdata.value.id, isDeleted: true })
      sakiMessage({
        type: 'info',
        message: '已移至回收站'
      })
      postStore.updatePostListIsDeleted(propsdata.value.id, true)
      postStore.resetPostRequested()
    } finally {
      isDeleting.value = false
    }
  }

  const isRestoring = ref(false)
  const restorePost = async () => {
    isRestoring.value = true
    try {
      await postUpdateApi({ id: propsdata.value.id, isDeleted: false })
      sakiMessage({
        type: 'success',
        message: '已将推文还原'
      })
      postStore.updatePostListIsDeleted(propsdata.value.id, false)
      postStore.resetPostRequested()
    } finally {
      isRestoring.value = false
    }
  }

  return {
    isDeleting,
    deletePost,
    isRestoring,
    restorePost
  }
}

export const usePostDeleteEverlastService = (dependencies: {
  //
  propsdata: ComputedRef<PostData>
  modelIsDeleteEverlasting: ModelRef<boolean, string>
  isDeleteRelatedImage: Ref<boolean>
  close: () => void
}) => {
  //
  const { propsdata, modelIsDeleteEverlasting, isDeleteRelatedImage, close } =
    dependencies

  const imageStore = useImageStore()
  const postStore = usePostStore()
  const profileStore = useProfileStore()

  const deletePost = async () => {
    close()
    modelIsDeleteEverlasting.value = true
    try {
      // TODO 帖子永久删除对话框，可选是否删除图片
      const res = await postDeleteApi(propsdata.value.id, {
        delateImage: isDeleteRelatedImage.value ? 'true' : 'false'
      })
      sakiMessage({
        type: 'success',
        message: '推文已永久删除'
      })
      postStore.updatePostListToRemove(propsdata.value.id)
      postStore.resetPostRequested()
      if (res.data.data.deletedImages.find((i) => i != null)) {
        imageStore.setNeedReget()
      }
      await profileStore.loadAll()
    } finally {
      modelIsDeleteEverlasting.value = false
    }
  }

  return {
    //
    deletePost
  }
}
