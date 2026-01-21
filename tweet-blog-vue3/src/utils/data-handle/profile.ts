import { profileConfig } from '@/config'
import type { BackendProfileStore } from '@/types'

export const profileAvatarUrl = (
  avatarItem: BackendProfileStore['avatarArray'][number]
) => {
  return `${profileConfig.avatarUrl}${avatarItem.path}`
}

export const profileIconUrl = (
  iconItem: BackendProfileStore['externalIcons'][number]
) => {
  return `${profileConfig.iconUrl}${iconItem.path}`
}
