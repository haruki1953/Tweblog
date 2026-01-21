import { postSendApi, postUpdateApi } from '@/api'
import {
  useImageStore,
  usePostStore,
  useProfileStore,
  useStatesStore
} from '@/stores'
import type { ImageStoreData, InfoBySendType, PostSendJsonType } from '@/types'
import { sakiGoBack, sakiMessage } from '@/utils'
import { ref, type ComputedRef, type Ref } from 'vue'
import { useRouter } from 'vue-router'

export const usePostSendService = (dependencies: {
  imagesData: Ref<ImageStoreData[]>
  formModel: Ref<PostSendJsonType>
  infoBySendType: ComputedRef<InfoBySendType>
}) => {
  const { imagesData, formModel, infoBySendType } = dependencies

  const statesStore = useStatesStore()
  const imageStore = useImageStore()
  const postStore = usePostStore()
  const router = useRouter()
  const profileStore = useProfileStore()

  const isSending = ref(false)

  const sendPost = async () => {
    isSending.value = true
    statesStore.setLoading(true)
    try {
      const images = imagesData.value.map((i) => i.id)
      await postSendApi({
        ...formModel.value,
        images
      })
      sakiMessage({
        type: 'success',
        message: '发送成功'
      })
      // 发送后，据情况设置是否需重新加载图片
      if (images.length > 0) {
        imageStore.setNeedReget()
      }
      // 重载帖子
      await Promise.all([postStore.reGetPosts(), profileStore.loadAll()])
      router.push({ name: 'home' })
    } finally {
      statesStore.setLoading(false)
      isSending.value = false
    }
  }

  const sendReply = async () => {
    if (!infoBySendType.value.data) {
      return
    }
    isSending.value = true
    statesStore.setLoading(true)
    try {
      const images = imagesData.value.map((i) => i.id)
      await postSendApi({
        ...formModel.value,
        images,
        parentPostId: infoBySendType.value.data.id
      })
      sakiMessage({
        type: 'success',
        message: '回复成功'
      })
      // 发送后，据情况设置是否需重新加载图片
      if (images.length > 0) {
        imageStore.setNeedReget()
      }
      await Promise.all([postStore.reGetPosts(), profileStore.loadAll()])
      postStore.resetPostRequested()
      sakiGoBack(router)
    } finally {
      statesStore.setLoading(false)
      isSending.value = false
    }
  }

  const sendUpdate = async () => {
    if (!infoBySendType.value.data) {
      return
    }
    isSending.value = true
    statesStore.setLoading(true)
    try {
      const images = imagesData.value.map((i) => i.id)
      const res = await postUpdateApi({
        ...formModel.value,
        id: infoBySendType.value.data.id,
        images
      })
      sakiMessage({
        type: 'success',
        message: '修改成功'
      })
      // 对于更新，多数情况都要重载图片
      imageStore.setNeedReget()
      // 重载帖子
      await Promise.all([postStore.reGetPosts(), profileStore.loadAll()])
      postStore.resetPostRequested()
      router.replace({
        name: 'post',
        params: { id: res.data.data.id }
      })
    } finally {
      statesStore.setLoading(false)
      isSending.value = false
    }
  }

  return {
    sendPost,
    sendReply,
    sendUpdate,
    isSending
  }
}
