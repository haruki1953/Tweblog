<script setup lang="ts">
import { useProfileStore } from '@/stores'
import type { BackendProfileStore } from '@/types'
import { computed } from 'vue'

const props = defineProps<{
  type: BackendProfileStore['externalLinks'][number]['type']
}>()

const profileStore = useProfileStore()

const externalLinksInfo = computed(() => {
  return profileStore.externalLinks.filter((i) => i.type === props.type)
})
</script>
<template>
  <div class="external-links-group">
    <a
      class="external-links-item"
      v-for="item in externalLinksInfo"
      :key="item.uuid"
      :href="item.link"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div class="link-box">
        <div class="avatar-name" :href="item.link" target="_blank">
          <div class="avatar-box" :key="item.icon">
            <img
              class="avatar"
              :class="{ circle: item.isCircle }"
              :src="profileStore.getIconUrlByLinkItem(item)"
            />
          </div>
          <span class="name" v-if="item.name !== ''">{{ item.name }}</span>
        </div>
      </div>
    </a>
  </div>
</template>

<style lang="scss" scoped>
.external-links-group {
  display: flex;
  flex-wrap: wrap;
  // justify-content: center;
  align-items: center;
}

.external-links-item {
  max-width: 80%;
  margin: 8px;
  padding: 8px 10px;
  border-radius: 10px;
  transition:
    background-color 0.5s,
    color 0.2s,
    transform 0.2s;
  text-decoration: none; /* 去除下划线 */
  color: inherit; /* 使用父元素的颜色 */
  cursor: pointer;
  &:hover {
    background-color: var(--color-background-mute);
    transform: scale(1.1, 1.1);
  }
  &.selected {
    background-color: var(--el-color-primary-light-7);
  }
  .link-box {
    display: block;
    // margin: 10px;
    user-select: none;
    .avatar-name {
      height: 44px;
      display: flex;
      align-items: center;
      text-decoration: none;
      color: var(--color-text);
      .avatar-box {
        display: flex;
        align-items: center;
      }
      .avatar {
        width: 44px;
        height: 44px;
        border-radius: 4px;
        transition: border-radius 0.5s;
        &.circle {
          border-radius: 50%;
        }
      }
      .name {
        margin: 0 0 0 10px;
        transition: all 0.5s;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
}
</style>
