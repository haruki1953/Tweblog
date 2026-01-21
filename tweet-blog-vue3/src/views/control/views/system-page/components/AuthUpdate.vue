<script setup lang="ts">
import { authRules } from '@/config'
import type { ElForm } from 'element-plus'
import { ref } from 'vue'
import { User, Lock } from '@element-plus/icons-vue'
import { adminUpdateAuthApi } from '@/api'
import { sakiMessage } from '@/utils'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores'
import type ConfirmContainer from '@/components/layout/ConfirmContainer.vue'

const formModel = ref({
  username: '',
  password: ''
})

const refElForm = ref<InstanceType<typeof ElForm> | null>(null)

const rules = authRules

const resetAuth = () => {
  refElForm.value?.resetFields()
}

const router = useRouter()
const authStore = useAuthStore()

const isSubmitingAuth = ref(false)
const submitAuth = async () => {
  // 预校验
  await refElForm.value?.validate()

  await refConfirmContainer.value?.confirm()

  isSubmitingAuth.value = true
  try {
    // 调用修改密码的接口
    await adminUpdateAuthApi(formModel.value)
    sakiMessage({
      type: 'success',
      message: '修改成功'
    })
    authStore.removeToken()
    await new Promise((resolve) => setTimeout(resolve, 500))
    router.push({ name: 'login' })
  } finally {
    isSubmitingAuth.value = false
    resetAuth()
  }
}

const refConfirmContainer = ref<InstanceType<typeof ConfirmContainer> | null>(
  null
)
</script>
<template>
  <div class="auth-update">
    <ConfirmContainer
      ref="refConfirmContainer"
      backgroundColor="var(--color-background-soft)"
      title="确认要修改账号密码吗？"
      confirmType="danger"
      confirmText="修改"
      size="small"
    >
      <div class="control-lable">修改用户名与密码</div>
      <div class="form-box">
        <el-form
          :model="formModel"
          :rules="rules"
          ref="refElForm"
          size="large"
          autocomplete="off"
        >
          <el-form-item prop="username">
            <!-- <div class="input-lable">用户名</div> -->
            <el-input
              v-model="formModel.username"
              :prefix-icon="User"
              placeholder="请输入用户名"
              name="username"
              size="large"
              class="control-input"
            ></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <!-- <div class="input-lable">密码</div> -->
            <el-input
              v-model="formModel.password"
              :prefix-icon="Lock"
              placeholder="请输入密码"
              name="password"
              size="large"
              class="control-input"
            ></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div class="button-box">
        <el-button
          @click="submitAuth"
          :loading="isSubmitingAuth"
          type="success"
          round
        >
          保存
        </el-button>
        <el-button @click="resetAuth" type="info" round> 取消 </el-button>
      </div>
    </ConfirmContainer>
  </div>
</template>

<style lang="scss" scoped>
// @use '../../../styles/control.scss';
</style>
