<script setup lang="ts">
import { onMounted } from 'vue'
import { getScrollbarWidth } from './utils'
import { dataFirstLoadService } from './services'
import { useStatesStore } from './stores'

// 等待加载数据，之后取消在 index.html 中的加载遮罩
onMounted(async () => {
  await dataFirstLoadAwait()
  indexMaskClose()
})

const statesStore = useStatesStore()

// 等待加载数据，最多等待3秒或10秒（第一次加载），最少等待1秒
const dataFirstLoadAwait = async () => {
  const maxTimeout = statesStore.isFirstLoadFirstData ? 10000 : 3000
  const minTimeout = 1000
  await Promise.all([
    Promise.race([
      dataFirstLoadService().catch(() => {}),
      new Promise((resolve) => setTimeout(resolve, maxTimeout))
    ]),
    new Promise((resolve) => setTimeout(resolve, minTimeout))
  ])
}

// 关闭加载遮罩，恢复滚动条，同时防止抖动
const indexMaskClose = async () => {
  const scrollbarWidth = getScrollbarWidth()
  const maskElement = document.getElementById('index-mask')
  document.documentElement.style.overflowY = ''
  if (maskElement) {
    maskElement.style.right = `-${scrollbarWidth}px`
    maskElement.style.opacity = '0'
    await new Promise((resolve) => setTimeout(resolve, 300))
    maskElement.style.display = 'none'
  }
}
</script>

<template>
  <div>
    <router-view></router-view>
  </div>
</template>

<style scoped></style>
