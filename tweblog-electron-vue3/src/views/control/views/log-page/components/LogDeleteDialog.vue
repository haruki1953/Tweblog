<script setup lang="ts">
import { computed } from 'vue'
import { ref } from 'vue'
import { useWindowSize } from '@vueuse/core'
import { adminLogDeleteApi } from '@/api'
import { generateRandomClassName, useDialogOptimization } from '@/utils'
import type CompleteMessageContainer from '@/components/layout/CompleteMessageContainer.vue'
import { logConfig } from '@/config'

const props = defineProps<{
  afterDelete: () => void
}>()

const dialogVisible = ref(false)

const windowSize = useWindowSize()
const dialogWidth = computed(() => {
  const width = 400
  const windowWidth = windowSize.width.value
  return windowWidth * 0.9 < width ? '90%' : width
})

const open = () => {
  dialogVisible.value = true
}
const close = () => {
  dialogVisible.value = false
}

defineExpose({
  open,
  close
})

const keepNum = ref(logConfig.deleteKeepNumDefault)

const isSubmitting = ref(false)
const submit = async () => {
  isSubmitting.value = true
  try {
    // TODO 帖子永久删除对话框，可选是否删除图片
    // const res = await postDeleteAllApi()
    await adminLogDeleteApi(keepNum.value)
    refCompleteMessageContainer.value?.remove()
    props.afterDelete()
  } finally {
    isSubmitting.value = false
  }
}

// 自定义遮罩类名，随机生成
const overlayClass = generateRandomClassName()

// 对话框优化
useDialogOptimization({
  dialogVisible,
  overlayClass
})

const refCompleteMessageContainer = ref<InstanceType<
  typeof CompleteMessageContainer
> | null>(null)
</script>
<template>
  <div class="post-delete-dialog">
    <el-dialog
      v-model="dialogVisible"
      :width="dialogWidth"
      :lock-scroll="false"
      append-to-body
      :modal-class="overlayClass"
    >
      <CompleteMessageContainer
        ref="refCompleteMessageContainer"
        backgroundColor="var(--el-dialog-bg-color)"
      >
        <div class="setting-row setting-center-box">
          <div class="setting-lable">保留前 {{ keepNum }} 条日志</div>
          <div class="setting-input-box">
            <el-input-number
              v-model="keepNum"
              :step="1"
              step-strictly
              size="small"
            />
          </div>
        </div>
        <div class="setting-button-box">
          <el-button
            type="danger"
            size="small"
            round
            @click="submit"
            :loading="isSubmitting"
          >
            清理日志
          </el-button>
        </div>
      </CompleteMessageContainer>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.setting-row {
  margin-bottom: 20px;
  .setting-lable {
    margin-bottom: 4px;
    font-size: 12px;
    color: var(--color-text-soft);
  }
}

.setting-input-box {
  :deep() {
    .el-radio--small {
      height: 16px;
    }
    .el-checkbox {
      height: 20px;
    }
  }
}

.setting-center-box {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.setting-button-box {
  margin-top: 20px;
  margin-bottom: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
