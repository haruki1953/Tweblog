import { type ProfileStore } from '@/types'
import { save, store } from '../init'
import { useIconSystem } from '@/systems/file'
import { AppError } from '@/classes'

const iconSystem = useIconSystem()

export const addExternalIcon = async (imageFile: File) => {
  const iconInfo = await iconSystem.saveIcon(imageFile)
  const newExternalIcons = [...store.externalIcons]
  newExternalIcons.push(iconInfo)
  save({
    ...store,
    externalIcons: newExternalIcons
  })
  return iconInfo
}

export const delExternalIcon = (imageUuid: string) => {
  // 确认存在
  const nowExternalIcons = [...store.externalIcons]
  const iconInfo = nowExternalIcons.find(i => i.uuid === imageUuid)
  if (iconInfo === undefined) {
    throw new AppError('图标不存在', 400)
  }
  // 删除文件
  iconSystem.deleteIcon(iconInfo.path)
  // 更新json
  const newExternalIcons = nowExternalIcons.filter(i => i.uuid !== imageUuid)
  save({
    ...store,
    externalIcons: newExternalIcons
  })
  return iconInfo
}

export const delNotUsedExternalIcon = () => {
  const nowExternalIcons = [...store.externalIcons]
  const usedIconUuidList = store.externalLinks.map((l) => l.icon)

  const iconList = nowExternalIcons.filter(i => !usedIconUuidList.includes(i.uuid))
  iconList.forEach((i) => {
    iconSystem.deleteIcon(i.path)
  })

  const newExternalIcons = nowExternalIcons.filter(i => usedIconUuidList.includes(i.uuid))
  save({
    ...store,
    externalIcons: newExternalIcons
  })
  return iconList
}

export const setExternalLinks = (
  externalLinks: ProfileStore['externalLinks']
) => {
  save({
    ...store,
    externalLinks
  })
}
