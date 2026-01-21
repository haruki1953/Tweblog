<script setup lang="ts">
import type { TaskForwardItem } from '@/types'
import { computed } from 'vue'
import ForwardAutoTaskItem from './ForwardAutoTaskItem.vue'

const props = defineProps<{
  list: TaskForwardItem[]
}>()

const taskForwardList = computed(() => props.list)
</script>
<template>
  <div class="forward-auto-task-list">
    <div class="task-list">
      <TransitionGroup name="fade-slide-list">
        <div class="task-item" v-for="item in taskForwardList" :key="item.uuid">
          <ForwardAutoTaskItem :item="item"></ForwardAutoTaskItem>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.task-list {
  position: relative;
}
.task-item {
  width: 100%;
  margin-bottom: 10px;
}
</style>
