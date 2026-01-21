<script setup lang="ts">
import { useForwardStore, usePostStore } from '@/stores'
import { onMounted } from 'vue'
import { ref, watch } from 'vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ForwardInfo from './components/ForwardInfo.vue'
import ImportInfo from './components/ImportInfo.vue'
import ForwardSubmitList from './components/ForwardSubmitList.vue'

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
const postPoolItem = computed(() => {
  if (routePostId.value == null) {
    return undefined
  }
  return postStore.getPostPoolItem(routePostId.value)
})

const loadPostPoolItemData = async () => {
  if (routePostId.value == null) {
    return
  }
  if (postStore.isPostRequested(routePostId.value)) {
    return
  }
  await postStore.getPostById(routePostId.value)
}

onMounted(() => {
  loadPostPoolItemData()
})

watch(routePostId, () => {
  loadPostPoolItemData()
})

// 优化从骨架屏到帖子的过渡
// 当在初始化（setup）时就有数据，禁用过渡（避免重复过渡）
const havePostOnSetUp = postPoolItem.value != null

// 记录真实的请求状态
const submittingMarkList = ref<string[]>([])
// 为了加载状态的显示而记录
const submittingShowList = ref<string[]>([])

const submitControl = async (id: string, callback: () => Promise<any>) => {
  submittingShowList.value.push(id)
  submittingMarkList.value.push(id)
  await callback().catch(() => {})
  submittingMarkList.value = submittingMarkList.value.filter((i) => i !== id)
  // 重新请求帖子数据，当仍有修改之类的请求在进行时，不要请求
  // 也就是说在 submittingMarkList 正在请求为空时再重新获取帖子数据
  // 并给 submittingShowList 赋值为空，此时所有加载就取消了
  // 优化：不要直接赋值为空，避免在重新请求期间添加的也被删除
  if (submittingMarkList.value.length === 0) {
    const submittingShowListTemp = submittingShowList.value
    // 必须resetPostRequested，否则获取的是缓存
    postStore.resetPostRequested()
    await loadPostPoolItemData()
    submittingShowList.value = submittingShowList.value.filter(
      (i) => !submittingShowListTemp.includes(i)
    )
  }
}

const isSubmitting = (id: string) => {
  return submittingShowList.value.includes(id)
}

const forwardStore = useForwardStore()
</script>
<template>
  <div :key="String(route.params.id)">
    <DataContainerMountedMask>
      <Col2Layout :span="12">
        <template #colLeftAndSm>
          <TopBar title="推文转发"></TopBar>
          <!-- 暂无此贴，显示骨架屏 -->
          <div v-if="postPoolItem == null">
            <PostGroup :data="[]"></PostGroup>
          </div>
          <!-- 显示帖子 -->
          <div v-else>
            <DataContainerMountedMask :disabled="havePostOnSetUp">
              <div class="main-post-group-box">
                <PostGroup :data="[postPoolItem.mainPost]" forward></PostGroup>
              </div>
            </DataContainerMountedMask>
          </div>
        </template>
        <template #colRight>
          <Transition name="fade" mode="out-in">
            <div
              v-if="
                postPoolItem == null ||
                (postPoolItem.mainPost.postForwards.length === 0 &&
                  postPoolItem.mainPost.postImports.length === 0 &&
                  forwardStore.forwardSettingList.length === 0)
              "
            >
              <TweetEmpty description="暂无转发记录"></TweetEmpty>
            </div>
            <div v-else>
              <ForwardSubmitList
                :postPoolItem="postPoolItem"
                :isSubmitting="isSubmitting"
                :submitControl="submitControl"
              ></ForwardSubmitList>
              <ForwardInfo
                :postPoolItem="postPoolItem"
                :isSubmitting="isSubmitting"
                :submitControl="submitControl"
              ></ForwardInfo>
              <ImportInfo
                :postPoolItem="postPoolItem"
                :isSubmitting="isSubmitting"
                :submitControl="submitControl"
              ></ImportInfo>
            </div>
          </Transition>
        </template>
      </Col2Layout>
    </DataContainerMountedMask>
  </div>
</template>

<style lang="scss" scoped>
.top-bar {
  margin-bottom: 20px;
}
</style>
