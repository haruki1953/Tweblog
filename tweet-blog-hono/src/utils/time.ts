/**
 * 异步延时函数，支持指定休眠时间并可传入中断条件函数
 * @param data.durationMs 休眠的毫秒数
 * @param data.interruptCondition 可选的中断条件函数，返回 true 时打断休眠
 * @param data.interruptCheckInterval 可选的中断检查间隔
 * @returns Promise
 */
export const delayWithInterrupt = async (data: {
  durationMs: number
  interruptCondition?: (remainingMs: number) => boolean
  interruptCheckInterval?: number
}) => {
  const {
    durationMs,
    interruptCondition = () => false,
    interruptCheckInterval = 1000
  } = data

  // 持续时间小于中断判断间隔，则直接简单的等待
  if (durationMs < interruptCheckInterval) {
    return await new Promise((resolve) => setTimeout(resolve, durationMs))
  }

  // 以中断判断间隔循环，并累减剩余时间
  let remainingMs = durationMs
  while (remainingMs > 0) {
    if (interruptCondition(remainingMs)) {
      // 中断条件为真，返回
      return
    }
    await new Promise((resolve) => setTimeout(resolve, interruptCheckInterval))
    remainingMs -= interruptCheckInterval
  }
}
