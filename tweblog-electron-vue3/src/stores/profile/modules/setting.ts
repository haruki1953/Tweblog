import { profileConfig } from '@/config'
import type { AvatarProcessSetting, IconProcessSetting } from '@/types'
import { ref } from 'vue'

export const useSettingModule = () => {
  /* 头像处理 */
  const avatarProcessSettingDefault = (): AvatarProcessSetting => {
    return { ...profileConfig.avatarProcessSettingDefault }
  }

  const avatarProcessSetting = ref(avatarProcessSettingDefault())

  const avatarProcessSettingSave = (setting: AvatarProcessSetting) => {
    // avatarProcessSetting.value = setting
    avatarProcessSetting.value = { ...setting }
  }

  const avatarProcessSettingReset = () => {
    avatarProcessSetting.value = avatarProcessSettingDefault()
  }

  /* 图标处理 */
  const iconProcessSettingDefault = (): IconProcessSetting => {
    return { ...profileConfig.iconProcessSettingDefault }
  }

  const iconProcessSetting = ref(iconProcessSettingDefault())

  const iconProcessSettingSave = (setting: IconProcessSetting) => {
    // iconProcessSetting.value = setting
    iconProcessSetting.value = { ...setting }
  }

  const iconProcessSettingReset = () => {
    iconProcessSetting.value = iconProcessSettingDefault()
  }

  return {
    avatarProcessSettingDefault,
    avatarProcessSetting,
    avatarProcessSettingSave,
    avatarProcessSettingReset,
    iconProcessSettingDefault,
    iconProcessSetting,
    iconProcessSettingSave,
    iconProcessSettingReset
  }
}
