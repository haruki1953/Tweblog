<script setup lang="ts">
import { taskStatusMap } from '@/config'
import { useTaskStore } from '@/stores'
import type { TaskForwardItem } from '@/types'
import { computed, ref } from 'vue'
import { CloseBold, Select, SemiSelect } from '@element-plus/icons-vue'
import { adminTaskAbortApi, adminTaskDeleteApi } from '@/api'
import { formatTimeAgoChs } from '@/utils'
import { useElementSize } from '@vueuse/core'
import ForwardAutoTaskForm from './ForwardAutoTaskForm.vue'

const props = defineProps<{
  item: TaskForwardItem
}>()

const taskStore = useTaskStore()

const taskForwardItem = computed(() => props.item)

const isRunning = computed(() => {
  return taskForwardItem.value.status === taskStatusMap.running.key
})
const isCompleted = computed(() => {
  return taskForwardItem.value.status === taskStatusMap.completed.key
})
const isAborted = computed(() => {
  return taskForwardItem.value.status === taskStatusMap.aborted.key
})
const isStopped = computed(() => {
  return taskForwardItem.value.status === taskStatusMap.stopped.key
})

const taskStatusInfo = computed(() => {
  if (isRunning.value) {
    return {
      progressStatus: '',
      message: '正在转发',
      buttonType: 'info',
      buttonIcon: SemiSelect,
      atClick: () => taskAbort()
    } as const
  }
  if (isCompleted.value) {
    return {
      progressStatus: 'success',
      message: '转发完成',
      buttonType: 'success',
      buttonIcon: Select,
      atClick: () => taskDelete()
    } as const
  }
  if (isAborted.value) {
    return {
      progressStatus: 'exception',
      message: '转发中止',
      buttonType: 'danger',
      buttonIcon: CloseBold,
      atClick: () => taskDelete()
    } as const
  }
  // if
  isStopped.value
  return {
    progressStatus: 'exception',
    message: '转发停止',
    buttonType: 'danger',
    buttonIcon: CloseBold,
    atClick: () => taskDelete()
  } as const
})

const taskIsLoading = ref(false)

const taskAbort = async () => {
  taskIsLoading.value = true
  try {
    const res = await adminTaskAbortApi(taskForwardItem.value.uuid)
    taskStore.pollLoadByData(res.data.data)
  } finally {
    taskIsLoading.value = false
  }
}
const taskDelete = async () => {
  taskIsLoading.value = true
  try {
    const res = await adminTaskDeleteApi(taskForwardItem.value.uuid)
    taskStore.pollLoadByData(res.data.data)
  } finally {
    taskIsLoading.value = false
  }
}

const isEditing = ref(false)

const toggleEdit = () => {
  isEditing.value = !isEditing.value
}

const boxRef = ref<HTMLElement | null>(null)
const boxSize = useElementSize(boxRef)
const boxStyleHeight = computed(() => {
  return `${boxSize.height.value}px`
})
</script>
<template>
  <div class="forward-auto-task-item">
    <div class="info-box">
      <div @click="toggleEdit" class="top-line">
        <div class="info-row">
          <div class="info-col progress">
            <div class="progress-box">
              <el-progress
                :percentage="
                  (taskForwardItem.completedCount /
                    (taskForwardItem.totalCount || 1)) *
                  100
                "
                :show-text="false"
                :stroke-width="8"
                :status="taskStatusInfo.progressStatus"
              />
            </div>
          </div>
          <div class="info-col lable-date-button">
            <div class="lable">
              <div class="text">
                <span class="count">
                  {{
                    `${taskForwardItem.completedCount}/${taskForwardItem.totalCount}`
                  }}
                </span>
                <span class="message">
                  {{ taskStatusInfo.message }}
                </span>
              </div>
            </div>
            <div class="date-button">
              <div class="date">
                <div class="text">
                  {{ formatTimeAgoChs(taskForwardItem.startedAt) }}
                </div>
              </div>
              <Transition name="fade" mode="out-in">
                <div class="button" :key="taskForwardItem.status">
                  <el-button
                    :type="taskStatusInfo.buttonType"
                    :icon="taskStatusInfo.buttonIcon"
                    circle
                    size="small"
                    :loading="taskIsLoading"
                    @click.stop="taskStatusInfo.atClick"
                  />
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
        <Transition name="fade05">
          <div v-if="isEditing" ref="boxRef">
            <div class="info-divider"></div>
            <div class="info-row form">
              <ForwardAutoTaskForm
                :item="item"
                :toggleEdit="toggleEdit"
              ></ForwardAutoTaskForm>
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

$media-max-width: 992px;
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
  // height: 45px;
  cursor: pointer;
  user-select: none;
  &.is-forwarding {
    cursor: progress;
  }
}
.info-row {
  margin: 0 20px;
  padding: 6px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  &.form {
    display: block;
    margin: 0;
    padding: 0;
  }
  @media (max-width: $media-max-width) {
    display: block;
  }
}

.info-col {
  // margin: 0 10px;
  padding: 4px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.progress {
  width: 60%;
  display: block;
  @media (max-width: $media-max-width) {
    width: auto;
    padding-top: 10px;
  }
}

.lable-date-button {
  width: calc(40% - 10px);

  @media (max-width: $media-max-width) {
    width: auto;
  }

  .lable {
    display: flex;
    align-items: center;
    .text {
      color: var(--color-text-soft);

      .count {
        font-weight: bold;
        font-family: 'Consolas', 'Courier New', monospace;
      }
      .message {
        margin-left: 10px;
        font-weight: bold;
      }
    }
  }

  .date-button {
    display: flex;
    align-items: center;
    .date {
      display: flex;
      align-items: center;
      color: var(--color-text-soft);
    }
    .button {
      display: flex;
      align-items: center;
      margin-left: 10px;

      .el-button {
        display: flex;
      }
    }
  }
}

.el-progress {
  :deep() {
    .el-progress-bar__outer {
      background-color: var(--color-background);
      transition: background-color 0.5s;
    }
  }
}
</style>
