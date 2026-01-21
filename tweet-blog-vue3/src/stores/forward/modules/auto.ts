import { forwardingConfig } from '@/config'
import { ref } from 'vue'

export const useAutoModule = () => {
  const autoLastUsedForwardingIntervalSeconds = ref<number>(
    forwardingConfig.defaultForwardingIntervalSeconds
  )
  const autoLastUsedForwardingIntervalSecondsSet = (value: number) => {
    autoLastUsedForwardingIntervalSeconds.value = value
  }
  return {
    autoLastUsedForwardingIntervalSeconds,
    autoLastUsedForwardingIntervalSecondsSet
  }
}
