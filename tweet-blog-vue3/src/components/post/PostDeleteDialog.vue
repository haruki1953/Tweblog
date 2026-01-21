<script setup lang="ts">
import { computed } from 'vue'
import { ref } from 'vue'
import { useWindowSize } from '@vueuse/core'
import type { PostData } from '@/types'
import { generateRandomClassName, useDialogOptimization } from '@/utils'
import { usePostDeleteEverlastService } from '@/services'

const modelIsDeleteEverlasting = defineModel<boolean>('isDeleteEverlasting', {
  required: true
})
const props = defineProps<{
  data: PostData
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

const isDeleteRelatedImage = ref(false)

const { deletePost } = usePostDeleteEverlastService({
  propsdata: computed(() => props.data),
  modelIsDeleteEverlasting,
  isDeleteRelatedImage,
  close
})

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
      :modal-class="overlayClass"
      append-to-body
    >
      <div class="row center-box">
        <div class="lable">确认要永久删除此推文吗？</div>
        <div class="input-box">
          <el-checkbox
            v-model="isDeleteRelatedImage"
            label="删除推文图片"
            size="small"
          />
        </div>
      </div>
      <el-divider border-style="dotted" />
      <PostCard :data="data" mini notPreview notAlt></PostCard>
      <div class="button-box">
        <el-button round type="danger" size="small" @click="deletePost">
          删 除
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
  margin-top: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.el-divider {
  width: 90%;
  margin: 20px auto 14px auto;
  transition: all 0.5s;
  --el-border-color: var(--color-border);
}
</style>
