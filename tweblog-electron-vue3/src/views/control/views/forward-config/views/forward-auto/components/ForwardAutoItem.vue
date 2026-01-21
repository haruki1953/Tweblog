<script setup lang="ts">
import { platformKeyMap, taskStatusMap } from '@/config'
import { useForwardStore, useTaskStore } from '@/stores'
import type { ForwardSettingItem } from '@/types'
import { Connection, Loading, Notification } from '@element-plus/icons-vue'
import { useElementSize } from '@vueuse/core'
import { computed } from 'vue'
import { ref } from 'vue'
import ForwardAutoTaskList from './ForwardAutoTaskList.vue'
import ForwardAutoForm from './ForwardAutoForm.vue'

const props = defineProps<{
  item: ForwardSettingItem
}>()

const forwardStore = useForwardStore()
const isLoading = computed(() => forwardStore.isForwardSettingPostCountLoading)

const countInfo = computed(() => {
  if (forwardStore.forwardSettingPostCount == null) {
    return null
  }
  const totalPostCount = forwardStore.forwardSettingPostCount.totalPostCount
  const forwardSettingPostCount =
    forwardStore.forwardSettingPostCount.forwardSettingPostList.find(
      (i) => i.uuid === props.item.uuid
    )?.count
  if (forwardSettingPostCount == null) {
    return null
  }
  return {
    totalPostCount,
    forwardSettingPostCount
  }
})

const stateInfo = computed(() => {
  if (countInfo.value == null) {
    return null
  }
  const { forwardSettingPostCount, totalPostCount } = countInfo.value
  if (forwardSettingPostCount < totalPostCount) {
    return {
      key: 'not-all-forwarded',
      icon: Notification,
      color: 'var(--el-color-primary)'
    } as const
  }
  return {
    key: 'all-forwarded',
    icon: Connection,
    color: 'var(--el-color-success)'
  } as const
})

const taskStore = useTaskStore()

// 任务信息
const taskForwardList = computed(() => taskStore.taskForwardList)
// 属于本转发配置的任务
const taskForwardThisSettingList = computed(() => {
  return taskForwardList.value.filter(
    (taskItem) => taskItem.forwardConfigId === props.item.uuid
  )
})

// 存在运行中的转发任务，则是正在转发
const isForwarding = computed(() => {
  const find = taskForwardThisSettingList.value.find(
    (i) => i.status === taskStatusMap.running.key
  )
  if (find != null) {
    return true
  }
  return false
})

const isEditing = ref(false)

const toggleEdit = () => {
  if (stateInfo.value?.key === 'all-forwarded') {
    isEditing.value = false
    return
  }
  if (isForwarding.value) {
    isEditing.value = false
    return
  }
  isEditing.value = !isEditing.value
}

const boxRef = ref<HTMLElement | null>(null)
const boxSize = useElementSize(boxRef)
const boxStyleHeight = computed(() => {
  return `${boxSize.height.value}px`
})
</script>
<template>
  <div class="forward-auto-item">
    <div class="info-box">
      <div
        @click="toggleEdit"
        class="top-line"
        :class="{
          'is-forwarding': isForwarding,
          'all-forwarded': stateInfo?.key === 'all-forwarded'
        }"
      >
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
            <Transition name="fade" mode="out-in">
              <div
                class="content-flag"
                v-if="!isLoading && countInfo != null && stateInfo != null"
              >
                <div
                  class="content"
                  :class="{
                    'blinking-2s': isForwarding
                  }"
                >
                  {{
                    `${countInfo.forwardSettingPostCount}/${countInfo.totalPostCount}`
                  }}
                </div>
                <Transition name="fade-pop" mode="out-in">
                  <div class="flag" key="isForwarding" v-if="isForwarding">
                    <el-icon
                      :color="stateInfo.color"
                      size="20"
                      class="is-loading"
                    >
                      <component :is="Loading"></component>
                    </el-icon>
                  </div>
                  <div class="flag" :key="stateInfo.key" v-else>
                    <el-icon :color="stateInfo.color" size="20">
                      <component :is="stateInfo.icon"></component>
                    </el-icon>
                  </div>
                </Transition>
              </div>
              <div class="content-flag" v-else>
                <div class="content"></div>
                <div class="flag">
                  <el-icon
                    :color="'var(--el-color-primary)'"
                    size="20"
                    class="is-loading"
                  >
                    <component :is="Loading"></component>
                  </el-icon>
                </div>
              </div>
            </Transition>
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
              <ForwardAutoForm
                :item="item"
                :countInfo="countInfo"
                :toggleEdit="toggleEdit"
                :isForwarding="isForwarding"
              ></ForwardAutoForm>
            </div>
          </div>
        </Transition>
      </div>
    </div>
    <div class="task-box">
      <ForwardAutoTaskList
        :list="taskForwardThisSettingList"
      ></ForwardAutoTaskList>
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
  &.all-forwarded {
    cursor: not-allowed;
  }
  &.is-forwarding {
    cursor: wait;
  }
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
    padding: 20px 0 16px 0;
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
