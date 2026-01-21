<script setup lang="ts">
import { useAdminStore } from '@/stores'
import { watch } from 'vue'
import { ref } from 'vue'
import {
  formatDuration,
  sakiMessage,
  useInputNumberStepSecondOptimization
} from '@/utils'
import { adminUpdateInfoApi } from '@/api'

const adminStore = useAdminStore()

const jwtAdminExpSeconds = ref<number>(adminStore.jwtAdminExpSeconds || 1)
const loginMaxFailCount = ref<number>(adminStore.loginMaxFailCount || 1)
const loginLockSeconds = ref<number>(adminStore.loginLockSeconds || 1)

const {
  optimizationStep: jwtAdminExpSecondsStep,
  optimizationOnBlur: jwtAdminExpSecondsOnBlur
} = useInputNumberStepSecondOptimization({
  refNumber: jwtAdminExpSeconds
})
const {
  optimizationStep: loginLockSecondsStep,
  optimizationOnBlur: loginLockSecondsOnBlur
} = useInputNumberStepSecondOptimization({
  refNumber: loginLockSeconds
})

const initData = () => {
  jwtAdminExpSeconds.value = adminStore.jwtAdminExpSeconds || 1
  loginMaxFailCount.value = adminStore.loginMaxFailCount || 1
  loginLockSeconds.value = adminStore.loginLockSeconds || 1
}

// adminStore 在加载中时，应禁用表单
// adminStore 加载后，应初始化数据
watch(
  () => adminStore.isLoading,
  () => {
    if (adminStore.isLoading) {
      return
    }
    initData()
  }
)

const isSubmiting = ref(false)
const submit = async () => {
  isSubmiting.value = true
  try {
    const res = await adminUpdateInfoApi({
      jwtAdminExpSeconds: jwtAdminExpSeconds.value,
      loginMaxFailCount: loginMaxFailCount.value,
      loginLockSeconds: loginLockSeconds.value
    })
    // await adminStore.loadInfo()
    adminStore.loadInfoByResData(res.data.data)
    sakiMessage({
      type: 'success',
      message: '修改成功'
    })
  } finally {
    isSubmiting.value = false
  }
}
</script>
<template>
  <div class="admin-info">
    <div class="control-lable">修改系统配置</div>
    <div
      class="loading-box"
      v-loading="adminStore.isLoading"
      element-loading-background="var(--color-background-soft)"
    >
      <div class="form-box">
        <div class="form-row second-input-box">
          <div class="input-lable">
            登录有效期：{{ formatDuration(jwtAdminExpSeconds, 2) }}
          </div>
          <el-input-number
            v-model="jwtAdminExpSeconds"
            :min="1"
            :step="jwtAdminExpSecondsStep"
            @blur="jwtAdminExpSecondsOnBlur"
            class="control-input"
            size="large"
            title=""
          />
          <div class="second-mark">秒</div>
        </div>
        <div class="form-row">
          <div class="input-lable">登录失败至锁定的次数</div>
          <el-input-number
            v-model="loginMaxFailCount"
            :min="1"
            class="control-input"
            size="large"
            step-strictly
          />
        </div>
        <div class="form-row second-input-box">
          <div class="input-lable">
            锁定的时间：{{ formatDuration(loginLockSeconds, 2) }}
          </div>
          <el-input-number
            v-model="loginLockSeconds"
            :min="1"
            :step="loginLockSecondsStep"
            @blur="loginLockSecondsOnBlur"
            class="control-input"
            size="large"
            title=""
          />
          <div class="second-mark">秒</div>
        </div>
      </div>
      <div class="button-box">
        <el-button @click="submit" :loading="isSubmiting" type="success" round>
          保存
        </el-button>
        <el-button @click="initData" type="info" round> 取消 </el-button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// @use '../../../styles/control.scss';

.loading-box {
  :deep() {
    .el-loading-mask {
      z-index: 2;
    }
  }
}

.form-box.form-box {
  margin-bottom: 20px;
}
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
