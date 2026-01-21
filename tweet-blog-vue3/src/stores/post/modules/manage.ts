import type { PostPoolItem, PostData } from '@/types'
import type { Ref } from 'vue'

export const useManageModule = (dependencies: {
  postList: Ref<PostData[][]>
  postPool: Ref<PostPoolItem[]>
}) => {
  // data
  const { postList } = dependencies

  // update post in postList
  const updatePostListIsDeleted = (id: string, isDeleted: boolean) => {
    postList.value.forEach((group) => {
      const findPost = group.find((post) => post.id === id)
      if (findPost) {
        findPost.isDeleted = isDeleted
      }
    })
  }
  const updatePostListToRemove = (id: string) => {
    postList.value = postList.value
      .map((group) => {
        return group.filter((post) => post.id !== id)
      })
      .filter((group) => group.length > 0)
  }

  return {
    updatePostListIsDeleted,
    updatePostListToRemove
  }
}
