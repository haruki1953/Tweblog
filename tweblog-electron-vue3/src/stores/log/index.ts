import { defineStore } from 'pinia'
import { computed, ref, type Ref } from 'vue'
import type { LogData } from '@/types'
import { useListModule } from './modules/list'

export type LogStoreModuleDependencies = {
  dataList: Ref<LogData[]>
}

export const useLogStore = defineStore(
  'tweblog-log',
  () => {
    const dataList = ref<LogData[]>([])

    // needRegetMark for when data change
    const needRegetMark = ref(false)
    const isNeedReget = computed(() => needRegetMark.value)
    const setNeedReget = (value: boolean = true) => {
      needRegetMark.value = value
    }

    const dependencies = {
      dataList
    }

    const listModule = useListModule(dependencies)

    return {
      ...listModule,
      dataList,
      setNeedReget,
      isNeedReget
    }
  },
  {
    persist: true // 持久化
  }
)
