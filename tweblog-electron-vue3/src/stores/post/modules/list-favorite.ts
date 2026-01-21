import type { PostData } from '@/types'
import { computed, ref } from 'vue'

export const useListFavoriteModule = () => {
  const favoriteBaseList = ref<PostData[]>([])
  const favoriteList = computed((): PostData[][] => {
    return favoriteBaseList.value.map((p) => [p])
  })

  const favoriteAddPost = (post: PostData) => {
    favoriteDelPostById(post.id)
    favoriteBaseList.value.unshift(post)
    // TODO: 将对应帖子加入关联帖子组
  }

  const favoriteDelPostById = (id: string) => {
    favoriteBaseList.value = favoriteBaseList.value.filter((p) => p.id !== id)
  }

  const favoriteDelAllPost = () => {
    favoriteBaseList.value = []
  }

  const favoriteGetPostById = (id: string) => {
    return favoriteBaseList.value.find((p) => p.id === id)
  }

  return {
    favoriteBaseList,
    favoriteList,
    favoriteAddPost,
    favoriteDelPostById,
    favoriteDelAllPost,
    favoriteGetPostById
  }
}
