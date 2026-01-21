<script setup lang="ts">
import { usePostStore } from '@/stores'
import { ref } from 'vue'
import { sakiMessage, sakiNotification } from '@/utils'
import { postControlDeleteImportExcessApi } from '@/api'
import type ConfirmContainer from '@/components/layout/ConfirmContainer.vue'
import { appInfo } from '@/config'

const postStroe = usePostStore()

const isSubmiting = ref(false)
const submit = async () => {
  await refConfirmContainer.value?.confirm()
  isSubmiting.value = true
  try {
    const res = await postControlDeleteImportExcessApi()
    const postImportNum = res.data.data.postImport.count
    const imageImporttNum = res.data.data.imageImport.count
    if (postImportNum > 0 || imageImporttNum > 0) {
      // 删除导入记录后，帖子需重新加载
      postStroe.resetPostRequested()
      sakiNotification({
        type: 'success',
        title: '删除成功',
        message: `已删除 ${postImportNum} 条推文导入记录、${imageImporttNum} 条图片导入记录，`
      })
    } else {
      sakiMessage({
        type: 'info',
        message: '暂无重复的导入记录'
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
      title="确认要删除重复的导入记录吗？"
      confirmText="删除"
      size="small"
    >
      <div class="control-lable-with-link">
        <div class="lable">删除重复的导入记录</div>
        <a
          class="link"
          :href="appInfo.importDeleteDocs.link"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ appInfo.importDeleteDocs.text }}
        </a>
      </div>
      <div class="button-box not-center">
        <el-button @click="submit" :loading="isSubmiting" type="info" round>
          删除重复的导入记录
        </el-button>
      </div>
    </ConfirmContainer>
  </div>
</template>

<style lang="scss" scoped></style>
