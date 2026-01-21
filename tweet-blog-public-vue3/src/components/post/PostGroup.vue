<script setup lang="ts">
import { useStatesStore } from '@/stores'
import type { PostData, PostsGetMode } from '@/types'

withDefaults(
  defineProps<{
    data: PostData[]
    mini?: boolean
    notPreview?: boolean
    notAlt?: boolean
    postMode?: PostsGetMode
    forward?: boolean
  }>(),
  {
    mini: false,
    notPreview: false,
    notAlt: false,
    postMode: 'normal',
    forward: false
  }
)

const statesStore = useStatesStore()
// 在明暗切换时不显示渐变条动画
</script>
<template>
  <div class="post-group post-group-skeleton" v-if="data.length === 0">
    <el-skeleton
      :rows="5"
      animated
      :class="{
        'is-dark-transitioning': statesStore.isDarkTransitioning
      }"
    />
  </div>
  <div class="post-group" :class="{ 'card-mini': mini }" v-else>
    <template v-for="(post, index) in data" :key="post.id">
      <div class="post-row">
        <PostCard
          :data="post"
          :mini="mini"
          :notPreview="notPreview"
          :notAlt="notAlt"
          :postMode="postMode"
          :forward="forward"
        ></PostCard>
      </div>
      <!-- <el-divider v-if="index < data.length - 1" border-style="dotted" /> -->
      <div class="post-divider" v-if="index < data.length - 1"></div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.post-row {
  padding: 12px 18px 14px 18px;
}
.post-divider {
  // height: 2px;
  // background-color: var(--color-background);
  // transition: background-color 0.5s;
  border-top: 2.4px solid var(--color-background); // divider
  transition: border 0.5s;
}
.post-group {
  margin-bottom: 15px;
  background-color: var(--color-background-soft);
  border-radius: 20px;
  transition: all 0.5s;
  &.card-mini {
    padding-bottom: 18px;
    .el-divider {
      margin-top: 18px;
    }
  }
  &:hover {
    // box-shadow: var(--el-box-shadow);
    box-shadow: var(--el-box-shadow-light);
    // box-shadow: var(--el-box-shadow-lighter);
    // box-shadow: var(--el-box-shadow-dark);
  }
}
.post-group-skeleton {
  padding: 12px 18px 14px 18px;
  .el-skeleton {
    :deep() {
      .el-skeleton__item {
        background: none;
        background-color: var(--color-background);
        background-image: linear-gradient(
          90deg,
          var(--color-background) 25%,
          var(--color-background-mute) 37%,
          var(--color-background) 63%
        );
        background-size: 400% 100%;
        transition: all 0.5s;
      }
      .is-first {
        width: 40%;
        margin-left: 60%;
      }
      .is-last {
        width: 60%;
        margin: 0 20%;
        margin-top: 16px;
      }
    }
    &.is-dark-transitioning {
      :deep() {
        .el-skeleton__item {
          background-image: none;
        }
      }
    }
  }
}
.el-divider {
  width: 90%;
  margin: 14px auto;
  transition: all 0.5s;
  --el-border-color: var(--color-border);
}
</style>
