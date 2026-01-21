export const fetchProxyConfig = {
  testUrlDefault: 'https://www.google.com'
} as const

export const forwardingConfig = {
  // 转发中断的检查间隔 10秒
  interruptCheckInterval: 10000
} as const

// （自动转发）转发顺序配置
export const forwardingOrderMap = {
  'new-to-old': {
    key: 'new-to-old'
  },
  'old-to-new': {
    key: 'old-to-new'
  }
} as const
export const forwardingOrderEnum = ['new-to-old', 'old-to-new'] as const

// 类型检查以确保 forwardingOrderEnum 与 forwardingOrderMap 的值是同步的
export type ForwardingOrderMapValues =
  | (typeof forwardingOrderMap)[keyof typeof forwardingOrderMap]['key']
  | keyof typeof forwardingOrderMap
export type ForwardingOrderEnumValues = (typeof forwardingOrderEnum)[number]
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const forwardingOrderMapTest: ForwardingOrderMapValues[] = [] as ForwardingOrderEnumValues[]
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const forwardingOrderEnumTest: ForwardingOrderEnumValues[] =
  [] as ForwardingOrderMapValues[]
