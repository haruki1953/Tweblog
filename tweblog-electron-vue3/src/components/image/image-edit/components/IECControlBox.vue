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
import { useImageEditService } from '@/services'

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

const {
  isSending,
  updateImage,
  disableDeleteImage,
  disableDeleteOriginal,
  isImageDeleting,
  deleteImage,
  isOriginalDeleting,
  deleteOriginal
} = useImageEditService({
  selectedImages,
  formModel,
  isIndexAble,
  imageByIndex
})
</script>
<template>
  <div class="i-e-c-control-box">
    <div class="control-box">
      <div class="control-row">
        <!-- 修改alt -->
        <div class="update-alt-box">
          <div class="control-lable">ALT</div>
          <Transition name="fade" mode="out-in">
            <div class="input-box" :key="imageByIndex.id">
              <el-input
                v-model="formModel.alt"
                placeholder="添加描述"
                :autosize="{ minRows: 1, maxRows: 10 }"
                resize="none"
                type="textarea"
                size="large"
                class="textarea"
                :maxlength="imageConfig.maxAltCharactersOnSend"
                show-word-limit
                suffix-icon="Calendar"
              />
            </div>
          </Transition>
          <Transition name="fade" mode="out-in">
            <div class="button-box" :key="imageByIndex.id">
              <el-button
                round
                type="primary"
                size="small"
                @click="updateImage"
                :loading="isSending"
              >
                保存
              </el-button>
              <el-button
                round
                type="info"
                size="small"
                @click="initFormModel"
                :disabled="isSending"
              >
                取消
              </el-button>
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
      <div class="control-divider"></div>
      <!-- 删除图片 -->
      <div class="control-row">
        <div class="control-lable">删除图片</div>
        <Transition name="fade" mode="out-in">
          <div class="button-box" :key="imageByIndex.id">
            <el-button
              round
              type="danger"
              size="small"
              disabled
              v-if="disableDeleteImage"
            >
              图片使用中
            </el-button>
            <el-button
              round
              type="danger"
              size="small"
              :loading="isImageDeleting"
              @click="deleteImage"
              v-else
            >
              删除图片
            </el-button>
            <el-button
              round
              type="warning"
              size="small"
              :disabled="disableDeleteOriginal"
              :loading="isOriginalDeleting"
              @click="deleteOriginal"
            >
              删除原图
            </el-button>
          </div>
        </Transition>
      </div>
      <!-- </template> -->
    </div>
  </div>
</template>

<style lang="scss" scoped>
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
  .el-button + .el-button {
    margin-left: 8px;
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
