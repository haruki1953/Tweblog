import { type ForwardSettingItem, type ForwardSettingItemForSet } from '@/types'
import { store, save } from './dependencies'
import { AppError } from '@/classes'
import { cloneDeep } from 'lodash'
import { checkForDuplicateStrings, maskSensitiveToken } from '@/utils'

export const forwardSettingFind = (uuid: string) => {
  return store.forwardSettingList.find(i => i.uuid === uuid)
}

// 要对其进行处理，令牌字符串之类的只保留后6微
export const forwardSettingGet = () => {
  const processedList: ForwardSettingItem[] = []
  const tempList = cloneDeep(store.forwardSettingList)
  for (const item of tempList) {
    for (const key in item.data) {
      ; (item.data as Record<string, string>)[key] =
        maskSensitiveToken((item.data as Record<string, string>)[key])
    }
    processedList.push(item)
  }
  return processedList
}

// 设置转发配置，item.data可为undefined，即不更改
export const forwardSettingSet = (forwardSettingList: ForwardSettingItemForSet[]) => {
  if (checkForDuplicateStrings(forwardSettingList.map(i => i.uuid))) {
    throw new AppError('添加转发配置时uuid不能重复', 400)
  }
  const newForwardSettingList = []
  for (const item of forwardSettingList) {
    let newItem
    const find = forwardSettingFind(item.uuid)
    if (find != null) {
      // 更新
      if (find.platform !== item.platform) {
        throw new AppError('更新转发配置时平台不能变更', 400)
      }
      newItem = cloneDeep(find)
      // 只更新name。uuid 和 platform 都不能更改
      newItem.name = item.name
      // data 有值时才更新
      if (item.data != null) {
        newItem.data = item.data
      }
    } else {
      // 添加
      const isItemDataNotNull = ((item: ForwardSettingItemForSet): item is ForwardSettingItem => {
        return item.data != null
      })(item)
      if (!isItemDataNotNull) {
        throw new AppError('添加转发配置时数据不能为空', 400)
      }
      newItem = item
    }
    newForwardSettingList.push(newItem)
  }
  save({
    ...store,
    forwardSettingList: newForwardSettingList
  })
}
