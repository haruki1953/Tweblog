<script setup lang="ts">
import { appInfo } from '@/config'
</script>
<template>
  <div class="log-app-info">
    <div class="app-info">
      <div class="info-box">
        <a
          class="info-val"
          :href="appInfo.copyright.link"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ appInfo.copyright.text }}
        </a>
        <a
          class="info-text"
          :href="appInfo.version.link"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ appInfo.version.text }}
        </a>
      </div>
      <el-divider direction="vertical" />
      <div class="info-box">
        <a
          class="info-val"
          :href="appInfo.officialDocs.link"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ appInfo.officialDocs.text }}
        </a>
        <a
          class="info-text"
          :href="appInfo.officialWebsite.link"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ appInfo.officialWebsite.text }}
        </a>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.app-info {
  // height: 80px;
  padding: 5px 0;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  .info-box {
    min-width: 100px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .info-val {
      display: block;
      font-size: 18px;
      font-weight: bold;
      color: var(--color-text);
      transition: all 0.2s;
      text-decoration: none;
    }
    .info-text {
      display: block;
      font-size: 12px;
      color: var(--color-text-soft);
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }
  }
  .el-divider {
    height: 40px;
    transition: all 0.5s;
    --el-border-color: var(--color-border);
  }
}
</style>
