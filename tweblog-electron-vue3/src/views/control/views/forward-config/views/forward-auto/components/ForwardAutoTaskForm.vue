<script setup lang="ts">
import { forwardingOrderMap, taskStatusMap } from '@/config'
import type { TaskForwardItem } from '@/types'
import { formatDuration, formatTimeAgoChs } from '@/utils'
import { ChatSquare } from '@element-plus/icons-vue'
import { useNow } from '@vueuse/core'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{
  item: TaskForwardItem
  toggleEdit: () => void
}>()

const forwardingOrderText = computed(() => {
  if (props.item.forwardingOrder === forwardingOrderMap['old-to-new'].key) {
    return '从旧到新'
  }
  // else forwardingOrderMap['new-to-old'].key
  return '从新到旧'
})

const forwardingIntervalSecondsText = computed(() => {
  return formatDuration(props.item.forwardingIntervalSeconds, 2)
})

// 响应式的当前时间，每秒更新一次
const nowRef = useNow({ interval: 1000 })
// 上次转发时间
const lastPostTimeText = computed(() => {
  if (props.item.status !== taskStatusMap.running.key) {
    // 任务非运行，则使用更概括的时间
    return formatTimeAgoChs(props.item.updatedAt)
  }
  const updatedAt = new Date(props.item.updatedAt)
  const seconds = Math.floor(
    (nowRef.value.getTime() - updatedAt.getTime()) / 1000
  )
  if (seconds > props.item.forwardingIntervalSeconds) {
    return `${formatDuration(props.item.forwardingIntervalSeconds, 2)}前`
  }
  return `${formatDuration(seconds, 2)}前`
})

const router = useRouter()

// 查看上次转发帖子
const lastPostLook = () => {
  router.push({ name: 'post', params: { id: props.item.lastForwardedPostId } })
}
</script>
<template>
  <div class="forward-auto-task-form">
    <div class="info-row">
      <div class="info-col left">
        <div class="lable-text forwarding-order">
          <div class="lable">转发顺序：</div>
          <div class="text">{{ forwardingOrderText }}</div>
        </div>
        <div class="lable-text forwarding-interval">
          <div class="lable">间隔时间：</div>
          <div class="text">{{ forwardingIntervalSecondsText }}</div>
        </div>
      </div>
      <div class="info-col right">
        <div class="lable-text last-time">
          <div class="lable">上次转发：</div>
          <div class="text">{{ lastPostTimeText }}</div>
        </div>
        <div class="post-button last-look">
          <el-button
            type="primary"
            :icon="ChatSquare"
            round
            size="small"
            @click="lastPostLook"
          >
            查看推文
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$media-max-width: 992px;
.info-row {
  margin: 0 20px;
  padding: 6px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  @media (max-width: $media-max-width) {
    display: block;
    .info-col {
      width: auto;
    }
  }
}
.info-col {
  padding: 4px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.left {
  width: calc(50% - 20px);
}
.right {
  width: calc(50% - 20px);
}

.lable-text {
  // max-width: 50%;
  display: flex;
  align-items: center;
  &.forwarding-order {
    max-width: 45%;
  }
  &.forwarding-interval {
    max-width: 55%;
  }
  &.last-time {
    max-width: 60%;
  }
  .lable {
    font-weight: bold;
    white-space: nowrap;
  }
  .text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
.post-button {
  display: flex;
  align-items: center;
  margin-left: 10px;

  .el-button {
    display: flex;
  }
}
</style>
