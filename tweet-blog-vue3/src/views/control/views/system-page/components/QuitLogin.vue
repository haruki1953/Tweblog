<script setup lang="ts">
import { ref } from 'vue'
import type ConfirmContainer from '@/components/layout/ConfirmContainer.vue'
import { useAuthStore } from '@/stores'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()

const submit = async () => {
  await refConfirmContainer.value?.confirm()
  authStore.removeToken()
  router.push({ name: 'login' })
}

const refConfirmContainer = ref<InstanceType<typeof ConfirmContainer> | null>(
  null
)
</script>
<template>
  <div class="image-all-original-delete">
    <ConfirmContainer
      ref="refConfirmContainer"
      backgroundColor="var(--color-background-soft)"
      title="确认要退出登录吗？"
      confirmType="primary"
      confirmText="确认"
      size="small"
    >
      <div class="control-lable">退出登录</div>
      <div class="button-box not-center">
        <el-button @click="submit" type="info" round> 退出登录 </el-button>
      </div>
    </ConfirmContainer>
  </div>
</template>

<style lang="scss" scoped>
// @use '../../../styles/control.scss';
</style>
