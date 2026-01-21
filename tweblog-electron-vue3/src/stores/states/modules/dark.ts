import { useDark } from '@vueuse/core'
import { computed, ref, watch } from 'vue'

export const useDarkModule = () => {
  const isDark = useDark({ disableTransition: false })
  const markDarkTransitioning = ref(false)
  const isDarkTransitioning = computed(() => markDarkTransitioning.value)
  let timeoutId: number | null = null

  watch(isDark, () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId) // 清除之前的定时器
    }
    markDarkTransitioning.value = true // 立即标记为正在切换
    timeoutId = setTimeout(() => {
      markDarkTransitioning.value = false // 0.5 秒后取消
      timeoutId = null // 重置定时器 ID
    }, 500)
  })

  return { isDarkTransitioning }
}
