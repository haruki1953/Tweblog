<script setup lang="ts">
import {
  CircleCloseFilled,
  InfoFilled,
  RefreshRight,
  SuccessFilled,
  WarningFilled
} from '@element-plus/icons-vue'
import LogAppInfo from './components/LogAppInfo.vue'
import { useLogStore } from '@/stores'
import LogListItem from './components/LogListItem.vue'
import { ref } from 'vue'
import { computed } from 'vue'
import { logTypeEnum, type LogTypeEnumValues } from '@/config'
import { cloneDeep } from 'lodash'
import { onMounted } from 'vue'
import LogDeleteDialog from './components/LogDeleteDialog.vue'

const logStore = useLogStore()
logStore.resetLimited()

onMounted(() => {
  if (logStore.isNeedReget) {
    resetLog()
    logStore.setNeedReget(false)
  }
})

const isRefreshing = ref(false)

const regetLog = async () => {
  isRefreshing.value = true
  await logStore.reGetData().catch(() => {})
  isRefreshing.value = false
}
const resetLog = () => {
  logStore.querySet({})
  regetLog()
}

const switchState = computed(() => {
  const error = logStore.queryValue.error === 'false' ? false : true
  const warning = logStore.queryValue.warning === 'false' ? false : true
  const success = logStore.queryValue.success === 'false' ? false : true
  const info = logStore.queryValue.info === 'false' ? false : true
  return {
    error,
    warning,
    success,
    info
  }
})
const switchClick = (type: LogTypeEnumValues) => {
  // 刷新时不能切换
  if (isRefreshing.value) {
    return
  }
  // 将对应type取反
  const newState = cloneDeep(switchState.value)
  newState[type] = !newState[type]
  // 不能全为false
  const trueCount = logTypeEnum.filter((key) => newState[key] === true)
  if (trueCount.length === 0) {
    return
  }
  // 设置query
  const error = newState.error === false ? 'false' : 'true'
  const warning = newState.warning === false ? 'false' : 'true'
  const success = newState.success === false ? 'false' : 'true'
  const info = newState.info === false ? 'false' : 'true'
  logStore.querySet({
    error,
    warning,
    success,
    info
  })
  // 重新获取
  regetLog()
}

const refLogDeleteDialog = ref<InstanceType<typeof LogDeleteDialog> | null>(
  null
)

const scrollLoad = () => {
  if (isRefreshing.value) {
    return
  }
  logStore.loadLimited()
}
</script>
<template>
  <div class="log-page">
    <LogDeleteDialog
      :afterDelete="resetLog"
      ref="refLogDeleteDialog"
    ></LogDeleteDialog>
    <div class="control-box">
      <div class="control-row">
        <LogAppInfo></LogAppInfo>
      </div>
      <div class="control-divider"></div>
      <div class="control-row log">
        <div class="log-control">
          <div class="left-button">
            <el-button
              @click="resetLog"
              :loading="isRefreshing"
              type="primary"
              circle
              :icon="RefreshRight"
            >
            </el-button>
            <el-button
              @click="refLogDeleteDialog?.open()"
              type="primary"
              round
              text
              size="small"
            >
              清理
            </el-button>
          </div>
          <div class="right-switch">
            <el-switch
              :modelValue="switchState.info"
              :active-icon="InfoFilled"
              :inactive-icon="InfoFilled"
              inline-prompt
              style="--el-switch-on-color: var(--el-color-info)"
              @click="switchClick('info')"
            />
            <el-switch
              :modelValue="switchState.success"
              :active-icon="SuccessFilled"
              :inactive-icon="SuccessFilled"
              inline-prompt
              style="--el-switch-on-color: var(--el-color-success)"
              @click="switchClick('success')"
            />
            <el-switch
              :modelValue="switchState.warning"
              :active-icon="WarningFilled"
              :inactive-icon="WarningFilled"
              inline-prompt
              style="--el-switch-on-color: var(--el-color-warning)"
              @click="switchClick('warning')"
            />
            <el-switch
              :modelValue="switchState.error"
              :active-icon="CircleCloseFilled"
              :inactive-icon="CircleCloseFilled"
              inline-prompt
              style="--el-switch-on-color: var(--el-color-error)"
              @click="switchClick('error')"
            />
          </div>
        </div>
      </div>
    </div>

    <div
      class="log-list"
      v-infinite-scroll="scrollLoad"
      :infinite-scroll-distance="200"
      :infinite-scroll-delay="0"
      :infinite-scroll-immediate="false"
    >
      <TransitionGroup name="fade-slide-list">
        <div
          class="log-item"
          v-for="item in logStore.limitedList"
          :key="item.id"
        >
          <LogListItem :item="item"></LogListItem>
        </div>
      </TransitionGroup>
      <div
        class="load-button-box"
        v-if="logStore.isHaveMoreLimited && logStore.limitedList.length"
      >
        <el-button
          text
          type="primary"
          round
          size="small"
          :loading="logStore.isLoadingLimited || isRefreshing"
          @click="logStore.loadLimited"
        >
          加载更多
        </el-button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.control-row.log {
  padding: 10px;
}
.log-control {
  display: flex;
  align-items: center;
  justify-content: space-between;
  .left-button {
    display: flex;
    align-items: center;
    justify-content: start;
    .el-button + .el-button {
      margin-left: 5px;
    }
  }
  .right-switch {
    display: flex;
    align-items: center;
    justify-content: end;
    flex-wrap: wrap;
    .el-switch {
      margin: 0 3px;
    }
  }
}

.log-list {
  position: relative;
  .log-item {
    width: 100%;
  }
}

.load-button-box {
  display: flex;
  justify-content: center;
  margin-top: 10px;
  .el-button {
    width: 50%;
    max-width: 200px;
  }
}
</style>
