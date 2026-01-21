<script setup lang="ts">
import { ref, type Component } from 'vue'
import { useDark, useToggle, useWindowSize } from '@vueuse/core'
import { MoonNight, Sunrise } from '@element-plus/icons-vue'
import DecorationDot from './DecorationDot.vue'
import { useProfileStore } from '@/stores'
import { computed } from 'vue'
import { generateRandomClassName, useMenuDrawerOptimization } from '@/utils'
import router from '@/router'
import { nextTick } from 'vue'

const props = defineProps<{
  menu: {
    index: string
    title: string
    icon: Component
    size?: number
  }[]
}>()

const profileStore = useProfileStore()

const isDark = useDark({ disableTransition: false })
const toggleDark = useToggle(isDark)

// const reload = () => {
//   window.location.href = '/'
// }

// 控制移动端菜单框显示
const showMenuBox = ref(false)
const showMenuBoxToggle = () => {
  showMenuBox.value = !showMenuBox.value
}
// 优化
const overlayClass = generateRandomClassName()
useMenuDrawerOptimization({
  drawerVisible: showMenuBox,
  overlayClass
})
// 为防止在抽屉跳转路由后又被返回，故先返回
const menuDrawerSelect = async (index: string) => {
  // console.log(index)
  window.history.back()
  await nextTick()
  await new Promise((resolve) => setTimeout(resolve, 10))
  router.push(index)
}

const drawerHeight = computed(() => {
  return props.menu.length * 56 + 165
})

const windowSize = useWindowSize()

