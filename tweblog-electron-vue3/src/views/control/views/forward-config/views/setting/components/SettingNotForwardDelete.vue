<script setup lang="ts">
import { usePostStore } from '@/stores'
import { ref } from 'vue'
import { sakiMessage, sakiNotification } from '@/utils'
import { postControlDeleteForwardNotSettingApi } from '@/api'
import type ConfirmContainer from '@/components/layout/ConfirmContainer.vue'
import { appInfo } from '@/config'

const postStroe = usePostStore()

const isSubmiting = ref(false)
const submit = async () => {
  await refConfirmContainer.value?.confirm()
  isSubmiting.value = true
  try {
    const res = await postControlDeleteForwardNotSettingApi()
    const postForwardNum = res.data.data.postForward.count
    const imageForwardtNum = res.data.data.imageForward.count
    if (postForwardNum > 0 || imageForwardtNum > 0) {
      // 删除转发记录后，帖子需重新加载
      postStroe.resetPostRequested()
      sakiNotification({
        type: 'success',
        title: '删除成功',
        message: `已删除 ${postForwardNum} 条推文转发记录、${imageForwardtNum} 条图片转发记录，`
      })
    } else {
      sakiMessage({
        type: 'info',
        message: '暂无需要删除的转发记录'
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
  <div class="setting-excess-import-delete">
    <ConfirmContainer
      ref="refConfirmContainer"
      backgroundColor="var(--color-background-soft)"
      title="确认要删除无对应转发配置的记录吗？"
      confirmText="删除"
      confirmType="danger"
      size="small"
    >
      <div class="control-lable-with-link">
        <div class="lable">删除无对应转发配置的记录</div>
        <a
          class="link"
          :href="appInfo.forwardDeleteDocs.link"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ appInfo.forwardDeleteDocs.text }}
        </a>
      </div>
      <div class="button-box not-center">
        <el-button @click="submit" :loading="isSubmiting" type="danger" round>
          删除转发记录
        </el-button>
      </div>
    </ConfirmContainer>
  </div>
</template>

<style lang="scss" scoped></style>
