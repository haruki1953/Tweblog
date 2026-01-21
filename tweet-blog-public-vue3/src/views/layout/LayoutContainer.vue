<script setup lang="ts">
import { onMounted } from 'vue'
import { HomeFilled, InfoFilled, PictureFilled } from '@element-plus/icons-vue'
import ImageAltDialog from './components/ImageAltDialog.vue'
import MenuIsland from './components/MenuIsland.vue'

const menu = [
  {
    index: '/',
    title: '首页',
    icon: HomeFilled
  },
  {
    index: '/album',
    title: '相册',
    icon: PictureFilled
  },
  {
    index: '/about',
    title: '关于',
    icon: InfoFilled
  }
]
</script>
<template>
  <div class="layout-container">
    <ImageAltDialog></ImageAltDialog>
    <div class="back-top-btn-box">
      <el-backtop :bottom="25" :right="25" />
    </div>
    <!-- 导航栏 -->
    <!-- <MenuBar :menu="menu"></MenuBar> -->
    <div class="container">
      <router-view></router-view>
    </div>
    <div class="menu">
      <MenuIsland :menu="menu"></MenuIsland>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.menu {
  position: fixed;
  bottom: 20px;
  left: 0;
  right: 0;
  z-index: 30;
  pointer-events: none;
  transition: opacity 0.3s;
}

// 响应式边距
.container {
  --container-padding-12: 120px;
  --container-padding-14: 200px;
  --container-padding-16: 300px;
  --container-padding-shim-12: 100px;
  --container-padding-shim-14: 150px;
  --container-padding-shim-16: 200px;
  --container-padding-top: 0;
  --container-padding-bottom: 0;
  // --container-padding-top: 60px;
  // --container-padding-bottom: 0;
  --layout-top: 30px;
  --layout-bottom: 90px;
  padding: var(--container-padding-top) 20px var(--container-padding-bottom)
    20px;
  margin: 0 auto;
  max-width: 1920px;
}

@media (min-width: 1200px) {
  .container {
    padding: var(--container-padding-top) var(--container-padding-12)
      var(--container-padding-bottom) var(--container-padding-12);
  }
}

@media (min-width: 1400px) {
  .container {
    padding: var(--container-padding-top) var(--container-padding-14)
      var(--container-padding-bottom) var(--container-padding-14);
  }
}

@media (min-width: 1600px) {
  .container {
    padding: var(--container-padding-top) var(--container-padding-16)
      var(--container-padding-bottom) var(--container-padding-16);
  }
}

/* 小屏时侧边距再小一点 */
@media (max-width: 500px) {
  .container {
    padding: var(--container-padding-top) 10px var(--container-padding-bottom)
      10px;
  }
}

.el-backtop {
  --el-backtop-bg-color: var(--color-background-soft);
  --el-backtop-hover-bg-color: var(--el-color-primary-light-7);
  transition: all 0.5s;
  // width: 50px;
  // height: 50px;
  &:hover {
    box-shadow: var(--el-box-shadow-light);
  }
}
</style>
