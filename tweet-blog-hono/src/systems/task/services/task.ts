import { cloneDeep } from 'lodash'
import { save, store } from './denpendencies'
import { taskStatusMap } from '@/configs'
import { taskImportDelete, taskImportUpdate } from './task-import'
import { taskForwardDelete, taskForwardUpdate } from './task-forward'

export const taskStore = () => {
  const { taskImportList, taskForwardList } = store
  return {
    taskImportList,
    taskForwardList
  }
}

// 在后端启动时，将所有 running 的任务改为 stopped
export const resetTasksRunningToStopped = () => {
  const storeNew = cloneDeep(store)

  // 导入任务
  let taskImportRunningCount = 0
  for (const taskImportItem of storeNew.taskImportList) {
    if (taskImportItem.status === taskStatusMap.running.key) {
      taskImportItem.status = taskStatusMap.stopped.key
      taskImportRunningCount += 1
    }
  }
  // 转发任务
  let taskForwardRunningCount = 0
  for (const taskForwardItem of storeNew.taskForwardList) {
    if (taskForwardItem.status === taskStatusMap.running.key) {
      taskForwardItem.status = taskStatusMap.stopped.key
      taskForwardRunningCount += 1
    }
  }

  save(storeNew)
  return {
    taskImportRunningCount,
    taskForwardRunningCount
  }
}

export const taskComplete = (uuid: string) => {
  const findTaskImport = store.taskImportList.find(i => i.uuid === uuid)
  if (findTaskImport != null) {
    taskImportUpdate(uuid, {
      status: taskStatusMap.completed.key
    })
  }
  const findTaskForward = store.taskForwardList.find(i => i.uuid === uuid)
  if (findTaskForward != null) {
    taskForwardUpdate(uuid, {
      status: taskStatusMap.completed.key
    })
  }
}
export const taskAbort = (uuid: string) => {
  const findTaskImport = store.taskImportList.find(i => i.uuid === uuid)
  if (findTaskImport != null) {
    taskImportUpdate(uuid, {
      status: taskStatusMap.aborted.key
    })
  }
  const findTaskForward = store.taskForwardList.find(i => i.uuid === uuid)
  if (findTaskForward != null) {
    taskForwardUpdate(uuid, {
      status: taskStatusMap.aborted.key
    })
  }
}
export const taskDelete = (uuid: string) => {
  const findTaskImport = store.taskImportList.find(i => i.uuid === uuid)
  if (findTaskImport != null) {
    taskImportDelete(uuid)
  }
  const findTaskForward = store.taskForwardList.find(i => i.uuid === uuid)
  if (findTaskForward != null) {
    taskForwardDelete(uuid)
  }
}
export const taskIsRunning = (uuid: string) => {
  const findTaskImport = store.taskImportList.find(i => i.uuid === uuid)
  if (findTaskImport != null && findTaskImport.status === taskStatusMap.running.key) {
    return true
  }
  const findTaskForward = store.taskForwardList.find(i => i.uuid === uuid)
  if (findTaskForward != null && findTaskForward.status === taskStatusMap.running.key) {
    return true
  }
  return false
}