const scrollbarHeight = computed(() => {
  if (windowSize.height.value < drawerHeight.value) {
    return windowSize.height.value
  }
  return drawerHeight.value
})
</script>
<template>
  <div class="menu-island">
    <div class="menu-container">
      <div class="menu-box">
        <!-- 大屏显示的内容 lg -->
        <div class="menu-item decoration-item lg">
          <DecorationDot></DecorationDot>
        </div>
        <div
          class="lg menu-item icon-item"
          v-for="item in menu"
          :key="item.index"
          @click="router.push(item.index)"
          :class="{
            // 'is-index': $route.path === item.index
            // 使在子路由也激活对应菜单项
            // 'is-index': $route.matched.some(
            //   (record) => record.path === item.index
            // )
            // 修复根路径一致被激活的问题
            'is-index': (() => {
              if (item.index === '/') {
                return $route.path === item.index
              }
              return $route.matched.some((record) => record.path === item.index)
            })()
          }"
        >
          <el-icon :size="item.size || 20">
            <component :is="item.icon"></component>
          </el-icon>
        </div>
        <div
          class="menu-item switch-item lg"
          :class="{
            'not-show-right-border': profileStore.socialMedias.length === 0
          }"
        >
          <el-switch
            class="switch-dark"
            size="large"
            :modelValue="isDark"
            inline-prompt
            :active-icon="MoonNight"
            :inactive-icon="Sunrise"
            @click.stop="toggleDark()"
          />
        </div>
        <div
          class="menu-item link-group-box lg"
          :class="{
            'not-show': profileStore.socialMedias.length === 0
          }"
        >
          <SocialMediasGroup limit></SocialMediasGroup>
        </div>

        <!-- 小屏显示的内容 sm -->
        <div
          class="menu-item decoration-item sm"
          @click="showMenuBoxToggle"
          style="cursor: pointer"
        >
          <DecorationDot></DecorationDot>
        </div>
      </div>
    </div>

    <!-- 小屏时底弹出的菜单抽屉 -->
    <div class="menu-drawer">
      <el-drawer
        v-model="showMenuBox"
        direction="btt"
        :show-close="false"
        :with-header="false"
        :lock-scroll="false"
        :size="drawerHeight"
        :z-index="29"
        :modal-class="overlayClass"
      >
        <div class="scrollbar-relative-box">
          <div class="scrollbar-absolute-box">
            <el-scrollbar :height="scrollbarHeight">
              <div class="menu-drawer-box">
                <div class="menu-drawer-content">
                  <div
                    class="dark-link"
                    :class="{
                      center: profileStore.socialMedias.length === 0
                    }"
                  >
                    <el-switch
                      class="switch-dark"
                      size="large"
                      :modelValue="isDark"
                      inline-prompt
                      :active-icon="MoonNight"
                      :inactive-icon="Sunrise"
                      @click="toggleDark()"
                    />
                    <SocialMediasGroup limit></SocialMediasGroup>
                  </div>
                  <el-menu
                    :default-active="$route.path"
                    @select="menuDrawerSelect"
                  >
                    <el-menu-item
                      v-for="item in menu"
                      :key="item.index"
                      :index="item.index"
                    >
                      <el-icon :size="item.size">
                        <component :is="item.icon"></component>
                      </el-icon>
                      <span>{{ item.title }}</span>
                    </el-menu-item>
                  </el-menu>
                </div>
              </div>
            </el-scrollbar>
          </div>
        </div>
      </el-drawer>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.menu-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  --menu-item-gap: 30px;
  pointer-events: none;
  z-index: 31;
}
.menu-box {
  height: 50px;
  display: flex;
  align-items: center;
  background-color: var(--color-background-soft);
  border-radius: 25px;
  // border: 1px dotted var(--color-border);
  box-shadow: var(--el-box-shadow-lighter);
  // box-shadow: 0px 0px 6px 2px var(--color-background);
  color: var(--color-text);
  transition:
    all 0.5s,
    color 0.2s;
  pointer-events: auto;
  &:hover {
    box-shadow: var(--el-box-shadow-light);
    // box-shadow: 0px 0px 12px 4px var(--color-background);
  }
  .menu-item {
    min-width: 50px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.decoration-item {
  padding: 0 20px;
  &.lg {
    padding: 0 25px;
  }
}

.icon-item {
  border-radius: 25px;
  border-top: 2px solid transparent;
  border-bottom: 2px solid transparent;
  color: var(--color-text);
  cursor: pointer;
  // transition:
  //   color 0.2s,
  //   background-color 0.2s,
  //   border 0.2s;
  transition: all 0.2s;
  &:hover {
    color: var(--el-color-primary);
    background-color: var(--el-color-primary-light-7);
  }
  &.is-index {
    border-radius: 25px 25px 0 0;
    color: var(--el-color-primary);
    border-top: 2px solid transparent;
    border-bottom: 2px solid var(--el-color-primary);
  }
}

.switch-item.switch-item {
  height: 24px;
  margin: 0 3px 0 10px;
  padding: 0 20px;
  border-left: 2px solid var(--color-border); /* 左边框 */
  border-right: 2px solid var(--color-border); /* 右边框 */
  transition: all 0.5s;
  &.not-show-right-border {
    border-right: none;
    margin-right: 0;
  }
}
.switch-dark {
  --el-switch-off-color: var(--el-color-primary);
  :deep() {
    .el-switch__action {
      background-color: var(--color-background);
    }
    .el-icon {
      font-size: 16px;
    }
  }
}

.link-group-box {
  margin: 0 15px 0 10px;
  &.not-show {
    display: none;
  }
}

.menu-drawer {
  pointer-events: auto;
  :deep() {
    .el-drawer__body {
      background-color: var(--color-background);
      transition: background-color 0.5s;
      padding: 0;
    }
  }
  .scrollbar-relative-box {
    position: relative;
    height: 100%;
    .scrollbar-absolute-box {
      position: absolute;
      right: 0;
      bottom: 0;
      left: 0;
    }
  }
  .menu-drawer-content {
    width: 250px;
    margin: 20px auto 88px auto;
  }
  .el-menu {
    position: static;
    width: 100%;
    transition:
      background-color 0.5s,
      border-bottom-color 0.5s;
    border: none;
    border-radius: 20px;
    background-color: var(--color-background-soft);
    overflow: hidden;
    z-index: 30;
    .el-menu-item {
      --el-menu-text-color: var(--color-text);
      user-select: none;
      span {
        font-weight: bold;
      }
    }
  }
  .dark-link {
    margin: 0 5px 15px 5px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    &.center {
      justify-content: center;
    }
  }
}

.sm.sm {
  // 增加权重
  display: none;
}
@media (max-width: 850px) {
  .lg.lg {
    display: none;
  }
  .sm.sm {
    display: block;
  }
  .menu-item.sm {
    display: flex;
  }
}
</style>
