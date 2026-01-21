<script setup lang="ts">
import { Plus, Search } from '@element-plus/icons-vue'
import { computed, ref } from 'vue'
import type { ProfileAddAvatarData } from '@/types'
import { useProfileStore, useStatesStore } from '@/stores'
import { faBandsGroupList } from '@/config'

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

const model = defineModel<string[]>({
  required: true
})

const profileStore = useProfileStore()

const searchKey = ref('')

const searchClass = computed(() => {
  return profileStore.searchFaBrandClass(searchKey.value)
})

const isSelected = (faClass: string) => {
  const find = model.value.find((i) => i === faClass)
  if (find) {
    return true
  } else {
    return false
  }
}
const selectFa = (faClass: string) => {
  profileStore.commonFaBrandClassAdd(faClass)
  if (isSelected(faClass)) {
    if (!props.couldCancel) {
      return
    }
    model.value = model.value.filter((i) => i !== faClass)
  } else {
    model.value.push(faClass)
    if (model.value.length > props.max) {
      model.value = model.value.slice(-props.max)
    }
  }
}

/* 样式控制 */
// const boxRef = ref<HTMLElement | null>(null)
// const boxSize = useElementSize(boxRef)
// const colSpan = computed(() => {
//   if (boxRef.value == null) {
//     return 24
//   }
//   // if (boxSize.width.value > 500) {
//   //   return 12
//   // }
//   return 24
// })

const statesStore = useStatesStore()
// 在明暗切换时不显示渐变遮罩
const showGradientMask = computed(() => !statesStore.isDarkTransitioning)

// 限制图标显示个数
const faBandsGroupListShowLimitNum = ref(20)
const faBandsGroupListShowLimitAdd = () => {
  faBandsGroupListShowLimitNum.value += 20
}
const faBandsGroupListShowLimited = computed(() => {
  return faBandsGroupList.slice(0, faBandsGroupListShowLimitNum.value)
})
const faBandsGroupListShowLimitButton = computed(() => {
  return faBandsGroupListShowLimitNum.value < faBandsGroupList.length
})
</script>
<template>
  <div class="social-medias-selector" ref="boxRef">
    <div class="search-image-row">
      <div class="search-input-row">
        <el-input
          v-model="searchKey"
          :prefix-icon="Search"
          placeholder="搜索标志"
          class="control-input"
          clearable
        ></el-input>
      </div>
      <div class="selector-image-row">
        <el-scrollbar>
          <div class="scroll-image-box">
            <div><div class="scroll-gasket"></div></div>
            <TransitionGroup name="fade-slide-list">
              <div
                class="item-image-box social-medias-item"
                v-for="item in searchClass"
                :key="item"
                :class="{
                  // selected: isSelected(item)
                }"
                @click="selectFa(item)"
              >
                <el-icon :class="item" size="20"></el-icon>
              </div>
            </TransitionGroup>
            <div><div class="scroll-gasket"></div></div>
          </div>
        </el-scrollbar>
        <div class="gradient-mask-left" v-show="showGradientMask"></div>
        <div class="gradient-mask-right" v-show="showGradientMask"></div>
      </div>
    </div>
    <el-divider border-style="dotted" />
    <div class="selector-image-row">
      <el-scrollbar>
        <div class="scroll-image-box">
          <div><div class="scroll-gasket"></div></div>
          <div
            class="group-image-box"
            v-for="(group, index) in faBandsGroupListShowLimited"
            :key="index"
          >
            <div
              class="item-image-box social-medias-item"
              v-for="item in group"
              :key="item"
              :class="{
                // selected: isSelected(item)
              }"
              @click="selectFa(item)"
            >
              <el-icon :class="item" size="20"></el-icon>
            </div>
          </div>
          <div
            class="group-more-button"
            v-show="faBandsGroupListShowLimitButton"
          >
            <el-button
              @click="faBandsGroupListShowLimitAdd"
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
  </div>
</template>

<style lang="scss" scoped>
.el-divider {
  width: 90%;
  margin: 4px auto;
  transition: all 0.5s;
  --el-border-color: var(--color-border);
}

.search-image-row {
  .search-input-row {
    max-width: 500px;
    margin: 0 auto;
    padding: 10px;
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
  padding: 2px 0 6px 0;
  .social-medias-item {
    margin: 3px;
    padding: 6px;
    border-radius: 8px;
    transition:
      background-color 0.5s,
      color 0.2s,
      transform 0.2s;
    cursor: pointer;
    &:hover {
      background-color: var(--color-background-mute);
      // transform: scale(1.05, 1.05);
    }
    &.selected {
      background-color: var(--el-color-primary-light-7);
    }
    .el-icon {
      display: flex;
    }
  }
  .scroll-gasket {
    width: 10px;
  }
}
.group-more-button {
  margin-left: 5px;
  display: flex;
  align-items: center;
  .el-button {
    display: flex;
  }
}

.control-input {
  display: flex;
  width: 100%;
  :deep() {
    .el-input__wrapper {
      padding: 1px 20px;
      border-radius: 20px;
      background-color: var(--color-background);
      transition: all 0.5s;
      overflow: hidden;

      .el-input__inner {
        margin-left: 5px;
      }
    }

    .el-input-number__decrease,
    .el-input-number__increase {
      background-color: transparent;
      transition:
        border 0.5s,
        color 0.2s;
    }
  }
}
</style>
