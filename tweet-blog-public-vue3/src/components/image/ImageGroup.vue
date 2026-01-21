<script setup lang="ts">
import { useImageStore } from '@/stores'
import type { Image } from '@/types'
import { imgSamllUrl, useImageViewerOptimization } from '@/utils'
import { useElementSize } from '@vueuse/core'
import { computed } from 'vue'
import { watch } from 'vue'
import { ref } from 'vue'

const imgIndex = defineModel<number>('index')

const props = withDefaults(
  defineProps<{
    // data 不超过4个，更多的图片通过多个ImageGroup实现
    data: Image[]
    // dataAll 通过多个ImageGroup实现时，全部的数据
    dataAll?: Image[]
    backgroundColor?: '' | 'soft'
    notPreview?: boolean
    mini?: boolean
    aspectRatio169?: boolean
    notAlt?: boolean
    notRadiusTop?: boolean
    notRadiusBottom?: boolean
  }>(),
  {
    backgroundColor: '',
    notPreview: false,
    mini: false,
    aspectRatio169: false,
    notAlt: false,
    notRadiusTop: false,
    notRadiusBottom: false
  }
)

const img1 = ref<HTMLElement | null>(null)
const img1ShowMode = ref<'normal' | 'ratio169' | 'ratio41' | 'ratio45'>(
  'normal'
)
const img1Size = useElementSize(img1)
const calcImg1Ratio = async () => {
  if (!img1Size.width.value || !img1Size.height.value) {
    return
  }
  const width = img1Size.width.value
  const height = img1Size.height.value

  // width / height
  const maxRatio = 4 / 5
  const minRatio = 4 / 1
  const normalRatio = 16 / 9

  const maxHeight = width / maxRatio
  const minHeight = width / minRatio
  const normalHeight = width / normalRatio

  if (props.aspectRatio169) {
    img1ShowMode.value = 'ratio169'
  } else if (props.mini) {
    if (height > normalHeight + 1) {
      img1ShowMode.value = 'ratio169'
    } else if (height < minHeight) {
      img1ShowMode.value = 'ratio41'
    }
  } else {
    if (height > maxHeight) {
      img1ShowMode.value = 'ratio45'
    } else if (height < minHeight) {
      img1ShowMode.value = 'ratio41'
    }
  }
}

watch(() => `${img1Size.width.value} ${img1Size.height.value}`, calcImg1Ratio)

const imgSmallList = computed(() => {
  return props.data.map((i) => {
    return imgSamllUrl(i)
  })
})

const isIndex = (num: number) => {
  if (props.dataAll == null) {
    if (num === imgIndex.value) {
      return true
    } else {
      return false
    }
  } else {
    // 有 dataAll 时以其为准
    const imgIndexDataAll = imgIndexDataAllCalc(num)
    if (imgIndexDataAll === imgIndex.value) {
      return true
    } else {
      return false
    }
  }
}

const previewSrcList = computed(() => {
  if (props.notPreview) {
    return undefined
  } else {
    return imageViewerOptimization.previewSrcList.value
  }
})

// 计算当前data的索引对于dataAll的索引
const imgIndexDataAllCalc = (num: number) => {
  // 没有dataAll，返回null
  if (props.dataAll == null) {
    return null
  }
  if (props.data.length < num - 1) {
    return null
  }
  const imgIndexDataAll = props.dataAll.findIndex(
    (i) => i.id === props.data[num].id
  )
  if (imgIndexDataAll === -1) {
    return null
  }
  return imgIndexDataAll
}

const initialIndexCalc = (num: number) => {
  if (props.dataAll == null) {
    return num
  } else {
    // 有 dataAll 时以其为准
    const imgIndexDataAll = imgIndexDataAllCalc(num)
    if (imgIndexDataAll == null) {
      return 0
    }
    return imgIndexDataAll
  }
}

const onImgClick = (num: number) => {
  if (imgIndex.value === undefined) {
    return
  }
  if (props.dataAll == null) {
    imgIndex.value = num
    return
  } else {
    // 有 dataAll 时以其为准
    const imgIndexDataAll = imgIndexDataAllCalc(num)
    if (imgIndexDataAll == null) {
      return
    }
    imgIndex.value = imgIndexDataAll
  }
}

// 图片预览优化
const imageViewerOptimization = useImageViewerOptimization({
  images: computed(() => {
    if (props.dataAll != null) {
      return props.dataAll
    }
    return props.data
  })
})
const onViewerShow = imageViewerOptimization.enableOnViewerShow
const onViewerClose = imageViewerOptimization.disableOnViewerClose

const imageStore = useImageStore()

