<script setup lang="ts">
import { useProfileStore } from '@/stores'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    limit?: boolean
    maxNum?: number
  }>(),
  {
    limit: false,
    maxNum: 4
  }
)

const profileStore = useProfileStore()

const socialMediasInfo = computed(() => {
  if (!props.limit) {
    return profileStore.socialMedias
  }
  return profileStore.socialMedias.slice(0, props.maxNum)
})
</script>
<template>
  <div class="social-medias-group">
    <TransitionGroup name="fade-slide-right-list">
      <div
        class="link-icon-box"
        v-for="item in socialMediasInfo"
        :key="item.uuid"
      >
        <el-tooltip
          :content="item.description"
          :disabled="item.description === ''"
          placement="bottom"
          effect="light"
        >
          <a
            class="link-icon"
            :href="item.link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Transition name="fade-pop" mode="out-in">
              <el-icon
                :class="item.fontawesomeClass"
                size="20"
                :key="item.fontawesomeClass"
              ></el-icon>
            </Transition>
          </a>
        </el-tooltip>
      </div>
    </TransitionGroup>
  </div>
</template>

<style lang="scss" scoped>
.social-medias-group {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  color: var(--color-text);
  transition: color 0.2s;
}
.link-icon-box {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
}
.link-icon {
  display: flex;
  text-decoration: none; /* 去除下划线 */
  color: inherit; /* 使用父元素的颜色 */
  margin: 0 10px;
  .el-icon {
    display: flex;
    &::before {
      display: flex;
    }
  }
}
</style>
