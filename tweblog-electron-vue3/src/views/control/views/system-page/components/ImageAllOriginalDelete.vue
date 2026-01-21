<script setup lang="ts">
import { useImageStore } from '@/stores'
import { ref } from 'vue'
import { sakiMessage, sakiNotification } from '@/utils'
import { adminDeleteAllOriginalImageApi } from '@/api'
import type ConfirmContainer from '@/components/layout/ConfirmContainer.vue'

const imageStroe = useImageStore()

const isSubmiting = ref(false)
const submit = async () => {
  await refConfirmContainer.value?.confirm()
  isSubmiting.value = true
  try {
    const res = await adminDeleteAllOriginalImageApi()
    const deletedNum = res.data.data
    if (deletedNum > 0) {
      // 删除原图后，将imageStore设置需重新获取
      imageStroe.setNeedReget()
      sakiNotification({
        type: 'success',
        title: '删除成功',
        message: `已删除 ${deletedNum} 个图片的原图`
      })
    } else {
      sakiMessage({
        type: 'info',
        message: '暂无原图'
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
  <div class="image-all-original-delete">
    <ConfirmContainer
      ref="refConfirmContainer"
      backgroundColor="var(--color-background-soft)"
      title="确认要删除全部原图吗？"
      confirmType="warning"
      confirmText="删除"
      size="small"
    >
      <div class="control-lable">删除全部原图</div>
      <div class="button-box not-center">
        <el-button @click="submit" :loading="isSubmiting" type="warning" round>
          删除全部原图
        </el-button>
      </div>
    </ConfirmContainer>
  </div>
</template>

<style lang="scss" scoped>
// @use '../../../styles/control.scss';
</style>
