<script setup lang="ts">
import { useForwardStore } from '@/stores/forward'
import type { PostPoolItem } from '@/types'
import { computed } from 'vue'
import ForwardSubmitItem from './ForwardSubmitItem.vue'

const props = defineProps<{
  postPoolItem: PostPoolItem
  submitControl: (id: string, callback: () => Promise<any>) => Promise<void>
  isSubmitting: (id: string) => boolean
}>()

const forwardStore = useForwardStore()

const forwardSettingList = computed(() => forwardStore.forwardSettingList)
</script>
<template>
  <div class="forward-submit-list">
    <div class="forward-list">
      <div
        class="forward-item"
        v-for="item in forwardSettingList"
        :key="item.uuid"
      >
        <ForwardSubmitItem
          :item="item"
          :postPoolItem="postPoolItem"
          :isSubmitting="isSubmitting"
          :submitControl="submitControl"
        ></ForwardSubmitItem>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.forward-list {
  position: relative;
  margin-bottom: 20px;
}

.forward-item {
  width: 100%;
}
</style>
