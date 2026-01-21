<script setup lang="ts">
import { computed, watch } from 'vue'
import { ref } from 'vue'
import { useWindowSize } from '@vueuse/core'
import type { ImageStoreData } from '@/types'
import { generateRandomClassName, useDialogOptimization } from '@/utils'

const selectedImages = defineModel<ImageStoreData[]>({ required: true })
const props = withDefaults(
  defineProps<{
    autoOpen?: boolean
    cancelOnClose?: boolean
    notPreview?: boolean
    imageSelect?: boolean
  }>(),
  {
    autoOpen: false,
    cancelOnClose: false,
    notPreview: true,
    imageSelect: false
  }
)

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
  open
})

const tryAutoOpen = () => {
  if (!props.autoOpen) {
    return
  }
  if (selectedImages.value.length > 0) {
    open()
  }
}
const tryAutoClose = () => {
  if (selectedImages.value.length === 0) {
    close()
  }
}

watch(
  () => selectedImages.value.length,
  () => {
    tryAutoOpen()
    tryAutoClose()
  }
)

const handleClose = async () => {
  if (props.cancelOnClose) {
    await new Promise((resolve) => setTimeout(resolve, 100))
    selectedImages.value = []
  }
}

// 自定义遮罩类名，随机生成
const overlayClass = generateRandomClassName()

// 对话框优化
useDialogOptimization({
  dialogVisible,
  overlayClass
})
</script>
<template>
  <div class="image-edit-dialog">
    <el-dialog
      v-model="dialogVisible"
      :width="dialogWidth"
      :lock-scroll="false"
      @close="handleClose"
      :modal-class="overlayClass"
    >
      <ImageEditCard
        v-model="selectedImages"
        :notPreview="notPreview"
        :imageSelect="imageSelect"
      ></ImageEditCard>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.image-edit-dialog {
  :deep() {
    .el-dialog {
      border-radius: 20px;
    }
    .i-e-c-control-box {
      .control-divider {
        // background-color: var(--el-bg-color);
        border-color: var(--el-bg-color);
      }
    }
  }
}
</style>
