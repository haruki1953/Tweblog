import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useAltDialogModule, useListModule } from './modules'
import type { ImageStoreData } from '@/types'

export const useImageStore = defineStore(
  'tweblog-public-image',
  () => {
    // data
    const imageList = ref<ImageStoreData[]>([])

    // needRegetMark for when data change
    const needRegetMark = ref(false)
    const isNeedReget = computed(() => needRegetMark.value)
    const setNeedReget = (value: boolean = true) => {
      needRegetMark.value = value
    }

    // useModules
    const listModule = useListModule({
      imageList
    })
    const altDialogModule = useAltDialogModule()

    return {
      imageList,
      isNeedReget,
      setNeedReget,
      ...listModule,
      ...altDialogModule
    }
  },
  {
    persist: true // 持久化
  }
)
