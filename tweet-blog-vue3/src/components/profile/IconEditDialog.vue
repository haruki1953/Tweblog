<script setup lang="ts">
import { computed } from 'vue'
import { ref } from 'vue'
import { useWindowSize } from '@vueuse/core'
import { useProfileStore } from '@/stores'
import {
  generateRandomClassName,
  useDialogOptimization,
  sakiMessage,
  profileIconUrl,
  formatFileSize
} from '@/utils'
import type { BackendProfileStore } from '@/types'
import { profileDeleteIconApi, profileDeleteIconNotUsedApi } from '@/api'

// const props = withDefaults(
//   defineProps<{
//     onDel?: () => void
//   }>(),
//   {
//     onDel: () => {}
//   }
// )

type ImgItem = BackendProfileStore['externalIcons'][number]
const selectedImages = defineModel<ImgItem[]>({ required: true })
const selectedImage = computed(() => {
  if (selectedImages.value.length === 0) {
    return null
  }
  return selectedImages.value[0]
})
const showImage = computed(() => {
  if (selectedImage.value) {
    return profileIconUrl(selectedImage.value)
  }
  // return profileConfig.avatarDefault
  return undefined
})

const profileStore = useProfileStore()

// !!!
const isCurrentUsing = computed(() => {
  if (selectedImage.value === null) {
    return false
  }
  if (
    profileStore.externalLinks.find((i) => i.icon === selectedImage.value?.uuid)
  ) {
    return true
  }
  return false
})

const isSubmitingDelete = ref(false)
const deleteImg = async () => {
  if (selectedImage.value === null) {
    return
  }
  isSubmitingDelete.value = true
  try {
    const res = await profileDeleteIconApi(selectedImage.value.uuid)
    // 更新store
    profileStore.loadProfileByRes(res.data.data)
    sakiMessage({
      type: 'success',
      message: '删除成功'
    })
    close()
    selectedImages.value = []
    // props.onDel()
  } finally {
    isSubmitingDelete.value = false
  }
}

const isSubmitingDeleteNotUsed = ref(false)
const deleteImgNotUsed = async () => {
  if (selectedImage.value === null) {
    return
  }
  isSubmitingDeleteNotUsed.value = true
  try {
    const res = await profileDeleteIconNotUsedApi()
    // 更新store
    profileStore.loadProfileByRes(res.data.data)
    sakiMessage({
      type: 'success',
      message: '删除成功'
    })
    close()
    if (!isCurrentUsing.value) {
      selectedImages.value = []
      // props.onDel()
    }
  } finally {
    isSubmitingDeleteNotUsed.value = false
  }
}

const dialogVisible = ref(false)

const open = () => {
  if (selectedImage.value === null) {
    return
  }
  dialogVisible.value = true
}
const close = () => {
  dialogVisible.value = false
}

defineExpose({
  open,
  close
})

// 对话框宽度
const windowSize = useWindowSize()
const dialogWidth = computed(() => {
  const width = 400
  const windowWidth = windowSize.width.value
  return windowWidth * 0.9 < width ? '90%' : width
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
  <div class="icon-edit-dialog">
    <el-dialog
      v-model="dialogVisible"
      :width="dialogWidth"
      :lock-scroll="false"
      :modal-class="overlayClass"
    >
      <div class="edit-avatar-box">
        <el-avatar shape="square" :size="100" :src="showImage" />
      </div>
      <div class="edit-control-box">
        <div class="edit-control-row">
          <div class="edit-control-lable">图标大小</div>
          <div class="edit-button-box">
            <el-button
              round
              type="warning"
              size="small"
              tag="a"
              :disabled="selectedImage === null"
              :href="showImage"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ formatFileSize(selectedImage?.size || 0) }}
            </el-button>
          </div>
        </div>
        <div class="edit-control-divider"></div>
        <div class="edit-control-row">
          <div class="edit-control-lable">删除图标</div>
          <div class="edit-button-box">
            <el-button
              round
              type="danger"
              size="small"
              disabled
              v-if="isCurrentUsing"
            >
              正在使用
            </el-button>
            <el-button
              round
              type="danger"
              size="small"
              @click="deleteImg"
              :loading="isSubmitingDelete"
              v-else
            >
              删除图标
            </el-button>
          </div>
        </div>
        <div class="edit-control-divider"></div>
        <div class="edit-control-row">
          <div class="edit-control-lable">删除全部未使用图标</div>
          <div class="edit-button-box">
            <el-button
              round
              type="danger"
              size="small"
              @click="deleteImgNotUsed"
              :loading="isSubmitingDeleteNotUsed"
            >
              删除全部
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.edit-avatar-box {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  .el-avatar {
    background-color: transparent;
    user-select: none;
  }
}

.edit-input-box {
  .edit-textarea {
    // background-color: var(--color-background-soft);
    // transition: all 0.5s;
    margin-bottom: -5px;
    :deep() {
      .el-textarea__inner {
        // color: var(--color-text);
        // font-weight: bold;
        border: none;
        box-shadow: none;
        background-color: transparent;
        // transition:
        //   background-color 0.5s,
        //   color 0.2s;
      }
      .el-input__count {
        background-color: transparent;
        color: var(--color-text-soft);
        transition: all 0.5s;
        left: 10px;
        bottom: -20px;
        user-select: none;
      }
    }
  }
}

.edit-button-box {
  margin-right: 2px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex-wrap: wrap;
  position: relative;
  .el-button {
    margin-bottom: 2px;
    text-decoration: none; /* 去除下划线 */
  }
}
.edit-control-box {
  background-color: var(--color-background-soft);
  border-radius: 20px;
  transition:
    background-color 0.5s,
    box-shadow 0.5s;
  &:hover {
    box-shadow: var(--el-box-shadow-lighter);
  }
}
.edit-control-row {
  padding: 8px;
}
.edit-control-lable {
  font-size: 12px;
  color: var(--color-text-soft);
  margin: 0 0 2px 8px;
}
.edit-control-divider {
  // height: 2px;
  // // background-color: var(--color-background);
  // background-color: var(--el-bg-color);
  // transition: background-color 0.5s;
  border-top: 2.4px solid var(--color-background); // divider
  transition: border 0.5s;
  border-color: var(--el-bg-color);
}
</style>
