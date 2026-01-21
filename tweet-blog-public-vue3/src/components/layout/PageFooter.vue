<script setup lang="ts">
import { appInfo } from '@/config'
</script>
<template>
  <div class="page-footer">
    <a
      class="copyright"
      :href="appInfo.copyright.link"
      target="_blank"
      rel="noopener noreferrer"
    >
      {{ appInfo.copyright.text }}
    </a>
    <a
      class="version"
      :href="appInfo.version.link"
      target="_blank"
      rel="noopener noreferrer"
    >
      {{ appInfo.version.text }}
    </a>
  </div>
</template>

<style lang="scss" scoped>
.page-footer {
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  .copyright {
    margin-right: 10px;
  }
  a {
    font-family: Arial, sans-serif;
    color: var(--color-text-soft); // 未访问链接的颜色
    text-decoration: none; // 平时不显示下划线
    &:hover {
      color: var(--color-text); // 悬停时的颜色
      // text-decoration: underline; // 悬停时显示下划线
    }
  }
}
</style>
