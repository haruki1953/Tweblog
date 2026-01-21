<script setup lang="ts">
import { appInfo } from '@/config'
import { useForwardStore } from '@/stores'
import { computed } from 'vue'
import ImportSubmitAdvancedForwardSettingItem from './ImportSubmitAdvancedForwardSettingItem.vue'

const model = defineModel<{
  forwardConfigId: string
}>({ required: true })

const props = defineProps<{
  toggleEdit: () => void
}>()

const forwardStore = useForwardStore()
const forwardSettingList = computed(() => forwardStore.forwardSettingList)
</script>
<template>
  <div class="import-submit-advanced">
    <div class="lable-box">
      <div class="control-lable-with-link">
        <div class="lable">在导入的同时关联至转发记录</div>
        <a
          class="link"
          :href="appInfo.importAdvancedDocs.link"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ appInfo.importAdvancedDocs.text }}
        </a>
      </div>
    </div>
    <div class="forward-list">
      <div
        class="forward-item"
        v-for="item in forwardSettingList"
        :key="item.uuid"
      >
        <ImportSubmitAdvancedForwardSettingItem
          :item="item"
          v-model="model.forwardConfigId"
        ></ImportSubmitAdvancedForwardSettingItem>
      </div>
    </div>
    <TweetEmpty
      description="暂无转发配置"
      v-if="forwardSettingList.length === 0"
      size="small"
    ></TweetEmpty>
  </div>
</template>

<style lang="scss" scoped>
.import-submit-advanced {
  padding: 10px 0;
}

.lable-box {
  padding: 0 20px;
  .control-lable-with-link {
    margin-bottom: 10px;
  }
}

.tweet-empty.tweet-empty {
  padding: 5px 0 20px 0;
}
</style>
