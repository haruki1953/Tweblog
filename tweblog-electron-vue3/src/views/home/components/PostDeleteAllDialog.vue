<script setup lang="ts">
import { computed } from 'vue'
import { ref } from 'vue'
import { useWindowSize } from '@vueuse/core'
import type { PostDeleteAllData } from '@/types'
import { postDeleteAllApi } from '@/api'
import { useImageStore, useProfileStore } from '@/stores'
import {
  generateRandomClassName,
  sakiMessage,
  useDialogOptimization
} from '@/utils'

const modelIsDeleteEverlasting = defineModel<boolean>('isDeleteAlling', {
  required: true
})
const emit = defineEmits<{
  deleted: [value: PostDeleteAllData]
}>()

const dialogVisible = ref(false)

const windowSize = useWindowSize()
const dialogWidth = computed(() => {
  const width = 400
  const windowWidth = windowSize.width.value
  return windowWidth * 0.9 < width ? '90%' : width
})

const open = () => {
  dialogVisible.value = true
}
const close = () => {
  dialogVisible.value = false
}

defineExpose({
  open,
  close
})

const imageStore = useImageStore()
const profileStore = useProfileStore()

const isDeleteRelatedImage = ref(false)

const deletePost = async () => {
  close()
  modelIsDeleteEverlasting.value = true
  try {
    // TODO 帖子永久删除对话框，可选是否删除图片
    const res = await postDeleteAllApi({
      delateImage: isDeleteRelatedImage.value ? 'true' : 'false'
    })
    sakiMessage({
      type: 'success',
      message: '回收站已清空'
    })
    if (
      res.data.data.find(
        (item) => item.deletedImages.find((i) => i != null) != null
      )
    ) {
      imageStore.setNeedReget()
    }
    profileStore.loadAll()
    emit('deleted', res.data.data)
  } finally {
    modelIsDeleteEverlasting.value = false
  }
}

// 自定义遮罩类名，随机生成
const overlayClass = generateRandomClassName()

// 对话框优化
useDialogOptimization({
  dialogVisible,
  overlayClass
})
</script>
<template>
  <div class="post-delete-dialog">
    <el-dialog
      v-model="dialogVisible"
      :width="dialogWidth"
      :lock-scroll="false"
      append-to-body
      :modal-class="overlayClass"
    >
      <div class="row center-box">
        <div class="lable">确认要清空回收站吗？</div>
        <div class="input-box">
          <el-checkbox
            v-model="isDeleteRelatedImage"
            label="删除推文图片"
            size="small"
          />
        </div>
      </div>
      <div class="button-box">
        <el-button round type="danger" size="small" @click="deletePost">
          确 认
        </el-button>
        <!-- <el-button round type="info" size="small" @click="close">
          取 消
        </el-button> -->
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.row {
  margin-bottom: 10px;
  .lable {
    margin-bottom: 4px;
    font-size: 12px;
    color: var(--color-text-soft);
  }
}

.center-box {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.button-box {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
