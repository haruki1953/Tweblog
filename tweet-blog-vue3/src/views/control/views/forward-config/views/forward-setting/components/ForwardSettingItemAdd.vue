<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import { useElementSize } from '@vueuse/core'
import { computed } from 'vue'
import { ref } from 'vue'
import type { UseForwardSettingListInFormControl } from './dependencies'
import ForwardSettingFormAdd from './ForwardSettingFormAdd.vue'

const props = defineProps<{
  useForwardSettingListInFormControl: UseForwardSettingListInFormControl
}>()

const isEditing = ref(false)

const toggleEdit = () => {
  isEditing.value = !isEditing.value
}

const boxRef = ref<HTMLElement | null>(null)
const boxSize = useElementSize(boxRef)
const boxStyleHeight = computed(() => {
  return `${boxSize.height.value}px`
})
</script>
<template>
  <div class="forward-setting-item">
    <div
      class="info-box add"
      :class="{
        adding: isEditing
      }"
    >
      <div @click="toggleEdit" class="top-line">
        <div class="info-row">
          <div class="mask">
            <el-icon class="icon"><Plus /></el-icon>
            <span class="text">添加转发配置</span>
          </div>
        </div>
      </div>
      <div
        class="style-box"
        :style="{
          height: boxStyleHeight
        }"
      >
        <div class="info-divider"></div>
        <Transition name="fade05">
          <div v-if="isEditing" ref="boxRef">
            <div class="info-row form">
              <ForwardSettingFormAdd
                :useForwardSettingListInFormControl="
                  useForwardSettingListInFormControl
                "
                :toggleEdit="toggleEdit"
              ></ForwardSettingFormAdd>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.style-box {
  overflow: hidden;
  transition: height 0.8s ease-in-out;
  // transition: height 1s;
}

.info-box {
  margin-bottom: 10px;
  background-color: var(--color-background-soft);
  transition: background-color 0.5s;
  border-radius: 20px;
  transition:
    background-color 0.5s,
    box-shadow 0.5s;
  &:hover {
    box-shadow: var(--el-box-shadow-lighter);
    // background-color: var(--color-background-mute);
  }
}

.info-divider {
  // height: 2px;
  // background-color: var(--color-background);
  // transition: background-color 0.5s;
  border-top: 2.4px solid var(--color-background); // divider
  transition: border 0.5s;
}

.top-line {
  height: 45px;
  cursor: pointer;
  user-select: none;
}
.info-row {
  margin: 0 20px;
  padding: 10px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  &.form {
    display: block;
    padding: 20px 0;
  }
}

.add {
  background-color: var(--color-background);
  border: 2px dashed var(--el-border-color);
  transition:
    border var(--el-transition-duration),
    background-color 0.5s,
    box-shadow 0.5s;
  &:hover {
    background-color: var(--color-background-soft);
    border-color: var(--el-color-primary);
  }
  &.adding {
    background-color: var(--color-background-soft);
    border-color: var(--el-color-primary);
  }
  .top-line {
    position: relative;
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
        font-size: 25px;
      }
      .text {
        font-weight: bold;
        margin-left: 10px;
      }
    }
  }
}
</style>
