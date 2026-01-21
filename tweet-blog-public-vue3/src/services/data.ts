import {
  useImageStore,
  usePostStore,
  useStatesStore,
  useProfileStore
} from '@/stores'

export const dataFirstLoadService = async () => {
  const postStore = usePostStore()
  const imageStore = useImageStore()
  const profileStore = useProfileStore()

  const statesStore = useStatesStore()
  statesStore.setFirstDataLoading(true)
  await Promise.all([
    postStore.reGetPosts(),
    imageStore.reGetImages(),
    profileStore.loadAll()
  ])
  statesStore.setFirstDataLoading(false)
}
