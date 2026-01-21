<script setup lang="ts">
import { logTypeMap } from '@/config'
import type { LogData } from '@/types'
import {
  CircleCloseFilled,
  InfoFilled,
  SuccessFilled,
  WarningFilled
} from '@element-plus/icons-vue'
import { useDateFormat, useElementSize } from '@vueuse/core'
import type { Component } from 'vue'
import { computed } from 'vue'
import { ref } from 'vue'

const props = defineProps<{
  item: LogData
}>()

const isOpen = ref(false)
const toggleOpen = () => {
  isOpen.value = !isOpen.value
}

const itemState = computed(
  (): {
    key: string
    text: string
    color: string
    icon: Component
  } => {
    if (props.item.type === logTypeMap.error.key) {
      return {
        key: logTypeMap.error.key,
        text: logTypeMap.error.text,
        color: 'var(--el-color-error)',
        icon: CircleCloseFilled
      }
    }
    if (props.item.type === logTypeMap.warning.key) {
      return {
        key: logTypeMap.warning.key,
        text: logTypeMap.warning.text,
        color: 'var(--el-color-warning)',
        icon: WarningFilled
      }
    }
    if (props.item.type === logTypeMap.success.key) {
      return {
        key: logTypeMap.success.key,
        text: logTypeMap.success.text,
        color: 'var(--el-color-success)',
        icon: SuccessFilled
      }
    }
    return {
      key: logTypeMap.info.key,
      text: logTypeMap.info.text,
      color: 'var(--el-color-info)',
      icon: InfoFilled
    }
  }
)

const titleForShow = computed(() => {
  if (isOpen.value) {
    return props.item.title || ''
  } else {
    return props.item.title || props.item.content
  }
})

const dateForShow = useDateFormat(props.item.createdAt, 'YYYY-MM-DD HH:mm:ss')

const boxRef = ref<HTMLElement | null>(null)
const boxSize = useElementSize(boxRef)
const boxStyleHeight = computed(() => {
  return `${boxSize.height.value}px`
})
</script>
<template>
  <div class="log-list-item">
    <div class="info-box">
      <div @click="toggleOpen" class="top-line">
        <div class="info-row">
          <div class="info-col left">
            <div class="date-title">
              <div class="date">{{ dateForShow }}</div>
              <Transition name="fade" mode="out-in">
                <div class="title" :key="titleForShow">
                  {{ titleForShow }}
                </div>
              </Transition>
            </div>
            <div></div>
          </div>
          <div class="info-col right">
            <div></div>
            <div class="content-flag">
              <div class="flag">
                <el-icon :color="itemState.color" size="20">
                  <component :is="itemState.icon"></component>
                </el-icon>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        class="style-box"
        :style="{
          height: boxStyleHeight
        }"
      >
        <div class="info-divider"></div>
        <Transition name="fade05">
          <div v-if="isOpen" ref="boxRef">
            <div class="info-row form">
              <div class="content-box">
                <div class="content">
                  {{ item.content }}
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.style-box {
  overflow: hidden;
  transition: height 0.8s ease-in-out;
  // transition: height 1s;
}

.info-box {
  margin-bottom: 10px;
  background-color: var(--color-background-soft);
  border-radius: 20px;
  transition:
    background-color 0.5s,
    box-shadow 0.5s;
  &:hover {
    box-shadow: var(--el-box-shadow-lighter);
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
  margin: 0 16px;
  padding: 10px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  &.form {
    margin: 0 20px;
    display: block;
    padding: 15px 0;
  }
}
.info-col {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.left {
  width: calc(100% - 30px);
}
.right {
}
.date-title {
  width: 100%;
  display: flex;
  align-items: center;
  .date {
    margin-right: 15px;
    font-family: 'Consolas', 'Courier New', monospace;
    white-space: nowrap;
  }
  .title {
    font-weight: bold;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
.content-flag {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  .content {
    user-select: none;
    font-size: 14px;
    font-weight: bold;
  }

  .flag {
    display: flex;
    align-items: center;
  }
}

.content-box {
  display: flex;
  justify-content: center;
  .content {
    max-width: 100%;
    color: var(--color-text);
    white-space: pre-wrap;
    // 解决在全英文无空格时，文字无法换行的问题
    word-wrap: break-word;
    transition: all 0.2s;
    font-family: 'Consolas', 'Courier New', monospace;
  }
}
</style>
