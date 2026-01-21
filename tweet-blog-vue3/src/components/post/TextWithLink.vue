<script setup lang="ts">
import type { PostContentPart } from '@/types'
import { textToPostContentPart } from '@/utils'
import { computed } from 'vue'

const props = defineProps<{
  data: string
}>()

const contentParts = computed((): PostContentPart[] => {
  return textToPostContentPart(props.data)
})
</script>
<template>
  <div class="text-with-link">
    <template v-for="part in contentParts">
      <template v-if="part.type === 'link'">
        <a
          type="primary"
          :href="part.href"
          target="_blank"
          :key="part.content"
          rel="noopener noreferrer"
        >
          {{ part.content }}
        </a>
      </template>
      <template v-else>{{ part.content }}</template>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.text-with-link {
  a {
    color: var(--el-color-primary); // 未访问链接的颜色
    text-decoration: none; // 平时不显示下划线

    &:visited {
      color: var(--el-color-info); // 已访问链接的颜色
    }

    &:hover {
      color: var(--el-color-success); // 悬停时的颜色
      text-decoration: underline; // 悬停时显示下划线
    }
  }
}
</style>
