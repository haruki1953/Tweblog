<script setup lang="ts">
import { useImageStore } from '@/stores'
import { computed, ref } from 'vue'
import { imgSamllUrl } from '@/utils'
import type { ImageStoreData } from '@/types'
import { CircleCheckFilled } from '@element-plus/icons-vue'
import { useElementSize, useScroll } from '@vueuse/core'
import { watch } from 'vue'

const model = defineModel<ImageStoreData[]>({ required: true })

const props = withDefaults(
  defineProps<{
    max?: number
    span?: number
    infiniteScroll?: boolean
    warpScroll?: ReturnType<typeof useScroll>
  }>(),
  {
    max: 1,
    infiniteScroll: false
  }
)

const imageStore = useImageStore()

const isSelected = (img: ImageStoreData) => {
  const findImg = model.value.find((i) => i.id === img.id)
  if (findImg) {
    return true
  } else {
    return false
  }
}

const selectImage = (img: ImageStoreData) => {
  if (isSelected(img)) {
    model.value = model.value.filter((selectedImg) => selectedImg.id !== img.id)
  } else {
    model.value.push(img)
    if (model.value.length > props.max) {
      model.value = model.value.slice(-props.max)
    }
  }
}

const boxRef = ref<HTMLElement | null>(null)
const boxSize = useElementSize(boxRef)
const imageSpan = computed(() => {
  if (props.span) {
    return props.span
  }
  if (boxRef.value == null) {
    return 8
  }
  if (boxSize.width.value > 500) {
    return 8
    // return 6
  } else {
    return 8
  }
})

const infiniteScrollFunc = () => {
  if (props.infiniteScroll) {
    imageStore.loadLimited()
  }
}

// 改为了在 src\router\index.ts 处理
// 至于为什么不在这里 onMounted 处理，是为了不打乱的滚动位置
// 如在帖子页和相册页切换时，重新获取就会打乱滚动位置
// onMounted(() => {
//   if (imageStore.isNeedReget) {
//     imageStore.reGetImages()
//     imageStore.setNeedReget(false)
//   }
// })

const selectImgById = (id: string) => {
  const findImg = imageStore.imageList.find((i) => i.id === id)
  if (findImg) {
    // model.value = [findImg]
    selectImage(findImg)
  }
  return findImg
}
defineExpose({
  selectImgById
})

watch(
  () => props.warpScroll?.arrivedState.bottom,
  () => {
    if (props.warpScroll?.arrivedState.bottom) {
      imageStore.loadLimited()
    }
  }
)
</script>
<template>
  <div
    class="image-list"
    ref="boxRef"
    v-infinite-scroll="infiniteScrollFunc"
    :infinite-scroll-distance="200"
    :infinite-scroll-delay="0"
    :infinite-scroll-immediate="false"
  >
    <!-- 
    v-infinite-scroll="infiniteScrollFunc"
    :infinite-scroll-distance="200" 
    -->
    <el-row :gutter="6">
      <TransitionGroup name="fade-slide-list">
        <el-col :span="24" v-if="imageStore.limitedList.length === 0">
          <TweetEmpty description="暂无图片"></TweetEmpty>
        </el-col>
        <el-col
          :span="imageSpan"
          v-for="image in imageStore.limitedList"
          :key="image.id"
          class="img-box"
        >
          <el-image fit="cover" :src="imgSamllUrl(image)"></el-image>
          <div class="img-mask" @click="selectImage(image)">
            <Transition name="fade-pop">
              <el-icon size="50" v-show="isSelected(image)">
                <CircleCheckFilled />
              </el-icon>
            </Transition>
          </div>
        </el-col>
      </TransitionGroup>
    </el-row>
    <div class="load-button-box" v-if="imageStore.isHaveMoreLimited">
      <el-button
        text
        type="primary"
        round
        size="small"
        :loading="imageStore.isLoadingLimited"
        @click="imageStore.loadLimited"
      >
        加载更多
      </el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.data-container {
  position: relative;
  .data-mounted-mask {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    div {
      width: 100%;
      height: 100%;
      background-color: var(--color-background);
      transition: all 0.5s;
    }
  }
}
.img-box {
  position: relative;
  margin-bottom: 6px;
  &:hover {
    .el-image,
    .img-mask {
      transform: scale(0.95, 0.95);
    }
  }
  .img-mask {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    user-select: none;
    cursor: pointer;
    transition: transform 0.2s;
    .el-icon {
      color: var(--el-color-success);
    }
  }
  // 有了上面的遮罩，图片就不会被拖动
  .el-image {
    display: block;
    width: 100%;
    --aspect-ratio-val: 1 / 1;
    --border-radius-val: 5px;
    aspect-ratio: var(--aspect-ratio-val);
    border-radius: var(--border-radius-val);
    border: 2px solid var(--color-background-mute);
    user-select: none;
    transition:
      transform 0.2s,
      border 0.5s;
    :deep() {
      .el-image__inner.is-loading {
        width: 100%;
        aspect-ratio: var(--aspect-ratio-val);
      }
      .el-image__placeholder,
      .el-image__error {
        position: static;
        width: 100%;
        border-radius: var(--border-radius-val);
        aspect-ratio: var(--aspect-ratio-val);
        transition: background-color 0.5s;
        background-color: var(--color-background-soft);
      }
    }
  }
}
.load-button-box {
  display: flex;
  justify-content: center;
  margin-top: 10px;
  .el-button {
    width: 50%;
    min-width: 100px;
    max-width: 200px;
  }
}
</style>
