<script setup lang="ts">
import { useImageStore, useProfileStore } from '@/stores'
import { ref } from 'vue'
import { sakiMessage, sakiNotification } from '@/utils'
import { adminDeleteNotUsedImageApi } from '@/api'
import type ConfirmContainer from '@/components/layout/ConfirmContainer.vue'

const imageStroe = useImageStore()
const profileStore = useProfileStore()

const isSubmiting = ref(false)
const submit = async () => {
  await refConfirmContainer.value?.confirm()
  isSubmiting.value = true
  try {
    const res = await adminDeleteNotUsedImageApi()
    const deletedNum = res.data.data.filter((i) => i !== null).length
    if (deletedNum > 0) {
      // 删除图片后，将imageStore设置需重新获取，并重新获取个人信息中的图片数量
      imageStroe.setNeedReget()
      profileStore.loadAll()
      sakiNotification({
        type: 'success',
        title: '删除成功',
        message: `已删除 ${deletedNum} 个图片`
      })
    } else {
      sakiMessage({
        type: 'info',
        message: '暂无未使用图片'
      })
    }
  } finally {
    isSubmiting.value = false
  }
}

const refConfirmContainer = ref<InstanceType<typeof ConfirmContainer> | null>(
  null
)
</script>
<template>
  <div class="image-not-used-delete">
    <ConfirmContainer
      ref="refConfirmContainer"
      backgroundColor="var(--color-background-soft)"
      title="确认要删除未使用图片吗？"
      confirmType="danger"
      confirmText="删除"
      size="small"
    >
      <div class="control-lable">删除未使用图片</div>
      <div class="button-box not-center">
        <el-button @click="submit" :loading="isSubmiting" type="danger" round>
          删除未使用图片
        </el-button>
      </div>
    </ConfirmContainer>
  </div>
</template>

<style lang="scss" scoped>
// @use '../../../styles/control.scss';
</style>
