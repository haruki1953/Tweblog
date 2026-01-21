import type { PostPoolItem, PostData } from '@/types'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useListModule, usePoolModule, useReadModule } from './modules'

export const usePostStore = defineStore(
  'tweblog-public-post',
  () => {
    // 多Module共享数据
    const postList = ref<PostData[][]>([])
    const postPool = ref<PostPoolItem[]>([])

    // listModule
    const listModule = useListModule({
      postList
    })

    // poolModule, for PostPage
    const poolModule = usePoolModule({
      postPool
    })

    // needRegetMark for when data change
    const needRegetMark = ref(false)
    const isNeedReget = computed(() => needRegetMark.value)
    const setNeedReget = (value: boolean = true) => {
      needRegetMark.value = value
      if (value) {
        poolModule.resetPostRequested()
      }
    }

    // readModule
    const readModule = useReadModule({
      postList
    })

    return {
      ...listModule,
      ...poolModule,
      ...readModule,
      postList,
      postPool,
      setNeedReget,
      isNeedReget
    }
  },
  {
    persist: true // 持久化
  }
)
