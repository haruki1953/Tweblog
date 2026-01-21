import { formatTimeAgo } from '@vueuse/core'

// timeUtils.js

/*
 * 将时间字符串转换为本地时间格式
 * @param {(string|Date)} time 时间字符串或Date对象，例如 "2024-02-29T10:05:34.089Z"
 * @returns {string} 格式化后的本地时间字符串，例如 "2024-02-29 10:05"
 */
export const formatTime = (time: string | Date | null): string | null => {
  if (!time) return null

  const date = new Date(time)

  // 检查日期对象是否有效
  if (Number.isNaN(date.getTime())) {
    return null
  }

  const localTime = date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false // 使用24小时制
  })
  // 将日期格式从 "yyyy/MM/dd" 改为 "yyyy-MM-dd"
  return localTime.replace(/\//g, '-')
}

/*
 * 将时间字符串转换为本地日期字符串
 * @param {(string|Date)} time 时间字符串或Date对象，例如 "2024-02-29T10:05:34.089Z"
 * @returns {string} 格式化后的本地日期字符串，例如 "2024-02-29"
 */
export const formatDate = (time: string | Date | null): string | null => {
  if (!time) return null

  const date = new Date(time)

  // 检查日期对象是否有效
  if (Number.isNaN(date.getTime())) {
    return null
  }

  const localDate = date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
  // 将日期格式从 "yyyy/MM/dd" 改为 "yyyy-MM-dd"
  return localDate.replace(/\//g, '-')
}

// 日期四舍五入
export const dateRound = (date: Date): Date => {
  // 舍入到前一天的起始时间
  const previousDay = new Date(date)
  previousDay.setHours(0, 0, 0, 0)

  // 舍入到后一天的起始时间
  const nextDay = new Date(date)
  nextDay.setDate(nextDay.getDate() + 1)
  nextDay.setHours(0, 0, 0, 0)

  // 计算时间差
  const diffPrevious = Math.abs(date.getTime() - previousDay.getTime())
  const diffNext = Math.abs(date.getTime() - nextDay.getTime())

  // 选择时间差较小的日期
  if (diffPrevious < diffNext) {
    return previousDay
  } else {
    return nextDay
  }
}

// 将日期表示为过去的时间
const formatTimeAgoChsMessages = {
  justNow: '刚刚',
  past: (n: string | number) => `${n}前`,
  future: (n: string | number) => `${n}后`,
  month: (n: number, past?: boolean) =>
    n === 1 ? (past ? '上个月' : '下个月') : `${n}个月`,
  year: (n: number, past?: boolean) =>
    n === 1 ? (past ? '去年' : '明年') : `${n}年`,
  // day: (n: number, past?: boolean) =>
  //   n === 1 ? (past ? '昨天' : '明天') : `${n}天`,
  day: (n: number) => `${n}天`,
  week: (n: number, past?: boolean) =>
    n === 1 ? (past ? '上周' : '下周') : `${n}周`,
  hour: (n: number) => `${n}小时`,
  minute: (n: number) => `${n}分钟`,
  second: (n: number) => `${n}秒`,
  invalid: '无效时间'
}
export const formatTimeAgoChs = (dateString: string): string => {
  const date = new Date(dateString)
  return formatTimeAgo(date, { messages: formatTimeAgoChsMessages, max: 'day' })
}

/**
 * 将秒数转换为易读的时间长度字符串，如 "1年3个月" 或 "2小时15分钟"。
 * @param seconds - 输入的时间长度（以秒为单位）。
 * @param unitLength - 可选参数，控制返回字符串中的时间单位数量。
 * 例如，传入 2 则返回 "1年3个月" 或 "2小时15分钟"。
 * 如果为 0 或未传入，则显示所有单位。
 */
const formatDurationUnits = [
  { label: '年', seconds: 365 * 24 * 60 * 60 },
  { label: '个月', seconds: 30 * 24 * 60 * 60 },
  { label: '天', seconds: 24 * 60 * 60 },
  { label: '小时', seconds: 60 * 60 },
  { label: '分钟', seconds: 60 },
  { label: '秒', seconds: 1 }
]
export const formatDuration = (
  seconds: number,
  unitLength: number = 0
): string => {
  const units = formatDurationUnits

  const result: string[] = []
  let remainingSeconds = seconds
  let addedUnits = 0

  for (const { label, seconds: unitSeconds } of units) {
    const value = Math.floor(remainingSeconds / unitSeconds)
    remainingSeconds %= unitSeconds

    if (value > 0) {
      result.push(`${value}${label}`)
      addedUnits++
    }

    // 如果达到了限制的单位长度并且没有后续单位，处理四舍五入
    if (unitLength && addedUnits === unitLength) {
      if (remainingSeconds >= unitSeconds / 2) {
        result[result.length - 1] = `${value + 1}${label}`
      }
      break
    }
  }

  return result.length > 0 ? result.join('') : '0秒'
}
