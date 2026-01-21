import { profileGetAllApi } from '@/api'
import { computed, ref } from 'vue'
import type { ProfileStoreModuleDependencies } from '..'
import type { ProfileResData } from '@/types'

export const useLoadModule = (dependencies: ProfileStoreModuleDependencies) => {
  const { postNumber, imageNumber, profile } = dependencies

  const loadingMark = ref<boolean>(false)
  const isLoading = computed(() => loadingMark.value)

  // 初始化时调用这个，区别在于设置了loadingMark，控制页面的一些数据将因此重置
  const loadAll = async () => {
    loadingMark.value = true
    await load()
    loadingMark.value = false
  }
  // 不想让控制页面数据重置时调用这个
  const load = async () => {
    const res = await profileGetAllApi()
    postNumber.value = res.data.data.data.post
    imageNumber.value = res.data.data.data.image
    profile.value = res.data.data.store
  }

  const loadProfileByRes = (resData: ProfileResData) => {
    profile.value = resData.store
  }

  // const loadAvatarArrayByRes = (resData: ProfileResData) => {
  //   if (!profile.value) {
  //     loadProfileByRes(resData)
  //     return
  //   }
  //   profile.value.avatarArray = resData.store.avatarArray
  // }

  return {
    isLoading,
    loadAll,
    load,
    loadProfileByRes
    // loadAvatarArrayByRes
  }
}
