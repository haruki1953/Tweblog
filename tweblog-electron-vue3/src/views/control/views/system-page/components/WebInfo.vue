<script setup lang="ts">
import { ref } from 'vue'
import { Link } from '@element-plus/icons-vue'
import { computed } from 'vue'
import { appInfo } from '@/config'
import { desktopHttpPortIcp } from '@/desktop'

const httpPort = ref(0)
;(async () => {
  httpPort.value = await desktopHttpPortIcp()
})()

const webLinkPublic = computed(() => `http://127.0.0.1:${httpPort.value}/`)
const webLinkAdmin = computed(() => `http://127.0.0.1:${httpPort.value}/admin/`)
const webLinkDocs = computed(() => `http://127.0.0.1:${httpPort.value}/docs/`)
</script>
<template>
  <div class="image-all-original-delete">
    <div class="control-lable-with-link">
      <div class="lable">Web端口：{{ httpPort }}</div>
      <a
        class="link"
        type="primary"
        :href="appInfo.webPortDocs.link"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ appInfo.webPortDocs.text }}
      </a>
    </div>
    <div class="form-box">
      <div class="form-row">
        <div class="input-lable">公开访问</div>
        <el-input
          :modelValue="webLinkPublic"
          :prefix-icon="Link"
          size="large"
          class="control-input"
          readonly
        ></el-input>
      </div>
      <div class="form-row">
        <div class="input-lable">管理访问：初次设置密码后启用</div>
        <el-input
          :modelValue="webLinkAdmin"
          :prefix-icon="Link"
          size="large"
          class="control-input"
          readonly
        ></el-input>
      </div>
      <div class="form-row">
        <div class="input-lable">本地文档</div>
        <el-input
          :modelValue="webLinkDocs"
          :prefix-icon="Link"
          size="large"
          class="control-input"
          readonly
        ></el-input>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// .web-link {
//   margin-left: 20px;
//   font-family: 'Consolas', 'Courier New', monospace;
//   font-size: 14px;
//   font-weight: bold;
//   color: var(--el-color-primary); // 未访问链接的颜色
//   text-decoration: none; // 平时不显示下划线

//   &:hover {
//     color: var(--el-color-success); // 悬停时的颜色
//     text-decoration: underline; // 悬停时显示下划线
//   }
// }

.el-input {
  :deep() {
    .el-input__inner {
      font-family: 'Consolas', 'Courier New', monospace;
    }
  }
}
</style>
