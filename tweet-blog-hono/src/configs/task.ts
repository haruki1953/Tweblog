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
export const taskStatusEnum = ['running', 'completed', 'aborted', 'stopped'] as const

// 类型检查以确保 taskStatusEnum 与 taskStatusMap 的值是同步的
export type TaskStatusMapValues =
  | (typeof taskStatusMap)[keyof typeof taskStatusMap]['key']
  | keyof typeof taskStatusMap
export type TaskStatusEnumValues = (typeof taskStatusEnum)[number]
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const taskStatusMapTest: TaskStatusMapValues[] = [] as TaskStatusEnumValues[]
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const taskStatusEnumTest: TaskStatusEnumValues[] =
  [] as TaskStatusMapValues[]
