import type { PostBase, PostData } from '@/types'
import { computed, ref, type Ref } from 'vue'

export const useReadModule = (dependencies: {
  postList: Ref<PostData[][]>
}) => {
  const { postList } = dependencies

  const readPostIds = ref<string[]>([])
  const readLastTime = ref('')

  const readLastTimeDate = computed(() => {
    const date = new Date(readLastTime.value)
    if (isNaN(date.getTime())) {
      return null
    }
    return date
  })

  const readIsPostRead = (post: PostBase) => {
    // post in readPostIds
    if (readPostIds.value.includes(post.id)) {
      return true
    }
    // post before readLastTime
    if (
      readLastTimeDate.value &&
      readLastTimeDate.value.getTime() > new Date(post.createdAt).getTime()
    ) {
      return true
    }
    return false
  }

  const readSetPostRead = (post: PostBase) => {
    if (readIsPostRead(post)) {
      return
    }
    readPostIds.value.push(post.id)
  }

  const readSetAllRead = () => {
    readLastTime.value = new Date().toISOString()
  }

  const readInit = () => {
    if (!readLastTimeDate.value) {
      readLastTime.value = new Date().toISOString()
    }
  }

  const readNewPostIds = computed(() => {
    const notReadPostIds: string[] = []
    postList.value.forEach((postGroup) => {
      postGroup.forEach((post) => {
        if (!readIsPostRead(post) && !notReadPostIds.includes(post.id)) {
          notReadPostIds.push(post.id)
        }
      })
    })
    return notReadPostIds
  })

  const readNewPostCount = computed(() => {
    return readNewPostIds.value.length
  })

  return {
    readPostIds,
    readLastTime,
    readIsPostRead,
    readSetPostRead,
    readSetAllRead,
    readInit,
    readNewPostIds,
    readNewPostCount
  }
}
