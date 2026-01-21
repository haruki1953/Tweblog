<script setup lang="ts">
import { authRules, webName } from '@/config'
import { useDark } from '@vueuse/core'
import { ref } from 'vue'
import { User, Lock } from '@element-plus/icons-vue'
import type { ElForm } from 'element-plus'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores'
import { adminLoginApi } from '@/api'
import { sakiMessage } from '@/utils'
import { onMounted } from 'vue'
import DataContainerMountedMask from '@/components/layout/DataContainerMountedMask.vue'
import { dataConfirmLoginService, dataFirstLoadService } from '@/services'

onMounted(() => {
  dataConfirmLoginService()
})

useDark({ disableTransition: false })

const formModel = ref({
  username: '',
  password: ''
})

const form = ref<InstanceType<typeof ElForm> | null>(null)

const rules = authRules

const router = useRouter()
const authStore = useAuthStore()

const isSubmitting = ref(false) // submit states mark
const login = async () => {
  isSubmitting.value = true
  try {
    await form.value?.validate()

    const res = await adminLoginApi(formModel.value)
    // save token
    authStore.setToken(res.data.data)
    sakiMessage({
      type: 'success',
      message: '登录成功'
    })
    // init data
    dataFirstLoadService()
    // push to home
    await router.push({ name: 'home' })
  } finally {
    // reset submit states mark
    isSubmitting.value = false
  }
}
</script>
<template>
  <div class="login-page">
    <DataContainerMountedMask>
      <div class="login-container">
        <div class="login-box">
          <div class="title">{{ webName }}</div>
          <el-form :model="formModel" :rules="rules" ref="form" size="large">
            <el-form-item prop="username">
              <el-input
                v-model="formModel.username"
                :prefix-icon="User"
                placeholder="请输入用户名"
                name="username"
              ></el-input>
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="formModel.password"
                :prefix-icon="Lock"
                type="password"
                placeholder="请输入密码"
                name="password"
              ></el-input>
            </el-form-item>
          </el-form>
          <div class="button-box">
            <el-button
              @click="login"
              :loading="isSubmitting"
              class="button"
              type="primary"
              size="large"
              round
              auto-insert-space
            >
              登录
            </el-button>
          </div>
        </div>
      </div>
    </DataContainerMountedMask>
  </div>
</template>

<style lang="scss" scoped>
.login-container {
  height: 100vh;
  max-width: 400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
}

.login-box {
  flex: 1;
  margin: 0 20px;

  .title {
    height: 40px;
    margin-bottom: 22px;
    /* 从左到右的渐变色 */
    background: linear-gradient(
      to right,
      var(--el-color-primary),
      var(--el-color-error)
    );
    border-radius: 20px;
    color: var(--color-background);
    text-align: center;
    font-size: 20px;
    font-weight: bold;
    line-height: 40px;
    letter-spacing: 4px;
  }

  .el-form {
    margin: 0 20px;

    .el-input {
      :deep() {
        .el-input__wrapper {
          padding: 1px 20px;
          border-radius: 20px;
          background-color: var(--color-background-soft);
          transition: all 0.5s;
          box-shadow: none;
          &:hover {
            box-shadow: none;
          }
          .el-input__inner {
            // color: var(--color-text);
            margin-left: 5px;
            letter-spacing: 2px;
          }
        }
      }
    }
  }

  .button-box {
    display: flex;
    justify-content: center;
    margin: 0 20px;
    .button {
      width: 100%;
      :deep() {
        .el-button__text--expand,
        .el-icon {
          color: var(--color-background);
          font-weight: bold;
        }
      }
    }
  }
}
</style>
