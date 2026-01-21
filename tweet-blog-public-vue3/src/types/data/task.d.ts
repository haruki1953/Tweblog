export type BackendTaskCache = {
  importTaskList: {
    uuid: string
    startAt: string
    totalCount: number
    completedCount: number
  }[]
}
