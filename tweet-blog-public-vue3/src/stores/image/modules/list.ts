import { imageGetByCursorApi } from '@/api'
import { imageConfig } from '@/config'
import { useStatesStore } from '@/stores'
import type { ImageStoreData } from '@/types'
import { computed, ref, type Ref } from 'vue'

export const useListModule = (dependencies: {
  imageList: Ref<ImageStoreData[]>
}) => {
  // data
  const { imageList } = dependencies

  const cursor = ref('')
  const haveMoreMark = ref(false)
  const isHaveMore = computed(() => {
    return haveMoreMark.value
  })

  // limit show amounts
  const startLimitedAmounts = imageConfig.limitShow.startAmounts
  const limitedAmounts = ref(startLimitedAmounts)
  const limitedList = computed(() => {
    return imageList.value.slice(0, limitedAmounts.value)
  })

  // useSomething
  const statesStore = useStatesStore()

  // GET image
  const getImages = async () => {
    if (!haveMoreMark.value) {
      return
    }
    statesStore.setImageLoading(true)
    let res
    try {
      res = await imageGetByCursorApi(cursor.value)
    } catch (error) {
      return false
    } finally {
      statesStore.setImageLoading(false)
    }

    const resImages = res.data.data
    // const resImages: typeof res.data.data = []
    if (resImages.length < imageConfig.imageNumInOnceRequest) {
      haveMoreMark.value = false
    }

    if (cursor.value === '') {
      imageList.value = resImages
    } else {
      imageList.value.push(...resImages)
    }

    if (resImages.length === 0) {
      return false
    }
    cursor.value = resImages[resImages.length - 1].id
    return true
  }

  const reGetImages = async () => {
    cursor.value = ''
    haveMoreMark.value = true
    resetLimited()
    await getImages()
  }

  // scroll to load more
  const loadingLimitedMark = ref(false)
  const isLoadingLimited = computed(() => {
    return loadingLimitedMark.value || statesStore.isLoadingImage
  })
  const loadLimited = async () => {
    if (isLoadingLimited.value) {
      return
    }
    loadingLimitedMark.value = true
    limitedAmounts.value += imageConfig.limitShow.limitAmounts
    if (limitedAmounts.value > imageList.value.length) {
      await getImages()
    }
    loadingLimitedMark.value = false
  }
  const resetLimited = () => {
    limitedAmounts.value = startLimitedAmounts
  }
  const isHaveMoreLimited = computed(() => {
    return isHaveMore.value || imageList.value.length > limitedAmounts.value
  })

  return {
    getImages,
    reGetImages,
    limitedList,
    loadLimited,
    resetLimited,
    isHaveMore,
    isHaveMoreLimited,
    isLoadingLimited
  }
}
