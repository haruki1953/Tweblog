<script setup lang="ts">
import { useImageStore } from '@/stores'
import { ref } from 'vue'
import {
  generateRandomClassName,
  sakiMessage,
  sakiNotification,
  useDialogOptimization
} from '@/utils'
import { adminProxyTestApi } from '@/api'
import type ConfirmContainer from '@/components/layout/ConfirmContainer.vue'
import { Link, Setting } from '@element-plus/icons-vue'
import { useWindowSize } from '@vueuse/core'
import { computed } from 'vue'
import { fetchProxyConfig } from '@/config'

const testAddress = ref('')

const isSubmiting = ref(false)
const submit = async () => {
  isSubmiting.value = true
  try {
    const res = await adminProxyTestApi({
      testAddress: testAddress.value
    })
    const { address, latency } = res.data.data
    sakiNotification({
      type: 'success',
      title: `测试成功，延迟 ${latency}ms`,
      message: `成功访问 ${address}`
    })
  } finally {
    isSubmiting.value = false
  }
}

const dialogVisible = ref(false)

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
</script>
<template>
  <div class="image-all-original-delete">
    <div class="control-lable">网络测试</div>
    <div class="button-box not-center">
      <el-button
        type="info"
        :icon="Setting"
        circle
        @click="dialogVisible = true"
      ></el-button>
      <el-button @click="submit" :loading="isSubmiting" type="info" round>
        网络测试
      </el-button>
    </div>
    <el-dialog
      v-model="dialogVisible"
      :width="dialogWidth"
      :lock-scroll="false"
      :modal-class="overlayClass"
    >
      <div class="setting-row setting-center-box">
        <div class="setting-lable">测试访问地址</div>
        <div class="setting-input-box input">
          <el-input
            v-model="testAddress"
            :prefix-icon="Link"
            :placeholder="fetchProxyConfig.testUrlDefault"
            clearable
          />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
// @use '../../../styles/control.scss';

.el-input {
  :deep() {
    .el-input__inner {
      font-family: 'Consolas', 'Courier New', monospace;
    }
  }
}

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
    .el-input__wrapper {
      border-radius: 10px;
    }
    .el-radio--small {
      height: 16px;
    }
    .el-checkbox {
      height: 20px;
    }
  }
  &.input {
    width: 100%;
    padding: 0 20px;
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
