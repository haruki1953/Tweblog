import { imageListToMaxNumGroupList } from '@/utils'
import { blueskyConfig } from './dependencies'

// 将图片数组分组，每组中不超过4个，且平均，组中图片较多的在后
export const blueskyImageListToMaxNumGroupList = <T>(imageList: T[]) => {
  return imageListToMaxNumGroupList({
    imageList,
    maxNum: blueskyConfig.maxImageNumberOnSend
  })
}
