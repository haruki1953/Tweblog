import { adminGetTaskApi } from '@/api'
import type { TaskStoreModuleDependencies } from './dependencies'
import type { BackendTaskStore } from '@/types'
import { computed, ref, type Ref } from 'vue'
import { loadByData_handleTaskImportListPart } from './import-task'
import { taskConfig } from '@/config'
import { delayWithInterrupt } from '@/utils'
import { useStatesStore } from '@/stores'
import { loadByData_handleTaskForwardListPart } from './forward-task'

export const useLoadModule = (dependencies: TaskStoreModuleDependencies) => {
  const { store } = dependencies

  // const isPollingMark = ref(false)
  // const isPolling = computed(() => isPollingMark.value)
  // 将轮询标识转移至了statesStore，以便控制全局装饰点动画
  const statesStore = useStatesStore()
  const isPollingMark = computed({
    get: () => statesStore.isTaskPolling,
    set: (value: boolean) => {
      statesStore.setTaskPolling(value)
    }
  })
  const isPolling = computed(() => isPollingMark.value)

  const load = async () => {
    const res = await adminGetTaskApi()
    const info = loadByData(res.data.data)
    return info
  }

  const loadByData = (data: { taskStore: BackendTaskStore }) => {
    const { taskStore: newStore } = data

    const dataForHandle = {
      oldStore: store.value,
      newStore
    }
    // 处理 taskImportList
    const handleTaskImportListPartInfo =
      loadByData_handleTaskImportListPart(dataForHandle)

    // 处理 taskForwardList
    const handleTaskForwardListPartInfo =
      loadByData_handleTaskForwardListPart(dataForHandle)

    // 赋值store
    store.value = newStore

    const info = {
      // 是否存在运行中的任务
      isHaveRunning:
        handleTaskImportListPartInfo.isHaveRunning ||
        handleTaskForwardListPartInfo.isHaveRunning,
      // 是否存在已更新的任务
      isHaveUpdated:
        handleTaskImportListPartInfo.isHaveUpdated ||
        handleTaskForwardListPartInfo.isHaveUpdated,
      // 是否存在刚完成的任务
      isNewlyCompleted:
        handleTaskImportListPartInfo.isNewlyCompleted ||
        handleTaskForwardListPartInfo.isNewlyCompleted
    }
    return info
  }

  // 记录轮询时无更新的次数，实现退避
  let notUpdateCount = taskConfig.pollingNotUpdateCountStartNumber
  // 轮询
  const polling = async () => {
    // 防止多个轮询同时存在
    if (isPolling.value) {
      // 轮询中再次调用的话，重置退避
      notUpdateCount = taskConfig.pollingNotUpdateCountStartNumber
      return
    }
    isPollingMark.value = true
    try {
      // 如果存在运行中的任务则轮询
      let isHaveRunning = true
      while (isHaveRunning) {
        // 轮询间隔
        const pollingInterval = taskConfig.pollingIntervalBackoffCalc({
          notUpdateCount
        })
        const notUpdateCountNow = notUpdateCount
        await delayWithInterrupt({
          durationMs: pollingInterval,
          // 中断条件：notUpdateCount变化
          interruptCondition: () => notUpdateCountNow !== notUpdateCount
        })

        const info = await load().catch(() => null)
        if (info == null) {
          // 请求出错，重置 notUpdateCount 并继续
          notUpdateCount = taskConfig.pollingNotUpdateCountStartNumber
          continue
        }
        isHaveRunning = info.isHaveRunning
        notUpdateCount += 1
        if (info.isHaveUpdated) {
          // 有更新，重置 notUpdateCount
          notUpdateCount = taskConfig.pollingNotUpdateCountStartNumber
        }
      }
    } finally {
      isPollingMark.value = false
    }
  }

  const pollLoad = async () => {
    // 会等待一次请求
    const info = await load()
    if (info.isHaveRunning) {
      // 之后异步轮询
      polling()
    }
    return info
  }

  const pollLoadByData = (data: { taskStore: BackendTaskStore }) => {
    const info = loadByData(data)
    if (info.isHaveRunning) {
      // 之后异步轮询
      polling()
    }
    return info
  }

  return {
    pollLoad,
    pollLoadByData,
    isPolling
  }
}
