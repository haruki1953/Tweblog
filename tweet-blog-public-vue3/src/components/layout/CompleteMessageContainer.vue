<script setup lang="ts">
import {
  CircleCloseFilled,
  DeleteFilled,
  RemoveFilled,
  SuccessFilled,
  WarningFilled
} from '@element-plus/icons-vue'
import { ref } from 'vue'

const props = withDefaults(
  defineProps<{
    backgroundNone?: boolean
    backgroundColor?: string
    size?: string | number
    duration?: number
  }>(),
  {
    backgroundNone: false,
    backgroundColor: 'var(--color-background)',
    // backgroundColor: 'inherit',
    size: 50,
    duration: 500
  }
)

const show = ref(false)
const icon = ref<'success' | 'warning' | 'error' | 'remove'>('success')

const success = async () => {
  if (show.value) {
    return
  }
  icon.value = 'success'
  show.value = true
  await new Promise((resolve) => setTimeout(resolve, props.duration))
  show.value = false
}
const warning = async () => {
  if (show.value) {
    return
  }
  icon.value = 'warning'
  show.value = true
  await new Promise((resolve) => setTimeout(resolve, props.duration))
  show.value = false
}
const error = async () => {
  if (show.value) {
    return
  }
  icon.value = 'error'
  show.value = true
  await new Promise((resolve) => setTimeout(resolve, props.duration))
  show.value = false
}
const remove = async () => {
  if (show.value) {
    return
  }
  icon.value = 'remove'
  show.value = true
  await new Promise((resolve) => setTimeout(resolve, props.duration))
  show.value = false
}

defineExpose({
  success,
  warning,
  error,
  remove
})
</script>
<template>
  <div class="complete-message-container">
    <div class="container-box">
      <slot></slot>
      <Transition name="fade">
        <div
          class="mask-background"
          v-show="show && !backgroundNone"
          :style="{
            backgroundColor
          }"
        ></div>
      </Transition>
      <Transition name="fade-pop">
        <div class="mask-message" v-show="show">
          <el-icon :size="size" v-show="icon === 'success'" class="success">
            <SuccessFilled />
          </el-icon>
          <el-icon :size="size" v-show="icon === 'warning'" class="warning">
            <WarningFilled />
          </el-icon>
          <el-icon :size="size" v-show="icon === 'error'" class="error">
            <CircleCloseFilled />
          </el-icon>
          <el-icon :size="size" v-show="icon === 'remove'" class="error">
            <DeleteFilled />
          </el-icon>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container-box {
  position: relative;
}
.mask-background,
.mask-message {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}
.mask-background {
  z-index: 1;
}
.mask-message {
  z-index: 2;
  .el-icon {
    &.success {
      color: var(--el-color-success);
    }
    &.warning {
      color: var(--el-color-warning);
    }
    &.error {
      color: var(--el-color-error);
    }
  }
}
</style>
