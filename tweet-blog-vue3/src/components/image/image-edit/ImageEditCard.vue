<script setup lang="ts">
import type { ImageStoreData, ImageUpdateJsonType } from '@/types'
import { computed, watch } from 'vue'
import { ref } from 'vue'
import { useImageEditCardController } from './controller'

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

const selectedImages = defineModel<ImageStoreData[]>({ required: true })

const formModel = ref<Omit<ImageUpdateJsonType, 'id'>>({})

const imgIndex = ref(0)

const { handleIndex, initFormModel, imageByIndex } = useImageEditCardController(
  {
    propsnotPreview,
    propsimageSelect,
    selectedImages,
    formModel,
    imgIndex
  }
)

watch(
  () => ({
    imgIds: selectedImages.value.map((i) => i.id),
    imgIndex: imgIndex.value
  }),
  () => {
    handleIndex()
    initFormModel()
  },
  { immediate: true }
)

const cancelSelectedImg = () => {
  selectedImages.value.splice(imgIndex.value, 1)
}

const isMultiple = computed(() => {
  if (selectedImages.value.length > 1) {
    return true
  } else {
    return false
  }
})
</script>
<template>
  <div class="image-edit-card">
    <div v-if="selectedImages.length > 0">
      <!-- 图片预览 -->
      <div class="image-box">
        <ImageGroupUnlimited
          :data="selectedImages"
          v-model:index="imgIndex"
          :notPreview="notPreview"
          notAlt
        ></ImageGroupUnlimited>
        <div class="image-select-box" v-if="imageSelect">
          <div class="lable">
            <template v-if="isMultiple">
              第 {{ imgIndex + 1 }} 个图片
            </template>
          </div>
          <el-button
            round
            type="danger"
            size="small"
            @click="cancelSelectedImg"
          >
            取消选择
          </el-button>
        </div>
      </div>
      <!-- 图片控制盒子 -->
      <div class="image-control-box">
        <IECControlBox
          :notPreview="notPreview"
          :imageSelect="imageSelect"
          v-model:selectedImages="selectedImages"
          v-model:formModel="formModel"
          v-model:imgIndex="imgIndex"
        ></IECControlBox>
      </div>
      <!-- 帖子 -->
      <div
        class="post-list-box"
        v-if="!imageSelect && imageByIndex.posts.length > 0"
      >
        <IECPostList
          :notPreview="notPreview"
          :imageSelect="imageSelect"
          v-model:selectedImages="selectedImages"
          v-model:formModel="formModel"
          v-model:imgIndex="imgIndex"
        ></IECPostList>
      </div>
    </div>
    <!-- 骨架屏 -->
    <div class="image-card-skeleton" v-else>
      <el-skeleton>
        <template #template>
          <el-skeleton-item variant="image" />
        </template>
      </el-skeleton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.image-box {
  margin: 10px 0;
}

.lable {
  margin: 0 0 2px 16px;
  font-size: 12px;
  color: var(--color-text-soft);
}
.image-select-box {
  margin: 5px 10px 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .lable {
    margin: 0;
  }
}

.image-card-skeleton {
  margin: 10px 0;
  .el-skeleton__image {
    width: 100%;
    height: 400px;
    border-radius: 20px;
    background-color: var(--color-background-soft);
    transition: all 0.5s;
    :deep() {
      svg {
        transition: all 0.2s;
      }
    }
  }
}

.image-control-box {
  margin-top: 15px;
}

.post-list-box {
  margin-top: 10px;
}
</style>
