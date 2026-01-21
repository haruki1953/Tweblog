import { type TaskForwardPart, type TaskForwardItem, type TaskBaseItemOnlyRequiredTotalCount } from '@/types'
import { v4 as uuidv4 } from 'uuid'
import { store, save } from './denpendencies'
import { cloneDeep } from 'lodash'
import { taskStatusMap } from '@/configs'

type TaskForwardItemForCreateData = TaskBaseItemOnlyRequiredTotalCount & TaskForwardPart
type TaskForwardItemForUpdateData = Partial<TaskForwardItem>

// 任务开始时，创建任务记录
export const taskForwardCreate = (data: TaskForwardItemForCreateData) => {
  const {
    uuid = uuidv4(),
    startedAt = new Date().toISOString(),
    updatedAt = new Date().toISOString(),
    totalCount,
    completedCount = 0,
    // 默认是运行中
    status = taskStatusMap.running.key
  } = data

  const storeNew = cloneDeep(store)

  const taskForwardItem = {
    ...data,
    uuid,
    startedAt,
    updatedAt,
    totalCount,
    completedCount,
    status
  }
  storeNew.taskForwardList.push(taskForwardItem)

  save(storeNew)
  return taskForwardItem
}

export const taskForwardRead = () => {
  return store.taskForwardList
}

export const taskForwardUpdate = (uuid: string, data: TaskForwardItemForUpdateData) => {
  const storeNew = cloneDeep(store)

  const findTaskForwardItemIndex = storeNew.taskForwardList.findIndex(i => i.uuid === uuid)
  if (findTaskForwardItemIndex === -1) {
    return null
  }
  const findTaskForwardItem = storeNew.taskForwardList[findTaskForwardItemIndex]

  const taskForwardItem = {
    ...findTaskForwardItem,
    updatedAt: new Date().toISOString(),
    ...data
  }
  storeNew.taskForwardList[findTaskForwardItemIndex] = taskForwardItem

  save(storeNew)
  return taskForwardItem
}

export const taskForwardDelete = (uuid: string) => {
  const storeNew = cloneDeep(store)

  const findTaskForwardItemIndex = storeNew.taskForwardList.findIndex(i => i.uuid === uuid)
  if (findTaskForwardItemIndex === -1) {
    return null
  }
  const findTaskForwardItem = storeNew.taskForwardList[findTaskForwardItemIndex]

  storeNew.taskForwardList.splice(findTaskForwardItemIndex, 1)

  save(storeNew)
  return findTaskForwardItem
}
