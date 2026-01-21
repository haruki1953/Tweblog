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
import type { UseForwardSettingListInFormControl } from './dependencies'
import type { ForwardSettingItem, ForwardSettingItemInForm } from '@/types'
import ForwardSettingForm from './ForwardSettingForm.vue'
import type { Component } from 'vue'

const props = defineProps<{
  // add: boolean
  itemInForm: ForwardSettingItemInForm
  itemInStore?: ForwardSettingItem
  useForwardSettingListInFormControl: UseForwardSettingListInFormControl
}>()

const isEditing = ref(false)

const toggleEdit = () => {
  isEditing.value = !isEditing.value
}

const dataDefault = computed(
  () => platformKeyMap[props.itemInForm.platform].forwardSettingDataDefault
)

const dataPreview = computed(() => {
  let dataStr = ''
  // 默认显示 form 中的数据
  for (const key in dataDefault.value) {
    dataStr += ' ' + (props.itemInForm.data as any)[key]
  }
  dataStr = dataStr.trim()
  // 如果没有，显示 store 中的数据
  if (dataStr === '' && props.itemInStore != null) {
    for (const key in dataDefault.value) {
      dataStr += ' ' + (props.itemInStore.data as any)[key]
    }
    dataStr = dataStr.trim()
  }
  return dataStr
})

const itemState = computed(
  (): {
    key: string
    text: string
    color: string
    icon: Component
  } => {
    if (props.itemInForm.isDeleted) {
      return {
        key: 'deleted',
        text: '删除',
        color: 'var(--el-color-danger)',
        icon: RemoveFilled
      }
    }
    if (props.itemInStore == null) {
      return {
        key: 'added',
        text: '添加',
        color: 'var(--el-color-success)',
        icon: CirclePlusFilled
      }
    }
    for (const key in dataDefault.value) {
      if ((props.itemInForm.data as any)[key] !== '') {
        return {
          key: 'data-updated',
          text: '数据修改',
          color: 'var(--el-color-warning)',
          icon: WarningFilled
        }
      }
    }
    // 虽然platform和uuid不允许修改，姑且判断一下
    const {
      platform: platformInForm,
      uuid: uuidInForm,
      name: nameInForm
    } = props.itemInForm
    const {
      platform: platformInStore,
      uuid: uuidInStore,
      name: nameInStore
    } = props.itemInStore
    if (
      platformInForm !== platformInStore ||
      uuidInForm !== uuidInStore ||
      nameInForm !== nameInStore
    ) {
      return {
        key: 'info-updated',
        text: '信息修改',
        color: 'var(--el-color-info)',
        icon: InfoFilled
      }
    }

    return {
      key: 'saved',
      text: '已保存',
      color: 'var(--el-color-primary)',
      icon: CircleCheckFilled
    }
  }
)
const boxRef = ref<HTMLElement | null>(null)
const boxSize = useElementSize(boxRef)
const boxStyleHeight = computed(() => {
  return `${boxSize.height.value}px`
})
</script>
<template>
  <div class="forward-setting-item">
    <div class="info-box">
      <div @click="toggleEdit" class="top-line">
        <div class="info-row">
          <div class="info-col left">
            <div class="icon-text">
              <el-icon
                :class="platformKeyMap[itemInForm.platform].fontawesomeClass"
                size="25"
              ></el-icon>
              <Transition name="fade" mode="out-in">
                <div class="text" :key="itemInForm.name">
                  {{ itemInForm.name }}
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
              <Transition name="fade-pop" mode="out-in">
                <div class="flag" :key="itemState.key">
                  <el-icon :color="itemState.color" size="20">
                    <component :is="itemState.icon"></component>
                  </el-icon>
                </div>
              </Transition>
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
          <div v-if="isEditing" ref="boxRef">
            <div class="info-row form">
              <ForwardSettingForm
                :itemInForm="itemInForm"
                :itemInStore="itemInStore"
                :itemState="itemState"
                :useForwardSettingListInFormControl="
                  useForwardSettingListInFormControl
                "
                :toggleEdit="toggleEdit"
              ></ForwardSettingForm>
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
  }
}
</style>
