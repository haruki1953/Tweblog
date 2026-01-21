import { postGetByIdApi } from '@/api'
import { postConfig } from '@/config'
import { useStatesStore } from '@/stores'
import type { PostPoolItem } from '@/types'
import { postGetByIdDataHandle } from '@/utils'
import { ref, type Ref } from 'vue'

export const usePoolModule = (dependencies: {
  postPool: Ref<PostPoolItem[]>
}) => {
  const { postPool } = dependencies

  // data
  const getPostPoolItem = (id: string): PostPoolItem | undefined => {
    return postPool.value.find((i) => i.id === id)
  }

  const requestedPostIds = ref<string[]>([])
  const isPostRequested = (id: string) => {
    const find = requestedPostIds.value.find((i) => i === id)
    if (find == null) {
      return false
    } else {
      return true
    }
  }
  const resetPostRequested = () => {
    requestedPostIds.value = []
  }

  // useSomething
  const statesStore = useStatesStore()

  // GET post to postPool
  const getPostById = async (id: string) => {
    statesStore.setPostIdLoading(id)
    let res
    try {
      res = await postGetByIdApi(id)
    } catch (error) {
      return
    } finally {
      statesStore.setPostIdLoaded(id)
    }

    const resPostGetByIdData = res.data.data
    const newPostPoolItem = postGetByIdDataHandle(resPostGetByIdData)
    requestedPostIds.value.push(newPostPoolItem.id)

    const index = postPool.value.findIndex((p) => p.id === newPostPoolItem.id)
    if (index >= 0) {
      const oldPostPoolItem = postPool.value[index]
      postPool.value[index] = newPostPoolItem
      postPool.value[index].pushAt = oldPostPoolItem.pushAt
    } else {
      postPool.value.push(newPostPoolItem)
    }

    tryLimitPostPoolSize()
  }
  const tryLimitPostPoolSize = () => {
    // limit postPool size
    if (postPool.value.length > postConfig.postPoolSizeLimit) {
      // Sort the postPool by updateAt date in ascending order
      postPool.value.sort(
        (a, b) =>
          new Date(a.updateAt).getTime() - new Date(b.updateAt).getTime()
      )
      // Remove the oldest items
      const removedList = postPool.value.splice(
        0,
        postConfig.postPoolSizeRemove
      )
      // 注意requestedPostIds
      requestedPostIds.value = requestedPostIds.value.filter(
        (i) => !removedList.find((item) => item.id === i)
      )
    }
  }

  return {
    isPostRequested,
    resetPostRequested,
    getPostPoolItem,
    getPostById
  }
}
