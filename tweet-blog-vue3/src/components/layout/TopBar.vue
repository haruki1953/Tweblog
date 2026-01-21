<script setup lang="ts">
import { ArrowLeft, Loading } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { House } from '@element-plus/icons-vue'
import { ref } from 'vue'
import { nextTick } from 'vue'

defineProps<{
  title: string
}>()

const router = useRouter()
const goBack = async () => {
  isBacking.value = true
  await nextTick()
  await new Promise((resolve) => setTimeout(resolve, 10))
  // console.log(window.history.length)
  if (window.history.length > 2) {
    router.back()
  } else {
    // 如果没有历史记录，则导航到首页
    router.push({ name: 'home' })
  }
}

const isBacking = ref(false)
</script>
<template>
  <div class="top-bar">
    <div class="mask">
      <div class="title">{{ title }}</div>
    </div>
    <div class="back" @click="goBack">
      <div class="back-icon">
        <el-icon size="16"><ArrowLeft /></el-icon>
        <div
          class="mask"
          :class="{
            show: isBacking
          }"
        >
          <el-icon size="16" class="is-loading">
            <Loading />
          </el-icon>
        </div>
      </div>

      <span>返 回</span>
    </div>
    <div class="button">
      <slot>
        <el-button
          type="primary"
          round
          size="small"
          :icon="House"
          @click="$router.push({ name: 'home' })"
        >
          首页
        </el-button>
      </slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.back-icon {
  position: relative;
  display: flex;
  align-items: center;
  .mask {
    display: flex;
    align-items: center;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    opacity: 0;
    background-color: var(--color-background-soft);
    transition:
      background-color 0.5s,
      opacity 0.5s ease-in;
    &.show {
      opacity: 1;
    }
  }
}

.top-bar {
  height: 48px;
  padding: 12px;
  background-color: var(--color-background-soft);
  border-radius: 20px;
  transition: all 0.5s;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  transition:
    background-color 0.5s,
    box-shadow 0.5s;
  &:hover {
    box-shadow: var(--el-box-shadow-lighter);
    // background-color: var(--color-background-mute);
  }
  .back {
    min-width: 60px;
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
    &:hover .el-icon {
      transform: rotate(360deg);
    }
    .el-icon {
      color: var(--color-text);
      font-weight: bold;
      transition:
        color 0.2s,
        transform 0.5s;
    }
    span {
      margin-left: 5px;
      color: var(--color-text);
      font-weight: bold;
      transition: color 0.2s;
    }
  }
  .button {
    min-width: 60px;
    display: flex;
    justify-content: end;
    align-items: center;
  }
  .mask {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    user-select: none;
    pointer-events: none; /* 允许点击穿透 */
    .title {
      color: var(--color-text);
      font-weight: bold;
      transition: all 0.2s;
    }
  }
}
</style>
