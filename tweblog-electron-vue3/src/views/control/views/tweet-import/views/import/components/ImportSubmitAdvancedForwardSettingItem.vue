<script setup lang="ts">
import { platformKeyMap } from '@/config'
import {
  CircleCheckFilled,
  CirclePlusFilled,
  InfoFilled,
  RemoveFilled,
  WarningFilled
} from '@element-plus/icons-vue'
import { useElementSize } from '@vueuse/core'
import { computed } from 'vue'
import { ref } from 'vue'
import type { ForwardSettingItem } from '@/types'
import type { Component } from 'vue'

const model = defineModel<string>({ required: true })

const props = defineProps<{
  item: ForwardSettingItem
}>()

const dataDefault = computed(
  () => platformKeyMap[props.item.platform].forwardSettingDataDefault
)

const dataPreview = computed(() => {
  let dataStr = ''
  // 显示数据
  for (const key in dataDefault.value) {
    dataStr += ' ' + (props.item.data as any)[key]
  }
  dataStr = dataStr.trim()
  return dataStr
})

const isSelected = computed(() => model.value === props.item.uuid)

const selectClick = () => {
  if (isSelected.value) {
    model.value = ''
    return
  }
  model.value = props.item.uuid
}
</script>
<template>
  <div class="import-submit-advanced-forward-setting-item">
    <div
      class="info-box"
      :class="{
        'is-selected': isSelected
      }"
      @click="selectClick"
    >
      <div class="top-line">
        <div class="info-row">
          <div class="info-col left">
            <div class="icon-text">
              <el-icon
                :class="platformKeyMap[item.platform].fontawesomeClass"
                size="25"
              ></el-icon>
              <Transition name="fade" mode="out-in">
                <div class="text" :key="item.name">
                  {{ item.name }}
                </div>
              </Transition>
            </div>
            <div></div>
          </div>
          <div class="info-col right">
            <div></div>
            <div class="content-flag">
              <Transition name="fade" mode="out-in">
                <div class="content" :key="dataPreview">{{ dataPreview }}</div>
              </Transition>
              <div class="flag">
                <el-icon size="20">
                  <component :is="CircleCheckFilled"></component>
                </el-icon>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.info-box {
  margin-bottom: 10px;
  background-color: var(--color-background-soft);
  border-radius: 20px;
  transition:
    background-color 0.5s,
    box-shadow 0.5s,
    transform 0.2s;
  &:hover {
    // box-shadow: var(--el-box-shadow-lighter);
    background-color: var(--color-background-mute);
    // transform: scale(1.05, 1.05);
  }
  &.is-selected {
    background-color: var(--el-color-primary-light-7);
    .flag .el-icon {
      color: var(--el-color-primary);
    }
  }
}

.info-divider {
  // height: 2px;
  // background-color: var(--color-background);
  // transition: background-color 0.5s;
  border-top: 2.4px solid var(--color-background); // divider
  transition: border 0.5s;
}

.top-line {
  height: 45px;
  cursor: pointer;
  user-select: none;
}
.info-row {
  margin: 0 16px 0 20px;
  padding: 10px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  &.form {
    display: block;
    margin: 0 20px;
    padding: 20px 0;
  }
}
.info-col {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.left {
  width: 50%;
}
.right {
  width: calc(50% - 20px);
}

.icon-text {
  width: 100%;
  display: flex;
  align-items: center;

  .el-icon {
    margin-right: 10px;
  }

  .text {
    font-weight: bold;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.content-flag {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  .content {
    color: var(--color-text-soft);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-family: 'Consolas', 'Courier New', monospace;
  }

  .flag {
    display: flex;
    align-items: center;
    margin-left: 10px;
    .el-icon {
      color: var(--my-neutral);
    }
  }
}
</style>
