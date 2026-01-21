import { type TaskImportPart, type TaskImportItem, type TaskBaseItemOnlyRequiredTotalCount } from '@/types'
import { v4 as uuidv4 } from 'uuid'
import { store, save } from './denpendencies'
import { cloneDeep } from 'lodash'
import { taskStatusMap } from '@/configs'

// type TaskImportItem = TaskStore['taskImportList'][number]

type TaskImportItemForCreateData = TaskBaseItemOnlyRequiredTotalCount & TaskImportPart
type TaskImportItemForUpdateData = Partial<TaskImportItem>

// 任务开始时，创建任务记录
export const taskImportCreate = (data: TaskImportItemForCreateData) => {
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

  const taskImportItem = {
    uuid,
    startedAt,
    updatedAt,
    totalCount,
    completedCount,
    status
  }
  storeNew.taskImportList.push(taskImportItem)

  save(storeNew)
  return taskImportItem
}

export const taskImportRead = () => {
  return store.taskImportList
}

export const taskImportUpdate = (uuid: string, data: TaskImportItemForUpdateData) => {
  const storeNew = cloneDeep(store)

  const findTaskImportItemIndex = storeNew.taskImportList.findIndex(i => i.uuid === uuid)
  if (findTaskImportItemIndex === -1) {
    return null
  }
  const findTaskImportItem = storeNew.taskImportList[findTaskImportItemIndex]

  const taskImportItem = {
    ...findTaskImportItem,
    updatedAt: new Date().toISOString(),
    ...data
  }
  storeNew.taskImportList[findTaskImportItemIndex] = taskImportItem

  save(storeNew)
  return taskImportItem
}

export const taskImportDelete = (uuid: string) => {
  const storeNew = cloneDeep(store)

  const findTaskImportItemIndex = storeNew.taskImportList.findIndex(i => i.uuid === uuid)
  if (findTaskImportItemIndex === -1) {
    return null
  }
  const findTaskImportItem = storeNew.taskImportList[findTaskImportItemIndex]

  storeNew.taskImportList.splice(findTaskImportItemIndex, 1)

  save(storeNew)
  return findTaskImportItem
}
