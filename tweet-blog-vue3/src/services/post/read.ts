import { usePostStore } from '@/stores'
import type { PostData } from '@/types'
import { computed, type ComputedRef } from 'vue'

export const usePostReadService = (dependencies: {
  propsdata: ComputedRef<PostData>
  propsmini: ComputedRef<boolean>
}) => {
  const { propsdata, propsmini } = dependencies

  const postStore = usePostStore()

  const isRead = computed(() => {
    if (propsmini.value) {
      return true
    }
    if (propsdata.value.isDeleted) {
      return true
    }
    return postStore.readIsPostRead(propsdata.value)
  })
  const setRead = () => {
    if (propsmini.value) {
      return
    }
    if (propsdata.value.isDeleted) {
      return
    }
    postStore.readSetPostRead(propsdata.value)
  }

  return {
    isRead,
    setRead
  }
}
