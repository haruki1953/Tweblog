<script setup lang="ts">
import {
  Upload,
  CircleCheckFilled,
  Setting,
  Plus
} from '@element-plus/icons-vue'
import { computed, ref } from 'vue'
import { useElementSize } from '@vueuse/core'
import type { BackendProfileStore, ProfileAddAvatarData } from '@/types'
import { useProfileStore, useStatesStore } from '@/stores'
import { useAvatarAddService } from '@/services'
import { profileAvatarUrl } from '@/utils'
import type AvatarSettingDialog from './AvatarSettingDialog.vue'
import type AvatarEditDialog from './AvatarEditDialog.vue'

const props = withDefaults(
  defineProps<{
    max?: number
    couldCancel?: boolean
    onUploaded?: (resData: ProfileAddAvatarData) => void
  }>(),
  {
    max: 1,
    couldCancel: false,
    onUploaded: () => {}
  }
)
const propsonUploaded = computed(() => props.onUploaded)

type ImgItem = BackendProfileStore['avatarArray'][number]
const model = defineModel<ImgItem[]>({
  required: true
})

const profileStore = useProfileStore()

/* 行为逻辑 */
const imageArray = computed(() => {
  return [...profileStore.avatarArray].sort(
    (a, b) => new Date(b.addAt).getTime() - new Date(a.addAt).getTime()
  )
  // return []
})
const isSelected = (img: ImgItem) => {
  const findImg = model.value.find((i) => i.uuid === img.uuid)
  if (findImg) {
    return true
  } else {
    return false
  }
}
const selectImage = (img: ImgItem, couldCancel?: boolean) => {
  let isCouldCancel
  if (couldCancel != null) {
    isCouldCancel = couldCancel
  } else {
    isCouldCancel = props.couldCancel
  }

  if (isSelected(img)) {
    if (!isCouldCancel) {
      return
    }
    model.value = model.value.filter(
      (selectedImg) => selectedImg.uuid !== img.uuid
    )
  } else {
    model.value.push(img)
    if (model.value.length > props.max) {
      model.value = model.value.slice(-props.max)
    }
  }
}

const selectImgById = (uuid: string, couldCancel?: boolean) => {
  const findImg = imageArray.value.find((i) => i.uuid === uuid)
  if (findImg) {
    // model.value = [findImg]
    selectImage(findImg, couldCancel)
  }
  return findImg
}
defineExpose({
  selectImgById
})

const { isUploading, uploadImage } = useAvatarAddService({
  propsonUploaded
})

/* 样式控制 */
const boxRef = ref<HTMLElement | null>(null)
const boxSize = useElementSize(boxRef)
const imageLargeSize = 100
const imageSmallSize = 60
const imageSizeMark = computed(() => {
  if (boxRef.value == null) {
    return 'small'
  }
  if (boxSize.width.value > 500) {
    return 'large'
  }
  return 'small'
})
const imageSize = computed(() => {
  if (imageSizeMark.value === 'large') {
    return imageLargeSize
  }
  return imageSmallSize
})

const statesStore = useStatesStore()
// 在明暗切换时不显示渐变遮罩
const showGradientMask = computed(() => !statesStore.isDarkTransitioning)

const refAvatarSettingDialog = ref<InstanceType<
  typeof AvatarSettingDialog
> | null>(null)
const refAvatarEditDialog = ref<InstanceType<typeof AvatarEditDialog> | null>(
  null
)

