<script setup lang="ts">
import type { ImageStoreData, ImageUpdateJsonType } from '@/types'
import { computed } from 'vue'
import {
  imgLargeUrl,
  imgSamllUrl,
  imgOriginalUrl,
  formatFileSize
} from '@/utils'
import { imageConfig } from '@/config'
import { useImageEditCardController } from '../controller'

const props = withDefaults(
  defineProps<{
    notPreview?: boolean
    imageSelect?: boolean
  }>(),
  {
    notPreview: false,
    imageSelect: false
  }
)
const propsnotPreview = computed(() => props.notPreview)
const propsimageSelect = computed(() => props.imageSelect)

const selectedImages = defineModel<ImageStoreData[]>('selectedImages', {
  required: true
})
const formModel = defineModel<Omit<ImageUpdateJsonType, 'id'>>('formModel', {
  required: true
})
const imgIndex = defineModel<number>('imgIndex', { required: true })

const { isIndexAble, imageByIndex, initFormModel } = useImageEditCardController(
  {
    propsnotPreview,
    propsimageSelect,
    selectedImages,
    formModel,
    imgIndex
  }
)

// const {
//   isSending,
//   updateImage,
//   disableDeleteImage,
//   disableDeleteOriginal,
//   isImageDeleting,
//   deleteImage,
//   isOriginalDeleting,
//   deleteOriginal
// } = useImageEditService({
//   selectedImages,
//   formModel,
//   isIndexAble,
//   imageByIndex
// })
</script>
<template>
  <div class="i-e-c-control-box">
    <div class="control-box">
      <div class="control-row">
        <!-- 修改alt -->
        <div class="update-alt-box">
          <div class="control-lable">ALT</div>
          <Transition name="fade" mode="out-in">
            <div class="content-box" :key="imageByIndex.id">
              <div class="content">
                <TextWithLink
                  :data="imageByIndex.alt || '暂无描述'"
                ></TextWithLink>
              </div>
            </div>
          </Transition>
        </div>
      </div>
      <!-- <template v-if="!imageSelect"> -->
      <div class="control-divider"></div>
      <!-- 各版本图片 -->
      <div class="control-row">
        <div class="control-lable">各版本图片</div>
        <Transition name="fade" mode="out-in">
          <div class="button-box" :key="imageByIndex.id">
            <el-button
              round
              type="info"
              size="small"
              :disabled="imageByIndex.smallSize === 0"
              :tag="imageByIndex.smallSize === 0 ? 'button' : 'a'"
              :href="imgSamllUrl(imageByIndex)"
              target="_blank"
              rel="noopener noreferrer"
            >
              小图 {{ formatFileSize(imageByIndex.smallSize) }}
            </el-button>
            <el-button
              round
              type="success"
              size="small"
              :disabled="imageByIndex.largeSize === 0"
              :tag="imageByIndex.largeSize === 0 ? 'button' : 'a'"
              :href="imgLargeUrl(imageByIndex)"
              target="_blank"
              rel="noopener noreferrer"
            >
              大图 {{ formatFileSize(imageByIndex.largeSize) }}
            </el-button>
            <el-button
              round
              type="warning"
              size="small"
              :disabled="imageByIndex.originalSize === 0"
              :tag="imageByIndex.originalSize === 0 ? 'button' : 'a'"
              :href="imgOriginalUrl(imageByIndex)"
              target="_blank"
              rel="noopener noreferrer"
            >
              原图 {{ formatFileSize(imageByIndex.originalSize) }}
            </el-button>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.content-box {
  display: flex;
  justify-content: center;
  // padding: 0 0 8px 0;
  margin: 0 10px 10px 10px;
  .content {
    max-width: 100%;
    color: var(--color-text-soft);
    white-space: pre-wrap;
    // 解决在全英文无空格时，文字无法换行的问题
    word-wrap: break-word;
    transition: all 0.2s;
    font-size: 14px;
  }
}

.input-box {
  .textarea {
    // background-color: var(--color-background-soft);
    // transition: all 0.5s;
    margin-bottom: 8px;
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
        bottom: -30px;
        user-select: none;
      }
    }
  }
}

.button-box {
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
.control-box {
  background-color: var(--color-background-soft);
  border-radius: 20px;
  transition:
    background-color 0.5s,
    box-shadow 0.5s;
  &:hover {
    box-shadow: var(--el-box-shadow-lighter);
  }
}
.control-row {
  padding: 8px;
}
.control-lable {
  font-size: 12px;
  color: var(--color-text-soft);
  margin: 0 0 2px 8px;
}
.control-divider {
  // height: 2px;
  // background-color: var(--color-background);
  // // background-color: var(--el-bg-color);
  // transition: background-color 0.5s;
  border-top: 2.4px solid var(--color-background); // divider
  transition: border 0.5s;
}
</style>
