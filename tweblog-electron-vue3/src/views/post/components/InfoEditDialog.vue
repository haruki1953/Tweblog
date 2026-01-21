<script setup lang="ts">
import { computed } from 'vue'
import { ref } from 'vue'
import { useWindowSize } from '@vueuse/core'
import type { InfoBySendType, PostSendJsonType } from '@/types'
import { Connection, Link } from '@element-plus/icons-vue'
import { generateRandomClassName, useDialogOptimization } from '@/utils'

const model = defineModel<PostSendJsonType>({ required: true })

const props = defineProps<{
  resetFunc?: () => void
  info: InfoBySendType
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

defineExpose({
  open
})

const handleModelData = () => {
  if (!(model.value.createdAt instanceof Date)) {
    model.value.createdAt = undefined
  }
}

const resetModelData = () => {
  if (props.resetFunc != null) {
    props.resetFunc()
    return
  }
  // default reset
  model.value.createdAt = undefined
  // model.value.twitterId = undefined
  // model.value.twitterLink = undefined
}

const placeholderByType = computed(() => {
  if (props.info.type === 'update') {
    return '（空）'
  } else {
    return undefined
  }
})

// 自定义遮罩类名，随机生成
const overlayClass = generateRandomClassName()

// 对话框优化
useDialogOptimization({
  dialogVisible,
  overlayClass
})
</script>
<template>
  <div class="info-edit-dialog">
    <el-dialog
      v-model="dialogVisible"
      :width="dialogWidth"
      :lock-scroll="false"
      @close="handleModelData"
      :modal-class="overlayClass"
    >
      <div class="form-box">
        <div class="row center-box">
          <div class="lable">帖子创建时间</div>
          <div class="input-box">
            <el-date-picker
              v-model="model.createdAt"
              type="datetime"
              placeholder="选择帖子创建时间"
              class="input"
            />
          </div>
        </div>
        <!-- <div class="row center-box">
          <div class="lable">X Id</div>
          <div class="input-box">
            <el-input
              v-model="model.twitterId"
              :placeholder="placeholderByType || '设置帖子在 X 的 id'"
              :prefix-icon="Connection"
              class="input"
            />
          </div>
        </div> -->
        <!-- <div class="row center-box">
          <div class="lable">X Link</div>
          <div class="input-box">
            <el-input
              v-model="model.twitterLink"
              :placeholder="placeholderByType || '设置帖子在 X 的 链接'"
              :prefix-icon="Link"
              class="input"
            />
          </div>
        </div> -->
        <div class="button-box">
          <el-button round type="info" size="small" @click="resetModelData">
            重 置
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.info-edit-dialog {
  :deep() {
    .el-dialog {
      border-radius: 20px;
    }
  }
}

.row {
  margin-bottom: 10px;
  .lable {
    margin-bottom: 4px;
    font-size: 12px;
    color: var(--color-text-soft);
  }
}

.input-box {
  :deep() {
    .input {
      .el-input__wrapper {
        border-radius: 10px;
        background-color: var(--color-background-soft);
        transition: all 0.5s;
        box-shadow: none;
        &:hover {
          box-shadow: none;
        }
      }
    }
  }
}
.center-box {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.button-box {
  margin-top: 20px;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  .el-button {
    display: flex;
    margin: 0;
  }
}
</style>
