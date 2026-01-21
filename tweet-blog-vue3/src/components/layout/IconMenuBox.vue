<script setup lang="ts">
import type { IconMenuItem } from '@/types'
import { useElementSize } from '@vueuse/core'
import { computed } from 'vue'
import { ref } from 'vue'

const props = withDefaults(
  defineProps<{
    menu: IconMenuItem[]
    boxSize?: number
    backgroundSize?: number
    notBackgroundColor?: boolean
    dontSetIndex?: boolean
  }>(),
  {
    boxSize: 80,
    backgroundSize: 60,
    notBackgroundColor: false,
    dontSetIndex: false
  }
)

const model = defineModel<string>()

const refBox = ref<HTMLElement | null>(null)

const menuBoxSize = useElementSize(refBox)

const itemBoxSize = computed(() => {
  if (props.boxSize < props.backgroundSize) {
    return props.backgroundSize
  } else {
    return props.boxSize
  }
})

// 通过算法使每行的个数尽量差不多
const itemGrid = computed(() => {
  if (menuBoxSize.width.value < itemBoxSize.value * 2) {
    return props.menu.map((item) => [item])
  }

  // 一行中的最大个数
  const itemCountInRow = Math.floor(menuBoxSize.width.value / itemBoxSize.value)
  // 总共的行数
  const rowCountInBox = Math.ceil(props.menu.length / itemCountInRow)
  // 计算应分配到每行的基础数量
  const baseItemCount = Math.floor(props.menu.length / rowCountInBox)
  // 计算需要多放一个项目的行数
  const extraItemsCount = props.menu.length % rowCountInBox

  const grid: (typeof props.menu)[] = []
  let currentIndex = 0

  for (let i = 0; i < rowCountInBox; i++) {
    // 前 extraItemsCount 行分配 baseItemCount + 1 个项目，剩余行分配 baseItemCount 个项目
    const itemsInThisRow =
      i < extraItemsCount ? baseItemCount + 1 : baseItemCount
    grid.push(props.menu.slice(currentIndex, currentIndex + itemsInThisRow))
    currentIndex += itemsInThisRow
  }

  return grid
})

const onItemClick = (item: IconMenuItem) => {
  item.onClick && item.onClick()
  if (model.value === item.index) {
    return
  }
  if (!props.dontSetIndex) {
    model.value = item.index
  }
  item.onSelect && item.onSelect()
}
</script>
<template>
  <div class="icon-menu-box" ref="refBox">
    <div
      class="item-row"
      v-for="itemRow in itemGrid"
      :key="itemRow.map((i) => i.index).toString()"
    >
      <div
        class="item-box"
        v-for="item in itemRow"
        :key="item.index"
        :style="{ width: `${itemBoxSize}px`, height: `${itemBoxSize}px` }"
      >
        <div
          class="item"
          :class="{
            index: model === item.index,
            'not-background-color': notBackgroundColor,
            primary: item.actionColor === 'primary',
            success: item.actionColor === 'success',
            info: item.actionColor === 'info',
            warning: item.actionColor === 'warning',
            danger: item.actionColor === 'danger'
          }"
          @click="onItemClick(item)"
          :style="{
            width: `${backgroundSize}px`,
            height: `${backgroundSize}px`
          }"
        >
          <div class="icon">
            <el-icon :size="item.size || 30">
              <component :is="item.icon"></component>
            </el-icon>
          </div>
          <div class="title">{{ item.title }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.item-row {
  display: flex;
  justify-content: space-evenly;
  // background-color: var(--color-background-mute);
}
.item-box {
  display: flex;
  justify-content: center;
  align-items: center;
  // background-color: var(--color-background-mute);
}
.item {
  background-color: var(--color-background-soft);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  user-select: none;
  transition:
    background-color 0.5s,
    transform 0.2s;
  &:hover {
    transform: scale(1.1, 1.1);
  }
  &.not-background-color {
    background-color: transparent;
  }
  &.index {
    --action-color: var(--el-color-primary);
    &.primary {
      --action-color: var(--el-color-primary);
    }
    &.success {
      --action-color: var(--el-color-success);
    }
    &.info {
      --action-color: var(--el-color-info);
    }
    &.warning {
      --action-color: var(--el-color-warning);
    }
    &.danger {
      --action-color: var(--el-color-danger);
    }
    .icon,
    .title {
      color: var(--action-color);
    }
  }
  .icon {
    padding: 3px 0 2px 0;
    .el-icon {
      display: flex;
    }
  }
  .title {
    color: var(--color-text-soft);
    font-size: 9px;
    line-height: 9px;
    white-space: nowrap;
  }
}
</style>
