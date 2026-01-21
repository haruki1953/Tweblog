<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  show: boolean
}>()
const isShowSkeleton = computed(() => props.show)

const isSkeletonTransitioning = ref(false)
let timeoutId: number | null = null

watch(isShowSkeleton, () => {
  if (timeoutId !== null) {
    clearTimeout(timeoutId) // 清除之前的定时器
  }
  isSkeletonTransitioning.value = true // 立即标记为正在过渡
  timeoutId = setTimeout(() => {
    isSkeletonTransitioning.value = false // 0.3 秒后取消
    timeoutId = null // 重置定时器 ID
  }, 300)
})
</script>
<template>
  <div class="bottom-skeleton">
    <div
      class="skeleton-box"
      :class="{
        show: isShowSkeleton || isSkeletonTransitioning
      }"
    >
      <div class="transition-box">
        <Transition name="fade-slide">
          <div v-if="isShowSkeleton">
            <PostGroup :data="[]"></PostGroup>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.skeleton-box {
  height: 0;
  position: relative;
  transition: all 0.5s;
  margin-top: -20px;

  &.show {
    height: calc(242px + 20px);
  }

  .transition-box {
    position: absolute;
    top: 0;
    right: -30px;
    bottom: -20px;
    left: -30px;
    overflow: hidden;

    // margin-bottom: -20px;
    .post-group {
      margin: 0 30px;
      transform: translateY(20px);
    }
  }
}
</style>
