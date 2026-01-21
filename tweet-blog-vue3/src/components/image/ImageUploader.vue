<script setup lang="ts">
import type { Image } from '@/types'
import { Upload } from '@element-plus/icons-vue'
import { computed } from 'vue'
import { useImageUploadService } from '@/services'

const props = withDefaults(
  defineProps<{
    onUploaded?: (resImage: Image) => void
  }>(),
  {
    onUploaded: () => {}
  }
)

const { files, uploadImage } = useImageUploadService({
  propsonUploaded: computed(() => props.onUploaded)
})
</script>
<template>
  <div class="image-uploader">
    <div class="upload-box style-box">
      <el-upload
        :auto-upload="false"
        accept="image/*"
        :on-change="uploadImage"
        :show-file-list="false"
        v-model:file-list="files"
        drag
        multiple
      ></el-upload>
      <div class="mask">
        <el-icon class="icon"><Upload /></el-icon>
        <span class="text">上传图片</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.image-uploader {
  --height: 80px;
  .upload-box {
    :deep() {
      .el-upload {
        width: 100%;
        height: var(--height);
        .el-upload-dragger {
          height: 100%;
          // visibility: hidden;
          border: none;
          background-color: transparent;
          &.is-dragover {
            background-color: var(--el-color-primary-light-9);
          }
        }
      }
    }
  }
  .style-box {
    height: var(--height);
    border: 2px dashed var(--el-border-color);
    border-radius: 20px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition:
      border var(--el-transition-duration),
      background-color 0.5s;
    &:hover {
      border-color: var(--el-color-primary);
    }
    .mask {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      color: var(--my-neutral);
      user-select: none;
      pointer-events: none; /* 允许点击穿透 */
      .icon {
        font-size: 28px;
      }
      .text {
        font-weight: bold;
        margin-left: 10px;
      }
    }
  }
}
</style>