// alt点击
const onAltClick = (num: number) => {
  imageStore.openAltDialog(props.data[num])
}
</script>
<template>
  <div
    class="image-group"
    :class="{
      'img-background-soft': backgroundColor === 'soft',
      'not-radius-top': notRadiusTop,
      'not-radius-bottom': notRadiusBottom
    }"
    v-if="data.length > 0"
  >
    <el-row v-if="data.length === 1">
      <el-col :span="24">
        <div class="image-box" ref="img1">
          <el-image
            class="post-img img1-1"
            fit="cover"
            :key="imgSmallList[0]"
            :src="imgSmallList[0]"
            :alt="data[0].alt"
            @click="onImgClick(0)"
            :initial-index="initialIndexCalc(0)"
            :preview-src-list="previewSrcList"
            hide-on-click-modal
            @close="onViewerClose"
            @show="onViewerShow"
            preview-teleported
            :class="{
              ratio169: img1ShowMode === 'ratio169',
              ratio41: img1ShowMode === 'ratio41',
              ratio45: img1ShowMode === 'ratio45'
            }"
          ></el-image>
          <div
            class="alt-btn"
            v-if="!notAlt && data[0].alt"
            @click="onAltClick(0)"
          >
            ALT
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row v-else-if="data.length === 2">
      <el-col :span="12">
        <div class="image-box">
          <el-image
            class="post-img img2-1"
            fit="cover"
            :src="imgSmallList[0]"
            :alt="data[0].alt"
            @click="onImgClick(0)"
            :class="{ 'is-index': isIndex(0) }"
            :initial-index="initialIndexCalc(0)"
            :preview-src-list="previewSrcList"
            hide-on-click-modal
            @close="onViewerClose"
            @show="onViewerShow"
            preview-teleported
          ></el-image>
          <div
            class="alt-btn"
            v-if="!notAlt && data[0].alt"
            @click="onAltClick(0)"
          >
            ALT
          </div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="image-box">
          <el-image
            class="post-img img2-2"
            fit="cover"
            :src="imgSmallList[1]"
            :alt="data[1].alt"
            @click="onImgClick(1)"
            :class="{ 'is-index': isIndex(1) }"
            :initial-index="initialIndexCalc(1)"
            :preview-src-list="previewSrcList"
            hide-on-click-modal
            @close="onViewerClose"
            @show="onViewerShow"
            preview-teleported
          ></el-image>
          <div
            class="alt-btn"
            v-if="!notAlt && data[1].alt"
            @click="onAltClick(1)"
          >
            ALT
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row v-else-if="data.length === 3">
      <el-col :span="12">
        <div class="image-box">
          <el-image
            class="post-img img3-1"
            fit="cover"
            :src="imgSmallList[0]"
            :alt="data[0].alt"
            @click="onImgClick(0)"
            :class="{ 'is-index': isIndex(0) }"
            :initial-index="initialIndexCalc(0)"
            :preview-src-list="previewSrcList"
            hide-on-click-modal
            @close="onViewerClose"
            @show="onViewerShow"
            preview-teleported
          ></el-image>
          <div
            class="alt-btn"
            v-if="!notAlt && data[0].alt"
            @click="onAltClick(0)"
          >
            ALT
          </div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="image-box">
          <el-image
            class="post-img img3-2"
            fit="cover"
            :src="imgSmallList[1]"
            :alt="data[1].alt"
            @click="onImgClick(1)"
            :class="{ 'is-index': isIndex(1) }"
            :initial-index="initialIndexCalc(1)"
            :preview-src-list="previewSrcList"
            hide-on-click-modal
            @close="onViewerClose"
            @show="onViewerShow"
            preview-teleported
          ></el-image>
          <div
            class="alt-btn"
            v-if="!notAlt && data[1].alt"
            @click="onAltClick(1)"
          >
            ALT
          </div>
        </div>
        <div class="image-box">
          <el-image
            class="post-img img3-3"
            fit="cover"
            :src="imgSmallList[2]"
            :alt="data[2].alt"
            @click="onImgClick(2)"
            :class="{ 'is-index': isIndex(2) }"
            :initial-index="initialIndexCalc(2)"
            :preview-src-list="previewSrcList"
            hide-on-click-modal
            @close="onViewerClose"
            @show="onViewerShow"
            preview-teleported
          ></el-image>
          <div
            class="alt-btn"
            v-if="!notAlt && data[2].alt"
            @click="onAltClick(2)"
          >
            ALT
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row v-else>
      <el-col :span="12">
        <div class="image-box">
          <el-image
            class="post-img img4-1"
            fit="cover"
            :src="imgSmallList[0]"
            :alt="data[0].alt"
            @click="onImgClick(0)"
            :class="{ 'is-index': isIndex(0) }"
            :initial-index="initialIndexCalc(0)"
            :preview-src-list="previewSrcList"
            hide-on-click-modal
            @close="onViewerClose"
            @show="onViewerShow"
            preview-teleported
          ></el-image>
          <div
            class="alt-btn"
            v-if="!notAlt && data[0].alt"
            @click="onAltClick(0)"
          >
            ALT
          </div>
        </div>
        <div class="image-box">
          <el-image
            class="post-img img4-3"
            fit="cover"
            :src="imgSmallList[2]"
            :alt="data[2].alt"
            @click="onImgClick(2)"
            :class="{ 'is-index': isIndex(2) }"
            :initial-index="initialIndexCalc(2)"
            :preview-src-list="previewSrcList"
            hide-on-click-modal
            @close="onViewerClose"
            @show="onViewerShow"
            preview-teleported
          ></el-image>
          <div
            class="alt-btn"
            v-if="!notAlt && data[2].alt"
            @click="onAltClick(2)"
          >
            ALT
          </div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="image-box">
          <el-image
            class="post-img img4-2"
            fit="cover"
            :src="imgSmallList[1]"
            :alt="data[1].alt"
            @click="onImgClick(1)"
            :class="{ 'is-index': isIndex(1) }"
            :initial-index="initialIndexCalc(1)"
            :preview-src-list="previewSrcList"
            hide-on-click-modal
            @close="onViewerClose"
            @show="onViewerShow"
            preview-teleported
          ></el-image>
          <div
            class="alt-btn"
            v-if="!notAlt && data[1].alt"
            @click="onAltClick(1)"
          >
            ALT
          </div>
        </div>
        <div class="image-box">
          <el-image
            class="post-img img4-4"
            fit="cover"
            :src="imgSmallList[3]"
            :alt="data[3].alt"
            @click="onImgClick(3)"
            :class="{ 'is-index': isIndex(3) }"
            :initial-index="initialIndexCalc(3)"
            :preview-src-list="previewSrcList"
            hide-on-click-modal
            @close="onViewerClose"
            @show="onViewerShow"
            preview-teleported
          ></el-image>
          <div
            class="alt-btn"
            v-if="!notAlt && data[3].alt"
            @click="onAltClick(3)"
          >
            ALT
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.image-group {
  &.not-radius-top {
    .post-img {
      border-top-left-radius: 0;
      border-top-right-radius: 0;
      &.is-index::before {
        border-top-left-radius: 0;
        border-top-right-radius: 0;
      }
    }
  }
  &.not-radius-bottom {
    .post-img {
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
      &.is-index::before {
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
      }
    }
  }
}
.image-box {
  position: relative;
  .alt-btn {
    position: absolute;
    width: 40px;
    height: 20px;
    left: 12px;
    bottom: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 20px;
    font-size: 13px;
    font-weight: bold;
    color: rgb(255, 255, 255);
    background-color: rgba(0, 0, 0, 0.3);
    border-radius: 8px;
    cursor: pointer;
    user-select: none;
    transition: transform 0.2s;
    &:hover {
      transform: scale(1.1, 1.1);
    }
  }
}
.post-img {
  display: block;
  width: 100%;
  --aspect-ratio-val: 16 / 9;
  --border-radius-val: 20px;
  aspect-ratio: var(--aspect-ratio-val);
  border-radius: var(--border-radius-val);
  border: 1px solid var(--color-background);
  transition: border 0.5s;
  user-select: none;
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
      background-color: var(--color-background);
    }
  }
  &.is-index::before {
    content: '';
    border-radius: var(--border-radius-val);
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    box-shadow:
      0 0 3px 3px var(--el-color-primary),
      0 0 3px 3px var(--el-color-primary) inset;
    pointer-events: none; /* 让阴影不影响鼠标交互 */
    z-index: 1; /* 将阴影置于图片上方 */
  }
}
.img-background-soft .post-img {
  :deep() {
    .el-image__placeholder,
    .el-image__error {
      background-color: var(--color-background-soft);
    }
  }
}

