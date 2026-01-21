<script setup lang="ts">
import { postControlForwardAutoApi } from '@/api'
import type ConfirmContainer from '@/components/layout/ConfirmContainer.vue'
import { forwardingOrderMap, type ForwardingOrderEnumValues } from '@/config'
import { useForwardStore, useTaskStore } from '@/stores'
import type { ForwardSettingItem } from '@/types'
import { formatDuration, useInputNumberStepSecondOptimization } from '@/utils'
import { computed, ref } from 'vue'

const props = defineProps<{
  item: ForwardSettingItem
  countInfo: {
    totalPostCount: number
    forwardSettingPostCount: number
  } | null
  toggleEdit: () => void
  isForwarding: boolean
}>()

const taskStore = useTaskStore()
const forwardStore = useForwardStore()

const forwardingNumberMax = computed(() => {
  if (props.countInfo == null) {
    return undefined
  }
  return (
    props.countInfo.totalPostCount - props.countInfo.forwardSettingPostCount
  )
})

// 转发顺序
const forwardingOrder = ref<ForwardingOrderEnumValues>(
  forwardingOrderMap['old-to-new'].key
)
// 转发个数
const forwardingNumber = ref(forwardingNumberMax.value || 1)
// 转发间隔
// 初始化时使用上次用的间隔时间
const forwardingIntervalSeconds = ref(
  forwardStore.autoLastUsedForwardingIntervalSeconds
)
const {
  // 秒数输入框动态步进
  optimizationStep: forwardingIntervalStep,
  // 失焦时四舍五入为整数
  optimizationOnBlur: forwardingIntervalOnBlur
} = useInputNumberStepSecondOptimization({
  refNumber: forwardingIntervalSeconds
})

const isSubmiting = ref(false)
const submit = async () => {
  // 保存间隔时间记录，以便下次使用
  forwardStore.autoLastUsedForwardingIntervalSecondsSet(
    forwardingIntervalSeconds.value
  )
  await refConfirmContainer.value?.confirm()
  isSubmiting.value = true
  try {
    const res = await postControlForwardAutoApi({
      forwardConfigId: props.item.uuid,
      forwardingOrder: forwardingOrder.value,
      forwardingNumber: forwardingNumber.value,
      forwardingIntervalSeconds: forwardingIntervalSeconds.value
    })
    taskStore.pollLoadByData(res.data.data)
    props.toggleEdit()
  } finally {
    isSubmiting.value = false
  }
}

const refConfirmContainer = ref<InstanceType<typeof ConfirmContainer> | null>(
  null
)
</script>
<template>
  <div
    class="forward-auto-form"
    v-loading="isForwarding"
    element-loading-background="var(--color-background-soft)"
  >
    <ConfirmContainer
      ref="refConfirmContainer"
      backgroundColor="var(--color-background-soft)"
      title="确认要开始自动转发吗？"
      size="small"
    >
      <!-- <div class="control-lable">自动转发未被转发的推文</div> -->
      <div class="form-box">
        <div class="form-row">
          <div class="control-radio">
            <el-radio-group v-model="forwardingOrder">
              <el-radio :value="forwardingOrderMap['old-to-new'].key">
                从旧到新
              </el-radio>
              <el-radio :value="forwardingOrderMap['new-to-old'].key">
                从新到旧
              </el-radio>
            </el-radio-group>
          </div>
        </div>
        <div class="form-row">
          <div class="input-lable">
            转发个数：将转发 {{ forwardingNumber }} 个未被转发的推文
          </div>
          <el-input-number
            v-model="forwardingNumber"
            :min="1"
            :max="forwardingNumberMax"
            step-strictly
            class="control-input"
            size="large"
          />
        </div>
        <div class="form-row second-input-box">
          <div class="input-lable">
            间隔时间：{{ formatDuration(forwardingIntervalSeconds, 2) }}
          </div>
          <el-input-number
            v-model="forwardingIntervalSeconds"
            :min="1"
            :step="forwardingIntervalStep"
            @blur="forwardingIntervalOnBlur"
            class="control-input"
            size="large"
            title=""
          />
          <div class="second-mark">秒</div>
        </div>
      </div>
      <div class="button-box">
        <el-button @click="submit" :loading="isSubmiting" type="primary" round>
          开始
        </el-button>
        <el-button @click="toggleEdit" type="info" round> 取消 </el-button>
      </div>
    </ConfirmContainer>
  </div>
</template>

<style lang="scss" scoped>
.second-input-box {
  position: relative;
  .second-mark {
    position: absolute;
    font-size: 10px;
    color: var(--color-text-soft);
    right: 48px;
    bottom: 2px;
    user-select: none;
  }
}
</style>
