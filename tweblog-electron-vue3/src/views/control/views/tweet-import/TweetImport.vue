<script setup lang="ts">
import { ref } from 'vue'
import ImportPage from './views/import/ImportPage.vue'
import SettingPage from './views/setting/SettingPage.vue'

const options = [
  {
    label: '推文导入',
    value: 'import'
  },
  {
    label: '设置',
    value: 'setting'
  }
] as const
const segmentedOptions = [...options] // el-segmented直接传options会有类型错误
const segmentedValue = ref<(typeof options)[number]['value']>(options[0].value)
</script>
<template>
  <div class="tweet-import">
    <div class="segmented-box">
      <el-segmented
        v-model="segmentedValue"
        :options="segmentedOptions"
        block
      />
    </div>
    <Transition name="fade" mode="out-in">
      <ImportPage v-if="segmentedValue === 'import'"></ImportPage>
      <SettingPage v-else></SettingPage>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
// @use '../../styles/control.scss';

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
