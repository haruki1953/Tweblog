<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

// 使用 https://widgetbot.io/ 将 discord 嵌入了网站

onMounted(() => {
  const script = document.createElement('script')
  script.src = "https://static.sakiko.top/cdn_jsdelivr_net/npm/@widgetbot/html-embed"
  script.id = "widgetbot-script"
  document.body.appendChild(script)
})

onUnmounted(() => {
  const script = document.getElementById('widgetbot-script')
  if (script) {
    document.body.removeChild(script)
  }
})
</script>

<template>
  <div class="home-widgetbot">
    <widgetbot server="1334824296647753832" channel="1334824297545338973" width="1152" height="600"></widgetbot>
  </div>
</template>

<style scoped>
.home-widgetbot {
  margin: 64px 24px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 屏幕大于 640px 时调整左右外边距*/
@media (min-width: 640px) {
  .home-widgetbot {
    margin: 64px 48px;
  }
}

/* 屏幕大于 960px 时调整左右外边距*/
@media (min-width: 960px) {
  .home-widgetbot {
    margin: 64px;
  }
}

/* 屏幕小于 500px 时取消左右外边距*/
/* @media (max-width: 500px) {
  .home-widgetbot {
    margin: 64px 0;
  }
} */

</style>