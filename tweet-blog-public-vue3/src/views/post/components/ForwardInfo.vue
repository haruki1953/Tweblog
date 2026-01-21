<script setup lang="ts">
import { platformKeyMap } from '@/config'
import type { PostPoolItem } from '@/types'
import { formatTimeAgoChs } from '@/utils'
import { Link } from '@element-plus/icons-vue'
import { computed } from 'vue'

const props = defineProps<{
  postPoolItem: PostPoolItem
}>()

// 降序排序
const postForwards = computed(() => {
  return props.postPoolItem.mainPost.postForwards
    .slice()
    .sort(
      (a, b) =>
        new Date(b.forwardAt).getTime() - new Date(a.forwardAt).getTime()
    )
})
</script>
<template>
  <div class="import-info">
    <div class="import-info-box" v-if="postForwards.length > 0">
      <div class="control-lable-with-button">
        <div class="lable">转发记录</div>
      </div>
      <div class="import-list">
        <TransitionGroup name="fade-slide-list">
          <div class="import-item" v-for="item in postForwards" :key="item.id">
            <div class="info-box">
              <div class="info-row">
                <div class="info-col left">
                  <div class="icon-text">
                    <el-icon
                      :class="platformKeyMap[item.platform].fontawesomeClass"
                      size="20"
                    ></el-icon>
                    <div class="text">
                      {{ platformKeyMap[item.platform].name }}
                    </div>
                  </div>
                </div>
                <div class="info-col right">
                  <div class="date-button">
                    <div class="date">
                      <div class="text">
                        {{ formatTimeAgoChs(item.forwardAt) }}
                      </div>
                    </div>
                    <div class="button">
                      <el-button
                        type="primary"
                        circle
                        size="small"
                        :icon="Link"
                        tag="a"
                        :href="item.link"
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.control-lable-with-button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 0 10px 10px;

  .lable {
    font-size: 14px;
    font-weight: bold;
    color: var(--color-text-soft);
  }

  .button {
    display: flex;
    align-items: center;
  }
}

.import-list {
  position: relative;
  margin-bottom: 20px;
}

.import-item {
  width: 100%;
}

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

.info-row {
  margin: 0 10px 0 15px;
  padding: 8px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.info-col {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.left {
  width: calc(100% - 120px);
}
.right {
}

.icon-text {
  width: 100%;
  display: flex;
  align-items: center;

  .el-icon {
    margin-right: 10px;
  }

  .text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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
</style>
