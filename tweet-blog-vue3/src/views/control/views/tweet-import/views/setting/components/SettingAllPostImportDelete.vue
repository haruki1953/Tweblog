<script setup lang="ts">
import { usePostStore } from '@/stores'
import { ref } from 'vue'
import { sakiMessage, sakiNotification } from '@/utils'
import { postControlDeleteImportAllPostApi } from '@/api'
import type ConfirmContainer from '@/components/layout/ConfirmContainer.vue'

const postStroe = usePostStore()

const isSubmiting = ref(false)
const submit = async () => {
  await refConfirmContainer.value?.confirm()
  isSubmiting.value = true
  try {
    const res = await postControlDeleteImportAllPostApi()
    const postImportNum = res.data.data.postImport.count
    // const imageImporttNum = res.data.data.imageImport.count
    if (postImportNum > 0) {
      // 删除导入记录后，帖子需重新加载
      postStroe.resetPostRequested()
      sakiNotification({
        type: 'success',
        title: '删除成功',
        message: `已删除 ${postImportNum} 条推文导入记录`
      })
    } else {
      sakiMessage({
        type: 'info',
        message: '暂无推文导入记录'
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
      title="确认要删除全部推文导入记录吗？"
      confirmText="删除"
      confirmType="danger"
      size="small"
    >
      <div class="control-lable">删除全部推文导入记录</div>
      <div class="button-box not-center">
        <el-button @click="submit" :loading="isSubmiting" type="danger" round>
          删除全部推文导入记录
        </el-button>
      </div>
    </ConfirmContainer>
  </div>
</template>

<style lang="scss" scoped></style>
