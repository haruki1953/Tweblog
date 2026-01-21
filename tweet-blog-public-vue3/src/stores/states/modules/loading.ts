import { computed, ref } from 'vue'

export const useLoadingModule = () => {
  const loadingMark = ref(false)
  const loadingPostMark = ref(false)
  const loadingImageMark = ref(false)
  const loadingPostIds = ref<string[]>([])
  // dataFirstLoadService
  // 是否正在加载初始化数据
  const loadingFirstDataMark = ref(false)
  // 是否是第一次加载初始化数据（指的是在此浏览器上第一次访问网站）
  const isFirstLoadFirstData = ref(true)

  const isLoadingData = computed(() => {
    if (
      loadingMark.value ||
      loadingPostMark.value ||
      loadingImageMark.value ||
      loadingFirstDataMark.value ||
      loadingPostIds.value.length > 0
    ) {
      return true
    } else {
      return false
    }
  })
  const isLoadingPost = computed(() => {
    return loadingPostMark.value
  })
  const isLoadingImage = computed(() => {
    return loadingImageMark.value
  })
  const setLoading = (isLoading: boolean) => {
    loadingMark.value = isLoading
  }
  const setPostLoading = (isLoading: boolean) => {
    loadingPostMark.value = isLoading
  }
  const setImageLoading = (isLoading: boolean) => {
    loadingImageMark.value = isLoading
  }
  const setPostIdLoading = (id: string) => {
    loadingPostIds.value.push(id)
  }
  const setPostIdLoaded = (id: string) => {
    loadingPostIds.value = loadingPostIds.value.filter((i) => i !== id)
  }
  const isLoadingPostId = (id: string) => {
    const loadingId = loadingPostIds.value.find((i) => i === id)
    if (loadingId === undefined) {
      return false
    } else {
      return true
    }
  }
  // dataFirstLoadService
  const setFirstDataLoading = (isLoading: boolean) => {
    loadingFirstDataMark.value = isLoading
    isFirstLoadFirstData.value = false
  }

  return {
    isLoadingData,
    isLoadingImage,
    isLoadingPost,
    isFirstLoadFirstData,
    setLoading,
    setPostLoading,
    setImageLoading,
    setPostIdLoading,
    setPostIdLoaded,
    isLoadingPostId,
    setFirstDataLoading
  }
}
