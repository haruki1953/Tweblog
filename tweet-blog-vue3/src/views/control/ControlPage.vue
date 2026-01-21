<script setup lang="ts">
import type { IconMenuItem } from '@/types'
import {
  User,
  Postcard,
  Connection,
  Sell,
  Tickets
} from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const menu: IconMenuItem[] = [
  {
    index: '/control',
    title: `系统设置`,
    icon: User,
    actionColor: 'primary',
    onClick() {
      router.push('/control')
    }
  },
  {
    index: '/profile',
    title: `个人信息`,
    icon: Postcard,
    actionColor: 'primary',
    onClick() {
      router.push('/profile')
    }
  },
  {
    index: '/tweet-import',
    title: `推文导入`,
    icon: Sell,
    actionColor: 'primary',
    onClick() {
      router.push('/tweet-import')
    }
  },
  {
    index: '/forward-config',
    title: `推文转发`,
    icon: Connection,
    actionColor: 'primary',
    onClick() {
      router.push('/forward-config')
    }
  },
  {
    index: '/log',
    title: `日志`,
    icon: Tickets,
    actionColor: 'primary',
    onClick() {
      router.push('/log')
    }
  }
]
</script>
<template>
  <div class="control-page use-control-styles">
    <DataContainerMountedMask>
      <Col2Layout :span="20">
        <template #colLeftAndSm>
          <div>
            <IconMenuBox :menu="menu" :modelValue="$route.path"></IconMenuBox>
          </div>
        </template>
        <template #colRight>
          <div>
            <!-- <router-view></router-view> -->
            <router-view v-slot="{ Component }">
              <transition name="fade-slide" mode="out-in">
                <component :is="Component" />
              </transition>
            </router-view>
          </div>
        </template>
      </Col2Layout>
    </DataContainerMountedMask>
  </div>
</template>

<style lang="scss" scoped></style>
