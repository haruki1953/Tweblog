<script setup lang="ts">
import { ref } from 'vue'
import ForwardSettingPage from './views/forward-setting/ForwardSettingPage.vue'
import ForwardAutoPage from './views/forward-auto/ForwardAutoPage.vue'
import SettingPage from './views/setting/SettingPage.vue'
import { useForwardStore } from '@/stores'

const forwardStore = useForwardStore()

// 进入此页面时，默认的子页面
const defaultPage = (() => {
  if (forwardStore.forwardSettingList.length > 0) {
    // 有转发配置时，直接显示自动转发页面
    return 'ForwardAutoPage'
  }
  // else 否则显示转发配置页面
  return 'ForwardSettingPage'
})()

const options = [
  {
    label: '转发配置',
    value: 'ForwardSettingPage'
  },
  {
    label: '自动转发',
    value: 'ForwardAutoPage'
  },
  {
    label: '设置',
    value: 'SettingPage'
  }
] as const
const segmentedOptions = [...options] // el-segmented直接传options会有类型错误
const segmentedValue = ref<(typeof options)[number]['value']>(defaultPage)
</script>
<template>
  <div class="forward-config">
    <div class="segmented-box">
      <el-segmented
        v-model="segmentedValue"
        :options="segmentedOptions"
        block
      />
    </div>
    <Transition name="fade" mode="out-in">
      <ForwardSettingPage
        v-if="segmentedValue === 'ForwardSettingPage'"
      ></ForwardSettingPage>
      <ForwardAutoPage
        v-else-if="segmentedValue === 'ForwardAutoPage'"
      ></ForwardAutoPage>
      <SettingPage v-else></SettingPage>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.segmented-box {
  max-width: 550px;
  margin: 0 auto;
  margin-bottom: 20px;
  padding: 0 10px;
  user-select: none;
  --el-border-radius-base: 20px;
  :deep() {
    .el-segmented {
      color: var(--color-text);
      background-color: var(--color-background-soft);
      transition: background-color 0.5s;
    }
    .el-segmented__item {
      transition: background-color 0.2s;
    }
    .el-segmented__item-label {
      font-weight: bold;
    }
  }
}
</style>
