<script setup lang="ts">
import { ref } from 'vue'

// const props =
withDefaults(
  defineProps<{
    backgroundNone?: boolean
    backgroundColor?: string
    size?: 'default' | 'small'
    title?: string
    confirmType?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
    confirmText?: string
    cancelType?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
    cancelText?: string
  }>(),
  {
    backgroundNone: false,
    backgroundColor: 'var(--color-background)',
    confirmType: 'primary',
    confirmText: '确认',
    cancelType: 'info',
    cancelText: '取消'
  }
)

const show = ref(false)
const confirmClicked = ref(false)
let confirmResolve: (() => void) | null = null
let confirmReject: (() => void) | null = null

const handleConfirm = () => {
  confirmClicked.value = true
  show.value = false
  confirmResolve?.() // 执行 Promise 的 resolve
  confirmResolve = null
  confirmReject = null
}

const handleCancel = () => {
  show.value = false
  confirmReject?.() // 执行 Promise 的 reject
  confirmResolve = null
  confirmReject = null
}

const confirm = async () => {
  confirmClicked.value = false

  if (show.value) {
    return
  }
  show.value = true

  return new Promise<void>((resolve, reject) => {
    confirmResolve = resolve
    confirmReject = reject
  })
}

defineExpose({
  confirm
})
</script>
<template>
  <div class="confirm-container">
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
      <Transition name="fade">
        <div class="mask-confirm" v-show="show">
          <div class="confirm-box" :class="size">
            <div class="title-box" v-if="title">{{ title }}</div>
            <div class="button-box">
              <el-button
                @click="handleConfirm"
                :type="confirmType"
                round
                :loading="confirmClicked"
                :size="size"
              >
                {{ confirmText }}
              </el-button>
              <el-button
                @click="handleCancel"
                :type="cancelType"
                round
                :size="size"
              >
                {{ cancelText }}
              </el-button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.confirm-box {
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  .title-box {
    font-size: 14px;
    font-weight: bold;
    color: var(--color-text-soft);
    margin-bottom: 10px;
  }
  &.small {
    .title-box {
      margin-bottom: 6px;
    }
  }
}

.container-box {
  position: relative;
}
.mask-background,
.mask-confirm {
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
.mask-confirm {
  z-index: 2;
}
</style>