// 限制图片显示个数
const imageShowLimitNum = ref(8)
const imageShowLimitAdd = () => {
  imageShowLimitNum.value += 8
}
const imageShowLimited = computed(() => {
  return imageArray.value.slice(0, imageShowLimitNum.value)
})
const imageShowLimitButton = computed(() => {
  return imageShowLimitNum.value < imageArray.value.length
})
</script>
<template>
  <div class="avatar-selector" ref="boxRef">
    <AvatarEditDialog
      ref="refAvatarEditDialog"
      v-model="model"
    ></AvatarEditDialog>
    <AvatarSettingDialog ref="refAvatarSettingDialog"></AvatarSettingDialog>
    <div class="selector-image-row">
      <el-scrollbar>
        <div
          class="scroll-image-box"
          :class="{
            large: imageSizeMark === 'large',
            small: imageSizeMark === 'small'
          }"
        >
          <div><div class="scroll-gasket"></div></div>
          <div class="empty-text" v-if="imageShowLimited.length === 0">
            暂无头像，请上传
          </div>
          <TransitionGroup name="fade-slide-list">
            <div
              class="item-image-box"
              v-for="item in imageShowLimited"
              :key="item.uuid"
            >
              <div class="img-box">
                <el-avatar
                  shape="square"
                  :size="imageSize"
                  :src="profileAvatarUrl(item)"
                />
                <div class="img-mask" @click="selectImage(item)">
                  <Transition name="fade-pop">
                    <el-icon :size="imageSize / 2.2" v-show="isSelected(item)">
                      <CircleCheckFilled />
                    </el-icon>
                  </Transition>
                </div>
              </div>
            </div>
          </TransitionGroup>
          <div
            class="group-more-button"
            key="group-more-button"
            v-show="imageShowLimitButton"
          >
            <el-button
              @click="imageShowLimitAdd"
              type="primary"
              circle
              :icon="Plus"
            ></el-button>
          </div>
          <div><div class="scroll-gasket"></div></div>
        </div>
      </el-scrollbar>
      <div class="gradient-mask-left" v-show="showGradientMask"></div>
      <div class="gradient-mask-right" v-show="showGradientMask"></div>
    </div>
    <div class="selector-botton-row">
      <div class="upload-button-group">
        <el-upload
          :auto-upload="false"
          accept="image/*"
          :on-change="uploadImage"
          :show-file-list="false"
          class="upload-button"
          :class="{
            'is-uploading': isUploading
          }"
        >
          <el-button
            type="success"
            round
            size="small"
            :icon="Upload"
            :loading="isUploading"
          >
            添加头像
          </el-button>
        </el-upload>
        <el-button
          type="success"
          circle
          size="small"
          :icon="Setting"
          class="setting-button"
          @click="refAvatarSettingDialog?.open"
        ></el-button>
      </div>
      <div>
        <el-button
          type="info"
          round
          size="small"
          @click="refAvatarEditDialog?.open"
          :disabled="model.length === 0"
        >
          操作
        </el-button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.empty-text {
  color: var(--color-text-soft);
}
.selector-botton-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .upload-button-group {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    .setting-button {
      margin-left: 6px;
    }
    .upload-button {
      &.is-uploading {
        pointer-events: none; /* 禁用自身点击 */
      }
    }
  }
}

.selector-image-row {
  position: relative;
  .gradient-mask-left {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 10px;
    background: linear-gradient(
      to right,
      var(--color-background-soft),
      transparent
    );
    pointer-events: none; /* 允许点击穿透 */
  }
  .gradient-mask-right {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 10px;
    background: linear-gradient(
      to left,
      var(--color-background-soft),
      transparent
    );
    pointer-events: none; /* 允许点击穿透 */
  }
}
.scroll-image-box {
  position: relative;
  display: flex;
  padding: 10px 0;
  .item-image-box {
    position: relative;
    padding: 0 3px;
  }
  .scroll-gasket {
    width: 10px;
  }
  &.large {
    .item-image-box {
      padding: 0 5px;
    }
    .scroll-gasket {
      width: 15px;
    }
  }
}
.img-box {
  position: relative;
  &:hover {
    .el-avatar,
    .img-mask {
      transform: scale(1.05, 1.05);
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
  .el-avatar {
    display: flex;
    border: 2px solid var(--color-background-mute);
    background-color: transparent;
    user-select: none;
    transition:
      transform 0.2s,
      border 0.5s;
  }
}

.group-more-button {
  margin-left: 15px;
  display: flex;
  align-items: center;
  .el-button {
    display: flex;
  }
}
</style>
