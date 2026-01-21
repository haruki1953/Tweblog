// 自定义轮询退避逻辑
const pollingIntervalBackoffCalc = (data: {
  // 未更新计数，从 1 开始累加
  notUpdateCount: number
}) => {
  const { notUpdateCount } = data
  // 例如：线性退避，每次增加3秒，最大30秒
  const baseInterval = 3000 // 基础间隔时间
  const maxInterval = 30000 // 最大间隔时间
  const interval = baseInterval * notUpdateCount
  return Math.max(Math.min(interval, maxInterval), baseInterval)
}

export const taskConfig = {
  pollingIntervalBackoffCalc,
  pollingNotUpdateCountStartNumber: 1
} as const

export const taskStatusMap = {
  // 运行中
  running: {
    key: 'running'
  },
  // 已完成
  completed: {
    key: 'completed'
  },
  // 已中止
  aborted: {
    key: 'aborted'
  },
  // 由于服务器停止导致的停止
  stopped: {
    key: 'stopped'
  }
} as const
// 这个手动写出来的原因是，zod枚举需要字面量类型数组
export const taskStatusEnum = [
  'running',
  'completed',
  'aborted',
  'stopped'
] as const

// 类型检查以确保 taskStatusEnum 与 taskStatusMap 的值是同步的
export type TaskStatusMapValues =
  | (typeof taskStatusMap)[keyof typeof taskStatusMap]['key']
  | keyof typeof taskStatusMap
export type TaskStatusEnumValues = (typeof taskStatusEnum)[number]
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const taskStatusMapTest: TaskStatusMapValues[] = [] as TaskStatusEnumValues[]
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const taskStatusEnumTest: TaskStatusEnumValues[] = [] as TaskStatusMapValues[]
