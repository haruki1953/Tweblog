<script setup lang="ts">
import { usePostStore } from '@/stores'
import type { PostPoolItem, PostData } from '@/types'
import { onMounted } from 'vue'
import { ref, watch } from 'vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BottomSkeleton from './components/BottomSkeleton.vue'

const route = useRoute()
const postStore = usePostStore()

const routePostId = computed(() => {
  const userId = route.params.id
  if (userId == null) {
    return null
  }
  if (typeof userId === 'string') {
    return userId
  } else {
    return userId[0]
  }
})
const postPoolItem = computed((): PostPoolItem | undefined => {
  if (routePostId.value == null) {
    return undefined
  }
  return postStore.getPostPoolItem(routePostId.value)
})

const mainPostGroup = computed(() => {
  if (!postPoolItem.value) {
    return undefined
  }
  const postGroup: PostData[] = []
  if (postPoolItem.value.parentPost) {
    postGroup.push(postPoolItem.value.parentPost)
  }
  postGroup.push(postPoolItem.value.mainPost)
  return postGroup
})

const shouldShow2Col = computed(() => {
  if (!postPoolItem.value) {
    return false
  }
  if (postPoolItem.value.replies.length === 0) {
    return false
  }
  return true
})

const loadPostPoolItemData = () => {
  if (routePostId.value == null) {
    return
  }
  if (postStore.isPostRequested(routePostId.value)) {
    return
  }
  postStore.getPostById(routePostId.value)
}

const shouldShowSkeletonOnMounted = ref(false)
const checkShouldShowSkeletonOnMounted = async () => {
  if (!postPoolItem.value) {
    return
  }
  if (!postStore.isPostRequested(postPoolItem.value.id)) {
    // 骨架屏至少显示一段时间
    shouldShowSkeletonOnMounted.value = true
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
  shouldShowSkeletonOnMounted.value = false
}

// // 测试骨架屏
// const isBlue = ref(false)
// setInterval(() => {
//   isBlue.value = !isBlue.value
// }, 2000)
// const isShowSkeleton = computed(() => isBlue.value)
// // const isShowSkeleton = computed(() => true)

const isShowSkeleton = computed(() => {
  if (!postPoolItem.value) {
    return false
  }
  if (shouldShowSkeletonOnMounted.value) {
    return true
  }
  if (!postStore.isPostRequested(postPoolItem.value.id)) {
    return true
  }
  return false
})

onMounted(() => {
  loadPostPoolItemData()
  checkShouldShowSkeletonOnMounted()
})

watch(routePostId, () => {
  loadPostPoolItemData()
  checkShouldShowSkeletonOnMounted()
})

// when postStore.resetPostRequested(), to loadPostPoolItemData() again
watch(
  () => {
    if (postPoolItem.value == undefined) {
      return
    }
    return postStore.isPostRequested(postPoolItem.value.id)
  },
  () => {
    if (postPoolItem.value == undefined) {
      return
    }
    if (postStore.isPostRequested(postPoolItem.value.id)) {
      return
    }
    loadPostPoolItemData()
  }
)

// const replyPost = () => {
//   if (!postPoolItem.value) {
//     return
//   }
//   postStore.toReplySendPage(postPoolItem.value.mainPost)
// }

// 优化单帖子（无回复，即单列显示）情况下，从骨架屏到帖子的过渡
// 当在初始化（setup）时就有数据，禁用过渡（避免重复过渡）
const haveMainPostOnSetUp = mainPostGroup.value != null
</script>
<template>
  <div :key="String(route.params.id) + String(shouldShow2Col)">
    <div v-if="!shouldShow2Col">
      <DataContainerMountedMask>
        <Col1Layout>
          <TopBar title="查看推文"></TopBar>
          <!-- 暂无此贴，显示骨架屏 -->
          <div v-if="mainPostGroup == null">
            <PostGroup :data="[]"></PostGroup>
          </div>
          <!-- 显示帖子 -->
          <div v-else>
            <DataContainerMountedMask :disabled="haveMainPostOnSetUp">
              <div class="main-post-group-box">
                <PostGroup :data="mainPostGroup"></PostGroup>
              </div>
              <!-- <div class="replie-button-box col1">
                <el-button type="primary" round @click="replyPost">
                  回 复
                </el-button>
              </div> -->
              <BottomSkeleton :show="isShowSkeleton"></BottomSkeleton>
            </DataContainerMountedMask>
          </div>
          <!-- 没有回帖 -->
        </Col1Layout>
      </DataContainerMountedMask>
    </div>
    <div v-else>
      <DataContainerMountedMask>
        <Col2Layout :span="12">
          <template #colLeftSm>
            <TopBar title="查看推文"></TopBar>
            <div class="main-post-group-box" v-if="mainPostGroup">
              <PostGroup :data="mainPostGroup"></PostGroup>
            </div>
            <!-- <div class="replie-button-box">
              <el-button type="primary" round @click="replyPost">
                回 复
              </el-button>
            </div> -->
          </template>
          <template #colLeft>
            <TopBar title="查看推文"></TopBar>
            <div class="main-post-group-box" v-if="mainPostGroup">
              <PostGroup :data="mainPostGroup"></PostGroup>
            </div>
            <!-- <div class="replie-button-box">
              <el-button type="primary" round @click="replyPost">
                回 复
              </el-button>
            </div> -->
          </template>
          <template #colRight>
            <div class="replies-post-group-box" v-if="postPoolItem">
              <!-- <TransitionGroup name="fade-slide"> -->
              <PostGroup
                v-for="postGroup in postPoolItem.replies"
                :key="postGroup.map((p) => p.id).toString()"
                :data="postGroup"
              >
              </PostGroup>
              <!-- </TransitionGroup> -->
            </div>
            <BottomSkeleton :show="isShowSkeleton"></BottomSkeleton>
            <div style="height: 1px"></div>
          </template>
        </Col2Layout>
      </DataContainerMountedMask>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.top-bar {
  margin-bottom: 20px;
}
.replie-button-box {
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  .el-button {
    display: flex;
    width: 50%;
    :deep() {
      span {
        color: var(--color-background);
        font-weight: bold;
        transition: all 0.2s;
        // letter-spacing: 6px;
      }
    }
  }
}
.replies-post-group-box {
}
</style>
