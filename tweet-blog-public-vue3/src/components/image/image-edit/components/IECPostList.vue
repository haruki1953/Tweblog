<script setup lang="ts">
import type { ImageStoreData, ImageUpdateJsonType } from '@/types'
import { formatTimeAgoChs } from '@/utils'
import { computed } from 'vue'
import { ChatSquare } from '@element-plus/icons-vue'
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

const { imageByIndex } = useImageEditCardController({
  propsnotPreview,
  propsimageSelect,
  selectedImages,
  formModel,
  imgIndex
})
</script>
<template>
  <div class="i-e-c-post-list">
    <div class="lable">推文</div>
    <div class="post-link-list">
      <div
        class="post-link-item"
        v-for="item in imageByIndex.posts"
        :key="item.id"
        @click="$router.push({ name: 'post', params: { id: item.id } })"
      >
        <div class="content">
          <el-icon :size="15">
            <ChatSquare />
          </el-icon>
          <div class="text">
            {{ item.content }}
          </div>
        </div>
        <div class="date">{{ formatTimeAgoChs(item.createdAt) }}</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.lable {
  margin: 0 0 2px 16px;
  font-size: 12px;
  color: var(--color-text-soft);
}

.post-link-list {
  .post-link-item {
    height: 30px;
    margin-bottom: 5px;
    padding: 0 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--color-background-soft);
    border-radius: 10px;
    transition:
      background-color 0.5s,
      color 0.2s,
      transform 0.2s,
      box-shadow 0.5s;
    cursor: pointer;
    &:hover {
      transform: scale(1.04, 1.04);
      box-shadow: var(--el-box-shadow-lighter);
    }
    .content {
      width: 60%;
      display: flex;
      align-items: center;
      font-size: 12px;
      // color: var(--color-text-soft);
      .el-icon {
        margin-right: 5px;
      }
      .text {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
    .date {
      display: flex;
      align-items: center;
      font-size: 12px;
      // color: var(--color-text-soft);
    }
  }
}
</style>
