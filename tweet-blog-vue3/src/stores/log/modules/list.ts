import { ref } from 'vue'
import type { LogStoreModuleDependencies } from '..'
import { computed } from 'vue'
import type { AdminLogGetByCursorQueryType } from '@/types'
import { logConfig } from '@/config'
import { adminLogGetByCursorApi } from '@/api'

export const useListModule = (dependencies: LogStoreModuleDependencies) => {
  const { dataList } = dependencies

  // cursor for pagination query
  const cursor = ref('')
  const isFirstRequest = computed(() => {
    return cursor.value === ''
  })
  const haveMoreMark = ref(false)
  const isHaveMore = computed(() => {
    return haveMoreMark.value
  })

  const isHaveMoreLimited = computed(() => {
    return isHaveMore.value || limitedList.value.length < dataList.value.length
  })

  const limitedAmounts = ref(logConfig.limitShow.startAmounts)
  const limitedList = computed(() =>
    dataList.value.slice(0, limitedAmounts.value)
  )
  const loadingLimitedMark = ref(false)
  const isLoadingLimited = computed(() => {
    return loadingLimitedMark.value
  })
  const resetLimited = () => {
    limitedAmounts.value = logConfig.limitShow.startAmounts
  }
  // scroll to load more
  const loadLimited = async () => {
    if (loadingLimitedMark.value) {
      return
    }
    loadingLimitedMark.value = true
    limitedAmounts.value += logConfig.limitShow.limitAmounts
    if (limitedAmounts.value > dataList.value.length) {
      await getData()
    }
    loadingLimitedMark.value = false
  }

  const query = ref<AdminLogGetByCursorQueryType>({})
  const querySet = (queryData: AdminLogGetByCursorQueryType) => {
    query.value = queryData
  }
  const queryValue = computed(() => query.value)

  const getData = async () => {
    if (!isHaveMore.value) {
      return false
    }
    let res
    try {
      res = await adminLogGetByCursorApi(cursor.value, query.value)
    } catch (error) {
      return false
    }

    const resData = res.data.data
    if (resData.length < logConfig.logCursorTakeNum) {
      haveMoreMark.value = false
    }

    if (cursor.value === '') {
      dataList.value = resData
    } else {
      dataList.value.push(...resData)
    }

    if (resData.length === 0) {
      return false
    }
    cursor.value = resData[resData.length - 1].id
    return true
  }

  const resetCursorInfo = () => {
    cursor.value = ''
    haveMoreMark.value = true
    // query.value = {}
    resetLimited()
  }
  const reGetData = async () => {
    resetCursorInfo()
    await getData()
  }

  return {
    isFirstRequest,
    isHaveMore,
    isHaveMoreLimited,
    limitedList,
    isLoadingLimited,
    resetLimited,
    loadLimited,
    querySet,
    queryValue,
    reGetData
  }
}
