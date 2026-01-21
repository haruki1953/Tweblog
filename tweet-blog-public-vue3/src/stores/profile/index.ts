import { defineStore } from 'pinia'
import { computed, ref, type Ref } from 'vue'
import { useLoadModule } from './modules/load'
import type { BackendProfileStore } from '@/types'
import { profileAvatarUrl, profileIconUrl } from '@/utils'
import { profileConfig } from '@/config'

export type ProfileStoreModuleDependencies = {
  postNumber: Ref<number>
  imageNumber: Ref<number>
  profile: Ref<BackendProfileStore | null>
}

// 个人信息模块
export const useProfileStore = defineStore(
  'tweblog-public-profile',
  () => {
    const postNumber = ref(0)
    const imageNumber = ref(0)

    const profile = ref<BackendProfileStore | null>(null)

    const avatar = computed(() => profile.value?.avatar || null)
    const avatarArray = computed(() => profile.value?.avatarArray || [])
    const avatarItem = computed(() => {
      if (avatar.value === null) {
        return null
      }
      const find = avatarArray.value.find((a) => a.uuid === avatar.value)
      if (find === undefined) {
        return null
      }
      return find
    })
    const avatarUrl = computed(() =>
      avatarItem.value
        ? profileAvatarUrl(avatarItem.value)
        : profileConfig.avatarDefault
    )
    const name = computed(() => profile.value?.name || '')
    const bio = computed(() => profile.value?.bio || '')
    const socialMedias = computed(() => profile.value?.socialMedias || [])
    const aboutMarkdown = computed(() => profile.value?.aboutMarkdown || '')
    const externalLinks = computed(() => profile.value?.externalLinks || [])
    const externalIcons = computed(() => profile.value?.externalIcons || [])
    const getExternalIconItemByUuid = (uuid: string) => {
      return externalIcons.value.find((i) => i.uuid === uuid) || null
    }
    const getIconUrlByLinkItem = (
      item: BackendProfileStore['externalLinks'][number]
    ) => {
      const icon = getExternalIconItemByUuid(item.icon)
      if (icon === null) {
        return profileConfig.iconDefault
      }
      return profileIconUrl(icon)
    }

    const dependencies = {
      postNumber,
      imageNumber,
      profile
    }

    const loadModule = useLoadModule(dependencies)

    return {
      ...loadModule,
      profile,
      postNumber,
      imageNumber,
      avatar,
      avatarArray,
      avatarItem,
      avatarUrl,
      name,
      bio,
      socialMedias,
      aboutMarkdown,
      externalLinks,
      externalIcons,
      getExternalIconItemByUuid,
      getIconUrlByLinkItem
    }
  },
  {
    persist: true // 持久化
  }
)
