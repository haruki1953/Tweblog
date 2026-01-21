<script setup lang="ts">
import { adminTaskAbortApi, adminTaskDeleteApi } from '@/api'
import { taskStatusMap } from '@/config'
import { useTaskStore } from '@/stores'
import { formatTimeAgoChs } from '@/utils'
import { Check, CloseBold, Select, SemiSelect } from '@element-plus/icons-vue'
import { computed, ref } from 'vue'

const taskStore = useTaskStore()

const taskImportList = computed(() => taskStore.taskImportList)

type ImportTaskItem = (typeof taskStore.taskImportList)[number]

const isRunning = (taskImportItem: ImportTaskItem) => {
  return taskImportItem.status === taskStatusMap.running.key
}
const isCompleted = (taskImportItem: ImportTaskItem) => {
  return taskImportItem.status === taskStatusMap.completed.key
}
const isAborted = (taskImportItem: ImportTaskItem) => {
  return taskImportItem.status === taskStatusMap.aborted.key
}
const isStopped = (taskImportItem: ImportTaskItem) => {
  return taskImportItem.status === taskStatusMap.stopped.key
}

const taskStatusInfo = (taskImportItem: ImportTaskItem) => {
  if (isRunning(taskImportItem)) {
    return {
      progressStatus: '',
      message: '正在导入',
      buttonType: 'info',
      buttonIcon: SemiSelect,
      atClick: () => taskAbort(taskImportItem)
    } as const
  }
  if (isCompleted(taskImportItem)) {
    return {
      progressStatus: 'success',
      message: '导入完成',
      buttonType: 'success',
      buttonIcon: Select,
      atClick: () => taskDelete(taskImportItem)
    } as const
  }
  if (isAborted(taskImportItem)) {
    return {
      progressStatus: 'exception',
      message: '导入中止',
      buttonType: 'danger',
      buttonIcon: CloseBold,
      atClick: () => taskDelete(taskImportItem)
    } as const
  }
  // if
  isStopped(taskImportItem)
  return {
    progressStatus: 'exception',
    message: '导入停止',
    buttonType: 'danger',
    buttonIcon: CloseBold,
    atClick: () => taskDelete(taskImportItem)
  } as const
}

const loadingMarkList = ref<string[]>([])
const taskIsLoading = (taskImportItem: ImportTaskItem) => {
  return loadingMarkList.value.includes(taskImportItem.uuid)
}
const taskSetLoading = (
  taskImportItem: ImportTaskItem,
  set: boolean = true
) => {
  if (set) {
    loadingMarkList.value.push(taskImportItem.uuid)
  } else {
    loadingMarkList.value = loadingMarkList.value.filter(
      (i) => i !== taskImportItem.uuid
    )
  }
}
const taskAbort = async (taskImportItem: ImportTaskItem) => {
  taskSetLoading(taskImportItem, true)
  try {
    const res = await adminTaskAbortApi(taskImportItem.uuid)
    taskStore.pollLoadByData(res.data.data)
  } finally {
    taskSetLoading(taskImportItem, false)
  }
}
const taskDelete = async (taskImportItem: ImportTaskItem) => {
  taskSetLoading(taskImportItem, true)
  try {
    const res = await adminTaskDeleteApi(taskImportItem.uuid)
    taskStore.pollLoadByData(res.data.data)
  } finally {
    taskSetLoading(taskImportItem, false)
  }
}
</script>
<template>
  <div class="import-task">
    <Transition name="fade">
      <div class="task-list" v-if="taskImportList.length > 0">
        <TransitionGroup name="fade-slide-list">
          <div
            class="task-item"
            v-for="taskImportItem in taskImportList"
            :key="taskImportItem.uuid"
          >
            <div class="info-box">
              <div class="info-row">
                <!-- <div class="info-id"></div> -->
                <div class="info-col progress">
                  <div class="progress-box">
                    <el-progress
                      :percentage="
                        (taskImportItem.completedCount /
                          (taskImportItem.totalCount || 1)) *
                        100
                      "
                      :show-text="false"
                      :stroke-width="8"
                      :status="taskStatusInfo(taskImportItem).progressStatus"
                    />
                  </div>
                </div>
                <div class="info-col lable-date-button">
                  <div class="lable">
                    <div class="text">
                      <span class="count">
                        {{
                          `${taskImportItem.completedCount}/${taskImportItem.totalCount}`
                        }}
                      </span>
                      <span class="message">
                        {{ taskStatusInfo(taskImportItem).message }}
                      </span>
                    </div>
                  </div>
                  <div class="date-button">
                    <div class="date">
                      <div class="text">
                        {{ formatTimeAgoChs(taskImportItem.startedAt) }}
                      </div>
                    </div>
                    <Transition name="fade" mode="out-in">
                      <div class="button" :key="taskImportItem.status">
                        <el-button
                          :type="taskStatusInfo(taskImportItem).buttonType"
                          :icon="taskStatusInfo(taskImportItem).buttonIcon"
                          circle
                          size="small"
                          :loading="taskIsLoading(taskImportItem)"
                          @click="taskStatusInfo(taskImportItem).atClick"
                        />
                      </div>
                    </Transition>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
// @use '../../../styles/control.scss';

.task-list {
  position: relative;
  margin-bottom: 20px;
}

.task-item {
  width: 100%;
  $media-max-width: 992px;

  .info-box {
    margin-bottom: 10px;
    background-color: var(--color-background-soft);
    transition: background-color 0.5s;
    border-radius: 20px;
    transition:
      background-color 0.5s,
      box-shadow 0.5s;

    &:hover {
      box-shadow: var(--el-box-shadow-lighter);
      // background-color: var(--color-background-mute);
    }
  }

  .info-divider {
    // height: 2px;
    // background-color: var(--color-background);
    // transition: background-color 0.5s;
    border-top: 2.4px solid var(--color-background); // divider
    transition: border 0.5s;
  }

  .info-row {
    margin: 0 20px;
    padding: 6px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;

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
