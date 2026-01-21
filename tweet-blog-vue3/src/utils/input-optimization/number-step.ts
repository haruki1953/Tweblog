import { computed, type Ref } from 'vue'

// 秒数动态步进常数，从大到小，超过某值的两倍就按某值步进
const secondStepUnits = [
  // 为了方便步进，年以360天记
  // 年
  360 * 24 * 60 * 60,
  // 月
  30 * 24 * 60 * 60,
  // 15天
  15 * 24 * 60 * 60,
  // 天
  24 * 60 * 60,
  // 12小时
  12 * 60 * 60,
  // 小时
  60 * 60,
  // 十分钟
  10 * 60,
  // 分钟
  60,
  // 十秒
  10,
  // 秒
  1
]
// 秒数输入框动态步进
export const useInputNumberStepSecondOptimization = (dependencies: {
  refNumber: Ref<number>
}) => {
  const { refNumber } = dependencies
  const optimizationStep = computed(() => {
    const secondVal = refNumber.value
    for (const unit of secondStepUnits) {
      if (secondVal >= 2 * unit) {
        return unit
      }
    }
    return 1
  })
  const optimizationOnBlur = () => {
    // 失焦时四舍五入为整数，以此代替严格步进
    refNumber.value = Math.round(refNumber.value)
  }
  return {
    optimizationStep,
    optimizationOnBlur
  }
}

// 十进制整数动态步进
export const useInputNumberStepIntOptimization = (dependencies: {
  refNumber: Ref<number>
}) => {
  const { refNumber } = dependencies
  const optimizationStep = computed(() => {
    const numberVal = refNumber.value
    let step = 1
    while (numberVal >= 2 * 10 * step) {
      step *= 10
    }
    return step
  })
  const optimizationOnBlur = () => {
    // 失焦时四舍五入为整数，以此代替严格步进
    refNumber.value = Math.round(refNumber.value)
  }
  return {
    optimizationStep,
    optimizationOnBlur
  }
}