.img1-1 {
  aspect-ratio: unset;
  &.ratio169 {
    aspect-ratio: 16 / 9;
  }
  &.ratio41 {
    aspect-ratio: 4 / 1;
  }
  &.ratio45 {
    aspect-ratio: 4 / 5;
  }
}
.img2-1 {
  --aspect-ratio-val: 8 / 9;
  --border-radius-val: 20px 0 0 20px;
}
.img2-2 {
  --aspect-ratio-val: 8 / 9;
  --border-radius-val: 0 20px 20px 0;
}
.img3-1 {
  --aspect-ratio-val: 8 / 9;
  --border-radius-val: 20px 0 0 20px;
}
.img3-2 {
  --aspect-ratio-val: 16 / 9;
  --border-radius-val: 0 20px 0 0;
}
.img3-3 {
  --aspect-ratio-val: 16 / 9;
  --border-radius-val: 0 0 20px 0;
}
.img4-1 {
  --aspect-ratio-val: 16 / 9;
  --border-radius-val: 20px 0 0 0;
}
.img4-2 {
  --aspect-ratio-val: 16 / 9;
  --border-radius-val: 0 20px 0 0;
}
.img4-3 {
  --aspect-ratio-val: 16 / 9;
  --border-radius-val: 0 0 0 20px;
}
.img4-4 {
  --aspect-ratio-val: 16 / 9;
  --border-radius-val: 0 0 20px 0;
}
</style>
