import { usePostStore } from '@/stores'
import type { PostData } from '@/types'
import { sakiMessage } from '@/utils'
import { computed, type ComputedRef } from 'vue'

export const usePostFavoriteService = (dependencies: {
  //
  propsdata: ComputedRef<PostData>
}) => {
  const { propsdata } = dependencies

  const postStore = usePostStore()

  const setFavorite = () => {
    postStore.favoriteAddPost(propsdata.value)
    sakiMessage({
      type: 'success',
      message: '已收藏'
    })
  }

  // setFavorite again
  const topFavorite = () => {
    postStore.favoriteAddPost(propsdata.value)
  }

  const removeFavorite = () => {
    postStore.favoriteDelPostById(propsdata.value.id)
    sakiMessage({
      type: 'info',
      message: '已取消收藏'
    })
  }

  const isFavorite = computed(() => {
    return Boolean(postStore.favoriteGetPostById(propsdata.value.id))
  })

  return {
    setFavorite,
    topFavorite,
    removeFavorite,
    isFavorite
  }
}
