import {
  postControlForwardSettingPostCountApi,
  postControlGetForwardApi
} from '@/api'
import type { ForwardStoreModuleDependencies } from '..'
import type {
  PostControlForwardSettingPostCountData,
  PostControlGetForwardData
} from '@/types'
import { computed, ref } from 'vue'

export const useLoadModule = (dependencies: ForwardStoreModuleDependencies) => {
  const { store, forwardSettingPostCount } = dependencies

  const loadingMark = ref<boolean>(false)
  const isLoading = computed(() => loadingMark.value)

  const loadFirst = async () => {
    loadingMark.value = true
    await load()
    loadingMark.value = false
  }

  const load = async () => {
    const res = await postControlGetForwardApi()
    loadByData(res.data.data)
  }

  const loadByData = (data: PostControlGetForwardData) => {
    store.value = data.forwardStore
  }

  const forwardSettingPostCountLoad = async () => {
    const res = await postControlForwardSettingPostCountApi()
    forwardSettingPostCountLoadByData(res.data.data)
  }
  const forwardSettingPostCountLoadByData = async (
    data: PostControlForwardSettingPostCountData
  ) => {
    forwardSettingPostCount.value = data
  }
  const forwardSettingPostCountLoadingMark = ref(false)
  const isForwardSettingPostCountLoading = computed(
    () => forwardSettingPostCountLoadingMark.value
  )
  const forwardSettingPostCountLoadHandleLoading = async () => {
    forwardSettingPostCountLoadingMark.value = true
    await forwardSettingPostCountLoad().catch(() => {})
    forwardSettingPostCountLoadingMark.value = false
  }

  return {
    isLoading,
    loadFirst,
    load,
    loadByData,
    forwardSettingPostCountLoad,
    forwardSettingPostCountLoadByData,
    forwardSettingPostCountLoadHandleLoading,
    isForwardSettingPostCountLoading
  }
}
