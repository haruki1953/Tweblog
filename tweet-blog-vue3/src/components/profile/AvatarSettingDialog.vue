<script setup lang="ts">
import { computed } from 'vue'
import { ref } from 'vue'
import { useWindowSize } from '@vueuse/core'
import { useProfileStore } from '@/stores'
import { generateRandomClassName, useDialogOptimization } from '@/utils'
import type CompleteMessageContainer from '../layout/CompleteMessageContainer.vue'

const dialogVisible = ref(false)

const open = () => {
  initSetting()
  dialogVisible.value = true
}
const close = () => {
  initSetting()
  dialogVisible.value = false
}

defineExpose({
  open,
  close
})

// 对话框宽度
const windowSize = useWindowSize()
const dialogWidth = computed(() => {
  const width = 400
  const windowWidth = windowSize.width.value
  return windowWidth * 0.9 < width ? '90%' : width
})
// 自定义遮罩类名，随机生成
const overlayClass = generateRandomClassName()
// 对话框优化
useDialogOptimization({
  dialogVisible,
  overlayClass
})

const profileStore = useProfileStore()

const avatarProcessSetting = ref({ ...profileStore.avatarProcessSetting })

const initSetting = () => {
  avatarProcessSetting.value = { ...profileStore.avatarProcessSetting }
}

const saveSetting = () => {
  profileStore.avatarProcessSettingSave(avatarProcessSetting.value)
  refCompleteMessageContainer.value?.success()
}

const resetSetting = () => {
  profileStore.avatarProcessSettingReset()
  initSetting()
}

const refCompleteMessageContainer = ref<InstanceType<
  typeof CompleteMessageContainer
> | null>(null)
</script>
<template>
  <div class="avatar-setting-dialog">
    <el-dialog
      v-model="dialogVisible"
      :width="dialogWidth"
      :lock-scroll="false"
      :modal-class="overlayClass"
    >
      <CompleteMessageContainer
        ref="refCompleteMessageContainer"
        backgroundColor="var(--el-dialog-bg-color)"
      >
        <div class="setting-row setting-center-box">
          <el-checkbox
            v-model="avatarProcessSetting.imageProcess"
            label="对头像进行处理"
          />
        </div>
        <div class="setting-row setting-center-box">
          <div class="setting-lable">图片格式</div>
          <div class="setting-input-box">
            <el-radio-group
              v-model="avatarProcessSetting.imageType"
              size="small"
              :disabled="avatarProcessSetting.imageProcess === false"
            >
              <el-radio value="image/png">png</el-radio>
              <el-radio value="image/jpeg">jpg</el-radio>
              <el-radio value="image/webp">webp</el-radio>
            </el-radio-group>
          </div>
        </div>
        <Transition name="fade-slide">
          <div
            class="setting-row setting-center-box"
            v-show="
              avatarProcessSetting.imageType === 'image/jpeg' ||
              avatarProcessSetting.imageType === 'image/webp'
            "
            style="margin-top: -8px"
          >
            <div class="setting-lable">图片质量</div>
            <div class="setting-input-box">
              <el-input-number
                v-model="avatarProcessSetting.imageQuality"
                size="small"
                step-strictly
                :step="0.01"
                :precision="2"
                :min="0.01"
                :max="1"
                :disabled="avatarProcessSetting.imageProcess === false"
              />
            </div>
          </div>
        </Transition>
        <div class="setting-row setting-center-box">
          <div class="setting-lable">图片大小（单位px）</div>
          <div class="setting-input-box">
            <el-input-number
              v-model="avatarProcessSetting.imageWidth"
              :step="1"
              step-strictly
              size="small"
              :disabled="avatarProcessSetting.imageProcess === false"
            />
          </div>
        </div>
      </CompleteMessageContainer>
      <div class="setting-button-box">
        <el-button type="success" size="small" round @click="saveSetting">
          保存
        </el-button>
        <el-button type="info" size="small" round @click="resetSetting">
          重置
        </el-button>
      </div>
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
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
