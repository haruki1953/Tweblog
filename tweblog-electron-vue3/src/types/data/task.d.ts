import type { ForwardingOrderEnumValues, TaskStatusEnumValues } from '@/config'

type TaskBaseItem = {
  status: TaskStatusEnumValues
  uuid: string
  startedAt: string
  updatedAt: string
  totalCount: number
  completedCount: number
}

type TaskImportPart = {}
type TaskImportItem = TaskImportPart & TaskBaseItem

type TaskForwardPart = {
  forwardConfigId: string
  forwardingOrder: ForwardingOrderEnumValues
  forwardingNumber: number
  forwardingIntervalSeconds: number
  lastForwardedPostId: string | null
}
type TaskForwardItem = TaskForwardPart & TaskBaseItem

export type BackendTaskStore = {
  taskImportList: TaskImportItem[]
  taskForwardList: TaskForwardItem[]
}
