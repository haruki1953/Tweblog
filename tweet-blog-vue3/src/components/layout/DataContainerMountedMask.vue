<script setup lang="ts">
import { onMounted, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    disabled?: boolean
  }>(),
  {
    disabled: false
  }
)

// 对计算量大的页面进行优化，遮罩，mounted后移除
const showMountedMask = ref(
  (() => {
    if (props.disabled) {
      // 首页初次加载时会有骨架屏，没必要有遮罩
      return false
    } else {
      // 页面间切换时启用过渡遮罩
      return true
    }
  })()
)
onMounted(async () => {
  await new Promise((resolve) => setTimeout(resolve, 200))
  showMountedMask.value = false
})
</script>
<template>
  <div class="data-container">
    <slot></slot>
    <Transition name="fade">
      <div class="data-mounted-mask" v-show="showMountedMask">
        <div></div>
      </div>
    </Transition>
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
    z-index: 10;
    div {
      width: 100%;
      height: 100%;
      border-radius: 5px;
      background-color: var(--color-background);
      transition: all 0.5s;
    }
  }
}
</style>
